import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

const ScrollNavigator = forwardRef(({ 
  children,
  itemsPerView = 3,
  dotSize = 12,
  activeDotSize = 16,
  dotColor = '#d1d5db',
  activeDotColor = '#3b82f6',
  showDots = true,
  className = '',
  containerClassName = '',
  gap = 16,
  onSetChange = () => {}
}, ref) => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const scrollContainerRef = useRef(null);
  const scrollTimeout = useRef(null);

  // Convert children to array
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;
  
  // Calculate number of sets - each set shows itemsPerView items fully
  const totalSets = Math.ceil(totalItems / itemsPerView);

  // Expose navigation methods to parent component
  useImperativeHandle(ref, () => ({
    navigateToSet: (setIndex) => navigateToSet(setIndex),
    navigatePrevious: () => navigatePrevious(),
    navigateNext: () => navigateNext(),
    getCurrentSetIndex: () => currentSetIndex,
    getTotalSets: () => totalSets
  }));

  // Navigate to specific set index
  const navigateToSet = (setIndex) => {
    const clampedIndex = Math.max(0, Math.min(setIndex, totalSets - 1));
    setCurrentSetIndex(clampedIndex);
    scrollToSet(clampedIndex);
    onSetChange(clampedIndex);
  };

  // Scroll to specific set position
  const scrollToSet = (setIndex) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      // Calculate item width including gap
      const itemWidth = (container.scrollWidth - gap * (totalItems - 1)) / totalItems;
      const itemWithGap = itemWidth + gap;
      
      // Calculate scroll position based on set index
      const targetScrollLeft = setIndex * itemsPerView * itemWithGap;
      
      container.scrollTo({
        left: targetScrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // Navigate to previous set (with looping)
  const navigatePrevious = () => {
    const newIndex = currentSetIndex > 0 ? currentSetIndex - 1 : totalSets - 1;
    navigateToSet(newIndex);
  };

  // Navigate to next set (with looping)
  const navigateNext = () => {
    const newIndex = currentSetIndex < totalSets - 1 ? currentSetIndex + 1 : 0;
    navigateToSet(newIndex);
  };

  // Handle scroll events - detect which set we're on
  const handleScroll = () => {
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      
      // Calculate item width including gap
      const itemWidth = (container.scrollWidth - gap * (totalItems - 1)) / totalItems;
      const itemWithGap = itemWidth + gap;
      
      // Determine which set we're on based on scroll position
      const newSetIndex = Math.round(scrollLeft / (itemWithGap * itemsPerView));
      const clampedIndex = Math.max(0, Math.min(newSetIndex, totalSets - 1));

      if (clampedIndex !== currentSetIndex) {
        setCurrentSetIndex(clampedIndex);
        onSetChange(clampedIndex);
      }
    }, 150);
  };

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [currentSetIndex, totalSets, totalItems]);

  if (!childrenArray.length) {
    return <div className="text-gray-500 text-center py-8">No items to display</div>;
  }

  // Calculate visible width for items
  // We want to show itemsPerView items fully + a partial item
  const visibleItemCount = itemsPerView + 0.5; // Show half of the next item
  const itemWidthPercentage = 100 / visibleItemCount;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Scrollable Container */}
      <div className={`overflow-hidden ${containerClassName}`}>
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto"
          style={{
            gap: `${gap}px`,
            scrollBehavior: 'smooth',
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
            WebkitScrollbar: 'none'
          }}
        >
          {childrenArray.map((child, index) => {
            return (
              <div
                key={index}
                className="flex-shrink-0"
                style={{
                  width: `calc(${itemWidthPercentage}% - ${gap * (visibleItemCount - 1) / visibleItemCount}px)`
                }}
              >
                {child}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination Dots */}
      {showDots && totalSets > 1 && (
        <div className="flex justify-center items-center mt-4" style={{ gap: '8px' }}>
          {Array.from({ length: totalSets }, (_, setIndex) => (
            <button
              key={setIndex}
              onClick={() => navigateToSet(setIndex)}
              className="transition-all duration-300 rounded-full hover:opacity-80 focus:outline-none"
              style={{
                width: `${currentSetIndex === setIndex ? activeDotSize : dotSize}px`,
                height: `${currentSetIndex === setIndex ? activeDotSize : dotSize}px`,
                backgroundColor: currentSetIndex === setIndex ? activeDotColor : dotColor,
                transform: currentSetIndex === setIndex ? 'scale(1.1)' : 'scale(1)',
                border: 'none',
                padding: 0,
                cursor: 'pointer'
              }}
              aria-label={`Go to set ${setIndex + 1}`}
            />
          ))}
        </div>
      )}

      {/* Hide scrollbar styles */}
      <style>{`
        div::-webkit-scrollbar {
          display: none !important;
        }
      `}</style>
    </div>
  );
});

ScrollNavigator.displayName = 'ScrollNavigator';

export default ScrollNavigator;