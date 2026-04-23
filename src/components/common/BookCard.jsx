import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart, ShoppingCart } from 'lucide-react';
import { getLanguageCode, getFullLanguageName } from '../../data/booksData';
import { getBookCoverUrl } from '../../utils/imageUtils';
import { useFavorites } from '../../contexts/FavoritesContext';
import { isAuthenticated, saveRedirectUrl } from '../../services/authService';
import LoginPromptPopup from './LoginPromptPopup';

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
    preorderDate = null,
    onAddToCart,
    onToggleFavorite,
    isFavorited = false
}) => {
    const { t, i18n } = useTranslation();

    const formatPreorderDate = (dateStr) => {
        if (!dateStr) return null;
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return new Intl.DateTimeFormat(i18n.language === 'fr' ? 'fr-DZ' : 'en-US', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        }).format(date);
    };

    // Get badge text based on current language
    const getBadgeText = () => {
        if (!badge) return null;
        if (badge.nameFr || badge.nameEn) {
            return i18n.language === 'en' ? (badge.nameEn || badge.nameFr) : (badge.nameFr || badge.nameEn);
        }
        return badge.text; // Fallback for old-style badges
    };
    const { isFavorited: isBookFavorited, toggleFavorite } = useFavorites();
    const [favorited, setFavorited] = useState(isBookFavorited(id));
    const [showLoginPrompt, setShowLoginPrompt] = useState(false);
    // Get the cover image URL from the API endpoint
    const coverImageUrl = getBookCoverUrl(id);
    const navigate = useNavigate();

    // Update favorited state when context changes
    useEffect(() => {
        setFavorited(isBookFavorited(id));
    }, [id, isBookFavorited]);

    // Determine if book is available based on stock
    const isAvailable = stock !== 0;

    const handleFavoriteClick = async (e) => {
        e.stopPropagation(); // Prevent card click navigation

        if (!isAuthenticated()) {
            setShowLoginPrompt(true);
            return;
        }

        try {
            const isNowFavorited = await toggleFavorite(id);
            setFavorited(isNowFavorited);

            if (onToggleFavorite) {
                onToggleFavorite(id, isNowFavorited);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
        }
    };

    const handleLoginFromPrompt = () => {
        setShowLoginPrompt(false);
        saveRedirectUrl(window.location.pathname + window.location.search);
        navigate('/auth');
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
        <div className="relative">
            <div
                onClick={handleCardClick}
                className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group w-full book-card-height flex flex-col relative cursor-pointer"
            >
                {/* Book Cover Container */}
                <div className="relative w-full flex items-center justify-center">
                    <div className="relative book-image-height w-full px-2 pt-4 sm:pt-5">
                        <img
                            src={coverImageUrl}
                            alt={title}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />


                    </div>
                    {/* Badge */}
                    {badge && isAvailable && (
                        <div
                            className="absolute top-0 left-0 rounded-br-2xl text-white text-center flex items-center justify-center"
                            style={{
                                backgroundColor: badge.colorHex || '#6B7280',
                                minWidth: '5.5rem',
                                padding: '0.32rem 0.6rem',
                                fontSize: 'clamp(0.58rem, 0.85vw, 0.72rem)',
                                fontWeight: 800,
                                letterSpacing: '0.11em',
                                textTransform: 'uppercase',
                                textShadow: '0 1px 3px rgba(0,0,0,0.35)',
                                boxShadow: '2px 2px 10px rgba(0,0,0,0.18)',
                                lineHeight: 1.2,
                            }}
                        >
                            {getBadgeText()}
                        </div>
                    )}
                    {/* Preorder Badge when stock is 0 */}
                    {!isAvailable && (
                        <div
                            className="absolute top-0 left-0 rounded-br-2xl text-white text-center flex items-center justify-center"
                            style={{
                                backgroundColor: '#2563eb',
                                minWidth: '5.5rem',
                                padding: '0.32rem 0.6rem',
                                fontSize: 'clamp(0.58rem, 0.85vw, 0.72rem)',
                                fontWeight: 800,
                                letterSpacing: '0.11em',
                                textTransform: 'uppercase',
                                textShadow: '0 1px 3px rgba(0,0,0,0.35)',
                                boxShadow: '2px 2px 10px rgba(0,0,0,0.18)',
                                lineHeight: 1.2,
                            }}
                        >
                            {t('bookCard.stockStatus.preorder')}
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
                <div className="px-fluid-sm mt-fluid-sm sm:px-fluid-sm pb-14 sm:pb-18 relative flex flex-col gap-fluid-xs sm:gap-fluid-xs md:gap-fluid-sm">
                    {/* Title */}
                    <h3 className="font-semibold text-[#00417a] leading-tight text-fluid-h3 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                        {title}
                    </h3>

                    {/* Author */}
                    <p className="text-gray-600 text-fluid-small">
                        {author}
                    </p>

                    {/* Stock Status */}
                    <div className="text-fluid-small font-medium mb-auto">
                        <span className="inline-flex items-center text-green-600">
                            <span className="w-2 h-2 rounded-full mr-1 bg-green-600"></span>
                            {(stock !== null && stock !== undefined && stock > 0)
                                ? t('bookCard.stockStatus.inStock')
                                : t('bookCard.stockStatus.preorder')
                            }
                        </span>
                        {!(stock !== null && stock !== undefined && stock > 0) && formatPreorderDate(preorderDate) && (
                            <p className="text-gray-400 text-[0.65rem] mt-0.5 pl-3 leading-tight">
                                {t('bookCard.stockStatus.preorderDate', { date: formatPreorderDate(preorderDate) })}
                            </p>
                        )}
                    </div>

                    {/* Price and Button Row */}
                    <div className="flex items-end justify-between mt-auto">
                        {/* Price */}
                        <span className="text-fluid-price font-bold text-[#00417a]">
                            {price} <span className="text-fluid-small font-bold">{t('bookCard.currency')}</span>
                        </span>


                    </div>



                </div>
                {/* Add to Cart Button - Now in Flow */}
                <button
                    onClick={handleAddToCartClick}
                    className="bg-[#EE0027] absolute bottom-0 right-0 text-white rounded-tl-xl rounded-br-sm hover:bg-[#d4183d] active:scale-95 transition-all duration-200 button-card-size flex flex-col gap-1 md:gap-1.5 items-center justify-center flex-shrink-0 shadow-md px-2"
                >
                    <ShoppingCart className="hidden md:block w-4 h-4 lg:w-[18px] lg:h-[18px]" strokeWidth={2.25} />
                    <span className="text-[0.7rem] sm:text-[0.75rem] md:text-[0.72rem] lg:text-[0.78rem] font-semibold text-center leading-[1.15] tracking-tight">
                        {t('bookCard.addToCart')}
                    </span>
                </button>

            </div>

            {/* Login prompt for unauthenticated users — portaled to body to escape stacking contexts */}
            {showLoginPrompt && ReactDOM.createPortal(
                <LoginPromptPopup
                    isOpen={showLoginPrompt}
                    onClose={() => setShowLoginPrompt(false)}
                    onLoginClick={handleLoginFromPrompt}
                    alwaysFixed
                />,
                document.body
            )}
        </div>
    );
};

export default BookCard;
