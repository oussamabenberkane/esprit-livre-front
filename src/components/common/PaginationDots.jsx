// src/components/common/PaginationDots.jsx
import { motion } from 'framer-motion';

const PaginationDots = ({ totalDots = 5, currentIndex = 0, onDotClick }) => {
  // Create array of dots - one for each scrollable element
  const dots = [...Array(totalDots)];

  return (
    <div className="flex items-center justify-center gap-1.5">
      {dots.map((_, index) => {
        const isActive = index === currentIndex;

        return (
          <motion.button
            key={index}
            className={`h-2 rounded-full cursor-pointer ${
              isActive ? 'bg-red-500 shadow-sm' : 'bg-gray-300'
            }`}
            onClick={() => onDotClick && onDotClick(index)}
            aria-label={`Go to item ${index + 1}`}
            animate={{
              width: isActive ? 32 : 8,
              backgroundColor: isActive ? '#ef4444' : '#d1d5db',
            }}
            whileHover={{
              backgroundColor: isActive ? '#ef4444' : '#9ca3af',
              scale: 1.1,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 20,
            }}
          />
        );
      })}
    </div>
  );
};

export default PaginationDots;