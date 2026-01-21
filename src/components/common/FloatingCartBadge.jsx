import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, X, Trash2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

const BADGE_VISIBILITY_KEY = 'el_cart_badge_dismissed';
const LAST_CART_COUNT_KEY = 'el_cart_last_count';

export default function FloatingCartBadge({ onGoToCart }) {
  const { t } = useTranslation();
  const { cartItems, packCartItems, getCartItemCount, getPackCartItemCount } = useCart();

  // State for visibility - managed internally now
  const [isVisible, setIsVisible] = useState(false);
  const [itemCount, setItemCount] = useState(0);
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

  // Drag threshold in pixels - must move this much before considering it a drag
  const DRAG_THRESHOLD = 10;
  // Time threshold in ms - click becomes drag after this duration
  const DRAG_TIME_THRESHOLD = 150;

  /**
   * Core Logic: Listen to cart changes and manage badge visibility
   * Updated to track last known count and only show when new items are added
   * Now includes both book and pack counts
   */
  useEffect(() => {
    const bookCount = getCartItemCount();
    const packCount = getPackCartItemCount();
    const currentCount = bookCount + packCount; // Pack counts as 1 item
    const previousCount = previousCountRef.current;

    // Update item count
    setItemCount(currentCount);

    // Hide badge if cart is empty
    if (currentCount === 0) {
      setIsVisible(false);
      localStorage.removeItem(BADGE_VISIBILITY_KEY);
      localStorage.setItem(LAST_CART_COUNT_KEY, '0');
      previousCountRef.current = 0;
      return;
    }

    // Get last known cart count (persisted across sessions)
    const lastKnownCount = parseInt(localStorage.getItem(LAST_CART_COUNT_KEY) || '0', 10);

    // Check if badge was manually dismissed
    const wasDismissed = localStorage.getItem(BADGE_VISIBILITY_KEY) === 'true';

    // Show badge if:
    // 1. Cart count increased from last known count (new items added) - always show, even if previously dismissed
    // 2. Cart has items and badge was never dismissed AND count hasn't changed since last session
    if (currentCount > lastKnownCount) {
      // New items added - show badge and clear dismissed state
      setIsVisible(true);
      localStorage.removeItem(BADGE_VISIBILITY_KEY);
      localStorage.setItem(LAST_CART_COUNT_KEY, currentCount.toString());
    } else if (currentCount > 0 && !wasDismissed) {
      // Cart has items and wasn't dismissed - show badge
      setIsVisible(true);
    }

    // Update previous count for within-session tracking
    previousCountRef.current = currentCount;
  }, [cartItems, packCartItems, getCartItemCount, getPackCartItemCount]);

  /**
   * Handle manual dismissal (close button or drag-to-remove)
   * Updates localStorage to persist dismissal across page reloads/navigations
   */
  const handleDismiss = () => {
    setIsVisible(false);
    // Mark as dismissed in localStorage - persists until new item added
    localStorage.setItem(BADGE_VISIBILITY_KEY, 'true');
    // Store current count so we know when new items are added
    localStorage.setItem(LAST_CART_COUNT_KEY, itemCount.toString());
  };

  /**
   * Handle click on badge - navigate to cart
   * Only triggers if not dragging
   */
  const handleBadgeClick = () => {
    if (isClick && !isDragging) {
      onGoToCart();
    }
  };

  // Reset position when badge becomes visible
  useEffect(() => {
    if (isVisible) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setShowDeleteZone(false);
      setIsNearDelete(false);
    }
  }, [isVisible]);

  // Completely freeze all background interactions during drag
  useEffect(() => {
    if (isDragging) {
      // Save current scroll position
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;

      // Freeze the page completely
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';
      document.body.style.userSelect = 'none'; // Prevent text selection
      document.body.style.pointerEvents = 'none'; // Disable all pointer events on background

      // Prevent all default behaviors except on our badge and delete zone
      const preventBackgroundEvents = (e) => {
        // Allow events on the badge and delete zone to pass through
        if (badgeRef.current?.contains(e.target) || deleteZoneRef.current?.contains(e.target)) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
      };

      // Add non-passive listeners to prevent background interactions
      document.addEventListener('touchmove', preventBackgroundEvents, { passive: false });
      document.addEventListener('wheel', preventBackgroundEvents, { passive: false });
      document.addEventListener('scroll', preventBackgroundEvents, { passive: false });
      document.addEventListener('click', preventBackgroundEvents, { capture: true });
      document.addEventListener('mousedown', preventBackgroundEvents, { capture: true });
      document.addEventListener('mouseup', preventBackgroundEvents, { capture: true });
      document.addEventListener('contextmenu', preventBackgroundEvents, { capture: true });

      return () => {
        // Restore all interactions when dragging stops
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.userSelect = '';
        document.body.style.pointerEvents = '';

        // Remove all event listeners
        document.removeEventListener('touchmove', preventBackgroundEvents);
        document.removeEventListener('wheel', preventBackgroundEvents);
        document.removeEventListener('scroll', preventBackgroundEvents);
        document.removeEventListener('click', preventBackgroundEvents, { capture: true });
        document.removeEventListener('mousedown', preventBackgroundEvents, { capture: true });
        document.removeEventListener('mouseup', preventBackgroundEvents, { capture: true });
        document.removeEventListener('contextmenu', preventBackgroundEvents, { capture: true });

        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      };
    }
  }, [isDragging]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsClick(true); // Assume it's a click until proven otherwise
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    setDragStartPos({
      x: touch.clientX,
      y: touch.clientY
    });

    // Set timeout to mark as drag after threshold time
    dragTimeoutRef.current = setTimeout(() => {
      setIsClick(false);
      setIsDragging(true);
    }, DRAG_TIME_THRESHOLD);

    // Stop propagation so our drag works while document scroll is prevented
    e.stopPropagation();
  };

  const handleTouchMove = (e) => {
    const touch = e.touches[0];

    // Calculate distance from start position
    const distanceMoved = Math.sqrt(
      Math.pow(touch.clientX - dragStartPos.x, 2) +
      Math.pow(touch.clientY - dragStartPos.y, 2)
    );

    // If moved beyond threshold, cancel click and enable dragging
    if (distanceMoved > DRAG_THRESHOLD && isClick) {
      setIsClick(false);
      setIsDragging(true);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    }

    if (!isDragging && distanceMoved <= DRAG_THRESHOLD) {
      // Not dragging yet, don't update position
      return;
    }

    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    // Only show delete zone if dragged beyond threshold
    if (distanceMoved > DRAG_THRESHOLD && !showDeleteZone) {
      setShowDeleteZone(true);
    }

    setPosition({ x: newX, y: newY });

    // Check if near delete zone (only if zone is visible)
    if (showDeleteZone && deleteZoneRef.current && badgeRef.current) {
      const deleteRect = deleteZoneRef.current.getBoundingClientRect();
      const badgeRect = badgeRef.current.getBoundingClientRect();

      const distance = Math.sqrt(
        Math.pow(deleteRect.left - badgeRect.left, 2) +
        Math.pow(deleteRect.top - badgeRect.top, 2)
      );

      setIsNearDelete(distance < 80);
    }

    // Stop propagation so our drag works while document scroll is prevented
    e.stopPropagation();
  };

  const handleTouchEnd = () => {
    // Clear drag timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    // If it was a click (not a drag), handle the click
    if (isClick) {
      handleBadgeClick();
    } else if (isNearDelete && showDeleteZone) {
      // If dragged to delete zone, dismiss
      handleDismiss();
    } else {
      // Snap back to original position
      setPosition({ x: 0, y: 0 });
    }

    // Reset states
    setIsDragging(false);
    setIsNearDelete(false);
    setShowDeleteZone(false);
    setIsClick(true);
  };

  const handleMouseDown = (e) => {
    setIsClick(true); // Assume it's a click until proven otherwise
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    setDragStartPos({
      x: e.clientX,
      y: e.clientY
    });

    // Set timeout to mark as drag after threshold time
    dragTimeoutRef.current = setTimeout(() => {
      setIsClick(false);
      setIsDragging(true);
    }, DRAG_TIME_THRESHOLD);
  };

  const handleMouseMove = (e) => {
    // Calculate distance from start position
    const distanceMoved = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.x, 2) +
      Math.pow(e.clientY - dragStartPos.y, 2)
    );

    // If moved beyond threshold, cancel click and enable dragging
    if (distanceMoved > DRAG_THRESHOLD && isClick) {
      setIsClick(false);
      setIsDragging(true);
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    }

    if (!isDragging && distanceMoved <= DRAG_THRESHOLD) {
      // Not dragging yet, don't update position
      return;
    }

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Only show delete zone if dragged beyond threshold
    if (distanceMoved > DRAG_THRESHOLD && !showDeleteZone) {
      setShowDeleteZone(true);
    }

    setPosition({ x: newX, y: newY });

    // Check if near delete zone (only if zone is visible)
    if (showDeleteZone && deleteZoneRef.current && badgeRef.current) {
      const deleteRect = deleteZoneRef.current.getBoundingClientRect();
      const badgeRect = badgeRef.current.getBoundingClientRect();

      const distance = Math.sqrt(
        Math.pow(deleteRect.left - badgeRect.left, 2) +
        Math.pow(deleteRect.top - badgeRect.top, 2)
      );

      setIsNearDelete(distance < 80);
    }
  };

  const handleMouseUp = () => {
    // Clear drag timeout
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    // If it was a click (not a drag), handle the click
    if (isClick) {
      handleBadgeClick();
    } else if (isNearDelete && showDeleteZone) {
      // If dragged to delete zone, dismiss
      handleDismiss();
    } else {
      // Snap back to original position
      setPosition({ x: 0, y: 0 });
    }

    // Reset states
    setIsDragging(false);
    setIsNearDelete(false);
    setShowDeleteZone(false);
    setIsClick(true);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, position, dragStart]);

  // Cleanup drag timeout on unmount
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
      {/* Delete Zone - appears only when actually dragging (beyond threshold) */}
      {showDeleteZone && (
        <div
          ref={deleteZoneRef}
          className={`fixed bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-200 ${
            isNearDelete ? 'scale-110' : 'scale-100'
          }`}
          style={{ pointerEvents: 'auto' }}
        >
          <div className={`rounded-full p-3 md:p-4 transition-colors ${
            isNearDelete ? 'bg-red-600' : 'bg-red-500'
          } shadow-2xl`}>
            <Trash2 className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <p className="text-center text-xs md:text-sm font-medium text-gray-700 mt-1">
            {t('floatingCartBadge.dragToDelete')}
          </p>
        </div>
      )}

      {/* Floating Badge */}
      <div
        ref={badgeRef}
        className={`fixed bottom-3 right-3 md:bottom-6 md:right-6 z-40 ${
          isDragging ? 'cursor-grabbing' : 'cursor-pointer'
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          animation: !isDragging && position.x === 0 && position.y === 0 ? 'slideUp 0.3s ease-out' : 'none',
          opacity: isDragging && isNearDelete ? 0.5 : 1,
          pointerEvents: 'auto', // Keep badge interactive even when background is frozen
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className={`bg-[#1E40AF] text-white rounded-md md:rounded-lg shadow-lg md:shadow-2xl p-2 md:p-4 pr-8 md:pr-12 relative max-w-[240px] md:max-w-sm transition-transform ${
          isDragging ? 'scale-105 rotate-2' : 'scale-100'
        }`}>
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="absolute top-0.5 right-0.5 md:top-2 md:right-2 w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label={t('floatingCartBadge.close')}
          >
            <X className="w-3 h-3 md:w-4 md:h-4" />
          </button>

          {/* Content */}
          <div
            className="flex items-center gap-1.5 md:gap-3 cursor-pointer"
            onClick={(e) => {
              // Only navigate if we're not dragging
              if (isClick && !isDragging && onGoToCart) {
                e.stopPropagation();
                onGoToCart();
              }
            }}
          >
            <div className="bg-white/20 rounded-full p-1 md:p-2">
              <ShoppingCart className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[10px] md:text-sm leading-tight md:leading-normal">
                {itemCount === 1
                  ? t('floatingCartBadge.itemAdded', { count: itemCount })
                  : t('floatingCartBadge.itemsAdded', { count: itemCount })
                }
              </p>
              <p className="text-[9px] md:text-xs underline mt-0 md:mt-1 block">
                {t('floatingCartBadge.cart')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
