// src/contexts/FavoritesContext.jsx
import { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import { isAuthenticated } from '../services/authService';
import {
    localFavorites,
    toggleFavorite as apiToggleFavorite,
    fetchLikedBooks,
    syncLocalFavoritesToServer,
    mergeFavorites
} from '../services/favorites.service';
import { getBooksByIds } from '../services/books.service';

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
    const authenticated = isAuthenticated();
    const previousAuthRef = useRef(authenticated);

    /**
     * Load favorites from server and merge with local storage
     */
    const loadAndMergeFavorites = async () => {
        dispatch({ type: ACTIONS.SET_SYNCING, payload: true });

        try {
            // Get local favorites
            const localFavs = localFavorites.get();

            // Only fetch from server if authenticated
            if (isAuthenticated()) {
                try {
                    // Fetch server favorites
                    const { books: serverBooks } = await fetchLikedBooks(0, 100);

                    // Merge both sources
                    const mergedIds = mergeFavorites(localFavs, serverBooks);

                    // Find which local favorites need to be synced to server
                    const serverBookIds = serverBooks.map(book => book.id);
                    const localOnlyIds = localFavs.filter(id => !serverBookIds.includes(id));

                    // Sync local-only favorites to server
                    if (localOnlyIds.length > 0) {
                        console.log(`Syncing ${localOnlyIds.length} local favorites to server...`);
                        await syncLocalFavoritesToServer(localOnlyIds);
                    }

                    // Update state with merged favorites
                    dispatch({ type: ACTIONS.SET_FAVORITES, payload: mergedIds });

                    // Clear localStorage after successful sync
                    if (localFavs.length > 0) {
                        localFavorites.clear();
                        console.log('Local favorites cleared after sync');
                    }
                } catch (error) {
                    // If 401, user isn't actually authenticated - fallback to local
                    if (error.status === 401) {
                        console.log('Not authenticated (401), using local favorites');
                        dispatch({ type: ACTIONS.SET_FAVORITES, payload: localFavs });
                    } else {
                        // Re-throw other errors to be caught by outer catch
                        throw error;
                    }
                }
            } else {
                // Not authenticated - use local favorites
                console.log('Not authenticated, using local favorites');
                dispatch({ type: ACTIONS.SET_FAVORITES, payload: localFavs });
            }

        } catch (error) {
            console.error('Error loading and merging favorites:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });

            // Always fallback to local favorites on error
            const localFavs = localFavorites.get();
            dispatch({ type: ACTIONS.SET_FAVORITES, payload: localFavs });
        } finally {
            dispatch({ type: ACTIONS.SET_SYNCING, payload: false });
        }
    };

    /**
     * Initialize favorites based on authentication status
     */
    const initializeFavorites = useCallback(async () => {
        const isAuth = isAuthenticated();
        if (isAuth) {
            // Authenticated: Merge local with server and sync
            await loadAndMergeFavorites();
        } else {
            // Not authenticated: Load from localStorage
            const localFavs = localFavorites.get();
            dispatch({ type: ACTIONS.SET_FAVORITES, payload: localFavs });
        }
    }, []); // Empty deps - function checks auth status internally

    /**
     * Initialize favorites on mount
     */
    useEffect(() => {
        initializeFavorites();
    }, [initializeFavorites]);

    /**
     * Listen for authentication state changes via custom event
     * This is more reliable than polling isAuthenticated()
     */
    useEffect(() => {
        const handleAuthChange = (event) => {
            console.log('Auth state changed event received in FavoritesContext');
            // Reinitialize favorites after authentication change
            setTimeout(() => {
                initializeFavorites();
            }, 100); // Small delay to ensure tokens are fully stored
        };

        window.addEventListener('authStateChanged', handleAuthChange);

        return () => {
            window.removeEventListener('authStateChanged', handleAuthChange);
        };
    }, [initializeFavorites]);

    /**
     * Load full favorite books (for Favorites page)
     * @param {number} page - Page number (0-based)
     * @param {number} size - Number of items per page
     * @returns {Promise<{books: Array, totalElements: number, totalPages: number}>}
     */
    const loadFavoriteBooks = useCallback(async (page = 0, size = 100) => {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true });

        try {
            // Check authentication status dynamically instead of using stale closure value
            const isAuth = isAuthenticated();

            if (isAuth) {
                try {
                    // Fetch from server with pagination
                    const result = await fetchLikedBooks(page, size);
                    dispatch({ type: ACTIONS.SET_FAVORITE_BOOKS, payload: result.books });
                    return result; // Return full result including pagination info
                } catch (error) {
                    // If 401, user isn't actually authenticated - fallback to local
                    if (error.status === 401) {
                        console.log('Not authenticated (401), loading favorite books from local storage');
                        const localFavIds = localFavorites.get();

                        if (localFavIds.length > 0) {
                            const books = await getBooksByIds(localFavIds);
                            // Apply manual pagination for local favorites
                            const startIndex = page * size;
                            const endIndex = startIndex + size;
                            const paginatedBooks = books.slice(startIndex, endIndex);
                            const totalElements = books.length;
                            const totalPages = Math.ceil(totalElements / size);

                            dispatch({ type: ACTIONS.SET_FAVORITE_BOOKS, payload: paginatedBooks });
                            return { books: paginatedBooks, totalElements, totalPages };
                        } else {
                            dispatch({ type: ACTIONS.SET_FAVORITE_BOOKS, payload: [] });
                            return { books: [], totalElements: 0, totalPages: 0 };
                        }
                    } else {
                        // Re-throw other errors
                        throw error;
                    }
                }
            } else {
                // For non-authenticated users, fetch book details by IDs from localStorage
                const localFavIds = localFavorites.get();

                if (localFavIds.length > 0) {
                    // Fetch full book details for each ID
                    const books = await getBooksByIds(localFavIds);
                    // Apply manual pagination for local favorites
                    const startIndex = page * size;
                    const endIndex = startIndex + size;
                    const paginatedBooks = books.slice(startIndex, endIndex);
                    const totalElements = books.length;
                    const totalPages = Math.ceil(totalElements / size);

                    dispatch({ type: ACTIONS.SET_FAVORITE_BOOKS, payload: paginatedBooks });
                    return { books: paginatedBooks, totalElements, totalPages };
                } else {
                    dispatch({ type: ACTIONS.SET_FAVORITE_BOOKS, payload: [] });
                    return { books: [], totalElements: 0, totalPages: 0 };
                }
            }
        } catch (error) {
            console.error('Error loading favorite books:', error);
            dispatch({ type: ACTIONS.SET_ERROR, payload: error.message });
            return { books: [], totalElements: 0, totalPages: 0 };
        }
    }, []); // Removed authenticated from deps - now checks dynamically

    /**
     * Toggle favorite for a book
     */
    const toggleFavorite = async (bookId) => {
        try {
            // Check authentication status dynamically
            const isAuth = isAuthenticated();

            if (isAuth) {
                // API call for authenticated users
                const response = await apiToggleFavorite(bookId);

                if (response.isLiked) {
                    dispatch({ type: ACTIONS.ADD_FAVORITE, payload: bookId });
                } else {
                    dispatch({ type: ACTIONS.REMOVE_FAVORITE, payload: bookId });
                }

                return response.isLiked;
            } else {
                // Local storage for non-authenticated users
                const { favorites, isLiked } = localFavorites.toggle(bookId);
                dispatch({ type: ACTIONS.SET_FAVORITES, payload: favorites });

                return isLiked;
            }
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
        if (isFavorited(bookId)) {
            return; // Already favorited
        }

        return toggleFavorite(bookId);
    };

    /**
     * Remove a book from favorites
     */
    const removeFavorite = async (bookId) => {
        if (!isFavorited(bookId)) {
            return; // Not favorited
        }

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
     * Clear all favorites (use with caution)
     */
    const clearAllFavorites = () => {
        localFavorites.clear();
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
