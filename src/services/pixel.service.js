const PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;

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
  window.fbq('track', 'PageView');
};

export const trackViewContent = ({ id, name, category, value }) => {
  track('ViewContent', {
    content_ids: [String(id)],
    content_type: 'product',
    content_name: name,
    ...(category && { content_category: category }),
    value: parseFloat(value) || 0,
    currency: 'DZD',
  });
};

export const trackSearch = (searchString) => {
  if (!searchString?.trim()) return;
  track('Search', { search_string: searchString.trim() });
};

export const trackAddToCart = ({ id, name, value, quantity = 1 }) => {
  track('AddToCart', {
    content_ids: [String(id)],
    content_type: 'product',
    content_name: name,
    value: parseFloat(value) || 0,
    currency: 'DZD',
    num_items: quantity,
  });
};

export const trackInitiateCheckout = ({ value, numItems, contentIds }) => {
  track('InitiateCheckout', {
    value: parseFloat(value) || 0,
    currency: 'DZD',
    num_items: numItems,
    content_ids: contentIds.map(String),
    content_type: 'product',
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

export const trackCompleteRegistration = () => {
  track('CompleteRegistration', { status: true });
};

export const trackContact = () => {
  track('Contact');
};

// Re-calls fbq('init') with hashed PII for advanced matching.
// Safe to call multiple times; Meta Pixel merges the user data.
export const setPixelUserData = async ({ email, phone, firstName, lastName } = {}) => {
  if (!window.fbq || !PIXEL_ID) return;
  const ud = {};
  if (email?.trim()) ud.em = await sha256(email.trim().toLowerCase());
  if (phone?.trim()) ud.ph = await sha256(phone.replace(/\s+/g, '').toLowerCase());
  if (firstName?.trim()) ud.fn = await sha256(firstName.trim().toLowerCase());
  if (lastName?.trim()) ud.ln = await sha256(lastName.trim().toLowerCase());
  if (Object.keys(ud).length > 0) window.fbq('init', PIXEL_ID, ud);
};
