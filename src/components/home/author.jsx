import React from 'react';
import { getAuthorPictureUrl } from '../../utils/imageUtils';

const AuthorComponent = ({
    authorId,
    authorImage,
    authorName,
    size = 'fluid'
}) => {
    // Use authorId to generate image URL if provided, otherwise fall back to authorImage prop
    const imageUrl = authorId ? getAuthorPictureUrl(authorId) : authorImage;
    // Size variants
    const sizeClasses = {
        sm: 'w-16 h-16',
        md: 'w-24 h-24',
        lg: 'w-32 h-32',
        xl: 'w-40 h-40',
        fluid: 'author-card-size'
    };
    

    return (
        <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer hover:scale-102 transition-transform duration-200`}>
            {/* Background Image */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${imageUrl})` }}
            />

            {/* Blur Mask Overlay */}
            <div
                className="absolute inset-0 backdrop-blur-[0.5px] backdrop-filter"
                style={{ backgroundColor: 'rgba(51, 47, 76, 0.15)' }}
            />

            {/* Author Name Text */}
            <div className="absolute inset-0 flex items-center justify-center p-2">
                <span className="text-white text-fluid-small font-semibold text-center leading-tight">
                    {authorName}
                </span>
            </div>
        </div>
    );
};


export default AuthorComponent;