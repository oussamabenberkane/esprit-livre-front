import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Heart } from 'lucide-react';
import BookCard from '../common/BookCard';
import CartConfirmationPopup from '../common/cartConfirmationPopup';
import FloatingCartBadge from '../common/FloatingCartBadge';
import { BOOKS_DATA } from '../../data/booksData';

export default function Favorites() {
  const navigate = useNavigate();

  // Filter books that are liked by the current user from BOOKS_DATA
  const [favoriteBooks, setFavoriteBooks] = useState([]);

  // Cart popup state
  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  // Floating cart badge state
  const [showFloatingBadge, setShowFloatingBadge] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);

  useEffect(() => {
    // In production, this would be an API call to fetch user's favorites
    // For now, filter books where isLikedByCurrentUser is true
    const likedBooks = BOOKS_DATA.filter(book => book.isLikedByCurrentUser);
    setFavoriteBooks(likedBooks);
  }, []);

  const handleBack = () => {
    console.log('Navigate back to profile');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white pt-8 pb-6 px-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </button>

          <div className="flex items-center gap-3">
            <Heart className="w-7 h-7" fill="currentColor" />
            <div>
              <h1 className="text-2xl">Mes Favoris</h1>
              <p className="text-blue-100 text-sm">
                {favoriteBooks.length} {favoriteBooks.length > 1 ? 'livres' : 'livre'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full container-main px-fluid-md py-fluid-lg">
        {favoriteBooks.length > 0 ? (
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
                text: book.stockQuantity > 0 ? "en stock" : "rupture de stock"
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
                    coverImage={book.coverImageUrl}
                    badge={badge}
                    stockStatus={stockStatus}
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
            <h2 className="text-xl text-gray-800 mb-2">Aucun favori</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Vous n'avez pas encore ajouté de livres à vos favoris
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Découvrir des livres
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
            coverImage: selectedBook.coverImageUrl
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
  );
}
