import React from 'react';

const CategoryCard = ({
    title,
    imageSrc
}) => {
    return (
        <div className="relative cat-card-size bg-gray-200 rounded-[10px] overflow-hidden cursor-pointer hover:scale-102 transition-transform duration-200">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={imageSrc}
                    alt={title}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
            </div>

            {/* Blur Overlay with Title */}
            <div
                className="absolute inset-0 backdrop-blur-[0.5px] backdrop-filter flex items-center justify-center"
                style={{ backgroundColor: 'rgba(51, 47, 76, 0.15)' }}
            >
                <p className="font-['Poppins'] font-bold text-white text-fluid-h3 text-center leading-[14px] px-1 max-w-full">
                    {title}
                </p>
            </div>
        </div>
    );
};

export default CategoryCard;