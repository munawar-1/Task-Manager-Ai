
const BASE_URL = 'http://localhost:8080/api'; // Change this to your actual backend URL once developed

/**
 * Helper function for handling API requests
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');
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
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      window.dispatchEvent(new Event('auth-error'));
    }
    
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If not JSON, try text
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }
    return await response.json();
  } catch (error) {
    console.error(`🔴🔴🔴 API ERROR fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * API Callers for Task Manager
 */
export const api = {
  login: async (credentials) => {
    return await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  
  register: async (userData) => {
    return await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

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
