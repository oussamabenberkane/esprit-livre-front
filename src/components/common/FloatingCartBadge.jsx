import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, X, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../../contexts/CartContext';

const BADGE_VISIBILITY_KEY = 'el_cart_badge_dismissed';
const LAST_CART_COUNT_KEY = 'el_cart_last_count';

export default function FloatingCartBadge({ onGoToCart }) {
  const { t } = useTranslation();
  const { cartItems, packCartItems, getCartItemCount, getPackCartItemCount } = useCart();

  const [isVisible, setIsVisible] = useState(false);
  const [itemCount, setItemCount] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const previousCountRef = useRef(0);

  // Drag & drop states
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isNearDelete, setIsNearDelete] = useState(false);
  const badgeRef = useRef(null);
  const deleteZoneRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Click vs drag detection
  const [isClick, setIsClick] = useState(true);
  const dragTimeoutRef = useRef(null);

  const DRAG_THRESHOLD = 10;
  const DRAG_TIME_THRESHOLD = 150;

  useEffect(() => {
    const bookCount = getCartItemCount();
    const packCount = getPackCartItemCount();
    const currentCount = bookCount + packCount;
    const previousCount = previousCountRef.current;

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
      // Reset the "just added" highlight after the attention pulse
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

  const handleBadgeClick = useCallback(() => {
    if (isClick && !isDragging) {
      onGoToCart();
    }
  }, [isClick, isDragging, onGoToCart]);

  // Reset position when badge becomes visible
  useEffect(() => {
    if (isVisible) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setShowDeleteZone(false);
      setIsNearDelete(false);
    }
  }, [isVisible]);

  // Freeze background during drag
  useEffect(() => {
    if (isDragging) {
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;

      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.userSelect = 'none';
      document.body.style.pointerEvents = 'none';

      const preventBackgroundEvents = (e) => {
        if (badgeRef.current?.contains(e.target) || deleteZoneRef.current?.contains(e.target)) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
      };

      document.addEventListener('touchmove', preventBackgroundEvents, { passive: false });
      document.addEventListener('wheel', preventBackgroundEvents, { passive: false });
      document.addEventListener('scroll', preventBackgroundEvents, { passive: false });
      document.addEventListener('click', preventBackgroundEvents, { capture: true });
      document.addEventListener('mousedown', preventBackgroundEvents, { capture: true });
      document.addEventListener('mouseup', preventBackgroundEvents, { capture: true });
      document.addEventListener('contextmenu', preventBackgroundEvents, { capture: true });

      return () => {
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';

        document.removeEventListener('touchmove', preventBackgroundEvents);
        document.removeEventListener('wheel', preventBackgroundEvents);
        document.removeEventListener('scroll', preventBackgroundEvents);
        document.removeEventListener('click', preventBackgroundEvents, { capture: true });
        document.removeEventListener('mousedown', preventBackgroundEvents, { capture: true });
        document.removeEventListener('mouseup', preventBackgroundEvents, { capture: true });
        document.removeEventListener('contextmenu', preventBackgroundEvents, { capture: true });

        window.scrollTo(0, scrollPositionRef.current);
      };
    }
  }, [isDragging]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsClick(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    setDragStartPos({
      x: touch.clientX,
      y: touch.clientY
    });

    dragTimeoutRef.current = setTimeout(() => {
      setIsClick(false);
      setIsDragging(true);
    }, DRAG_TIME_THRESHOLD);

    e.stopPropagation();
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];

    const distanceMoved = Math.sqrt(
      Math.pow(touch.clientX - dragStartPos.x, 2) +
      Math.pow(touch.clientY - dragStartPos.y, 2)
    );

    if (distanceMoved > DRAG_THRESHOLD && isClick) {
      setIsClick(false);
      setIsDragging(true);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    }

    if (!isDragging && distanceMoved <= DRAG_THRESHOLD) return;

    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    if (distanceMoved > DRAG_THRESHOLD && !showDeleteZone) {
      setShowDeleteZone(true);
    }

    setPosition({ x: newX, y: newY });

    if (showDeleteZone && deleteZoneRef.current && badgeRef.current) {
      const deleteRect = deleteZoneRef.current.getBoundingClientRect();
      const badgeRect = badgeRef.current.getBoundingClientRect();

      const distance = Math.sqrt(
        Math.pow(deleteRect.left - badgeRect.left, 2) +
        Math.pow(deleteRect.top - badgeRect.top, 2)
      );

      setIsNearDelete(distance < 80);
    }

    e.stopPropagation();
  };

  const handleTouchEnd = () => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    if (isClick) {
      handleBadgeClick();
    } else if (isNearDelete && showDeleteZone) {
      handleDismiss();
    } else {
      setPosition({ x: 0, y: 0 });
    }

    setIsDragging(false);
    setIsNearDelete(false);
    setShowDeleteZone(false);
    setIsClick(true);
  };

  const handleMouseDown = (e) => {
    setIsClick(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    setDragStartPos({
      x: e.clientX,
      y: e.clientY
    });

    dragTimeoutRef.current = setTimeout(() => {
      setIsClick(false);
      setIsDragging(true);
    }, DRAG_TIME_THRESHOLD);
  };

  const handleMouseMove = useCallback((e) => {
    const distanceMoved = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.x, 2) +
      Math.pow(e.clientY - dragStartPos.y, 2)
    );

    if (distanceMoved > DRAG_THRESHOLD && isClick) {
      setIsClick(false);
      setIsDragging(true);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    }

    if (!isDragging && distanceMoved <= DRAG_THRESHOLD) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    if (distanceMoved > DRAG_THRESHOLD && !showDeleteZone) {
      setShowDeleteZone(true);
    }

    setPosition({ x: newX, y: newY });

    if (showDeleteZone && deleteZoneRef.current && badgeRef.current) {
      const deleteRect = deleteZoneRef.current.getBoundingClientRect();
      const badgeRect = badgeRef.current.getBoundingClientRect();

      const distance = Math.sqrt(
        Math.pow(deleteRect.left - badgeRect.left, 2) +
        Math.pow(deleteRect.top - badgeRect.top, 2)
      );

      setIsNearDelete(distance < 80);
    }
  }, [isDragging, isClick, dragStart, dragStartPos, showDeleteZone]);

  const handleMouseUp = useCallback(() => {
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    if (isClick) {
      handleBadgeClick();
    } else if (isNearDelete && showDeleteZone) {
      handleDismiss();
    } else {
      setPosition({ x: 0, y: 0 });
    }

    setIsDragging(false);
    setIsNearDelete(false);
    setShowDeleteZone(false);
    setIsClick(true);
  }, [isClick, isNearDelete, showDeleteZone, handleBadgeClick, handleDismiss]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Delete Zone */}
      <AnimatePresence>
        {showDeleteZone && (
          <motion.div
            ref={deleteZoneRef}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isNearDelete ? 1.2 : 1,
            }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50"
            style={{ pointerEvents: 'auto' }}
          >
            <div
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className="rounded-full p-3.5 md:p-4 transition-colors duration-200 shadow-2xl"
                style={{
                  background: isNearDelete
                    ? 'linear-gradient(135deg, #dc2626, #b91c1c)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  boxShadow: isNearDelete
                    ? '0 0 30px rgba(220, 38, 38, 0.5)'
                    : '0 8px 24px rgba(220, 38, 38, 0.3)',
                }}
              >
                <Trash2 className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <span className="text-[10px] md:text-xs font-medium text-gray-500">
                {t('floatingCartBadge.dragToDelete')}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Badge */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={badgeRef}
            initial={{ opacity: 0, y: 80, scale: 0.6 }}
            animate={{
              opacity: isDragging && isNearDelete ? 0.5 : 1,
              y: 0,
              scale: isDragging ? 1.05 : 1,
            }}
            exit={{ opacity: 0, y: 40, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 360,
              damping: 28,
              mass: 0.8,
            }}
            className={`fixed bottom-4 right-3 md:bottom-6 md:right-6 z-40 ${
              isDragging ? 'cursor-grabbing' : 'cursor-pointer'
            }`}
            style={{
              transform: `translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
              pointerEvents: 'auto',
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Ambient glow behind the badge */}
            <div
              className="absolute -inset-2 rounded-2xl opacity-40 blur-xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #00417a, #0052a3)',
                animation: justAdded ? 'cartGlow 1.2s ease-in-out 2' : 'none',
              }}
            />

            {/* Main badge body */}
            <div
              className="relative rounded-2xl overflow-hidden shadow-lg md:shadow-xl"
              style={{
                background: 'linear-gradient(135deg, #00356a 0%, #00417a 40%, #004d8f 100%)',
                boxShadow: isDragging
                  ? '0 20px 50px rgba(0, 65, 122, 0.4)'
                  : '0 8px 32px rgba(0, 65, 122, 0.25)',
              }}
            >
              {/* Subtle top highlight line */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px]"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                }}
              />

              <div className="flex items-center gap-2.5 md:gap-3.5 px-3 py-2.5 md:px-5 md:py-3.5 pr-8 md:pr-10">
                {/* Cart icon with count bubble */}
                <div className="relative flex-shrink-0">
                  <div
                    className="rounded-xl p-2 md:p-2.5"
                    style={{
                      background: 'rgba(255, 255, 255, 0.12)',
                      backdropFilter: 'blur(8px)',
                    }}
                  >
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </div>
                  {/* Item count bubble */}
                  <motion.div
                    key={itemCount}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15, delay: 0.1 }}
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] md:min-w-[20px] h-[18px] md:h-[20px] flex items-center justify-center rounded-full text-[10px] md:text-[11px] font-bold leading-none px-1"
                    style={{
                      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                      color: '#fff',
                      boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)',
                    }}
                  >
                    {itemCount}
                  </motion.div>
                </div>

                {/* Text content */}
                <div className="flex flex-col min-w-0">
                  <span className="text-white font-semibold text-[11px] md:text-sm leading-tight truncate">
                    {itemCount === 1
                      ? t('floatingCartBadge.itemAdded', { count: itemCount })
                      : t('floatingCartBadge.itemsAdded', { count: itemCount })
                    }
                  </span>
                  <span
                    className="flex items-center gap-0.5 mt-0.5 text-[10px] md:text-xs font-medium"
                    style={{ color: 'rgba(255, 255, 255, 0.65)' }}
                  >
                    {t('floatingCartBadge.cart')}
                    <ArrowRight className="w-2.5 h-2.5 md:w-3 md:h-3" />
                  </span>
                </div>
              </div>

              {/* Animated progress-like accent bar at bottom */}
              <div
                className="h-[2px] w-full"
                style={{
                  background: justAdded
                    ? 'linear-gradient(90deg, transparent, #f59e0b, #fbbf24, #f59e0b, transparent)'
                    : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
                  transition: 'background 0.6s ease',
                }}
              />
            </div>

            {/* Close button — sits outside the card, top-right */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDismiss();
              }}
              className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full transition-all duration-150 hover:scale-110"
              style={{
                background: 'rgba(30, 41, 59, 0.85)',
                backdropFilter: 'blur(4px)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
              aria-label={t('floatingCartBadge.close')}
            >
              <X className="w-3 h-3 md:w-3.5 md:h-3.5 text-white/80" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyframe for glow pulse on new item */}
      <style>{`
        @keyframes cartGlow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.15); }
        }
      `}</style>
    </>
  );
}
