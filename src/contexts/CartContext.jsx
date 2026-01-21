// src/contexts/CartContext.jsx
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { cartStorage, hydrateCartItems, packCartStorage, hydratePackCartItems } from '../services/cart.service';

/**
 * Pure Client-Side Cart Context
 * Uses ONLY localStorage for persistence - no API calls, no authentication checks
 * Cart persists across sessions, page reloads, and login/logout
 */

// Initial state
const initialState = {
    cartItems: [], // Array of {bookId, quantity, addedAt}
    cartBooks: [], // Array of full book objects with quantity (for cart page)
    packCartItems: [], // Array of {packId, quantity, addedAt}
    cartPacks: [], // Array of full pack objects with quantity (for cart page)
    isLoading: false,
    error: null
};

// Action types
const ACTIONS = {
    SET_CART_ITEMS: 'SET_CART_ITEMS',
    ADD_CART_ITEM: 'ADD_CART_ITEM',
    REMOVE_CART_ITEM: 'REMOVE_CART_ITEM',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    SET_CART_BOOKS: 'SET_CART_BOOKS',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    CLEAR_CART: 'CLEAR_CART',
    // Pack actions
    SET_PACK_CART_ITEMS: 'SET_PACK_CART_ITEMS',
    ADD_PACK_CART_ITEM: 'ADD_PACK_CART_ITEM',
    REMOVE_PACK_CART_ITEM: 'REMOVE_PACK_CART_ITEM',
    UPDATE_PACK_QUANTITY: 'UPDATE_PACK_QUANTITY',
    SET_CART_PACKS: 'SET_CART_PACKS',
    CLEAR_PACK_CART: 'CLEAR_PACK_CART'
};

// Reducer
const cartReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_CART_ITEMS:
            return {
                ...state,
                cartItems: action.payload,
                error: null
            };

        case ACTIONS.ADD_CART_ITEM:
            const existingItem = state.cartItems.find(item => item.bookId === action.payload.bookId);
            if (existingItem) {
                return {
                    ...state,
                    cartItems: state.cartItems.map(item =>
                        item.bookId === action.payload.bookId
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    ),
                    error: null
                };
            }
            return {
                ...state,
                cartItems: [...state.cartItems, action.payload],
                error: null
            };

        case ACTIONS.REMOVE_CART_ITEM:
            return {
                ...state,
                cartItems: state.cartItems.filter(item => item.bookId !== action.payload),
                cartBooks: state.cartBooks.filter(book => book.id !== action.payload),
                error: null
            };

        case ACTIONS.UPDATE_QUANTITY:
            return {
                ...state,
                cartItems: state.cartItems.map(item =>
                    item.bookId === action.payload.bookId
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
                error: null
            };

        case ACTIONS.SET_CART_BOOKS:
            return {
                ...state,
                cartBooks: action.payload,
                isLoading: false,
                error: null
            };

        case ACTIONS.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload
            };

        case ACTIONS.SET_ERROR:
            return {
                ...state,
                error: action.payload,
                isLoading: false
            };

        case ACTIONS.CLEAR_CART:
            return {
                ...initialState
            };

        // Pack reducer cases
        case ACTIONS.SET_PACK_CART_ITEMS:
            return {
                ...state,
                packCartItems: action.payload,
                error: null
            };

        case ACTIONS.ADD_PACK_CART_ITEM:
            const existingPackItem = state.packCartItems.find(item => item.packId === action.payload.packId);
            if (existingPackItem) {
                return {
                    ...state,
                    packCartItems: state.packCartItems.map(item =>
                        item.packId === action.payload.packId
                            ? { ...item, quantity: item.quantity + action.payload.quantity }
                            : item
                    ),
                    error: null
                };
            }
            return {
                ...state,
                packCartItems: [...state.packCartItems, action.payload],
                error: null
            };

        case ACTIONS.REMOVE_PACK_CART_ITEM:
            return {
                ...state,
                packCartItems: state.packCartItems.filter(item => item.packId !== action.payload),
                cartPacks: state.cartPacks.filter(pack => pack.id !== action.payload),
                error: null
            };

        case ACTIONS.UPDATE_PACK_QUANTITY:
            return {
                ...state,
                packCartItems: state.packCartItems.map(item =>
                    item.packId === action.payload.packId
                        ? { ...item, quantity: action.payload.quantity }
                        : item
                ),
                error: null
            };

        case ACTIONS.SET_CART_PACKS:
            return {
                ...state,
                cartPacks: action.payload,
                isLoading: false,
                error: null
            };

        case ACTIONS.CLEAR_PACK_CART:
            return {
                ...state,
                packCartItems: [],
                cartPacks: []
            };

        default:
            return state;
    }
};

// Create context
const CartContext = createContext(null);

// Provider component
export const CartProvider = ({ children }) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    /**
     * Load cart from localStorage on mount
     */
    useEffect(() => {
        const loadCart = () => {
            const cartItems = cartStorage.get();
            const packCartItems = packCartStorage.get();
            dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: cartItems });
            dispatch({ type: ACTIONS.SET_PACK_CART_ITEMS, payload: packCartItems });
        };

        loadCart();
    }, []);

    /**
     * Load full cart books (for Cart page)
     * Fetches book details from API and merges with localStorage quantities
     * @returns {Promise<Array>} Array of books with quantity
     */
    const loadCartBooks = useCallback(async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        try {
            const cartItems = cartStorage.get();

            if (cartItems.length > 0) {
                const books = await hydrateCartItems(cartItems);
                dispatch({ type: ACTIONS.SET_CART_BOOKS, payload: books });
                return books;
            } else {
                dispatch({ type: ACTIONS.SET_CART_BOOKS, payload: [] });
                return [];
            }
        } catch (error) {
            console.error('Error loading cart books:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return [];
        }
    }, []);

    /**
     * Add item to cart
     * @param {number} bookId - Book ID
     * @param {number} quantity - Quantity to add
     */
    const addToCart = async (bookId, quantity = 1) => {
        try {
            const updatedCart = cartStorage.add(bookId, quantity);
            dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: updatedCart });
        } catch (error) {
            console.error(`Error adding book ${bookId} to cart:`, error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    /**
     * Remove item from cart
     * @param {number} bookId - Book ID
     */
    const removeFromCart = async (bookId) => {
        try {
            const updatedCart = cartStorage.remove(bookId);
            dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: updatedCart });
            dispatch({ type: ACTIONS.REMOVE_CART_ITEM, payload: bookId });
        } catch (error) {
            console.error(`Error removing book ${bookId} from cart:`, error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    /**
     * Update item quantity
     * @param {number} bookId - Book ID
     * @param {number} quantity - New quantity
     */
    const updateQuantity = async (bookId, quantity) => {
        if (quantity <= 0) {
            return removeFromCart(bookId);
        }

        try {
            const updatedCart = cartStorage.updateQuantity(bookId, quantity);
            dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: updatedCart });
            dispatch({ type: ACTIONS.UPDATE_QUANTITY, payload: { bookId, quantity } });
        } catch (error) {
            console.error(`Error updating quantity for book ${bookId}:`, error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    /**
     * Check if item is in cart
     * @param {number} bookId - Book ID
     * @returns {boolean}
     */
    const isInCart = (bookId) => {
        return cartStorage.has(bookId);
    };

    /**
     * Get cart item count (total quantity)
     * @returns {number}
     */
    const getCartItemCount = () => {
        return cartStorage.getItemCount();
    };

    /**
     * Get specific cart item
     * @param {number} bookId - Book ID
     * @returns {Object|undefined}
     */
    const getCartItem = (bookId) => {
        return cartStorage.getItem(bookId);
    };

    /**
     * Get quantity of a specific book in cart
     * @param {number} bookId - Book ID
     * @returns {number} Quantity (0 if not in cart)
     */
    const getBookQuantity = (bookId) => {
        const item = cartStorage.getItem(bookId);
        return item ? item.quantity : 0;
    };

    /**
     * Clear all cart items
     */
    const clearCart = async () => {
        try {
            cartStorage.clear();
            dispatch({ type: ACTIONS.CLEAR_CART });
        } catch (error) {
            console.error('Error clearing cart:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    };

    /**
     * Refresh cart from localStorage
     */
    const refreshCart = useCallback(() => {
        const cartItems = cartStorage.get();
        const packCartItems = packCartStorage.get();
        dispatch({ type: ACTIONS.SET_CART_ITEMS, payload: cartItems });
        dispatch({ type: ACTIONS.SET_PACK_CART_ITEMS, payload: packCartItems });
    }, []);

    /**
     * Load full cart packs (for Cart page)
     * Fetches pack details from API and merges with localStorage quantities
     * @returns {Promise<Array>} Array of packs with quantity
     */
    const loadCartPacks = useCallback(async () => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        try {
            const packCartItems = packCartStorage.get();

            if (packCartItems.length > 0) {
                const packs = await hydratePackCartItems(packCartItems);
                dispatch({ type: ACTIONS.SET_CART_PACKS, payload: packs });
                return packs;
            } else {
                dispatch({ type: ACTIONS.SET_CART_PACKS, payload: [] });
                return [];
            }
        } catch (error) {
            console.error('Error loading cart packs:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return [];
        }
    }, []);

    /**
     * Add pack to cart
     * @param {number} packId - Pack ID
     * @param {number} quantity - Quantity to add
     */
    const addPackToCart = async (packId, quantity = 1) => {
        try {
            const updatedCart = packCartStorage.add(packId, quantity);
            dispatch({ type: ACTIONS.SET_PACK_CART_ITEMS, payload: updatedCart });
        } catch (error) {
            console.error(`Error adding pack ${packId} to cart:`, error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    /**
     * Remove pack from cart
     * @param {number} packId - Pack ID
     */
    const removePackFromCart = async (packId) => {
        try {
            const updatedCart = packCartStorage.remove(packId);
            dispatch({ type: ACTIONS.SET_PACK_CART_ITEMS, payload: updatedCart });
            dispatch({ type: ACTIONS.REMOVE_PACK_CART_ITEM, payload: packId });
        } catch (error) {
            console.error(`Error removing pack ${packId} from cart:`, error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    /**
     * Update pack quantity
     * @param {number} packId - Pack ID
     * @param {number} quantity - New quantity
     */
    const updatePackQuantity = async (packId, quantity) => {
        if (quantity <= 0) {
            return removePackFromCart(packId);
        }

        try {
            const updatedCart = packCartStorage.updateQuantity(packId, quantity);
            dispatch({ type: ACTIONS.SET_PACK_CART_ITEMS, payload: updatedCart });
            dispatch({ type: ACTIONS.UPDATE_PACK_QUANTITY, payload: { packId, quantity } });
        } catch (error) {
            console.error(`Error updating quantity for pack ${packId}:`, error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    /**
     * Check if pack is in cart
     * @param {number} packId - Pack ID
     * @returns {boolean}
     */
    const isPackInCart = (packId) => {
        return packCartStorage.has(packId);
    };

    /**
     * Get pack cart item count (packs count as 1 item each)
     * @returns {number}
     */
    const getPackCartItemCount = () => {
        return packCartStorage.getItemCount();
    };

    /**
     * Get specific pack cart item
     * @param {number} packId - Pack ID
     * @returns {Object|undefined}
     */
    const getPackCartItem = (packId) => {
        return packCartStorage.getItem(packId);
    };

    /**
     * Get quantity of a specific pack in cart
     * @param {number} packId - Pack ID
     * @returns {number} Quantity (0 if not in cart)
     */
    const getPackQuantity = (packId) => {
        const item = packCartStorage.getItem(packId);
        return item ? item.quantity : 0;
    };

    /**
     * Clear all pack cart items
     */
    const clearPackCart = async () => {
        try {
            packCartStorage.clear();
            dispatch({ type: ACTIONS.CLEAR_PACK_CART });
        } catch (error) {
            console.error('Error clearing pack cart:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        }
    };

    const value = {
        // State
        cartItems: state.cartItems,
        cartBooks: state.cartBooks,
        packCartItems: state.packCartItems,
        cartPacks: state.cartPacks,
        isLoading: state.isLoading,
        error: state.error,

        // Book Actions
        addToCart,
        removeFromCart,
        updateQuantity,
        isInCart,
        getCartItemCount,
        getCartItem,
        getBookQuantity,
        loadCartBooks,
        clearCart,
        refreshCart,

        // Pack Actions
        addPackToCart,
        removePackFromCart,
        updatePackQuantity,
        isPackInCart,
        getPackCartItemCount,
        getPackCartItem,
        getPackQuantity,
        loadCartPacks,
        clearPackCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

// Custom hook to use cart context
export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }

    return context;
};
