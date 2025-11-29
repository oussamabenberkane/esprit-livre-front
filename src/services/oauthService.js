// OAuth2 Authorization Code Flow with PKCE implementation
// Handles Google Sign-In through Keycloak Identity Provider

import { KEYCLOAK_URL, KEYCLOAK_REALM, KEYCLOAK_CLIENT_ID } from './apiConfig';

// OAuth endpoints
const AUTH_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/auth`;
const TOKEN_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
const LOGOUT_URL = `${KEYCLOAK_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout`;

// SessionStorage keys for PKCE
const CODE_VERIFIER_KEY = 'oauth_code_verifier';
const STATE_KEY = 'oauth_state';

// LocalStorage keys for tokens (matching authService.js)
const ACCESS_TOKEN_KEY = 'el_access_token';
const REFRESH_TOKEN_KEY = 'el_refresh_token';
const ID_TOKEN_KEY = 'el_id_token';

/**
 * Generate a random string for PKCE code_verifier and state
 * @param {number} length - Length of the random string
 * @returns {string}
 */
const generateRandomString = (length) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  return Array.from(randomValues)
    .map(value => charset[value % charset.length])
    .join('');
};

/**
 * Generate SHA-256 hash and base64url encode
 * @param {string} plain - Plain text to hash
 * @returns {Promise<string>} Base64url encoded hash
 */
const sha256 = async (plain) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);

  // Convert hash to base64url encoding
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * Generate PKCE code_verifier and code_challenge
 * @returns {Promise<{verifier: string, challenge: string}>}
 */
const generatePKCE = async () => {
  const verifier = generateRandomString(64);
  const challenge = await sha256(verifier);
  return { verifier, challenge };
};

/**
 * Initiate Google login via Keycloak OAuth flow
 * @param {string} redirectUri - Optional custom redirect URI (defaults to current origin + /auth/callback)
 */
export const initiateGoogleLogin = async (redirectUri = null) => {
  try {
    // Generate PKCE parameters
    const { verifier, challenge } = await generatePKCE();
    const state = generateRandomString(32);

    // Store verifier and state in sessionStorage (will be needed for token exchange)
    sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);
    sessionStorage.setItem(STATE_KEY, state);

    // Build redirect URI
    const callback = redirectUri || `${window.location.origin}/auth/callback`;

    // Build authorization URL with PKCE and Google IDP hint
    const params = new URLSearchParams({
      client_id: KEYCLOAK_CLIENT_ID,
      response_type: 'code',
      scope: 'openid profile email',
      redirect_uri: callback,
      state: state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      kc_idp_hint: 'google', // Skip Keycloak login page, go directly to Google
    });

    const authUrl = `${AUTH_URL}?${params.toString()}`;

    // Redirect to Keycloak (which will redirect to Google)
    window.location.href = authUrl;
  } catch (error) {
    console.error('Failed to initiate Google login:', error);
    throw new Error('Failed to start authentication process');
  }
};

/**
 * Validate state parameter (CSRF protection)
 * @param {string} receivedState - State received from OAuth callback
 * @returns {boolean}
 */
export const validateState = (receivedState) => {
  const storedState = sessionStorage.getItem(STATE_KEY);
  return storedState === receivedState;
};

/**
 * Exchange authorization code for tokens
 * @param {string} code - Authorization code from callback
 * @param {string} redirectUri - Same redirect URI used in authorization request
 * @returns {Promise<{access_token: string, refresh_token: string, id_token: string}>}
 */
export const exchangeCodeForTokens = async (code, redirectUri = null) => {
  try {
    const codeVerifier = sessionStorage.getItem(CODE_VERIFIER_KEY);

    if (!codeVerifier) {
      throw new Error('PKCE code verifier not found. Please restart the login process.');
    }

    const callback = redirectUri || `${window.location.origin}/auth/callback`;

    // Exchange code for tokens
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: callback,
        client_id: KEYCLOAK_CLIENT_ID,
        code_verifier: codeVerifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token exchange failed');
    }

    const tokens = await response.json();

    // Clear PKCE parameters from sessionStorage
    sessionStorage.removeItem(CODE_VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);

    // Store tokens in localStorage
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
    if (tokens.id_token) {
      localStorage.setItem(ID_TOKEN_KEY, tokens.id_token);
    }

    // Dispatch custom event to notify components of auth change
    window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: true } }));

    return tokens;
  } catch (error) {
    console.error('Token exchange error:', error);
    // Clear PKCE parameters on error
    sessionStorage.removeItem(CODE_VERIFIER_KEY);
    sessionStorage.removeItem(STATE_KEY);
    throw error;
  }
};

/**
 * Refresh access token using refresh token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<{access_token: string, refresh_token: string, id_token: string}>}
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: KEYCLOAK_CLIENT_ID,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error_description || 'Token refresh failed');
    }

    const tokens = await response.json();

    // Update stored tokens
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    }
    if (tokens.id_token) {
      localStorage.setItem(ID_TOKEN_KEY, tokens.id_token);
    }

    return tokens;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
};

/**
 * Logout from Keycloak (full logout including Google session)
 * Note: For simplified frontend-only logout, use authService.logout() instead
 * @param {string} idToken - ID token for Keycloak logout
 * @param {string} redirectUri - Where to redirect after logout
 */
export const logoutFromKeycloak = (idToken, redirectUri = null) => {
  const postLogoutRedirect = redirectUri || window.location.origin;

  const params = new URLSearchParams({
    id_token_hint: idToken,
    post_logout_redirect_uri: postLogoutRedirect,
  });

  const logoutUrl = `${LOGOUT_URL}?${params.toString()}`;

  // Clear all tokens before redirecting
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ID_TOKEN_KEY);

  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { authenticated: false } }));

  // Redirect to Keycloak logout
  window.location.href = logoutUrl;
};
