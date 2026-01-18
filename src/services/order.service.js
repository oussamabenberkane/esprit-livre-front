// Order API Service
import { API_BASE_URL, getDefaultHeaders } from './apiConfig';
import { getAccessToken } from './authService';
import { OrderItemType, ShippingMethod, PROVIDER_DISPLAY_TO_API } from '../constants/orderEnums';

/**
 * Get authenticated headers with Bearer token (optional for guest checkout)
 * @returns {Object} Headers with Authorization if token exists
 */
const getAuthHeaders = () => {
  const token = getAccessToken();
  const headers = {
    ...getDefaultHeaders(),
  };

  // Only add Authorization header if token exists (supports guest checkout)
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Get user's orders with optional filters
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Page size (default: 20)
 * @param {Object} filters - Optional filters (status, dateFrom, dateTo, minAmount, maxAmount)
 * @returns {Promise<Object>} Paginated orders data
 */
export const getUserOrders = async (page = 0, size = 20, filters = {}) => {
  try {
    // Build query parameters
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    // Add optional filters
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.dateFrom) {
      params.append('dateFrom', filters.dateFrom);
    }
    if (filters.dateTo) {
      params.append('dateTo', filters.dateTo);
    }
    if (filters.minAmount) {
      params.append('minAmount', filters.minAmount.toString());
    }
    if (filters.maxAmount) {
      params.append('maxAmount', filters.maxAmount.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/orders?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      throw new Error(`Failed to fetch orders: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching user orders:', error);
    throw error;
  }
};

/**
 * Get a specific order by ID
 * @param {number} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      if (response.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error(`Failed to fetch order: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Build order payload from checkout form data and cart items
 * @param {Object} formData - Checkout form data
 * @param {Array} cartBooks - Cart books with quantity
 * @param {Array} cartPacks - Cart packs with quantity
 * @param {number} shippingCost - Shipping cost (fixed at 700 DZD)
 * @returns {Object} Order payload ready for API
 */
export const buildOrderPayload = (formData, cartBooks, cartPacks, shippingCost = 700) => {
  // Build order items from cart books
  const bookItems = cartBooks.map(book => ({
    bookId: book.id,
    quantity: book.quantity,
    itemType: OrderItemType.BOOK,
    unitPrice: book.price,
    totalPrice: book.price * book.quantity
  }));

  // Build order items from cart packs
  const packItems = cartPacks.map(pack => ({
    bookPackId: pack.id,
    quantity: pack.quantity,
    itemType: OrderItemType.PACK,
    unitPrice: pack.price,
    totalPrice: pack.price * pack.quantity
  }));

  // Combine all order items
  const orderItems = [...bookItems, ...packItems];

  // Calculate subtotal
  const subtotal = orderItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Determine shipping method
  const shippingMethod = formData.shippingPreference === 'home'
    ? ShippingMethod.HOME_DELIVERY
    : ShippingMethod.SHIPPING_PROVIDER;

  // Map shipping provider display name to API enum
  // Provider is now always required regardless of shipping method
  const shippingProvider = formData.pickupProvider
    ? PROVIDER_DISPLAY_TO_API[formData.pickupProvider]
    : null;

  // Build the order payload
  const payload = {
    fullName: formData.fullName,
    phone: formData.phone,
    email: formData.email || null,  // Optional field
    wilaya: formData.wilaya,
    city: formData.city,
    shippingMethod: shippingMethod,
    shippingProvider: shippingProvider,  // Always include provider
    totalAmount: subtotal + shippingCost,
    shippingCost: shippingCost,
    orderItems: orderItems
  };

  // Add streetAddress only if HOME_DELIVERY
  if (shippingMethod === ShippingMethod.HOME_DELIVERY) {
    payload.streetAddress = formData.homeAddress || null;
    payload.stopDeskId = null;
    payload.isStopDesk = false;
  }
  // Add stopDeskId and isStopDesk only if SHIPPING_PROVIDER (pickup point)
  else {
    payload.streetAddress = null;
    payload.stopDeskId = formData.stopDeskId || null;
    payload.isStopDesk = true;
  }

  return payload;
};

/**
 * Create a new order
 * @param {Object} orderData - Order data (use buildOrderPayload to construct)
 * @returns {Promise<Object>} Created order with uniqueId
 */
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    // Parse response body for both success and error cases
    const contentType = response.headers.get('content-type');
    let responseData;

    if (contentType && contentType.includes('json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      // Handle specific error cases
      if (response.status === 401) {
        const error = new Error('Unauthorized - Please login to place an order');
        error.code = 'error.unauthorized';
        throw error;
      }

      if (response.status === 400) {
        // JHipster ProblemDetail response with error codes
        // The 'message' field contains error codes like 'error.insufficientstock'
        const errorCode = responseData.message;
        const error = new Error(errorCode);
        error.code = errorCode;
        error.params = responseData.params; // Additional context (e.g., 'orderItem')
        error.detail = responseData.detail;
        console.log("my error ya zebi: ", responseData.message);
        throw error;
      }
      
      // Generic error
      const errorMessage = responseData.message || responseData.title || `Failed to create order: ${response.statusText}`;
      const error = new Error(errorMessage);
      error.code = 'error.generic';
      throw error;
    }

    return responseData;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
