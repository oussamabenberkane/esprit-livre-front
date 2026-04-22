// Authentication service for managing tokens and user session
// Uses Google OAuth through Keycloak Identity Provider

import { API_BASE_URL } from './apiConfig';

// Token storage keys
const ACCESS_TOKEN_KEY = 'el_access_token';
const ID_TOKEN_KEY = 'el_id_token';
const REDIRECT_URL_KEY = 'el_redirect_url';

// Cross-tab auth sync via BroadcastChannel (with storage event as fallback)
const authChannel = typeof BroadcastChannel !== 'undefined'
  ? new BroadcastChannel('el_auth_channel')
  : null;

/**
 * Notify current tab and all other tabs of an auth state change.
 * Replaces raw window.dispatchEvent calls — use this everywhere.
 * @param {boolean} authenticated
 */
export const notifyAuthChange = (authenticated) => {
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated } }));
  authChannel?.postMessage({ type: 'AUTH_STATE_CHANGED', authenticated });
};

// Receive auth changes broadcast from other tabs (BroadcastChannel path)
if (authChannel) {
  authChannel.onmessage = ({ data }) => {
    if (data?.type === 'AUTH_STATE_CHANGED') {
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: data.authenticated } }));
    }
  };
}

// Storage event fallback: fires in other tabs when localStorage changes.
// Only used when BroadcastChannel is unavailable to avoid double-firing.
window.addEventListener('storage', ({ key, newValue }) => {
  if (key === ACCESS_TOKEN_KEY && !authChannel) {
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: newValue !== null } }));
  }
});

/**
 * Logout and clear all tokens (frontend-only logout)
 * Note: This does not invalidate the Keycloak/Google session
 * For full logout including Keycloak, use oauthService.logoutFromKeycloak()
 */
export const logout = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);
  notifyAuthChange(false);
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
 * @param {AbortSignal} signal - Optional AbortSignal for timeout/cancellation
 * @returns {Promise<Object>}
 */
export const getCurrentUser = async (signal = null) => {
  const token = getAccessToken();
  if (!token) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/api/account`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    signal,
  });

  if (response.ok) {
    return response.json();
  }

  // 409 = user already exists in the DB — fetch their profile instead
  if (response.status === 409) {
    const profileResponse = await fetch(`${API_BASE_URL}/api/app-users/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
      signal,
    });
    if (profileResponse.ok) {
      return profileResponse.json();
    }
  }

  throw new Error('Failed to fetch user profile');
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
