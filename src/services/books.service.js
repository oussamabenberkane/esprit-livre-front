// Books API Service - Unified service for all book-related API calls
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
 * Fetch all books with pagination and filters
 * @param {number} page - Page number (default 0)
 * @param {number} size - Number of books per page (default 12)
 * @param {Object} filters - Filter options
 * @param {Array<string>} filters.categories - Array of category names
 * @param {Array<string>} filters.authors - Array of author names
 * @param {Array<string>} filters.titles - Array of book title search terms
 * @param {string} filters.search - Search query string
 * @param {Array<string>} filters.languages - Array of languages (FR/EN/AR)
 * @param {number} filters.minPrice - Minimum price
 * @param {number} filters.maxPrice - Maximum price
 * @param {number} filters.categoryId - Category ID filter
 * @param {number} filters.mainDisplayId - Main display ID filter
 * @returns {Promise<Object>} Paginated response with books and metadata
 */
export const fetchAllBooks = async (page = 0, size = 12, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    // Add category filters (API accepts multiple categoryId params)
    if (filters.categories && filters.categories.length > 0) {
      filters.categories.forEach(category => {
        // Ensure we're appending the ID as a string, not an object
        const categoryId = typeof category === 'object' ? category.id : category;
        if (categoryId) {
          params.append('categoryId', categoryId.toString());
        }
      });
    }

    // Add single categoryId filter if provided
    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId.toString());
    }

    // Add mainDisplayId filter if provided
    if (filters.mainDisplayId) {
      params.append('mainDisplayId', filters.mainDisplayId.toString());
    }

    // Add author filter (API accepts author ID)
    if (filters.authors && filters.authors.length > 0) {
      filters.authors.forEach(author => {
        // Ensure we're appending the ID as a string, not an object
        const authorId = typeof author === 'object' ? author.id : author;
        if (authorId) {
          params.append('author', authorId.toString());
        }
      });
    }

    // Add single author filter if provided
    if (filters.author) {
      params.append('author', filters.author);
    }

    // Add search filter (API uses 'search' param)
    // Support both direct search string and titles array for backward compatibility
    if (filters.search && filters.search.trim().length > 0) {
      params.append('search', filters.search.trim());
    } else if (filters.titles && filters.titles.length > 0) {
      // Join multiple title searches
      params.append('search', filters.titles.join(' '));
    }

    // Add price range filters
    if (filters.minPrice !== undefined && filters.minPrice !== null && filters.minPrice > 0) {
      params.append('minPrice', filters.minPrice.toString());
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null && filters.maxPrice < 10000) {
      params.append('maxPrice', filters.maxPrice.toString());
    }

    // Add language filters (if API supports it, otherwise filter client-side)
    if (filters.languages && filters.languages.length > 0) {
      // Map display names to API enum values
      const languageMap = {
        'Français': 'FR',
        'English': 'EN',
        'العربية': 'AR'
      };
      filters.languages.forEach(lang => {
        const apiLang = languageMap[lang] || lang.toUpperCase();
        params.append('language', apiLang);
      });
    }

    const response = await fetch(`${API_BASE_URL}/api/books?${params.toString()}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.statusText}`);
    }

    const data = await response.json();

    // Return paginated response with content and metadata
    if (data && data.content && Array.isArray(data.content)) {
      return {
        books: data.content,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.number || 0,
        size: data.size || size
      };
    }

    // If data is already an array, return it with basic pagination info
    if (Array.isArray(data)) {
      return {
        books: data,
        totalElements: data.length,
        totalPages: 1,
        currentPage: 0,
        size: data.length
      };
    }

    // Otherwise return empty result
    console.warn('Unexpected response format from books API:', data);
    return {
      books: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: size
    };
  } catch (error) {
    console.error('Error fetching all books:', error);
    throw error;
  }
};

/**
 * Fetch books by main display ID
 * @param {number} mainDisplayId - The ID of the main display
 * @param {number} page - Page number (default 0)
 * @param {number} size - Number of books per page (default 10)
 * @returns {Promise<Array>} Array of books
 */
export const fetchBooksByMainDisplay = async (mainDisplayId, page = 0, size = 10) => {
  try {
    const params = new URLSearchParams({
      mainDisplayId: mainDisplayId.toString(),
      page: page.toString(),
      size: size.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/books?${params.toString()}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch books: ${response.statusText}`);
    }

    const data = await response.json();

    // Handle paginated response - extract content array if present
    // If response is paginated (has content property), return content array
    // Otherwise return the data as-is (in case it's already an array)
    if (data && data.content && Array.isArray(data.content)) {
      return data.content;
    }

    // If data is already an array, return it
    if (Array.isArray(data)) {
      return data;
    }

    // Otherwise return empty array
    console.warn('Unexpected response format from books API:', data);
    return [];
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

/**
 * Fetch a single book by ID
 * @param {number} id - The book ID
 * @returns {Promise<Object>} Book object
 */
export const fetchBookById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/books/${id}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null; // Book not found
      }
      throw new Error(`Failed to fetch book: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching book with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch recommended books for a specific book
 * @param {number} id - The book ID
 * @param {number} page - Page number (default 0)
 * @param {number} size - Number of recommendations (default 5)
 * @returns {Promise<Array>} Array of recommended books
 */
export const fetchBookRecommendations = async (id, page = 0, size = 5) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/books/${id}/recommendations?${params.toString()}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch book recommendations: ${response.statusText}`);
    }

    const data = await response.json();

    // Return the recommendations array
    if (Array.isArray(data)) {
      return data;
    }

    // Handle unexpected response format
    console.warn('Unexpected response format from recommendations API:', data);
    return [];
  } catch (error) {
    console.error(`Error fetching recommendations for book ${id}:`, error);
    throw error;
  }
};

/**
 * Fetch book suggestions based on search query (for autocomplete)
 * @param {string} query - The search query
 * @returns {Promise<Array>} Array of book suggestions
 */
export const fetchBookSuggestions = async (query) => {
  try {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const params = new URLSearchParams({
      q: query.trim()
    });

    const response = await fetch(`${API_BASE_URL}/api/books/suggestions?${params.toString()}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch book suggestions: ${response.statusText}`);
    }

    const data = await response.json();

    // Return the suggestions array
    if (Array.isArray(data)) {
      return data;
    }

    // Handle unexpected response format
    console.warn('Unexpected response format from suggestions API:', data);
    return [];
  } catch (error) {
    console.error(`Error fetching book suggestions for query "${query}":`, error);
    throw error;
  }
};

/**
 * Fetch user's liked books (favorites) with pagination and filters
 * @param {number} page - Page number (default 0)
 * @param {number} size - Number of books per page (default 20)
 * @param {Object} filters - Filter options
 * @param {string} filters.search - Search query
 * @param {string} filters.author - Author name filter
 * @param {number} filters.minPrice - Minimum price
 * @param {number} filters.maxPrice - Maximum price
 * @param {number} filters.categoryId - Category ID filter
 * @param {number} filters.mainDisplayId - Main display ID filter
 * @returns {Promise<Object>} Paginated response with liked books and metadata
 */
export const fetchLikedBooks = async (page = 0, size = 20, filters = {}) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    // Add filters if provided
    if (filters.search) {
      params.append('search', filters.search);
    }

    if (filters.author) {
      params.append('author', filters.author);
    }

    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      params.append('minPrice', filters.minPrice.toString());
    }

    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      params.append('maxPrice', filters.maxPrice.toString());
    }

    if (filters.categoryId) {
      params.append('categoryId', filters.categoryId.toString());
    }

    if (filters.mainDisplayId) {
      params.append('mainDisplayId', filters.mainDisplayId.toString());
    }

    const response = await fetch(`${API_BASE_URL}/api/books/liked?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized - Please login again');
      }
      throw new Error(`Failed to fetch liked books: ${response.statusText}`);
    }

    const data = await response.json();

    // Return paginated response with content and metadata
    if (data && data.content && Array.isArray(data.content)) {
      return {
        books: data.content,
        totalElements: data.totalElements || 0,
        totalPages: data.totalPages || 0,
        currentPage: data.number || 0,
        size: data.size || size
      };
    }

    // If data is already an array, return it with basic pagination info
    if (Array.isArray(data)) {
      return {
        books: data,
        totalElements: data.length,
        totalPages: 1,
        currentPage: 0,
        size: data.length
      };
    }

    // Otherwise return empty result
    console.warn('Unexpected response format from liked books API:', data);
    return {
      books: [],
      totalElements: 0,
      totalPages: 0,
      currentPage: 0,
      size: size
    };
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

    // Extract IDs if array contains objects, and filter out invalid values
    const validIds = bookIds
      .map(item => typeof item === 'object' ? item.id : item)
      .filter(id => id !== null && id !== undefined && !isNaN(id));

    if (validIds.length === 0) {
      console.warn('No valid book IDs found in array:', bookIds);
      return [];
    }

    // Fetch all books in parallel
    const bookPromises = validIds.map(id => fetchBookById(id));
    const books = await Promise.all(bookPromises);

    return books.filter(book => book !== null);
  } catch (error) {
    console.error('Error fetching books by IDs:', error);
    throw error;
  }
};

/**
 * Get book cover image URL
 * @param {number} id - The book ID
 * @param {boolean} placeholder - Return placeholder if cover not found (default: false)
 * @returns {string} Cover image URL
 */
export const getBookCoverUrl = (id, placeholder = false) => {
  return `${API_BASE_URL}/api/books/${id}/cover${placeholder ? '?placeholder=true' : ''}`;
};

// ============================================================================
// ALTERNATIVE FUNCTION NAMES (for backward compatibility)
// ============================================================================

/**
 * Alias for fetchAllBooks (for backward compatibility)
 */
export const getAllBooks = fetchAllBooks;

/**
 * Alias for fetchBookById (for backward compatibility)
 */
export const getBookById = fetchBookById;

/**
 * Alias for fetchBookSuggestions (for backward compatibility)
 */
export const getBookSuggestions = fetchBookSuggestions;

/**
 * Alias for fetchLikedBooks (for backward compatibility)
 */
export const getLikedBooks = fetchLikedBooks;
