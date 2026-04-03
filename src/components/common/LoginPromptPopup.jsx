// src/components/common/LoginPromptPopup.jsx
import { useTranslation } from 'react-i18next';
import { X, Gift, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const LoginPromptPopup = ({ isOpen, onClose, onLoginClick, position = 'top' }) => {
    const { t } = useTranslation();
    const [backdropActive, setBackdropActive] = useState(false);

    // Delay backdrop activation to prevent immediate closure on mobile
    useEffect(() => {
        if (isOpen) {
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
                        className="absolute z-50 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden w-[calc(100vw-2rem)] max-w-[280px] xs:max-w-xs"
                        style={{
                            top: position === 'top' ? 'auto' : '100%',
                            bottom: position === 'top' ? '100%' : 'auto',
                            right: '-8px',
                            marginTop: position === 'top' ? '0' : '18px',
                            marginBottom: position === 'top' ? '8px' : '0'
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-600 transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Content */}
                        <div className="p-3.5 xs:p-4 pr-8 xs:pr-9">
                            <h3 className="text-sm xs:text-base text-[#00417a] font-semibold mb-1 xs:mb-1.5">
                                {t('loginPrompt.title')}
                            </h3>
                            <p className="text-xs xs:text-sm text-gray-600 mb-3 xs:mb-3.5 leading-relaxed">
                                {t('loginPrompt.message')}
                            </p>

                            {/* Benefits - compact */}
                            <div className="space-y-1.5 mb-3 xs:mb-3.5">
                                <div className="flex items-center gap-2">
                                    <Gift className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-[#00417a] flex-shrink-0" />
                                    <span className="text-[0.65rem] xs:text-xs text-gray-600">
                                        {t('loginPrompt.benefit1')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Package className="w-3 h-3 xs:w-3.5 xs:h-3.5 text-[#00417a] flex-shrink-0" />
                                    <span className="text-[0.65rem] xs:text-xs text-gray-600">
                                        {t('loginPrompt.benefit2')}
                                    </span>
                                </div>
                            </div>

                            {/* Login button */}
                            <button
                                onClick={onLoginClick}
                                className="w-full bg-[#EE0027] hover:bg-[#d4183d] active:scale-[0.98] text-white px-3 xs:px-4 py-1.5 xs:py-2 rounded-lg transition-all text-xs xs:text-sm font-semibold"
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
