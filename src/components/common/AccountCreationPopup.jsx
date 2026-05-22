import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { X, Package, Heart, Tag, Star } from 'lucide-react';
import { isAuthenticated } from '../../services/authService';
import { initiateGoogleLogin } from '../../services/oauthService';

const STORAGE_KEY = 'el_account_popup_until';
const DISMISS_MS = 24 * 60 * 60 * 1000;

const canShow = () => {
  const until = localStorage.getItem(STORAGE_KEY);
  return !until || Date.now() > Number(until);
};

const snooze = () => localStorage.setItem(STORAGE_KEY, String(Date.now() + DISMISS_MS));

const BENEFITS = [
  { icon: Package, key: 'orders',    color: '#3b82f6', bg: '#eff6ff' },
  { icon: Heart,   key: 'wishlist',  color: '#ef4444', bg: '#fef2f2' },
  { icon: Tag,     key: 'discounts', color: '#16A34A', bg: '#f0fdf4' },
  { icon: Star,    key: 'points',    color: '#f59e0b', bg: '#fffbeb' },
];

export default function AccountCreationPopup() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const tryOpen = useCallback(() => {
    if (!isAuthenticated() && canShow()) setOpen(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(tryOpen, 1800);
    const onAuthChange = ({ detail }) => {
      if (detail?.authenticated) setOpen(false);
    };
    window.addEventListener('authStateChanged', onAuthChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('authStateChanged', onAuthChange);
    };
  }, [tryOpen]);

  const handleClose = () => setOpen(false);

  const handleDismiss = () => {
    snooze();
    setOpen(false);
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await initiateGoogleLogin();
    } catch {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[200] bg-black/55 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal wrapper */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.88, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 24 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[360px] sm:max-w-[500px] rounded-3xl overflow-hidden shadow-2xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* ── Header (navy) ──────────────────────────────── */}
              <div className="relative bg-[#00417a] px-6 pt-7 pb-8 sm:px-9 sm:pt-9 sm:pb-10 overflow-hidden">

                {/* Decorative rings */}
                <span className="absolute -top-10 -right-10 w-44 h-44 rounded-full border border-white/10 block" />
                <span className="absolute -top-5  -right-5  w-28 h-28 rounded-full border border-white/10 block" />
                <span className="absolute top-1/2 -left-12 w-36 h-36 rounded-full bg-white/[0.04] block" style={{ transform: 'translateY(-50%)' }} />

                {/* Radial glow */}
                <span
                  className="absolute inset-0 block opacity-30"
                  style={{ background: 'radial-gradient(ellipse 180% 120% at 80% -10%, #0ea5e920 0%, transparent 70%)' }}
                />

                {/* Close */}
                <button
                  onClick={handleClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-all z-10"
                  aria-label="Fermer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>

                {/* STAMP badge — slams in like the SWAP reference */}
                <div className="mb-4 sm:mb-5">
                  <motion.div
                    initial={{ scale: 0, rotate: -20, opacity: 0 }}
                    animate={{ scale: 1, rotate: 6, opacity: 1 }}
                    transition={{ delay: 0.12, type: 'spring', stiffness: 520, damping: 13, mass: 0.55 }}
                    className="inline-block bg-white text-[#00417a] font-black uppercase tracking-tight leading-none rounded-xl px-4 py-2 sm:px-5 sm:py-2.5 text-[2rem] sm:text-[2.6rem] shadow-lg"
                    style={{ originX: 0.5, originY: 0.5 }}
                  >
                    {t('accountPopup.badge')}
                  </motion.div>
                </div>

                <motion.h2
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.28 }}
                  className="text-white font-bold text-[1.1rem] sm:text-[1.35rem] leading-snug mb-2 sm:mb-3 pr-6"
                >
                  {t('accountPopup.title')}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.38, duration: 0.28 }}
                  className="text-white/65 text-[0.8rem] sm:text-[0.9rem] leading-relaxed"
                >
                  {t('accountPopup.subtitle')}
                </motion.p>
              </div>

              {/* ── Body (white) ──────────────────────────────── */}
              <div className="bg-white rounded-t-3xl -mt-4 relative z-10 px-5 pt-5 pb-5 sm:px-8 sm:pt-6 sm:pb-7">

                {/* Benefits 2×2 */}
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                  {BENEFITS.map(({ icon: Icon, key, color, bg }, i) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.32 + i * 0.06 }}
                      className="rounded-2xl p-3.5 sm:p-5"
                      style={{ backgroundColor: bg }}
                    >
                      <div
                        className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3"
                        style={{ backgroundColor: color + '22' }}
                      >
                        <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" style={{ color }} strokeWidth={2.2} />
                      </div>
                      <p className="text-[#00417a] font-semibold text-[0.72rem] sm:text-[0.85rem] leading-tight mb-0.5">
                        {t(`accountPopup.benefit.${key}.title`)}
                      </p>
                      <p className="text-gray-400 text-[0.68rem] sm:text-[0.78rem] leading-snug">
                        {t(`accountPopup.benefit.${key}.desc`)}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* CTA */}
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.58 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 bg-[#16A34A] hover:bg-[#15803d] disabled:opacity-60 text-white py-3.5 sm:py-4 rounded-2xl font-semibold text-sm sm:text-base transition-colors mb-2.5 sm:mb-3 shadow-lg"
                  style={{ boxShadow: '0 4px 18px rgba(22,163,74,0.28)' }}
                >
                  {/* White Google icon */}
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="flex-shrink-0">
                    <path d="M19.6 10.227c0-.71-.064-1.392-.182-2.045H10v3.868h5.382c-.232 1.25-.937 2.31-1.996 3.018v2.51h3.232C18.509 15.836 19.6 13.273 19.6 10.227z" fill="white" fillOpacity=".9"/>
                    <path d="M10 20c2.7 0 4.964-.896 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.604 0-4.81-1.759-5.595-4.123H1.064v2.591C2.709 17.759 6.091 20 10 20z" fill="white" fillOpacity=".9"/>
                    <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.997 9.997 0 0 0 0 10c0 1.614.387 3.141 1.064 4.491L4.405 11.9z" fill="white" fillOpacity=".9"/>
                    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.869C14.96.991 12.695 0 10 0 6.091 0 2.709 2.241 1.064 5.509l3.34 2.591C5.19 5.736 7.396 3.977 10 3.977z" fill="white" fillOpacity=".9"/>
                  </svg>
                  {loading ? t('auth.connecting') : t('accountPopup.cta')}
                </motion.button>

                {/* Dismiss */}
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.68 }}
                  onClick={handleDismiss}
                  className="w-full text-center text-gray-400 hover:text-gray-500 text-[0.75rem] sm:text-[0.82rem] py-1 transition-colors"
                >
                  {t('accountPopup.dismiss')}
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
