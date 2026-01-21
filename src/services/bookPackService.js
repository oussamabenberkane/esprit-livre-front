import { API_BASE_URL, getDefaultHeaders } from './apiConfig';

/**
 * Get all book packs with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 0)
 * @param {number} params.size - Page size (default: 20)
 * @param {string} params.search - Search query
 * @param {number} params.minPrice - Minimum price filter
 * @param {number} params.maxPrice - Maximum price filter
 * @param {Array<number>|number} params.author - Author ID(s) filter
 * @param {Array<number>} params.categories - Array of category IDs (similar to books service)
 * @param {number} params.categoryId - Single category ID filter
 * @param {Array<string>|string} params.language - Language filter(s)
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

    // Add category filters (API accepts multiple categoryId params) - matching books service pattern
    if (params.categories && params.categories.length > 0) {
      params.categories.forEach(category => {
        // Ensure we're appending the ID as a string, not an object
        const categoryId = typeof category === 'object' ? category.id : category;
        if (categoryId) {
          queryParams.append('categoryId', categoryId.toString());
        }
      });
    }

    // Add single categoryId filter if provided (for backward compatibility)
    if (params.categoryId !== undefined) {
      queryParams.append('categoryId', params.categoryId.toString());
    }

    // Add author filter(s) - support both single value and array
    if (params.author) {
      if (Array.isArray(params.author)) {
        params.author.forEach(authorId => {
          queryParams.append('author', authorId.toString());
        });
      } else {
        queryParams.append('author', params.author.toString());
      }
    }

    // Add language filter(s) - support both single value and array
    if (params.language) {
      // Map display names to API enum values
      const languageMap = {
        'Français': 'FR',
        'English': 'EN',
        'العربية': 'AR'
      };

      if (Array.isArray(params.language)) {
        params.language.forEach(lang => {
          const apiLang = languageMap[lang] || lang.toUpperCase();
          queryParams.append('language', apiLang);
        });
      } else {
        const apiLang = languageMap[params.language] || params.language.toUpperCase();
        queryParams.append('language', apiLang);
      }
    }

    const url = `${API_BASE_URL}/api/book-packs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(),
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
    const response = await fetch(`${API_BASE_URL}/api/book-packs/${id}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
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

    const response = await fetch(url, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch recommended packs: ${response.status}`);
    }

    return await response.json();
    */

    // Temporary fallback - fetches all packs
    // TODO: Implement book-specific pack recommendations endpoint on backend
    console.log(`[INFO] Using fallback: fetching all packs for book ${bookId}`);
    return await getAllBookPacks(params);
  } catch (error) {
    console.error('Error fetching recommended packs:', error);
    throw error;
  }
};
