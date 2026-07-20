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

  const calculateStats = () => {
    let currentStreak = 0;
    let maxStreak = 0;
    let activeDays = 0;
    let tempStreak = 0;

    for (let i = 0; i < days.length; i++) {
      if (days[i].count > 0) {
        activeDays++;
        tempStreak++;
        if (tempStreak > maxStreak) {
          maxStreak = tempStreak;
        }
      } else {
        tempStreak = 0;
      }
    }

    let tempCurrent = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        tempCurrent++;
      } else if (i === days.length - 1) {
        continue;
      } else {
        break;
      }
    }
    currentStreak = tempCurrent;

    return { currentStreak, maxStreak, activeDays };
  }

  const { currentStreak, maxStreak, activeDays } = calculateStats();

  const months = []
  let currentMonthStr = null
  let currentMonthDays = []
  
  days.forEach(day => {
    const monthStr = day.dateObj.toLocaleString('default', { month: 'short' })
    if (monthStr !== currentMonthStr) {
      if (currentMonthStr !== null) {
        months.push({ name: currentMonthStr, days: currentMonthDays })
      }
      currentMonthStr = monthStr
      currentMonthDays = []
    }
    currentMonthDays.push(day)
  })
  if (currentMonthDays.length > 0) {
    months.push({ name: currentMonthStr, days: currentMonthDays })
  }

  return (
    <div className="heatmap-container">
      <div className="heatmap-header">
        <h4>Activity Heatmap</h4>
        <div className="heatmap-stats">
          <div className="heatmap-stat">
            <span className="heatmap-stat-value">{activeDays}</span>
            <span className="heatmap-stat-label">Active days</span>
          </div>
          <div className="heatmap-stat">
            <span className="heatmap-stat-value">{maxStreak}</span>
            <span className="heatmap-stat-label">Max streak</span>
          </div>
          <div className="heatmap-stat">
            <span className="heatmap-stat-value">{currentStreak}</span>
            <span className="heatmap-stat-label">Current streak</span>
          </div>
        </div>
      </div>
      <div className="heatmap-wrapper">
        <div className="heatmap-months-container">
          {months.map((month, idx) => (
            <div key={idx} className="heatmap-month-block">
              <span className="heatmap-month-label">{month.name}</span>
              <div className="heatmap-grid">
                {month.days.map((day) => (
                  <div
                    key={day.date}
                    className={`heatmap-cell level-${getLevel(day.count)}`}
                    title={`${day.count} tasks completed on ${day.date}`}
                  />
                ))}
              </div>
            </div>
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
