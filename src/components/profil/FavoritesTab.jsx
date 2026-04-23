import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import BookCard from '../common/BookCard';
import CartConfirmationPopup from '../common/cartConfirmationPopup';
import { useFavorites } from '../../contexts/FavoritesContext';
import { getBookCoverUrl } from '../../utils/imageUtils';
import { useCart } from '../../contexts/CartContext';

export default function FavoritesTab() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const booksPerPage = 6;

  const {
    favoriteBooks,
    isLoading,
    error,
    loadFavoriteBooks,
  } = useFavorites();

  const [showCartPopup, setShowCartPopup] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  useEffect(() => {
    const load = async () => {
      const result = await loadFavoriteBooks(currentPage - 1, booksPerPage);
      if (result) {
        setTotalBooks(result.totalElements || 0);
        setTotalPages(result.totalPages || 0);
      }
    };
    load();
  }, [loadFavoriteBooks, currentPage, booksPerPage]);

  const handleAddToCart = async (bookId) => {
    await addToCart(bookId, 1);
    const book = favoriteBooks.find(b => b.id === bookId);
    if (book) {
      setSelectedBook(book);
      setShowCartPopup(true);
    }
  };

  const handleToggleFavorite = async () => {
    const result = await loadFavoriteBooks(currentPage - 1, booksPerPage);
    if (result) {
      setTotalBooks(result.totalElements || 0);
      setTotalPages(result.totalPages || 0);
      if (result.books?.length === 0 && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-[3px] border-[#EE0027] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">{t('common.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <Heart className="w-8 h-8 text-red-300" />
        </div>
        <p className="text-gray-500 text-sm text-center max-w-xs">{error}</p>
      </div>
    );
  }

  if (favoriteBooks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-red-50/60 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
          <Heart className="w-10 h-10 text-red-200" />
        </div>
        <h3 className="text-gray-700 font-semibold mb-1">{t('favorites.emptyTitle')}</h3>
        <p className="text-gray-400 text-sm text-center max-w-xs mb-6 leading-relaxed">{t('favorites.emptyMessage')}</p>
        <button
          onClick={() => navigate('/allbooks')}
          className="px-6 py-2.5 bg-[#EE0027] text-white rounded-xl text-sm font-semibold hover:bg-[#d4183d] transition-colors shadow-sm"
        >
          {t('favorites.discoverBooks')}
        </button>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Count */}
      <p className="text-xs text-gray-400 mb-4">
        {totalBooks === 1
          ? t('favorites.count', { count: totalBooks })
          : t('favorites.count_plural', { count: totalBooks })}
      </p>

      {/* Book grid */}
      <div className="flex flex-wrap gap-4 justify-center">
        {favoriteBooks.map((book, index) => {
          const etiquetteTag = book.tags?.find(tag => tag.type === 'ETIQUETTE');
          const badge = etiquetteTag ? {
            type: etiquetteTag.nameEn?.toLowerCase(),
            nameFr: etiquetteTag.nameFr,
            nameEn: etiquetteTag.nameEn,
            colorHex: etiquetteTag.colorHex,
          } : null;
          const stockStatus = {
            available: book.stockQuantity > 0,
            text: book.stockQuantity > 0
              ? t('bookCard.stockStatus.inStock')
              : t('bookCard.stockStatus.outOfStock'),
          };
          return (
            <div
              key={book.id}
              className="book-card-width animate-fade-in"
              style={{ animationDelay: `${index * 40}ms` }}
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
                preorderDate={book.preorderDate}
                onSale={book.onSale}
                discountType={book.discountType}
                discountValue={book.discountValue}
                onAddToCart={handleAddToCart}
                onToggleFavorite={handleToggleFavorite}
                isFavorited={true}
              />
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:border-[#EE0027] hover:text-[#EE0027] transition-colors shadow-sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-500 font-medium">
            {currentPage} <span className="text-gray-300">/</span> {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white border border-gray-200 text-gray-600 disabled:opacity-30 hover:border-[#EE0027] hover:text-[#EE0027] transition-colors shadow-sm"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Cart popup */}
      {selectedBook && (
        <CartConfirmationPopup
          isOpen={showCartPopup}
          onClose={() => setShowCartPopup(false)}
          book={{
            id: selectedBook.id,
            title: selectedBook.title,
            author: selectedBook.author.name,
            price: selectedBook.price,
            coverImage: getBookCoverUrl(selectedBook.id),
            language: selectedBook.language,
            description: selectedBook.description,
          }}
        />
      )}
    </div>
  );
}
