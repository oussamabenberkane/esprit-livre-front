import React from 'react';

const AuthorCardSkeleton = ({ size = 'fluid' }) => {
    // Size variants matching the AuthorComponent
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-40 h-40',
        fluid: 'author-card-size'
    };

    return (
        <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden animate-pulse`}>
            {/* Background placeholder */}
            <div className="absolute inset-0 bg-gray-300" />

            {/* Blur overlay similar to actual card */}
            <div
                className="absolute inset-0 backdrop-blur-[0.5px] backdrop-filter"
                style={{ backgroundColor: 'rgba(51, 47, 76, 0.15)' }}
            />

            {/* Name placeholder */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
                <div className="w-2/3 h-4 bg-gray-400 rounded opacity-50" />
            </div>
        </div>
    );
};

export default AuthorCardSkeleton;
