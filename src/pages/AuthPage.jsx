import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Auth from './Auth';
import { isAuthenticated, saveRedirectUrl } from '../services/authService';

export default function AuthPage() {
  console.log('[AuthPage] Component mounting/rendering, location:', window.location.pathname);

  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on mount - ONLY ONCE
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[AuthPage] checkAuth running...');
      console.log('[AuthPage] Current pathname:', location.pathname);

      // Small delay to prevent flash
      await new Promise(resolve => setTimeout(resolve, 50));

      // CRITICAL: Check if OAuth just completed (within last 5 seconds)
      // This prevents interference with the OAuth callback flow
      const oauthCompletedAt = sessionStorage.getItem('oauth_completed_at');
      if (oauthCompletedAt) {
        const timeSinceOAuth = Date.now() - parseInt(oauthCompletedAt);
        if (timeSinceOAuth < 5000) { // Within 5 seconds
          console.log('[AuthPage] OAuth just completed, not interfering');
          setIsAuthChecked(true);
          return;
        } else {
          // Clean up old timestamp
          sessionStorage.removeItem('oauth_completed_at');
        }
      }

      // Check if we're on the callback route - if so, don't interfere
      if (location.pathname === '/auth/callback') {
        console.log('[AuthPage] On callback route, not interfering');
        return;
      }

      console.log('[AuthPage] isAuthenticated:', isAuthenticated());

      if (isAuthenticated()) {
        // User is already authenticated, redirect them away from auth page
        // Check if they came from a specific page (like /profile or /orders)
        const from = location.state?.from;
        console.log('[AuthPage] User authenticated, from:', from);

        if (from) {
          // They were redirected here from a protected page, send them back
          console.log('[AuthPage] Redirecting to from:', from);
          navigate(from, { replace: true });
        } else {
          // They navigated here directly while authenticated, send to home
          console.log('[AuthPage] Redirecting to home (/)');
          navigate('/', { replace: true });
        }
      } else {
        console.log('[AuthPage] Not redirecting, showing auth page');

        // User not authenticated, save the redirect URL if provided
        const from = location.state?.from;
        if (from) {
          saveRedirectUrl(from);
        }
        setIsAuthChecked(true);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount, ignore location/navigate changes

  // Don't render until auth check is complete
  if (!isAuthChecked) {
    return null;
  }

  return <Auth />;
}
