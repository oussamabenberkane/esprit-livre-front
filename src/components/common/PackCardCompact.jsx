import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, ShoppingCart, Package } from 'lucide-react';
import { getBookCoverUrl } from '../../utils/imageUtils';
import PackBooksPopup from './PackBooksPopup';

const PackCardCompact = ({
    id,
    title,
    originalPrice,
    packPrice,
    books = [],
    onAddToCart,
    onViewBooks,
}) => {
    const { t } = useTranslation();
    const [showPopup, setShowPopup] = useState(false);

    const savings = originalPrice - packPrice;
    const savingsPercent = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0;
    const bookCount = books.length;

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        if (onAddToCart) onAddToCart(id);
    };

    const handleViewBooks = (e) => {
        e.stopPropagation();
        if (onViewBooks) {
            onViewBooks(id);
        } else {
            setShowPopup(true);
        }
    };

    // Build book thumbnails — 1x2 for 2 books, 2x2 for 3+
    const renderThumbnails = () => {
        const display = books.slice(0, 4);

        if (bookCount === 2) {
            return (
                <div className="grid grid-cols-2 gap-[2px] w-full h-full">
                    {display.map((book, i) => (
                        <img
                            key={i}
                            src={book.coverImage || getBookCoverUrl(book.id)}
                            alt={book.title}
                            className="w-full h-full object-cover"
                        />
                    ))}
                </div>
            );
        }

        return (
            <div className="grid grid-cols-2 grid-rows-2 gap-[2px] w-full h-full">
                {display.map((book, i) => (
                    <img
                        key={i}
                        src={book.coverImage || getBookCoverUrl(book.id)}
                        alt={book.title}
                        className="w-full h-full object-cover"
                    />
                ))}
                {/* Fill empty slots if fewer than 4 books */}
                {display.length === 3 && (
                    <div className="w-full h-full bg-gray-100" />
                )}
            </div>
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group w-full book-card-height flex flex-col relative">
                {/* Cover area — book thumbnail mosaic */}
                <div className="relative w-full flex items-center justify-center">
                    <div className="relative book-image-height w-full overflow-hidden">
                        {renderThumbnails()}

                        {/* Bottom gradient overlay */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>

                    {/* Pack badge — floating pill with icon, distinct from etiquette corner banners */}
                    <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white text-[#001a33] px-2 py-1 rounded-full text-[0.6rem] sm:text-[0.65rem] font-semibold shadow-md">
                        <Package className="w-2.5 h-2.5 flex-shrink-0" />
                        <span>Pack · {bookCount} {bookCount <= 1 ? 'livre' : 'livres'}</span>
                    </div>

                    {/* Eye button — centered on image */}
                    <button
                        onClick={handleViewBooks}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 bg-[#00417a]/70 hover:bg-[#00417a]/90 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 opacity-0 group-hover:opacity-100 z-10"
                        aria-label={t('packCard.viewAllBooks')}
                    >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </button>
                </div>

                {/* Info area */}
                <div className="px-fluid-sm mt-fluid-sm sm:px-fluid-sm pb-14 sm:pb-18 relative flex flex-col gap-fluid-xs sm:gap-fluid-xs md:gap-fluid-sm">
                    {/* Title */}
                    <h3 className="font-semibold text-[#00417a] leading-tight text-fluid-h3 line-clamp-2">
                        {title}
                    </h3>

                    {/* Book count subtitle */}
                    <p className="text-gray-500 text-fluid-small">
                        {bookCount} {bookCount <= 1 ? 'livre' : 'livres'}
                    </p>

                    {/* Price row */}
                    <div className="flex items-baseline gap-1.5 flex-wrap mt-auto">
                        <span className="text-fluid-price font-bold text-[#00417a]">
                            {packPrice} <span className="text-fluid-small font-bold">{t('packCard.currency')}</span>
                        </span>
                        {savings > 0 && (
                            <>
                                <span className="text-fluid-vsmall text-gray-400 line-through">
                                    {originalPrice}
                                </span>
                                <span className="text-[0.6rem] sm:text-[0.65rem] font-bold text-white bg-[#EE0027] px-1.5 py-0.5 rounded">
                                    -{savingsPercent}%
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Add to Cart — exact BookCard position & style */}
                <button
                    onClick={handleAddToCartClick}
                    className="bg-[#EE0027] absolute bottom-0 right-0 text-white rounded-tl-xl rounded-br-sm hover:bg-[#d4183d] active:scale-95 transition-all duration-200 button-card-size flex flex-col gap-1 md:gap-1.5 items-center justify-center flex-shrink-0 shadow-md px-2"
                >
                    <ShoppingCart className="hidden md:block w-4 h-4 lg:w-[18px] lg:h-[18px]" strokeWidth={2.25} />
                    <span className="text-[0.7rem] sm:text-[0.75rem] md:text-[0.72rem] lg:text-[0.78rem] font-semibold text-center leading-[1.15] tracking-tight">
                        {t('packCard.addToCart')}
                    </span>
                </button>
            </div>

            {/* PackBooksPopup — only if no external handler */}
            {!onViewBooks && (
                <PackBooksPopup
                    isOpen={showPopup}
                    onClose={() => setShowPopup(false)}
                    packTitle={title}
                    books={books}
                />
            )}
        </>
    );
};

export default PackCardCompact;
