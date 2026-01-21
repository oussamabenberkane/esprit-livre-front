// Authors API Service
import { API_BASE_URL, getDefaultHeaders } from './apiConfig';

/**
 * Fetch top authors
 * @param {number} limit - Maximum number of authors to fetch (default 10)
 * @returns {Promise<Array>} Array of top authors
 */
export const fetchTopAuthors = async (limit = 10) => {
  try {
    const params = new URLSearchParams({
      size: limit.toString()
    });

    const response = await fetch(`${API_BASE_URL}/api/authors/top?${params.toString()}`, {
      method: 'GET',
      headers: getDefaultHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch authors: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top authors:', error);
    throw error;
  }
};
