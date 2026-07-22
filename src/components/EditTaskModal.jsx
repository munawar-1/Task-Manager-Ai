import React, { useState } from 'react';
import './EditTaskModal.css';

export default function EditTaskModal({ task, onClose, onSave }) {
  const [text, setText] = useState(task.text);
  const [priority, setPriority] = useState(task.priority || 'Medium');
  const [category, setCategory] = useState(task.category || 'General');
  const [subtasks, setSubtasks] = useState(task.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = (e) => {
    e.preventDefault();
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, { text: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const handleToggleSubtask = (index) => {
    const updated = [...subtasks];
    updated[index].completed = !updated[index].completed;
    setSubtasks(updated);
  };

  const handleRemoveSubtask = (index) => {
    const updated = subtasks.filter((_, i) => i !== index);
    setSubtasks(updated);
  };

  const handleSave = () => {
    onSave(task.id, {
      text,
      priority,
      category: category.trim() || 'General',
      subtasks
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Task</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="form-group">
          <label>Task Name</label>
          <input 
            type="text" 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Priority</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="form-group" style={{ flex: 1 }}>
            <label>Category</label>
            <input 
              type="text" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
            />
          </div>
        </div>

        <div className="subtasks-section">
          <h3 className="subtasks-header">Subtasks / Checklist</h3>
          
          <div className="subtasks-list">
            {subtasks.map((st, index) => (
              <div key={index} className="subtask-item">
                <input 
                  type="checkbox" 
                  className="subtask-checkbox"
                  checked={st.completed}
                  onChange={() => handleToggleSubtask(index)}
                />
                <span className={`subtask-text ${st.completed ? 'completed' : ''}`}>
                  {st.text}
                </span>
                <button 
                  className="remove-subtask-btn"
                  onClick={() => handleRemoveSubtask(index)}
                  title="Remove Subtask"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddSubtask} className="add-subtask-form">
            <input 
              type="text" 
              placeholder="Add a subtask..." 
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
            />
            <button type="submit">Add</button>
          </form>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={!text.trim()}>Save Changes</button>
        </div>
      </div>
    </div>
  );
}
