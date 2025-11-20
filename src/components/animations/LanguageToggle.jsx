import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LanguageToggle = ({ onLanguageChange, className = '' }) => {
    const { i18n } = useTranslation();
    const [currentLang, setCurrentLang] = useState(i18n.language || 'fr');

    // Sync state with i18n language
    useEffect(() => {
        setCurrentLang(i18n.language);
    }, [i18n.language]);

    const handleToggle = () => {
        const newLang = currentLang === 'fr' ? 'en' : 'fr';
        setCurrentLang(newLang);
        i18n.changeLanguage(newLang);
        if (onLanguageChange) {
            onLanguageChange(newLang);
        }
    };

    const getCurrentLanguageLabel = () => {
        return currentLang === 'fr' ? 'Français' : 'English';
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className={`relative rounded-md px-4 py-2.5 min-w-[130px] flex items-center justify-between cursor-pointer border-none outline-none focus:outline-none transition-colors overflow-hidden ${className || 'bg-white hover:bg-gray-50'}`}
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentLang}
                    initial={{ opacity: 0, y: +10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: +10 }}
                    transition={{
                        duration: 0.2,
                        ease: "easeInOut"
                    }}
                    className={`text-fluid-sm font-medium ${className ? 'text-current' : 'text-gray-800'}`}
                >
                    {getCurrentLanguageLabel()}
                </motion.span>
            </AnimatePresence>

            <motion.div
                animate={{ rotate: currentLang === "en" ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                className="ml-2 relative w-5 h-5 overflow-hidden"
            >
                <AnimatePresence mode="wait" initial={false}>
                    {currentLang === "fr" ? (
                        <motion.img
                            key="fr"
                            src="/assets/icons/french-flag.png"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="absolute top-0 left-0 w-full h-full object-contain"
                        />
                    ) : (
                        <motion.img
                            key="en"
                            src="/assets/icons/english-flag.png"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="absolute top-0 left-0 w-full h-full object-contain"
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.button>
    );
};

export default LanguageToggle;