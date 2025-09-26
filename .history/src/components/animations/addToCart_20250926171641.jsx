import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

const AnimatedCartButton = ({ onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="absolute bottom-0 right-0">
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-20 h-12 bg-[#EE0027] text-white cursor-pointer py-1 px-1 rounded-tl-2xl flex items-center justify-center overflow-hidden relative"
        whileHover={{ backgroundColor: "#d4183d" }}
        transition={{ duration: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {!isHovered ? (
            <motion.span
              key="text"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-medium text-center leading-tight"
            >
              Ajouter<br />au panier
            </motion.span>
          ) : (
            <motion.div
              key="icon"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-center"
            >
              <ShoppingCart className="w-6 h-6 flex-shrink-0" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

// Example usage in your BookCard component
const ExampleBookCard = () => {
  const handleAddToCart = () => {
    console.log('Added to cart!');
  };

  return (
    <div className="relative w-64 h-96 bg-white rounded-2xl shadow-md">
      {/* Your other card content here */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-md mb-2">Book Title</h3>
        <p className="text-gray-600 text-sm mb-4">Author Name</p>
        
        <AnimatedCartButton onClick={handleAddToCart} />
      </div>
    </div>
  );
};

export default AnimatedCartButton;