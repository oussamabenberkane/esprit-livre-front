import { useState, useCallback } from 'react';

/**
 * Persists filter state to sessionStorage so filters survive navigation.
 * Each page uses a unique storageKey so their filters are independent.
 */
export function useFilterPersistence(storageKey) {
    const [savedFilters] = useState(() => {
        try {
            const stored = sessionStorage.getItem(storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch {
            return null;
        }
    });

    const saveFilters = useCallback((filters) => {
        try {
            if (filters) {
                // Don't persist search text — it's ephemeral and shouldn't re-apply on the next visit
                const { search: _search, ...persistable } = filters;
                sessionStorage.setItem(storageKey, JSON.stringify(persistable));
            } else {
                sessionStorage.removeItem(storageKey);
            }
        } catch {
            // sessionStorage may not be available (private mode, etc.)
        }
    }, [storageKey]);

    return { savedFilters, saveFilters };
}

/** Returns true when a filter payload has at least one active filter */
export function hasActiveFilters(filters) {
    if (!filters) return false;
    return (
        (filters.categories && filters.categories.length > 0) ||
        (filters.authors && filters.authors.length > 0) ||
        (filters.languages && filters.languages.length > 0) ||
        (filters.minPrice > 0) ||
        (filters.maxPrice < 50000) ||
        !!filters.search
    );
}

/** Returns true when a filter payload has at least one persistable (non-search) filter */
export function hasPersistableFilters(filters) {
    if (!filters) return false;
    return (
        (filters.categories && filters.categories.length > 0) ||
        (filters.authors && filters.authors.length > 0) ||
        (filters.languages && filters.languages.length > 0) ||
        (filters.minPrice > 0) ||
        (filters.maxPrice < 50000)
    );
}
