import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Heart } from 'lucide-react';
import BookCard from '../common/BookCard';
import CartConfirmationPopup from '../common/cartConfirmationPopup';
import FloatingCartBadge from '../common/FloatingCartBadge';
import { fetchLikedBooks } from '../../services/books.service';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import Navbar from '../common/Navbar';
import { getBookCoverUrl } from '../../utils/imageUtils';
import Footer from '../common/Footer';

export default function Favorites() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Scroll to top when page loads
  useScrollToTop();

  // State management
  const [favoriteBooks, setFavoriteBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cart popup state
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Floating cart badge state
  const [showFloatingBadge, setShowFloatingBadge] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    const loadFavoriteBooks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetchLikedBooks(0, 100); // Fetch up to 100 favorites
        setFavoriteBooks(response.books);
      } catch (err) {
        console.error('Error loading favorite books:', err);
        setError(err.message || 'Failed to load favorite books');
      } finally {
        setIsLoading(false);
      }
    };

    loadFavoriteBooks();
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddToCart = (bookId) => {
    console.log(`Added book ${bookId} to cart`);
    const book = favoriteBooks.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setShowCartPopup(true);
      // Increment cart count
      setCartItemCount(prev => prev + 1);
    }
  };

  const handleClosePopup = () => {
    setShowCartPopup(false);
    // Show floating badge after popup closes
    setShowFloatingBadge(true);
  };

  const handleToggleFavorite = (bookId, isFavorited) => {
    // When unfavoriting, remove from the list
    if (!isFavorited) {
      setFavoriteBooks(favoriteBooks.filter(book => book.id !== bookId));
      console.log(`Removed book ${bookId} from favorites`);
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
                {favoriteBooks.length === 1 ? t('favorites.count', { count: favoriteBooks.length }) : t('favorites.count_plural', { count: favoriteBooks.length })}
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
              const etiquetteTag = book.tags.find(tag => tag.type === "ETIQUETTE");
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
              onClick={handleBack}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {t('favorites.discoverBooks')}
            </button>
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

      {/* Floating Cart Badge - Shows after popup is dismissed */}
      <FloatingCartBadge
        isVisible={showFloatingBadge}
        onDismiss={() => setShowFloatingBadge(false)}
        onGoToCart={() => navigate('/cart')}
        itemCount={cartItemCount}
      />
      </div>
      <Footer />
    </main>
  );
}
