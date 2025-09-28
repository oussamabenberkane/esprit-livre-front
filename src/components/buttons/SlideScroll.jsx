import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SlideScroll = ({
  onPrevious,
  onNext,
  canScrollLeft = false,
  canScrollRight = true,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Left/Previous Button */}
      <button
        onClick={onPrevious}
        disabled={!canScrollLeft}
        className={`
          w-8 h-8
          rounded-md
          border
          flex
          items-center
          justify-center
          transition-all
          duration-200
          ${canScrollLeft
            ? 'border-gray-400 text-gray-700 hover:border-gray-600 hover:text-gray-900 cursor-pointer'
            : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }
        `}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Right/Next Button */}
      <button
        onClick={onNext}
        disabled={!canScrollRight}
        className={`
          w-8 h-8
          rounded-md
          border
          flex
          items-center
          justify-center
          transition-all
          duration-200
          ${canScrollRight
            ? 'border-gray-400 text-gray-700 hover:border-gray-600 hover:text-gray-900 cursor-pointer'
            : 'border-gray-200 text-gray-300 cursor-not-allowed'
          }
        `}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default SlideScroll;