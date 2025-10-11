import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import BookCard from "../components/common/BookCard"
import FiltersSection from "../components/allbooks/FiltersSection"
import CartConfirmationPopup from "../components/home/cartConfirmationPopup"
import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"

export default function AllBooks() {
    const [currentPage, setCurrentPage] = useState(1)
    const [searchParams] = useSearchParams()
    const [initialFilters, setInitialFilters] = useState(null)
    const [showCartPopup, setShowCartPopup] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)

    // Scroll to top when component mounts or params change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Extract filters from URL params on mount
    useEffect(() => {
        const category = searchParams.get('category')
        const author = searchParams.get('author')

        if (category || author) {
            const filters = {}
            if (category) {
                filters.categories = [decodeURIComponent(category)]
            }
            if (author) {
                filters.authors = [decodeURIComponent(author)]
            }
            setInitialFilters(filters)
        }
    }, [searchParams])

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
        const book = books.find(b => b.id === bookId)
        if (book) {
            setSelectedBook(book)
            setShowCartPopup(true)
        }
    }

    const handleToggleFavorite = (bookId, isFavorited) => {
        console.log(`Book ${bookId} favorited: ${isFavorited}`)
    }

    return (
        <main className="w-full max-w-[100vw] overflow-x-hidden">
            <div className="min-h-screen bg-white">
                {/* Navigation Bar */}
                <section className="w-full max-w-[100vw] overflow-x-hidden"><Navbar /></section>

                <div className="h-20"></div>

                {/* Main Content */}
                <div className="w-full container-main px-fluid-md">
                {/* Page Header */}
                <div className="mt-fluid-lg mb-fluid-lg">
                    <h1 className="text-brand-blue text-fluid-h1 font-bold mb-fluid-xxs">
                        Tous les livres
                    </h1>
                    <p className="font-['Poppins'] font-[550] text-brand-blue text-fluid-small">
                        Découvrez notre collection complète de livres
                    </p>
                </div>

                {/* Filters Section */}
                <div className="mb-fluid-md">
                    <FiltersSection initialFilters={initialFilters} />
                </div>

                {/* Results Section */}
                <div className="mb-fluid-lg">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <h2 className="text-brand-blue text-fluid-h1to2 font-['poppins'] font-semibold">
                            Résultats
                        </h2>
                        <div className="text-fluid-small text-gray-600">
                            {(currentPage - 1) * booksPerPage + 1} - {Math.min(currentPage * booksPerPage, totalBooks)} sur {totalBooks} livres
                            <span className="hidden sm:inline ml-2 text-gray-400">•</span>
                            <span className="hidden sm:inline ml-2">
                                Page {currentPage}/{totalPages}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Books Grid */}
                <section className="pb-fluid-xl">
                    <div className="flex flex-wrap gap-fluid-md justify-center">
                        {books.map((book, index) => (
                            <div
                                key={book.id}
                                className="book-card-width animate-fade-in"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <BookCard
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
                            </div>
                        ))}
                    </div>

                    {/* See More Button */}
                    {currentPage < totalPages && (
                        <div className="flex justify-center mt-fluid-xl">
                            <button
                                onClick={handleSeeMore}
                                className="px-10 py-3 bg-blue-600 text-white rounded-lg text-fluid-small font-medium hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
                            >
                                Voir plus
                            </button>
                        </div>
                    )}

                    {/* End of results */}
                    {currentPage >= totalPages && (
                        <div className="text-center text-gray-500 text-fluid-small mt-fluid-xl animate-fade-in">
                            <div className="inline-block px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                ✓ Vous avez atteint la fin des résultats
                            </div>
                        </div>
                    )}
                </section>

                {/* Bottom Navigation */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-fluid-lg border-t border-gray-200 text-fluid-small">
                    <div className="text-gray-600 font-medium">Bibliothèque numérique</div>
                    <div className="flex items-center gap-6 flex-wrap justify-center">
                        <div className="flex gap-2">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-8 h-8 rounded text-sm font-medium transition-all duration-200 ${
                                        currentPage === i + 1
                                            ? "bg-blue-600 text-white shadow-md scale-110"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 active:scale-95"
                                    }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <span className="text-gray-600 font-medium">Service clientèle</span>
                    </div>
                </div>
                </div>

            </div>
            <Footer />

            {/* Cart Confirmation Popup - Single instance at page level */}
            {selectedBook && (
                <CartConfirmationPopup
                    isOpen={showCartPopup}
                    onClose={() => setShowCartPopup(false)}
                    book={{
                        title: selectedBook.title,
                        author: selectedBook.author,
                        price: selectedBook.price,
                        coverImage: selectedBook.coverImage
                    }}
                />
            )}
        </main>
    )
}