const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Read cookie value WITHOUT decodeURIComponent: Meta's fbevents.js stores _fbc/_fbp
// in canonical form (fb.1.<ts>.<fbclid>) and any decoding here can mutate the fbclid
// (e.g. '+' → ' '), triggering Meta's "modified fbclid in fbc" diagnostic.
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? match[1] : null;
}

function metaCookies() {
  return { fbc: getCookie('_fbc'), fbp: getCookie('_fbp') };
}

// Exposed so non-pixel flows (e.g. order creation) can forward the cookies to CAPI.
export const getMetaCookies = () => metaCookies();

// Meta requires phone as digits only, with country code, no "+"/symbols/leading zero.
// Local Algerian numbers (0XXXXXXXXX) become 213XXXXXXXXX.
function normalizePhone(phone) {
  let digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) digits = '213' + digits.slice(1);
  return digits;
}

async function sha256(str) {
  const encoded = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export const initPixel = () => {
  if (!PIXEL_ID || typeof window === 'undefined' || window.fbq) return;

  // eslint-disable-next-line
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
  (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');

  window.fbq('init', PIXEL_ID);
};

const track = (event, params = {}, options = {}) => {
  if (!window.fbq) return;
  window.fbq('track', event, params, options);
};

export const trackPageView = () => {
  if (!window.fbq) return;
  const eventId = crypto.randomUUID();
  track('PageView', {}, { eventID: eventId });
  fetch(`${API_BASE_URL}/api/pixel/page-view`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, eventSourceUrl: window.location.href, ...metaCookies() }),
  }).catch(() => {});
};

export const trackViewContent = ({ id, name, category, value, contentType = 'product' }) => {
  const eventId = crypto.randomUUID();
  track(
    'ViewContent',
    {
      content_ids: [String(id)],
      content_type: contentType,
      content_name: name,
      ...(category && { content_category: category }),
      value: parseFloat(value) || 0,
      currency: 'DZD',
    },
    { eventID: eventId },
  );
  fetch(`${API_BASE_URL}/api/pixel/view-content`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId,
      contentId: String(id),
      contentType,
      value: parseFloat(value) || 0,
      eventSourceUrl: window.location.href,
      ...metaCookies(),
    }),
  }).catch(() => {});
};

export const trackSearch = (searchString) => {
  if (!searchString?.trim()) return;
  const eventId = crypto.randomUUID();
  track('Search', { search_string: searchString.trim() }, { eventID: eventId });
  fetch(`${API_BASE_URL}/api/pixel/search`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, searchString: searchString.trim(), eventSourceUrl: window.location.href, ...metaCookies() }),
  }).catch(() => {});
};

export const trackAddToCart = ({ id, name, value, quantity = 1 }) => {
  const eventId = crypto.randomUUID();
  track(
    'AddToCart',
    {
      content_ids: [String(id)],
      content_type: 'product',
      content_name: name,
      value: parseFloat(value) || 0,
      currency: 'DZD',
      num_items: quantity,
    },
    { eventID: eventId },
  );
  fetch(`${API_BASE_URL}/api/pixel/add-to-cart`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId,
      contentId: String(id),
      contentType: 'product',
      value: parseFloat(value) || 0,
      numItems: quantity,
      eventSourceUrl: window.location.href,
      ...metaCookies(),
    }),
  }).catch(() => {});
};

export const trackInitiateCheckout = ({ value, numItems, contentIds }) => {
  const eventId = crypto.randomUUID();
  track(
    'InitiateCheckout',
    {
      value: parseFloat(value) || 0,
      currency: 'DZD',
      num_items: numItems,
      content_ids: contentIds.map(String),
      content_type: 'product',
    },
    { eventID: eventId },
  );
  fetch(`${API_BASE_URL}/api/pixel/initiate-checkout`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      eventId,
      value: parseFloat(value) || 0,
      numItems,
      contentIds: contentIds.map(String),
      eventSourceUrl: window.location.href,
      ...metaCookies(),
    }),
  }).catch(() => {});
};

// orderId is used as eventID to deduplicate against the CAPI Purchase event
export const trackPurchase = ({ orderId, value, numItems, contentIds }) => {
  track(
    'Purchase',
    {
      value: parseFloat(value) || 0,
      currency: 'DZD',
      num_items: numItems,
      content_ids: contentIds.map(String),
      content_type: 'product',
    },
    { eventID: orderId },
  );
};

export const trackCompleteRegistration = () => {
  const eventId = crypto.randomUUID();
  track('CompleteRegistration', { status: true }, { eventID: eventId });
  fetch(`${API_BASE_URL}/api/pixel/complete-registration`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, eventSourceUrl: window.location.href, ...metaCookies() }),
  }).catch(() => {});
};

export const trackContact = () => {
  const eventId = crypto.randomUUID();
  track('Contact', {}, { eventID: eventId });
  fetch(`${API_BASE_URL}/api/pixel/contact`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventId, eventSourceUrl: window.location.href, ...metaCookies() }),
  }).catch(() => {});
};

// Re-calls fbq('init') with hashed PII for advanced matching.
// Safe to call multiple times; Meta Pixel merges the user data.
export const setPixelUserData = async ({ email, phone, firstName, lastName } = {}) => {
  if (!window.fbq || !PIXEL_ID) return;
  const ud = {};
  if (email?.trim()) ud.em = await sha256(email.trim().toLowerCase());
  if (phone?.trim()) ud.ph = await sha256(normalizePhone(phone));
  if (firstName?.trim()) ud.fn = await sha256(firstName.trim().toLowerCase());
  if (lastName?.trim()) ud.ln = await sha256(lastName.trim().toLowerCase());
  if (Object.keys(ud).length > 0) window.fbq('init', PIXEL_ID, ud);
};
