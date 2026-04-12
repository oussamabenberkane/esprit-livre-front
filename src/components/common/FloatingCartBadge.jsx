import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Trash2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';

const BADGE_VISIBILITY_KEY = 'el_cart_badge_dismissed';
const LAST_CART_COUNT_KEY = 'el_cart_last_count';

const DELETE_THRESHOLD = -100;

export default function FloatingCartBadge({ onGoToCart }) {
  const { t } = useTranslation();
  const { cartItems, packCartItems, getCartItemCount, getPackCartItemCount } = useCart();

  const [isVisible, setIsVisible] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const previousCountRef = useRef(0);

  const dragX = useMotionValue(0);
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, time: 0 });
  const wasDragRef = useRef(false);

  // Derived motion values for the delete zone reveal
  const deleteOpacity = useTransform(dragX, [-140, -40, 0], [1, 0.6, 0]);
  const deleteScale = useTransform(dragX, [-140, -60, 0], [1.1, 0.8, 0.5]);
  const badgeOpacity = useTransform(dragX, [-180, -120, 0], [0.4, 0.85, 1]);

  useEffect(() => {
    const bookCount = getCartItemCount();
    const packCount = getPackCartItemCount();
    const currentCount = bookCount + packCount;

    setItemCount(currentCount);

    if (currentCount === 0) {
      setIsVisible(false);
      localStorage.removeItem(BADGE_VISIBILITY_KEY);
      localStorage.setItem(LAST_CART_COUNT_KEY, '0');
      previousCountRef.current = 0;
      return;
    }

    const lastKnownCount = parseInt(localStorage.getItem(LAST_CART_COUNT_KEY) || '0', 10);
    const wasDismissed = localStorage.getItem(BADGE_VISIBILITY_KEY) === 'true';

    if (currentCount > lastKnownCount) {
      setIsVisible(true);
      setJustAdded(true);
      localStorage.removeItem(BADGE_VISIBILITY_KEY);
      localStorage.setItem(LAST_CART_COUNT_KEY, currentCount.toString());
      const timeout = setTimeout(() => setJustAdded(false), 2400);
      return () => clearTimeout(timeout);
    } else if (currentCount > 0 && !wasDismissed) {
      setIsVisible(true);
    }

    previousCountRef.current = currentCount;
  }, [cartItems, packCartItems, getCartItemCount, getPackCartItemCount]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(BADGE_VISIBILITY_KEY, 'true');
    localStorage.setItem(LAST_CART_COUNT_KEY, itemCount.toString());
  }, [itemCount]);

  const handleDragStart = useCallback((_, info) => {
    dragStartRef.current = { x: info.point.x, y: info.point.y, time: Date.now() };
    wasDragRef.current = false;
  }, []);

  const handleDrag = useCallback((_, info) => {
    const dist = Math.abs(info.offset.x);
    if (dist > 6) {
      wasDragRef.current = true;
      setIsDragging(true);
    }
  }, []);

  const handleDragEnd = useCallback(async (_, info) => {
    setIsDragging(false);
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Fast swipe left or past threshold → dismiss
    if (offset < DELETE_THRESHOLD || velocity < -500) {
      await controls.start({
        x: -400,
        opacity: 0,
        transition: { type: 'spring', stiffness: 300, damping: 30 },
      });
      handleDismiss();
      dragX.set(0);
      controls.set({ x: 0, opacity: 1 });
    } else {
      // Snap back
      controls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 500, damping: 30 },
      });
    }

    // Reset drag flag after a tick so onClick doesn't fire
    requestAnimationFrame(() => {
      wasDragRef.current = false;
    });
  }, [controls, dragX, handleDismiss]);

  const handleTap = useCallback(() => {
    if (!wasDragRef.current) {
      onGoToCart();
    }
  }, [onGoToCart]);

  // Reset position when badge becomes visible
  useEffect(() => {
    if (isVisible) {
      dragX.set(0);
      controls.set({ x: 0, opacity: 1 });
    }
  }, [isVisible, dragX, controls]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-5 right-3 md:bottom-7 md:right-6 z-40" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.7 }}
            transition={{ type: 'spring', stiffness: 400, damping: 26, mass: 0.8 }}
            className="relative"
          >
            {/* Delete zone — revealed underneath when swiping left */}
            <motion.div
              className="absolute inset-0 rounded-[18px] md:rounded-[22px] flex items-center justify-end pr-5 md:pr-6 overflow-hidden"
              style={{
                opacity: deleteOpacity,
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: '0 4px 20px rgba(220, 38, 38, 0.35)',
              }}
            >
              <motion.div
                style={{ scale: deleteScale }}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4 md:w-5 md:h-5 text-white/90" />
              </motion.div>
            </motion.div>

            {/* The draggable badge */}
            <motion.div
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: -200, right: 0 }}
              dragElastic={{ left: 0.15, right: 0.4 }}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onTap={handleTap}
              animate={controls}
              style={{ x: dragX, opacity: badgeOpacity }}
              className="relative cursor-pointer select-none touch-pan-y"
              whileTap={!isDragging ? { scale: 0.97 } : undefined}
            >
              {/* Ambient glow */}
              <motion.div
                className="absolute -inset-2.5 rounded-[22px] pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0, 65, 122, 0.35), transparent 70%)',
                  filter: 'blur(12px)',
                }}
                animate={justAdded ? {
                  opacity: [0.4, 0.8, 0.4],
                  scale: [1, 1.12, 1],
                } : { opacity: 0.35 }}
                transition={justAdded ? {
                  duration: 1.2,
                  repeat: 2,
                  ease: 'easeInOut',
                } : {}}
              />

              {/* Main badge surface */}
              <div
                className="relative rounded-[18px] md:rounded-[22px] overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg, #003a6e 0%, #00417a 35%, #004f94 100%)',
                  boxShadow: isDragging
                    ? '0 16px 48px rgba(0, 52, 100, 0.45), 0 2px 8px rgba(0,0,0,0.15)'
                    : '0 8px 28px rgba(0, 52, 100, 0.3), 0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                {/* Glass highlight on top edge */}
                <div
                  className="absolute top-0 left-3 right-3 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)' }}
                />

                <div className="flex items-center gap-3 md:gap-4 pl-3.5 pr-4 py-2.5 md:pl-5 md:pr-5 md:py-3.5">
                  {/* Cart icon container */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="rounded-xl p-2 md:p-2.5"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <ShoppingCart className="w-[18px] h-[18px] md:w-5 md:h-5 text-white/90" />
                    </div>

                    {/* Count pill */}
                    <motion.div
                      key={itemCount}
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 14, delay: 0.08 }}
                      className="absolute -top-1.5 -right-1.5 min-w-[18px] md:min-w-[20px] h-[18px] md:h-[20px] flex items-center justify-center rounded-full text-[10px] md:text-[11px] font-bold leading-none px-[5px]"
                      style={{
                        background: '#ee0027',
                        color: '#fff',
                        boxShadow: '0 2px 8px rgba(238, 0, 39, 0.45)',
                        border: '1.5px solid rgba(0, 65, 122, 0.6)',
                      }}
                    >
                      {itemCount}
                    </motion.div>
                  </div>

                  {/* Text block */}
                  <div className="flex flex-col min-w-0 gap-0.5">
                    <span className="text-white font-semibold text-[11.5px] md:text-[14px] leading-tight tracking-[-0.01em] truncate">
                      {itemCount === 1
                        ? t('floatingCartBadge.itemAdded', { count: itemCount })
                        : t('floatingCartBadge.itemsAdded', { count: itemCount })
                      }
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] md:text-xs font-medium text-white/50">
                      {t('floatingCartBadge.cart')}
                      <ChevronRight className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>

                {/* Bottom accent line */}
                <div
                  className="h-[2px] w-full"
                  style={{
                    background: justAdded
                      ? 'linear-gradient(90deg, transparent 5%, #ee0027 30%, #ff4d5e 50%, #ee0027 70%, transparent 95%)'
                      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                    transition: 'background 0.6s ease',
                  }}
                />
              </div>

              {/* Swipe hint — subtle left-arrow chevrons on first appearance */}
              <AnimatePresence>
                {justAdded && (
                  <motion.div
                    className="absolute right-full top-1/2 -translate-y-1/2 mr-2 flex items-center pointer-events-none"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: [0, 0.5, 0], x: [10, -4, -12] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.8, delay: 1.5, ease: 'easeInOut' }}
                  >
                    <span className="text-white/40 text-xs font-medium tracking-wide">
                      ‹‹
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
