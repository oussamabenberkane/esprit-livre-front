import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n/config'
import App from './App.jsx'

// Note: StrictMode is temporarily disabled due to issues with OAuth callback flow
// StrictMode causes effects to run twice in development, which breaks OAuth code exchange
// (codes can only be used once). Re-enable StrictMode after fixing the OAuth flow to be
// resilient to double-invocation, or only enable it in production builds.
createRoot(document.getElementById('root')).render(
  <App />
)
