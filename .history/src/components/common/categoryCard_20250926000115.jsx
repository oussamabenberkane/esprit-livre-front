import React from 'react';

const CategoryCard = ({ 
  title, 
  imageSrc, 
  imagePosition = 'center',
  blurOpacity = 0.15 
}) => {
  return (
    <div className="relative w-[70px] h-[35px] bg-gray-200 rounded-[5px] overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-200">
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
        <p className="font-['Poppins'] font-extrabold text-white text-[6px] text-center leading-[8px] px-1 max-w-full">
          {title}
        </p>
      </div>
    </div>
  );
};

return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex gap-4 p-8">
        {categories.map((category, index) => (
          <CategoryCard
            key={index}
            title={category.title}
            imageSrc={category.imageSrc}
            imagePosition={category.imagePosition}
            blurOpacity={category.blurOpacity}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryShowcase;