import { useState, useEffect } from 'react'
import './App.css'
import Reports from './Reports'
import { api } from './api'
import Auth from './components/Auth';
import Profile from './components/Profile';
import EditTaskModal from './components/EditTaskModal';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const AddSubtaskForm = ({ onAdd }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [text, setText] = useState('');

  if (!isAdding) {
    return (
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsAdding(true); }}
        style={{ marginTop: '8px', background: 'transparent', color: 'var(--primary-color, #4a90e2)', border: '1px dashed #ccc', borderRadius: '4px', padding: '4px 8px', fontSize: '0.75rem', cursor: 'pointer', width: '100%', textAlign: 'center' }}
      >
        + Add Subtask
      </button>
    );
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      if (text.trim()) {
        onAdd(text.trim());
        setText('');
        setIsAdding(false);
      }
    }} style={{ display: 'flex', marginTop: '8px', gap: '4px' }}>
      <input
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Enter subtask..."
        style={{ flex: 1, padding: '4px 6px', fontSize: '0.8rem', border: '1px solid #e2e8f0', borderRadius: '4px', background: 'var(--bg-secondary, #fff)', color: 'var(--text-primary, #333)' }}
        onClick={(e) => e.stopPropagation()}
        onBlur={() => {
          if (!text.trim()) setIsAdding(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            setIsAdding(false);
            setText('');
          }
        }}
      />
      <button type="submit" style={{ padding: '4px 8px', fontSize: '0.8rem', background: 'var(--primary-color, #4a90e2)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={(e) => e.stopPropagation()}>Add</button>
    </form>
  );
};

function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [showSlowWakeupMessage, setShowSlowWakeupMessage] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const loadTasks = async () => {
      setTasksLoading(true);
      setShowSlowWakeupMessage(false);
      
      const timer = setTimeout(() => {
        setShowSlowWakeupMessage(true);
      }, 3000); // 3 seconds threshold

      try {
        const data = await api.getTasks();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        clearTimeout(timer);
        setTasksLoading(false);
        setShowSlowWakeupMessage(false);
      }
    };
    loadTasks();
  }, [user]);

  useEffect(() => {
    const handleAuthError = () => signOut(auth);
    window.addEventListener('auth-error', handleAuthError);
    return () => window.removeEventListener('auth-error', handleAuthError);
  }, []);

  const [inputValue, setInputValue] = useState('')
  const [categoryValue, setCategoryValue] = useState('')
  const [priorityValue, setPriorityValue] = useState('Medium')
  const [viewMode, setViewMode] = useState('board') // 'board', 'reports'

  const getCurrentTimeframe = (tab) => {
    const now = new Date()
    if (tab === 'daily') {
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

  const [activeTab, setActiveTab] = useState('daily')
  const [timeframeValue, setTimeframeValue] = useState(() => getCurrentTimeframe('daily'))
  const [editingTask, setEditingTask] = useState(null)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark')
    } else {
      document.body.removeAttribute('data-theme')
    }
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
  }, [isDarkMode])

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode)

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setTimeframeValue(getCurrentTimeframe(tab))
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || !timeframeValue) return

    const tempId = Date.now();
    const newTask = {
      id: tempId,
      text: inputValue.trim(),
      type: activeTab,
      timeframe: timeframeValue,
      category: categoryValue.trim() || 'General',
      priority: priorityValue,
      status: 'todo',
      createdAt: new Date().toISOString(),
      completedAt: null,
      subtasks: []
    }

    // Optimistic Update
    setTasks(prev => [...prev, newTask]);
    setInputValue('')
    setCategoryValue('')
    setTimeframeValue(getCurrentTimeframe(activeTab))

    try {
      // Background request
      const createdTask = await api.createTask({
        text: newTask.text,
        type: newTask.type,
        timeframe: newTask.timeframe,
        category: newTask.category,
        priority: newTask.priority,
        status: newTask.status,
        createdAt: newTask.createdAt,
        completedAt: newTask.completedAt
      });
      // Replace temp task with real task
      setTasks(prev => prev.map(t => t.id === tempId ? createdTask : t));
    } catch (error) {
      console.error("Failed to create task:", error);
      // Revert if failed
      setTasks(prev => prev.filter(t => t.id !== tempId));
    }
  }

  const updateTaskStatus = async (id, newStatus) => {
    // Prevent moving tasks that are currently being saved to the backend (temp IDs)
    if (id > 1000000000000) {
      console.warn("Cannot move a task that is still being saved to the server.");
      return;
    }

    const completedAt = newStatus === 'done' ? new Date().toISOString() : null;
    
    // Store old tasks in case we need to revert
    const previousTasks = [...tasks];
    
    // Optimistic Update
    setTasks(prevTasks => prevTasks.map((task) => {
      if (task.id === id) {
        return { ...task, status: newStatus, completedAt };
      }
      return task;
    }));

    try {
      await api.updateTask(id, { status: newStatus, completedAt });
    } catch (error) {
      console.error("Failed to update task status:", error);
      // Revert UI on failure
      setTasks(previousTasks);
    }
  }

  const updateTaskDetails = async (id, updatedData) => {
    // Determine inferred status from subtasks
    let processedData = { ...updatedData };
    if (processedData.subtasks) {
      const completedCount = processedData.subtasks.filter(st => st.completed).length;
      const totalCount = processedData.subtasks.length;
      if (totalCount > 0) {
        if (completedCount === totalCount) {
          processedData.status = 'done';
          processedData.completedAt = new Date().toISOString();
        } else if (completedCount > 0) {
          processedData.status = 'in-process';
          processedData.completedAt = null;
        } else {
          processedData.status = 'todo';
          processedData.completedAt = null;
        }
      }
    }

    const previousTasks = [...tasks];
    
    // Optimistic Update
    setTasks(prevTasks => prevTasks.map((task) => {
      if (task.id === id) {
        return { ...task, ...processedData };
      }
      return task;
    }));

    try {
      await api.updateTask(id, processedData);
    } catch (error) {
      console.error("Failed to update task details:", error);
      // Revert UI on failure
      setTasks(previousTasks);
    }
  };

  const deleteTask = async (id) => {
    const previousTasks = [...tasks];
    // Optimistic update
    setTasks(prevTasks => prevTasks.filter((task) => task.id !== id));

    try {
      await api.deleteTask(id);
    } catch (error) {
      console.error("Failed to delete task:", error);
      // Revert UI on failure
      setTasks(previousTasks);
    }
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

  const renderTaskCard = (task) => {
    const todayStr = getCurrentTimeframe('daily');
    const isOverdue = task.type === 'daily' && task.status !== 'done' && task.timeframe < todayStr;
    const formattedDate = task.type === 'daily'
      ? (task.timeframe.includes('T') ? new Date(task.timeframe) : new Date(task.timeframe + 'T00:00:00')).toLocaleDateString()
      : task.timeframe;

    return (
      <div
        key={task.id}
        className={`task-card ${isOverdue ? 'is-overdue' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
      >
        <div className="task-header">
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span className={`type-badge ${task.type}-badge`}>
              {formattedDate}
            </span>
            <span className="category-tag">
              {task.category || 'General'}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {isOverdue && (
              <span className="priority-badge overdue-badge">
                ⚠️ Overdue
              </span>
            )}
            {task.priority && (
              <span className={`priority-badge priority-${task.priority.toLowerCase()}`}>
                {task.priority}
              </span>
            )}
          </div>
        </div>
      <p className="task-text">{task.text}</p>

      <div className="task-subtasks-preview" style={{ marginTop: '8px' }}>
        {task.subtasks && task.subtasks.length > 0 && (
          <>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              {task.subtasks.filter(st => st.completed).length} / {task.subtasks.length} subtasks
            </div>
            <div className="subtasks-list-preview" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {task.subtasks.map((st, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '0.85rem', lineHeight: '1.2' }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', cursor: 'pointer', flex: 1 }} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={st.completed}
                      onChange={(e) => {
                        const updatedSubtasks = [...task.subtasks];
                        updatedSubtasks[index] = { ...st, completed: e.target.checked };
                        updateTaskDetails(task.id, { subtasks: updatedSubtasks });
                      }}
                      style={{ cursor: 'pointer', marginTop: '2px' }}
                    />
                    <span style={{ textDecoration: st.completed ? 'line-through' : 'none', color: st.completed ? 'var(--text-muted)' : 'inherit', wordBreak: 'break-word' }}>
                      {st.text}
                    </span>
                  </label>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      const updatedSubtasks = task.subtasks.filter((_, i) => i !== index);
                      updateTaskDetails(task.id, { subtasks: updatedSubtasks });
                    }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: '1.1rem', lineHeight: '1', padding: '0 4px' }}
                    title="Delete subtask"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
        <AddSubtaskForm onAdd={(text) => {
          const updatedSubtasks = [...(task.subtasks || []), { text, completed: false }];
          updateTaskDetails(task.id, { subtasks: updatedSubtasks });
        }} />
      </div>

      <div className="task-actions">
        {task.status === 'todo' && (
          <button className="mobile-action-btn mobile-action-start" onClick={() => updateTaskStatus(task.id, 'in-process')}>
            Start Task →
          </button>
        )}
        {task.status === 'in-process' && (
          <>
            <button className="mobile-action-btn mobile-action-revert" onClick={() => updateTaskStatus(task.id, 'todo')}>
              ← Revert
            </button>
            <button className="mobile-action-btn mobile-action-complete" onClick={() => updateTaskStatus(task.id, 'done')}>
              Complete ✓
            </button>
          </>
        )}
        {task.status === 'done' && (
          <button className="mobile-action-btn mobile-action-revert" onClick={() => updateTaskStatus(task.id, 'in-process')}>
            ← Revert
          </button>
        )}
        <div style={{ flex: 1 }}></div>
        <button
          className="delete-btn"
          onClick={() => setEditingTask(task)}
          title="Edit task"
          style={{ marginRight: '4px' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
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
  );
};

  const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
  const sortTasks = (tasksArr) => {
    return [...tasksArr].sort((a, b) => {
      const pA = priorityOrder[a.priority] || 0;
      const pB = priorityOrder[b.priority] || 0;
      if (pA !== pB) return pB - pA;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  };

  const todayStr = getCurrentTimeframe('daily');
  const activeTasks = tasks.filter(t => {
    if (t.type !== activeTab) return false;

    // For Daily Tasks tab: hide completed tasks from previous days so today's board remains clean
    if (activeTab === 'daily' && t.status === 'done') {
      const completedDateStr = t.completedAt ? t.completedAt.split('T')[0] : t.timeframe;
      if (t.timeframe < todayStr && completedDateStr < todayStr) {
        return false;
      }
    }

    return true;
  });
  const todoTasks = sortTasks(activeTasks.filter(t => t.status === 'todo'))
  const inProcessTasks = sortTasks(activeTasks.filter(t => t.status === 'in-process'))
  const doneTasks = sortTasks(activeTasks.filter(t => t.status === 'done'))

  const getPlaceholderText = () => {
    switch (activeTab) {
      case 'daily': return 'What needs to be done today?'
      case 'monthly': return 'What is your target for this month?'
      case 'yearly': return 'What is your goal for this year?'
      default: return 'What needs to be done?'
    }
  }

  if (authLoading) {
    return <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="app-container">
        <header className="header" style={{ justifyContent: 'center', borderBottom: 'none' }}>
          <div className="header-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <h1 style={{ textShadow: '0 0 20px rgba(217, 109, 85, 0.4)' }}>Task Manager</h1>
            <button className="theme-toggle" onClick={toggleDarkMode} title="Toggle Dark Mode">
              {isDarkMode ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
              )}
            </button>
          </div>
        </header>
        <Auth onLoginSuccess={() => { }} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <h1>Workspace</h1>
        </div>

        <div className="header-center">
          <div className="view-toggle">
            <button
              className={`toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
              onClick={() => setViewMode('board')}
            >
              Board
            </button>
            <button
              className={`toggle-btn ${viewMode === 'reports' ? 'active' : ''}`}
              onClick={() => setViewMode('reports')}
            >
              Reports
            </button>
          </div>
        </div>

        <div className="header-right">
          <button className="theme-toggle" onClick={toggleDarkMode} title="Toggle Dark Mode">
            {isDarkMode ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            )}
          </button>
          <Profile user={user} onLogout={handleLogout} />
        </div>
      </header>

      <p className="welcome-text">Welcome back, {user.displayName || user.email.split('@')[0] || 'User'}! Organize your day.</p>

      <div className="tabs-container">
        <div className="tabs-segmented-control">
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
      </div>

      {viewMode === 'reports' ? (
        <Reports tasks={tasks} activeTab={activeTab} handleTabChange={handleTabChange} />
      ) : (
        <>
          <form onSubmit={handleAddTask} className="add-task-container">
            <div className="add-task-row-1">
              <input
                type="text"
                className="task-input"
                placeholder={getPlaceholderText()}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div className="add-task-row-2">
              <input
                type="text"
                list="category-options"
                className="timeframe-input flex-grow"
                placeholder="Category (e.g. Work)"
                value={categoryValue}
                onChange={(e) => setCategoryValue(e.target.value)}
              />
              <datalist id="category-options">
                {[...new Set(tasks.map(t => t.category).filter(Boolean))].map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>

              <select
                className="timeframe-input"
                value={priorityValue}
                onChange={(e) => setPriorityValue(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>

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

              <span
                title={(!inputValue.trim() || !timeframeValue) ? "Please fill in the main task name above" : "Add Task"}
                style={{ display: 'inline-block', cursor: (!inputValue.trim() || !timeframeValue) ? 'not-allowed' : 'pointer' }}
              >
                <button
                  type="submit"
                  className="add-button"
                  disabled={!inputValue.trim() || !timeframeValue}
                  style={{ pointerEvents: (!inputValue.trim() || !timeframeValue) ? 'none' : 'auto' }}
                >
                  Add Task
                </button>
              </span>
            </div>
          </form>

          <div className="board">
            <div
              className="column todo"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'todo')}
            >
              <div className="column-header">
                <div className="column-title">
                  <span className="column-dot dot-todo"></span>
                  To Do
                </div>
                <span className="task-count">{todoTasks.length}</span>
              </div>
              <div className="task-list">
                {tasksLoading ? (
                  <div className="empty-column">Loading tasks...</div>
                ) : todoTasks.length === 0 ? (
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
                <div className="column-title">
                  <span className="column-dot dot-in-process"></span>
                  In Process
                </div>
                <span className="task-count">{inProcessTasks.length}</span>
              </div>
              <div className="task-list">
                {tasksLoading ? (
                  <div className="empty-column">Loading tasks...</div>
                ) : inProcessTasks.length === 0 ? (
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
                <div className="column-title">
                  <span className="column-dot dot-done"></span>
                  Done
                </div>
                <span className="task-count">{doneTasks.length}</span>
              </div>
              <div className="task-list">
                {tasksLoading ? (
                  <div className="empty-column">Loading tasks...</div>
                ) : doneTasks.length === 0 ? (
                  <div className="empty-column">No completed tasks</div>
                ) : (
                  doneTasks.map(renderTaskCard)
                )}
              </div>
            </div>
          </div>

          {editingTask && (
            <EditTaskModal
              task={editingTask}
              onClose={() => setEditingTask(null)}
              onSave={updateTaskDetails}
            />
          )}

          {showSlowWakeupMessage && (
            <div style={{
              position: 'fixed', bottom: '24px', right: '24px', 
              background: 'var(--card-bg, #2d3748)', color: 'var(--text-main, #fff)', 
              padding: '16px 20px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 1000, display: 'flex', alignItems: 'center', gap: '16px',
              borderLeft: '4px solid var(--primary-accent, #4a90e2)'
            }}>
              <div className="spinner" style={{ width: '24px', height: '24px', borderWidth: '3px', borderColor: 'var(--primary-accent, #4a90e2) transparent var(--primary-accent, #4a90e2) transparent' }}></div>
              <div>
                <h4 style={{ margin: '0 0 6px', fontSize: '1rem', fontWeight: '600' }}>Waking up server...</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted, #a0aec0)', maxWidth: '280px', lineHeight: '1.4' }}>
                  Since the app hasn't been used recently, the free backend is restarting. This can take about 50 seconds.
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default App
