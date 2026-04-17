import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform, useAnimation } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';

const BADGE_VISIBILITY_KEY = 'el_cart_badge_dismissed';
const LAST_CART_COUNT_KEY = 'el_cart_last_count';
const DELETE_THRESHOLD = -100;

export default function FloatingCartBadge({ onGoToCart }) {
  const { t } = useTranslation();
  const { cartItems, packCartItems, getPackCartItemCount } = useCart();

  const [isVisible, setIsVisible] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [justAdded, setJustAdded] = useState(false);

  const dragX = useMotionValue(0);
  const controls = useAnimation();
  const [isDragging, setIsDragging] = useState(false);
  const wasDragRef = useRef(false);

  // Delete zone reveal — driven by drag position
  const deleteOpacity = useTransform(dragX, [-160, -30, 0], [1, 0.5, 0]);
  const deleteScale  = useTransform(dragX, [-160, -50, 0], [1,   0.7, 0.4]);
  const badgeOpacity = useTransform(dragX, [-200, -120, 0], [0.3, 0.9, 1]);
  const deleteWidth  = useTransform(dragX, [-160, 0], ['100%', '60%']);

  useEffect(() => {
    const bookCount = cartItems.length;
    const packCount = getPackCartItemCount();
    const currentCount = bookCount + packCount;

    setItemCount(currentCount);

    if (currentCount === 0) {
      setIsVisible(false);
      localStorage.removeItem(BADGE_VISIBILITY_KEY);
      localStorage.setItem(LAST_CART_COUNT_KEY, '0');
      return;
    }

    const lastKnownCount = parseInt(localStorage.getItem(LAST_CART_COUNT_KEY) || '0', 10);
    const wasDismissed = localStorage.getItem(BADGE_VISIBILITY_KEY) === 'true';

    if (currentCount > lastKnownCount) {
      setIsVisible(true);
      setJustAdded(true);
      localStorage.removeItem(BADGE_VISIBILITY_KEY);
      localStorage.setItem(LAST_CART_COUNT_KEY, currentCount.toString());
      const t = setTimeout(() => setJustAdded(false), 2400);
      return () => clearTimeout(t);
    } else if (currentCount > 0 && !wasDismissed) {
      setIsVisible(true);
    }
  }, [cartItems, packCartItems, getPackCartItemCount]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    localStorage.setItem(BADGE_VISIBILITY_KEY, 'true');
    localStorage.setItem(LAST_CART_COUNT_KEY, itemCount.toString());
  }, [itemCount]);

  // ── Fix: reset the drag flag at the START of each gesture so onTap
  //    always sees a clean state for the current interaction.
  const handleDragStart = useCallback(() => {
    wasDragRef.current = false;
  }, []);

  const handleDrag = useCallback((_, info) => {
    if (Math.abs(info.offset.x) > 6) {
      wasDragRef.current = true;
      setIsDragging(true);
    }
  }, []);

  const handleDragEnd = useCallback(async (_, info) => {
    setIsDragging(false);

    if (info.offset.x < DELETE_THRESHOLD || info.velocity.x < -500) {
      await controls.start({
        x: -420,
        opacity: 0,
        transition: { type: 'spring', stiffness: 280, damping: 28 },
      });
      handleDismiss();
      dragX.set(0);
      controls.set({ x: 0, opacity: 1 });
    } else {
      controls.start({
        x: 0,
        transition: { type: 'spring', stiffness: 500, damping: 32 },
      });
    }
  }, [controls, dragX, handleDismiss]);

  // onTap is only called by Framer Motion when the gesture was a genuine tap
  // (no movement). wasDragRef guards the edge-case where a tiny sub-threshold
  // drag was registered before pointer-up.
  const handleTap = useCallback(() => {
    if (!wasDragRef.current) {
      onGoToCart();
    }
  }, [onGoToCart]);

  useEffect(() => {
    if (isVisible) {
      dragX.set(0);
      controls.set({ x: 0, opacity: 1 });
    }
  }, [isVisible, dragX, controls]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-5 right-3 md:bottom-7 md:right-6 z-40"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 56, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 36, scale: 0.75 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.7 }}
            className="relative"
          >

            {/* ── Delete zone — slides in from the right edge as badge drags left ── */}
            <motion.div
              className="absolute inset-0 rounded-2xl flex items-center justify-end overflow-hidden pointer-events-none"
              style={{ opacity: deleteOpacity }}
            >
              {/* Red fill that expands from right */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #c0182a 0%, #e8112a 60%, #ff2d44 100%)',
                }}
              />
              {/* Icon + label pinned to the right */}
              <motion.div
                className="relative flex items-center gap-1.5 pr-4 md:pr-5"
                style={{ scale: deleteScale }}
              >
                <Trash2 className="w-4 h-4 md:w-[18px] md:h-[18px] text-white" strokeWidth={2} />
                <span className="text-white text-[11px] md:text-xs font-semibold tracking-wide">
                  {t('floatingCartBadge.delete', 'Supprimer')}
                </span>
              </motion.div>
            </motion.div>

            {/* ── Draggable badge ── */}
            <motion.div
              drag="x"
              dragDirectionLock
              dragConstraints={{ left: -210, right: 0 }}
              dragElastic={{ left: 0.12, right: 0.35 }}
              onDragStart={handleDragStart}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onTap={handleTap}
              animate={controls}
              style={{ x: dragX, opacity: badgeOpacity }}
              className="relative cursor-pointer select-none touch-pan-y"
              whileTap={!isDragging ? { scale: 0.96 } : undefined}
            >
              {/* Ambient glow pulse on new item */}
              <motion.div
                className="absolute -inset-3 rounded-3xl pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,65,122,0.4), transparent 68%)',
                  filter: 'blur(14px)',
                }}
                animate={justAdded
                  ? { opacity: [0.3, 0.9, 0.3], scale: [1, 1.15, 1] }
                  : { opacity: 0.3 }
                }
                transition={justAdded
                  ? { duration: 1.1, repeat: 2, ease: 'easeInOut' }
                  : {}
                }
              />

              {/* Badge surface */}
              <div
                className="relative rounded-2xl overflow-hidden"
                style={{
                  background: isDragging
                    ? 'linear-gradient(145deg, #002d57 0%, #003a6e 50%, #004890 100%)'
                    : 'linear-gradient(145deg, #003160 0%, #00417a 40%, #005299 100%)',
                  boxShadow: isDragging
                    ? '0 20px 52px rgba(0,49,96,0.55), 0 4px 12px rgba(0,0,0,0.18)'
                    : '0 8px 30px rgba(0,49,96,0.32), 0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'background 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* Top-edge glass shimmer */}
                <div
                  className="absolute top-0 inset-x-4 h-px pointer-events-none"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)',
                  }}
                />

                <div className="flex items-center gap-3 md:gap-3.5 pl-3 pr-4 py-2.5 md:pl-4 md:pr-5 md:py-3">

                  {/* Cart icon well */}
                  <div className="relative flex-shrink-0">
                    <div
                      className="rounded-xl p-1.5 md:p-2"
                      style={{
                        background: 'rgba(255,255,255,0.11)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <ShoppingCart
                        className="w-[17px] h-[17px] md:w-[19px] md:h-[19px] text-white"
                        strokeWidth={2}
                      />
                    </div>

                    {/* Count badge */}
                    <motion.div
                      key={itemCount}
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 520, damping: 15, delay: 0.06 }}
                      className="absolute -top-1.5 -right-1.5 min-w-[17px] md:min-w-[19px] h-[17px] md:h-[19px] flex items-center justify-center rounded-full text-[9px] md:text-[10px] font-bold leading-none px-1"
                      style={{
                        background: '#ee0027',
                        color: '#fff',
                        boxShadow: '0 2px 7px rgba(238,0,39,0.5)',
                        border: '1.5px solid rgba(0,65,122,0.55)',
                      }}
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.div>
                  </div>

                  {/* Label */}
                  <div className="flex flex-col min-w-0 gap-[2px]">
                    <span className="text-white font-semibold text-[12px] md:text-[13.5px] leading-tight truncate">
                      {itemCount === 1
                        ? t('floatingCartBadge.itemAdded', { count: itemCount })
                        : t('floatingCartBadge.itemsAdded', { count: itemCount })
                      }
                    </span>
                    <span className="flex items-center gap-0.5 text-[10px] md:text-[11px] font-medium text-white/55 leading-none">
                      {t('floatingCartBadge.cart')}
                      <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" strokeWidth={2.5} />
                    </span>
                  </div>
                </div>

                {/* Bottom accent bar — red pulse on new add */}
                <div
                  className="h-[2.5px] w-full transition-all duration-700"
                  style={{
                    background: justAdded
                      ? 'linear-gradient(90deg, transparent 0%, #ee0027 25%, #ff3d52 50%, #ee0027 75%, transparent 100%)'
                      : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.09), transparent)',
                  }}
                />
              </div>

              {/* Swipe-hint chevrons — fades in / slides left just after add */}
              <AnimatePresence>
                {justAdded && (
                  <motion.div
                    className="absolute right-full top-1/2 -translate-y-1/2 mr-1.5 flex items-center pointer-events-none"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: [0, 0.45, 0], x: [8, -2, -10] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 2, delay: 1.4, ease: 'easeInOut' }}
                  >
                    <span className="text-white/35 text-xs font-medium tracking-tight">‹‹</span>
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
