import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
import { fetchCategories, fetchMainDisplays, fetchBooksByMainDisplay } from '../services/tagsService';


// MainDisplayCarousel component for rendering individual carousels
const MainDisplayCarousel = ({ display, onAddToCart, onToggleFavorite, updateScrollState, t }) => {
    const scrollRef = useRef(null);

    const checkScrollPosition = () => {
        const container = scrollRef.current;
        if (container && display.books.length > 0) {
            const scrollLeft = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            const canScrollLeft = scrollLeft > 0;
            const canScrollRight = scrollLeft < maxScroll - 10;

            // Calculate current index
            let currentIndex;
            if (scrollLeft >= maxScroll - 5) {
                currentIndex = display.books.length - 1;
            } else if (scrollLeft <= 5) {
                currentIndex = 0;
            } else {
                const itemWidth = container.firstChild?.offsetWidth || 0;
                const gap = parseFloat(getComputedStyle(container).gap) || 0;
                const containerCenter = scrollLeft + (container.clientWidth / 2);
                let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));
                currentIndex = Math.max(0, Math.min(activeIndex, display.books.length - 1));
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
    }, [display.books.length]);

    if (display.books.length === 0) return null;

    return (
        <section className="w-full section-spacing">
            <div className="container-main container-padding2xl-left-only">
                {/* Header */}
                <div className="flex justify-between items-center mb-fluid-sm pr-fluid-lg">
                    <h2 className="text-brand-blue text-fluid-h2 font-bold">
                        {display.nameFr || display.nameEn || t('homePage.recommendedBooks')}
                    </h2>
                    <SeeMore to="/allbooks" />
                </div>

                {/* Horizontal Scroll Container with negative margin */}
                <div className="relative -ml-fluid-2xl">
                    <div
                        ref={scrollRef}
                        className="flex pt-fluid-xs pr-fluid-lg pl-fluid-2xl gap-fluid-md overflow-x-auto scrollbar-hide pb-4"
                    >
                        {display.books.map((book) => {
                            // Extract first ETIQUETTE tag for badge
                            const etiquetteTag = book.tags?.find(tag => tag.type === "ETIQUETTE");
                            const badge = etiquetteTag ? {
                                type: etiquetteTag.nameEn.toLowerCase(),
                                text: etiquetteTag.nameFr,
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
                                        coverImage={book.coverImageUrl}
                                        badge={badge}
                                        stockStatus={stockStatus}
                                        language={book.language}
                                        onAddToCart={onAddToCart}
                                        onToggleFavorite={onToggleFavorite}
                                        isFavorited={book.isLikedByCurrentUser}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4">
                    <div className="flex-1"></div>

                    <div className="flex-1 flex justify-center">
                        <PaginationDots
                            totalDots={display.books.length}
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
                                    else if (index === display.books.length - 1) {
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
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Hero carousel state (you already have this)
    const [currentSlide, setCurrentSlide] = React.useState(0);

    // Cart popup state
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    // Floating cart badge state
    const [showFloatingBadge, setShowFloatingBadge] = useState(false);
    const [cartItemCount, setCartItemCount] = useState(0);

    // Navigation handler for categories
    const handleCategoryClick = (categoryTitle) => {
        navigate(`/allbooks?category=${encodeURIComponent(categoryTitle)}`);
    };

    // Navigation handler for authors
    const handleAuthorClick = (authorName) => {
        navigate(`/allbooks?author=${encodeURIComponent(authorName)}`);
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

    const authorsScrollRef = useRef(null);
    const [canScrollAuthorsLeft, setCanScrollAuthorsLeft] = useState(false);
    const [canScrollAuthorsRight, setCanScrollAuthorsRight] = useState(true);
    const categoriesScrollRef = useRef(null);
    const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
    const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(true);

    const checkCategoriesScrollPosition = () => {
        const container = categoriesScrollRef.current;
        if (container) {
            const scrollLeft = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            setCanScrollCategoriesLeft(scrollLeft > 0);
            setCanScrollCategoriesRight(scrollLeft < maxScroll - 10);

            // If at the very end, set to last index
            if (scrollLeft >= maxScroll - 5) {
                setCurrentCategoryIndex(categories.length - 1);
            }
            // If at the very start, set to first index
            else if (scrollLeft <= 5) {
                setCurrentCategoryIndex(0);
            }
            // Otherwise, calculate based on center
            else {
                const itemWidth = container.firstChild?.offsetWidth || 0;
                const gap = parseFloat(getComputedStyle(container).gap) || 0;
                const containerCenter = scrollLeft + (container.clientWidth / 2);

                // Calculate which item is centered
                let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));

                // Clamp between 0 and last index
                activeIndex = Math.max(0, Math.min(activeIndex, categories.length - 1));

                setCurrentCategoryIndex(activeIndex);
            }
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
        if (container) {
            const scrollLeft = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            setCanScrollAuthorsLeft(scrollLeft > 0);
            setCanScrollAuthorsRight(scrollLeft < maxScroll - 10);

            // If at the very end, set to last index
            if (scrollLeft >= maxScroll - 5) {
                setCurrentAuthorIndex(authors.length - 1);
            }
            // If at the very start, set to first index
            else if (scrollLeft <= 5) {
                setCurrentAuthorIndex(0);
            }
            // Otherwise, calculate based on center
            else {
                const itemWidth = container.firstChild?.offsetWidth || 0;
                const gap = parseFloat(getComputedStyle(container).gap) || 0;
                const containerCenter = scrollLeft + (container.clientWidth / 2);

                // Calculate which item is centered
                let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));

                // Clamp between 0 and last index
                activeIndex = Math.max(0, Math.min(activeIndex, authors.length - 1));

                setCurrentAuthorIndex(activeIndex);
            }
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
    }, []);

    useEffect(() => {
        const categoriesContainer = categoriesScrollRef.current;
        if (categoriesContainer) {
            checkCategoriesScrollPosition();
            categoriesContainer.addEventListener('scroll', checkCategoriesScrollPosition);
            return () => categoriesContainer.removeEventListener('scroll', checkCategoriesScrollPosition);
        }
    }, []);

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

    const handleAddToCart = (bookId) => {
        console.log(`Added book ${bookId} to cart`);
        // Find book across all main displays
        let foundBook = null;
        for (const display of mainDisplays) {
            foundBook = display.books.find(b => b.id === bookId);
            if (foundBook) break;
        }

        if (foundBook) {
            setSelectedBook(foundBook);
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

                // Fetch books for each main display
                const displaysWithBooks = await Promise.all(
                    displays.map(async (display) => {
                        try {
                            const books = await fetchBooksByMainDisplay(display.id, 0, 10);
                            return {
                                ...display,
                                books: books || [],
                                currentIndex: 0,
                                canScrollLeft: false,
                                canScrollRight: true
                            };
                        } catch (error) {
                            console.error(`Failed to load books for display ${display.id}:`, error);
                            return {
                                ...display,
                                books: [],
                                currentIndex: 0,
                                canScrollLeft: false,
                                canScrollRight: false
                            };
                        }
                    })
                );

                setMainDisplays(displaysWithBooks);
            } catch (error) {
                console.error('Failed to load main displays:', error);
                setMainDisplays([]);
            } finally {
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


    const authors = [
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        },
        {
            Image: "/assets/authors/camus.png",
            Name: "Victor Hugo"
        }
    ]

    return (

        <main className="w-full max-w-[100vw] overflow-x-hidden">
            <div className="min-h-screen bg-white">
                {/* Navigation Bar */}
                <section className="w-full max-w-[100vw] overflow-x-hidden"><Navbar /></section>


                <div className="h-20"></div>

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
                                {categoriesLoading ? (
                                    // Loading state
                                    <div className="flex-1 flex justify-center items-center py-fluid-lg">
                                        <p className="text-brand-blue">{t('common.loading')}</p>
                                    </div>
                                ) : categories.length === 0 ? (
                                    // Empty state
                                    <div className="flex-1 flex justify-center items-center py-fluid-lg">
                                        <p className="text-brand-blue">{t('common.noData')}</p>
                                    </div>
                                ) : (
                                    // Categories list
                                    categories.map((category) => (
                                        <div
                                            key={category.id}
                                            className="flex-shrink-0 snap-start cursor-pointer"
                                            onClick={() => handleCategoryClick(category.nameFr || category.nameEn)}
                                        >
                                            <CategoryCard
                                                title={category.nameFr || category.nameEn}
                                                imageSrc={category.imageUrl} />
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4">
                            <div className="flex-1"></div>

                            <div className="flex-1 flex justify-center">
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
                            </div>

                            <div className="flex-1 flex justify-end">
                                <SlideScroll
                                    onPrevious={() => scrollCategories('left')}
                                    onNext={() => scrollCategories('right')}
                                    canScrollLeft={canScrollCategoriesLeft}
                                    canScrollRight={canScrollCategoriesRight}
                                />
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
                                {authors.map((author, index) => (
                                    <div
                                        key={index}
                                        className="flex-shrink-0 snap-start cursor-pointer"
                                        onClick={() => handleAuthorClick(author.Name)}
                                    >
                                        <AuthorComponent
                                            authorImage={author.Image}
                                            authorName={author.Name}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4">
                            <div className="flex-1"></div>

                            <div className="flex-1 flex justify-center">
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
                            </div>

                            <div className="flex-1 flex justify-end">
                                <SlideScroll
                                    onPrevious={() => scrollAuthors('left')}
                                    onNext={() => scrollAuthors('right')}
                                    canScrollLeft={canScrollAuthorsLeft}
                                    canScrollRight={canScrollAuthorsRight}
                                />
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
                        coverImage: selectedBook.coverImageUrl,
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
    );



};

export default HomePage;