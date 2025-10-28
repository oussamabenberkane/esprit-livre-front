// Tags/Categories API Service

const API_BASE_URL = 'https://violet-spiders-pick.loca.lt';

/**
 * Fetch tags by type
 * @param {string} type - Tag type (e.g., 'CATEGORY', 'ETIQUETTE')
 * @param {number} limit - Maximum number of tags to fetch
 * @returns {Promise<Array>} Array of tags
 */
export const fetchTagsByType = async (type, limit = 10) => {
  try {
    const params = new URLSearchParams({
      type: type,
      size: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/tags?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tags: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Error fetching tags:', error);
    throw error;
  }
};

/**
 * Fetch categories specifically
 * @param {number} limit - Maximum number of categories to fetch
 * @returns {Promise<Array>} Array of category tags
 */
export const fetchCategories = async (limit = 10) => {
  return fetchTagsByType('CATEGORY', limit);
};

/**
 * Fetch main displays
 * @returns {Promise<Array>} Array of main display tags
 */
export const fetchMainDisplays = async () => {
  return fetchTagsByType('MAIN_DISPLAY');
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
      headers: {
        'Content-Type': 'application/json',
      },
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
