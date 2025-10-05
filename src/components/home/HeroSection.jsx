import React, { useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = ({
    images = [],
    className = '',
    currentSlide = 0,
    onSlideChange
}) => {
    const scrollContainerRef = useRef(null);

    const scroll = (direction) => {
        const container = scrollContainerRef.current;
        if (container) {
            const scrollAmount = container.offsetWidth;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Listen to scroll events and update active slide
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container || !onSlideChange) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;
            const slideWidth = container.offsetWidth;

            // Edge detection
            if (scrollLeft >= maxScroll - 5) {
                onSlideChange(images.length - 1);
            } else if (scrollLeft <= 5) {
                onSlideChange(0);
            } else {
                // Calculate centered slide
                const activeIndex = Math.round(scrollLeft / slideWidth);
                onSlideChange(Math.max(0, Math.min(activeIndex, images.length - 1)));
            }
        };

        container.addEventListener('scroll', handleScroll);
        handleScroll(); // Initial call

        return () => container.removeEventListener('scroll', handleScroll);
    }, [images.length, onSlideChange]);

    // Scroll to slide when currentSlide changes externally (e.g., dot click)
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const slideWidth = container.offsetWidth;
        const targetScroll = currentSlide * slideWidth;

        // Only scroll if we're not already there (avoid infinite loops)
        if (Math.abs(container.scrollLeft - targetScroll) > 10) {
            container.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    }, [currentSlide]);

    return (
        <div className="relative">
            {/* Scrollable Container */}
            <div 
                ref={scrollContainerRef}
                className={`flex gap-0 overflow-x-auto scrollbar-hide hero-height snap-x snap-mandatory ${className}`}
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="w-full hero-height flex-shrink-0 relative snap-center"
                    >
                        <img
                            src={image.src}
                            alt={image.alt || `Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        {image.button && (
                            <div className="absolute inset-0 flex items-end justify-start p-fluid-xs sm:p-fluid-md">
                                <button className="bg-white text-[#00417a] m-fluid-md px-fluid-xs py-fluid-xs sm:px-fluid-sm sm:py-fluid-sm text-fluid-small sm:text-fluid-body rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                    {image.button}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
                <>
                    {/* Left Arrow */}
                    <button
                        onClick={() => scroll('left')}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all z-10"
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                </>
            )}
        </div>
    );
};

export default HeroCarousel;