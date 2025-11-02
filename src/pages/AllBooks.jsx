import Navbar from "../components/common/Navbar"
import Footer from "../components/common/Footer"
import BookCard from "../components/common/BookCard"
import FiltersSection from "../components/allbooks/FiltersSection"
import CartConfirmationPopup from "../components/common/cartConfirmationPopup"
import FloatingCartBadge from "../components/common/FloatingCartBadge"
import { fetchAllBooks } from "../services/books.service"
import { fetchCategories } from "../services/tags.service"
import { fetchTopAuthors } from "../services/authors.service"
import { useState, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { getBookCoverUrl } from '../utils/imageUtils'

export default function AllBooks() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [currentPage, setCurrentPage] = useState(1)
    const [searchParams] = useSearchParams()
    const [initialFilters, setInitialFilters] = useState(null)
    const [appliedFilters, setAppliedFilters] = useState(null)
    const [showCartPopup, setShowCartPopup] = useState(false)
    const [selectedBook, setSelectedBook] = useState(null)
    const [pageTitle, setPageTitle] = useState(null) // Dynamic page title
    const [searchContext, setSearchContext] = useState(null) // Store search context (type + name)

    // Floating cart badge state
    const [showFloatingBadge, setShowFloatingBadge] = useState(false)
    const [cartItemCount, setCartItemCount] = useState(0)

    // API state
    const [books, setBooks] = useState([])
    const [totalBooks, setTotalBooks] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const booksPerPage = 12

    // Filter data state
    const [categories, setCategories] = useState([])
    const [authors, setAuthors] = useState([])

    // Scroll to top when component mounts or params change
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    // Fetch filter data (categories and authors) on mount
    useEffect(() => {
        const loadFilterData = async () => {
            try {
                const [categoriesData, authorsData] = await Promise.all([
                    fetchCategories(100), // Fetch up to 100 categories
                    fetchTopAuthors(100)  // Fetch up to 100 authors
                ])
                setCategories(categoriesData)
                setAuthors(authorsData)
            } catch (err) {
                console.error('Failed to fetch filter data:', err)
                // Continue without filter data - will fall back to mock data
            }
        }

        loadFilterData()
    }, [])

    // Extract filters from URL params on mount
    useEffect(() => {
        const categoryId = searchParams.get('categoryId')
        const categoryName = searchParams.get('categoryName')
        const authorId = searchParams.get('authorId')
        const authorName = searchParams.get('authorName')
        const search = searchParams.get('search')
        const searchType = searchParams.get('searchType')

        if (categoryId || authorId || search) {
            const filters = {}
            let context = null

            if (categoryId && categoryName) {
                // Category filter by ID and name (pass both for immediate display)
                filters.categories = [{
                    id: categoryId,
                    name: decodeURIComponent(categoryName)
                }]
                context = { type: 'category', name: decodeURIComponent(categoryName) }
                setPageTitle(t('allBooks.resultsFor', { query: decodeURIComponent(categoryName) }))
            }

            if (authorId && authorName) {
                // Author filter by ID and name (pass both for immediate display)
                filters.authors = [{
                    id: authorId,
                    name: decodeURIComponent(authorName)
                }]
                context = { type: 'author', name: decodeURIComponent(authorName) }
                setPageTitle(t('allBooks.resultsFor', { query: decodeURIComponent(authorName) }))
            }

            if (search) {
                // Direct search (book title or general search)
                filters.search = decodeURIComponent(search)
                context = { type: searchType || 'general', name: decodeURIComponent(search) }
                setPageTitle(t('allBooks.resultsFor', { query: decodeURIComponent(search) }))
            }

            setSearchContext(context)
            setInitialFilters(filters)
        } else {
            // Reset to default when no search params
            setPageTitle(null)
            setSearchContext(null)
        }
    }, [searchParams, t])

    // Fetch books from API
    useEffect(() => {
        const loadBooks = async () => {
            try {
                setIsLoading(true)
                setError(null)
                // API uses 0-based page indexing, UI uses 1-based
                const response = await fetchAllBooks(currentPage - 1, booksPerPage, appliedFilters || {})
                setBooks(response.books)
                setTotalBooks(response.totalElements)
                setTotalPages(response.totalPages)
            } catch (err) {
                console.error('Failed to fetch books:', err)
                setError(err.message || 'Failed to load books')
                setBooks([])
            } finally {
                setIsLoading(false)
            }
        }

        loadBooks()
    }, [currentPage, booksPerPage, appliedFilters])

    const handleSeeMore = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    }

    const handleAddToCart = (bookId) => {
        console.log(`Added book ${bookId} to cart`)
        const book = books.find(b => b.id === bookId)
        if (book) {
            setSelectedBook(book)
            setShowCartPopup(true)
            // Increment cart count
            setCartItemCount(prev => prev + 1)
        }
    }

    const handleClosePopup = () => {
        setShowCartPopup(false)
        // Show floating badge after popup closes
        setShowFloatingBadge(true)
    }

    const handleToggleFavorite = (bookId, isFavorited) => {
        console.log(`Book ${bookId} favorited: ${isFavorited}`)
    }

    const handleApplyFilters = (filters) => {
        console.log('Filters applied:', filters)
        // Reset to page 1 when filters change
        setCurrentPage(1)
        // Update applied filters state
        setAppliedFilters(filters)
        // Scroll to top when filters are applied
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <main className="w-full max-w-[100vw] overflow-x-hidden">
            <div className="min-h-screen bg-white">
                {/* Navigation Bar */}
                <section className="w-full max-w-[100vw] overflow-x-hidden"><Navbar /></section>

                {/* Responsive spacing for navbar - taller on mobile due to two-line layout */}
                <div className="h-28 md:h-20"></div>

                {/* Main Content */}
                <div className="w-full container-main px-fluid-md overflow-x-hidden">
                    {/* Page Header */}
                    <div className="mt-fluid-lg mb-fluid-lg">
                        <h1 className="text-brand-blue text-fluid-h1 font-bold mb-fluid-xxs">
                            {t('allBooks.pageTitle')}
                        </h1>
                        <p className="font-['Poppins'] font-[550] text-brand-blue text-fluid-small">
                            {t('allBooks.pageSubtitle')}
                        </p>
                    </div>

                    {/* Filters Section */}
                    <div className="mb-fluid-md overflow-x-hidden">
                        <FiltersSection
                            initialFilters={initialFilters}
                            onApplyFilters={handleApplyFilters}
                            categoriesData={categories}
                            authorsData={authors}
                        />
                    </div>

                    {/* Results Section */}
                    <div className="mb-fluid-lg">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h2 className="text-brand-blue text-fluid-h1to2 font-['poppins'] font-semibold">
                                {pageTitle || t('allBooks.resultsTitle')}
                            </h2>
                            {!isLoading && (
                                <div className="text-fluid-small text-gray-600">
                                    {t('allBooks.resultsCount', {
                                        start: totalBooks > 0 ? (currentPage - 1) * booksPerPage + 1 : 0,
                                        end: Math.min(currentPage * booksPerPage, totalBooks),
                                        total: totalBooks
                                    })}
                                    <span className="hidden sm:inline ml-2 text-gray-400">•</span>
                                    <span className="hidden sm:inline ml-2">
                                        {t('allBooks.page', { current: currentPage, total: totalPages || 1 })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Books Grid */}
                    <section className="pb-fluid-xl">
                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex justify-center items-center py-20">
                                <div className="text-center">
                                    <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-600 text-fluid-small">{t('common.loading', 'Loading books...')}</p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !isLoading && (
                            <div className="flex justify-center items-center py-20">
                                <div className="text-center max-w-md">
                                    <div className="text-red-500 text-5xl mb-4">⚠</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{t('common.error', 'Error')}</h3>
                                    <p className="text-gray-600 mb-4">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {t('common.retry', 'Retry')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Books Grid */}
                        {!isLoading && !error && (
                            <div className="flex flex-wrap gap-fluid-md justify-center">
                                {books.map((book, index) => {
                                    // Extract first ETIQUETTE tag for badge
                                    const etiquetteTag = book.tags.find(tag => tag.type === "ETIQUETTE")
                                    const badge = etiquetteTag ? {
                                        type: etiquetteTag.nameEn.toLowerCase(),
                                        text: etiquetteTag.nameFr,
                                        colorHex: etiquetteTag.colorHex
                                    } : null

                                    // Derive stock status from stockQuantity
                                    const stockStatus = {
                                        available: book.stockQuantity > 0,
                                        text: book.stockQuantity > 0 ? t('bookCard.stockStatus.inStock') : t('bookCard.stockStatus.outOfStock')
                                    }

                                    return (
                                        <div
                                            key={book.id}
                                            className="book-card-width animate-fade-in"
                                            style={{ animationDelay: `${index * 50}ms` }}
                                        >
                                            <BookCard
                                                id={book.id}
                                                title={book.title}
                                                author={book.author.name}
                                                price={book.price}
                                                coverImage={getBookCoverUrl(book.id)}
                                                badge={badge}
                                                stockStatus={stockStatus}
                                                language={book.language}
                                                onAddToCart={handleAddToCart}
                                                onToggleFavorite={handleToggleFavorite}
                                                isFavorited={book.isLikedByCurrentUser}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* See More Button */}
                        {!isLoading && !error && currentPage < totalPages && (
                            <div className="flex justify-center mt-fluid-xl">
                                <button
                                    onClick={handleSeeMore}
                                    className="px-10 py-3 bg-blue-600 text-white rounded-lg text-fluid-small font-medium hover:bg-blue-700 hover:shadow-lg active:scale-95 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-md"
                                >
                                    {t('allBooks.seeMore')}
                                </button>
                            </div>
                        )}

                        {/* End of results */}
                        {!isLoading && !error && currentPage >= totalPages && books.length > 0 && (
                            <div className="text-center text-gray-500 text-fluid-small mt-fluid-xl animate-fade-in">
                                <div className="inline-block px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                    {t('allBooks.endOfResults')}
                                </div>
                            </div>
                        )}

                        {/* No books found */}
                        {!isLoading && !error && books.length === 0 && (
                            <div className="text-center text-gray-500 py-20">
                                <div className="text-6xl mb-4">📚</div>
                                <p className="text-xl font-medium">{t('allBooks.noBooksFound', 'No books found')}</p>
                            </div>
                        )}
                    </section>

                    {/* Bottom Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-fluid-lg border-t border-gray-200 text-fluid-small">
                        <div className="text-gray-600 font-medium">{t('allBooks.digitalLibrary')}</div>
                        <div className="flex items-center gap-6 flex-wrap justify-center">
                            <div className="flex gap-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                        className={`w-8 h-8 rounded text-sm font-medium transition-all duration-200 ${currentPage === i + 1
                                            ? "bg-blue-600 text-white shadow-md scale-110"
                                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105 active:scale-95"
                                            }`}
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                            <span className="text-gray-600 font-medium">{t('allBooks.customerService')}</span>
                        </div>
                    </div>
                </div>

            </div>
            <Footer />

            {/* Cart Confirmation Popup - Single instance at page level */}
            {selectedBook && (
                <CartConfirmationPopup
                    isOpen={showCartPopup}
                    onClose={handleClosePopup}
                    book={{
                        id: selectedBook.id,
                        title: selectedBook.title,
                        author: selectedBook.author.name,
                        price: selectedBook.price,
                        coverImage: getBookCoverUrl(selectedBook.id),
                        language: selectedBook.language
                    }}
                />
            )}

            {/* Floating Cart Badge - Shows after popup is dismissed */}
            <FloatingCartBadge
                isVisible={showFloatingBadge}
                onDismiss={() => setShowFloatingBadge(false)}
                onGoToCart={() => navigate('/cart')}
                itemCount={cartItemCount}
            />
        </main>
    )
}