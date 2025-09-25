import { Search, ChevronDown, ShoppingCart, Heart, User } from 'lucide-react';

// Logo Component
const Logo = () => (
    <div className="flex flex-col text-white">
        <div className="text-sm font-bold leading-tight">Esprit</div>
        <div className="text-sm font-bold leading-tight">Livre</div>
    </div>
);

// Search Bar Component
const SearchBar = ({ placeholder = "Recherchez un livre, un genre ..etc", onSearch }) => (
    <div className="relative bg-white rounded-lg h-9 w-180 flex items-center">
        <div className="absolute left-3 w-4 h-4 text-slate-500">
            <Search className="w-full h-full" />
        </div>
        <input
            type="text"
            placeholder={placeholder}
            onChange={onSearch}
            className="w-full h-full pl-10 pr-4 text-sm text-slate-500 bg-transparent border-none outline-none placeholder:text-slate-500"
        />
    </div>
);

// Language Selector Component
const LanguageSelector = ({ onLanguageChange }) => (
    <div
        className="relative bg-white rounded h-7 w-20 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onLanguageChange}
    >
        <span className="text-xs text-black ml-2">Langue</span>
        <div className="absolute right-2 w-3 h-3 text-black">
            <ChevronDown className="w-full h-full" />
        </div>
    </div>
);

// User Actions Component
const UserActions = ({ cartCount = 0, onCartClick, onFavoritesClick, onUserClick }) => (
    <div className="flex items-center gap-1">
        {/* Cart with notification */}
        <div className="relative cursor-pointer hover:opacity-80 transition-opacity" onClick={onCartClick}>
            <div className="w-5 h-5 text-white">
                <ShoppingCart className="w-full h-full" />
            </div>
            {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-black leading-none">{cartCount}</span>
                </div>
            )}
        </div>

        {/* Favorites */}
        <div
            className="w-5 h-5 ml-2 text-white cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onFavoritesClick}
        >
            <Heart className="w-full h-full" />
        </div>

        {/* User Account */}
        <div
            className="w-5 h-5 ml-1 text-white cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onUserClick}
        >
            <User className="w-full h-full" />
        </div>
    </div>
);

// Main Navbar Component
const Navbar = ({
    searchPlaceholder,
    cartCount,
    onSearch,
    onLanguageChange,
    onCartClick,
    onFavoritesClick,
    onUserClick
}) => (
    <div className="w-full bg-blue-800 rounded-br-2xl px-6 py-3 h-">
        <div className="flex items-center w-full h-full">
            {/* Logo */}
            <div className="flex-shrink-0">
                <Logo />
            </div>

            {/* Search Bar */}
            <div className="flex-shrink-0 ml-8">
                <SearchBar placeholder={searchPlaceholder} onSearch={onSearch} />
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Language Selector */}
            <div className="flex-shrink-0 mr-6">
                <LanguageSelector onLanguageChange={onLanguageChange} />
            </div>

            {/* User Actions */}
            <div className="flex-shrink-0">
                <UserActions
                    cartCount={cartCount}
                    onCartClick={onCartClick}
                    onFavoritesClick={onFavoritesClick}
                    onUserClick={onUserClick}
                />
            </div>
        </div>
    </div>
);

// Demo usage
export default function App() {
    const handleSearch = (e) => {
        console.log('Search:', e.target.value);
    };

    const handleLanguageChange = () => {
        console.log('Language selector clicked');
    };

    const handleCartClick = () => {
        console.log('Cart clicked');
    };

    const handleFavoritesClick = () => {
        console.log('Favorites clicked');
    };

    const handleUserClick = () => {
        console.log('User account clicked');
    };

    return (
        <Navbar
            cartCount={0}
            onSearch={handleSearch}
            onLanguageChange={handleLanguageChange}
            onCartClick={handleCartClick}
            onFavoritesClick={handleFavoritesClick}
            onUserClick={handleUserClick}
        />
    );
}