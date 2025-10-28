import { useEffect } from 'react';

/**
 * Custom hook to scroll to the top of the page when component mounts
 * @param {Object} options - Configuration options
 * @param {string} options.behavior - Scroll behavior: 'auto' or 'smooth' (default: 'auto')
 * @param {number} options.top - Top position to scroll to (default: 0)
 */
export function useScrollToTop({ behavior = 'auto', top = 0 } = {}) {
  useEffect(() => {
    window.scrollTo({
      top,
      behavior
    });
  }, [behavior, top]);
}
