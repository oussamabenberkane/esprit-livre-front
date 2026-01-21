// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// Keycloak/OAuth Configuration
export const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:9080';
export const KEYCLOAK_REALM = import.meta.env.VITE_KEYCLOAK_REALM || 'jhipster';
export const KEYCLOAK_CLIENT_ID = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'web_app';
export const KEYCLOAK_CLIENT_SECRET = import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET || 'ASoXbE72eEiIpZmvGBObIpN2dNhiyM26';

/**
 * Common headers for API requests
 */
export const getDefaultHeaders = () => ({
  'Content-Type': 'application/json',
});
