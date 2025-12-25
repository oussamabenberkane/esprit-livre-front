import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    onAddToCart,
    onViewAllBooks
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [imageError, setImageError] = useState(false);
    const [showAllBooksPopup, setShowAllBooksPopup] = useState(false);
    const [showDescriptionModal, setShowDescriptionModal] = useState(false);
    const [isModalPinned, setIsModalPinned] = useState(false);
    const [isDescriptionTruncated, setIsDescriptionTruncated] = useState(false);
    const [modalPosition, setModalPosition] = useState({ centered: false, top: 0, left: 0, width: 0 });
    const descriptionRef = useRef(null);
    const modalRef = useRef(null);
    const hoverTimeoutRef = useRef(null);
    const descriptionContainerRef = useRef(null);

    // Check if description is truncated
    useEffect(() => {
        if (descriptionRef.current && description) {
            const element = descriptionRef.current;
            const isTruncated = element.scrollHeight > element.clientHeight;
            setIsDescriptionTruncated(isTruncated);
        }
    }, [description]);

    // Calculate modal position
    const calculateModalPosition = () => {
        if (!descriptionContainerRef.current) return;

        const descRect = descriptionContainerRef.current.getBoundingClientRect();
        const modalHeight = 200; // Estimated modal height
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - descRect.bottom;
        const marginTop = 8; // Space between description and modal

        // Check if there's enough space below
        const shouldCenter = spaceBelow < modalHeight + marginTop + 20;

        if (shouldCenter) {
            setModalPosition({ centered: true, top: 0, left: 0, width: 0 });
        } else {
            setModalPosition({
                centered: false,
                top: descRect.bottom + marginTop,
                left: descRect.left,
                width: Math.max(descRect.width, 280)
            });
        }
    };

    // Handle mouse enter with delay
    const handleMouseEnter = () => {
        if (!isDescriptionTruncated || isModalPinned) return;

        hoverTimeoutRef.current = setTimeout(() => {
            calculateModalPosition();
            setShowDescriptionModal(true);
        }, 200); // Short delay (200ms)
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
        // Clear timeout if user leaves before delay completes
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        // Only close if not pinned
        if (!isModalPinned) {
            setShowDescriptionModal(false);
        }
    };

    // Handle click to pin modal
    const handleDescriptionClick = (e) => {
        e.stopPropagation();
        if (!isDescriptionTruncated) return;

        // Clear any pending hover timeout
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        calculateModalPosition();
        setShowDescriptionModal(true);
        setIsModalPinned(true);
    };

    // Close modal
    const closeModal = (e) => {
        if (e) {
            e.stopPropagation();
        }
        setShowDescriptionModal(false);
        setIsModalPinned(false);
    };

    // Click outside to close when pinned
    useEffect(() => {
        if (!showDescriptionModal || !isModalPinned) return;

        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target) &&
                descriptionContainerRef.current && !descriptionContainerRef.current.contains(e.target)) {
                closeModal();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showDescriptionModal, isModalPinned]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
            }
        };
    }, []);

    const handleAddToCartClick = (e) => {
        e.stopPropagation();
        if (onAddToCart) {
            onAddToCart(id);
        }
    };

    const savings = originalPrice - packPrice;
    const savingsPercentage = Math.round((savings / originalPrice) * 100);

    // Handle book thumbnail click - navigate to book details
    const handleBookClick = (bookId, e) => {
        e.stopPropagation();
        navigate(`/books/${bookId}`);
    };

    // Handle Details button click
    const handleDetailsClick = (e) => {
        e.stopPropagation();
        if (onViewAllBooks) {
            onViewAllBooks();
        } else {
            setShowAllBooksPopup(true);
        }
    };

    // Render book thumbnails with Details button based on pack size
    const renderBookThumbnails = () => {
        const bookCount = books.length;

        // 2 books: show both in 2 columns × 1 row, Details button overlays 2nd book
        if (bookCount === 2) {
            return (
                <div className="flex gap-1 h-full">
                    {books.map((book, index) => (
                        <div
                            key={index}
                            className="relative overflow-hidden rounded-sm bg-gray-100 cursor-pointer w-full h-full"
                            onClick={(e) => handleBookClick(book.id, e)}
                        >
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                            {/* Details button overlays the 2nd (last) book */}
                            {index === 1 && (
                                <>
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                                    <button
                                        onClick={handleDetailsClick}
                                        className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 bg-[#00417a] hover:bg-[#003460] text-white px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-sm transition-all duration-200 shadow-sm hover:shadow-md text-[7px] sm:text-[8px] font-semibold cursor-pointer z-10 active:scale-95"
                                        aria-label={t('packCard.detailsButton')}
                                    >
                                        <span className="whitespace-nowrap">{t('packCard.detailsButton')}</span>
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        // 3 books: show all 3 in 2×2 grid, Details button in empty 4th cell
        if (bookCount === 3) {
            return (
                <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                    {books.map((book, index) => (
                        <div
                            key={index}
                            className="relative overflow-hidden rounded-sm bg-gray-100 cursor-pointer w-full h-full"
                            onClick={(e) => handleBookClick(book.id, e)}
                        >
                            <img
                                src={book.coverImage}
                                alt={book.title}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        </div>
                    ))}
                    {/* Empty 4th cell with Details button */}
                    <div className="relative overflow-hidden rounded-sm bg-gray-100 w-full h-full flex items-end justify-end p-0.5 sm:p-1">
                        <button
                            onClick={handleDetailsClick}
                            className="bg-[#00417a] hover:bg-[#003460] text-white px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-sm transition-all duration-200 shadow-sm hover:shadow-md text-[7px] sm:text-[8px] font-semibold cursor-pointer z-10 active:scale-95"
                            aria-label={t('packCard.detailsButton')}
                        >
                            <span className="whitespace-nowrap">{t('packCard.detailsButton')}</span>
                        </button>
                    </div>
                </div>
            );
        }

        // 4+ books: show first 4 books in 2×2 grid, Details button overlays 4th book
        const displayedBooks = books.slice(0, 4);
        return (
            <div className="grid grid-cols-2 grid-rows-2 gap-1 h-full">
                {displayedBooks.map((book, index) => (
                    <div
                        key={index}
                        className="relative overflow-hidden rounded-sm bg-gray-100 cursor-pointer w-full h-full"
                        onClick={(e) => handleBookClick(book.id, e)}
                    >
                        <img
                            src={book.coverImage}
                            alt={book.title}
                            className="absolute inset-0 w-full h-full object-cover"
                        />
                        {/* Details button overlays the 4th (last) book */}
                        {index === 3 && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
                                <button
                                    onClick={handleDetailsClick}
                                    className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 bg-[#00417a] hover:bg-[#003460] text-white px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-sm transition-all duration-200 shadow-sm hover:shadow-md text-[7px] sm:text-[8px] font-semibold cursor-pointer z-10 active:scale-95"
                                    aria-label={t('packCard.detailsButton')}
                                >
                                    <span className="whitespace-nowrap">{t('packCard.detailsButton')}</span>
                                </button>
                            </>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <>
            {/* Pack Card */}
            <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-visible w-full h-full flex flex-col">
                {/* Grid Layout: Left (Images) | Right (Details) */}
                <div className="grid grid-cols-[auto_1fr] gap-fluid-xs md:gap-fluid-sm p-fluid-xs md:p-fluid-sm flex-1 overflow-hidden">

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

                        {/* Description with Unified Modal */}
                        {description && (
                            <div
                                ref={descriptionContainerRef}
                                className="relative"
                                onMouseEnter={handleMouseEnter}
                                onMouseLeave={handleMouseLeave}
                            >
                                <p
                                    ref={descriptionRef}
                                    onClick={handleDescriptionClick}
                                    className={`text-fluid-h3 md:text-fluid-small lg:text-fluid-h3 text-gray-600 line-clamp-2 ${isDescriptionTruncated ? 'cursor-pointer' : ''}`}
                                >
                                    {description}
                                </p>
                            </div>
                        )}

                        {/* Unified Description Modal - Shows on hover and click */}
                        {isDescriptionTruncated && showDescriptionModal && (
                            <>
                                {/* Modal */}
                                <div
                                    ref={modalRef}
                                    className={`fixed bg-white rounded-2xl shadow-2xl p-5 z-[101] animate-slideUp`}
                                    style={{
                                        animation: 'slideUp 0.3s ease-out forwards',
                                        boxShadow: '0 20px 60px rgba(0, 65, 122, 0.2), 0 0 0 1px rgba(0, 65, 122, 0.1)',
                                        ...(modalPosition.centered ? {
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '92%',
                                            maxWidth: '28rem'
                                        } : {
                                            top: `${modalPosition.top}px`,
                                            left: `${modalPosition.left}px`,
                                            width: `${modalPosition.width}px`,
                                            maxWidth: '32rem'
                                        })
                                    }}
                                    onMouseEnter={() => {
                                        // Keep modal open when hovering over it
                                        if (hoverTimeoutRef.current) {
                                            clearTimeout(hoverTimeoutRef.current);
                                            hoverTimeoutRef.current = null;
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        // Close when leaving modal (if not pinned)
                                        if (!isModalPinned) {
                                            setShowDescriptionModal(false);
                                        }
                                    }}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="text-lg font-semibold text-[#00417a]">
                                            {t('packCard.descriptionModal')}
                                        </h4>
                                        {isModalPinned && (
                                            <button
                                                onClick={closeModal}
                                                className="text-gray-400 hover:text-gray-600 transition-colors duration-200 text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {description}
                                    </p>
                                </div>

                                {/* CSS Keyframes for animations */}
                                <style>{`
                                    @keyframes slideUp {
                                        from {
                                            opacity: 0;
                                            transform: ${modalPosition.centered
                                                ? 'translate(-50%, -48%) scale(0.95)'
                                                : 'translateY(-8px) scale(0.95)'};
                                        }
                                        to {
                                            opacity: 1;
                                            transform: ${modalPosition.centered
                                                ? 'translate(-50%, -50%) scale(1)'
                                                : 'translateY(0) scale(1)'};
                                        }
                                    }
                                `}</style>
                            </>
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

            {/* Pack Books Popup - Only show internal popup if no external handler provided */}
            {!onViewAllBooks && (
                <PackBooksPopup
                    isOpen={showAllBooksPopup}
                    onClose={() => setShowAllBooksPopup(false)}
                    packTitle={title}
                    packDescription={description}
                    books={books}
                />
            )}
        </>
    );
};

export default PackCard;
