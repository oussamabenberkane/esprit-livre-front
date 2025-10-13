import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, X } from 'lucide-react';

export default function CartConfirmationPopup({
    isOpen,
    onClose,
    book
}) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleViewDetails = () => {
        navigate(`/books/${book.id}`);
        onClose(); // Close the popup after navigation
    };

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
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in-scale"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Section */}
                    <div className="relative px-6 pt-fluid-xl pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                    <ShoppingCart className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-fluid-h2 lg:text-fluid-lg">
                                Élément ajouté au panier
                            </h3>
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Fermer"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Book Details Section */}
                    <div className="px-6 py-5">
                        <div className="flex gap-4">
                            {/* Book Cover */}
                            <div className="flex-shrink-0">
                                <img
                                    src={book.coverImage}
                                    alt={book.title}
                                    className="w-20 h-28 object-cover rounded-lg shadow-md"
                                />
                            </div>

                            {/* Book Info */}
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                                <div>
                                    <h4 className="font-semibold text-gray-900 text-fluid-lg mb-1 line-clamp-2">
                                        {book.title}
                                    </h4>
                                    <p className="text-gray-600 text-sm mb-2">
                                        {book.author}
                                    </p>
                                    <button
                                        onClick={handleViewDetails}
                                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                                    >
                                        <h1 className="text-fluid-medium">Détails du livre</h1>
                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="flex-shrink-0 text-right">
                                <p className="font-bold text-gray-900 text-fluid-lg">
                                    {book.price}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    DZD
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 pb-6 flex gap-fluid-xl md:gap-fluid-xl">
                        <button
                            onClick={() => {
                                navigate('/cart');
                                onClose();
                            }}
                            className="flex-1 bg-[#1E40AF] hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <h1 className="text-fluid-small">Voir le panier</h1>
                        </button>
                        <button
                            onClick={() => {
                                // Remove from cart
                                console.log('Remove from cart');
                                onClose();
                            }}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-fluid-tiny px-fluid-sm rounded-lg transition-colors"
                        >
                            <h1 className="text-fluid-medium">Retirer</h1>
                        </button>
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