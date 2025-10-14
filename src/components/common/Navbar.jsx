// src/components/common/Navbar.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, ShoppingCart, Heart, User, Menu } from 'lucide-react';
import LanguageToggle from '../animations/LanguageToggle'; // Your existing component
import BottomSheet from './BottomSheet';

// Simple Language Toggle for Mobile/Tablet (the one I created earlier)
const SimpleLanguageToggle = () => {
    const { i18n } = useTranslation();
    const language = i18n.language?.toUpperCase() || 'FR';

    const handleToggle = () => {
        const newLang = i18n.language === 'fr' ? 'en' : 'fr';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={handleToggle}
            className="bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
        >
            {language}
        </button>
    );
};

// Logo Component
const Logo = () => (
    <a href='/'>
        <div className="flex flex-col text-white">
            <div className="text-lg md:text-xl font-bold leading-tight">Esprit</div>
            <div className="text-base md:text-lg font-bold leading-tight">Livre</div>
        </div>
    </a>
);

// SearchBar Component
const SearchBar = ({ placeholder = "Recherchez...", onSearch }) => (
    <div className="relative bg-white rounded-lg h-10 md:h-11 w-full md:w-96 flex items-center">
        <div className="absolute left-3 w-4 h-4 text-slate-500">
            <Search className="w-full h-full" />
        </div>
        <input
            type="text"
            placeholder={placeholder}
            onChange={onSearch}
            className="w-full h-full pl-10 pr-4 text-sm md:text-base text-black bg-transparent border-none outline-none placeholder:text-slate-500 rounded-lg"
        />
    </div>
);

// Main Navbar Component
const Navbar = ({
    searchPlaceholder,
    cartCount = 0,
    onSearch = () => { },
    onCartClick
}) => {
    const { t } = useTranslation();
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const navigate = useNavigate();

    // Use translation if no custom placeholder is provided
    const placeholder = searchPlaceholder || t('navbar.searchPlaceholder');

    // Default cart click handler - navigate to cart page
    const handleCartClick = () => {
        if (onCartClick) {
            onCartClick();
        } else {
            navigate('/cart');
        }
    };

    // Default favorites click handler - navigate to favorites page
    const handleFavoritesClick = () => {
        navigate('/favorites');
    };

    // Default user click handler - navigate to profile page
    const handleUserClick = () => {
        navigate('/profile');
    };

    return (
        <>
            <div className="fixed top-0 left-0 right-0 bg-blue-800 rounded-br-2xl px-4 md:px-6 py-3 h-20 z-40">
                <div className="flex items-center w-full h-full gap-4">
                    {/* Logo - Always visible */}
                    <Logo />

                    {/* Search Bar - Always visible but responsive width */}
                    <div className="flex-1 md:flex-initial">
                        <SearchBar placeholder={placeholder} onSearch={onSearch} />
                    </div>

                    {/* Desktop Spacer */}
                    <div className="hidden md:flex flex-1"></div>

                    {/* Language Toggle - Different components based on screen size */}
                    {/* Desktop: Use your actual LanguageToggle component */}
                    <div className="hidden lg:block">
                        <LanguageToggle />
                    </div>

                    {/* Tablet/Large Mobile: Use the simple toggle */}
                    <div className="hidden md:block lg:hidden">
                        <SimpleLanguageToggle />
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-3">
                        {/* Cart - Always visible */}
                        <button onClick={handleCartClick} className="relative">
                            <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-white hover:opacity-80 transition-opacity" />
                            {cartCount > 0 && (
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                    <span className="text-xs text-white font-bold">
                                        {cartCount > 9 ? "9+" : cartCount}
                                    </span>
                                </div>
                            )}
                        </button>

                        {/* Favorites - Desktop only */}
                        <button onClick={handleFavoritesClick} className="hidden md:block">
                            <Heart className="w-6 h-6 text-white hover:opacity-80 transition-opacity" />
                        </button>

                        {/* User Account - Desktop only */}
                        <button onClick={handleUserClick} className="hidden md:block">
                            <User className="w-6 h-6 text-white hover:opacity-80 transition-opacity" />
                        </button>

                        {/* Menu Icon - Mobile only */}
                        <button
                            onClick={() => setIsBottomSheetOpen(true)}
                            className="md:hidden"
                        >
                            <Menu className="w-6 h-6 text-white hover:opacity-80 transition-opacity" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Sheet for Mobile Menu */}
            <BottomSheet
                isOpen={isBottomSheetOpen}
                onClose={() => setIsBottomSheetOpen(false)}
                LanguageToggle={LanguageToggle}
            />
        </>
    );
};

export default Navbar;