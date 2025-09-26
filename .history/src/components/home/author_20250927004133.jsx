import React from 'react';

const AuthorComponent = ({
    authorImage,
    authorName,
    size = 'md'
}) => {
    // Size variants
    const sizeClasses = {
        sm: 'w-16 h-16 text-xs',
        md: 'w-24 h-24 text-sm',
        lg: 'w-32 h-32 text-base',
        xl: 'w-40 h-40 text-lg'
    };

    return (
        <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer hover:scale-102 transition-transform duration-300`}>
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${authorImage})` }}
            />

            {/* Blur Mask Overlay */}
            <div
                className="absolute inset-0 backdrop-blur-[0.5px] backdrop-filter"
                style={{ backgroundColor: 'rgba(51, 47, 76, 0.15)' }}
            />

            {/* Author Name Text */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
                <span className="text-white font-semibold text-center leading-tight">
                    {authorName}
                </span>
            </div>
        </div>
    );
};


export default AuthorComponent;