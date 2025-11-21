// API Client - Axios-like wrapper for fetch API
import { API_BASE_URL, getDefaultHeaders } from './apiConfig';
import { getAccessToken } from './authService';

/**
 * Get authenticated headers with Bearer token
 * @returns {Object} Headers with Authorization
 */
const getAuthHeaders = () => {
  const token = getAccessToken();
  const headers = {
    ...getDefaultHeaders(),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Handle fetch response
 * @param {Response} response - Fetch response object
 * @returns {Promise<Object>} Response data with headers
 */
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const error = new Error(data.message || data.title || 'API request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Return data with headers in axios-like format
  return {
    data,
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers.entries()),
  };
};

/**
 * API Client with Axios-like interface
 */
const apiClient = {
  /**
   * GET request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response object
   */
  get: async (url, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'GET',
      headers: {
        ...getAuthHeaders(),
        ...config.headers,
      },
      ...config,
    });

    return handleResponse(response);
  },

  /**
   * POST request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {*} data - Request body data
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response object
   */
  post: async (url, data = null, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        ...config.headers,
      },
      body: data ? JSON.stringify(data) : null,
      ...config,
    });

    return handleResponse(response);
  },

  /**
   * PUT request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {*} data - Request body data
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response object
   */
  put: async (url, data = null, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PUT',
      headers: {
        ...getAuthHeaders(),
        ...config.headers,
      },
      body: data ? JSON.stringify(data) : null,
      ...config,
    });

    return handleResponse(response);
  },

  /**
   * DELETE request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response object
   */
  delete: async (url, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeaders(),
        ...config.headers,
      },
      ...config,
    });

    return handleResponse(response);
  },

  /**
   * PATCH request
   * @param {string} url - Endpoint URL (relative to base URL)
   * @param {*} data - Request body data
   * @param {Object} config - Request configuration
   * @returns {Promise<Object>} Response object
   */
  patch: async (url, data = null, config = {}) => {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'PATCH',
      headers: {
        ...getAuthHeaders(),
        ...config.headers,
      },
      body: data ? JSON.stringify(data) : null,
      ...config,
    });

    return handleResponse(response);
  },
};

export default apiClient;
