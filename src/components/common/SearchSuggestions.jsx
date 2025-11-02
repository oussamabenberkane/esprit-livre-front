import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Book, Search, User, Tag } from 'lucide-react';

const SearchSuggestions = ({ suggestions, isLoading, query, onClose }) => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    // Don't render if no query or closed
    if (!query || query.trim().length === 0) {
        return null;
    }

    const handleSuggestionClick = (suggestion) => {
        // Navigate based on suggestion type with ID and name
        if (suggestion.type === 'BOOK_TITLE') {
            // Search for the book title directly
            navigate(`/allbooks?search=${encodeURIComponent(suggestion.suggestion)}&searchType=title`);
        } else if (suggestion.type === 'AUTHOR') {
            // Filter by author ID and pass name for display
            navigate(`/allbooks?authorId=${suggestion.id}&authorName=${encodeURIComponent(suggestion.suggestion)}`);
        } else if (suggestion.type === 'CATEGORY') {
            // Filter by category ID and pass name for display
            navigate(`/allbooks?categoryId=${suggestion.id}&categoryName=${encodeURIComponent(suggestion.suggestion)}`);
        }
        onClose();
    };

    const handleViewAll = () => {
        navigate(`/allbooks?search=${encodeURIComponent(query)}`);
        onClose();
    };

    // Get icon based on suggestion type
    const getSuggestionIcon = (type) => {
        switch (type) {
            case 'BOOK_TITLE':
                return <Book className="w-4 h-4 text-blue-600" />;
            case 'AUTHOR':
                return <User className="w-4 h-4 text-green-600" />;
            case 'CATEGORY':
                return <Tag className="w-4 h-4 text-purple-600" />;
            default:
                return <Search className="w-4 h-4 text-gray-600" />;
        }
    };

    // Get type label based on suggestion type
    const getTypeLabel = (type) => {
        switch (type) {
            case 'BOOK_TITLE':
                return t('search.bookTitle', 'Book');
            case 'AUTHOR':
                return t('search.author', 'Author');
            case 'CATEGORY':
                return t('search.category', 'Category');
            default:
                return '';
        }
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
                        {suggestions.map((item, index) => (
                            <button
                                key={`${item.type}-${item.suggestion}-${index}`}
                                onClick={() => handleSuggestionClick(item)}
                                className="w-full px-4 py-2.5 hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
                            >
                                {/* Icon */}
                                <div className="flex-shrink-0">
                                    {getSuggestionIcon(item.type)}
                                </div>

                                {/* Suggestion Text */}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900 truncate">
                                        {item.suggestion}
                                    </p>
                                </div>

                                {/* Type Badge */}
                                <div className="flex-shrink-0">
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                        item.type === 'BOOK_TITLE' ? 'bg-blue-100 text-blue-700' :
                                        item.type === 'AUTHOR' ? 'bg-green-100 text-green-700' :
                                        item.type === 'CATEGORY' ? 'bg-purple-100 text-purple-700' :
                                        'bg-gray-100 text-gray-700'
                                    }`}>
                                        {getTypeLabel(item.type)}
                                    </span>
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
