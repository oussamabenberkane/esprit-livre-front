const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
const EXTERNAL_ID_KEY = 'el_external_id';

// Read cookie value WITHOUT decodeURIComponent: Meta's fbevents.js stores _fbc/_fbp
// in canonical form (fb.1.<ts>.<fbclid>) and any decoding here can mutate the fbclid
// (e.g. '+' → ' '), triggering Meta's "modified fbclid in fbc" diagnostic.
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
  return match ? match[1] : null;
}

// Set on the registrable domain (espritlivre.com) like fbevents.js does, so the
// cookie is shared across subdomains; skip the domain attribute on single-label
// hosts (localhost).
function setCookie(name, value, maxAgeSeconds) {
  const parts = window.location.hostname.split('.');
  const domain = parts.length >= 2 ? '; domain=.' + parts.slice(-2).join('.') : '';
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${domain}`;
}

// fbevents.js only writes _fbc once it has loaded while fbclid is still in the
// URL. On the landing render (exactly the ad-click traffic that carries fbclid)
// events fire before that, so build the cookie ourselves in Meta's documented
// format: fb.1.<creation time ms>.<fbclid>.
function ensureFbcCookie() {
  try {
    const fbclid = new URLSearchParams(window.location.search).get('fbclid');
    if (!fbclid) return;
    const existing = getCookie('_fbc');
    if (existing && existing.endsWith('.' + fbclid)) return;
    setCookie('_fbc', `fb.1.${Date.now()}.${fbclid}`, 90 * 24 * 60 * 60);
  } catch { /* never block tracking on cookie errors */ }
}

function metaCookies() {
  ensureFbcCookie();
  return { fbc: getCookie('_fbc'), fbp: getCookie('_fbp') };
}

// _fbp is created by fbevents.js asynchronously after the script loads; events
// relayed on the landing render would otherwise reach CAPI with fbc/fbp = null
// (Meta's "server sends an empty fbc" warning). Wait briefly for the cookie.
async function metaCookiesAsync(maxWaitMs = 2000) {
  const deadline = Date.now() + maxWaitMs;
  while (!getCookie('_fbp') && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return metaCookies();
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

// Stable pseudonymous visitor id (Meta external_id), persisted in localStorage
// with a cookie fallback so it survives either store being cleared.
function getOrCreateExternalId() {
  let id = null;
  try { id = localStorage.getItem(EXTERNAL_ID_KEY); } catch { /* storage blocked */ }
  if (!id) id = getCookie(EXTERNAL_ID_KEY);
  if (!id) id = crypto.randomUUID();
  try { localStorage.setItem(EXTERNAL_ID_KEY, id); } catch { /* storage blocked */ }
  setCookie(EXTERNAL_ID_KEY, id, 390 * 24 * 60 * 60);
  return id;
}

// Hashed identity included in every CAPI relay. external_id is SHA-256 hashed so
// the browser pixel (which receives the same hash) and CAPI report one value;
// em/ph/fn/ln are filled by setPixelUserData once the user is known.
const identity = { externalId: null, em: null, ph: null, fn: null, ln: null };
let externalIdPromise = null;

function ensureExternalId() {
  if (!externalIdPromise) {
    externalIdPromise = sha256(getOrCreateExternalId())
      .then((hash) => {
        identity.externalId = hash;
        if (window.fbq && PIXEL_ID) window.fbq('init', PIXEL_ID, { external_id: hash });
        return hash;
      })
      .catch(() => null);
  }
  return externalIdPromise;
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
  ensureFbcCookie();
  ensureExternalId();
};

const track = (event, params = {}, options = {}) => {
  if (!window.fbq) return;
  window.fbq('track', event, params, options);
};

// Shared CAPI relay: waits for the Meta cookies + external_id, then forwards the
// event with the full identity payload. keepalive lets it survive navigation.
async function relay(path, body) {
  const cookies = await metaCookiesAsync();
  await ensureExternalId();
  fetch(`${API_BASE_URL}/api/pixel/${path}`, {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, ...cookies, ...identity }),
  }).catch(() => {});
}

export const trackPageView = () => {
  if (!window.fbq) return;
  const eventId = crypto.randomUUID();
  track('PageView', {}, { eventID: eventId });
  relay('page-view', { eventId, eventSourceUrl: window.location.href });
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
  relay('view-content', {
    eventId,
    contentId: String(id),
    contentType,
    value: parseFloat(value) || 0,
    eventSourceUrl: window.location.href,
  });
};

export const trackSearch = (searchString) => {
  if (!searchString?.trim()) return;
  const eventId = crypto.randomUUID();
  track('Search', { search_string: searchString.trim() }, { eventID: eventId });
  relay('search', { eventId, searchString: searchString.trim(), eventSourceUrl: window.location.href });
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
  relay('add-to-cart', {
    eventId,
    contentId: String(id),
    contentType: 'product',
    value: parseFloat(value) || 0,
    numItems: quantity,
    eventSourceUrl: window.location.href,
  });
};

// Listing cards: most buyers add to cart without ever opening the book page, so
// the card interaction is their product view — fire ViewContent alongside
// AddToCart. Book pages fire ViewContent on load and must NOT use this wrapper.
export const trackCardAddToCart = (item) => {
  trackViewContent(item);
  trackAddToCart(item);
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
  relay('initiate-checkout', {
    eventId,
    value: parseFloat(value) || 0,
    numItems,
    contentIds: contentIds.map(String),
    eventSourceUrl: window.location.href,
  });
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

// Tracking fields forwarded with order creation so the server-side CAPI Purchase
// event carries fbc/fbp/external_id (its PII comes from the order itself).
export const getOrderTrackingFields = async () => {
  const cookies = await metaCookiesAsync();
  const externalId = await ensureExternalId();
  return { ...cookies, externalId };
};

export const trackCompleteRegistration = () => {
  const eventId = crypto.randomUUID();
  track('CompleteRegistration', { status: true }, { eventID: eventId });
  relay('complete-registration', { eventId, eventSourceUrl: window.location.href });
};

export const trackContact = () => {
  const eventId = crypto.randomUUID();
  track('Contact', {}, { eventID: eventId });
  relay('contact', { eventId, eventSourceUrl: window.location.href });
};

// Re-calls fbq('init') with hashed PII for advanced matching, and keeps the same
// hashes in the relay identity so CAPI events carry them too.
// Safe to call multiple times; Meta Pixel merges the user data.
export const setPixelUserData = async ({ email, phone, firstName, lastName } = {}) => {
  if (!window.fbq || !PIXEL_ID) return;
  const ud = {};
  if (email?.trim()) ud.em = await sha256(email.trim().toLowerCase());
  if (phone?.trim()) ud.ph = await sha256(normalizePhone(phone));
  if (firstName?.trim()) ud.fn = await sha256(firstName.trim().toLowerCase());
  if (lastName?.trim()) ud.ln = await sha256(lastName.trim().toLowerCase());
  if (Object.keys(ud).length === 0) return;
  Object.assign(identity, ud);
  window.fbq('init', PIXEL_ID, ud);
};
