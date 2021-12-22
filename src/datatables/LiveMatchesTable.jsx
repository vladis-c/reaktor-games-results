import React from "react"
import determineVictory from "../util"

import "./TableStyle.css"

const LiveMatchesTable = function ({ data }) {
  function getResultText(row) {
    if (
      row.playerA?.played &&
      row.playerB?.played &&
      determineVictory(row.playerA?.played, row.playerB?.played) === 0
    ) {
      return "DRAW"
    }
    if (determineVictory(row.playerA?.played, row.playerB?.played) === 1) {
      return `${row.playerA?.name} WON`
    }
    if (determineVictory(row.playerA?.played, row.playerB?.played) === -1) {
      return `${row.playerB?.name} WON`
    }
    return ""
  }
  return (
    <div>
      <table>
        <thead>
          {data[0] && (
            <tr>
              <th>Name</th>
              <th>Hand</th>
              <th>{}</th>
              <th>Name</th>
              <th>Hand</th>
              <th>Result</th>
              <th>Status</th>
            </tr>
          )}
        </thead>
        <tbody>
          {data.map((row, key) => (
            <tr
              key={key}
              className={
                row.playerA?.played && row.playerB?.played ? "highlight" : ""
              }
            >
              <td
                className={
                  determineVictory(row.playerA?.played, row.playerB?.played) ===
                    1 && "highlight-winner"
                }
              >
                {row.playerA?.name}
              </td>
              <td className="hand">{row.playerA?.played}</td>
              <td className="vs">VS</td>
              <td
                className={
                  determineVictory(row.playerA?.played, row.playerB?.played) ===
                    -1 && "highlight-winner"
                }
              >
                {row.playerB?.name}
              </td>
              <td className="hand">{row.playerB?.played}</td>
              <td>{getResultText()}</td>
              <td>
                {row.playerA?.played && row.playerB?.played
                  ? "GAME OVER"
                  : "GAME ONGOING"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default LiveMatchesTable
