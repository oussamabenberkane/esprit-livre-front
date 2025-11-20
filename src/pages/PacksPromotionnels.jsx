import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/common/Navbar';
import FiltersSection from '../components/allbooks/FiltersSection';
import Footer from '../components/common/Footer';
import PackCard from '../components/common/PackCard';
import CartConfirmationPopup from '../components/common/cartConfirmationPopup';
import FloatingCartBadge from '../components/common/FloatingCartBadge';
import { getAllBookPacks } from '../services/bookPackService';
import { getBooksByIds } from '../services/books.service';
import { getBookCoverUrl, getBookPackCoverUrl } from '../utils/imageUtils';


const PacksPromotionnels = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedPack, setSelectedPack] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    // Floating cart badge state
    const [showFloatingBadge, setShowFloatingBadge] = useState(false);

    // Pack data state
    const [packs, setPacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPacks, setTotalPacks] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const packsPerPage = 12;

    // Filter state
    const [filters, setFilters] = useState({
        price: { min: 0, max: 10000 },
        categories: [],
        authors: [],
        titles: [],
        languages: []
    });

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const [packBooks, setPackBooks] = useState([]);
    const [allFilteredPacks, setAllFilteredPacks] = useState([]);

    // Fetch packs with filters
    useEffect(() => {
        const fetchPacks = async () => {
            try {
                setLoading(true);
                setError(null);

                // Build query params from filters
                const params = {
                    page: 0,
                    size: 100, // Get all packs for now
                };

                // Add price filters if they differ from defaults
                if (filters.price.min > 0) {
                    params.minPrice = filters.price.min;
                }
                if (filters.price.max < 10000) {
                    params.maxPrice = filters.price.max;
                }

                // Add search query
                if (searchQuery) {
                    params.search = searchQuery;
                }

                // Fetch packs from API
                const response = await getAllBookPacks(params);
                const packsData = response.content || response;

                // For each pack, fetch the full book details
                const packsWithBooks = await Promise.all(
                    packsData.map(async (pack) => {
                        try {
                            // Extract book IDs from the pack
                            // Handle both array of IDs and array of objects with id property
                            const bookIds = (pack.books || []).map(book =>
                                typeof book === 'object' ? book.id : book
                            );

                            // Fetch all books for this pack
                            const booksDetails = await getBooksByIds(bookIds);

                            // Calculate original price (sum of all book prices)
                            const originalPrice = booksDetails.reduce((sum, book) => {
                                return sum + (parseFloat(book.price) || 0);
                            }, 0);

                            return {
                                ...pack,
                                books: booksDetails.map(book => ({
                                    id: book.id,
                                    title: book.title,
                                    author: book.author?.name || 'Unknown',
                                    price: parseFloat(book.price) || 0,
                                    coverImage: getBookCoverUrl(book.id)
                                })),
                                originalPrice: originalPrice,
                                packPrice: parseFloat(pack.price) || 0,
                                packImage: getBookPackCoverUrl(pack.id) || null
                            };
                        } catch (err) {
                            console.error(`Error fetching books for pack ${pack.id}:`, err);
                            // Return pack with empty books array if fetch fails
                            return {
                                ...pack,
                                books: [],
                                originalPrice: parseFloat(pack.price) || 0,
                                packPrice: parseFloat(pack.price) || 0,
                                packImage: getBookPackCoverUrl(pack.id) || null
                            };
                        }
                    })
                );

                // Apply client-side filtering for categories, authors, titles, languages
                let filteredPacks = packsWithBooks;

                // Filter by authors
                if (filters.authors.length > 0) {
                    filteredPacks = filteredPacks.filter(pack =>
                        pack.books.some(book =>
                            filters.authors.some(author =>
                                book.author.toLowerCase().includes(author.toLowerCase())
                            )
                        )
                    );
                }

                // Filter by titles
                if (filters.titles.length > 0) {
                    filteredPacks = filteredPacks.filter(pack =>
                        pack.books.some(book =>
                            filters.titles.some(title =>
                                book.title.toLowerCase().includes(title.toLowerCase())
                            )
                        )
                    );
                }

                // Store all filtered packs and calculate pagination
                setAllFilteredPacks(filteredPacks);
                setTotalPacks(filteredPacks.length);
                setTotalPages(Math.ceil(filteredPacks.length / packsPerPage));

                // Reset to page 1 when filters change
                setCurrentPage(1);
            } catch (err) {
                console.error('Error fetching packs:', err);
                setError(err.message);
                setAllFilteredPacks([]);
                setPacks([]);
                setTotalPacks(0);
                setTotalPages(0);
            } finally {
                setLoading(false);
            }
        };

        fetchPacks();
    }, [filters, searchQuery, packsPerPage]);

    // Update displayed packs when page changes
    useEffect(() => {
        const startIndex = (currentPage - 1) * packsPerPage;
        const endIndex = startIndex + packsPerPage;
        setPacks(allFilteredPacks.slice(startIndex, endIndex));
    }, [currentPage, allFilteredPacks, packsPerPage]);

    const handleAddToCart = (packId) => {
        const pack = packs.find(p => p.id === packId);
        if (pack) {
            // Convert pack to book-like format for the popup
            const packAsBook = {
                id: pack.id,
                title: pack.title,
                author: `${pack.books.length} ${t('packCard.books')}`,
                price: pack.packPrice,
                coverImage: pack.books[0]?.coverImage || pack.packImage || 'https://picsum.photos/seed/default/400/600',
                language: null,
                isPack: true // Flag to identify this is a pack
            };

            setSelectedPack(packAsBook);
            setPackBooks(pack.books); // Store the books array
            setIsPopupOpen(true);
            setCartCount(prev => prev + 1);
        }
    };

    const handleClosePopup = () => {
        setIsPopupOpen(false);
        // Show floating badge after popup closes
        setShowFloatingBadge(true);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar
                searchPlaceholder={t('packsPage.searchPlaceholder')}
                cartCount={cartCount}
                onSearch={handleSearch}
            />

            {/* Main Content */}
            <main className="pt-24 md:pt-28 pb-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold text-[#00417a] mb-3">
                            {t('packsPage.title')}
                        </h1>
                        <p className="text-gray-600 text-base md:text-lg">
                            {t('packsPage.subtitle')}
                        </p>
                    </div>

                    {/* Filters Section */}
                    <div className="mb-8">
                        <FiltersSection onFiltersChange={setFilters} />
                    </div>

                    {/* Results Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h2 className="text-[#00417a] text-2xl md:text-3xl font-['poppins'] font-semibold">
                                {t('packsPage.resultsTitle', 'Results')}
                            </h2>
                            {!loading && (
                                <div className="text-sm text-gray-600">
                                    {t('allBooks.resultsCount', {
                                        start: totalPacks > 0 ? (currentPage - 1) * packsPerPage + 1 : 0,
                                        end: Math.min(currentPage * packsPerPage, totalPacks),
                                        total: totalPacks
                                    })}
                                    <span className="hidden sm:inline ml-2 text-gray-400">•</span>
                                    <span className="hidden sm:inline ml-2">
                                        {t('allBooks.page', { current: currentPage, total: totalPages || 1 })}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Packs Grid */}
                    <section className="pb-12">
                        {/* Loading State */}
                        {loading && (
                            <div className="flex justify-center items-center py-20">
                                <div className="text-center">
                                    <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p className="text-gray-600 text-sm">{t('common.loading', 'Loading...')}</p>
                                </div>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
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

                        {/* Packs Grid */}
                        {!loading && !error && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
                                {packs.map((pack, index) => (
                                    <div
                                        key={pack.id}
                                        className="h-full animate-fade-in"
                                        style={{ animationDelay: `${index * 50}ms` }}
                                    >
                                        <PackCard
                                            id={pack.id}
                                            title={pack.title}
                                            description={pack.description}
                                            originalPrice={pack.originalPrice}
                                            packPrice={pack.packPrice}
                                            packImage={pack.packImage}
                                            books={pack.books}
                                            onAddToCart={handleAddToCart}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* End of results */}
                        {!loading && !error && currentPage >= totalPages && packs.length > 0 && (
                            <div className="text-center text-gray-500 text-sm mt-12 animate-fade-in">
                                <div className="inline-block px-6 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                    {t('allBooks.endOfResults')}
                                </div>
                            </div>
                        )}

                        {/* No packs found */}
                        {!loading && !error && packs.length === 0 && (
                            <div className="text-center text-gray-500 py-20">
                                <div className="text-6xl mb-4">📦</div>
                                <p className="text-xl font-medium">{t('packsPage.noPacksFound', 'No packs found')}</p>
                            </div>
                        )}
                    </section>

                    {/* Bottom Navigation */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-8 border-t border-gray-200 text-sm">
                        <div></div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                {/* Previous Button */}
                                <button
                                    onClick={() => {
                                        setCurrentPage(prev => Math.max(1, prev - 1))
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }}
                                    disabled={currentPage === 1}
                                    className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        currentPage === 1
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                                    }`}
                                    aria-label="Previous page"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>

                                {/* Page Numbers */}
                                <div className="flex gap-1">
                                    {(() => {
                                        const pageNumbers = []
                                        const showEllipsisStart = currentPage > 3
                                        const showEllipsisEnd = currentPage < totalPages - 2

                                        // Always show first page
                                        pageNumbers.push(
                                            <button
                                                key={1}
                                                onClick={() => {
                                                    setCurrentPage(1)
                                                    window.scrollTo({ top: 0, behavior: 'smooth' })
                                                }}
                                                className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                    currentPage === 1
                                                        ? "bg-blue-600 text-white shadow-md"
                                                        : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                                                }`}
                                            >
                                                1
                                            </button>
                                        )

                                        // Show ellipsis after first page if needed
                                        if (showEllipsisStart) {
                                            pageNumbers.push(
                                                <span key="ellipsis-start" className="flex items-center justify-center w-9 h-9 text-gray-400">
                                                    ...
                                                </span>
                                            )
                                        }

                                        // Show pages around current page
                                        const startPage = Math.max(2, currentPage - 1)
                                        const endPage = Math.min(totalPages - 1, currentPage + 1)

                                        for (let i = startPage; i <= endPage; i++) {
                                            pageNumbers.push(
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setCurrentPage(i)
                                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                                    }}
                                                    className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        currentPage === i
                                                            ? "bg-blue-600 text-white shadow-md"
                                                            : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                                                    }`}
                                                >
                                                    {i}
                                                </button>
                                            )
                                        }

                                        // Show ellipsis before last page if needed
                                        if (showEllipsisEnd) {
                                            pageNumbers.push(
                                                <span key="ellipsis-end" className="flex items-center justify-center w-9 h-9 text-gray-400">
                                                    ...
                                                </span>
                                            )
                                        }

                                        // Always show last page if more than 1 page
                                        if (totalPages > 1) {
                                            pageNumbers.push(
                                                <button
                                                    key={totalPages}
                                                    onClick={() => {
                                                        setCurrentPage(totalPages)
                                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                                    }}
                                                    className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                                        currentPage === totalPages
                                                            ? "bg-blue-600 text-white shadow-md"
                                                            : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                                                    }`}
                                                >
                                                    {totalPages}
                                                </button>
                                            )
                                        }

                                        return pageNumbers
                                    })()}
                                </div>

                                {/* Next Button */}
                                <button
                                    onClick={() => {
                                        setCurrentPage(prev => Math.min(totalPages, prev + 1))
                                        window.scrollTo({ top: 0, behavior: 'smooth' })
                                    }}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        currentPage === totalPages
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600 active:scale-95"
                                    }`}
                                    aria-label="Next page"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />

            {/* Cart Confirmation Popup */}
            {selectedPack && (
                <CartConfirmationPopup
                    isOpen={isPopupOpen}
                    onClose={handleClosePopup}
                    book={selectedPack}
                    packBooks={packBooks}
                />
            )}

            {/* Floating Cart Badge - Shows after popup is dismissed */}
            <FloatingCartBadge
                isVisible={showFloatingBadge}
                onDismiss={() => setShowFloatingBadge(false)}
                onGoToCart={() => navigate('/cart')}
                itemCount={cartCount}
            />
        </div>
    );
};

export default PacksPromotionnels;
