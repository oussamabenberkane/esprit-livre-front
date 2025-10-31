import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart } from 'lucide-react';
import PackBooksPopup from './PackBooksPopup';

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
    const [showAllBooksPopup, setShowAllBooksPopup] = useState(false);

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(id);
        }
    };

    const savings = originalPrice - packPrice;
    const savingsPercentage = Math.round((savings / originalPrice) * 100);
    const displayedBooks = books.slice(0, 4);
    const hasMoreBooks = books.length > 4;

    // Render book thumbnails with "See More" overlay on 4th book
    const renderBookThumbnails = () => {
        return (
            <div className="grid grid-cols-2 gap-1 h-full">
                {displayedBooks.map((book, index) => {
                    const isLastThumbnail = index === 3 && hasMoreBooks;
                    return (
                        <div
                            key={index}
                            className="relative overflow-hidden rounded-sm bg-gray-100 cursor-pointer"
                            onClick={isLastThumbnail ? (e) => {
                                e.stopPropagation();
                                setShowAllBooksPopup(true);
                            } : undefined}
                        >
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className={`w-full h-full object-cover ${isLastThumbnail ? 'blur-sm' : ''}`}
                            />
                            {isLastThumbnail && (
                                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                    <div className="text-white text-center">
                                        <p className="text-lg md:text-xl font-bold">+{books.length - 4}</p>
                                        <p className="text-xs md:text-sm font-medium mt-1">{t('packCard.seeMore')}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            {/* Pack Card */}
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden w-full h-full flex flex-col">
                {/* Grid Layout: Left (Images) | Right (Details) */}
                <div className="grid grid-cols-[auto_1fr] gap-fluid-xs md:gap-fluid-sm p-fluid-xs md:p-fluid-sm flex-1">

                    {/* LEFT SECTION - Book Images */}
                    <div className="relative" style={{ width: 'clamp(120px, 22vw, 160px)' }}>
                        {/* Book Thumbnails Container */}
                        <div className="rounded-md overflow-hidden bg-gray-50" style={{ aspectRatio: '2/3' }}>
                            {renderBookThumbnails()}
                        </div>

                        {/* Savings Badge */}
                        {savings > 0 && (
                            <div className="absolute -top-1 -left-1 bg-red-500 text-white px-2 py-0.5 rounded-br-md rounded-tl-md text-fluid-vsmall font-bold shadow-md z-10">
                                -{savingsPercentage}%
                            </div>
                        )}
                    </div>

                    {/* RIGHT SECTION - Pack Details */}
                    <div className="flex flex-col justify-between gap-fluid-xxs min-w-0">

                        {/* Title */}
                        <h3 className="text-fluid-h3 md:text-fluid-h2 font-bold text-[#00417a] leading-tight line-clamp-2">
                            {title}
                        </h3>

                        {/* Description */}
                        {description && (
                            <p className="text-fluid-vsmall md:text-fluid-small text-gray-600 line-clamp-2">
                                {description}
                            </p>
                        )}

                        {/* Book Titles as Scrollable Tags */}
                        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1.5">
                            {books.map((book, index) => (
                                <span
                                    key={index}
                                    className="text-fluid-vsmall md:text-fluid-small bg-blue-50 text-[#00417a] px-3 py-1 rounded-md whitespace-nowrap flex-shrink-0 font-medium"
                                >
                                    {book.title}
                                </span>
                            ))}
                        </div>

                        {/* Price Section */}
                        <div className="flex items-baseline gap-2 mt-auto">
                            <span className="text-fluid-h2 md:text-fluid-h1to2 font-bold text-[#00417a]">
                                {packPrice}
                                <span className="text-fluid-small font-bold ml-1">
                                    {t('packCard.currency')}
                                </span>
                            </span>
                            {originalPrice > packPrice && (
                                <span className="text-fluid-small text-gray-400 line-through">
                                    {originalPrice}
                                </span>
                            )}
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCartClick}
                            className="bg-[#EE0027] hover:bg-[#d4183d] text-white px-fluid-xs py-fluid-xxs rounded-md transition-colors font-semibold text-fluid-small flex items-center justify-center gap-1 shadow-md hover:shadow-lg w-full mt-1"
                        >
                            <ShoppingCart className="w-4 h-4" />
                            <span>{t('packCard.addToCart')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Pack Books Popup - Shows all books with improved styling */}
            <PackBooksPopup
                isOpen={showAllBooksPopup}
                onClose={() => setShowAllBooksPopup(false)}
                packTitle={title}
                books={books}
            />
        </>
    );
};

export default PackCard;
