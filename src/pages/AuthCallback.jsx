import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { validateState, exchangeCodeForTokens } from '../services/oauthService';
import { getAndClearRedirectUrl, getCurrentUser, logout, saveRedirectUrl } from '../services/authService';

/**
 * OAuth Callback Handler Component
 * Handles the redirect from Keycloak after Google authentication
 */
const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(new Error('timeout')), 20000);

    const handleCallback = async () => {
      try {
        console.log('[AuthCallback] Starting OAuth callback handling...');

        // Extract parameters from URL
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const oauthError = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // Check for OAuth errors (e.g., user denied permissions)
        if (oauthError) {
          const errorMsg = errorDescription || 'Authentication was cancelled or failed';
          setError(errorMsg);
          setProcessing(false);

          // Redirect to sign-in page after 3 seconds
          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
          return;
        }

        // Validate required parameters
        if (!code || !state) {
          setError('Invalid callback parameters. Please try signing in again.');
          setProcessing(false);

          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
          return;
        }

        // Validate state (CSRF protection)
        if (!validateState(state)) {
          setError('Invalid state parameter. Possible CSRF attack detected. Please try again.');
          setProcessing(false);

          setTimeout(() => {
            navigate('/auth', { replace: true });
          }, 3000);
          return;
        }

        // Exchange authorization code for tokens
        console.log('[AuthCallback] Exchanging authorization code for tokens...');
        await exchangeCodeForTokens(code, null, controller.signal);
        console.log('[AuthCallback] Tokens successfully obtained');

        // Sync user with backend database by calling /api/account
        // This creates/updates the user record in the database
        console.log('[AuthCallback] Syncing user with backend database...');
        const userData = await getCurrentUser(controller.signal);
        console.log('[AuthCallback] User synced successfully:', userData);

        // CRITICAL: Set a timestamp to prevent AuthPage from interfering
        // This works reliably even with StrictMode double-invocation
        sessionStorage.setItem('oauth_completed_at', Date.now().toString());

        // Get saved redirect URL (or default to home) before checking phone
        const redirectUrl = getAndClearRedirectUrl() || '/';

        // Check if this is a first-time user (no phone number)
        if (!userData.phone) {
          console.log('[AuthCallback] First-time user detected (no phone number), redirecting to profile...');

          // Mark this session as needing the onboarding tour.
          // The home page reads this flag after the user completes their
          // profile and is redirected back to /.
          sessionStorage.setItem('el_onboarding_pending', 'true');

          // Save the redirect URL again so we can use it after phone collection
          if (redirectUrl !== '/profile') {
            saveRedirectUrl(redirectUrl);
          }

          // Redirect to profile page with firstLogin flag
          navigate('/profile?firstLogin=true', { replace: true });
        } else {
          // Existing user - redirect to where they originally wanted to go
          console.log('[AuthCallback] Successfully authenticated, redirecting to:', redirectUrl);
          navigate(redirectUrl, { replace: true });
        }
      } catch (err) {
        if (err.name === 'AbortError' || err.message === 'timeout') {
          console.error('[AuthCallback] Sign-in timed out');
          setError('Sign-in is taking too long. Please check your connection and try again.');
        } else {
          console.error('OAuth callback error:', err);
          setError(err.message || 'Failed to complete sign-in. Please try again.');
        }
        setProcessing(false);

        // Clear any tokens stored by exchangeCodeForTokens so the user isn't
        // left in an "authenticated but not synced to jhi_user" state, which
        // makes every /api/app-users/profile call 400 on subsequent pages.
        logout();

        // Redirect to sign-in page after 3 seconds
        setTimeout(() => {
          navigate('/auth', { replace: true });
        }, 3000);
      } finally {
        clearTimeout(timeoutId);
      }
    };

    handleCallback();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        {processing ? (
          <div>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-brand-blue)] mx-auto mb-4"></div>
            <h2 className="text-fluid-h3 font-semibold text-gray-900 mb-2">
              Completing sign-in...
            </h2>
            <p className="text-fluid-body text-gray-600">
              Please wait while we finish setting up your account.
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <svg
              className="h-12 w-12 text-red-500 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h2 className="text-fluid-h3 font-semibold text-red-900 mb-2">
              Sign-in Failed
            </h2>
            <p className="text-fluid-body text-red-700 mb-4">
              {error}
            </p>
            <p className="text-fluid-small text-red-600">
              Redirecting to sign-in page in 3 seconds...
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AuthCallback;
