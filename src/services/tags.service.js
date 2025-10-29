// Tags/Categories API Service
import { API_BASE_URL, getDefaultHeaders } from './apiConfig';

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
      headers: getDefaultHeaders(),
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
