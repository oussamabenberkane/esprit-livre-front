import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart } from 'lucide-react';
import BookCard from '../common/BookCard';
import CartConfirmationPopup from '../common/cartConfirmationPopup';
import FloatingCartBadge from '../common/FloatingCartBadge';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import Navbar from '../common/Navbar';
import { getBookCoverUrl } from '../../utils/imageUtils';
import Footer from '../common/Footer';
import { isAuthenticated } from '../../services/authService';
import { useCart } from '../../contexts/CartContext';

export default function Favorites() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const location = useLocation();

  // Scroll to top when page loads
  useScrollToTop();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const booksPerPage = 5;

  // Favorites context
  const {
    favoriteBooks,
    isLoading,
    error,
    loadFavoriteBooks,
    toggleFavorite: toggleFavoriteContext
  } = useFavorites();

  // Cart popup state
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Track authentication status changes
  const isAuth = isAuthenticated();
  const prevAuthRef = useRef(isAuth);

  // Load favorite books with pagination
  useEffect(() => {
    const loadFavorites = async () => {
      // Check if auth status changed since last visit
      const currentAuth = isAuthenticated();
      if (currentAuth !== prevAuthRef.current) {
        console.log('Auth status changed on Favorites mount/navigation - reloading favorites');
        prevAuthRef.current = currentAuth;
      }

      // Load favorites with pagination - API uses 0-based indexing
      const result = await loadFavoriteBooks(currentPage - 1, booksPerPage);
      if (result) {
        setTotalBooks(result.totalElements || 0);
        setTotalPages(result.totalPages || 0);
      }
    };

    loadFavorites();
  }, [loadFavoriteBooks, location.pathname, currentPage, booksPerPage]); // Re-run when page changes

  // Listen for authentication state changes and reload favorites
  useEffect(() => {
    const handleAuthChange = async (event) => {
      console.log('Auth state changed event received on Favorites page');
      prevAuthRef.current = isAuthenticated();
      // Reload favorite books after authentication change
      setTimeout(async () => {
        const result = await loadFavoriteBooks(currentPage - 1, booksPerPage);
        if (result) {
          setTotalBooks(result.totalElements || 0);
          setTotalPages(result.totalPages || 0);
        }
      }, 100); // Small delay to ensure tokens are fully stored
    };

    window.addEventListener('authStateChanged', handleAuthChange);

    return () => {
      window.removeEventListener('authStateChanged', handleAuthChange);
    };
  }, [loadFavoriteBooks, currentPage, booksPerPage]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddToCart = async (bookId) => {
    console.log(`Added book ${bookId} to cart`);

    // Add to cart using CartContext
    await addToCart(bookId, 1);

    const book = favoriteBooks.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setShowCartPopup(true);
    }
  };

  const handleClosePopup = () => {
    setShowCartPopup(false);
  };

  const handleToggleFavorite = async (bookId, isFavorited) => {
    // BookCard already handles the toggle through context
    // We just need to reload the list to update the view
    console.log(`${isFavorited ? 'Added' : 'Removed'} book ${bookId} ${isFavorited ? 'to' : 'from'} favorites`);

    // Reload favorite books to update the list immediately
    // This ensures the book is removed from the view when unfavorited
    const result = await loadFavoriteBooks(currentPage - 1, booksPerPage);
    if (result) {
      setTotalBooks(result.totalElements || 0);
      setTotalPages(result.totalPages || 0);

      // If current page is now empty and we're not on page 1, go to previous page
      if (result.books.length === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    }
  };

  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <section className="w-full max-w-[100vw] overflow-x-hidden">
          <Navbar />
        </section>

        {/* Spacer for fixed navbar - larger on mobile for two-line navbar */}
        <div className="h-28 md:h-20"></div>

        {/* Header */}
        <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white pt-8 pb-6 px-4 shadow-md">
          <div className="max-w-6xl mx-auto">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">{t('favorites.back')}</span>
            </button>

            <div className="flex items-center gap-3">
              <Heart className="w-7 h-7" fill="currentColor" />
              <div>
                <h1 className="text-2xl">{t('favorites.title')}</h1>
                <p className="text-blue-100 text-sm">
                  {totalBooks === 1 ? t('favorites.count', { count: totalBooks }) : t('favorites.count_plural', { count: totalBooks })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full container-main px-fluid-md py-fluid-lg">
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">{t('common.loading')}</p>
            </div>
          ) : error ? (
            // Error State
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-xl text-gray-800 mb-2">{t('common.error')}</h2>
              <p className="text-gray-500 text-center max-w-md mb-6">
                {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : favoriteBooks.length > 0 ? (
            <div className="flex flex-wrap gap-fluid-md justify-center">
              {favoriteBooks.map((book, index) => {
                // Extract badge from tags (same logic as BookDetails.jsx)
                const etiquetteTag = book.tags?.find(tag => tag.type === "ETIQUETTE");
                const badge = etiquetteTag ? {
                  type: etiquetteTag.nameEn.toLowerCase(),
                  text: etiquetteTag.nameFr,
                  colorHex: etiquetteTag.colorHex
                } : null;

                const stockStatus = {
                  available: book.stockQuantity > 0,
                  text: book.stockQuantity > 0 ? t('bookCard.stockStatus.inStock') : t('bookCard.stockStatus.outOfStock')
                };

                return (
                  <div
                    key={book.id}
                    className="book-card-width animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <BookCard
                      id={book.id}
                      title={book.title}
                      author={book.author.name}
                      price={book.price}
                      coverImage={getBookCoverUrl(book.id)}
                      badge={badge}
                      stockStatus={stockStatus}
                      language={book.language}
                      stock={book.stockQuantity}
                      onAddToCart={handleAddToCart}
                      onToggleFavorite={handleToggleFavorite}
                      isFavorited={true}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-xl text-gray-800 mb-2">{t('favorites.emptyTitle')}</h2>
              <p className="text-gray-500 text-center max-w-md mb-6">
                {t('favorites.emptyMessage')}
              </p>
              <button
                onClick={() => navigate('/allbooks')}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                {t('favorites.discoverBooks')}
              </button>
            </div>
          )}

          {/* Bottom Navigation and Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-fluid-lg border-t border-gray-200 text-fluid-small">
              <div></div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-2">
                {/* Previous Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.max(1, prev - 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === 1}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                    }`}
                  aria-label="Previous page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Page Numbers */}
                <div className="flex gap-1">
                  {(() => {
                    const pageNumbers = []
                    const showEllipsisStart = currentPage > 3
                    const showEllipsisEnd = currentPage < totalPages - 2

                    // Always show first page
                    pageNumbers.push(
                      <button
                        key={1}
                        onClick={() => {
                          setCurrentPage(1)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
                          ? "bg-blue-600 text-white shadow-md"
                          : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                          }`}
                      >
                        1
                      </button>
                    )

                    // Show ellipsis after first page if needed
                    if (showEllipsisStart) {
                      pageNumbers.push(
                        <span key="ellipsis-start" className="flex items-center justify-center w-9 h-9 text-gray-400">
                          ...
                        </span>
                      )
                    }

                    // Show pages around current page
                    const startPage = Math.max(2, currentPage - 1)
                    const endPage = Math.min(totalPages - 1, currentPage + 1)

                    for (let i = startPage; i <= endPage; i++) {
                      pageNumbers.push(
                        <button
                          key={i}
                          onClick={() => {
                            setCurrentPage(i)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === i
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                            }`}
                        >
                          {i}
                        </button>
                      )
                    }

                    // Show ellipsis before last page if needed
                    if (showEllipsisEnd) {
                      pageNumbers.push(
                        <span key="ellipsis-end" className="flex items-center justify-center w-9 h-9 text-gray-400">
                          ...
                        </span>
                      )
                    }

                    // Always show last page if more than 1 page
                    if (totalPages > 1) {
                      pageNumbers.push(
                        <button
                          key={totalPages}
                          onClick={() => {
                            setCurrentPage(totalPages)
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === totalPages
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                            }`}
                        >
                          {totalPages}
                        </button>
                      )
                    }

                    return pageNumbers
                  })()}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => {
                    setCurrentPage(prev => Math.min(totalPages, prev + 1))
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  disabled={currentPage === totalPages}
                  className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === totalPages
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                    }`}
                  aria-label="Next page"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cart Confirmation Popup - Single instance at page level */}
        {selectedBook && (
          <CartConfirmationPopup
            isOpen={showCartPopup}
            onClose={handleClosePopup}
            book={{
              id: selectedBook.id,
              title: selectedBook.title,
              author: selectedBook.author.name,
              price: selectedBook.price,
              coverImage: getBookCoverUrl(selectedBook.id),
              language: selectedBook.language
            }}
          />
        )}

        {/* Floating Cart Badge - Self-managed, syncs with cart state */}
        <FloatingCartBadge
          onGoToCart={() => navigate('/cart')}
        />
      </div>
      <Footer />
    </main>
  );
}
