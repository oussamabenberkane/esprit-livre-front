import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Book, Search } from 'lucide-react';
import { getBookCoverUrl } from '../../utils/imageUtils';

const SearchSuggestions = ({ suggestions, isLoading, query, onClose }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Don't render if no query or closed
    if (!query || query.trim().length === 0) {
        return null;
    }

    const handleSuggestionClick = (bookId) => {
        navigate(`/books/${bookId}`);
        onClose();
    };

    const handleViewAll = () => {
        navigate(`/allbooks?search=${encodeURIComponent(query)}`);
        onClose();
    };

    return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg max-h-96 overflow-y-auto z-50 border border-gray-200">
            {isLoading ? (
                <div className="p-4 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>{t('common.loading')}</span>
                    </div>
                </div>
            ) : suggestions.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                    <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">{t('search.noResults')}</p>
                </div>
            ) : (
                <>
                    {/* Suggestions List */}
                    <div className="py-2">
                        {suggestions.map((book) => (
                            <button
                                key={book.id}
                                onClick={() => handleSuggestionClick(book.id)}
                                className="w-full px-4 py-3 hover:bg-gray-50 flex items-start gap-3 text-left transition-colors"
                            >
                                {/* Book Cover */}
                                <div className="flex-shrink-0 w-12 h-16 bg-gray-100 rounded overflow-hidden">
                                    {getBookCoverUrl(book.id) ? (
                                        <img
                                            src={getBookCoverUrl(book.id)}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Book className="w-6 h-6 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Book Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                                        {book.title}
                                    </h4>
                                    <p className="text-xs text-gray-600 truncate mt-0.5">
                                        {book.author?.name || t('bookCard.unknownAuthor')}
                                    </p>
                                    {book.price && (
                                        <p className="text-sm font-bold text-blue-600 mt-1">
                                            {book.price.toFixed(2)} DA
                                        </p>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* View All Results Button */}
                    <div className="border-t border-gray-200 p-2">
                        <button
                            onClick={handleViewAll}
                            className="w-full py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                            {t('search.viewAllResults', { query })}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default SearchSuggestions;
