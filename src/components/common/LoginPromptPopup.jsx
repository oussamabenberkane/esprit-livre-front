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
                        initial={{ opacity: 0, scale: 0.92, y: position === 'top' ? -10 : 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: position === 'top' ? -10 : 10 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute z-50 rounded-xl shadow-2xl overflow-hidden w-[calc(100vw-2rem)] max-w-[280px] xs:max-w-xs"
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
                        {/* Dark header section */}
                        <div className="relative bg-gradient-to-br from-[#00417a] to-[#0065a8] px-4 pt-4 pb-3.5 xs:px-5 xs:pt-5 xs:pb-4">
                            {/* Decorative circle */}
                            <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-white/5"></div>

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-2.5 right-2.5 text-white/40 hover:text-white/80 transition-colors z-10"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>

                            <h3 className="text-sm xs:text-base text-white font-semibold mb-1 pr-5 leading-snug">
                                {t('loginPrompt.title')}
                            </h3>
                            <p className="text-[0.65rem] xs:text-xs text-white/60 leading-relaxed">
                                {t('loginPrompt.message')}
                            </p>
                        </div>

                        {/* White content section */}
                        <div className="bg-white px-4 py-3 xs:px-5 xs:py-3.5">
                            {/* Benefits */}
                            <div className="space-y-2 mb-3.5">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-md bg-[#00417a]/8 flex items-center justify-center flex-shrink-0">
                                        <Gift className="w-3 h-3 text-[#00417a]" />
                                    </div>
                                    <span className="text-[0.65rem] xs:text-xs text-gray-700 font-medium">
                                        {t('loginPrompt.benefit1')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-6 h-6 rounded-md bg-[#00417a]/8 flex items-center justify-center flex-shrink-0">
                                        <Package className="w-3 h-3 text-[#00417a]" />
                                    </div>
                                    <span className="text-[0.65rem] xs:text-xs text-gray-700 font-medium">
                                        {t('loginPrompt.benefit2')}
                                    </span>
                                </div>
                            </div>

                            {/* Login button */}
                            <button
                                onClick={onLoginClick}
                                className="w-full bg-[#EE0027] hover:bg-[#d4183d] active:scale-[0.98] text-white px-3 xs:px-4 py-2 xs:py-2.5 rounded-lg transition-all text-xs xs:text-sm font-semibold shadow-sm"
                            >
                                {t('loginPrompt.loginButton')}
                            </button>
                        </div>

                        {/* Arrow indicator */}
                        <div
                            className="absolute w-3 h-3 transform rotate-45"
                            style={{
                                [position === 'top' ? 'bottom' : 'top']: '-6px',
                                right: '12px',
                                background: position === 'top' ? '#fff' : '#00417a',
                                borderColor: position === 'top' ? '#e5e7eb' : 'transparent',
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
