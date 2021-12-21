import React from "react"

import "./TableStyle.css"

function DataTable({ data }) {
  const columns = data[0] && Object.keys(data[0])

  return (
    <div>
      <table>
        <thead>
          {data[0] && (
            <tr>
              <th>Name</th>
              <th>Win Rate</th>
              <th>Amount of Games</th>
              <th>Most Hands Played</th>
            </tr>
          )}
        </thead>
        <tbody>
          {data.map((row, key) => (
            <tr key={key}>
              {columns.map((column, key) => (
                <td key={key}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default DataTable
