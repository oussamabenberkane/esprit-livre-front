import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/common/Navbar';
import FiltersSection from '../components/allbooks/FiltersSection';
import Footer from '../components/common/Footer';
import PackCard from '../components/common/PackCard';
import CartConfirmationPopup from '../components/common/cartConfirmationPopup';

// Mock data for promotional packs
const mockPacks = [
    {
        id: 'pack-1',
        title: 'Pack Classiques Français',
        description: 'Découvrez les plus grands chefs-d\'œuvre de la littérature française dans ce pack exceptionnel.',
        originalPrice: 2800,
        packPrice: 1999,
        packImage: null, // Will use composite image
        books: [
            {
                id: '1',
                title: 'L\'Étranger',
                author: 'Albert Camus',
                price: 700,
                coverImage: 'https://picsum.photos/seed/book1/400/600'
            },
            {
                id: '2',
                title: 'Les Misérables',
                author: 'Victor Hugo',
                price: 900,
                coverImage: 'https://picsum.photos/seed/book2/400/600'
            },
            {
                id: '3',
                title: 'Le Petit Prince',
                author: 'Antoine de Saint-Exupéry',
                price: 600,
                coverImage: 'https://picsum.photos/seed/book3/400/600'
            },
            {
                id: '4',
                title: 'Madame Bovary',
                author: 'Gustave Flaubert',
                price: 600,
                coverImage: 'https://picsum.photos/seed/book4/400/600'
            }
        ]
    },
    {
        id: 'pack-2',
        title: 'Pack Science-Fiction Moderne',
        description: 'Plongez dans des univers futuristes captivants avec cette sélection de romans de science-fiction contemporains.',
        originalPrice: 3200,
        packPrice: 2399,
        packImage: null,
        books: [
            {
                id: '5',
                title: 'Dune',
                author: 'Frank Herbert',
                price: 1000,
                coverImage: 'https://picsum.photos/seed/scifi1/400/600'
            },
            {
                id: '6',
                title: 'Foundation',
                author: 'Isaac Asimov',
                price: 800,
                coverImage: 'https://picsum.photos/seed/scifi2/400/600'
            },
            {
                id: '7',
                title: 'Neuromancer',
                author: 'William Gibson',
                price: 750,
                coverImage: 'https://picsum.photos/seed/scifi3/400/600'
            },
            {
                id: '8',
                title: 'The Martian',
                author: 'Andy Weir',
                price: 650,
                coverImage: 'https://picsum.photos/seed/scifi4/400/600'
            }
        ]
    },
    {
        id: 'pack-3',
        title: 'Pack Philosophie Contemporaine',
        description: 'Explorez les grandes questions existentielles avec ces œuvres philosophiques essentielles.',
        originalPrice: 2500,
        packPrice: 1799,
        packImage: null,
        books: [
            {
                id: '9',
                title: 'L\'Être et le Néant',
                author: 'Jean-Paul Sartre',
                price: 900,
                coverImage: 'https://picsum.photos/seed/philo1/400/600'
            },
            {
                id: '10',
                title: 'Le Deuxième Sexe',
                author: 'Simone de Beauvoir',
                price: 850,
                coverImage: 'https://picsum.photos/seed/philo2/400/600'
            },
            {
                id: '11',
                title: 'Ainsi parlait Zarathoustra',
                author: 'Friedrich Nietzsche',
                price: 750,
                coverImage: 'https://picsum.photos/seed/philo3/400/600'
            }
        ]
    },
    {
        id: 'pack-4',
        title: 'Pack Romans Policiers',
        description: 'Résolvez les énigmes les plus captivantes avec cette collection de romans policiers.',
        originalPrice: 2100,
        packPrice: 1499,
        packImage: null,
        books: [
            {
                id: '12',
                title: 'Le Chien des Baskerville',
                author: 'Arthur Conan Doyle',
                price: 600,
                coverImage: 'https://picsum.photos/seed/police1/400/600'
            },
            {
                id: '13',
                title: 'Meurtre sur le Nil',
                author: 'Agatha Christie',
                price: 700,
                coverImage: 'https://picsum.photos/seed/police2/400/600'
            },
            {
                id: '14',
                title: 'La Vérité sur l\'affaire Harry Quebert',
                author: 'Joël Dicker',
                price: 800,
                coverImage: 'https://picsum.photos/seed/police3/400/600'
            }
        ]
    },
    {
        id: 'pack-5',
        title: 'Pack Fantasy Épique',
        description: 'Embarquez pour des aventures extraordinaires dans des mondes magiques et fantastiques.',
        originalPrice: 3500,
        packPrice: 2699,
        packImage: null,
        books: [
            {
                id: '15',
                title: 'Le Seigneur des Anneaux',
                author: 'J.R.R. Tolkien',
                price: 1200,
                coverImage: 'https://picsum.photos/seed/fantasy1/400/600'
            },
            {
                id: '16',
                title: 'Harry Potter',
                author: 'J.K. Rowling',
                price: 1000,
                coverImage: 'https://picsum.photos/seed/fantasy2/400/600'
            },
            {
                id: '17',
                title: 'Le Nom du Vent',
                author: 'Patrick Rothfuss',
                price: 900,
                coverImage: 'https://picsum.photos/seed/fantasy3/400/600'
            },
            {
                id: '18',
                title: 'Chroniques de Narnia',
                author: 'C.S. Lewis',
                price: 400,
                coverImage: 'https://picsum.photos/seed/fantasy4/400/600'
            }
        ]
    },
    {
        id: 'pack-6',
        title: 'Pack Développement Personnel',
        description: 'Transformez votre vie avec ces ouvrages inspirants de développement personnel.',
        originalPrice: 1800,
        packPrice: 1299,
        packImage: null,
        books: [
            {
                id: '19',
                title: 'Les 7 habitudes des gens efficaces',
                author: 'Stephen Covey',
                price: 650,
                coverImage: 'https://picsum.photos/seed/devpers1/400/600'
            },
            {
                id: '20',
                title: 'Père riche, père pauvre',
                author: 'Robert Kiyosaki',
                price: 600,
                coverImage: 'https://picsum.photos/seed/devpers2/400/600'
            },
            {
                id: '21',
                title: 'L\'homme qui voulait être heureux',
                author: 'Laurent Gounelle',
                price: 550,
                coverImage: 'https://picsum.photos/seed/devpers3/400/600'
            }
        ]
    }
];

const PacksPromotionnels = () => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [selectedPack, setSelectedPack] = useState(null);
    const [cartCount, setCartCount] = useState(0);

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleAddToCart = (packId) => {
        const pack = mockPacks.find(p => p.id === packId);
        if (pack) {
            // Convert pack to book-like format for the popup
            const packAsBook = {
                id: pack.id,
                title: pack.title,
                author: `${pack.books.length} ${t('packCard.books')}`,
                price: pack.packPrice,
                coverImage: pack.books[0]?.coverImage || 'https://picsum.photos/seed/default/400/600',
                language: null
            };

            setSelectedPack(packAsBook);
            setIsPopupOpen(true);
            setCartCount(prev => prev + 1);
        }
    };

    // Filter packs based on search query
    const filteredPacks = mockPacks.filter(pack =>
        pack.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pack.books.some(book =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.author.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

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
                        <FiltersSection />
                    </div>

                    {/* Packs Grid */}
                    <div className="space-y-4">
                        {/* Results Count */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-gray-600">
                                <span className="font-semibold text-[#00417a]">{filteredPacks.length}</span> {t('packsPage.packsFound')}
                            </p>
                        </div>

                        {/* Packs List - 2 columns on desktop, 1 on mobile */}
                        {filteredPacks.length > 0 ? (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {filteredPacks.map((pack) => (
                                    <PackCard
                                        key={pack.id}
                                        id={pack.id}
                                        title={pack.title}
                                        description={pack.description}
                                        originalPrice={pack.originalPrice}
                                        packPrice={pack.packPrice}
                                        packImage={pack.packImage}
                                        books={pack.books}
                                        onAddToCart={handleAddToCart}
                                    />
                                ))}
                            </div>
                        ) : (
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
                    onClose={() => setIsPopupOpen(false)}
                    book={selectedPack}
                />
            )}
        </div>
    );
};

export default PacksPromotionnels;
