import { auth } from './firebase';

const BASE_URL = 'http://localhost:8080/api'; // Change this to your actual backend URL once developed

/**
 * Helper function for handling API requests
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  let token = null;
  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (e) {
      console.warn('Failed to get Firebase token', e);
    }
  }

  const defaultOptions = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    if (response.status === 401) {
      console.error('Received 401 Unauthorized from backend. Token might be invalid or rejected.');
      // window.dispatchEvent(new Event('auth-error'));
    }
    
    if (!response.ok) {
      let errorMessage = `HTTP Error ${response.status}`;
      try {
        const text = await response.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = text || errorMessage;
        }
      } catch (e) {
        console.error("Failed to read error response", e);
      }
      throw new Error(errorMessage);
    }
    // Check for empty body before parsing JSON
    const text = await response.text();
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error(`🔴🔴🔴 API ERROR fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * API Callers for Task Manager
 */
export const api = {
  // Get all tasks
  getTasks: async () => {
    return await fetchAPI('/tasks');
  },

  // Get a specific task by ID
  getTaskById: async (id) => {
    return await fetchAPI(`/tasks/${id}`);
  },

  // Create a new task
  createTask: async (taskData) => {
    return await fetchAPI('/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update an existing task (e.g., status, text, etc.)
  updateTask: async (id, updates) => {
    return await fetchAPI(`/tasks/${id}`, {
      method: 'PUT', // or 'PATCH' depending on your backend implementation
      body: JSON.stringify(updates),
    });
  },

  // Delete a task
  deleteTask: async (id) => {
    return await fetchAPI(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
