import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import CategoryCard from '../components/home/CategoryCard';
import BookCard from '../components/common/BookCard';
import AuthorComponent from '../components/home/author';
import HeroCarousel from '../components/home/HeroSection';
import SeeMore from '../components/buttons/SeeMore';
import SlideScroll from '../components/buttons/SlideScroll';
import PaginationDots from '../components/common/PaginationDots';
import Footer from '../components/common/Footer';
import CartConfirmationPopup from '../components/home/cartConfirmationPopup';
import LoadingFallback from '../components/common/LoadingFallback';
import { fetchCategories, fetchMainDisplayTags, fetchBooksByMainDisplay, fetchTopAuthors } from '../services/api';

const HomePage = () => {
    const navigate = useNavigate();

    // Hero carousel state
    const [currentSlide, setCurrentSlide] = React.useState(0);

    // Cart popup state
    const [showCartPopup, setShowCartPopup] = useState(false);
    const [selectedBook, setSelectedBook] = useState(null);

    // API data state
    const [categories, setCategories] = useState([]);
    const [booksSections, setBooksSections] = useState([]); // Array of {tag, books} objects
    const [authors, setAuthors] = useState([]);

    // Loading and error states
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch data on mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Fetch all data in parallel
                const [categoriesData, mainDisplayTagsData, authorsData] = await Promise.all([
                    fetchCategories(),
                    fetchMainDisplayTags(0, 3),
                    fetchTopAuthors()
                ]);

                // Extract content arrays if paginated
                const categoriesArray = categoriesData.content || categoriesData || [];
                const mainDisplayTagsArray = mainDisplayTagsData.content || mainDisplayTagsData || [];
                const authorsArray = authorsData.content || authorsData || [];

                setCategories(categoriesArray);
                setAuthors(authorsArray);

                // Fetch books for each MAIN_DISPLAY tag
                const booksSectionsPromises = mainDisplayTagsArray.map(async (tag) => {
                    const booksData = await fetchBooksByMainDisplay(tag.id, 0, 10);
                    return {
                        tag,
                        books: booksData.content || booksData || []
                    };
                });

                const booksSectionsData = await Promise.all(booksSectionsPromises);
                setBooksSections(booksSectionsData);

                setIsLoading(false);
            } catch (err) {
                console.error('Error loading data:', err);
                setError(err.message || 'Une erreur est survenue lors du chargement des données');
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

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

    // Add state for authors section
    const [currentAuthorIndex, setCurrentAuthorIndex] = useState(0);

    // Scroll refs and states
    const authorsScrollRef = useRef(null);
    const [canScrollAuthorsLeft, setCanScrollAuthorsLeft] = useState(false);
    const [canScrollAuthorsRight, setCanScrollAuthorsRight] = useState(true);

    const categoriesScrollRef = useRef(null);
    const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] = useState(false);
    const [canScrollCategoriesRight, setCanScrollCategoriesRight] = useState(true);

    // State for each book section (3 MAIN_DISPLAY sections)
    const [booksSectionsScrollState, setBooksSectionsScrollState] = useState([]);

    // Refs for book sections
    const booksSectionsRefs = useRef([]);

    // Initialize scroll state for book sections when data loads
    useEffect(() => {
        if (booksSections.length > 0) {
            // Initialize refs array - create new refs if they don't exist
            booksSectionsRefs.current = booksSections.map((_, i) =>
                booksSectionsRefs.current[i] || { current: null }
            );

            setBooksSectionsScrollState(
                booksSections.map(() => ({
                    currentIndex: 0,
                    canScrollLeft: false,
                    canScrollRight: true
                }))
            );
        }
    }, [booksSections]);

    // Categories scroll functions
    const checkCategoriesScrollPosition = () => {
        const container = categoriesScrollRef.current;
        if (container && categories.length > 0) {
            const scrollLeft = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            setCanScrollCategoriesLeft(scrollLeft > 0);
            setCanScrollCategoriesRight(scrollLeft < maxScroll - 10);

            if (scrollLeft >= maxScroll - 5) {
                setCurrentCategoryIndex(categories.length - 1);
            } else if (scrollLeft <= 5) {
                setCurrentCategoryIndex(0);
            } else {
                const itemWidth = container.firstChild?.offsetWidth || 0;
                const gap = parseFloat(getComputedStyle(container).gap) || 0;
                const containerCenter = scrollLeft + (container.clientWidth / 2);
                let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));
                activeIndex = Math.max(0, Math.min(activeIndex, categories.length - 1));
                setCurrentCategoryIndex(activeIndex);
            }
        }
    };

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

    // Authors scroll functions
    const checkAuthorsScrollPosition = () => {
        const container = authorsScrollRef.current;
        if (container && authors.length > 0) {
            const scrollLeft = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            setCanScrollAuthorsLeft(scrollLeft > 0);
            setCanScrollAuthorsRight(scrollLeft < maxScroll - 10);

            if (scrollLeft >= maxScroll - 5) {
                setCurrentAuthorIndex(authors.length - 1);
            } else if (scrollLeft <= 5) {
                setCurrentAuthorIndex(0);
            } else {
                const itemWidth = container.firstChild?.offsetWidth || 0;
                const gap = parseFloat(getComputedStyle(container).gap) || 0;
                const containerCenter = scrollLeft + (container.clientWidth / 2);
                let activeIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));
                activeIndex = Math.max(0, Math.min(activeIndex, authors.length - 1));
                setCurrentAuthorIndex(activeIndex);
            }
        }
    };

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

    // Books section scroll functions (dynamic for each section)
    const createBooksScrollCheck = (sectionIndex, scrollRef) => {
        return () => {
            const container = scrollRef.current;
            if (container && booksSections[sectionIndex]?.books.length > 0) {
                const scrollLeft = container.scrollLeft;
                const maxScroll = container.scrollWidth - container.clientWidth;
                const books = booksSections[sectionIndex].books;

                const canScrollLeft = scrollLeft > 0;
                const canScrollRight = scrollLeft < maxScroll - 10;

                let currentIndex = 0;
                if (scrollLeft >= maxScroll - 5) {
                    currentIndex = books.length - 1;
                } else if (scrollLeft <= 5) {
                    currentIndex = 0;
                } else {
                    const itemWidth = container.firstChild?.offsetWidth || 0;
                    const gap = parseFloat(getComputedStyle(container).gap) || 0;
                    const containerCenter = scrollLeft + (container.clientWidth / 2);
                    currentIndex = Math.round((containerCenter - (itemWidth / 2)) / (itemWidth + gap));
                    currentIndex = Math.max(0, Math.min(currentIndex, books.length - 1));
                }

                setBooksSectionsScrollState(prev => {
                    const newState = [...prev];
                    newState[sectionIndex] = {
                        currentIndex,
                        canScrollLeft,
                        canScrollRight
                    };
                    return newState;
                });
            }
        };
    };

    const scrollBooksSection = (scrollRef, direction) => {
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

    // Add scroll listeners
    useEffect(() => {
        const categoriesContainer = categoriesScrollRef.current;
        if (categoriesContainer) {
            checkCategoriesScrollPosition();
            categoriesContainer.addEventListener('scroll', checkCategoriesScrollPosition);
            return () => categoriesContainer.removeEventListener('scroll', checkCategoriesScrollPosition);
        }
    }, [categories]);

    useEffect(() => {
        const authorsContainer = authorsScrollRef.current;
        if (authorsContainer) {
            checkAuthorsScrollPosition();
            authorsContainer.addEventListener('scroll', checkAuthorsScrollPosition);
            return () => authorsContainer.removeEventListener('scroll', checkAuthorsScrollPosition);
        }
    }, [authors]);

    useEffect(() => {
        const handleResize = () => {
            checkCategoriesScrollPosition();
            checkAuthorsScrollPosition();
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [categories, authors]);

    const heroImages = [
        {
            src: "/assets/banners/banner2.png",
            alt: "Featured Books Collection",
            overlay: "rgba(0, 65, 122, 0.3)",
            button: "Découvrir"
        },
        {
            src: "/assets/banners/banner1.png",
            alt: "Offres spéciales livres",
            overlay: "rgba(0, 0, 0, 0.2)",
            button: "Nouveautés"
        },
    ];

    const handleAddToCart = (bookId) => {
        console.log(`Added book ${bookId} to cart`);
        // Search in all booksSections
        let foundBook = null;
        for (const section of booksSections) {
            foundBook = section.books.find(b => b.id === bookId);
            if (foundBook) break;
        }

        if (foundBook) {
            setSelectedBook(foundBook);
            setShowCartPopup(true);
        }
    };

    const handleToggleFavorite = (bookId, isFavorited) => {
        console.log(`Book ${bookId} favorited: ${isFavorited}`);
        // Add your favorite logic here
    };

    // Show loading state
    if (isLoading) {
        return (
            <main className="w-full max-w-[100vw] overflow-x-hidden">
                <div className="min-h-screen bg-white">
                    <section className="w-full max-w-[100vw] overflow-x-hidden">
                        <Navbar />
                    </section>
                    <div className="h-20"></div>
                    <LoadingFallback message="Chargement des données..." />
                </div>
            </main>
        );
    }

    // Show error state
    if (error) {
        return (
            <main className="w-full max-w-[100vw] overflow-x-hidden">
                <div className="min-h-screen bg-white">
                    <section className="w-full max-w-[100vw] overflow-x-hidden">
                        <Navbar />
                    </section>
                    <div className="h-20"></div>
                    <LoadingFallback message={`Erreur: ${error}`} />
                </div>
            </main>
        );
    }

    return (
        <main className="w-full max-w-[100vw] overflow-x-hidden">
            <div className="min-h-screen bg-white">
                {/* Navigation Bar */}
                <section className="w-full max-w-[100vw] overflow-x-hidden">
                    <Navbar />
                </section>

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

                {/* Categories Section */}
                <section className="w-full section-spacing">
                    <div className="container-main container-padding2xl-left-only">
                        <div className="flex items-center justify-between pr-fluid-lg">
                            <div>
                                <h1 className="font-['Poppins'] font-bold text-[#00417a] text-fluid-h1to2 mb-0">
                                    Bonjour
                                </h1>
                            </div>
                            <SeeMore to="/allbooks" />
                        </div>
                        <p className="font-['Poppins'] font-[550] text-[#00417a] text-fluid-small">
                            Choisissez parmis les catégories suivantes
                        </p>

                        <div className="relative -ml-fluid-2xl">
                            <div
                                ref={categoriesScrollRef}
                                className="flex pt-fluid-lg pl-fluid-2xl pr-fluid-lg gap-fluid-lg overflow-x-auto pb-4 scrollbar-hide"
                            >
                                {categories.map((category) => (
                                    <div
                                        key={category.id}
                                        className="flex-shrink-0 snap-start cursor-pointer"
                                        onClick={() => handleCategoryClick(category.nameFr)}
                                    >
                                        <CategoryCard
                                            title={category.nameFr}
                                            imageSrc={category.imageUrl}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center justify-between pr-fluid-lg pt-2 mt-4 mb-4">
                            <div className="flex-1"></div>

                            <div className="flex-1 flex justify-center">
                                <PaginationDots
                                    totalDots={categories.length}
                                    currentIndex={currentCategoryIndex}
                                    onDotClick={(index) => {
                                        const container = categoriesScrollRef.current;
                                        if (container) {
                                            const itemWidth = container.firstChild?.offsetWidth || 0;
                                            const gap = parseFloat(getComputedStyle(container).gap) || 0;
                                            let scrollAmount;

                                            if (index === 0) {
                                                scrollAmount = 0;
                                            } else if (index === categories.length - 1) {
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
                                    onPrevious={() => scrollCategories('left')}
                                    onNext={() => scrollCategories('right')}
                                    canScrollLeft={canScrollCategoriesLeft}
                                    canScrollRight={canScrollCategoriesRight}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Dynamic MAIN_DISPLAY Sections */}
                {booksSections.map((section, sectionIndex) => {
                    // Ensure ref exists for this section
                    if (!booksSectionsRefs.current[sectionIndex]) {
                        booksSectionsRefs.current[sectionIndex] = { current: null };
                    }

                    const scrollState = booksSectionsScrollState[sectionIndex] || {
                        currentIndex: 0,
                        canScrollLeft: false,
                        canScrollRight: true
                    };

                    return (
                        <BookSection
                            key={section.tag.id}
                            section={section}
                            sectionIndex={sectionIndex}
                            booksScrollRef={booksSectionsRefs.current[sectionIndex]}
                            scrollState={scrollState}
                            createBooksScrollCheck={createBooksScrollCheck}
                            scrollBooksSection={scrollBooksSection}
                            handleAddToCart={handleAddToCart}
                            handleToggleFavorite={handleToggleFavorite}
                        />
                    );
                })}

                {/* Authors Section */}
                <section className="w-full section-spacing">
                    <div className="container-main container-padding2xl-left-only">
                        <div className="mb-fluid-md flex items-center justify-between pr-fluid-lg">
                            <p className="font-['Poppins'] font-bold text-[#00417a] text-fluid-h2">
                                Nos auteurs phares
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
                                        onClick={() => handleAuthorClick(author.name)}
                                    >
                                        <AuthorComponent
                                            authorImage={author.imageUrl}
                                            authorName={author.name}
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
                                        const container = authorsScrollRef.current;
                                        if (container) {
                                            const itemWidth = container.firstChild?.offsetWidth || 0;
                                            const gap = parseFloat(getComputedStyle(container).gap) || 0;
                                            let scrollAmount;

                                            if (index === 0) {
                                                scrollAmount = 0;
                                            } else if (index === authors.length - 1) {
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

            {/* Cart Confirmation Popup */}
            {selectedBook && (
                <CartConfirmationPopup
                    isOpen={showCartPopup}
                    onClose={() => setShowCartPopup(false)}
                    book={{
                        title: selectedBook.title,
                        author: selectedBook.author.name,
                        price: selectedBook.price,
                        coverImage: selectedBook.coverImageUrl
                    }}
                />
            )}
        </main>
    );
};

// Separate component for book sections to properly handle refs
const BookSection = ({
    section,
    sectionIndex,
    booksScrollRef,
    scrollState,
    createBooksScrollCheck,
    scrollBooksSection,
    handleAddToCart,
    handleToggleFavorite
}) => {
    useEffect(() => {
        const container = booksScrollRef.current;
        if (container) {
            const checkScroll = createBooksScrollCheck(sectionIndex, booksScrollRef);
            checkScroll();
            container.addEventListener('scroll', checkScroll);
            return () => container.removeEventListener('scroll', checkScroll);
        }
    }, [section.books, sectionIndex, booksScrollRef, createBooksScrollCheck]);

    return (
        <section className="w-full section-spacing">
            <div className="container-main container-padding2xl-left-only">
                <div className="flex justify-between items-center mb-fluid-sm pr-fluid-lg">
                    <h2 className="text-brand-blue text-fluid-h2 font-bold">
                        {section.tag.nameFr}
                    </h2>
                    <SeeMore to="/allbooks" />
                </div>

                <div className="relative -ml-fluid-2xl">
                    <div
                        ref={booksScrollRef}
                        className="flex pt-fluid-xs pr-fluid-lg pl-fluid-2xl gap-fluid-md overflow-x-auto scrollbar-hide pb-4"
                    >
                        {section.books.map((book) => {
                            const etiquetteTag = book.tags.find(tag => tag.type === "ETIQUETTE");
                            const badge = etiquetteTag ? {
                                type: etiquetteTag.nameEn.toLowerCase(),
                                text: etiquetteTag.nameFr,
                                colorHex: etiquetteTag.colorHex
                            } : null;

                            const stockStatus = {
                                available: book.stockQuantity > 0,
                                text: book.stockQuantity > 0 ? "en stock" : "rupture de stock"
                            };

                            return (
                                <div
                                    key={book.id}
                                    className="flex-shrink-0 snap-start book-card-width"
                                >
                                    <BookCard
                                        id={book.id}
                                        title={book.title}
                                        author={book.author.name}
                                        price={book.price}
                                        coverImage={book.coverImageUrl}
                                        badge={badge}
                                        stockStatus={stockStatus}
                                        onAddToCart={handleAddToCart}
                                        onToggleFavorite={handleToggleFavorite}
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
                            totalDots={section.books.length}
                            currentIndex={scrollState.currentIndex}
                            onDotClick={(index) => {
                                const container = booksScrollRef.current;
                                if (container) {
                                    const itemWidth = container.firstChild?.offsetWidth || 0;
                                    const gap = parseFloat(getComputedStyle(container).gap) || 0;
                                    let scrollAmount;

                                    if (index === 0) {
                                        scrollAmount = 0;
                                    } else if (index === section.books.length - 1) {
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
                            onPrevious={() => scrollBooksSection(booksScrollRef, 'left')}
                            onNext={() => scrollBooksSection(booksScrollRef, 'right')}
                            canScrollLeft={scrollState.canScrollLeft}
                            canScrollRight={scrollState.canScrollRight}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HomePage;
