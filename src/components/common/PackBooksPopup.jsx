import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

export default function PackBooksPopup({ isOpen, onClose, packTitle, books = [] }) {
    const { t } = useTranslation();

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

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop with blur and blue-grey tint */}
            <div
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
                onClick={onClose}
            />

            {/* Popup Container */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-fade-in-scale"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Section - Fixed */}
                    <div className="relative px-6 pt-6 pb-4 border-b border-gray-100 flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-gray-900 text-fluid-h2 pr-8">
                                {packTitle}
                            </h3>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                                aria-label={t('common.close')}
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                        <p className="text-gray-600 text-sm mt-1">
                            {books.length} {t('packCard.books')}
                        </p>
                    </div>

                    {/* Books Grid - Scrollable */}
                    <div className="px-6 py-5 overflow-y-auto flex-1">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {books.map((book, index) => (
                                <div key={index} className="flex flex-col gap-2">
                                    {/* Book Cover - Same aspect ratio as in PackCard thumbnails */}
                                    <div className="relative w-full aspect-[2/3] rounded-sm overflow-hidden bg-gray-100 shadow-md hover:shadow-lg transition-shadow">
                                        <img
                                            src={book.coverImage}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/400x600?text=No+Image';
                                            }}
                                        />
                                    </div>
                                    {/* Book Info */}
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-tight">
                                            {book.title}
                                        </p>
                                        <p className="text-xs text-gray-500 line-clamp-1">
                                            {book.author}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeInScale {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .animate-fade-in-scale {
                    animation: fadeInScale 0.2s ease-out;
                }
            `}</style>
        </>
    );
}
