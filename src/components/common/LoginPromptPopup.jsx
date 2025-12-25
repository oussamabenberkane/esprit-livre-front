// src/components/common/LoginPromptPopup.jsx
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const LoginPromptPopup = ({ isOpen, onClose, onLoginClick, position = 'top' }) => {
    const { t } = useTranslation();
    const [backdropActive, setBackdropActive] = useState(false);

    // Delay backdrop activation to prevent immediate closure on mobile
    useEffect(() => {
        if (isOpen) {
            // Small delay to prevent touch events from triggering backdrop close
            const timer = setTimeout(() => {
                setBackdropActive(true);
            }, 100);
            return () => clearTimeout(timer);
        } else {
            setBackdropActive(false);
        }
    }, [isOpen]);

    const handleBackdropClick = (e) => {
        e.stopPropagation();
        if (backdropActive) {
            onClose();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for click outside */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={handleBackdropClick}
                        onTouchEnd={handleBackdropClick}
                    />

                    {/* Popup */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? -10 : 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: position === 'top' ? -10 : 10 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-3 xs:p-4 w-[calc(100vw-1rem)] max-w-[280px] xs:max-w-xs"
                        style={{
                            top: position === 'top' ? 'auto' : '100%',
                            bottom: position === 'top' ? '100%' : 'auto',
                            right: '0.5rem',
                            marginTop: position === 'top' ? '0' : '18px',
                            marginBottom: position === 'top' ? '8px' : '0'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Content */}
                        <div className="pr-5 xs:pr-6">
                            <h3 className="text-sm xs:text-base text-gray-800 font-semibold mb-1.5 xs:mb-2">
                                {t('loginPrompt.title')}
                            </h3>
                            <p className="text-xs xs:text-sm text-gray-600 mb-3 xs:mb-4 leading-relaxed">
                                {t('loginPrompt.message')}
                            </p>

                            {/* Login button */}
                            <button
                                onClick={onLoginClick}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg transition-colors text-xs xs:text-sm font-medium"
                            >
                                {t('loginPrompt.loginButton')}
                            </button>
                        </div>

                        {/* Arrow indicator */}
                        <div
                            className="absolute w-3 h-3 bg-white border-gray-200 transform rotate-45"
                            style={{
                                [position === 'top' ? 'bottom' : 'top']: '-6px',
                                right: '12px',
                                borderWidth: position === 'top' ? '0 1px 1px 0' : '1px 0 0 1px'
                            }}
                        />
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default LoginPromptPopup;
