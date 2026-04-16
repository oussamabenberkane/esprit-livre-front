// src/contexts/FavoritesContext.jsx
import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { isAuthenticated } from '../services/authService';
import {
    toggleFavorite as apiToggleFavorite,
    fetchLikedBooks
} from '../services/favorites.service';

// Initial state
const initialState = {
    favorites: [], // Array of book IDs
    favoriteBooks: [], // Array of full book objects (for favorites page)
    isLoading: false,
    error: null,
    isSyncing: false,
    lastSyncTime: null
};

// Action types
const ACTIONS = {
    SET_FAVORITES: 'SET_FAVORITES',
    ADD_FAVORITE: 'ADD_FAVORITE',
    REMOVE_FAVORITE: 'REMOVE_FAVORITE',
    SET_FAVORITE_BOOKS: 'SET_FAVORITE_BOOKS',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_SYNCING: 'SET_SYNCING',
    CLEAR_FAVORITES: 'CLEAR_FAVORITES'
};

// Reducer
const favoritesReducer = (state, action) => {
    switch (action.type) {
        case ACTIONS.SET_FAVORITES:
            return {
                ...state,
                favorites: action.payload,
                error: null
            };

        case ACTIONS.ADD_FAVORITE:
            if (state.favorites.includes(action.payload)) {
                return state;
            }
            return {
                ...state,
                favorites: [...state.favorites, action.payload],
                error: null
            };

        case ACTIONS.REMOVE_FAVORITE:
            return {
                ...state,
                favorites: state.favorites.filter(id => id !== action.payload),
                favoriteBooks: state.favoriteBooks.filter(book => book.id !== action.payload),
                error: null
            };

        case ACTIONS.SET_FAVORITE_BOOKS:
            return {
                ...state,
                favoriteBooks: action.payload,
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

        case ACTIONS.SET_SYNCING:
            return {
                ...state,
                isSyncing: action.payload,
                lastSyncTime: action.payload ? state.lastSyncTime : Date.now()
            };

        case ACTIONS.CLEAR_FAVORITES:
            return {
                ...initialState
            };

        default:
            return state;
    }
};

// Create context
const FavoritesContext = createContext(null);

// Provider component
export const FavoritesProvider = ({ children }) => {
    const [state, dispatch] = useReducer(favoritesReducer, initialState);

    /**
     * Initialize favorites from server (authenticated users only)
     */
    const initializeFavorites = useCallback(async () => {
        if (!isAuthenticated()) {
            dispatch({ type: ACTIONS.CLEAR_FAVORITES });
            return;
        }

        dispatch({ type: ACTIONS.SET_SYNCING, payload: true });
        try {
            const { books } = await fetchLikedBooks(0, 100);
            const ids = books.map(book => book.id);
            dispatch({ type: ACTIONS.SET_FAVORITES, payload: ids });
        } catch (error) {
            console.error('Error loading favorites:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
        } finally {
            dispatch({ type: ACTIONS.SET_SYNCING, payload: false });
        }
    }, []);

    /**
     * Initialize favorites on mount
     */
    useEffect(() => {
        initializeFavorites();
    }, [initializeFavorites]);

    /**
     * Listen for authentication state changes
     */
    useEffect(() => {
        const handleAuthChange = () => {
            setTimeout(() => {
                initializeFavorites();
            }, 100);
        };

        window.addEventListener('authStateChanged', handleAuthChange);
        return () => {
            window.removeEventListener('authStateChanged', handleAuthChange);
        };
    }, [initializeFavorites]);

    /**
     * Load full favorite books with pagination (for Favorites page)
     */
    const loadFavoriteBooks = useCallback(async (page = 0, size = 100) => {
        if (!isAuthenticated()) {
            dispatch({ type: ACTIONS.SET_FAVORITE_BOOKS, payload: [] });
            return { books: [], totalElements: 0, totalPages: 0 };
        }

        dispatch({ type: ACTIONS.SET_LOADING, payload: true });
        try {
            const result = await fetchLikedBooks(page, size);
            dispatch({ type: ACTIONS.SET_FAVORITE_BOOKS, payload: result.books });
            return result;
        } catch (error) {
            console.error('Error loading favorite books:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return { books: [], totalElements: 0, totalPages: 0 };
        }
    }, []);

    /**
     * Toggle favorite for a book (authenticated users only)
     * Throws if called while unauthenticated — callers should guard with isAuthenticated() first.
     */
    const toggleFavorite = async (bookId) => {
        if (!isAuthenticated()) {
            return null;
        }

        try {
            const response = await apiToggleFavorite(bookId);

            if (response.isLiked) {
                dispatch({ type: ACTIONS.ADD_FAVORITE, payload: bookId });
            } else {
                dispatch({ type: ACTIONS.REMOVE_FAVORITE, payload: bookId });
            }

            return response.isLiked;
        } catch (error) {
            console.error(`Error toggling favorite for book ${bookId}:`, error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            throw error;
        }
    };

    /**
     * Add a book to favorites
     */
    const addFavorite = async (bookId) => {
        if (isFavorited(bookId)) return;
        return toggleFavorite(bookId);
    };

    /**
     * Remove a book from favorites
     */
    const removeFavorite = async (bookId) => {
        if (!isFavorited(bookId)) return;
        return toggleFavorite(bookId);
    };

    /**
     * Check if a book is favorited
     */
    const isFavorited = (bookId) => {
        return state.favorites.includes(bookId);
    };

    /**
     * Get favorites count
     */
    const getFavoritesCount = () => {
        return state.favorites.length;
    };

    /**
     * Clear all favorites
     */
    const clearAllFavorites = () => {
        dispatch({ type: ACTIONS.CLEAR_FAVORITES });
    };

    const value = {
        // State
        favorites: state.favorites,
        favoriteBooks: state.favoriteBooks,
        isLoading: state.isLoading,
        error: state.error,
        isSyncing: state.isSyncing,

        // Actions
        toggleFavorite,
        addFavorite,
        removeFavorite,
        isFavorited,
        loadFavoriteBooks,
        getFavoritesCount,
        clearAllFavorites,
        refreshFavorites: initializeFavorites
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
};

// Custom hook to use favorites context
export const useFavorites = () => {
    const context = useContext(FavoritesContext);

    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }

    return context;
};
