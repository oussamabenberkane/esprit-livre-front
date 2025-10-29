// Order API Service
import { API_BASE_URL, getDefaultHeaders } from './apiConfig';
import { getAccessToken } from './authService';

/**
 * Get authenticated headers with Bearer token
 * @returns {Object} Headers with Authorization
 */
const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    ...getDefaultHeaders(),
    'Authorization': `Bearer ${token}`,
  };
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
 * Create a new order
 * @param {Object} orderData - Order data
 * @returns {Promise<Object>} Created order
 */
export const createOrder = async (orderData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      if (response.status === 400) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Invalid order data');
      }
      throw new Error(`Failed to create order: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};
