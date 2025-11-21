// src/services/favorites.service.js
import apiClient from './apiClient';

const FAVORITES_STORAGE_KEY = 'el_favorites';

/**
 * Local Storage Management (for non-authenticated users)
 */
export const localFavorites = {
    get: () => {
        try {
            const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading favorites from localStorage:', error);
            return [];
        }
    },

    set: (bookIds) => {
        try {
            localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(bookIds));
        } catch (error) {
            console.error('Error saving favorites to localStorage:', error);
        }
    },

    add: (bookId) => {
        const favorites = localFavorites.get();
        if (!favorites.includes(bookId)) {
            favorites.push(bookId);
            localFavorites.set(favorites);
        }
        return favorites;
    },

    remove: (bookId) => {
        const favorites = localFavorites.get();
        const updated = favorites.filter(id => id !== bookId);
        localFavorites.set(updated);
        return updated;
    },

    toggle: (bookId) => {
        const favorites = localFavorites.get();
        const isLiked = favorites.includes(bookId);

        if (isLiked) {
            return { favorites: localFavorites.remove(bookId), isLiked: false };
        } else {
            return { favorites: localFavorites.add(bookId), isLiked: true };
        }
    },

    clear: () => {
        localStorage.removeItem(FAVORITES_STORAGE_KEY);
    },

    has: (bookId) => {
        const favorites = localFavorites.get();
        return favorites.includes(bookId);
    }
};

/**
 * API-based favorites (for authenticated users)
 */

/**
 * Toggle like/unlike for a book
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

        // Handle paginated response structure (similar to books.service.js)
        // The API returns a Page object with content property containing the books array
        const data = response.data;

        if (data && data.content && Array.isArray(data.content)) {
            return {
                books: data.content,
                totalElements: data.totalElements || 0,
                totalPages: data.totalPages || 0
            };
        }

        // If data is already an array, return it with basic pagination info
        if (Array.isArray(data)) {
            return {
                books: data,
                totalElements: data.length,
                totalPages: 1
            };
        }

        // Otherwise return empty result
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

/**
 * Sync local favorites to server (called after login)
 * @param {Array<number>} localBookIds - Array of book IDs from localStorage
 * @returns {Promise<Array<number>>} - Array of successfully synced book IDs
 */
export const syncLocalFavoritesToServer = async (localBookIds) => {
    if (!localBookIds || localBookIds.length === 0) {
        return [];
    }

    const syncedIds = [];
    const failedIds = [];

    // Toggle each book to ensure it's liked on the server
    for (const bookId of localBookIds) {
        try {
            const response = await toggleFavorite(bookId);

            // Only add to synced if the book is now liked
            if (response.isLiked) {
                syncedIds.push(bookId);
            }
        } catch (error) {
            console.error(`Failed to sync favorite for book ${bookId}:`, error);
            failedIds.push(bookId);
        }
    }

    if (failedIds.length > 0) {
        console.warn(`Failed to sync ${failedIds.length} favorites:`, failedIds);
    }

    return syncedIds;
};

/**
 * Merge local favorites with server favorites
 * Returns unique set of book IDs from both sources
 * @param {Array<number>} localBookIds - Book IDs from localStorage
 * @param {Array<Object>} serverBooks - Book objects from server
 * @returns {Array<number>} - Merged unique book IDs
 */
export const mergeFavorites = (localBookIds, serverBooks) => {
    const serverBookIds = serverBooks.map(book => book.id);
    const allBookIds = [...new Set([...localBookIds, ...serverBookIds])];
    return allBookIds;
};

/**
 * Get favorites count (works for both authenticated and non-authenticated users)
 * @param {boolean} isAuthenticated - Whether user is authenticated
 * @returns {Promise<number>|number} - Count of favorites
 */
export const getFavoritesCount = async (isAuthenticated) => {
    if (isAuthenticated) {
        try {
            const { books } = await fetchLikedBooks(0, 1);
            return books.length;
        } catch (error) {
            console.error('Error getting favorites count:', error);
            return 0;
        }
    } else {
        return localFavorites.get().length;
    }
};
