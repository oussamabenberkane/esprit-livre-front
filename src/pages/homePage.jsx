import React from 'react';
import Navbar from '../components/common/Navbar';
import CategoryCard from '../components/home/CategoryCard';
import BookCard from '../components/common/BookCard'; // Adjust path as needed
import AuthorComponent from '../components/home/author';
import HeroCarousel from '../components/home/HeroSection';
import ScrollNavigator from '../components/common/Navigation';
import SeeMore from '../components/buttons/SeeMore';
import SlideScroll from '../components/buttons/SlideScroll';


const HomePage = () => {

    const [currentSlide, setCurrentSlide] = React.useState(0);


    const heroImages = [
        {
            src: "/assets/banners/banner2.png",
            alt: "Featured Books Collection",
            overlay: "rgba(0, 65, 122, 0.3)", // Blue overlay matching your theme
            button: "Découvrir"
        },
        {
            src: "/assets/banners/banner1.png",
            alt: "Offres spéciales livres",
            overlay: "rgba(0, 0, 0, 0.2)",
            button: "Nouveautés"
        },

    ];


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
            title: "Les ombres du monde",
            author: "Michel Bussi",
            price: "2000",
            coverImage: "../public/assets/books/crime.jpg", // Use your local images
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
            id: "3",
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
            id: "4",
            title: "Les ombres du monde",
            author: "Michel Bussi",
            price: "2000",
            coverImage: "../public/assets/books/crime.jpg", // Use your local images
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
            id: "5",
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
            id: "6",
            title: "Les ombres du monde",
            author: "Michel Bussi",
            price: "2000",
            coverImage: "../public/assets/books/crime.jpg", // Use your local images
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
            id: "7",
            title: "Où les étoiles tombent",
            author: "Cédric Sapin-Defour",
            price: "250",
            coverImage: "../public/assets/books/ouss.jpg",
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
            id: "8",
            title: "Le Cercle des jours",
            author: "Ken Follett",
            price: "25,90",
            coverImage: "../public/assets/books/crime.jpg",
            badge: {
                type: "precommande",
                text: "Précommande"
            },
            stockStatus: {
                available: true,
                text: "précommande - sortie le 25/09/25"
            }
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
            <div className="h-20"></div>

            <HeroCarousel
                images={heroImages}
                currentIndex={currentSlide}
                height="h-80"
                className="shadow-lg"
            />

            {/* Main Content */}
            <main className="px-4 py-6 pt-20">
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

            <div className="mt-8 px-4">
                <div className='flex flex-row'>
                    <h2 className="font-['Poppins'] font-bold text-[#00417a] text-[16px] mb-4">
                        Livres recommandés
                    </h2>
                    <SeeMore className='absolute right-4 mb-4' />
                </div>
                <ScrollNavigator
                    itemsPerView={3}
                    dotSize={8}
                    activeDotSize={12}
                    dotColor="#bfdbfe"
                    activeDotColor="#00417a"
                    fadeIntensity={0.4}
                    gap={16}
                    className="w-full"
                >
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
                </ScrollNavigator>
                <SlideScroll />
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