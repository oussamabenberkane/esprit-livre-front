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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden group">
      {/* Book Cover Container */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <img 
          src={coverImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badge */}
        {badge && (
          <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold ${getBadgeStyles(badge.type)}`}>
            {badge.text}
          </div>
        )}

        {/* Favorite Button */}
        <button 
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors duration-200"
        >
          <Heart 
            className={`w-4 h-4 transition-colors duration-200 ${
              favorited ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>

        {/* Add to Cart Button (appears on hover) */}
        <div className="absolute bottom-2 left-2 right-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button 
            onClick={handleAddToCartClick}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors duration-200"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-sm font-medium">Ajouter au panier</span>
          </button>
        </div>
      </div>

      {/* Book Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2 hover:text-blue-600 transition-colors cursor-pointer">
          {title}
        </h3>
        
        {/* Author */}
        <p className="text-gray-600 text-sm mb-2">
          {author}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold text-gray-900">
            {price}€
          </span>
        </div>

        {/* Stock Status */}
        <div className="text-xs">
          <span className={`inline-flex items-center ${
            stockStatus.available ? 'text-green-600' : 'text-red-600'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-1 ${
              stockStatus.available ? 'bg-green-600' : 'bg-red-600'
            }`}></span>
            {stockStatus.text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default BookCard;