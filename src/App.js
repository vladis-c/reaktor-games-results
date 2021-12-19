import "./App.css"
import axios from "axios"
import axiosRetry from "axios-retry"

import React, { useEffect, useState } from "react"
import DataTable from "./datatables/DataTable"
import LiveMatchesTable from "./datatables/LiveMatchesTable"

const ROCK = "ROCK"
const PAPER = "PAPER"
const SCISSORS = "SCISSORS"

export function determineVictory(hand1, hand2) {
  if (hand1 === hand2) {
    return 0
  }
  if (
    (hand1 === ROCK && hand2 === SCISSORS) ||
    (hand1 === PAPER && hand2 === ROCK) ||
    (hand1 === SCISSORS && hand2 === PAPER)
  ) {
    return 1
  }
  return -1
}

let instance = axios.create()

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof error.response === "undefined") {
      alert(
        "Hello World! " +
          "A network error occurred. " +
          "This could be a CORS issue or a dropped internet connection. " +
          "When preparing this task for REACTOR, I used a browser local:host, " +
          "and came up with solution to download an extension for GoogleBrowser, which allows CORS. " +
          "Looking through the internet, I found out that this must be solved on a server-side. " +
          "So, this ALERT MESSAGE will pop up, if the CORS error is occured. "
      )
    }
    return Promise.reject(error)
  }
)
axiosRetry(instance, {
  retryCondition: (e) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(e) ||
      e.response.status === 429
    )
  },
  retryDelay: (retryCount, error) => {
    if (error.response) {
      const retry_after = error.response.headers["Retry-After"]
      if (retry_after) {
        return retry_after
      }
    }
    return retryCount * 60000
  },
})

function App() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState("")
  const [searchData, setSearchData] = useState([])
  const [liveConnect] = useState(
    new WebSocket("wss://bad-api-assignment.reaktor.com/rps/live")
  )
  const [liveData, setLiveData] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showLive, setShowLive] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [liveConnected, setLiveConnected] = useState(false)
  const [err, setErr] = useState(false)

  function handleLive() {
    setShowLive(true)
    setShowHistory(false)
    if (liveConnected) {
      return
    }
    setLiveConnected(true)
    liveConnect.addEventListener("message", ({ data }) => {
      const parsedData = JSON.parse(JSON.parse(data))
      liveConnect.addEventListener("error", (error) => {
        setErr(error)
      })
      if (parsedData.type === "GAME_BEGIN") {
        setLiveData((currentData) => [...currentData, parsedData])
      } else if (parsedData.type === "GAME_RESULT") {
        setLiveData((currentData) => {
          let modifiedData = currentData.filter(
            (data) => data.gameId !== parsedData.gameId
          )
          modifiedData.push(parsedData)
          return modifiedData
        })
        setTimeout(() => {
          setLiveData((currentData) =>
            currentData.filter((data) => data.gameId !== parsedData.gameId)
          )
        }, 10000)
      }
    })
  }

  async function makeRequest(url) {
    let response = await instance.get(url).catch((error) => setErr(error))

    // un// next 8 -- 1 rows to fetch from each page all data.

    if (response.data.cursor) {
      return [
        ...response.data.data,
        ...(await makeRequest(
          `https://bad-api-assignment.reaktor.com${response.data.cursor}`
        )),
      ]
    } else {
    return response.data.data
    }
  }

  async function handleHistory() {
    setShowHistory(true)
    setShowLive(false)
    if (historyLoaded) {
      return
    }
    setHistoryLoaded(true)
    setIsLoadingHistory(true)
    const initialArray = await makeRequest(
      "https://bad-api-assignment.reaktor.com/rps/history/"
    )
    let combinedArray = []
    let allNames = []
    for (let i = 0; i < initialArray.length; i++) {
      allNames.push(initialArray[i].playerA.name)
      allNames.push(initialArray[i].playerB.name)
      combinedArray.push({
        name: initialArray[i].playerA.name,
        win: determineVictory(
          initialArray[i].playerA.played,
          initialArray[i].playerB.played
        ),
        played: initialArray[i].playerA.played,
      })
      combinedArray.push({
        name: initialArray[i].playerB.name,
        win: determineVictory(
          initialArray[i].playerB.played,
          initialArray[i].playerA.played
        ),
        played: initialArray[i].playerB.played,
      })
    }
    allNames = [...new Set(allNames)]
    const result = allNames.map((name) => {
      const gameObjects = combinedArray.filter(
        (gameObject) => gameObject.name === name
      )
      const rocksPlayed = gameObjects.filter(
        (gameObject) => gameObject.played === ROCK
      ).length
      const paperPlayed = gameObjects.filter(
        (gameObject) => gameObject.played === PAPER
      ).length
      const scissorsPlayed = gameObjects.filter(
        (gameObject) => gameObject.played === SCISSORS
      ).length
      let mostPlayedHand
      if (rocksPlayed >= paperPlayed && rocksPlayed >= scissorsPlayed) {
        mostPlayedHand = ROCK
      } else if (paperPlayed >= rocksPlayed && paperPlayed >= scissorsPlayed) {
        mostPlayedHand = PAPER
      } else {
        mostPlayedHand = SCISSORS
      }
      return {
        name,
        winRate:
          gameObjects.filter((gameObject) => gameObject.win === 1).length /
          gameObjects.length,
        totalMatchesPlayed: gameObjects.length,
        mostPlayedHand,
      }
    })
    setData(result)
    setIsLoadingHistory(false)
  }
  function handleSearch(event) {
    setSearch(event.target.value)
  }

  useEffect(() => {
    setSearchData(
      data.filter((value) => {
        return value.name.toLowerCase().includes(search.toLowerCase())
      })
    )
  }, [data, search])

  return (
    <div>
      {err ? (
        alert("ERROR OCCURED")
      ) : (
        <div>
          <div>
            {!showHistory && (
              <button className="button" onClick={() => handleHistory()}>
                {historyLoaded ? "Show history" : "Fetch History!"}
              </button>
            )}
            {!showLive && (
              <button className="button" onClick={() => handleLive()}>
                Live
              </button>
            )}
          </div>

          <div>
            {showLive ? (
              <div>
                {liveData.length !== 0 ? (
                  <div>
                    <h1>LIVE</h1>
                    <LiveMatchesTable data={liveData} />
                  </div>
                ) : (
                  <div className="lds-ellipsis">
                    <div id="1"></div>
                    <div id="2"></div>
                    <div id="3"></div>
                    <div id="4"></div>
                  </div>
                )}
              </div>
            ) : isLoadingHistory ? (
              <div className="lds-ellipsis">
                <div id="5"></div>
                <div id="6"></div>
                <div id="7"></div>
                <div id="8"></div>
              </div>
            ) : (
              <div>
                {showHistory && (
                  <div>
                    <h1>HISTORY</h1>
                    <div className="form-control">
                      <input
                        className="input"
                        placeHolder="Search..."
                        type="text"
                        onChange={handleSearch}
                      />
                    </div>
                    {searchData.length === 0 ? (
                      <label className="error-text">Nothing found!</label>
                    ) : (
                      <DataTable data={searchData} />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
