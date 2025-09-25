import React from 'react';
import Navbar from '../components/common/Navbar'; // Adjust path as needed
import CategoryCard from '../components/CategoryCard'; // Adjust path as needed

const HomePage = () => {
  // Categories data matching the original design
  const categories = [
    {
      title: "Développement personnel",
      imageSrc: "/images/dev-personnel.png",
      imagePosition: "center",
      blurOpacity: 0.15
    },
    {
      title: "Romance",
      imageSrc: "/images/romance.png", 
      imagePosition: "center",
      blurOpacity: 0.15
    },
    {
      title: "Thriller",
      imageSrc: "/images/thriller.png",
      imagePosition: "center", 
      blurOpacity: 0.15
    },
    {
      title: "Histoire",
      imageSrc: "/images/histoire.png",
      imagePosition: "center",
      blurOpacity: 0.1
    },
    {
      title: "Enfants",
      imageSrc: "/images/enfants.png",
      imagePosition: "center",
      blurOpacity: 0.1
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <Navbar />
      
      {/* Main Content */}
      <main className="px-4 py-6">
        {/* Categories Section */}
        <div className="max-w-md mx-auto">
          {/* Greeting Section */}
          <div className="mb-6">
            <h1 className="font-['Poppins'] font-bold text-[#00417a] text-[18px] mb-1">
              Bonjour
            </h1>
            <p className="font-['Poppins'] font-medium text-[#00417a] text-[12px]">
              Choisissez parmis les catégories suivantes
            </p>
          </div>

          {/* Categories Cards Container */}
          <div className="flex gap-4 overflow-x-auto">
            {categories.map((category, index) => (
              <div key={index} className="flex-shrink-0">
                <CategoryCard
                  title={category.title}
                  imageSrc={category.imageSrc}
                  imagePosition={category.imagePosition}
                  blurOpacity={category.blurOpacity}
                />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;