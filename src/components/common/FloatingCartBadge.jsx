import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, X, Trash2 } from 'lucide-react';

export default function FloatingCartBadge({
  isVisible,
  onDismiss,
  onGoToCart,
  itemCount = 1
}) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [showDeleteZone, setShowDeleteZone] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [isNearDelete, setIsNearDelete] = useState(false);
  const badgeRef = useRef(null);
  const deleteZoneRef = useRef(null);
  const scrollPositionRef = useRef(0);

  // Drag threshold in pixels - must move this much before considering it a drag
  const DRAG_THRESHOLD = 10;

  useEffect(() => {
    // Reset position when badge becomes visible
    if (isVisible) {
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
      setShowDeleteZone(false);
      setIsNearDelete(false);
    }
  }, [isVisible]);

  // Manage scroll behavior during drag - aggressive approach for mobile
  useEffect(() => {
    if (isDragging) {
      // Save current scroll position
      scrollPositionRef.current = window.pageYOffset || document.documentElement.scrollTop;

      // Prevent scrolling on mobile/touch devices
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollPositionRef.current}px`;
      document.body.style.width = '100%';

      // Prevent scroll on document level
      const preventScroll = (e) => {
        e.preventDefault();
      };

      // Add non-passive listeners to prevent default scroll behavior
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('wheel', preventScroll, { passive: false });

      return () => {
        // Restore scroll when dragging stops
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';

        // Remove event listeners
        document.removeEventListener('touchmove', preventScroll);
        document.removeEventListener('wheel', preventScroll);

        // Restore scroll position
        window.scrollTo(0, scrollPositionRef.current);
      };
    }
  }, [isDragging]);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
    setDragStartPos({
      x: touch.clientX,
      y: touch.clientY
    });
    // Stop propagation so our drag works while document scroll is prevented
    e.stopPropagation();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;

    // Calculate distance from start position
    const distanceMoved = Math.sqrt(
      Math.pow(touch.clientX - dragStartPos.x, 2) +
      Math.pow(touch.clientY - dragStartPos.y, 2)
    );

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
    setIsDragging(false);

    // If near delete zone and delete zone is shown, dismiss
    if (isNearDelete && showDeleteZone) {
      onDismiss();
    } else {
      // Snap back to original position
      setPosition({ x: 0, y: 0 });
    }

    setIsNearDelete(false);
    setShowDeleteZone(false);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    setDragStartPos({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Calculate distance from start position
    const distanceMoved = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.x, 2) +
      Math.pow(e.clientY - dragStartPos.y, 2)
    );

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
    setIsDragging(false);

    // If near delete zone and delete zone is shown, dismiss
    if (isNearDelete && showDeleteZone) {
      onDismiss();
    } else {
      // Snap back to original position
      setPosition({ x: 0, y: 0 });
    }

    setIsNearDelete(false);
    setShowDeleteZone(false);
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
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
          animation: !isDragging && position.x === 0 && position.y === 0 ? 'slideUp 0.3s ease-out' : 'none',
          opacity: isDragging && isNearDelete ? 0.5 : 1,
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
            onClick={onDismiss}
            className="absolute top-0.5 right-0.5 md:top-2 md:right-2 w-5 h-5 md:w-6 md:h-6 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors"
            aria-label={t('floatingCartBadge.close')}
          >
            <X className="w-3 h-3 md:w-4 md:h-4" />
          </button>

          {/* Content */}
          <div className="flex items-center gap-1.5 md:gap-3">
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
              <button
                onClick={onGoToCart}
                className="text-[9px] md:text-xs underline hover:no-underline mt-0 md:mt-1 block"
              >
                {t('floatingCartBadge.cart')}
              </button>
            </div>
          </div>

          {/* Drag hint (only visible when not dragging on desktop) */}
          {!isDragging && (
            <div className="hidden md:block absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-600 whitespace-nowrap opacity-70">
              {t('floatingCartBadge.dragToClose')}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
