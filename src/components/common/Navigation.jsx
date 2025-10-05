import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import SlideScroll from '../buttons/SlideScroll'; // Import your existing component

const ScrollNavigator = forwardRef(({
  children,
  itemsPerView = 3,
  dotSize = 12,
  activeDotSize = 16,
  dotColor = '#d1d5db',
  activeDotColor = '#3b82f6',
  showDots = true,
  showNavigationButtons = true, // New prop to control button visibility
  navigationButtonsPosition = 'top', // 'top', 'bottom', or 'sides'
  navigationButtonsClassName = '', // Allow custom styling for the SlideScroll component
  className = '',
  containerClassName = '',
  gap = 16,
  gapClass = '',
  onSetChange = () => { }
}, ref) => {
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);
  const scrollTimeout = useRef(null);

  // Convert children to array
  const childrenArray = React.Children.toArray(children);
  const totalItems = childrenArray.length;

  // Calculate number of sets - each set shows itemsPerView items fully
  const totalSets = Math.ceil(totalItems / itemsPerView);

  // Update scroll capabilities based on current position
  useEffect(() => {
    setCanScrollLeft(currentSetIndex > 0);
    setCanScrollRight(currentSetIndex < totalSets - 1);
  }, [currentSetIndex, totalSets]);

  // Expose navigation methods to parent component
  useImperativeHandle(ref, () => ({
    navigateToSet: (setIndex) => navigateToSet(setIndex),
    navigatePrevious: () => navigatePrevious(),
    navigateNext: () => navigateNext(),
    getCurrentSetIndex: () => currentSetIndex,
    getTotalSets: () => totalSets
  }));

  // Navigate to specific set index (WITHOUT LOOPING)
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

  // Navigate to previous set (NO LOOPING - stops at first set)
  const navigatePrevious = () => {
    if (currentSetIndex > 0) {
      const newIndex = currentSetIndex - 1;
      navigateToSet(newIndex);
    }
  };

  // Navigate to next set (NO LOOPING - stops at last set)
  const navigateNext = () => {
    if (currentSetIndex < totalSets - 1) {
      const newIndex = currentSetIndex + 1;
      navigateToSet(newIndex);
    }
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
  const visibleItemCount = itemsPerView + 0.5; // Show half of the next item
  const itemWidthPercentage = 100 / visibleItemCount;

  return (
    <div className={`relative w-full ${className}`}>
      {/* Navigation Buttons at Top */}
      {showNavigationButtons && navigationButtonsPosition === 'top' && totalSets > 1 && (
        <div className="flex justify-end mb-4">
          <SlideScroll
            onPrevious={navigatePrevious}
            onNext={navigateNext}
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            className={navigationButtonsClassName}
          />
        </div>
      )}

      {/* Main Content Area with Optional Side Buttons */}
      <div className={navigationButtonsPosition === 'sides' && showNavigationButtons && totalSets > 1 ? 'flex items-center gap-2' : ''}>

        {/* Left Side Button Area */}
        {navigationButtonsPosition === 'sides' && showNavigationButtons && totalSets > 1 && (
          <SlideScroll
            onPrevious={navigatePrevious}
            onNext={navigateNext}
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            className={navigationButtonsClassName}
          />
        )}

        {/* Scrollable Container */}
        <div className={`overflow-hidden flex-1 ${containerClassName}`}>
          <div
            ref={scrollContainerRef}
            className={`flex overflow-x-auto ${gapClass}`}
            style={{
              gap: gapClass ? undefined : `${gap}px`,
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
      </div>



      {/* Pagination Dots and Navigation Buttons on Same Line */}
      {totalSets > 1 && (showDots || showNavigationButtons) && (
        <div className="flex justify-between items-center mt-8 pr-8">
          {/* Dots on the left/center */}
          <div className="flex-1 flex justify-center items-center" style={{ gap: '8px' }}>
            {showDots && Array.from({ length: totalSets }, (_, setIndex) => (
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

          {/* Navigation buttons on the right */}
          {showNavigationButtons && (
            <SlideScroll
              onPrevious={navigatePrevious}
              onNext={navigateNext}
              canScrollLeft={canScrollLeft}
              canScrollRight={canScrollRight}
              className={navigationButtonsClassName}
            />
          )}
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