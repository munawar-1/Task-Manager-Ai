import { useState } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [taskType, setTaskType] = useState('regular')

  const handleAddTask = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newTask = {
      id: Date.now(),
      text: inputValue.trim(),
      type: taskType, // 'regular' or 'daily'
      status: 'todo', // 'todo', 'in-process', 'done'
    }

    setTasks([...tasks, newTask])
    setInputValue('')
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

  const renderTaskCard = (task) => (
    <div key={task.id} className="task-card">
      <div className="task-header">
        {task.type === 'daily' && <span className="daily-badge">Daily</span>}
      </div>
      <p className="task-text">{task.text}</p>
      
      <div className="task-actions">
        <div className="move-buttons">
          {task.status !== 'todo' && (
            <button 
              className="action-btn" 
              onClick={() => updateTaskStatus(task.id, task.status === 'done' ? 'in-process' : 'todo')}
            >
              ←
            </button>
          )}
          {task.status !== 'done' && (
            <button 
              className="action-btn" 
              onClick={() => updateTaskStatus(task.id, task.status === 'todo' ? 'in-process' : 'done')}
            >
              →
            </button>
          )}
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

  const todoTasks = tasks.filter(t => t.status === 'todo')
  const inProcessTasks = tasks.filter(t => t.status === 'in-process')
  const doneTasks = tasks.filter(t => t.status === 'done')

  return (
    <div className="app-container">
      <header className="header">
        <h1>Workspace</h1>
        <p>Organize your day, beautifully.</p>
      </header>

      <form onSubmit={handleAddTask} className="add-task-container">
        <input
          type="text"
          className="task-input"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <select 
          className="type-select" 
          value={taskType} 
          onChange={(e) => setTaskType(e.target.value)}
        >
          <option value="regular">Regular Task</option>
          <option value="daily">Daily Task</option>
        </select>
        <button 
          type="submit" 
          className="add-button"
          disabled={!inputValue.trim()}
        >
          Add Task
        </button>
      </form>

      <div className="board">
        <div className="column todo">
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

        <div className="column in-process">
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

        <div className="column done">
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
