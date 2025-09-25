import React from 'react';

const CategoryCard = ({
    title,
    imageSrc,
    imagePosition = 'center',
    blurOpacity = 0.15
}) => {
    return (
        <div className="relative w-[150px] h-[70px] bg-gray-200 rounded-[5px] overflow-hidden cursor-pointer hover:scale-20 transition-transform duration-200">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={imageSrc}
                    alt={title}
                    className={`absolute inset-0 w-full h-full object-cover object-${imagePosition}`}
                />
            </div>

            {/* Blur Overlay with Title */}
            <div
                className="absolute inset-0 backdrop-blur-[0.5px] backdrop-filter flex items-center justify-center"
                style={{ backgroundColor: `rgba(51, 47, 76, ${blurOpacity})` }}
            >
                <p className="font-['Poppins'] font-extrabold text-white text-[12px] text-center leading-[8px] px-1 max-w-full">
                    {title}
                </p>
            </div>
        </div>
    );
};

export default CategoryCard;