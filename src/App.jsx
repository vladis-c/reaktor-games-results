import "./App.css"
import axios from "axios"
import axiosRetry from "axios-retry"

import React, { useEffect, useState } from "react"
import DataTable from "./datatables/DataTable"
import LiveMatchesTable from "./datatables/LiveMatchesTable"
import { ROCK, PAPER, SCISSORS, determineVictory } from "./util/util"

const HOST = process.env.REACT_APP_URL

const instance = axios.create()
axiosRetry(instance, {
  retryCondition: (e) =>
    axiosRetry.isNetworkOrIdempotentRequestError(e) ||
    e.response.status === 429,
  retryDelay: (retryCount, error) => {
    if (error.response) {
      const retryAfter = error.response.headers["Retry-After"]
      if (retryAfter) {
        return retryAfter
      }
    }
    return retryCount * 60000
  },
})

// main functional component
const App = function () {
  const [data, setData] = useState([])
  const [search, setSearch] = useState("")
  const [searchData, setSearchData] = useState([])
  const [, setLiveConnect] = useState(null)
  const [liveData, setLiveData] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [liveConnected, setLiveConnected] = useState(false)
  const [err, setErr] = useState(false)

  // fetching LIVE and getting data

  function handleLive() {
    if (liveConnected) {
      return
    }
    const socket = new WebSocket(
      "wss://bad-api-assignment.reaktor.com/rps/live"
    )
    setLiveConnected(true)
    socket.addEventListener("message", ({ data: messageData }) => {
      const parsedData = JSON.parse(JSON.parse(messageData))
      if (parsedData.type === "GAME_BEGIN") {
        setLiveData((currentData) => [...currentData, parsedData])
      } else if (parsedData.type === "GAME_RESULT") {
        setLiveData((currentData) => {
          const modifiedData = currentData.filter(
            (d) => d.gameId !== parsedData.gameId
          )
          modifiedData.push(parsedData)
          return modifiedData
        })
        setTimeout(() => {
          setLiveData((currentData) =>
            currentData.filter((d) => d.gameId !== parsedData.gameId)
          )
        }, 10000)
      }
    })
    socket.addEventListener("error", (error) => {
      setErr(error)
    })
    setLiveConnect(socket)
  }

  useEffect(() => handleLive())

  // fetching history and recording the data (2 functions)
  async function makeRequest(url) {
    const response = await instance.get(url).catch((error) => setErr(error))
    if (response.data.cursor) {
      return [
        ...response.data.data,
        ...(await makeRequest(`${HOST}${response.data.cursor}`)),
      ]
    }
    return response.data.data
  }

  async function handleHistory() {
    setShowHistory(true)
    if (historyLoaded) {
      return
    }
    setHistoryLoaded(true)
    setIsLoadingHistory(true)
    const initialArray = await makeRequest(`${HOST}/rps/history/`)
    const combinedArray = []
    let allNames = []
    for (let i = 0; i < initialArray.length; i += 1) {
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

  // handling search by names in historical data
  function handleSearch(event) {
    setSearch(event.target.value)
  }
  useEffect(() => {
    setSearchData(
      data.filter((value) =>
        value.name.toLowerCase().includes(search.toLowerCase())
      )
    )
  }, [data, search])

  // main component return
  return (
    <div>
      {err ? (
        // eslint-disable-next-line no-alert
        alert("ERROR OCCURED")
      ) : (
        <div>
          <div style={{ minHeight: "500px" }}>
            {liveData.length === 0 ? (
              <div>
                <h1>LIVE IS LOADING</h1>
                <div className="lds-ellipsis">
                  <div id="1" />
                  <div id="2" />
                  <div id="3" />
                  <div id="4" />
                </div>
              </div>
            ) : (
              <div>
                <h1>LIVE</h1>
                <LiveMatchesTable data={liveData} />
              </div>
            )}
          </div>
          <div>
            <div>
              {!historyLoaded && (
                <button
                  type="button"
                  className="button"
                  onClick={() => handleHistory()}
                >
                  History
                </button>
              )}
            </div>

            {showHistory &&
              (isLoadingHistory ? (
                <div>
                  <h1>HISTORICAL DATA IS LOADING</h1>
                  <div className="lds-ellipsis">
                    <div id="5" />
                    <div id="6" />
                    <div id="7" />
                    <div id="8" />
                  </div>
                </div>
              ) : (
                <div>
                  <h1>HISTORY</h1>
                  <div className="form-control">
                    <input
                      className="input"
                      placeholder="Search..."
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
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
