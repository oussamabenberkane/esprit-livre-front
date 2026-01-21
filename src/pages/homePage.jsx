import React, { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import CategoryCard from '../components/home/CategoryCard';
import BookCard from '../components/common/BookCard';
import AuthorComponent from '../components/home/author';
import HeroCarousel from '../components/home/HeroSection';
import SeeMore from '../components/buttons/SeeMore';
import SlideScroll from '../components/buttons/SlideScroll';
import PaginationDots from '../components/common/PaginationDots';
import Footer from '../components/common/Footer';
import CartConfirmationPopup from '../components/common/cartConfirmationPopup';
import FloatingCartBadge from '../components/common/FloatingCartBadge';
import CategoryCardSkeleton from '../components/common/skeletons/CategoryCardSkeleton';
import BookCardSkeleton from '../components/common/skeletons/BookCardSkeleton';
import AuthorCardSkeleton from '../components/common/skeletons/AuthorCardSkeleton';
import { fetchCategories, fetchMainDisplays } from '../services/tags.service';
import { fetchBooksByMainDisplay } from '../services/books.service';
import { fetchTopAuthors } from '../services/authors.service';
import { getBookCoverUrl } from '../utils/imageUtils';
import useProgressiveRender from '../hooks/useProgressiveRender';
import { useCart } from '../contexts/CartContext';


// MainDisplayCarousel component for rendering individual carousels
const MainDisplayCarousel = ({ display, onAddToCart, onToggleFavorite, updateScrollState, t, i18n }) => {
    const scrollRef = useRef(null);

    // Progressive rendering for books - show them one at a time
    const { visibleItems: visibleBooks, isRendering } = useProgressiveRender(
        display.books || [],
        display.isLoading || false,
        80 // 80ms delay between each book appearing
    );

    // Calculate total items to show (visible books + remaining skeletons)
    const totalItems = display.isLoading ? 10 : display.books.length;
    const skeletonCount = display.isLoading ? 10 : Math.max(0, totalItems - visibleBooks.length);

    const checkScrollPosition = () => {
        const container = scrollRef.current;
        if (container && visibleBooks.length > 0) {
            const scrollLeft = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            const canScrollLeft = scrollLeft > 0;
            const canScrollRight = scrollLeft < maxScroll - 10;

            // Calculate current index
            let currentIndex;
            if (scrollLeft >= maxScroll - 5) {
                currentIndex = visibleBooks.length - 1;
            } else if (scrollLeft <= 5) {
                currentIndex = 0;
            } else {
                const itemWidth = container.firstChild?.offsetWidth || 0;
                const gap = parseFloat(getComputedStyle(container).gap) || 0;
                const containerCenter = scrollLeft + (container.clientWidth / 2);
                let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));
                currentIndex = Math.max(0, Math.min(activeIndex, visibleBooks.length - 1));
            }

            updateScrollState(display.id, {
                currentIndex,
                canScrollLeft,
                canScrollRight
            });
        }
    };

    const scroll = (direction) => {
        const container = scrollRef.current;
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

    useEffect(() => {
        const container = scrollRef.current;
        if (container) {
            checkScrollPosition();
            container.addEventListener('scroll', checkScrollPosition);
            return () => container.removeEventListener('scroll', checkScrollPosition);
        }
    }, [visibleBooks.length]);

    // Don't render the section at all if there's no data and not loading
    if (!display.isLoading && display.books.length === 0) return null;

    return (
        <section className="w-full section-spacing">
            <div className="container-main container-padding2xl-left-only">
                {/* Header */}
                <div className="flex justify-between items-center mb-fluid-sm pr-fluid-lg">
                    <h2 className="text-brand-blue text-fluid-h2 font-bold">
                        {i18n.language === 'fr'
                            ? (display.nameFr || display.nameEn || t('homePage.recommendedBooks'))
                            : (display.nameEn || display.nameFr || t('homePage.recommendedBooks'))
                        }
                    </h2>
                    <SeeMore to="/allbooks" />
                </div>

                {/* Horizontal Scroll Container with negative margin */}
                <div className="relative -ml-fluid-2xl">
                    <div
                        ref={scrollRef}
                        className="flex pt-fluid-xs pr-fluid-lg pl-fluid-2xl gap-fluid-md overflow-x-auto scrollbar-hide pb-4"
                    >
                        {/* Render visible books */}
                        {visibleBooks.map((book) => {
                            // Extract first ETIQUETTE tag for badge
                            const etiquetteTag = book.tags?.find(tag => tag.type === "ETIQUETTE");
                            const badge = etiquetteTag ? {
                                type: etiquetteTag.nameEn?.toLowerCase(),
                                nameFr: etiquetteTag.nameFr,
                                nameEn: etiquetteTag.nameEn,
                                colorHex: etiquetteTag.colorHex
                            } : null;

                            // Derive stock status from stockQuantity
                            const stockStatus = {
                                available: book.stockQuantity > 0,
                                text: book.stockQuantity > 0 ? t('bookCard.stockStatus.inStock') : t('bookCard.stockStatus.outOfStock')
                            };

                            return (
                                <div
                                    key={book.id}
                                    className="flex-shrink-0 snap-start book-card-width"
                                >
                                    <BookCard
                                        id={book.id}
                                        title={book.title}
                                        author={book.author?.name || 'Unknown Author'}
                                        price={book.price}
                                        coverImage={getBookCoverUrl(book.id)}
                                        badge={badge}
                                        stockStatus={stockStatus}
                                        language={book.language}
                                        stock={book.stockQuantity}
                                        onAddToCart={onAddToCart}
                                        onToggleFavorite={onToggleFavorite}
                                        isFavorited={book.isLikedByCurrentUser}
                                    />
                                </div>
                            );
                        })}

                        {/* Render skeleton placeholders for remaining items */}
                        {Array.from({ length: skeletonCount }).map((_, index) => (
                            <div
                                key={`skeleton-${index}`}
                                className="flex-shrink-0 snap-start book-card-width"
                            >
                                <BookCardSkeleton />
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4 gap-4 xs:gap-6">
                    <div className="flex-1"></div>

                    <div className="flex-1 flex justify-center">
                        <PaginationDots
                            totalDots={totalItems}
                            currentIndex={display.currentIndex}
                            onDotClick={(index) => {
                                updateScrollState(display.id, { currentIndex: index });
                                const container = scrollRef.current;
                                if (container) {
                                    const itemWidth = container.firstChild?.offsetWidth || 0;
                                    const gap = parseFloat(getComputedStyle(container).gap) || 0;

                                    let scrollAmount;

                                    // First dot: scroll to start
                                    if (index === 0) {
                                        scrollAmount = 0;
                                    }
                                    // Last dot: scroll to end
                                    else if (index === totalItems - 1) {
                                        scrollAmount = container.scrollWidth - container.clientWidth;
                                    }
                                    // Middle dots: center the item
                                    else {
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
                            onPrevious={() => scroll('left')}
                            onNext={() => scroll('right')}
                            canScrollLeft={display.canScrollLeft}
                            canScrollRight={display.canScrollRight}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const { addToCart } = useCart();

    // Hero carousel state (you already have this)
    const [currentSlide, setCurrentSlide] = React.useState(0);

    // Cart popup state
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    // Order success state
    const [showOrderSuccess, setShowOrderSuccess] = useState(false);
    const [orderSuccessMessage, setOrderSuccessMessage] = useState('');
    const [orderUniqueId, setOrderUniqueId] = useState('');

    // Navigation handler for categories
    const handleCategoryClick = (categoryId, categoryName) => {
        navigate(`/allbooks?categoryId=${encodeURIComponent(categoryId)}&categoryName=${encodeURIComponent(categoryName)}`);
    };

    // Navigation handler for authors
    const handleAuthorClick = (authorId, authorName) => {
        navigate(`/allbooks?authorId=${encodeURIComponent(authorId)}&authorName=${encodeURIComponent(authorName)}`);
    };

    // Add state for categories section
    const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // Add state for main displays and their books
    const [mainDisplays, setMainDisplays] = useState([]);
    const [mainDisplaysLoading, setMainDisplaysLoading] = useState(true);

    // Add state for authors section
    const [currentAuthorIndex, setCurrentAuthorIndex] = useState(0);
    const [authors, setAuthors] = useState([]);
    const [authorsLoading, setAuthorsLoading] = useState(true);

    const authorsScrollRef = useRef(null);
    const [canScrollAuthorsLeft, setCanScrollAuthorsLeft] = useState(false);
    const [canScrollAuthorsRight, setCanScrollAuthorsRight] = useState(true);
    const categoriesScrollRef = useRef(null);
    const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
    const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(true);

    // Progressive rendering for categories
    const { visibleItems: visibleCategories, isRendering: isCategoriesRendering } = useProgressiveRender(
        categories,
        categoriesLoading,
        100 // 100ms delay between each category
    );

    // Progressive rendering for authors
    const { visibleItems: visibleAuthors, isRendering: isAuthorsRendering } = useProgressiveRender(
        authors,
        authorsLoading,
        100 // 100ms delay between each author
    );

    const checkCategoriesScrollPosition = () => {
        const container = categoriesScrollRef.current;
        if (!container) return;

        // Defensive check: ensure we have rendered items before calculating
        const firstChild = container.firstChild;
        if (!firstChild || visibleCategories.length === 0) {
            // Reset to initial state if no items are visible yet
            setCurrentCategoryIndex(0);
            setCanScrollCategoriesLeft(false);
            setCanScrollCategoriesRight(false);
            return;
        }

        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        setCanScrollCategoriesLeft(scrollLeft > 0);
        setCanScrollCategoriesRight(scrollLeft < maxScroll - 10);

        // If at the very end, set to last index
        if (scrollLeft >= maxScroll - 5) {
            setCurrentCategoryIndex(visibleCategories.length - 1);
        }
        // If at the very start, set to first index
        else if (scrollLeft <= 5) {
            setCurrentCategoryIndex(0);
        }
        // Otherwise, calculate based on center
        else {
            const itemWidth = firstChild.offsetWidth || 0;
            const gap = parseFloat(getComputedStyle(container).gap) || 0;
            const containerCenter = scrollLeft + (container.clientWidth / 2);

            // Calculate which item is centered
            let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));

            // Clamp between 0 and last index
            activeIndex = Math.max(0, Math.min(activeIndex, visibleCategories.length - 1));

            setCurrentCategoryIndex(activeIndex);
        }
    };

    // Update scrollCategories function
    const scrollCategories = (direction) => {
        const container = categoriesScrollRef.current;
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

    // Add scroll check function
    const checkAuthorsScrollPosition = () => {
        const container = authorsScrollRef.current;
        if (!container) return;

        // Defensive check: ensure we have rendered items before calculating
        const firstChild = container.firstChild;
        if (!firstChild || visibleAuthors.length === 0) {
            // Reset to initial state if no items are visible yet
            setCurrentAuthorIndex(0);
            setCanScrollAuthorsLeft(false);
            setCanScrollAuthorsRight(false);
            return;
        }

        const scrollLeft = container.scrollLeft;
        const maxScroll = container.scrollWidth - container.clientWidth;

        setCanScrollAuthorsLeft(scrollLeft > 0);
        setCanScrollAuthorsRight(scrollLeft < maxScroll - 10);

        // If at the very end, set to last index
        if (scrollLeft >= maxScroll - 5) {
            setCurrentAuthorIndex(visibleAuthors.length - 1);
        }
        // If at the very start, set to first index
        else if (scrollLeft <= 5) {
            setCurrentAuthorIndex(0);
        }
        // Otherwise, calculate based on center
        else {
            const itemWidth = firstChild.offsetWidth || 0;
            const gap = parseFloat(getComputedStyle(container).gap) || 0;
            const containerCenter = scrollLeft + (container.clientWidth / 2);

            // Calculate which item is centered
            let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));

            // Clamp between 0 and last index
            activeIndex = Math.max(0, Math.min(activeIndex, visibleAuthors.length - 1));

            setCurrentAuthorIndex(activeIndex);
        }
    };

    // Update scrollAuthors function
    const scrollAuthors = (direction) => {
        const container = authorsScrollRef.current;
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

    // Add useEffect for scroll listener
    useEffect(() => {
        const container = authorsScrollRef.current;
        if (container) {
            checkAuthorsScrollPosition();
            container.addEventListener('scroll', checkAuthorsScrollPosition);
            return () => container.removeEventListener('scroll', checkAuthorsScrollPosition);
        }
    }, [visibleAuthors.length]);

    useEffect(() => {
        const categoriesContainer = categoriesScrollRef.current;
        if (categoriesContainer) {
            checkCategoriesScrollPosition();
            categoriesContainer.addEventListener('scroll', checkCategoriesScrollPosition);
            return () => categoriesContainer.removeEventListener('scroll', checkCategoriesScrollPosition);
        }
    }, [visibleCategories.length]);

    // Initialize scroll state when progressive rendering completes
    useEffect(() => {
        if (!isCategoriesRendering && visibleCategories.length > 0) {
            checkCategoriesScrollPosition();
        }
    }, [isCategoriesRendering]);

    useEffect(() => {
        if (!isAuthorsRendering && visibleAuthors.length > 0) {
            checkAuthorsScrollPosition();
        }
    }, [isAuthorsRendering]);

    useEffect(() => {
        const handleResize = () => {
            // Recalculate active indices on resize
            checkCategoriesScrollPosition();
            checkAuthorsScrollPosition();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const heroImages = [
        {
            src: "/assets/banners/banner2.png",
            alt: "Featured Books Collection",
            overlay: "rgba(0, 65, 122, 0.3)", // Blue overlay matching your theme
            button: t('homePage.hero.discover')
        },
        {
            src: "/assets/banners/banner1.png",
            alt: "Offres spéciales livres",
            overlay: "rgba(0, 0, 0, 0.2)",
            button: t('homePage.hero.newReleases')
        },

    ];

    const handleAddToCart = async (bookId) => {
        console.log(`Added book ${bookId} to cart`);

        // Add to cart using CartContext
        await addToCart(bookId, 1);

        // Find book across all main displays
        let foundBook = null;
        for (const display of mainDisplays) {
            foundBook = display.books.find(b => b.id === bookId);
            if (foundBook) break;
        }

        if (foundBook) {
            setSelectedBook(foundBook);
            setShowCartPopup(true);
        }
    };

    const handleClosePopup = () => {
        setShowCartPopup(false);
    };

    const handleToggleFavorite = (bookId, isFavorited) => {
        console.log(`Book ${bookId} favorited: ${isFavorited}`);
        // Add your favorite logic here
    };




    // Fetch categories from API on component mount
    useEffect(() => {
        const loadCategories = async () => {
            try {
                setCategoriesLoading(true);
                const data = await fetchCategories(10);
                setCategories(data);
            } catch (error) {
                console.error('Failed to load categories:', error);
                // Keep empty array on error
                setCategories([]);
            } finally {
                setCategoriesLoading(false);
            }
        };

        loadCategories();
    }, []);

    // Fetch main displays and their books
    useEffect(() => {
        const loadMainDisplaysAndBooks = async () => {
            try {
                setMainDisplaysLoading(true);
                const displays = await fetchMainDisplays();

                // Initialize displays with loading state
                const initialDisplays = displays.map(display => ({
                    ...display,
                    books: [],
                    isLoading: true,
                    currentIndex: 0,
                    canScrollLeft: false,
                    canScrollRight: false
                }));
                setMainDisplays(initialDisplays);
                setMainDisplaysLoading(false);

                // Fetch books for each main display sequentially to simulate real-time loading
                for (const display of displays) {
                    try {
                        const books = await fetchBooksByMainDisplay(display.id, 0, 10);
                        setMainDisplays(prevDisplays =>
                            prevDisplays.map(d =>
                                d.id === display.id
                                    ? {
                                        ...d,
                                        books: books || [],
                                        isLoading: false,
                                        canScrollRight: (books || []).length > 0
                                    }
                                    : d
                            )
                        );
                    } catch (error) {
                        console.error(`Failed to load books for display ${display.id}:`, error);
                        setMainDisplays(prevDisplays =>
                            prevDisplays.map(d =>
                                d.id === display.id
                                    ? { ...d, books: [], isLoading: false }
                                    : d
                            )
                        );
                    }
                }
            } catch (error) {
                console.error('Failed to load main displays:', error);
                setMainDisplays([]);
                setMainDisplaysLoading(false);
            }
        };

        loadMainDisplaysAndBooks();
    }, []);

    // Update scroll state for a specific main display
    const updateMainDisplayScrollState = (displayId, updates) => {
        setMainDisplays(prevDisplays =>
            prevDisplays.map(display =>
                display.id === displayId
                    ? { ...display, ...updates }
                    : display
            )
        );
    };


    // Fetch authors from API on component mount
    useEffect(() => {
        const loadAuthors = async () => {
            try {
                setAuthorsLoading(true);
                const data = await fetchTopAuthors(10);
                setAuthors(data);
            } catch (error) {
                console.error('Failed to load authors:', error);
                setAuthors([]);
            } finally {
                setAuthorsLoading(false);
            }
        };

        loadAuthors();
    }, []);

    // Check for order success state from navigation
    useEffect(() => {
        if (location.state?.orderSuccess) {
            setShowOrderSuccess(true);
            setOrderSuccessMessage(location.state.message);
            setOrderUniqueId(location.state.orderUniqueId);

            // Clear the navigation state to prevent showing the message again on refresh
            window.history.replaceState({}, document.title);

            // Auto-hide success message after 10 seconds
            const timer = setTimeout(() => {
                setShowOrderSuccess(false);
            }, 10000);

            return () => clearTimeout(timer);
        }

        // Check for profile completed state (first-time user with no linked orders)
        if (location.state?.profileCompleted) {
            setShowOrderSuccess(true);
            setOrderSuccessMessage(t('homePage.profileCompleted'));
            setOrderUniqueId('');

            // Clear the navigation state
            window.history.replaceState({}, document.title);

            // Auto-hide success message after 5 seconds
            const timer = setTimeout(() => {
                setShowOrderSuccess(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [location, t]);

    return (

        <main className="w-full max-w-[100vw] overflow-x-hidden">
            <div className="min-h-screen bg-white">
                {/* Navigation Bar */}
                <section className="w-full max-w-[100vw] overflow-x-hidden"><Navbar /></section>


                <div className="h-20"></div>

                {/* Order Success Alert */}
                <AnimatePresence>
                    {showOrderSuccess && (
                        <motion.div
                            initial={{ opacity: 0, y: -50 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -50 }}
                            className="fixed top-20 xs:top-24 left-1/2 transform -translate-x-1/2 z-50 w-[95%] xs:w-[90%] max-w-lg px-2 xs:px-0"
                        >
                            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg shadow-lg p-3 xs:p-4 md:p-6">
                                <div className="flex items-start gap-2 xs:gap-3">
                                    <div className="flex-shrink-0 w-6 h-6 xs:w-8 xs:h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                                        <CheckCircle className="w-4 h-4 xs:w-5 xs:h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-emerald-900 font-bold text-sm xs:text-base md:text-fluid-h3 mb-1 leading-tight">
                                            {t('cart.orderSuccessTitle') || 'Order Placed Successfully!'}
                                        </h3>
                                        <p className="text-emerald-800 text-xs xs:text-sm md:text-fluid-small mb-2 leading-relaxed break-words">
                                            {orderSuccessMessage}
                                        </p>
                                        {orderUniqueId && (
                                            <p className="text-emerald-700 text-[10px] xs:text-xs md:text-fluid-xs font-mono bg-emerald-100 px-1.5 xs:px-2 py-0.5 xs:py-1 rounded inline-block break-all">
                                                {t('cart.orderNumber') || 'Order #'}: {orderUniqueId}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => setShowOrderSuccess(false)}
                                        className="flex-shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors p-1"
                                    >
                                        <X className="w-4 h-4 xs:w-5 xs:h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <section className="w-full mt-[-14px] max-w-[100vw]">
                    <HeroCarousel
                        images={heroImages}
                        height="hero-height"
                        className="shadow-lg"
                        currentSlide={currentSlide}
                        onSlideChange={setCurrentSlide}
                    />
                    <div className="mt-4 mb-4">
                        <PaginationDots
                            totalDots={heroImages.length}
                            currentIndex={currentSlide}
                            onDotClick={(index) => setCurrentSlide(index)}
                        />
                    </div>
                </section>

                {/* Main Content */}


                <section className="w-full section-spacing">
                    {/* Categories Section */}
                    <div className="container-main container-padding2xl-left-only">
                        {/* Greeting Section */}
                        <div className="flex items-center justify-between pr-fluid-lg">
                            <div>
                                <h1 className="font-['Poppins'] font-bold text-[#00417a] text-fluid-h1to2 mb-0">
                                    {t('homePage.greeting')}
                                </h1>

                            </div>

                            <SeeMore to="/allbooks" />

                        </div>
                        <p className="font-['Poppins'] font-[550] text-[#00417a] text-fluid-small" >
                            {t('homePage.categoriesSubtitle')}
                        </p>



                        <div
                            className="relative -ml-fluid-2xl" // Negative left margin to extend left
                        >
                            <div
                                ref={categoriesScrollRef}
                                className="flex pt-fluid-lg pl-fluid-2xl pr-fluid-lg gap-fluid-lg overflow-x-auto pb-4 scrollbar-hide"
                            >
                                {/* Render visible categories */}
                                {visibleCategories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex-shrink-0 snap-start cursor-pointer"
                                        onClick={() => handleCategoryClick(category.id, category.nameFr || category.nameEn)}
                                    >
                                        <CategoryCard
                                            categoryId={category.id}
                                            nameFr={category.nameFr}
                                            nameEn={category.nameEn}
                                            imageSrc={category.imageUrl} />
                                    </div>
                                ))}

                                {/* Render skeleton placeholders */}
                                {categoriesLoading && Array.from({ length: 10 }).map((_, index) => (
                                    <div
                                        key={`skeleton-${index}`}
                                        className="flex-shrink-0 snap-start"
                                    >
                                        <CategoryCardSkeleton />
                                    </div>
                                ))}

                                {/* Render remaining skeletons while items are appearing */}
                                {!categoriesLoading && isCategoriesRendering &&
                                    Array.from({ length: categories.length - visibleCategories.length }).map((_, index) => (
                                        <div
                                            key={`skeleton-rendering-${index}`}
                                            className="flex-shrink-0 snap-start"
                                        >
                                            <CategoryCardSkeleton />
                                        </div>
                                    ))
                                }

                                {/* Empty state */}
                                {!categoriesLoading && categories.length === 0 && (
                                    <div className="flex-1 flex justify-center items-center py-fluid-lg">
                                        <p className="text-brand-blue">{t('common.noData')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4 gap-4 xs:gap-6">
                            <div className="flex-1"></div>

                            <div className="flex-1 flex justify-center">
                                {!categoriesLoading && categories.length > 0 && (
                                    <PaginationDots
                                        totalDots={categories.length}
                                        currentIndex={currentCategoryIndex}
                                        onDotClick={(index) => {
                                            setCurrentCategoryIndex(index);
                                            const container = categoriesScrollRef.current;
                                            if (container) {
                                                const itemWidth = container.firstChild?.offsetWidth || 0;
                                                const gap = parseFloat(getComputedStyle(container).gap) || 0;

                                                let scrollAmount;

                                                // First dot: scroll to start
                                                if (index === 0) {
                                                    scrollAmount = 0;
                                                }
                                                // Last dot: scroll to end
                                                else if (index === categories.length - 1) {
                                                    scrollAmount = container.scrollWidth - container.clientWidth;
                                                }
                                                // Middle dots: center the item
                                                else {
                                                    const itemPosition = index * (itemWidth + gap);
                                                    const centerOffset = (container.clientWidth - itemWidth) / 2;
                                                    scrollAmount = itemPosition - centerOffset;
                                                }

                                                container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                                            }
                                        }}
                                    />
                                )}
                            </div>

                            <div className="flex-1 flex justify-end">
                                {!categoriesLoading && categories.length > 0 && (
                                    <SlideScroll
                                        onPrevious={() => scrollCategories('left')}
                                        onNext={() => scrollCategories('right')}
                                        canScrollLeft={canScrollCategoriesLeft}
                                        canScrollRight={canScrollCategoriesRight}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </section>



                {/* Dynamic Main Display Carousels */}
                {mainDisplaysLoading ? (
                    <section className="w-full section-spacing">
                        <div className="container-main container-padding2xl-left-only">
                            <div className="flex-1 flex justify-center items-center py-fluid-lg">
                                <p className="text-brand-blue">{t('common.loading')}</p>
                            </div>
                        </div>
                    </section>
                ) : mainDisplays.length === 0 ? (
                    <section className="w-full section-spacing">
                        <div className="container-main container-padding2xl-left-only">
                            <div className="flex-1 flex justify-center items-center py-fluid-lg">
                                <p className="text-brand-blue">{t('common.noData')}</p>
                            </div>
                        </div>
                    </section>
                ) : (
                    mainDisplays.map((display) => (
                        <MainDisplayCarousel
                            key={display.id}
                            display={display}
                            onAddToCart={handleAddToCart}
                            onToggleFavorite={handleToggleFavorite}
                            updateScrollState={updateMainDisplayScrollState}
                            t={t}
                            i18n={i18n}
                        />
                    ))
                )}

                <section className="w-full section-spacing">
                    <div className="container-main container-padding2xl-left-only">

                        <div className="mb-fluid-md flex items-center justify-between pr-fluid-lg">
                            <p className="font-['Poppins'] font-bold text-[#00417a] text-fluid-h2" >
                                {t('homePage.featuredAuthors')}
                            </p>
                            <SeeMore to="/allbooks" />


                        </div>


                        <div className="relative -ml-fluid-2xl">
                            <div
                                ref={authorsScrollRef}
                                className="flex gap-fluid-sm pl-fluid-2xl pr-fluid-lg overflow-x-auto scrollbar-hide pt-fluid-xs pb-4"
                            >
                                {/* Render visible authors */}
                                {visibleAuthors.map((author) => (
                                    <div
                                        key={author.id}
                                        className="flex-shrink-0 snap-start cursor-pointer"
                                        onClick={() => handleAuthorClick(author.id, author.name)}
                                    >
                                        <AuthorComponent
                                            authorId={author.id}
                                            authorImage={author.profilePictureUrl}
                                            authorName={author.name}
                                        />
                                    </div>
                                ))}

                                {/* Render skeleton placeholders */}
                                {authorsLoading && Array.from({ length: 10 }).map((_, index) => (
                                    <div
                                        key={`skeleton-${index}`}
                                        className="flex-shrink-0 snap-start"
                                    >
                                        <AuthorCardSkeleton />
                                    </div>
                                ))}

                                {/* Render remaining skeletons while items are appearing */}
                                {!authorsLoading && isAuthorsRendering &&
                                    Array.from({ length: authors.length - visibleAuthors.length }).map((_, index) => (
                                        <div
                                            key={`skeleton-rendering-${index}`}
                                            className="flex-shrink-0 snap-start"
                                        >
                                            <AuthorCardSkeleton />
                                        </div>
                                    ))
                                }

                                {/* Empty state */}
                                {!authorsLoading && authors.length === 0 && (
                                    <div className="flex-1 flex justify-center items-center py-fluid-lg">
                                        <p className="text-brand-blue">{t('common.noData')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4 gap-4 xs:gap-6">
                            <div className="flex-1"></div>

                            <div className="flex-1 flex justify-center">
                                {!authorsLoading && authors.length > 0 && (
                                    <PaginationDots
                                        totalDots={authors.length}
                                        currentIndex={currentAuthorIndex}
                                        onDotClick={(index) => {
                                            setCurrentAuthorIndex(index);
                                            const container = authorsScrollRef.current;
                                            if (container) {
                                                const itemWidth = container.firstChild?.offsetWidth || 0;
                                                const gap = parseFloat(getComputedStyle(container).gap) || 0;

                                                let scrollAmount;

                                                // First dot: scroll to start
                                                if (index === 0) {
                                                    scrollAmount = 0;
                                                }
                                                // Last dot: scroll to end
                                                else if (index === authors.length - 1) {
                                                    scrollAmount = container.scrollWidth - container.clientWidth;
                                                }
                                                // Middle dots: center the item
                                                else {
                                                    const itemPosition = index * (itemWidth + gap);
                                                    const centerOffset = (container.clientWidth - itemWidth) / 2;
                                                    scrollAmount = itemPosition - centerOffset;
                                                }

                                                container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                                            }
                                        }}
                                    />
                                )}
                            </div>

                            <div className="flex-1 flex justify-end">
                                {!authorsLoading && authors.length > 0 && (
                                    <SlideScroll
                                        onPrevious={() => scrollAuthors('left')}
                                        onNext={() => scrollAuthors('right')}
                                        canScrollLeft={canScrollAuthorsLeft}
                                        canScrollRight={canScrollAuthorsRight}
                                    />
                                )}
                            </div>
                        </div>


                    </div>
                </section>


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
                        author: selectedBook.author?.name || 'Unknown Author',
                        price: selectedBook.price,
                        coverImage: getBookCoverUrl(selectedBook.id),
                        language: selectedBook.language
                    }}
                />
            )}

            {/* Floating Cart Badge - Self-managed, syncs with cart state */}
            <FloatingCartBadge
                onGoToCart={() => navigate('/cart')}
            />
        </main>
    );



};

export default HomePage;