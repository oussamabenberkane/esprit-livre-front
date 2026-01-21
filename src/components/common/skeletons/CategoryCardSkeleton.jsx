import React from 'react';

const CategoryCardSkeleton = () => {
    return (
        <div className="relative cat-card-size bg-gray-200 rounded-[10px] overflow-hidden animate-pulse">
            {/* Gray background placeholder */}
            <div className="absolute inset-0 bg-gray-300" />

            {/* Blur overlay similar to actual card */}
            <div
                className="absolute inset-0 backdrop-blur-[0.5px] backdrop-filter flex items-center justify-center"
                style={{ backgroundColor: 'rgba(51, 47, 76, 0.15)' }}
            >
                {/* Title placeholder */}
                <div className="w-3/4 h-6 bg-gray-400 rounded-md opacity-50" />
            </div>
        </div>
    );
};

export default CategoryCardSkeleton;
