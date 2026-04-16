// src/components/common/LoginPromptPopup.jsx
import { useTranslation } from 'react-i18next';
import { X, Gift, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

const LoginPromptPopup = ({ isOpen, onClose, onLoginClick, position = 'top', alwaysFixed = false }) => {
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
                    {/* Backdrop - blurred on mobile for focus */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="fixed inset-0 z-40 sm:bg-transparent bg-black/30 sm:backdrop-blur-none backdrop-blur-sm"
                        onClick={handleBackdropClick}
                        onTouchEnd={handleBackdropClick}
                    />

                    {/* Popup - centered on mobile, anchored on desktop */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.92, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 20 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className={alwaysFixed
                            ? 'fixed z-[9999] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden w-[calc(100vw-2rem)] max-w-[340px] left-1/2 -translate-x-1/2 top-24'
                            : `fixed sm:absolute z-50 bg-white rounded-2xl sm:rounded-xl shadow-2xl border border-neutral-200 overflow-hidden w-[calc(100vw-2rem)] max-w-[340px] sm:max-w-sm left-1/2 sm:left-auto -translate-x-1/2 sm:translate-x-0 top-24 sm:top-auto sm:right-[-8px] ${position === 'top' ? 'sm:bottom-full sm:mb-2' : 'sm:top-full sm:mt-[18px]'}`}
                        onClick={(e) => e.stopPropagation()}
                        onTouchEnd={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-4 xs:p-5">
                            {/* Title */}
                            <h3 className="text-fluid-h3 text-[#00417a] font-semibold mb-1 pr-6 leading-snug">
                                {t('loginPrompt.title')}
                            </h3>
                            <p className="text-fluid-small text-gray-500 mb-4 leading-relaxed">
                                {t('loginPrompt.message')}
                            </p>

                            {/* Benefits */}
                            <div className="space-y-2.5 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Gift className="w-4 h-4 text-[#00417a]" />
                                    </div>
                                    <span className="text-fluid-small text-gray-800 font-medium">
                                        {t('loginPrompt.benefit1')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                        <Package className="w-4 h-4 text-[#00417a]" />
                                    </div>
                                    <span className="text-fluid-small text-gray-800 font-medium">
                                        {t('loginPrompt.benefit2')}
                                    </span>
                                </div>
                            </div>

                            {/* Login button */}
                            <button
                                onClick={onLoginClick}
                                className="w-full bg-[#16A34A] hover:bg-[#15803d] active:scale-[0.98] text-white py-2.5 rounded-xl transition-all text-fluid-small font-semibold"
                            >
                                {t('loginPrompt.loginButton')}
                            </button>
                        </div>

                        {/* Arrow indicator - hidden on mobile */}
                        <div
                            className="hidden sm:block absolute w-3 h-3 bg-white border-neutral-200 transform rotate-45"
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
