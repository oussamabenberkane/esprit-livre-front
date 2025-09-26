import React from 'react';
import Navbar from '../components/common/Navbar';
import CategoryCard from '../components/common/categoryCard';
import BookCard from '../components/commom/BookCard'; // Adjust path as needed


const HomePage = () => {


            const books = [
            {
                id: "1",
                title: "Les ombres du monde",
                author: "Michel Bussi",
                price: "23,90",
                coverImage: "/images/book1.jpg", // Use your local images
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
                price: "22,50",
                coverImage: "/images/book2.jpg",
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
                id: "3",
                title: "Le Cercle des jours",
                author: "Ken Follett",
                price: "25,90",
                coverImage: "/images/book3.jpg",
                badge: {
                type: "precommande",
                text: "Précommande"
                },
                stockStatus: {
                available: true,
                text: "précommande - sortie le 25/09/25"
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

            // Add this JSX after your categories section
            <div className="mt-8">
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
        </div>
    );
};

export default HomePage;