import React, { useRef, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const HeroCarousel = ({
    images = [],
    className = '',
    currentSlide = 0,
    onSlideChange
}) => {
    const scrollContainerRef = useRef(null);
    const [rightArrowOffset, setRightArrowOffset] = useState(16); // Default 1rem in px

    // Calculate right arrow offset accounting for scrollbar
    useEffect(() => {
        const calculateRightOffset = () => {
            // Calculate scrollbar width
            const scrollbarW = window.innerWidth - document.documentElement.clientWidth;

            // Base padding based on screen width (matching Tailwind breakpoints)
            let basePadding = 16; // 1rem for mobile (right-4)
            if (window.innerWidth >= 768) {
                basePadding = 32; // 2rem for md (right-8)
            } else if (window.innerWidth >= 640) {
                basePadding = 24; // 1.5rem for sm (right-6)
            }

            // Add scrollbar width to maintain visual consistency
            setRightArrowOffset(basePadding + scrollbarW);
        };

        calculateRightOffset();
        window.addEventListener('resize', calculateRightOffset);

        return () => window.removeEventListener('resize', calculateRightOffset);
    }, []);

    const scroll = (direction) => {
        if (!onSlideChange) return;

        let newSlide;
        if (direction === 'left') {
            // Loop to last slide if at first slide
            newSlide = currentSlide === 0 ? images.length - 1 : currentSlide - 1;
        } else {
            // Loop to first slide if at last slide
            newSlide = currentSlide === images.length - 1 ? 0 : currentSlide + 1;
        }

        onSlideChange(newSlide);
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

    // Auto-scroll every 2 seconds with looping
    useEffect(() => {
        if (images.length <= 1 || !onSlideChange) return;

        const autoScrollInterval = setInterval(() => {
            const nextSlide = (currentSlide + 1) % images.length;
            onSlideChange(nextSlide);
        }, 2000);

        return () => clearInterval(autoScrollInterval);
    }, [currentSlide, images.length, onSlideChange]);

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
                        className="absolute left-4 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all z-10"
                        aria-label="Previous slide"
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={() => scroll('right')}
                        className="absolute top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all z-10"
                        style={{ right: `${rightArrowOffset}px` }}
                        aria-label="Next slide"
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-gray-800" />
                    </button>
                </>
            )}
        </div>
    );
};

export default HeroCarousel;