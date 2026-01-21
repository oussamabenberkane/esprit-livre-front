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
