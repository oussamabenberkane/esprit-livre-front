import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { getLanguageCode } from '../../data/booksData';

export default function PackBooksPopup({ isOpen, onClose, packTitle, packDescription, books = [] }) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Prevent body scroll when popup is open
    useEffect(() => {
        if (isOpen) {
            // Save current scroll position
            const scrollY = window.scrollY;

            // Prevent scrolling
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            return () => {
                // Restore scrolling
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';

                // Restore scroll position
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    const handleBookClick = (bookId) => {
        // Navigate to book details page
        navigate(`/books/${bookId}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop with blur */}
            <div
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col animate-fade-in-scale"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Section - Fixed */}
                    <div className="relative px-5 sm:px-8 pt-6 pb-5 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-[#00417a]/5 to-transparent">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 pr-8">
                                <h2 className="font-['Poppins'] font-bold text-[#00417a] text-xl sm:text-2xl md:text-3xl mb-2 leading-tight">
                                    {packTitle}
                                </h2>
                                {packDescription && (
                                    <p className="text-gray-600 text-sm sm:text-base line-clamp-2 mb-2">
                                        {packDescription}
                                    </p>
                                )}
                                <div className="flex items-center gap-2 text-gray-500">
                                    <span className="text-sm font-medium">
                                        {books.length} {books.length === 1 ? t('packBooksPopup.book') : t('packBooksPopup.books')}
                                    </span>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors flex-shrink-0"
                                aria-label={t('packBooksPopup.close')}
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* Books Grid - Scrollable Content */}
                    <div className="px-4 sm:px-6 md:px-8 py-5 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                            {books.map((book, index) => (
                                <div
                                    key={book.id || index}
                                    className="bg-white rounded-lg border border-gray-200/80 hover:border-[#00417a]/60 hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden group cursor-pointer flex flex-col"
                                    onClick={() => handleBookClick(book.id)}
                                >
                                    {/* Book Cover - Smaller on mobile */}
                                    <div className="relative w-full aspect-[2/3] sm:aspect-[2/3] bg-gray-100 overflow-hidden">
                                        <img
                                            src={book.coverImage}
                                            alt={book.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/300x400?text=No+Image';
                                            }}
                                        />

                                        {/* Language Badge */}
                                        {book.language && (
                                            <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-semibold rounded shadow-sm">
                                                {getLanguageCode(book.language)}
                                            </div>
                                        )}

                                        {/* Gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                                    </div>

                                    {/* Book Info */}
                                    <div className="p-1.5 sm:p-2.5 flex flex-col gap-0.5 sm:gap-1 flex-1">
                                        {/* Title */}
                                        <h3 className="font-['Poppins'] font-semibold text-[#00417a] text-[10px] sm:text-sm leading-tight line-clamp-2 group-hover:text-[#003460] transition-colors min-h-[1.5rem] sm:min-h-[2.25rem]">
                                            {book.title}
                                        </h3>

                                        {/* Author */}
                                        <p className="text-gray-600 text-[9px] sm:text-xs line-clamp-1 mb-auto">
                                            {book.author}
                                        </p>

                                        {/* Price */}
                                        {book.price && (
                                            <div className="flex items-baseline justify-between mt-1 sm:mt-1.5 pt-1 sm:pt-1.5 border-t border-gray-100">
                                                <span className="font-['Poppins'] font-bold text-[#00417a] text-xs sm:text-base">
                                                    {book.price}
                                                    <span className="text-[9px] sm:text-xs font-semibold ml-0.5 sm:ml-1">
                                                        {t('packBooksPopup.currency')}
                                                    </span>
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer - Optional */}
                    <div className="px-5 sm:px-8 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0 rounded-b-2xl">
                        <p className="text-center text-sm text-gray-600">
                            {t('packBooksPopup.clickToViewDetails')}
                        </p>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fade-in-scale {
                    animation: fadeInScale 0.25s ease-out;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 8px;
                }

                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 4px;
                }

                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </>
    );
}
