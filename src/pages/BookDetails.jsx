import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ShoppingCart, CheckCircle2, ChevronDown } from 'lucide-react';
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
import { BOOKS_DATA, getLanguageCode } from '../data/booksData';
import { getRecommendedPacksForBook } from '../services/bookPackService';
import { getBooksByIds } from '../services/bookService';

const BookDetails = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams(); // Get book ID from URL

    // Find the book based on URL parameter
    const [book, setBook] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Scroll to top when book ID changes
        window.scrollTo(0, 0);

        // Simulate API call - in production, replace with actual API fetch
        const fetchBook = () => {
            setLoading(true);

            // Find book by ID (convert string ID from URL to number)
            const foundBook = BOOKS_DATA.find(b => b.id === parseInt(id));

            if (foundBook) {
                setBook(foundBook);
            } else {
                setBook(null);
            }

            setLoading(false);
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
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const descriptionRef = useRef(null);
    const bookDetailsRef = useRef(null);

    // Cart popup state
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    // Floating cart badge state
    const [showFloatingBadge, setShowFloatingBadge] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);

    // Recommended books - exclude current book (backend will provide this later)
    const [recommendedBooks, setRecommendedBooks] = useState([]);

    // Load recommended books when ID changes
    useEffect(() => {
        // Simulate backend call - replace with actual API call
        const books = BOOKS_DATA.filter(b => b.id !== parseInt(id)).slice(0, 8);
        setRecommendedBooks(books);
    }, [id]);

    // Pack recommendations state
    const [recommendedPacks, setRecommendedPacks] = useState([]);
    const [currentPackIndex, setCurrentPackIndex] = useState(0);
    const packsScrollRef = useRef(null);
    const [canScrollPacksLeft, setCanScrollPacksLeft] = useState(false);
    const [canScrollPacksRight, setCanScrollPacksRight] = useState(true);
    const [packsLoading, setPacksLoading] = useState(true);

    // Fetch pack recommendations for the current book
    useEffect(() => {
        const fetchPacks = async () => {
            // Don't fetch if no book is loaded
            if (!book?.id) {
                setRecommendedPacks([]);
                setPacksLoading(false);
                return;
            }

            try {
                setPacksLoading(true);

                // Fetch recommended packs for the current book
                const response = await getRecommendedPacksForBook(book.id, {
                    page: 0,
                    size: 8
                });
                const packsData = response.content || response;

                // For each pack, fetch the full book details
                const packsWithBooks = await Promise.all(
                    packsData.map(async (pack) => {
                        try {
                            const bookIds = pack.books || [];

                            // Skip fetching if no books in pack
                            if (bookIds.length === 0) {
                                return {
                                    ...pack,
                                    books: [],
                                    originalPrice: parseFloat(pack.price) || 0,
                                    packPrice: parseFloat(pack.price) || 0,
                                    packImage: pack.coverImageUrl || null
                                };
                            }

                            // Fetch full details for all books in the pack
                            const booksDetails = await getBooksByIds(bookIds);

                            // Calculate original price from individual book prices
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
                                    coverImage: book.coverImageUrl
                                })),
                                originalPrice: originalPrice,
                                packPrice: parseFloat(pack.price) || 0,
                                packImage: pack.coverImageUrl || null
                            };
                        } catch (err) {
                            console.error(`Error fetching books for pack ${pack.id}:`, err);
                            // Return pack with minimal data if book fetching fails
                            return {
                                ...pack,
                                books: [],
                                originalPrice: parseFloat(pack.price) || 0,
                                packPrice: parseFloat(pack.price) || 0,
                                packImage: pack.coverImageUrl || null
                            };
                        }
                    })
                );

                setRecommendedPacks(packsWithBooks);
            } catch (err) {
                console.error('Error fetching recommended packs:', err);
                setRecommendedPacks([]);
            } finally {
                setPacksLoading(false);
            }
        };

        fetchPacks();
    }, [book?.id]); // Re-fetch when the book ID changes

    // Scroll handlers
    const checkBooksScrollPosition = () => {
        const container = booksScrollRef.current;
        if (!container || recommendedBooks.length === 0) return;

        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        setCanScrollBooksLeft(scrollLeft > 0);
        setCanScrollBooksRight(scrollLeft < maxScroll - 10);

        // If at the very end, set to last index
        if (scrollLeft >= maxScroll - 5) {
            setCurrentBookIndex(recommendedBooks.length - 1);
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
            activeIndex = Math.max(0, Math.min(activeIndex, recommendedBooks.length - 1));

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
        if (!container || recommendedPacks.length === 0) return;

        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        setCanScrollPacksLeft(scrollLeft > 0);
        setCanScrollPacksRight(scrollLeft < maxScroll - 10);

        if (scrollLeft >= maxScroll - 5) {
            setCurrentPackIndex(recommendedPacks.length - 1);
        } else if (scrollLeft <= 5) {
            setCurrentPackIndex(0);
        } else {
            const itemWidth = container.firstChild?.offsetWidth || 0;
            const gap = parseFloat(getComputedStyle(container).gap) || 0;
            const containerCenter = scrollLeft + (container.clientWidth / 2);

            let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));
            activeIndex = Math.max(0, Math.min(activeIndex, recommendedPacks.length - 1));

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
        if (recommendedBooks.length === 0) return;

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
    }, [recommendedBooks]);

    // Setup scroll listeners for packs when loaded
    useEffect(() => {
        if (recommendedPacks.length === 0) return;

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
    }, [recommendedPacks]);

    const handleAddToCart = (bookId) => {
        console.log(`Added book ${bookId} to cart`);
        const bookToAdd = recommendedBooks.find(b => b.id === bookId);
        if (bookToAdd) {
            setSelectedBook({
                ...bookToAdd,
                coverImage: bookToAdd.coverImageUrl
            });
            setPackBooks([]); // Clear pack books for regular books
            setShowCartPopup(true);
            // Increment cart count
            setCartItemCount(prev => prev + 1);
        }
    };

    const handleClosePopup = () => {
        setShowCartPopup(false);
        // Show floating badge after popup closes
        setShowFloatingBadge(true);
    };

    const handleToggleFavorite = (bookId, isFavorited) => {
        console.log(`Book ${bookId} favorited: ${isFavorited}`);
    };

    // Pack books for popup (store separately from selectedBook)
    const [packBooks, setPackBooks] = useState([]);

    const handleAddPackToCart = (packId) => {
        const pack = recommendedPacks.find(p => p.id === packId);
        if (pack) {
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
            setCartItemCount(prev => prev + 1);
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleAddMainBookToCart = () => {
        console.log(`Added main book ${book.id} to cart`);
        setSelectedBook({
            ...book,
            coverImage: book.coverImageUrl
        });
        setPackBooks([]); // Clear pack books for regular books
        setShowCartPopup(true);
        // Increment cart count
        setCartItemCount(prev => prev + 1);
    };

    const handleToggleDescription = () => {
        if (showFullDescription) {
            // Closing: trigger fade-out animation
            setIsAnimatingOut(true);

            // Scroll back to book details smoothly
            setTimeout(() => {
                bookDetailsRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 50);

            // Wait for animation to complete before hiding
            setTimeout(() => {
                setShowFullDescription(false);
                setIsAnimatingOut(false);
            }, 300); // Match animation duration
        } else {
            // Opening: show and fade in
            setShowFullDescription(true);

            // Smooth scroll to bottom of description after rendering
            setTimeout(() => {
                if (descriptionRef.current) {
                    const descRect = descriptionRef.current.getBoundingClientRect();
                    const extraPadding = 48; // Extra space below description

                    window.scrollTo({
                        top: window.scrollY + descRect.bottom - window.innerHeight + extraPadding,
                        behavior: 'smooth'
                    });
                }
            }, 350); // Wait for fade-in animation to mostly complete
        }
    };

    // Loading state
    if (loading) {
        return (
            <main className="w-full max-w-[100vw] overflow-x-hidden">
                <div className="min-h-screen bg-white">
                    <section className="w-full max-w-[100vw] overflow-x-hidden">
                        <Navbar />
                    </section>
                    <div className="h-20"></div>
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#00417a] mx-auto mb-4"></div>
                            <p className="font-['Poppins'] text-[#626e82] text-fluid-body">{t('bookDetails.loading')}</p>
                        </div>
                    </div>
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
                    <section className="w-full max-w-[100vw] overflow-x-hidden">
                        <Navbar />
                    </section>
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
                <section className="w-full max-w-[100vw] overflow-x-hidden">
                    <Navbar />
                </section>

                <div className="h-20"></div>

                {/* Book Details Section */}
                <section className="w-full section-spacing" ref={bookDetailsRef}>
                    {/* Mobile Layout (< md) - Vertical Stacking */}
                    <div className="md:hidden container-main container-padding">
                        {/* Back Button */}
                        <button
                            onClick={handleBackClick}
                            className="flex items-center gap-2 text-[#626e82] hover:text-[#1c2d55] transition-colors mb-fluid-md"
                            aria-label="Retour"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Book Title */}
                        <h1 className="font-['Poppins'] font-bold text-[#1c2d55] text-fluid-h1to2 mb-fluid-xxs">
                            {book.title}
                        </h1>

                        {/* Author */}
                        <p className="font-['Poppins'] font-semibold text-[#626e82] text-fluid-small mb-fluid-md">
                            {t('bookDetails.author')} {book.author.name}
                        </p>

                        {/* Book Image */}
                        <div className="flex justify-center mb-fluid-md">
                            <div className="w-[150px] aspect-[5/7] rounded-md shadow-[0px_5px_20px_0px_rgba(0,0,0,0.25)] overflow-hidden">
                                <img
                                    src={book.coverImageUrl}
                                    alt={book.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        {/* Book Information */}
                        <div className="flex flex-col gap-fluid-sm">
                            {/* Price Card */}
                            <div className="bg-neutral-100 rounded-md p-fluid-sm">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h2 className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-medium leading-tight flex-1">
                                        {book.title}
                                    </h2>
                                    {book.language && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex-shrink-0">
                                            {getLanguageCode(book.language)}
                                        </span>
                                    )}
                                </div>
                                <div className="text-right">
                                    <span className="font-['Poppins'] font-extrabold text-[#1c2d55] text-fluid-medium">
                                        {book.price}
                                    </span>
                                    <span className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-vsmall ml-1">
                                        DZD
                                    </span>
                                </div>
                            </div>

                            {/* Details Card */}
                            <div className="border border-[#c9cfd8] rounded-md p-fluid-sm">
                                {/* Seller */}
                                <p className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-medium md:text-fluid-medium mb-fluid-xxs">
                                    {t('bookDetails.soldBy', { seller: book.seller })}
                                </p>

                                {/* Condition */}
                                <div className="flex items-center gap-2 mb-fluid-sm">
                                    <p className="font-['Poppins'] font-semibold lg:font-bold text-[#1c2d55] text-fluid-small">
                                        {t('bookDetails.condition', { condition: book.condition })}
                                    </p>
                                </div>

                                {/* Stock Status */}
                                <div className="flex items-center gap-1 mb-fluid-xs">
                                    <CheckCircle2 className="w-3 h-3 text-[#198919]" />
                                    <span className="font-['Poppins'] font-bold text-[#198919] text-fluid-tag">
                                        {t('bookDetails.inStock')}
                                    </span>
                                </div>

                                {/* Delivery Estimate */}
                                <p className="font-['Poppins'] font-semibold text-[#626e82] text-fluid-small mb-fluid-md">
                                    {t('bookDetails.estimatedDelivery', { date: book.estimatedDelivery })}
                                </p>

                                {/* Add to Cart Button */}
                                <button
                                    onClick={handleAddMainBookToCart}
                                    className="w-[85%] mx-auto bg-[#ee0027] hover:bg-[#d00022] text-white font-['Poppins'] font-extrabold text-fluid-vsmall rounded-md py-2 px-4 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <span>{t('bookDetails.addToCart')}</span>
                                    <ShoppingCart className="w-4 h-4" />
                                </button>
                            </div>

                            {/* View Full Description Link - Below Details on Mobile */}
                            <button
                                onClick={handleToggleDescription}
                                className="font-['Poppins'] font-medium text-[#626e82] text-fluid-vsmall hover:text-[#1c2d55] transition-colors flex items-center gap-1 w-full"
                            >
                                <span className="flex-1 text-left"><h1 className="text-fluid-body whitespace-nowrap">{t('bookDetails.viewFullDescription')}</h1></span>
                                <ChevronDown className={`w-6 h-6 flex-shrink-0 transition-transform duration-300 ${showFullDescription ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {/* Tablet & Desktop Layout (>= md) - Horizontal with Side Margins */}
                    <div className="hidden md:block">
                        <div className="container-main px-fluid-xl lg:px-[8rem]">
                            {/* Back Button */}
                            <button
                                onClick={handleBackClick}
                                className="flex items-center gap-2 text-[#626e82] hover:text-[#1c2d55] transition-colors mb-fluid-md"
                                aria-label="Retour"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Book Title */}
                            <h1 className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-h2 mb-fluid-xxs">
                                {book.title}
                            </h1>

                            {/* Author */}
                            <p className="font-['Poppins'] font-normal text-[#626e82] text-fluid-small mb-fluid-md">
                                {t('bookDetails.author')} {book.author.name}
                            </p>

                            {/* Horizontal Layout with Equal Left Margins */}
                            <div className="flex gap-fluid-md items-stretch max-w-5xl ml-fluid-2xl">
                                {/* Left Column - Book Image with Description Link */}
                                <div className="flex-shrink-0 flex flex-col gap-fluid-sm pl-fluid-sm">
                                    <div className="w-[180px] lg:w-[220px] aspect-[5/7] rounded-md shadow-[0px_5px_20px_0px_rgba(0,0,0,0.25)] overflow-hidden">
                                        <img
                                            src={book.coverImageUrl}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* View Full Description Link - Below Image on Desktop */}
                                    <button
                                        onClick={handleToggleDescription}
                                        className="font-['Poppins'] font-medium text-[#626e82] text-fluid-vsmall hover:text-[#1c2d55] transition-colors flex items-center gap-1 w-full"
                                    >
                                        <span className="flex-1 text-left"><h1 className='text-fluid-h3 whitespace-nowrap'>{t('bookDetails.viewFullDescription')}</h1></span>
                                        <ChevronDown className={`w-3 h-3 flex-shrink-0 transition-transform duration-300 ${showFullDescription ? 'rotate-180' : ''}`} />
                                    </button>
                                </div>

                                {/* Right Column - Book Information (Extended Height) */}
                                <div className="flex flex-col gap-fluid-sm flex-1 min-w-0 pl-fluid-sm">
                                    {/* Price Card */}
                                    <div className="bg-neutral-100 rounded-md p-fluid-sm">
                                        <div className="flex items-start justify-between gap-4 mb-2">
                                            <h2 className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-medium leading-tight flex-1">
                                                {book.title}
                                            </h2>
                                            {book.language && (
                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded flex-shrink-0">
                                                    {getLanguageCode(book.language)}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <span className="font-['Poppins'] font-extrabold text-[#1c2d55] text-fluid-medium">
                                                {book.price}
                                            </span>
                                            <span className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-vsmall ml-1">
                                                DZD
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details Card - Extended to Match Image Height */}
                                    <div className="border border-[#c9cfd8] rounded-md p-fluid-md flex-1 flex flex-col justify-between">
                                        <div>
                                            {/* Seller */}
                                            <p className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-medium mb-fluid-xxs">
                                                {t('bookDetails.soldBy', { seller: book.seller })}
                                            </p>

                                            {/* Condition */}
                                            <div className="flex items-center gap-2 mb-fluid-md">
                                                <p className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-small">
                                                    {t('bookDetails.condition', { condition: book.condition })}
                                                </p>
                                            </div>

                                            {/* Stock Status */}
                                            <div className="flex items-center gap-1 mb-fluid-xxs">
                                                <CheckCircle2 className="w-3 h-3 text-[#198919]" />
                                                <span className="font-['Poppins'] font-bold text-[#198919] text-fluid-vsmall">
                                                    {t('bookDetails.inStock')}
                                                </span>
                                            </div>

                                            {/* Delivery Estimate */}
                                            <p className="font-['Poppins'] font-semibold text-[#626e82] text-fluid-small mb-fluid-md">
                                                {t('bookDetails.estimatedDelivery', { date: book.estimatedDelivery })}
                                            </p>
                                        </div>

                                        {/* Add to Cart Button - Aligned to Bottom */}
                                        <button
                                            onClick={handleAddMainBookToCart}
                                            className="w-[85%] mx-auto bg-[#ee0027] hover:bg-[#d00022] text-white font-['Poppins'] font-extrabold text-fluid-vsmall rounded-md py-2 px-4 flex items-center justify-center gap-2 transition-colors mb-fluid-sm mt-auto"
                                        >
                                            <span>{t('bookDetails.addToCart')}</span>
                                            <ShoppingCart className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Full Description Section - Shows when toggled */}
                    {showFullDescription && (
                        <div
                            ref={descriptionRef}
                            className={`mt-fluid-lg transition-all duration-300 ease-in-out ${
                                isAnimatingOut
                                    ? 'animate-fade-out'
                                    : 'animate-fade-in'
                            }`}
                            style={{ animationDuration: '300ms' }}
                        >
                            {/* Mobile Layout */}
                            <div className="md:hidden container-main container-padding">
                                <div className="bg-gray-50 rounded-md p-fluid-md border border-gray-200 shadow-sm">
                                    <h3 className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-h3 mb-fluid-sm">
                                        {t('bookDetails.fullDescription')}
                                    </h3>
                                    <p className="font-['Poppins'] font-normal text-[#626e82] text-fluid-small leading-relaxed whitespace-pre-line">
                                        {book.description}
                                    </p>
                                </div>
                            </div>

                            {/* Desktop Layout - Match width of image + details box */}
                            <div className="hidden md:block">
                                <div className="container-main px-fluid-xl lg:px-[8rem]">
                                    <div className="max-w-5xl ml-fluid-2xl">
                                        <div className="bg-gray-50 rounded-md p-fluid-md border border-gray-200 shadow-sm">
                                            <h3 className="font-['Poppins'] font-semibold text-[#1c2d55] text-fluid-h3 mb-fluid-sm">
                                                {t('bookDetails.fullDescription')}
                                            </h3>
                                            <p className="font-['Poppins'] font-normal text-[#626e82] text-fluid-small leading-relaxed whitespace-pre-line">
                                                {book.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </section>

                {/* Recommended Books Section */}
                <section className="w-full section-spacing bg-white">
                    <div className="container-main container-padding2xl-left-only">

                        {/* Header */}
                        <div className="flex justify-between items-center mb-fluid-sm pr-fluid-lg">
                            <h2 className="text-brand-blue text-fluid-h2 font-bold">
                                {t('bookDetails.recommendations')}
                            </h2>
                            <SeeMore to="/allbooks" />
                        </div>

                        {/* Horizontal Scroll Container with negative margin */}
                        <div className="relative -ml-fluid-2xl">
                            <div
                                ref={booksScrollRef}
                                className="flex pt-fluid-xs pr-fluid-lg pl-fluid-2xl gap-fluid-md overflow-x-auto scrollbar-hide pb-4"
                            >
                                {recommendedBooks.map((recommendedBook) => {
                                    const etiquetteTag = recommendedBook.tags.find(tag => tag.type === "ETIQUETTE");
                                    const badge = etiquetteTag ? {
                                        type: etiquetteTag.nameEn.toLowerCase(),
                                        text: etiquetteTag.nameFr,
                                        colorHex: etiquetteTag.colorHex
                                    } : null;

                                    const stockStatus = {
                                        available: recommendedBook.stockQuantity > 0,
                                        text: recommendedBook.stockQuantity > 0 ? t('bookCard.stockStatus.inStock') : t('bookCard.stockStatus.outOfStock')
                                    };

                                    return (
                                        <div
                                            key={recommendedBook.id}
                                            className="flex-shrink-0 snap-start book-card-width"
                                        >
                                            <BookCard
                                                id={recommendedBook.id}
                                                title={recommendedBook.title}
                                                author={recommendedBook.author.name}
                                                price={recommendedBook.price}
                                                coverImage={recommendedBook.coverImageUrl}
                                                badge={badge}
                                                stockStatus={stockStatus}
                                                language={recommendedBook.language}
                                                onAddToCart={handleAddToCart}
                                                onToggleFavorite={handleToggleFavorite}
                                                isFavorited={recommendedBook.isLikedByCurrentUser}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Pagination Controls */}
                        <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4">
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
                    </div>
                </section>

                {/* Pack Recommendations Section */}
                {!packsLoading && recommendedPacks.length > 0 && (
                    <section className="w-full section-spacing bg-white">
                        <div className="container-main container-padding2xl-left-only">

                            {/* Header */}
                            <div className="flex justify-between items-center mb-fluid-sm pr-fluid-lg">
                                <h2 className="text-brand-blue text-fluid-h2 font-bold">
                                    {t('bookDetails.packRecommendations')}
                                </h2>
                                <SeeMore to="/packs" />
                            </div>

                            {/* Horizontal Scroll Container with negative margin */}
                            <div className="relative -ml-fluid-2xl">
                                <div
                                    ref={packsScrollRef}
                                    className="flex pt-fluid-xs pr-fluid-lg pl-fluid-2xl gap-fluid-md overflow-x-auto scrollbar-hide pb-4"
                                >
                                    {recommendedPacks.map((pack) => (
                                        <div
                                            key={pack.id}
                                            className="flex-shrink-0 snap-start"
                                            style={{ width: 'clamp(280px, 45vw, 500px)' }}
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
                                </div>
                            </div>

                            {/* Pagination Controls */}
                            <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4">
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
                        author: selectedBook.author.name,
                        price: selectedBook.price,
                        coverImage: selectedBook.coverImageUrl,
                        language: selectedBook.language
                    }}
                    packBooks={selectedBook.isPack ? packBooks : []}
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
    );
};

export default BookDetails;
