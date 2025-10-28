import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';

const PackCard = ({
    id,
    title,
    description,
    originalPrice,
    packPrice,
    packImage,
    books = [],
    onAddToCart
}) => {
    const { t } = useTranslation();
    const [imageError, setImageError] = useState(false);

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(id);
        }
    };

    const savings = originalPrice - packPrice;
    const savingsPercentage = Math.round((savings / originalPrice) * 100);

    // Create composite image from books if packImage is not available
    const renderPackImage = () => {
        if (packImage && !imageError) {
            return (
                <img
                    src={packImage}
                    alt={title}
                    onError={() => setImageError(true)}
                    className="w-full h-full object-cover rounded-lg"
                />
            );
        }

        // Composite image from first 3-4 books
        const displayBooks = books.slice(0, 4);
        const gridClass = displayBooks.length === 1 ? 'grid-cols-1' :
            displayBooks.length === 2 ? 'grid-cols-2' :
                displayBooks.length === 3 ? 'grid-cols-3' : 'grid-cols-2';

        return (
            <div className={`w-full h-full grid ${gridClass} gap-1 p-2 bg-gray-100 rounded-lg`}>
                {displayBooks.map((book, index) => (
                    <div key={index} className="relative overflow-hidden rounded">
                        <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group w-full">
            <div className="flex flex-col md:flex-row gap-4 p-4 md:p-6">
                {/* Pack Image - Left Side */}
                <div className="w-full md:w-64 lg:w-72 flex-shrink-0">
                    <div className="relative w-full aspect-square md:aspect-[3/4] overflow-hidden rounded-lg bg-gray-50">
                        {renderPackImage()}

                        {/* Savings Badge */}
                        {savings > 0 && (
                            <div className="absolute top-2 left-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
                                -{savingsPercentage}%
                            </div>
                        )}
                    </div>
                </div>

                {/* Pack Details - Right Side */}
                <div className="flex-1 flex flex-col justify-between min-w-0">
                    {/* Title and Description */}
                    <div className="space-y-3">
                        <h3 className="text-xl md:text-2xl font-bold text-[#00417a] leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
                            {title}
                        </h3>

                        {description && (
                            <p className="text-gray-600 text-sm md:text-base line-clamp-2 md:line-clamp-3">
                                {description}
                            </p>
                        )}

                        {/* Books List */}
                        <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                                {t('packCard.booksIncluded')}:
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {books.map((book, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 hover:bg-gray-100 transition-colors"
                                    >
                                        {/* Book thumbnail */}
                                        <div className="w-10 h-14 flex-shrink-0 rounded overflow-hidden bg-white shadow-sm">
                                            <img
                                                src={book.coverImage}
                                                alt={book.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        {/* Book info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 truncate">
                                                {book.title}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {book.author}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Price and Add to Cart Button */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-4 pt-4 border-t border-gray-200">
                        {/* Prices */}
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-3">
                                <span className="text-2xl md:text-3xl font-bold text-[#00417a]">
                                    {packPrice}
                                    <span className="text-sm md:text-base font-bold ml-1">
                                        {t('packCard.currency')}
                                    </span>
                                </span>
                                {originalPrice > packPrice && (
                                    <span className="text-lg text-gray-400 line-through">
                                        {originalPrice} {t('packCard.currency')}
                                    </span>
                                )}
                            </div>
                            {savings > 0 && (
                                <p className="text-sm text-green-600 font-semibold">
                                    {t('packCard.save')} {savings} {t('packCard.currency')}
                                </p>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCartClick}
                            className="bg-[#EE0027] hover:bg-[#d4183d] text-white px-6 py-3 rounded-lg transition-colors font-semibold text-sm md:text-base flex items-center gap-2 shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span>{t('packCard.addToCart')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e0;
                    border-radius: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #a0aec0;
                }
            `}</style>
        </div>
    );
};

export default PackCard;
