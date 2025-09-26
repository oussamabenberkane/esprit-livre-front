import React, { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';

const BookCard = ({
    id,
    title,
    author,
    price,
    coverImage,
    badge = null,
    stockStatus = { available: true, text: "en stock" },
    onAddToCart,
    onToggleFavorite,
    isFavorited = false
}) => {
    const [favorited, setFavorited] = useState(isFavorited);

    const handleFavoriteClick = () => {
        setFavorited(!favorited);
        if (onToggleFavorite) {
            onToggleFavorite(id, !favorited);
        }
    };

    const handleAddToCartClick = () => {
        if (onAddToCart) {
            onAddToCart(id);
        }
    };

    const getBadgeStyles = (badgeType) => {
        const styles = {
            "coup-de-coeur": "bg-red-500 text-white",
            "nouveaute": "bg-green-500 text-white",
            "precommande": "bg-blue-500 text-white",
            "most-sold": "bg-orange-500 text-white"
        };
        return styles[badgeType] || "bg-gray-500 text-white";
    };

    return (
        <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group w-70 h-115 relative">
            {/* Book Cover Container */}
            <div className="relative  w-full h-68 overflow-hidden flex items-end justify-center">
                <img
                    src={coverImage}
                    alt={title}
                    className="h-[90%] object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Badge */}
                {badge && (
                    <div className={`absolute top-0 opacity-80 left-0 px-3 py-2 rounded-br-2xl text-xs font-semibold ${getBadgeStyles(badge.type)}`}>
                        {badge.text}
                    </div>
                )}

                {/* Favorite Button */}
                <button
                    onClick={handleFavoriteClick}
                    className="absolute top-2 right-3"
                >
                    <Heart
                        className={`w-7 h-7 transition-colors duration-200 ${favorited ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
                            }`}
                    />
                </button>


            </div>

            {/* Book Info */}
            <div className="p-4">
                {/* Title */}
                <h3 className="font-bold text-gray-900 text-md mb-1 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
                    {title}
                </h3>

                {/* Author */}
                <p className="text-gray-600 text-sm mb-5">
                    {author}
                </p>

                {/* Stock Status */}
                <div className="text-xs font-bold">
                    <span className={`inline-flex items-center ${stockStatus.available ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${stockStatus.available ? 'bg-green-600' : 'bg-red-600'
                            }`}></span>
                        {stockStatus.text}
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-0">
                    <span className="text-lg font-bold text-gray-900">
                        {price}€
                    </span>
                </div>

                {/* Add to Cart Button (appears on hover) */}
                <div className="absolute bottom-0 right-0 transition-transform duration-300">
                    <button
                        onClick={handleAddToCartClick}
                        className="w-20 h-12 bg-[#EE0027] text-white cursor-pointer py-1 px-1 rounded-tl-2xl flex flex-col items-center justify-center hover:bg-[#d4183d]"
                    >
                        <span className="text-sm font-medium">Ajouter</span>
                        <ShoppingCart className="w-5 h-4 flex-shrink-0" />
                    </button>
                </div>



            </div>


        </div>

    );
};

export default BookCard;