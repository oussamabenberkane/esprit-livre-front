import React, { useState } from 'react';
import { Heart, ShoppingCart } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';

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

    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${API_BASE_URL}${path}`;
    };

    return (
        <div className="bg-white rounded-lg shadow-lg hover:shadow-lg transition-shadow duration-300 overflow-hidden group w-full book-card-height flex flex-col relative">
            {/* Book Cover Container */}
            <div className="relative pt-fluid-sm pb-auto w-full flex items-center justify-center">
                <div className="relative book-image-height">
                    <img
                        src={getImageUrl(coverImage)}
                        alt={title}
                        className="w-full max-h-[95%] object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                </div>
                {/* Badge */}
                {badge && (
                    <div
                        className="absolute top-0 left-0 px-3 py-2 rounded-br-2xl text-fluid-tag font-semibold text-white"
                        style={{ backgroundColor: badge.colorHex || '#6B7280' }}
                    >
                        {badge.text}
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
            <div className="px-fluid-xs sm:px-fluid-sm pb-fluid-md relative flex flex-col gap-fluid-tiny sm:gap-fluid-xs md:gap-fluid-sm ">
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
                    <span className={`inline-flex items-center ${stockStatus.available ? 'text-green-600' : 'text-red-600'
                        }`}>
                        <span className={`w-2 h-2 rounded-full mr-1 ${stockStatus.available ? 'bg-green-600' : 'bg-red-600'
                            }`}></span>
                        {stockStatus.text}
                    </span>
                </div>

                {/* Price and Button Row */}
                <div className="flex items-end justify-between mt-auto">
                    {/* Price */}
                    <span className="text-fluid-small md:text-fluid-price font-bold text-[#00417a]">
                        {price} <span className="text-fluid-vsmall md:text-fluid-small font-bold">DZD</span>
                    </span>


                </div>



            </div>
            {/* Add to Cart Button - Now in Flow */}
            <button
                onClick={handleAddToCartClick}
                className="bg-[#EE0027] absolute bottom-0 mb-0 right-0 text-white px-4 py-3 rounded-tl-xl rounded-br-sm hover:bg-[#d4183d] transition-colors button-card-size flex items-center justify-center flex-shrink-0"
            >
                <span className="text-fluid-vsmall  font-semibold whitespace-nowrap">
                    Ajouter <br />au panier
                </span>
            </button>

        </div>

    );
};

export default BookCard;