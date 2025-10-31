import { API_BASE_URL, getDefaultHeaders } from './apiConfig';
import { getAccessToken } from './authService';

/**
 * Get all books with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 0)
 * @param {number} params.size - Page size (default: 20)
 * @param {number} params.categoryId - Category filter
 * @param {number} params.mainDisplayId - Main display filter
 * @param {string} params.author - Author filter
 * @param {number} params.minPrice - Minimum price filter
 * @param {number} params.maxPrice - Maximum price filter
 * @param {string} params.search - Search query
 * @returns {Promise<Object>} Paginated books response
 */
export const getAllBooks = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    // Add pagination params
    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);

    // Add filter params
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.mainDisplayId) queryParams.append('mainDisplayId', params.mainDisplayId);
    if (params.author) queryParams.append('author', params.author);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice);
    if (params.search) queryParams.append('search', params.search);

    const url = `${API_BASE_URL}/api/books${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

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
      throw new Error(`Failed to fetch books: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

/**
 * Get a single book by ID
 * @param {number} id - Book ID
 * @returns {Promise<Object>} Book details
 */
export const getBookById = async (id) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch book: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

/**
 * Get book suggestions for autocomplete
 * @param {string} query - Search query
 * @returns {Promise<Array>} Array of book suggestions
 */
export const getBookSuggestions = async (query) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
    };

    const token = getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/books/suggestions?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch book suggestions: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching book suggestions:', error);
    throw error;
  }
};

/**
 * Get liked books (authenticated users only)
 * @param {Object} params - Query parameters
 * @returns {Promise<Object>} Paginated liked books response
 */
export const getLikedBooks = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page !== undefined) queryParams.append('page', params.page);
    if (params.size !== undefined) queryParams.append('size', params.size);
    if (params.search) queryParams.append('search', params.search);
    if (params.author) queryParams.append('author', params.author);
    if (params.minPrice !== undefined) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice !== undefined) queryParams.append('maxPrice', params.maxPrice);
    if (params.categoryId) queryParams.append('categoryId', params.categoryId);
    if (params.mainDisplayId) queryParams.append('mainDisplayId', params.mainDisplayId);

    const url = `${API_BASE_URL}/api/books/liked${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const token = getAccessToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch liked books: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching liked books:', error);
    throw error;
  }
};

/**
 * Fetch multiple books by their IDs
 * @param {Array<number>} bookIds - Array of book IDs
 * @returns {Promise<Array>} Array of book details
 */
export const getBooksByIds = async (bookIds) => {
  try {
    if (!bookIds || bookIds.length === 0) {
      return [];
    }

    // Fetch all books in parallel
    const bookPromises = bookIds.map(id => getBookById(id));
    const books = await Promise.all(bookPromises);

    return books;
  } catch (error) {
    console.error('Error fetching books by IDs:', error);
    throw error;
  }
};
