import { API_BASE_URL } from '../services/apiConfig';

/**
 * Get the full URL for a book cover image
 * @param {number|string} bookId - The book ID
 * @returns {string} The full URL to the book cover image
 */
export const getBookCoverUrl = (bookId) => {
  if (!bookId) {
    return null;
  }
  return `${API_BASE_URL}/api/books/${bookId}/cover`;
};

/**
 * Get the full URL for a book pack cover image
 * @param {number|string} packId - The book pack ID
 * @returns {string} The full URL to the book pack cover image
 */
export const getBookPackCoverUrl = (packId) => {
  if (!packId) {
    return null;
  }
  return `${API_BASE_URL}/api/book-packs/${packId}/cover`;
};
