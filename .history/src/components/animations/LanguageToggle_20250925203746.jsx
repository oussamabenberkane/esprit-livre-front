import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const LanguageToggle = ({ onLanguageChange }) => {
    const [currentLang, setCurrentLang] = useState('fr');

    const handleToggle = () => {
        const newLang = currentLang === 'fr' ? 'en' : 'fr';
        setCurrentLang(newLang);
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
            className="relative bg-white rounded-md px-4 py-2.5 min-w-[130px] flex items-center justify-between cursor-pointer border-none outline-none focus:outline-none hover:bg-gray-50 transition-colors  overflow-hidden"
        >
            <AnimatePresence mode="wait">
                <motion.span
                    key={currentLang}
                    initial={{ opacity: 0, y: +10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: +10 }}
                    transition={{
                        duration: 0.3,
                        ease: "easeInOut"
                    }}
                    className="text-sm font-medium text-gray-800"
                >
                    {getCurrentLanguageLabel()}
                </motion.span>
            </AnimatePresence>

            <motion.div
                animate={{ rotate: currentLang === 'en' ? 180 : 0 }}
                transition={{ duration: 0.4 }}
                className="ml-2"
            >
                <img className="w-4 h-4 text-gray-600" src='assets/icons/french-flag.png' />
            </motion.div>
        </motion.button>
    );
};

export default LanguageToggle;