import React from 'react';

const BookCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden w-full book-card-height flex flex-col relative animate-pulse">
            {/* Book Cover Container */}
            <div className="relative pt-fluid-sm pb-auto w-full flex items-center justify-center">
                <div className="relative book-image-height w-full px-2">
                    {/* Image placeholder */}
                    <div className="w-full h-full bg-gray-300 rounded-md" />
                </div>

                {/* Favorite button placeholder */}
                <div className="absolute top-0 right-1 md:top-2 md:right-3">
                    <div className="w-6.5 h-6.5 bg-gray-300 rounded-full" />
                </div>
            </div>

            {/* Book Info */}
            <div className="px-fluid-xs mt-fluid-xs sm:px-fluid-sm pb-fluid-md relative flex flex-col gap-fluid-tiny sm:gap-fluid-xs md:gap-fluid-sm">
                {/* Title placeholder - 2 lines */}
                <div className="space-y-2">
                    <div className="h-5 bg-gray-300 rounded w-full" />
                    <div className="h-5 bg-gray-300 rounded w-3/4" />
                </div>

                {/* Author placeholder */}
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-fluid-tiny sm:mb-fluid-xxs" />

                {/* Stock status placeholder */}
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-auto" />

                {/* Price placeholder */}
                <div className="flex items-end justify-between mt-auto">
                    <div className="h-6 bg-gray-300 rounded w-1/4" />
                </div>
            </div>

            {/* Add to Cart Button placeholder */}
            <div className="absolute bottom-0 mb-0 right-0 bg-gray-300 px-4 py-3 rounded-tl-xl rounded-br-sm button-card-size flex items-center justify-center flex-shrink-0">
                <div className="h-4 bg-gray-400 rounded w-12" />
            </div>
        </div>
    );
};

export default BookCardSkeleton;
