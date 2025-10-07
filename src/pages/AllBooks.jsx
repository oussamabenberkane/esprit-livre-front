import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import BookCard from "../components/common/BookCard"
import FiltersSection from "../components/allbooks/FiltersSection"
import { useState } from "react"

export default function AllBooks() {
    const [currentPage, setCurrentPage] = useState(1)

    // Mock data
    const totalBooks = 150
    const booksPerPage = 12
    const totalPages = Math.ceil(totalBooks / booksPerPage)

    const books = Array.from({ length: booksPerPage }, (_, i) => ({
        id: `${i + 1}`,
        title: "Les enfants de minuit",
        author: "Salman Rushdie",
        price: "2000",
        coverImage: "../public/assets/books/ouss.jpg",
        badge: {
            type: "coup-de-coeur",
            text: "coup de cœur"
        },
        stockStatus: {
            available: true,
            text: "en stock"
        }
    }))

    const handleSeeMore = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    const handleAddToCart = (bookId) => {
        console.log(`Added book ${bookId} to cart`)
    }

    const handleToggleFavorite = (bookId, isFavorited) => {
        console.log(`Book ${bookId} favorited: ${isFavorited}`)
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="w-full max-w-[1400px] mx-auto px-[clamp(1rem,4vw,2rem)]">
                {/* Page Title */}
                <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-normal mt-[clamp(1.5rem,3vw,2rem)] mb-[clamp(1.5rem,3vw,2rem)] text-gray-900">
                    Tous les livres
                </h1>

                {/* Filters Section Component */}
                <FiltersSection />

                {/* Book Count Info */}
                <div className="mb-[clamp(1.5rem,3vw,2rem)] text-[clamp(0.875rem,1.5vw,0.875rem)] text-gray-600">
                    Affichage de {(currentPage - 1) * booksPerPage + 1} à{" "}
                    {Math.min(currentPage * booksPerPage, totalBooks)} sur {totalBooks} livres
                    <span className="ml-4">
                        Page {currentPage} sur {totalPages}
                    </span>
                </div>

                {/* Books Grid */}
                <section className="pb-[clamp(3rem,6vw,4rem)]">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[clamp(1rem,2vw,1.5rem)]">
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
                                isFavorited={false}
                            />
                        ))}
                    </div>

                    {/* See More Button */}
                    {currentPage < totalPages && (
                        <div className="flex justify-center mt-[clamp(3rem,6vw,4rem)]">
                            <button
                                onClick={handleSeeMore}
                                className="px-10 py-3 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
                            >
                                Voir plus
                            </button>
                        </div>
                    )}

                    {/* End of results */}
                    {currentPage >= totalPages && (
                        <div className="text-center text-gray-500 text-[clamp(0.875rem,1.5vw,0.875rem)] mt-[clamp(3rem,6vw,4rem)]">
                            Vous avez atteint la fin des résultats
                        </div>
                    )}
                </section>

                {/* Bottom Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-[clamp(2rem,4vw,3rem)] border-t border-gray-200 text-[clamp(0.875rem,1.5vw,0.875rem)]">
                    <div className="text-gray-600">Bibliothèque numérique</div>
                    <div className="flex items-center gap-6">
                        <div className="flex gap-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                                        currentPage === i + 1
                                            ? "bg-blue-600 text-white"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <span className="text-gray-600">Service clientèle</span>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}