const BASE_URL = 'http://localhost:3000/api'; // Change this to your actual backend URL once developed

/**
 * Helper function for handling API requests
 */
async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
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
