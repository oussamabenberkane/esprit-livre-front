import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for progressive rendering of items
 * Items appear sequentially with a delay between each
 *
 * @param {Array} items - The array of items to render progressively
 * @param {boolean} isLoading - Whether data is still loading
 * @param {number} delayMs - Delay in milliseconds between each item appearing (default: 100ms)
 * @returns {Object} - { visibleItems, isRendering }
 */
const useProgressiveRender = (items, isLoading, delayMs = 100) => {
    const [visibleCount, setVisibleCount] = useState(0);
    const [isRendering, setIsRendering] = useState(false);
    const timeoutRef = useRef(null);
    const previousItemsLengthRef = useRef(0);

    useEffect(() => {
        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // If loading, reset visible count
        if (isLoading) {
            setVisibleCount(0);
            setIsRendering(false);
            return;
        }

        // If items just loaded (transitioned from loading to not loading)
        if (!isLoading && items.length > 0) {
            setIsRendering(true);

            // Start progressive rendering
            let currentIndex = 0;

            const showNextItem = () => {
                if (currentIndex < items.length) {
                    setVisibleCount(currentIndex + 1);
                    currentIndex++;
                    timeoutRef.current = setTimeout(showNextItem, delayMs);
                } else {
                    setIsRendering(false);
                }
            };

            // Start the sequence
            timeoutRef.current = setTimeout(showNextItem, delayMs);
        }

        // Cleanup
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [items.length, isLoading, delayMs]);

    // Update ref for next render
    useEffect(() => {
        previousItemsLengthRef.current = items.length;
    }, [items.length]);

    // Return visible items (slice of the original array)
    const visibleItems = items.slice(0, visibleCount);

    return {
        visibleItems,
        visibleCount,
        isRendering,
        totalItems: items.length
    };
};

export default useProgressiveRender;
