import React, { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import Heatmap from './components/Heatmap'
import './Reports.css'

const COLORS = ['#6366f1', '#34d399', '#f87171', '#fbbf24', '#a78bfa', '#60a5fa']

export default function Reports({ tasks, activeTab, handleTabChange }) {
  const [notes, setNotes] = useState(() => {
    const saved = localStorage.getItem('reportsNotes')
    return saved ? JSON.parse(saved) : { daily: '', monthly: '', yearly: '' }
  })

  useEffect(() => {
    localStorage.setItem('reportsNotes', JSON.stringify(notes))
  }, [notes])

  const handleNoteChange = (e) => {
    setNotes({ ...notes, [activeTab]: e.target.value })
  }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const currentMonthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][now.getMonth()]
  const currentYearStr = now.getFullYear().toString()

  // -- Helper functions for dates --
  const getTaskCompletedDate = (task) => task.completedAt ? task.completedAt.split('T')[0] : null
  
  // Calculate streaks
  const calculateStreak = () => {
    let streak = 0
    let dateObj = new Date(now)
    
    // Check if anything was completed today first
    let completedOnDate = tasks.filter(t => getTaskCompletedDate(t) === dateObj.toISOString().split('T')[0]).length > 0
    if (!completedOnDate) {
      // maybe check yesterday
      dateObj.setDate(dateObj.getDate() - 1)
      completedOnDate = tasks.filter(t => getTaskCompletedDate(t) === dateObj.toISOString().split('T')[0]).length > 0
    }

    while (completedOnDate) {
      streak++
      dateObj.setDate(dateObj.getDate() - 1)
      completedOnDate = tasks.filter(t => getTaskCompletedDate(t) === dateObj.toISOString().split('T')[0]).length > 0
    }
    return streak
  }

  const renderDailyReport = () => {
    const dailyTasks = tasks.filter(t => t.type === 'daily' && t.timeframe === todayStr)
    const completed = dailyTasks.filter(t => t.status === 'done').length
    const total = dailyTasks.length
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0

    const statusData = [
      { name: 'To Do', value: dailyTasks.filter(t => t.status === 'todo').length },
      { name: 'In Process', value: dailyTasks.filter(t => t.status === 'in-process').length },
      { name: 'Done', value: completed }
    ].filter(d => d.value > 0)

    const overdue = tasks.filter(t => t.type === 'daily' && t.status !== 'done' && t.timeframe < todayStr)

    // Heatmap data: all completed tasks by date
    const heatmapData = {}
    tasks.forEach(t => {
      if (t.status === 'done' && t.completedAt) {
        const d = t.completedAt.split('T')[0]
        heatmapData[d] = (heatmapData[d] || 0) + 1
      }
    })

    return (
      <div className="reports-container">
        <div className="report-section">
          <div className="report-card">
            <h3>Daily Stats</h3>
            <div className="stat-item">
              <span className="stat-label">Tasks Completed</span>
              <span className="stat-value">{completed} / {total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Completion Rate</span>
              <span className="stat-value">{rate}%</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{calculateStreak()} days</span>
            </div>
          </div>
          
          <div className="report-card">
            <h3>Status Breakdown</h3>
            <div className="chart-container">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" label>
                      {statusData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="stat-label">No tasks today</p>}
            </div>
          </div>

          <div className="report-card">
            <h3>Overdue (Carried Over)</h3>
            {overdue.length > 0 ? (
              <ul className="overdue-list">
                {overdue.map(t => (
                  <li key={t.id} className="overdue-item">
                    {t.text} <span style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>({t.timeframe})</span>
                  </li>
                ))}
              </ul>
            ) : <p className="stat-label">No overdue tasks!</p>}
          </div>
        </div>

        <Heatmap data={heatmapData} />

        <div className="report-card">
          <h3>Daily Reflection</h3>
          <textarea 
            className="reflection-input"
            value={notes.daily}
            onChange={handleNoteChange}
            placeholder="Write 1-2 sentences about how today went..."
          />
        </div>
      </div>
    )
  }

  const renderMonthlyReport = () => {
    const currentMonthTasks = tasks.filter(t => {
      if (t.completedAt) {
        const d = new Date(t.completedAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      return false
    })

    const totalCompleted = currentMonthTasks.length
    
    // Category Breakdown
    const catMap = {}
    currentMonthTasks.forEach(t => {
      catMap[t.category] = (catMap[t.category] || 0) + 1
    })
    const categoryData = Object.keys(catMap).map(k => ({ name: k, value: catMap[k] }))

    // Most productive day
    const dayMap = {}
    currentMonthTasks.forEach(t => {
      const d = t.completedAt.split('T')[0]
      dayMap[d] = (dayMap[d] || 0) + 1
    })
    let maxDay = null
    let maxCount = 0
    Object.entries(dayMap).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count
        maxDay = day
      }
    })

    // Consistency score (days active / total days so far)
    const activeDays = Object.keys(dayMap).length
    const daysSoFar = now.getDate()
    const consistency = Math.round((activeDays / daysSoFar) * 100)

    // Weekly trend (approximate by grouping into 4 weeks)
    const weekTrend = [0, 0, 0, 0, 0]
    currentMonthTasks.forEach(t => {
      const d = new Date(t.completedAt).getDate()
      const weekIdx = Math.floor((d - 1) / 7)
      if (weekIdx < 5) weekTrend[weekIdx]++
    })
    const weeklyData = weekTrend.map((count, i) => ({ name: `W${i+1}`, completed: count })).filter((_, i) => i * 7 < daysSoFar)

    return (
      <div className="reports-container">
        <div className="report-section">
          <div className="report-card">
            <h3>Monthly Stats ({currentMonthName})</h3>
            <div className="stat-item">
              <span className="stat-label">Total Completed</span>
              <span className="stat-value">{totalCompleted}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Consistency</span>
              <span className="stat-value">{consistency}% ({activeDays}/{daysSoFar} days)</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Most Productive Day</span>
              <span className="stat-value">{maxDay ? `${maxDay} (${maxCount} tasks)` : 'None'}</span>
            </div>
          </div>
          
          <div className="report-card">
            <h3>Weekly Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <Tooltip />
                  <Bar dataKey="completed" fill="var(--primary-accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="report-card">
            <h3>Categories</h3>
            <div className="chart-container">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value" label>
                      {categoryData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : <p className="stat-label">No tasks completed</p>}
            </div>
          </div>
        </div>

        <div className="report-card">
          <h3>Monthly Reflection</h3>
          <textarea 
            className="reflection-input"
            value={notes.monthly}
            onChange={handleNoteChange}
            placeholder="Write 1-2 sentences about how this month went..."
          />
        </div>
      </div>
    )
  }

  const renderYearlyReport = () => {
    const currentYearTasks = tasks.filter(t => {
      if (t.completedAt) {
        return new Date(t.completedAt).getFullYear() === now.getFullYear()
      }
      return false
    })

    const totalCompleted = currentYearTasks.length

    // Monthly trend
    const monthCounts = new Array(12).fill(0)
    currentYearTasks.forEach(t => {
      monthCounts[new Date(t.completedAt).getMonth()]++
    })
    
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyData = monthCounts.map((count, i) => ({ name: monthNames[i], completed: count }))

    let maxMonthIdx = 0
    let maxMonthCount = 0
    monthCounts.forEach((count, i) => {
      if (count > maxMonthCount) {
        maxMonthCount = count
        maxMonthIdx = i
      }
    })

    const h1Count = monthCounts.slice(0, 6).reduce((a, b) => a + b, 0)
    const h2Count = monthCounts.slice(6, 12).reduce((a, b) => a + b, 0)
    const h1h2Data = [
      { name: 'First Half', completed: h1Count },
      { name: 'Second Half', completed: h2Count }
    ]

    return (
      <div className="reports-container">
        <div className="report-section">
          <div className="report-card">
            <h3>Yearly Stats ({currentYearStr})</h3>
            <div className="stat-item">
              <span className="stat-label">Total Completed</span>
              <span className="stat-value">{totalCompleted}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Most Productive Month</span>
              <span className="stat-value">{maxMonthCount > 0 ? `${monthNames[maxMonthIdx]} (${maxMonthCount})` : 'None'}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Current Streak</span>
              <span className="stat-value">{calculateStreak()} days</span>
            </div>
          </div>

          <div className="report-card" style={{ gridColumn: 'span 2' }}>
            <h3>Monthly Trend</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" />
                  <Tooltip />
                  <Line type="monotone" dataKey="completed" stroke="var(--primary-accent)" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        <div className="report-section">
          <div className="report-card">
            <h3>H1 vs H2 Growth</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={h1h2Data}>
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <Tooltip />
                  <Bar dataKey="completed" fill="var(--done-border)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="report-card">
            <h3>Yearly Reflection</h3>
            <textarea 
              className="reflection-input"
              value={notes.yearly}
              onChange={handleNoteChange}
              placeholder="Reflect on your growth this year..."
              style={{ height: '220px' }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="reports-wrapper">
      {activeTab === 'daily' && renderDailyReport()}
      {activeTab === 'monthly' && renderMonthlyReport()}
      {activeTab === 'yearly' && renderYearlyReport()}
    </div>
  )
}
