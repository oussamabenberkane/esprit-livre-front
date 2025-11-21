// Temporary authentication service using OAuth Password Grant
// This will be replaced with Google OAuth later

import { API_BASE_URL, KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET } from './apiConfig';

const TOKEN_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;

// Token storage keys
const ACCESS_TOKEN_KEY = 'el_access_token';
const REFRESH_TOKEN_KEY = 'el_refresh_token';
const REDIRECT_URL_KEY = 'el_redirect_url';

/**
 * Authenticate using OAuth Password Grant (temporary implementation)
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} Token response
 */
export const loginWithPassword = async (username, password) => {
  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: username,
        password: password,
        client_id: KEYCLOAK_CLIENT_ID,
        client_secret: KEYCLOAK_CLIENT_SECRET,
        scope: 'openid profile email',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Authentication failed');
    }

    const data = await response.json();

    // Store tokens
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    if (data.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
    }

    // Dispatch custom event to notify components of auth change
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: true } }));

    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

/**
 * Logout and clear tokens
 */
export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Get stored access token
 * @returns {string|null}
 */
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!getAccessToken();
};

/**
 * Get current user profile from backend
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async () => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/account`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};

/**
 * Save the URL to redirect to after login
 * @param {string} url - The URL to redirect to after successful login
 */
export const saveRedirectUrl = (url) => {
  if (url && url !== '/auth') {
    localStorage.setItem(REDIRECT_URL_KEY, url);
  }
};

/**
 * Get and clear the saved redirect URL
 * @returns {string|null} The saved redirect URL, or null if none exists
 */
export const getAndClearRedirectUrl = () => {
  const url = localStorage.getItem(REDIRECT_URL_KEY);
  localStorage.removeItem(REDIRECT_URL_KEY);
  return url;
};

/**
 * Clear the saved redirect URL without retrieving it
 */
export const clearRedirectUrl = () => {
  localStorage.removeItem(REDIRECT_URL_KEY);
};
