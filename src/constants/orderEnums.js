// Order-related enum constants matching backend DTOs

/**
 * Order Item Types
 */
export const OrderItemType = {
  BOOK: 'BOOK',
  PACK: 'PACK'
};

/**
 * Shipping Methods
 */
export const ShippingMethod = {
  HOME_DELIVERY: 'HOME_DELIVERY',
  SHIPPING_PROVIDER: 'SHIPPING_PROVIDER'
};

/**
 * Shipping Providers
 */
export const ShippingProvider = {
  YALIDINE: 'YALIDINE',
  ZR: 'ZR'  // ZRexpress
};

/**
 * Order Status (read-only - set by backend)
 */
export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
};

/**
 * Map display names to API enum values for shipping providers
 */
export const PROVIDER_DISPLAY_TO_API = {
  'Yalidine': ShippingProvider.YALIDINE,
  'ZRexpress': ShippingProvider.ZR
};

/**
 * Map API enum values to display names for shipping providers
 */
export const PROVIDER_API_TO_DISPLAY = {
  [ShippingProvider.YALIDINE]: 'Yalidine',
  [ShippingProvider.ZR]: 'ZRexpress'
};

/**
 * Wilayas that ZR Express does not serve at all (no territory in their system).
 * ZRexpress must not be offered for these destinations.
 */
export const ZR_UNSUPPORTED_WILAYAS = ['Illizi', 'Tindouf', 'Djanet', 'Bordj Badji Mokhtar'];

const normalizeWilaya = (w) =>
  (w || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const ZR_UNSUPPORTED_NORMALIZED = ZR_UNSUPPORTED_WILAYAS.map(normalizeWilaya);

/**
 * Whether ZRexpress can be used for the given wilaya.
 */
export const isZrAvailableForWilaya = (wilaya) =>
  !ZR_UNSUPPORTED_NORMALIZED.includes(normalizeWilaya(wilaya));

/**
 * Provider display names available for a wilaya. ZRexpress is excluded for the
 * wilayas ZR Express does not serve.
 */
export const getAvailableProviders = (wilaya) => {
  const providers = ['Yalidine', 'ZRexpress'];
  return isZrAvailableForWilaya(wilaya) ? providers : providers.filter((p) => p !== 'ZRexpress');
};
