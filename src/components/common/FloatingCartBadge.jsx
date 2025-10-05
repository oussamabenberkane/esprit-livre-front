import React from 'react';
import { ShoppingCart, X } from 'lucide-react';

export default function FloatingCartBadge({ 
  isVisible, 
  onDismiss,
  onGoToCart,
  itemCount = 1
}) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-6 right-6 z-30"
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <div className="bg-[#1E40AF] text-white rounded-lg shadow-2xl p-4 pr-12 relative max-w-sm">
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
          aria-label="Fermer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="flex items-center gap-3">
          <div className="bg-white/20 rounded-full p-2">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">
              {itemCount} {itemCount === 1 ? 'article ajouté' : 'articles ajoutés'}
            </p>
            <button
              onClick={onGoToCart}
              className="text-xs underline hover:no-underline mt-1"
            >
              Voir mon panier →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}