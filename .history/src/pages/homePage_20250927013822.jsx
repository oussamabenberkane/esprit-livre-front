import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import CategoryCard from '../components/home/CategoryCard';
import BookCard from '../components/common/BookCard'; // Adjust path as needed
import AuthorComponent from '../components/home/author';
import HeroCarousel from '../components/home/HeroSection';


const HomePage = () => {


    const marketingImages = [
        {
            src: "assets/banners/banner2.png",
            alt: "Nouvelle collection automne 2025",
            overlay: "rgba(0, 0, 0, 0.3)",
            button: "Découvrir"
        },
        {
            src: "assets/banners/banner2.png",
            alt: "Offres spéciales livres",
            overlay: "rgba(238, 0, 39, 0.2)",
            button: "Voir les offres"
        },

    ];

    const [currentSlide, setCurrentSlide] = useState(0);


    const books = [
        {
            id: "1",
            title: "Les ombres du monde",
            author: "Michel Bussi",
            price: "2000",
            coverImage: "../public/assets/books/ouss.jpg", // Use your local images
            badge: {
                type: "coup-de-coeur",
                text: "coup de cœur"
            },
            stockStatus: {
                available: true,
                text: "en stock Cultura"
            }
        },
        {
            id: "2",
            title: "Où les étoiles tombent",
            author: "Cédric Sapin-Defour",
            price: "250",
            coverImage: "../public/assets/books/crime.jpg",
            badge: {
                type: "nouveaute",
                text: "Nouveauté"
            },
            stockStatus: {
                available: true,
                text: "en stock Cultura"
            }
        },

        {
            id: "4",
            title: "Finistère",
            author: "Anne Berest",
            price: "23,90",
            coverImage: "/images/book4.jpg",
            stockStatus: {
                available: true,
                text: "en stock Cultura"
            },
            isFavorited: true
        }
    ];

    const handleAddToCart = (bookId) => {
        console.log(`Added book ${bookId} to cart`);
        // Add your cart logic here
    };

    const handleToggleFavorite = (bookId, isFavorited) => {
        console.log(`Book ${bookId} favorited: ${isFavorited}`);
        // Add your favorite logic here
    };



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
            <div>
                <HeroCarousel
                    images={marketingImages}
                    currentIndex={currentSlide}
                    height="h-80"
                    className="shadow-lg"
                />
            </div>

            {/* Main Content */}
            <main className="px-4 py-6">
                {/* Categories Section */}
                <div className="max-w-md pl-4">
                    {/* Greeting Section */}
                    <div className="mb-6 text-left">
                        <h1 className="font-['Poppins'] font-bold text-[#00417a] text-[48px] mb-1">
                            Bonjour
                        </h1>
                        <p className="font-['Poppins'] mt-1 font-[500] text-[#00417a] text-[18px]">
                            Choisissez parmis les catégories suivantes
                        </p>
                    </div>

                    {/* Categories Cards Container */}
                    <div className="flex gap-4 ">
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


            <div className="mt-8 max-w-7xl mx-auto">
                <h2 className="font-['Poppins'] font-bold text-[#00417a] text-[16px] mb-4">
                    Livres recommandés
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {books.map((book) => (
                        <BookCard
                            key={book.id}
                            id={book.id}
                            title={book.title}
                            author={book.author}
                            price={book.price}
                            coverImage={book.coverImage}
                            badge={book.badge}
                            stockStatus={book.stockStatus}
                            onAddToCart={handleAddToCart}
                            onToggleFavorite={handleToggleFavorite}
                            isFavorited={book.isFavorited}
                        />
                    ))}
                </div>
            </div>

            <AuthorComponent
                authorImage="/assets/authors/camus.png"
                authorName="Victor Hugo"
                size="xl"
            />


        </div>
    );



};

export default HomePage;