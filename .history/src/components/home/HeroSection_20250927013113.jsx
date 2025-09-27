import React from 'react';

const HeroCarousel = ({
    images = [],
    currentIndex = 0,
    height = 'h-64',
    className = ''
}) => {
    return (
        <div className={`relative ${height} overflow-hidden ${className}`}>
            {/* Carousel Container */}
            <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="w-full h-full flex-shrink-0 relative"
                    >
                        {/* Background Image */}
                        <img
                            src={image.src}
                            alt={image.alt || `Slide ${index + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Optional Overlay */}
                        {image.overlay && (
                            <div
                                className="absolute inset-0"
                                style={{ backgroundColor: image.overlay }}
                            />
                        )}

                        {/* Optional Button Overlay */}
                        {image.button && (
                            <div className="absolute inset-0 flex items-end justify-center p-8">
                                <button className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                    {image.button}
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HeroCarousel;