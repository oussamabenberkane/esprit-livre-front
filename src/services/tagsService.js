// Tags/Categories API Service

const API_BASE_URL = 'https://slimy-plants-peel.loca.lt';

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
