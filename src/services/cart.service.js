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

/**
 * Pack Cart Storage Operations
 * Separate storage for packs using the same structure as books
 */
const PACK_CART_STORAGE_KEY = 'el_cart_packs';

/**
 * Pack Cart Item Structure:
 * {
 *   packId: number,
 *   quantity: number,
 *   addedAt: timestamp
 * }
 */

export const packCartStorage = {
    /**
     * Get all pack cart items from localStorage
     * @returns {Array<{packId: number, quantity: number, addedAt: number}>}
     */
    get: () => {
        try {
            const stored = localStorage.getItem(PACK_CART_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error reading pack cart from localStorage:', error);
            return [];
        }
    },

    /**
     * Save pack cart items to localStorage
     * @param {Array<{packId: number, quantity: number, addedAt: number}>} packCartItems
     */
    set: (packCartItems) => {
        try {
            localStorage.setItem(PACK_CART_STORAGE_KEY, JSON.stringify(packCartItems));
        } catch (error) {
            console.error('Error saving pack cart to localStorage:', error);
        }
    },

    /**
     * Add pack to cart or increase quantity if exists
     * @param {number} packId
     * @param {number} quantity
     * @returns {Array} Updated pack cart
     */
    add: (packId, quantity = 1) => {
        const cart = packCartStorage.get();
        const existingItem = cart.find(item => item.packId === packId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                packId,
                quantity,
                addedAt: Date.now()
            });
        }

        packCartStorage.set(cart);
        return cart;
    },

    /**
     * Remove pack from cart
     * @param {number} packId
     * @returns {Array} Updated pack cart
     */
    remove: (packId) => {
        const cart = packCartStorage.get();
        const updated = cart.filter(item => item.packId !== packId);
        packCartStorage.set(updated);
        return updated;
    },

    /**
     * Update pack quantity
     * @param {number} packId
     * @param {number} quantity
     * @returns {Array} Updated pack cart
     */
    updateQuantity: (packId, quantity) => {
        const cart = packCartStorage.get();
        const item = cart.find(item => item.packId === packId);

        if (item) {
            if (quantity <= 0) {
                return packCartStorage.remove(packId);
            }
            item.quantity = quantity;
            packCartStorage.set(cart);
        }

        return cart;
    },

    /**
     * Clear all packs from cart
     */
    clear: () => {
        localStorage.removeItem(PACK_CART_STORAGE_KEY);
    },

    /**
     * Check if pack is in cart
     * @param {number} packId
     * @returns {boolean}
     */
    has: (packId) => {
        const cart = packCartStorage.get();
        return cart.some(item => item.packId === packId);
    },

    /**
     * Get total number of pack items in cart (count as 1 item each)
     * @returns {number}
     */
    getItemCount: () => {
        const cart = packCartStorage.get();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },

    /**
     * Get specific pack cart item
     * @param {number} packId
     * @returns {Object|undefined}
     */
    getItem: (packId) => {
        const cart = packCartStorage.get();
        return cart.find(item => item.packId === packId);
    }
};

/**
 * Convert pack cart items to full pack details
 * Fetches pack data from API and merges with cart quantities
 * @param {Array<{packId: number, quantity: number, addedAt: number}>} packCartItems
 * @returns {Promise<Array>} Array of packs with quantity property
 */
export const hydratePackCartItems = async (packCartItems) => {
    if (!packCartItems || packCartItems.length === 0) {
        return [];
    }

    try {
        const { getBookPackById } = await import('./bookPackService');
        const { getBooksByIds } = await import('./books.service');
        const { getBookCoverUrl } = await import('../utils/imageUtils');

        // Fetch all packs in parallel
        const packsPromises = packCartItems.map(item =>
            getBookPackById(item.packId).catch(err => {
                console.error(`Error fetching pack ${item.packId}:`, err);
                return null;
            })
        );

        const packsData = await Promise.all(packsPromises);

        // Hydrate each pack with book details
        const hydratedPacks = await Promise.all(
            packCartItems.map(async (item, index) => {
                const pack = packsData[index];
                if (!pack) return null;

                try {
                    // Extract book IDs from the pack
                    const bookIds = (pack.books || []).map(book =>
                        typeof book === 'object' ? book.id : book
                    );

                    // Fetch all books for this pack
                    const booksDetails = await getBooksByIds(bookIds);

                    return {
                        id: pack.id,
                        title: pack.title,
                        description: pack.description,
                        price: parseFloat(pack.price) || 0,
                        quantity: item.quantity,
                        addedAt: item.addedAt,
                        books: booksDetails.map(book => ({
                            id: book.id,
                            title: book.title,
                            author: book.author?.name || 'Unknown',
                            price: parseFloat(book.price) || 0,
                            coverImage: getBookCoverUrl(book.id)
                        })),
                        isPack: true
                    };
                } catch (err) {
                    console.error(`Error hydrating pack ${pack.id}:`, err);
                    return null;
                }
            })
        );

        return hydratedPacks.filter(pack => pack !== null);
    } catch (error) {
        console.error('Error hydrating pack cart items:', error);
        throw error;
    }
};

// Export default for backwards compatibility
export default {
    cartStorage,
    hydrateCartItems,
    packCartStorage,
    hydratePackCartItems
};
