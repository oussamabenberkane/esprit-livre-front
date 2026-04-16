// src/services/favorites.service.js
import apiClient from './apiClient';

/**
 * Toggle like/unlike for a book (authenticated users only)
 * @param {number} bookId - The book ID to toggle
 * @returns {Promise<{bookId: number, isLiked: boolean, likeCount: number}>}
 */
export const toggleFavorite = async (bookId) => {
    try {
        const response = await apiClient.post(`/api/likes/toggle/${bookId}`);
        return response.data;
    } catch (error) {
        console.error(`Error toggling favorite for book ${bookId}:`, error);
        throw error;
    }
};

/**
 * Get all liked books for authenticated user
 * @param {number} page - Page number (default: 0)
 * @param {number} size - Page size (default: 100)
 * @param {Object} filters - Optional filters (search, author, minPrice, maxPrice, categoryId, mainDisplayId)
 * @returns {Promise<{books: Array, totalElements: number, totalPages: number}>}
 */
export const fetchLikedBooks = async (page = 0, size = 100, filters = {}) => {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString(),
            ...filters
        });

        const response = await apiClient.get(`/api/books/liked?${params}`);

        const data = response.data;

        if (data && data.content && Array.isArray(data.content)) {
            return {
                books: data.content,
                totalElements: data.totalElements || 0,
                totalPages: data.totalPages || 0
            };
        }

        if (Array.isArray(data)) {
            return {
                books: data,
                totalElements: data.length,
                totalPages: 1
            };
        }

        console.warn('Unexpected response format from liked books API:', data);
        return {
            books: [],
            totalElements: 0,
            totalPages: 0
        };
    } catch (error) {
        console.error('Error fetching liked books:', error);
        throw error;
    }
};
