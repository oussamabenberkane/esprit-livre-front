import { API_BASE_URL, getDefaultHeaders } from './apiConfig';
import { getAccessToken } from './authService';

/**
 * Get all book packs with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 0)
 * @param {number} params.size - Page size (default: 20)
 * @param {string} params.search - Search query
 * @param {number} params.minPrice - Minimum price filter
 * @param {number} params.maxPrice - Maximum price filter
 * @returns {Promise<Object>} Paginated book packs response
 */
export const getAllBookPacks = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add pagination params
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);

    // Add filter params
    if (params.search) queryParams.append('search', params.search);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice);

    const url = `${API_BASE_URL}/api/book-packs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch book packs: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching book packs:', error);
    throw error;
  }
};

/**
 * Get a single book pack by ID
 * @param {number} id - Book pack ID
 * @returns {Promise<Object>} Book pack details
 */
export const getBookPackById = async (id) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/book-packs/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch book pack: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching book pack:', error);
    throw error;
  }
};

/**
 * Get recommended book packs for a specific book
 * @param {number} bookId - Book ID to get recommendations for
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 0)
 * @param {number} params.size - Page size (default: 20)
 * @returns {Promise<Object>} Paginated recommended book packs response
 */
export const getRecommendedPacksForBook = async (bookId, params = {}) => {
  try {
    // TODO: Replace with actual recommendation endpoint when backend implements it
    // Expected endpoint: GET /api/books/${bookId}/recommended-packs
    // For now, falling back to getAllBookPacks

    // When backend is ready, uncomment and use this:
    /*
    const queryParams = new URLSearchParams();
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);

    const url = `${API_BASE_URL}/api/books/${bookId}/recommended-packs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const headers = {
      'Content-Type': 'application/json',
    };

    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recommended packs: ${response.status}`);
    }

    return await response.json();
    */

    // Temporary fallback - fetches all packs
    console.warn(`Using fallback: Recommendation endpoint not yet implemented for book ${bookId}`);
    return await getAllBookPacks(params);
  } catch (error) {
    console.error('Error fetching recommended packs:', error);
    throw error;
  }
};
