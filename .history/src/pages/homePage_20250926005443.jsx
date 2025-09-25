import React from 'react';
import Navbar from '../components/common/Navbar';
import CategoryCard from '../components/common/categoryCard';

const HomePage = () => {
    // Categories data matching the original design
    const categories = [
        {
            title: "Développement personnel",
            imageSrc: "/assets/categories/dev personel.png",
            imagePosition: "center",
            blurOpacity: 0.15
        },
        {
            title: "Romance",
            imageSrc: "/assets/categories/romance.png",
            imagePosition: "center",
            blurOpacity: 0.15
        },
        {
            title: "Thriller",
            imageSrc: "/assets/categories/thriller.png",
            imagePosition: "center",
            blurOpacity: 0.15
        },
        {
            title: "Histoire",
            imageSrc: "/assets/categories/histoire.png",
            imagePosition: "center",
            blurOpacity: 0.1
        },
        {
            title: "Enfants",
            imageSrc: "/assets/categories/enfants.png",
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
                <div className="max-w-md pl-4">
                    {/* Greeting Section */}
                    <div className="mb-6 text-left">
                        <h1 className="font-['Poppins'] font-bold text-[#00417a] text-[18px] mb-1">
                            Bonjour
                        </h1>
                        <p className="font-['Poppins'] font-[500] text-[#00417a] text-[1px]">
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