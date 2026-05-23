const SESSION_KEY = 'order_origin';

const ORIGIN_VALUES = {
  FACEBOOK: 'FACEBOOK',
  INSTAGRAM: 'INSTAGRAM',
  OTHER: 'OTHER',
  ORGANIC: 'ORGANIC',
};

/**
 * Detect order origin from URL params and store in sessionStorage.
 * Call this once on app load. Detection logic:
 *   - fbclid param present → FACEBOOK (Meta ads for both FB and IG append this)
 *   - utm_source=instagram → INSTAGRAM
 *   - utm_source=facebook  → FACEBOOK
 *   - utm_source=<anything else> → OTHER
 *   - no tracking params → ORGANIC
 * Once a session-level origin is set it is not overwritten, so the first
 * landing page attribution wins (standard last-non-direct behaviour).
 */
export function captureOrderOrigin() {
  if (sessionStorage.getItem(SESSION_KEY)) return;

  const params = new URLSearchParams(window.location.search);
  let origin = ORIGIN_VALUES.ORGANIC;

  if (params.has('fbclid')) {
    origin = ORIGIN_VALUES.FACEBOOK;
  } else {
    const utmSource = (params.get('utm_source') || '').toLowerCase();
    if (utmSource === 'instagram') {
      origin = ORIGIN_VALUES.INSTAGRAM;
    } else if (utmSource === 'facebook') {
      origin = ORIGIN_VALUES.FACEBOOK;
    } else if (utmSource) {
      origin = ORIGIN_VALUES.OTHER;
    }
  }

  sessionStorage.setItem(SESSION_KEY, origin);
}

/** Returns the detected origin for the current session. */
export function getOrderOrigin() {
  return sessionStorage.getItem(SESSION_KEY) || ORIGIN_VALUES.ORGANIC;
}
