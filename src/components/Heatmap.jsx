import React from 'react'
import './Heatmap.css'

export default function Heatmap({ data }) {
  // data is an object: { 'YYYY-MM-DD': count }
  
  const today = new Date()
  const days = []
  
  for (let i = 364; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    const count = data[dateStr] || 0
    days.push({ date: dateStr, count, dateObj: d })
  }

  const getLevel = (count) => {
    if (count === 0) return 0
    if (count === 1) return 1
    if (count === 2) return 2
    if (count === 3) return 3
    return 4
  }

  return (
    <div className="heatmap-container">
      <h4>Activity Heatmap</h4>
      <div className="heatmap-wrapper">
        <div className="heatmap-grid">
          {days.map((day, i) => (
            <div
              key={day.date}
              className={`heatmap-cell level-${getLevel(day.count)}`}
              title={`${day.count} tasks completed on ${day.date}`}
            />
          ))}
        </div>
      </div>
      <div className="heatmap-legend">
        <span>Less</span>
        <div className="heatmap-cell level-0"></div>
        <div className="heatmap-cell level-1"></div>
        <div className="heatmap-cell level-2"></div>
        <div className="heatmap-cell level-3"></div>
        <div className="heatmap-cell level-4"></div>
        <span>More</span>
      </div>
    </div>
  )
}
