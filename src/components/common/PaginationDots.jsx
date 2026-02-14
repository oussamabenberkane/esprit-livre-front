// src/components/common/PaginationDots.jsx
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PaginationDots = ({ totalDots = 5, currentIndex = 0, onDotClick, maxVisible = 9 }) => {
  const { visibleIndices, needsWindow } = useMemo(() => {
    if (totalDots <= maxVisible) {
      return {
        visibleIndices: [...Array(totalDots)].map((_, i) => i),
        needsWindow: false,
      };
    }

    const half = Math.floor(maxVisible / 2);
    let start = currentIndex - half;
    let end = start + maxVisible - 1;

    if (start < 0) {
      start = 0;
      end = maxVisible - 1;
    }
    if (end >= totalDots) {
      end = totalDots - 1;
      start = totalDots - maxVisible;
    }

    const indices = [];
    for (let i = start; i <= end; i++) indices.push(i);
    return { visibleIndices: indices, needsWindow: true };
  }, [totalDots, currentIndex, maxVisible]);

  const getDotStyle = (realIndex, windowPos) => {
    if (realIndex === currentIndex) {
      return { width: 32, height: 8 };
    }
    if (!needsWindow) {
      return { width: 8, height: 8 };
    }

    const hasItemsBefore = visibleIndices[0] > 0;
    const hasItemsAfter = visibleIndices[visibleIndices.length - 1] < totalDots - 1;

    if (windowPos === 0 && hasItemsBefore) return { width: 4, height: 4 };
    if (windowPos === 1 && hasItemsBefore) return { width: 6, height: 6 };
    if (windowPos === maxVisible - 1 && hasItemsAfter) return { width: 4, height: 4 };
    if (windowPos === maxVisible - 2 && hasItemsAfter) return { width: 6, height: 6 };

    return { width: 8, height: 8 };
  };

  return (
    <div className="flex items-center justify-center gap-1.5">
      <AnimatePresence initial={false}>
        {visibleIndices.map((realIndex, windowPos) => {
          const isActive = realIndex === currentIndex;
          const style = getDotStyle(realIndex, windowPos);

          return (
            <motion.button
              key={realIndex}
              layout
              className={`rounded-full cursor-pointer ${
                isActive ? 'bg-red-500 shadow-sm' : 'bg-gray-300'
              }`}
              onClick={() => onDotClick && onDotClick(realIndex)}
              aria-label={`Go to item ${realIndex + 1}`}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{
                opacity: 1,
                scale: 1,
                width: style.width,
                height: style.height,
                backgroundColor: isActive ? '#ef4444' : '#d1d5db',
              }}
              exit={{ opacity: 0, scale: 0.5 }}
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
      </AnimatePresence>
    </div>
  );
};

export default PaginationDots;