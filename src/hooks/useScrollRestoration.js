import { useEffect, useRef } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

// Take scroll restoration away from the browser. Default 'auto' snaps to the
// previous scrollY before our async-loaded page has reached its final height,
// which on iOS Safari and Android Chrome clamps the restored position to 0.
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

const STORAGE_PREFIX = 'scroll:';

function readPosition(key) {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key);
    return raw == null ? null : parseInt(raw, 10);
  } catch {
    return null;
  }
}

function writePosition(key, y) {
  try {
    sessionStorage.setItem(STORAGE_PREFIX + key, String(y));
  } catch {
    // sessionStorage may be unavailable (private mode, quota, etc.)
  }
}

/**
 * Save & restore window scroll across SPA back/forward navigation.
 *
 * @param {boolean} ready Becomes true when async content has reached its final
 *   layout height. Restoration waits for this before scrolling, so we don't
 *   snap to a position the document hasn't grown into yet.
 */
export default function useScrollRestoration(ready = true) {
  const { pathname, search } = useLocation();
  const navigationType = useNavigationType();
  const key = pathname + search;
  // Capture the target at first render so a later scrollTo from elsewhere
  // doesn't poison what we think the saved position was.
  const targetRef = useRef(navigationType === 'POP' ? readPosition(key) : null);
  const restoredRef = useRef(false);

  // Persist scrollY on navigation away and on pagehide (iOS-safe).
  useEffect(() => {
    const save = () => writePosition(key, window.scrollY);
    window.addEventListener('pagehide', save);
    return () => {
      save();
      window.removeEventListener('pagehide', save);
    };
  }, [key]);

  useEffect(() => {
    if (restoredRef.current) return;

    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
      restoredRef.current = true;
      return;
    }

    const target = targetRef.current;
    if (target == null || target <= 0) {
      window.scrollTo(0, 0);
      restoredRef.current = true;
      return;
    }

    if (!ready) return;

    let cancelled = false;
    let userInterrupted = false;
    const onUserScroll = () => { userInterrupted = true; };
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchstart', onUserScroll, { passive: true });
    window.addEventListener('keydown', onUserScroll);

    let attempts = 0;
    const maxAttempts = 120; // ~2s at 60fps

    const tryRestore = () => {
      if (cancelled || userInterrupted) {
        restoredRef.current = true;
        return;
      }
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      if (maxY >= target || attempts >= maxAttempts) {
        window.scrollTo(0, Math.max(0, Math.min(target, maxY)));
        restoredRef.current = true;
        return;
      }
      attempts++;
      requestAnimationFrame(tryRestore);
    };

    const raf = requestAnimationFrame(tryRestore);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.removeEventListener('wheel', onUserScroll);
      window.removeEventListener('touchstart', onUserScroll);
      window.removeEventListener('keydown', onUserScroll);
    };
  }, [ready, navigationType]);
}
