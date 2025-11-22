// src/services/cart.service.js
import { getBooksByIds } from './books.service';

const CART_STORAGE_KEY = 'el_cart';

/**
 * Cart Item Structure:
 * {
 *   bookId: number,
 *   quantity: number,
 *   addedAt: timestamp
 * }
 */

/**
 * Local Storage Cart Operations
 * This is the ONLY storage mechanism for the cart.
 * No backend/API integration - pure client-side cart.
 */
export const cartStorage = {
    /**
     * Get all cart items from localStorage
     * @returns {Array<{bookId: number, quantity: number, addedAt: number}>}
     */
    get: () => {
        try {
            const stored = localStorage.getItem(CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading cart from localStorage:', error);
            return [];
        }
    },

    /**
     * Save cart items to localStorage
     * @param {Array<{bookId: number, quantity: number, addedAt: number}>} cartItems
     */
    set: (cartItems) => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    },

    /**
     * Add item to cart or increase quantity if exists
     * @param {number} bookId
     * @param {number} quantity
     * @returns {Array} Updated cart
     */
    add: (bookId, quantity = 1) => {
        const cart = cartStorage.get();
        const existingItem = cart.find(item => item.bookId === bookId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                bookId,
                quantity,
                addedAt: Date.now()
            });
        }

        cartStorage.set(cart);
        return cart;
    },

    /**
     * Remove item from cart
     * @param {number} bookId
     * @returns {Array} Updated cart
     */
    remove: (bookId) => {
        const cart = cartStorage.get();
        const updated = cart.filter(item => item.bookId !== bookId);
        cartStorage.set(updated);
        return updated;
    },

    /**
     * Update item quantity
     * @param {number} bookId
     * @param {number} quantity
     * @returns {Array} Updated cart
     */
    updateQuantity: (bookId, quantity) => {
        const cart = cartStorage.get();
        const item = cart.find(item => item.bookId === bookId);

        if (item) {
            if (quantity <= 0) {
                return cartStorage.remove(bookId);
            }
            item.quantity = quantity;
            cartStorage.set(cart);
        }

        return cart;
    },

    /**
     * Clear all items from cart
     */
    clear: () => {
        localStorage.removeItem(CART_STORAGE_KEY);
    },

    /**
     * Check if book is in cart
     * @param {number} bookId
     * @returns {boolean}
     */
    has: (bookId) => {
        const cart = cartStorage.get();
        return cart.some(item => item.bookId === bookId);
    },

    /**
     * Get total number of items in cart (sum of quantities)
     * @returns {number}
     */
    getItemCount: () => {
        const cart = cartStorage.get();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Get specific cart item
     * @param {number} bookId
     * @returns {Object|undefined}
     */
    getItem: (bookId) => {
        const cart = cartStorage.get();
        return cart.find(item => item.bookId === bookId);
    }
};

/**
 * Convert cart items to full book details
 * Fetches book data from API and merges with cart quantities
 * @param {Array<{bookId: number, quantity: number, addedAt: number}>} cartItems
 * @returns {Promise<Array>} Array of books with quantity property
 */
export const hydrateCartItems = async (cartItems) => {
    if (!cartItems || cartItems.length === 0) {
        return [];
    }

    try {
        const bookIds = cartItems.map(item => item.bookId);
        const books = await getBooksByIds(bookIds);

        // Merge book details with quantity
        return cartItems.map(item => {
            const book = books.find(b => b.id === item.bookId);
            if (book) {
                return {
                    ...book,
                    quantity: item.quantity,
                    addedAt: item.addedAt
                };
            }
            return null;
        }).filter(item => item !== null); // Filter out books that weren't found
    } catch (error) {
        console.error('Error hydrating cart items:', error);
        throw error;
    }
};

// Export default for backwards compatibility
export default {
    cartStorage,
    hydrateCartItems
};
