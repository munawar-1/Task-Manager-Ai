import { useState } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [inputValue, setInputValue] = useState('')
  const getCurrentTimeframe = (tab) => {
    const now = new Date()
    if (tab === 'daily') {
      // YYYY-MM-DD for date input
      const year = now.getFullYear()
      const month = String(now.getMonth() + 1).padStart(2, '0')
      const day = String(now.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    if (tab === 'monthly') {
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
      return months[now.getMonth()]
    }
    if (tab === 'yearly') {
      return now.getFullYear().toString()
    }
    return ''
  }

  const [activeTab, setActiveTab] = useState('daily') // 'daily', 'monthly', 'yearly'
  const [timeframeValue, setTimeframeValue] = useState(() => getCurrentTimeframe('daily'))

  // Handle changing tabs to set default timeframe value
  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setTimeframeValue(getCurrentTimeframe(tab))
  }

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !timeframeValue) return

    const newTask = {
      id: Date.now(),
      text: inputValue.trim(),
      type: activeTab,
      timeframe: timeframeValue,
      status: 'todo', // 'todo', 'in-process', 'done'
    }

    setTasks([...tasks, newTask])
    setInputValue('')
    setTimeframeValue(getCurrentTimeframe(activeTab))
  }

  const updateTaskStatus = (id, newStatus) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, status: newStatus } : task
      )
    )
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('taskId', id)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e, status) => {
    const id = Number(e.dataTransfer.getData('taskId'))
    updateTaskStatus(id, status)
  }

  const renderTaskCard = (task) => (
    <div 
      key={task.id} 
      className="task-card"
      draggable
      onDragStart={(e) => handleDragStart(e, task.id)}
    >
      <div className="task-header">
        <span className={`type-badge ${task.type}-badge`}>
          {task.type === 'daily' ? new Date(task.timeframe).toLocaleDateString() : task.timeframe}
        </span>
      </div>
      <p className="task-text">{task.text}</p>
      
      <div className="task-actions">
        <div className="move-buttons">
          {/* Arrow buttons removed in favor of drag and drop */}
        </div>
        <button
          className="delete-btn"
          onClick={() => deleteTask(task.id)}
          title="Delete task"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  )

  const activeTasks = tasks.filter(t => t.type === activeTab)
  const todoTasks = activeTasks.filter(t => t.status === 'todo')
  const inProcessTasks = activeTasks.filter(t => t.status === 'in-process')
  const doneTasks = activeTasks.filter(t => t.status === 'done')

  const getPlaceholderText = () => {
    switch (activeTab) {
      case 'daily': return 'What needs to be done today?'
      case 'monthly': return 'What is your target for this month?'
      case 'yearly': return 'What is your goal for this year?'
      default: return 'What needs to be done?'
    }
  }

  return (
    <div className="app-container">
      <header className="header">
        <h1>Workspace</h1>
        <p>Organize your day, beautifully.</p>
      </header>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'daily' ? 'active' : ''}`}
          onClick={() => handleTabChange('daily')}
        >
          Daily Tasks
        </button>
        <button 
          className={`tab-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => handleTabChange('monthly')}
        >
          Monthly Targets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'yearly' ? 'active' : ''}`}
          onClick={() => handleTabChange('yearly')}
        >
          Yearly Goals
        </button>
      </div>

      <form onSubmit={handleAddTask} className="add-task-container">
        <input
          type="text"
          className="task-input"
          placeholder={getPlaceholderText()}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        
        {activeTab === 'daily' && (
          <input 
            type="date" 
            className="timeframe-input" 
            value={timeframeValue} 
            onChange={(e) => setTimeframeValue(e.target.value)}
            required
          />
        )}
        
        {activeTab === 'monthly' && (
          <select 
            className="timeframe-input" 
            value={timeframeValue} 
            onChange={(e) => setTimeframeValue(e.target.value)}
            required
          >
            <option value="" disabled>Select Month</option>
            {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        )}
        
        {activeTab === 'yearly' && (
          <input 
            type="number" 
            className="timeframe-input" 
            placeholder="Year (e.g. 2024)"
            value={timeframeValue} 
            onChange={(e) => setTimeframeValue(e.target.value)}
            required
            min="2024"
            max="2100"
          />
        )}

        <button 
          type="submit" 
          className="add-button"
          disabled={!inputValue.trim() || !timeframeValue}
        >
          Add
        </button>
      </form>

      <div className="board">
        <div 
          className="column todo"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'todo')}
        >
          <div className="column-header">
            To Do
            <span className="task-count">{todoTasks.length}</span>
          </div>
          <div className="task-list">
            {todoTasks.length === 0 ? (
              <div className="empty-column">No tasks here</div>
            ) : (
              todoTasks.map(renderTaskCard)
            )}
          </div>
        </div>

        <div 
          className="column in-process"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'in-process')}
        >
          <div className="column-header">
            In Process
            <span className="task-count">{inProcessTasks.length}</span>
          </div>
          <div className="task-list">
            {inProcessTasks.length === 0 ? (
              <div className="empty-column">Nothing in process</div>
            ) : (
              inProcessTasks.map(renderTaskCard)
            )}
          </div>
        </div>

        <div 
          className="column done"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'done')}
        >
          <div className="column-header">
            Done
            <span className="task-count">{doneTasks.length}</span>
          </div>
          <div className="task-list">
            {doneTasks.length === 0 ? (
              <div className="empty-column">No completed tasks</div>
            ) : (
              doneTasks.map(renderTaskCard)
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
