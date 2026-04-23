import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ShoppingCart, CheckCircle2, ChevronDown } from 'lucide-react';
import InlineMarkdown from '../components/common/InlineMarkdown';
import MarkdownContent from '../components/common/MarkdownContent';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BookCard from '../components/common/BookCard';
import PackCard from '../components/common/PackCard';
import PackBooksPopup from '../components/common/PackBooksPopup';
import SlideScroll from '../components/buttons/SlideScroll';
import PaginationDots from '../components/common/PaginationDots';
import SeeMore from '../components/buttons/SeeMore';
import CartConfirmationPopup from '../components/common/cartConfirmationPopup';
import FloatingCartBadge from '../components/common/FloatingCartBadge';
import BookDetailsSkeleton from '../components/common/skeletons/BookDetailsSkeleton';
import BookCardSkeleton from '../components/common/skeletons/BookCardSkeleton';
import PackCardSkeleton from '../components/common/skeletons/PackCardSkeleton';
import { BOOKS_DATA, getLanguageCode } from '../data/booksData';
import { fetchBookById, fetchBookRecommendations } from '../services/books.service';
import { getRecommendedPacksForBook } from '../services/bookPackService';
import { getBookCoverUrl } from '../utils/imageUtils';
import useProgressiveRender from '../hooks/useProgressiveRender';
import { useCart } from '../contexts/CartContext';
import { trackViewContent, trackAddToCart } from '../services/pixel.service';


const BookDetails = () => {
    const { t } = useTranslation();
    const { addToCart, addPackToCart } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const { id } = useParams(); // Get book ID from URL

    // Get book data from navigation state if available
    const navigationBook = location.state?.book;

    // Find the book based on URL parameter
    const [book, setBook] = useState(navigationBook || null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Scroll to top when book ID changes
        window.scrollTo(0, 0);

        // Fetch book from API
        const fetchBook = async () => {
            setLoading(true);

            try {
                // Fetch book by ID from API
                const foundBook = await fetchBookById(parseInt(id));

                if (foundBook) {
                    setBook(foundBook);
                    const category = foundBook.tags?.find(t => t.type === 'CATEGORY')?.nameFr;
                    trackViewContent({
                        id: foundBook.id,
                        name: foundBook.title,
                        category,
                        value: foundBook.price,
                    });
                } else {
                    setBook(null);
                }
            } catch (error) {
                console.error('Error fetching book details:', error);
                setBook(null);
            } finally {
                setLoading(false);
            }
        };

        fetchBook();
    }, [id]); // Re-fetch when ID changes

    // Recommended books carousel state
    const [currentBookIndex, setCurrentBookIndex] = useState(0);
    const booksScrollRef = useRef(null);
    const [canScrollBooksLeft, setCanScrollBooksLeft] = useState(false);
    const [canScrollBooksRight, setCanScrollBooksRight] = useState(true);

    // Description reveal state
    const [showFullDescription, setShowFullDescription] = useState(false);
    const bookDetailsRef = useRef(null);

    // Cart popup state
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    // Recommended books - exclude current book (backend will provide this later)
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [recommendedBooksLoading, setRecommendedBooksLoading] = useState(true);

    // Progressive rendering for recommended books
    const { visibleItems: visibleRecommendedBooks, isRendering: isRecommendedBooksRendering } = useProgressiveRender(
        recommendedBooks,
        recommendedBooksLoading,
        80 // 80ms delay between each book appearing
    );

    // Load recommended books when ID changes
    useEffect(() => {
        // Fetch recommended books from API
        const fetchRecommendations = async () => {
            try {
                setRecommendedBooksLoading(true);
                const recommendations = await fetchBookRecommendations(parseInt(id));
                setRecommendedBooks(recommendations);
            } catch (error) {
                console.error('Error fetching recommendations:', error);
                // Fallback to empty array on error
                setRecommendedBooks([]);
            } finally {
                setRecommendedBooksLoading(false);
            }
        };

        fetchRecommendations();
    }, [id]);

    // Pack recommendations state
    const [recommendedPacks, setRecommendedPacks] = useState([]);
    const [currentPackIndex, setCurrentPackIndex] = useState(0);
    const packsScrollRef = useRef(null);
    const [canScrollPacksLeft, setCanScrollPacksLeft] = useState(false);
    const [canScrollPacksRight, setCanScrollPacksRight] = useState(true);
    const [packsLoading, setPacksLoading] = useState(true);

    // Progressive rendering for recommended packs
    const { visibleItems: visibleRecommendedPacks, isRendering: isRecommendedPacksRendering } = useProgressiveRender(
        recommendedPacks,
        packsLoading,
        100 // 100ms delay between each pack appearing
    );

    // Fetch pack recommendations for the current book
    useEffect(() => {
        const fetchPacks = async () => {
            if (!book?.id) {
                setRecommendedPacks([]);
                setPacksLoading(false);
                return;
            }

            try {
                setPacksLoading(true);

                const response = await getRecommendedPacksForBook(book.id, {
                    page: 0,
                    size: 8
                });
                const packsData = response.content || response;

                // Books are already included in the API response — no need to re-fetch
                const packsWithBooks = packsData.map((pack) => {
                    const books = (pack.books || []).map(b => ({
                        id: b.id,
                        title: b.title,
                        author: b.author?.name || 'Unknown',
                        price: parseFloat(b.price) || 0,
                        coverImage: getBookCoverUrl(b.id)
                    }));

                    const originalPrice = books.reduce((sum, b) => sum + b.price, 0);

                    return {
                        ...pack,
                        books,
                        originalPrice,
                        packPrice: parseFloat(pack.price) || 0,
                        packImage: null
                    };
                });

                setRecommendedPacks(packsWithBooks);
            } catch (err) {
                console.error('Error fetching recommended packs:', err);
                setRecommendedPacks([]);
            } finally {
                setPacksLoading(false);
            }
        };

        fetchPacks();
    }, [book?.id]);

    // Scroll handlers
    const checkBooksScrollPosition = () => {
        const container = booksScrollRef.current;
        if (!container || visibleRecommendedBooks.length === 0) return;

        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        setCanScrollBooksLeft(scrollLeft > 0);
        setCanScrollBooksRight(scrollLeft < maxScroll - 10);

        // Calculate total items for pagination (visible + loading)
        const totalItems = recommendedBooksLoading ? 10 : recommendedBooks.length;

        // If at the very end, set to last index
        if (scrollLeft >= maxScroll - 5) {
            setCurrentBookIndex(totalItems - 1);
        }
        // If at the very start, set to first index
        else if (scrollLeft <= 5) {
            setCurrentBookIndex(0);
        }
        // Otherwise, calculate based on center
        else {
            const itemWidth = container.firstChild?.offsetWidth || 0;
            const gap = parseFloat(getComputedStyle(container).gap) || 0;
            const containerCenter = scrollLeft + (container.clientWidth / 2);

            // Calculate which item is centered
            let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));

            // Clamp between 0 and last index
            activeIndex = Math.max(0, Math.min(activeIndex, totalItems - 1));

            setCurrentBookIndex(activeIndex);
        }
    };

    const scrollBooks = (direction) => {
        const container = booksScrollRef.current;
        if (container) {
            const itemWidth = container.firstChild?.offsetWidth || 0;
            const gap = parseFloat(getComputedStyle(container).gap) || 0;

            const scrollAmount = itemWidth + gap;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Pack scroll handlers
    const checkPacksScrollPosition = () => {
        const container = packsScrollRef.current;
        if (!container || visibleRecommendedPacks.length === 0) return;

        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        setCanScrollPacksLeft(scrollLeft > 0);
        setCanScrollPacksRight(scrollLeft < maxScroll - 10);

        // Calculate total items for pagination (visible + loading)
        const totalItems = packsLoading ? 8 : recommendedPacks.length;

        if (scrollLeft >= maxScroll - 5) {
            setCurrentPackIndex(totalItems - 1);
        } else if (scrollLeft <= 5) {
            setCurrentPackIndex(0);
        } else {
            const itemWidth = container.firstChild?.offsetWidth || 0;
            const gap = parseFloat(getComputedStyle(container).gap) || 0;
            const containerCenter = scrollLeft + (container.clientWidth / 2);

            let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));
            activeIndex = Math.max(0, Math.min(activeIndex, totalItems - 1));

            setCurrentPackIndex(activeIndex);
        }
    };

    const scrollPacks = (direction) => {
        const container = packsScrollRef.current;
        if (container) {
            const itemWidth = container.firstChild?.offsetWidth || 0;
            const gap = parseFloat(getComputedStyle(container).gap) || 0;

            const scrollAmount = itemWidth + gap;
            container.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    // Setup scroll listeners when recommended books are loaded
    useEffect(() => {
        if (visibleRecommendedBooks.length === 0 && !recommendedBooksLoading) return;

        setCurrentBookIndex(0);
        if (booksScrollRef.current) {
            booksScrollRef.current.scrollLeft = 0;
        }

        const booksContainer = booksScrollRef.current;
        if (booksContainer) {
            checkBooksScrollPosition();
            booksContainer.addEventListener('scroll', checkBooksScrollPosition);

            const handleResize = () => checkBooksScrollPosition();
            window.addEventListener('resize', handleResize);

            return () => {
                booksContainer.removeEventListener('scroll', checkBooksScrollPosition);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [visibleRecommendedBooks.length, recommendedBooksLoading]);

    // Setup scroll listeners for packs when loaded
    useEffect(() => {
        if (visibleRecommendedPacks.length === 0 && !packsLoading) return;

        setCurrentPackIndex(0);
        if (packsScrollRef.current) {
            packsScrollRef.current.scrollLeft = 0;
        }

        const packsContainer = packsScrollRef.current;
        if (packsContainer) {
            checkPacksScrollPosition();
            packsContainer.addEventListener('scroll', checkPacksScrollPosition);

            const handleResize = () => checkPacksScrollPosition();
            window.addEventListener('resize', handleResize);

            return () => {
                packsContainer.removeEventListener('scroll', checkPacksScrollPosition);
                window.removeEventListener('resize', handleResize);
            };
        }
    }, [visibleRecommendedPacks.length, packsLoading]);

    const handleAddToCart = async (bookId) => {
        const bookToAdd = recommendedBooks.find(b => b.id === bookId);
        if (bookToAdd) {
            await addToCart(bookId, 1);
            trackAddToCart({ id: bookToAdd.id, name: bookToAdd.title, value: bookToAdd.price, quantity: 1 });

            setSelectedBook({
                ...bookToAdd,
                coverImage: getBookCoverUrl(bookToAdd.id)
            });
            setPackBooks([]); // Clear pack books for regular books
            setShowCartPopup(true);
        }
    };

    const handleClosePopup = () => {
        setShowCartPopup(false);
    };

    const handleToggleFavorite = (bookId, isFavorited) => {
        console.log(`Book ${bookId} favorited: ${isFavorited}`);
    };

    // Pack books for popup (store separately from selectedBook)
    const [packBooks, setPackBooks] = useState([]);

    const handleAddPackToCart = async (packId) => {
        const pack = recommendedPacks.find(p => p.id === packId);
        if (pack) {
            try {
                await addPackToCart(packId, 1);
                trackAddToCart({ id: `pack-${pack.id}`, name: pack.title, value: pack.packPrice, quantity: 1 });

                // Convert pack to book-like format for the popup
                const packAsBook = {
                    id: pack.id,
                    title: pack.title,
                    author: `${pack.books.length} ${t('packCard.books')}`,
                    price: pack.packPrice,
                    coverImage: pack.books[0]?.coverImage || pack.packImage || 'https://picsum.photos/seed/default/400/600',
                    language: null,
                    isPack: true
                };

                setSelectedBook(packAsBook);
                setPackBooks(pack.books); // Store the books array for the popup
                setShowCartPopup(true);
            } catch (error) {
                console.error('Error adding pack to cart:', error);
            }
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleAddMainBookToCart = async () => {
        await addToCart(book.id, 1);
        trackAddToCart({ id: book.id, name: book.title, value: book.price, quantity: 1 });

        setSelectedBook({
            ...book,
            coverImage: getBookCoverUrl(book.id)
        });
        setPackBooks([]); // Clear pack books for regular books
        setShowCartPopup(true);
    };

    const handleToggleDescription = () => {
        setShowFullDescription(prev => !prev);
    };

    // Loading state
    if (loading) {
        return (
            <main className="w-full max-w-[100vw] overflow-x-hidden">
                <div className="min-h-screen bg-white">
                    <Navbar />
                    <div className="h-20"></div>

                    {/* Book Details Skeleton */}
                    <section className="w-full section-spacing">
                        <BookDetailsSkeleton />
                    </section>

                    <Footer />
                </div>
            </main>
        );
    }

    // Book not found state
    if (!book) {
        return (
            <main className="w-full max-w-[100vw] overflow-x-hidden">
                <div className="min-h-screen bg-white">
                    <Navbar />
                    <div className="h-20"></div>
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <h1 className="font-['Poppins'] font-bold text-[#1c2d55] text-fluid-h1 mb-4">
                                {t('bookDetails.notFound')}
                            </h1>
                            <p className="font-['Poppins'] text-[#626e82] text-fluid-body mb-6">
                                {t('bookDetails.notFoundMessage')}
                            </p>
                            <button
                                onClick={() => navigate('/')}
                                className="bg-[#00417a] hover:bg-[#003460] text-white font-['Poppins'] font-semibold px-6 py-3 rounded-md transition-colors"
                            >
                                {t('bookDetails.backToHome')}
                            </button>
                        </div>
                    </div>
                    <Footer />
                </div>
            </main>
        );
    }

    return (
        <main className="w-full max-w-[100vw] overflow-x-hidden">
            <div className="min-h-screen bg-white">
                {/* Navbar */}
                <Navbar />

                <div className="h-20"></div>

                {/* Book Details Section */}
                <section className="w-full section-spacing" ref={bookDetailsRef}>
                    {/* Mobile Layout (< md) - Vertical Stacking */}
                    <div className="md:hidden container-main container-padding">
                        {/* Back Button */}
                        <button
                            onClick={handleBackClick}
                            className="flex items-center gap-2 text-[#626e82] hover:text-[#1c2d55] transition-colors mb-fluid-md"
                            aria-label={t('aria.back')}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Book Image */}
                        <div className="flex justify-center mb-fluid-sm">
                            <div className="w-[200px] xs:w-[220px] aspect-[5/7] rounded-md shadow-[0px_5px_20px_0px_rgba(0,0,0,0.25)] overflow-hidden">
                                <img
                                    src={getBookCoverUrl(book.id)}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Title + Author + Price under cover */}
                        <div className="text-center mb-fluid-md">
                            <h1 className="font-['Poppins'] font-bold text-[#1c2d55] text-fluid-h1to2 mb-fluid-xxs">
                                <InlineMarkdown>{book.title}</InlineMarkdown>
                            </h1>
                            <p className="font-['Poppins'] font-semibold text-[#626e82] text-sm mb-fluid-xs">
                                {t('bookDetails.author')} {book.author.name}
                            </p>
                            <div className="flex items-center justify-center gap-3">
                                <div>
                                    <span className="font-['Poppins'] font-extrabold text-[#1c2d55] text-base">
                                        {book.price}
                                    </span>
                                    <span className="font-['Poppins'] font-semibold text-[#1c2d55] text-sm ml-1">
                                        DZD
                                    </span>
                                </div>
                                {book.language && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex-shrink-0">
                                        {getLanguageCode(book.language)}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Book Information */}
                        <div className="flex flex-col gap-fluid-sm">
                            {/* Description - inline expand */}
                            {book.description && (
                                <div>
                                    <h3 className="font-['Poppins'] font-bold text-[#1c2d55] text-base mb-1.5">
                                        {t('bookDetails.descriptionTitle')}
                                    </h3>
                                    <div className={`font-['Poppins'] font-normal text-[#1c2d55] text-sm ${showFullDescription ? '' : 'line-clamp-3'}`}>
                                        <MarkdownContent compact={!showFullDescription}>
                                            {book.description}
                                        </MarkdownContent>
                                    </div>
                                    <button
                                        onClick={handleToggleDescription}
                                        className="font-['Poppins'] font-medium text-[#00417a] text-xs mt-1.5 inline-flex items-center gap-1 hover:underline"
                                    >
                                        {showFullDescription ? t('bookDetails.hideDescription') : t('bookDetails.viewFullDescription')}
                                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${showFullDescription ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>
                            )}

                            {/* Details Card */}
                            <div className="border border-[#c9cfd8] rounded-md p-fluid-sm">
                                {/* Seller */}
                                <p className="font-['Poppins'] font-semibold text-[#1c2d55] text-sm mb-fluid-xxs">
                                    {t('bookDetails.soldBy', { seller: book.seller })}
                                </p>

                                {/* Category */}
                                {book.tags && book.tags.find(tag => tag.type === "CATEGORY") && (
                                    <div className="flex items-center gap-2 mb-fluid-sm">
                                        <p className="font-['Poppins'] font-semibold text-[#1c2d55] text-sm">
                                            {t('bookDetails.categoryLabel')}:
                                        </p>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                            {book.tags.find(tag => tag.type === "CATEGORY").nameFr}
                                        </span>
                                    </div>
                                )}

                                {/* Stock Status */}
                                <div className="flex items-center gap-1.5 mb-fluid-xs">
                                    <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${book.stockQuantity > 0 ? 'text-[#198919]' : 'text-blue-600'}`} />
                                    <span className={`font-['Poppins'] font-bold text-sm ${book.stockQuantity > 0 ? 'text-[#198919]' : 'text-blue-600'}`}>
                                        {book.stockQuantity > 0 ? t('bookCard.stockStatus.inStock') : t('bookCard.stockStatus.preorder')}
                                    </span>
                                </div>

                                {/* Delivery Estimate */}
                                <p className="font-['Poppins'] font-semibold text-[#626e82] text-sm mb-fluid-md">
                                    {t('bookDetails.estimatedDelivery', { date: book.estimatedDelivery })}
                                </p>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={handleAddMainBookToCart}
                                    className="w-[85%] mx-auto bg-[#ee0027] hover:bg-[#d00022] text-white font-['Poppins'] font-extrabold text-sm rounded-md py-2.5 px-4 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <span>{t('bookDetails.addToCart')}</span>
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tablet & Desktop Layout (>= md) - Horizontal Centered */}
                    <div className="hidden md:block">
                        <div className="container-main px-fluid-md">
                            {/* Back Button */}
                            <button
                                onClick={handleBackClick}
                                className="flex items-center gap-2 text-[#626e82] hover:text-[#1c2d55] transition-colors mb-fluid-md"
                                aria-label={t('aria.back')}
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Horizontal Layout - Centered */}
                            <div className="flex gap-fluid-lg items-start max-w-6xl mx-auto">
                                {/* Left Column - Cover + Title/Price */}
                                <div className="flex-shrink-0 w-[240px] lg:w-[280px]">
                                    <div className="w-full aspect-[5/7] rounded-md shadow-[0px_5px_20px_0px_rgba(0,0,0,0.25)] overflow-hidden">
                                        <img
                                            src={getBookCoverUrl(book.id)}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Title + Author + Price under cover */}
                                    <div className="mt-fluid-sm">
                                        <h1 className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-h3 leading-tight mb-1">
                                            <InlineMarkdown>{book.title}</InlineMarkdown>
                                        </h1>
                                        <p className="font-['Poppins'] font-normal text-[#626e82] text-fluid-small mb-fluid-xs">
                                            {t('bookDetails.author')} {book.author.name}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="font-['Poppins'] font-extrabold text-[#1c2d55] text-fluid-medium">
                                                    {book.price}
                                                </span>
                                                <span className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-vsmall ml-1">
                                                    DZD
                                                </span>
                                            </div>
                                            {book.language && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex-shrink-0">
                                                    {getLanguageCode(book.language)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column - Description first, then details */}
                                <div className="flex flex-col gap-fluid-sm flex-1 min-w-0">
                                    {/* Description - inline expand */}
                                    {book.description && (
                                        <div>
                                            <h3 className="font-['Poppins'] font-bold text-[#1c2d55] text-fluid-h3 mb-fluid-xxs">
                                                {t('bookDetails.descriptionTitle')}
                                            </h3>
                                            <div className={`font-['Poppins'] font-normal text-[#1c2d55] text-fluid-small ${showFullDescription ? '' : 'line-clamp-4'}`}>
                                                <MarkdownContent compact={!showFullDescription}>
                                                    {book.description}
                                                </MarkdownContent>
                                            </div>
                                            <button
                                                onClick={handleToggleDescription}
                                                className="font-['Poppins'] font-medium text-[#00417a] text-fluid-vsmall mt-fluid-xxs inline-flex items-center gap-1 hover:underline"
                                            >
                                                {showFullDescription ? t('bookDetails.hideDescription') : t('bookDetails.viewFullDescription')}
                                                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showFullDescription ? 'rotate-180' : ''}`} />
                                            </button>
                                        </div>
                                    )}

                                    {/* Details Card */}
                                    <div className="border border-[#c9cfd8] rounded-md p-fluid-md">
                                        <div>
                                            {/* Seller */}
                                            <p className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-medium mb-fluid-xxs">
                                                {t('bookDetails.soldBy', { seller: book.seller })}
                                            </p>

                                            {/* Category */}
                                            {book.tags && book.tags.find(tag => tag.type === "CATEGORY") && (
                                                <div className="flex items-center gap-2 mb-fluid-md">
                                                    <p className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-small">
                                                        {t('bookDetails.categoryLabel')}:
                                                    </p>
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                                                        {book.tags.find(tag => tag.type === "CATEGORY").nameFr}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Stock Status */}
                                            <div className="flex items-center gap-1 mb-fluid-xxs">
                                                <CheckCircle2 className={`w-3 h-3 ${book.stockQuantity > 0 ? 'text-[#198919]' : 'text-blue-600'}`} />
                                                <span className={`font-['Poppins'] font-bold text-fluid-vsmall ${book.stockQuantity > 0 ? 'text-[#198919]' : 'text-blue-600'}`}>
                                                    {book.stockQuantity > 0 ? t('bookCard.stockStatus.inStock') : t('bookCard.stockStatus.preorder')}
                                                </span>
                                            </div>

                                            {/* Delivery Estimate */}
                                            <p className="font-['Poppins'] font-semibold text-[#626e82] text-fluid-small mb-fluid-md">
                                                {t('bookDetails.estimatedDelivery', { date: book.estimatedDelivery })}
                                            </p>
                                        </div>

                                        {/* Add to Cart Button */}
                                        <button
                                            onClick={handleAddMainBookToCart}
                                            className="w-[85%] mx-auto bg-[#ee0027] hover:bg-[#d00022] text-white font-['Poppins'] font-extrabold text-fluid-vsmall rounded-md py-2 px-4 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <span>{t('bookDetails.addToCart')}</span>
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recommended Books Section */}
                <section className="w-full section-spacing bg-white">
                    <div className="container-main container-padding2xl-left-only">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-fluid-sm pr-fluid-lg gap-2">
                            <h2 className="text-brand-blue font-bold text-[clamp(0.875rem,3vw,var(--font-size-fluid-h2))]">
                                {t('bookDetails.recommendations')}
                            </h2>
                            <div className="scale-[0.85] xs:scale-100 origin-right">
                                <SeeMore to="/allbooks" />
                            </div>
                        </div>

                        {/* Horizontal Scroll Container with negative margin */}
                        <div className="relative -ml-fluid-2xl">
                            {/* Scroll fade overlays */}
                            <div className={`absolute left-0 top-0 bottom-0 w-[var(--spacing-fluid-2xl)] bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollBooksLeft ? 'opacity-100' : 'opacity-0'}`} />
                            <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollBooksRight ? 'opacity-100' : 'opacity-0'}`} />
                            <div
                                ref={booksScrollRef}
                                className="flex pt-fluid-xs pr-fluid-lg pl-fluid-2xl gap-fluid-md overflow-x-auto scrollbar-hide pb-4"
                            >
                                {/* Render visible books */}
                                {visibleRecommendedBooks.map((recommendedBook) => {
                                    const etiquetteTag = recommendedBook.tags?.find(tag => tag.type === "ETIQUETTE");
                                    const badge = etiquetteTag ? {
                                        type: etiquetteTag.nameEn?.toLowerCase(),
                                        nameFr: etiquetteTag.nameFr,
                                        nameEn: etiquetteTag.nameEn,
                                        colorHex: etiquetteTag.colorHex
                                    } : null;

                                    const stockStatus = {
                                        available: recommendedBook.stockQuantity > 0,
                                        text: recommendedBook.stockQuantity > 0 ? t('bookCard.stockStatus.inStock') : t('bookCard.stockStatus.preorder')
                                    };

                                    return (
                                        <div
                                            key={recommendedBook.id}
                                            className="flex-shrink-0 snap-start book-card-width"
                                        >
                                            <BookCard
                                                id={recommendedBook.id}
                                                title={recommendedBook.title}
                                                author={recommendedBook.author?.name || 'Unknown'}
                                                price={recommendedBook.price}
                                                coverImage={recommendedBook.coverImageUrl}
                                                badge={badge}
                                                stockStatus={stockStatus}
                                                language={recommendedBook.language}
                                                stock={recommendedBook.stockQuantity}
                                                onAddToCart={handleAddToCart}
                                                onToggleFavorite={handleToggleFavorite}
                                                isFavorited={recommendedBook.isLikedByCurrentUser}
                                            />
                                        </div>
                                    );
                                })}

                                {/* Render skeleton placeholders for remaining items */}
                                {(() => {
                                    const totalItems = recommendedBooksLoading ? 10 : recommendedBooks.length;
                                    const skeletonCount = recommendedBooksLoading ? 10 : Math.max(0, totalItems - visibleRecommendedBooks.length);

                                    return Array.from({ length: skeletonCount }).map((_, index) => (
                                        <div
                                            key={`skeleton-${index}`}
                                            className="flex-shrink-0 snap-start book-card-width"
                                        >
                                            <BookCardSkeleton />
                                        </div>
                                    ));
                                })()}
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        {!recommendedBooksLoading && recommendedBooks.length > 0 && (
                            <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4 gap-4 xs:gap-6">
                                <div className="flex-1"></div>

                                <div className="flex-1 flex justify-center">
                                    <PaginationDots
                                        totalDots={recommendedBooks.length}
                                        currentIndex={currentBookIndex}
                                        onDotClick={(index) => {
                                            const container = booksScrollRef.current;
                                            if (container) {
                                                const itemWidth = container.firstChild?.offsetWidth || 0;
                                                const gap = parseFloat(getComputedStyle(container).gap) || 0;

                                                let scrollAmount;
                                                if (index === 0) {
                                                    scrollAmount = 0;
                                                } else if (index === recommendedBooks.length - 1) {
                                                    scrollAmount = container.scrollWidth - container.clientWidth;
                                                } else {
                                                    const itemPosition = index * (itemWidth + gap);
                                                    const centerOffset = (container.clientWidth - itemWidth) / 2;
                                                    scrollAmount = itemPosition - centerOffset;
                                                }

                                                container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                                            }
                                        }}
                                    />
                                </div>

                                <div className="flex-1 flex justify-end">
                                    <SlideScroll
                                        onPrevious={() => scrollBooks('left')}
                                        onNext={() => scrollBooks('right')}
                                        canScrollLeft={canScrollBooksLeft}
                                        canScrollRight={canScrollBooksRight}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Pack Recommendations Section */}
                {(packsLoading || recommendedPacks.length > 0) && (
                    <section className="w-full section-spacing bg-white">
                        <div className="container-main container-padding2xl-left-only">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-fluid-sm pr-fluid-lg gap-2">
                                <h2 className="text-brand-blue font-bold text-[clamp(0.875rem,3vw,var(--font-size-fluid-h2))]">
                                    {t('bookDetails.packRecommendations')}
                                </h2>
                                <div className="scale-[0.85] xs:scale-100 origin-right">
                                    <SeeMore to="/packs" />
                                </div>
                            </div>

                            {/* Horizontal Scroll Container with negative margin */}
                            <div className="relative -ml-fluid-2xl">
                                {/* Scroll fade overlays */}
                                <div className={`absolute left-0 top-0 bottom-0 w-[var(--spacing-fluid-2xl)] bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollPacksLeft ? 'opacity-100' : 'opacity-0'}`} />
                                <div className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-300 ${canScrollPacksRight ? 'opacity-100' : 'opacity-0'}`} />
                                <div
                                    ref={packsScrollRef}
                                    className="flex pt-fluid-xs pr-fluid-lg pl-fluid-2xl gap-fluid-md overflow-x-auto scrollbar-hide pb-4"
                                >
                                    {/* Render visible packs */}
                                    {visibleRecommendedPacks.map((pack) => (
                                        <div
                                            key={pack.id}
                                            className="flex-shrink-0 snap-start w-[clamp(280px,85vw,400px)] sm:w-[clamp(320px,60vw,450px)] md:w-[clamp(360px,45vw,500px)]"
                                        >
                                            <PackCard
                                                id={pack.id}
                                                title={pack.title}
                                                description={pack.description}
                                                originalPrice={pack.originalPrice}
                                                packPrice={pack.packPrice}
                                                packImage={pack.packImage}
                                                books={pack.books}
                                                onAddToCart={handleAddPackToCart}
                                            />
                                        </div>
                                    ))}

                                    {/* Render skeleton placeholders for remaining items */}
                                    {(() => {
                                        const totalItems = packsLoading ? 8 : recommendedPacks.length;
                                        const skeletonCount = packsLoading ? 8 : Math.max(0, totalItems - visibleRecommendedPacks.length);

                                        return Array.from({ length: skeletonCount }).map((_, index) => (
                                            <div
                                                key={`skeleton-${index}`}
                                                className="flex-shrink-0 snap-start w-[clamp(280px,85vw,400px)] sm:w-[clamp(320px,60vw,450px)] md:w-[clamp(360px,45vw,500px)]"
                                            >
                                                <PackCardSkeleton />
                                            </div>
                                        ));
                                    })()}
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            {!packsLoading && recommendedPacks.length > 0 && (
                                <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4 gap-4 xs:gap-6">
                                    <div className="flex-1"></div>

                                    <div className="flex-1 flex justify-center">
                                        <PaginationDots
                                            totalDots={recommendedPacks.length}
                                            currentIndex={currentPackIndex}
                                            onDotClick={(index) => {
                                                const container = packsScrollRef.current;
                                                if (container) {
                                                    const itemWidth = container.firstChild?.offsetWidth || 0;
                                                    const gap = parseFloat(getComputedStyle(container).gap) || 0;

                                                    let scrollAmount;
                                                    if (index === 0) {
                                                        scrollAmount = 0;
                                                    } else if (index === recommendedPacks.length - 1) {
                                                        scrollAmount = container.scrollWidth - container.clientWidth;
                                                    } else {
                                                        const itemPosition = index * (itemWidth + gap);
                                                        const centerOffset = (container.clientWidth - itemWidth) / 2;
                                                        scrollAmount = itemPosition - centerOffset;
                                                    }

                                                    container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                                                }
                                            }}
                                        />
                                    </div>

                                    <div className="flex-1 flex justify-end">
                                        <SlideScroll
                                            onPrevious={() => scrollPacks('left')}
                                            onNext={() => scrollPacks('right')}
                                            canScrollLeft={canScrollPacksLeft}
                                            canScrollRight={canScrollPacksRight}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>

            <Footer />

            {/* Cart Confirmation Popup - Single instance at page level */}
            {selectedBook && (
                <CartConfirmationPopup
                    isOpen={showCartPopup}
                    onClose={handleClosePopup}
                    book={selectedBook.isPack ? selectedBook : {
                        id: selectedBook.id,
                        title: selectedBook.title,
                        author: selectedBook.author?.name || 'Unknown',
                        price: selectedBook.price,
                        coverImage: getBookCoverUrl(selectedBook.id),
                        language: selectedBook.language,
                        description: selectedBook.description
                    }}
                    packBooks={selectedBook.isPack ? packBooks : []}
                />
            )}

            {/* Floating Cart Badge - Self-managed, syncs with cart state */}
            <FloatingCartBadge
                onGoToCart={() => navigate('/cart')}
            />
        </main>
    );
};

export default BookDetails;
