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
    <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300`}>
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

// Example usage component
const AuthorShowcase = () => {
  const authors = [
    {
      name: "Victor Hugo",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Marguerite Duras", 
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Albert Camus",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
    },
    {
      name: "Simone de Beauvoir",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face"
    }
  ];

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-8">
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Author Components - Different Sizes
        </h2>
        
        {/* Small size */}
        <div className="flex gap-4 justify-center items-center">
          <span className="text-sm font-medium text-gray-600 w-16">Small:</span>
          {authors.map((author, index) => (
            <AuthorComponent
              key={`sm-${index}`}
              authorImage={author.image}
              authorName={author.name}
              size="sm"
            />
          ))}
        </div>

        {/* Medium size */}
        <div className="flex gap-6 justify-center items-center">
          <span className="text-sm font-medium text-gray-600 w-16">Medium:</span>
          {authors.map((author, index) => (
            <AuthorComponent
              key={`md-${index}`}
              authorImage={author.image}
              authorName={author.name}
              size="md"
            />
          ))}
        </div>

        {/* Large size */}
        <div className="flex gap-8 justify-center items-center">
          <span className="text-sm font-medium text-gray-600 w-16">Large:</span>
          {authors.slice(0, 2).map((author, index) => (
            <AuthorComponent
              key={`lg-${index}`}
              authorImage={author.image}
              authorName={author.name}
              size="lg"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AuthorShowcase;