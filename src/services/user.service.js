// User Profile API Service
import { API_BASE_URL, getDefaultHeaders } from './apiConfig';
import { getAccessToken } from './authService';

/**
 * Get authenticated headers with Bearer token
 * @returns {Object} Headers with Authorization
 */
const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    ...getDefaultHeaders(),
    'Authorization': `Bearer ${token}`,
  };
};

/**
 * Get current user's profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/app-users/profile`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      throw new Error(`Failed to fetch profile: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

/**
 * Update current user's profile
 * @param {Object} profileData - Updated profile data
 * @returns {Promise<Object>} Updated profile
 */
export const updateUserProfile = async (profileData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/app-users/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      throw new Error(`Failed to update profile: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Request email change
 * @param {string} newEmail - New email address
 * @returns {Promise<Object>} Response message
 */
export const requestEmailChange = async (newEmail) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/app-users/change-email`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newEmail }),
    });

    if (!response.ok) {
      throw new Error(`Failed to request email change: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error requesting email change:', error);
    throw error;
  }
};

/**
 * Delete user account
 * @returns {Promise<void>}
 */
export const deleteUserAccount = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/app-users/account`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete account: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
};
