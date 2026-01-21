import React from 'react';

/**
 * Skeleton loader for the main book details section
 * Matches the layout of BookDetails page with mobile and desktop variants
 */
const BookDetailsSkeleton = () => {
    return (
        <>
            {/* Mobile Layout (< md) - Vertical Stacking */}
            <div className="md:hidden container-main container-padding animate-pulse">
                {/* Back Button Placeholder */}
                <div className="flex items-center gap-2 mb-fluid-md">
                    <div className="w-5 h-5 bg-gray-300 rounded" />
                </div>

                {/* Book Title Placeholder */}
                <div className="space-y-2 mb-fluid-xxs">
                    <div className="h-8 bg-gray-300 rounded w-3/4" />
                    <div className="h-8 bg-gray-300 rounded w-1/2" />
                </div>

                {/* Author Placeholder */}
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-fluid-md" />

                {/* Book Image Placeholder */}
                <div className="flex justify-center mb-fluid-lg">
                    <div className="w-[200px] xs:w-[220px] aspect-[5/7] rounded-md shadow-[0px_5px_20px_0px_rgba(0,0,0,0.25)] bg-gray-300" />
                </div>

                {/* Book Information */}
                <div className="flex flex-col gap-fluid-sm">
                    {/* Price Card Placeholder */}
                    <div className="bg-neutral-100 rounded-md p-fluid-sm">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 space-y-2">
                                <div className="h-6 bg-gray-300 rounded w-full" />
                                <div className="h-6 bg-gray-300 rounded w-2/3" />
                            </div>
                            <div className="w-12 h-6 bg-gray-300 rounded flex-shrink-0" />
                        </div>
                        <div className="flex justify-end">
                            <div className="h-7 bg-gray-300 rounded w-24" />
                        </div>
                    </div>

                    {/* Details Card Placeholder */}
                    <div className="border border-[#c9cfd8] rounded-md p-fluid-sm">
                        {/* Seller */}
                        <div className="h-6 bg-gray-300 rounded w-1/2 mb-fluid-xxs" />

                        {/* Category */}
                        <div className="flex items-center gap-2 mb-fluid-sm">
                            <div className="h-5 bg-gray-200 rounded w-20" />
                            <div className="h-6 bg-gray-200 rounded w-24" />
                        </div>

                        {/* Stock Status */}
                        <div className="flex items-center gap-1 mb-fluid-xs">
                            <div className="w-3 h-3 bg-gray-300 rounded-full" />
                            <div className="h-4 bg-gray-300 rounded w-20" />
                        </div>

                        {/* Delivery Estimate */}
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-fluid-md" />

                        {/* Add to Cart Button Placeholder */}
                        <div className="w-[85%] mx-auto bg-gray-300 rounded-md py-2 px-4 h-10" />
                    </div>

                    {/* View Full Description Link Placeholder */}
                    <div className="flex items-center gap-1 w-full">
                        <div className="h-5 bg-gray-200 rounded flex-1" />
                        <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0" />
                    </div>
                </div>
            </div>

            {/* Tablet & Desktop Layout (>= md) - Horizontal Centered */}
            <div className="hidden md:block">
                <div className="container-main px-fluid-md animate-pulse">
                    {/* Back Button Placeholder */}
                    <div className="flex items-center gap-2 mb-fluid-md">
                        <div className="w-5 h-5 bg-gray-300 rounded" />
                    </div>

                    {/* Book Title Placeholder */}
                    <div className="space-y-2 mb-fluid-xxs">
                        <div className="h-9 bg-gray-300 rounded w-2/3" />
                        <div className="h-9 bg-gray-300 rounded w-1/2" />
                    </div>

                    {/* Author Placeholder */}
                    <div className="h-5 bg-gray-200 rounded w-1/4 mb-fluid-md" />

                    {/* Horizontal Layout - Centered */}
                    <div className="flex gap-fluid-lg items-stretch max-w-6xl mx-auto">
                        {/* Left Column - Book Image with Description Link */}
                        <div className="flex-shrink-0 flex flex-col justify-between w-[240px] lg:w-[280px]">
                            <div className="w-full aspect-[5/7] rounded-md shadow-[0px_5px_20px_0px_rgba(0,0,0,0.25)] bg-gray-300" />

                            {/* View Full Description Link Placeholder */}
                            <div className="flex items-center gap-1 w-full mt-fluid-sm">
                                <div className="h-6 bg-gray-200 rounded flex-1" />
                                <div className="w-3 h-3 bg-gray-200 rounded flex-shrink-0" />
                            </div>
                        </div>

                        {/* Right Column - Book Information */}
                        <div className="flex flex-col gap-fluid-sm flex-1 min-w-0">
                            {/* Price Card Placeholder */}
                            <div className="bg-neutral-100 rounded-md p-fluid-sm">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <div className="flex-1 space-y-2">
                                        <div className="h-6 bg-gray-300 rounded w-full" />
                                        <div className="h-6 bg-gray-300 rounded w-3/4" />
                                    </div>
                                    <div className="w-12 h-6 bg-gray-300 rounded flex-shrink-0" />
                                </div>
                                <div className="flex justify-end">
                                    <div className="h-7 bg-gray-300 rounded w-28" />
                                </div>
                            </div>

                            {/* Details Card - Extended to Match Image Height */}
                            <div className="border border-[#c9cfd8] rounded-md p-fluid-md flex-1 flex flex-col justify-between">
                                <div>
                                    {/* Seller */}
                                    <div className="h-6 bg-gray-300 rounded w-1/2 mb-fluid-xxs" />

                                    {/* Category */}
                                    <div className="flex items-center gap-2 mb-fluid-md">
                                        <div className="h-5 bg-gray-200 rounded w-20" />
                                        <div className="h-6 bg-gray-200 rounded w-28" />
                                    </div>

                                    {/* Stock Status */}
                                    <div className="flex items-center gap-1 mb-fluid-xxs">
                                        <div className="w-3 h-3 bg-gray-300 rounded-full" />
                                        <div className="h-4 bg-gray-300 rounded w-24" />
                                    </div>

                                    {/* Delivery Estimate */}
                                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-fluid-md" />
                                </div>

                                {/* Add to Cart Button Placeholder */}
                                <div className="w-[85%] mx-auto bg-gray-300 rounded-md py-2 px-4 h-10 mb-fluid-sm mt-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BookDetailsSkeleton;
