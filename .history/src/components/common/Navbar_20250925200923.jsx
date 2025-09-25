import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ShoppingCart, Heart, User, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Language configuration
const languages = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' }
];

// Logo Component
const Logo = () => (
    <div className="flex flex-col text-white">
        <div className="text-xl font-bold leading-tight">Esprit</div>
        <div className="text-lg font-bold leading-tight">Livre</div>
    </div>
);

// Search Bar Component
const SearchBar = ({ placeholder = "Recherchez un livre, un genre ..etc", onSearch }) => (
    <div className="relative bg-white rounded-lg h-11 w-140 flex items-center">
        <div className="absolute left-3 w-4 h-4 text-slate-500">
            <Search className="w-full h-full" />
        </div>
        <input
            type="text"
            placeholder={placeholder}
            onChange={onSearch}
            className="w-full h-full pl-10 pr-4 text-md text-black bg-transparent border-none outline-none placeholder:text-slate-500"
        />
    </div>
);

// Language Selector Component
const LanguageSelector = ({ onLanguageChange }) => (
    <div
        className="relative bg-white rounded-md mr-10 h-10 w-25 flex items-center cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onLanguageChange}
    >
        <span className="text-md text-black ml-2">Langue</span>
        <div className="absolute right-2 w-5 h-5 text-black">
            <img
                src="/assets/icons/arrow-down.png"
                alt="arrow down"
                className="w-full h-full object-contain"
            />
        </div>
    </div>

);

// User Actions Component
const UserActions = ({ cartCount = 0, onCartClick, onFavoritesClick, onUserClick }) => (
    <div className="flex items-center gap-2">
        {/* Cart with notification */}
        <div className="relative cursor-pointer hover:opacity-80 transition-opacity" onClick={onCartClick}>
            <div className="w-6 h-6 text-white">
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
            className="w-6 h-6 ml-2 text-white cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onFavoritesClick}
        >
            <Heart className="w-full h-full" />
        </div>

        {/* User Account */}
        <div
            className="w-6 h-6 ml-1 text-white cursor-pointer hover:opacity-80 transition-opacity"
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
    <div className="w-full bg-blue-800 rounded-br-2xl px-6 py-3 h-20">
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
            cartCount={100}
            onSearch={handleSearch}
            onLanguageChange={handleLanguageChange}
            onCartClick={handleCartClick}
            onFavoritesClick={handleFavoritesClick}
            onUserClick={handleUserClick}
        />
    );
}