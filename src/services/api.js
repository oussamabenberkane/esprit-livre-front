import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

/**
 * Generic fetch wrapper with error handling
 */
async function apiFetch(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

/**
 * Fetch categories (type=CATEGORY)
 */
export async function fetchCategories() {
    const url = `${API_BASE_URL}${API_ENDPOINTS.TAGS}?type=CATEGORY`;
    return apiFetch(url);
}

/**
 * Fetch MAIN_DISPLAY tags
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Page size (default: 3)
 */
export async function fetchMainDisplayTags(page = 0, size = 3) {
    const url = `${API_BASE_URL}${API_ENDPOINTS.TAGS}?type=MAIN_DISPLAY&page=${page}&size=${size}`;
    return apiFetch(url);
}

/**
 * Fetch books by MAIN_DISPLAY tag ID
 * @param {number} mainDisplayId - The MAIN_DISPLAY tag ID
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Number of books to fetch (default: 10)
 */
export async function fetchBooksByMainDisplay(mainDisplayId, page = 0, size = 10) {
    const url = `${API_BASE_URL}${API_ENDPOINTS.BOOKS}?mainDisplayId=${mainDisplayId}&page=${page}&size=${size}`;
    return apiFetch(url);
}

/**
 * Fetch top authors
 */
export async function fetchTopAuthors() {
    const url = `${API_BASE_URL}${API_ENDPOINTS.AUTHORS_TOP}`;
    return apiFetch(url);
}
