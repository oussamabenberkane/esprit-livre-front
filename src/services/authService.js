// Authentication service for managing tokens and user session
// Uses Google OAuth through Keycloak Identity Provider

import { API_BASE_URL } from './apiConfig';

// Token storage keys
const ACCESS_TOKEN_KEY = 'el_access_token';
const ID_TOKEN_KEY = 'el_id_token';
const REDIRECT_URL_KEY = 'el_redirect_url';

/**
 * Logout and clear all tokens (frontend-only logout)
 * Note: This does not invalidate the Keycloak/Google session
 * For full logout including Keycloak, use oauthService.logoutFromKeycloak()
 */
export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);

  // Dispatch custom event to notify components of auth change
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: false } }));
};

/**
 * Get stored access token
 * @returns {string|null}
 */
export const getAccessToken = () => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get stored ID token
 * @returns {string|null}
 */
export const getIdToken = () => {
  return localStorage.getItem(ID_TOKEN_KEY);
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
