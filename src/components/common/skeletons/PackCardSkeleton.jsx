import React from 'react';

const PackCardSkeleton = () => {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden w-full h-full flex flex-col animate-pulse">
            {/* Grid Layout: Left (Images) | Right (Details) */}
            <div className="grid grid-cols-[auto_1fr] gap-fluid-xs md:gap-fluid-sm p-fluid-xs md:p-fluid-sm flex-1 overflow-hidden">

                {/* LEFT SECTION - Book Images Placeholder */}
                <div className="relative" style={{ width: 'clamp(120px, 22vw, 160px)' }}>
                    {/* Book Thumbnails Container */}
                    <div className="rounded-md overflow-hidden bg-gray-200" style={{ aspectRatio: '2/3' }}>
                        <div className="grid grid-cols-2 gap-1 h-full">
                            {/* 4 thumbnail placeholders */}
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={index}
                                    className="relative overflow-hidden rounded-sm bg-gray-300"
                                />
                            ))}
                        </div>
                    </div>

                    {/* Savings Badge Placeholder */}
                    <div className="absolute -top-1 -left-1 bg-gray-300 px-2 py-0.5 rounded-br-md rounded-tl-md text-fluid-vsmall shadow-md z-10">
                        <div className="h-4 w-10 bg-gray-400 rounded" />
                    </div>
                </div>

                {/* RIGHT SECTION - Pack Details Placeholder */}
                <div className="flex flex-col justify-between gap-fluid-xxs min-w-0">

                    {/* Title Placeholder - 2 lines */}
                    <div className="space-y-2">
                        <div className="h-6 bg-gray-300 rounded w-full" />
                        <div className="h-6 bg-gray-300 rounded w-3/4" />
                    </div>

                    {/* Description Placeholder - 2 lines */}
                    <div className="space-y-1.5">
                        <div className="h-4 bg-gray-200 rounded w-full" />
                        <div className="h-4 bg-gray-200 rounded w-5/6" />
                    </div>

                    {/* Book Titles Tags Placeholder */}
                    <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1.5">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-6 bg-gray-200 rounded-md flex-shrink-0"
                                style={{ width: `${80 + (index * 20)}px` }}
                            />
                        ))}
                    </div>

                    {/* Price Section Placeholder */}
                    <div className="flex items-baseline gap-2 mt-auto">
                        <div className="h-8 bg-gray-300 rounded w-24" />
                        <div className="h-5 bg-gray-200 rounded w-16" />
                    </div>

                    {/* Add to Cart Button Placeholder */}
                    <div className="bg-gray-300 px-fluid-xs py-fluid-xxs rounded-md w-full mt-1">
                        <div className="h-5 bg-gray-400 rounded mx-auto w-32" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackCardSkeleton;
