import { useState } from 'react';
import { Search, ChevronDown, ShoppingCart, Heart, User } from 'lucide-react';



// Sous-composant Logo
const Logo = () => (
    <div className="flex flex-col text-white cursor-pointer">
        <span className="text-sm font-bold leading-tight">Esprit</span>
        <span className="text-sm font-bold leading-tight">Livre</span>
    </div>
);

// Sous-composant Barre de recherche
const SearchBar = ({ placeholder = "Recherchez un livre, un genre ..etc" }) => (
    <div className="relative bg-white rounded-lg h-9 w-96 flex items-center shadow-sm">
        <Search className="absolute left-3 w-4 h-4 text-slate-500" />
        <input
            type="text"
            placeholder={placeholder}
            className="w-full h-full pl-10 pr-4 text-sm text-slate-700 bg-transparent border-none outline-none placeholder:text-slate-400"
        />
    </div>
);

// Sous-composant Sélecteur de langue
const LanguageSelector = ({ currentLang, onLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);

    const languages = [
        { code: 'fr', label: 'Français' },
        { code: 'en', label: 'English' }
    ];

    const handleSelect = (langCode) => {
        onLanguageChange(langCode);
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-white rounded h-7 w-20 flex items-center justify-between px-2 cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <span className="text-xs text-black font-medium">{currentLang.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 text-black transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {isOpen && (
                <div className="absolute top-8 right-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 w-32 z-50">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${currentLang === lang.code ? 'bg-blue-50 text-blue-800 font-medium' : 'text-gray-700'
                                }`}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Sous-composant Actions utilisateur
const UserActions = ({ cartCount = 0 }) => (
    <div className="flex items-center gap-3">
        {/* Panier avec notification */}
        <div className="relative cursor-pointer hover:opacity-80 transition-opacity group">
            <ShoppingCart className="w-5 h-5 text-white" />
            {cartCount > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center">
                    <span className="text-[10px] text-white font-bold leading-none">
                        {cartCount > 9 ? '9+' : cartCount}
                    </span>
                </div>
            )}
        </div>

        {/* Favoris */}
        <Heart className="w-5 h-5 text-white cursor-pointer hover:opacity-80 transition-opacity" />

        {/* Compte utilisateur */}
        <User className="w-5 h-5 text-white cursor-pointer hover:opacity-80 transition-opacity" />
    </div>
);

// Composant principal Navbar
const Navbar = () => {
    const [currentLanguage, setCurrentLanguage] = useState('fr');
    const [cartItemCount, setCartItemCount] = useState(1); // À connecter avec votre state global

    const handleLanguageChange = (langCode) => {
        setCurrentLanguage(langCode);
        // TODO: Intégrer i18next pour changer la langue de l'app
        console.log('Langue changée:', langCode);
    };

    return (
        <nav className="w-full bg-blue-900 rounded-br-2xl px-6 py-3 h-16 shadow-md">
            <div className="flex items-center justify-between w-full h-full max-w-screen-2xl mx-auto">
                {/* Logo */}
                <div className="flex-shrink-0">
                    <Logo />
                </div>

                {/* Barre de recherche */}
                <div className="flex-shrink-0 ml-8">
                    <SearchBar />
                </div>

                {/* Spacer pour pousser les éléments de droite */}
                <div className="flex-1" />

                {/* Actions de droite : Langue + Icônes utilisateur */}
                <div className="flex items-center gap-6">
                    <LanguageSelector
                        currentLang={currentLanguage}
                        onLanguageChange={handleLanguageChange}
                    />
                    <UserActions cartCount={cartItemCount} />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;