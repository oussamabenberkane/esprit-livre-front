import React, { useState, useEffect } from 'react';
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

                setPacks(filteredPacks);
            } catch (err) {
                console.error('Error fetching packs:', err);
                setError(err.message);
                setPacks([]);
            } finally {
                setLoading(false);
            }
        };

        fetchPacks();
    }, [filters, searchQuery]);

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

    // Packs are already filtered by the useEffect hook
    const filteredPacks = packs;

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

                    {/* Packs Grid */}
                    <div className="space-y-4">
                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-16">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                <p className="text-gray-600 mt-4">{t('common.loading', 'Loading...')}</p>
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="text-center py-16">
                                <div className="text-red-500 mb-4">
                                    <svg
                                        className="w-20 h-20 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    {t('common.error', 'Error')}
                                </h3>
                                <p className="text-gray-500">{error}</p>
                            </div>
                        )}

                        {/* Results Count */}
                        {!loading && !error && (
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-gray-600">
                                    <span className="font-semibold text-[#00417a]">{filteredPacks.length}</span> {t('packsPage.packsFound')}
                                </p>
                            </div>
                        )}

                        {/* Packs List - 2 columns on desktop, 1 on mobile with consistent sizing */}
                        {!loading && !error && filteredPacks.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 auto-rows-fr">
                                {filteredPacks.map((pack) => (
                                    <div key={pack.id} className="h-full">
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
                        ) : !loading && !error && (
                            <div className="text-center py-16">
                                <div className="text-gray-400 mb-4">
                                    <svg
                                        className="w-20 h-20 mx-auto"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={1.5}
                                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                                    {t('packsPage.noPacksFound')}
                                </h3>
                                <p className="text-gray-500">
                                    {t('packsPage.tryDifferentSearch')}
                                </p>
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
