import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart } from 'lucide-react';
import { getLanguageCode, getFullLanguageName } from '../../data/booksData';
import { getBookCoverUrl } from '../../utils/imageUtils';

const BookCard = ({
    id,
    title,
    author,
    price,
    coverImage,
    badge = null,
    stockStatus = { available: true, text: "en stock" },
    language = null,
    stock,
    onAddToCart,
    onToggleFavorite,
    isFavorited = false
}) => {
    const { t } = useTranslation();
    const [favorited, setFavorited] = useState(isFavorited);
    // Get the cover image URL from the API endpoint
    const coverImageUrl = getBookCoverUrl(id);
    const navigate = useNavigate();

    // Determine if book is available based on stock
    const isAvailable = stock !== 0;
    console.log(`BookCard ${id} - Title: ${title}`)
    console.log('stockStatus:', stockStatus)
    console.log('stock prop:', stock)
    console.log('stock > 0:', stock > 0)

    const handleFavoriteClick = (e) => {
        e.stopPropagation(); // Prevent card click navigation
        setFavorited(!favorited);
        if (onToggleFavorite) {
            onToggleFavorite(id, !favorited);
        }
    };

    const handleAddToCartClick = (e) => {
        e.stopPropagation(); // Prevent card click navigation
        if (onAddToCart) {
            onAddToCart(id);
        }
    };

    const handleCardClick = () => {
        // Navigate with both URL param and state for robustness
        navigate(`/books/${id}`, {
            state: {
                book: {
                    id,
                    title,
                    author,
                    price,
                    coverImage,
                    badge,
                    stockStatus,
                    language,
                    stockQuantity: stock
                }
            }
        });
    };

    return (
        <div
            onClick={handleCardClick}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group w-full book-card-height flex flex-col relative cursor-pointer"
        >
            {/* Book Cover Container */}
            <div className="relative pt-fluid-sm pb-auto w-full flex items-center justify-center">
                <div className="relative book-image-height w-full px-2">
                    <img
                        src={coverImageUrl}
                        alt={title}
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />


                </div>
                {/* Badge */}
                {badge && isAvailable && (
                    <div
                        className="absolute top-0 left-0 px-3 py-2 rounded-br-2xl text-fluid-tag font-semibold text-white"
                        style={{ backgroundColor: badge.colorHex || '#6B7280' }}
                    >
                        {badge.text}
                    </div>
                )}
                {/* Preorder Badge when stock is 0 */}
                {!isAvailable && (
                    <div
                        className="absolute top-0 left-0 px-3 py-2 rounded-br-2xl text-fluid-tag font-semibold text-white"
                        style={{ backgroundColor: '#2563eb' }}
                    >
                        Preorder
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-0 right-1 md:top-2 md:right-3"
                >
                    <Heart
                        className={`w-6.5 h-6.5 transition-colors duration-200 ${favorited ? 'fill-red-500 text-red-500' : 'text-black hover:text-red-500'
                            }`}
                    />
                </button>


            </div>

            {/* Book Info */}
            <div className="px-fluid-xs mt-fluid-xs sm:px-fluid-sm pb-fluid-md relative flex flex-col gap-fluid-tiny sm:gap-fluid-xs md:gap-fluid-sm ">
                {/* Title */}
                <h3 className="font-bold text-[#00417a] leading-none sm:leading-normal text-fluid-h3 min-[450px]:text-fluid-h2 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                    {title}
                </h3>

                {/* Author */}
                <p className="text-gray-600 text-fluid-small mb-fluid-tiny sm:mb-fluid-xxs">
                    {author}
                </p>

                {/* Stock Status */}
                <div className="text-fluid-tag font-bold mb-auto">
                    <span className={`inline-flex items-center ${(stock !== null && stock !== undefined && stock > 0)
                        ? 'text-green-600'
                        : 'text-blue-600'
                        }`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${(stock !== null && stock !== undefined && stock > 0)
                            ? 'bg-green-600'
                            : 'bg-blue-600'
                            }`}></span>
                        {(stock !== null && stock !== undefined && stock > 0)
                            ? t('bookCard.stockStatus.inStock')
                            : t('bookCard.stockStatus.preorder')
                        }
                    </span>
                </div>

                {/* Price and Button Row */}
                <div className="flex items-end justify-between mt-auto">
                    {/* Price */}
                    <span className="text-fluid-small md:text-fluid-price font-bold text-[#00417a]">
                        {price} <span className="text-fluid-vsmall md:text-fluid-small font-bold">{t('bookCard.currency')}</span>
                    </span>


                </div>



            </div>
            {/* Add to Cart Button - Now in Flow */}
            <button
                onClick={handleAddToCartClick}
                className="bg-[#EE0027] absolute bottom-0 mb-0 right-0 text-white px-4 py-3 rounded-tl-xl rounded-br-sm hover:bg-[#d4183d] transition-colors button-card-size flex items-center justify-center flex-shrink-0"
            >
                <span className="text-fluid-vsmall font-semibold text-center leading-tight" style={{ whiteSpace: 'pre-line' }}>
                    {t('bookCard.addToCart')}
                </span>
            </button>

        </div>

    );
};

export default BookCard;