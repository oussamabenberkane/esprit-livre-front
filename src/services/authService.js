// Temporary authentication service using OAuth Password Grant
// This will be replaced with Google OAuth later

const KEYCLOAK_URL = 'https://honest-coats-enter.loca.lt';
const REALM = 'jhipster';
const TOKEN_URL = `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`;

// Token storage keys
const ACCESS_TOKEN_KEY = 'el_access_token';
const REFRESH_TOKEN_KEY = 'el_refresh_token';

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
        client_id: 'web_app',
        client_secret: 'ASoXbE72eEiIpZmvGBObIpN2dNhiyM26',
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

  const response = await fetch('https://sharp-crabs-allow.loca.lt/api/account', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
};
