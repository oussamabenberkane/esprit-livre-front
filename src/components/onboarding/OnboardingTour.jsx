import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useOnboarding } from '../../contexts/OnboardingContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const SPOTLIGHT_PAD = 10;  // px padding around highlighted element
const TOOLTIP_W     = 300; // tooltip card width in px
const TOOLTIP_H_EST = 250; // conservative height estimate for placement math
const TOOLTIP_GAP   = 12;  // gap between spotlight edge and tooltip
const NAVBAR_H      = 92;  // clearance for fixed top navbar

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns the first element matching selector that has non-zero dimensions. */
function getVisibleEl(selector) {
  if (!selector) return null;
  for (const el of document.querySelectorAll(selector)) {
    const { width, height } = el.getBoundingClientRect();
    if (width > 0 && height > 0) return el;
  }
  return null;
}

/**
 * Smooth-scrolls so the element is visible below the fixed navbar.
 * Returns a promise that resolves after the scroll animation finishes.
 */
function scrollToEl(el) {
  const rect = el.getBoundingClientRect();
  const already =
    rect.top >= NAVBAR_H && rect.bottom <= window.innerHeight - 20;
  if (already) return Promise.resolve();

  window.scrollTo({
    top: window.scrollY + rect.top - NAVBAR_H - 20,
    behavior: 'smooth',
  });
  return new Promise((r) => setTimeout(r, 520));
}

/**
 * Computes fixed-position style for the tooltip card.
 * - Auto-flips when there is not enough space above/below.
 * - Falls back to centered modal for elements taller than 55 % of the viewport
 *   (e.g. the full books grid) so the tooltip is always reachable.
 * - Hard-clamps top/left to keep every pixel of the card on-screen.
 */
function tooltipStyle(spotRect, placement, vw, vh) {
  const TW = Math.min(TOOLTIP_W, vw - 32);

  // No spotlight / explicit center
  if (!spotRect || placement === 'center') {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: TW,
    };
  }

  // Very tall element — always center so the card remains accessible
  if (spotRect.height > vh * 0.55) {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: TW,
    };
  }

  const clampX = (x) => Math.max(16, Math.min(x, vw - TW - 16));
  const clampY = (y) => Math.max(NAVBAR_H, Math.min(y, vh - TOOLTIP_H_EST - 16));
  const midX   = clampX(spotRect.left + spotRect.width / 2 - TW / 2);

  let top, left;

  if (placement === 'bottom') {
    top  = spotRect.bottom + TOOLTIP_GAP;
    left = midX;
    if (top + TOOLTIP_H_EST > vh - 16) {
      // Try above
      const topAbove = spotRect.top - TOOLTIP_H_EST - TOOLTIP_GAP;
      top = topAbove >= NAVBAR_H ? topAbove : clampY(top);
    }
  } else if (placement === 'top') {
    top  = spotRect.top - TOOLTIP_H_EST - TOOLTIP_GAP;
    left = midX;
    if (top < NAVBAR_H) {
      // Try below
      const topBelow = spotRect.bottom + TOOLTIP_GAP;
      top = topBelow + TOOLTIP_H_EST <= vh - 16 ? topBelow : clampY(topBelow);
    }
  } else if (placement === 'right') {
    top  = spotRect.top + spotRect.height / 2 - TOOLTIP_H_EST / 2;
    left = spotRect.right + TOOLTIP_GAP;
    if (left + TW > vw - 16) left = spotRect.left - TW - TOOLTIP_GAP;
    if (left < 16)           left = clampX(spotRect.left);
  } else {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: TW,
    };
  }

  // Hard clamp — guarantee the card never escapes the viewport
  top  = clampY(top);
  left = clampX(left);

  return { position: 'fixed', top, left, width: TW };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingTour() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    isTourActive,
    isTransitioningToProfile,
    steps,
    currentStep,
    nextStep,
    prevStep,
    skipTour,
  } = useOnboarding();

  const [spotRect,  setSpotRect]  = useState(null);
  const [ttStyle,   setTtStyle]   = useState({
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: Math.min(TOOLTIP_W, window.innerWidth - 32),
  });
  const [vp,        setVp]        = useState({ w: window.innerWidth, h: window.innerHeight });
  const updateTimerRef = useRef(null);

  const step = steps[currentStep];

  // ── Navigate to profile tour when home tour finishes / is skipped ───────────
  useEffect(() => {
    if (isTransitioningToProfile) navigate('/profile?tour=true');
  }, [isTransitioningToProfile, navigate]);

  // ── Position update ──────────────────────────────────────────────────────────
  const updatePosition = useCallback(() => {
    if (!isTourActive || !step) return;

    const TW = Math.min(TOOLTIP_W, window.innerWidth - 32);
    const center = {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: TW,
    };

    if (!step.selector) {
      setSpotRect(null);
      setTtStyle(center);
      return;
    }

    const el = getVisibleEl(step.selector);
    if (!el) {
      setSpotRect(null);
      setTtStyle(center);
      return;
    }

    const r  = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    setSpotRect({
      left:   r.left   - SPOTLIGHT_PAD,
      top:    r.top    - SPOTLIGHT_PAD,
      width:  r.width  + SPOTLIGHT_PAD * 2,
      height: r.height + SPOTLIGHT_PAD * 2,
    });
    setTtStyle(tooltipStyle(r, step.placement || 'bottom', vw, vh));
    setVp({ w: vw, h: vh });
  }, [isTourActive, step]);

  // ── Run position update on step change, with optional scroll ────────────────
  useEffect(() => {
    if (!isTourActive || !step) return;

    clearTimeout(updateTimerRef.current);

    const run = async () => {
      if (step.scrollIntoView && step.selector) {
        const el = getVisibleEl(step.selector);
        if (el) await scrollToEl(el);
      }
      updatePosition();
    };

    run();

    const onResize = () => {
      clearTimeout(updateTimerRef.current);
      updateTimerRef.current = setTimeout(updatePosition, 80);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(updateTimerRef.current);
    };
  }, [currentStep, isTourActive, step, updatePosition]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const totalSteps = steps.length;
  const isFirst    = currentStep === 0;
  const isLast     = currentStep === totalSteps - 1;
  const TW         = Math.min(TOOLTIP_W, vp.w - 32);

  // Clamp left at render time — guards against stale ttStyle from the previous
  // step leaking in while AnimatePresence waits for the exit animation.
  const safeLeft =
    typeof ttStyle.left === 'number'
      ? Math.max(16, Math.min(ttStyle.left, vp.w - TW - 16))
      : ttStyle.left;

  if (!isTourActive || !step) return null;

  return (
    <>
      {/* ── SVG overlay with spotlight cut-out ─────────────────────────────── */}
      <svg
        style={{
          position: 'fixed',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 9900,
          pointerEvents: 'all',
          overflow: 'visible',
        }}
      >
        <defs>
          <mask id="ol-spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotRect && (
              <motion.rect
                rx="10"
                fill="black"
                animate={{ x: spotRect.left, y: spotRect.top, width: spotRect.width, height: spotRect.height }}
                initial={{ x: spotRect.left, y: spotRect.top, width: spotRect.width, height: spotRect.height }}
                transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
              />
            )}
          </mask>
        </defs>

        {/* Lightened overlay — easier on the eyes, tooltip pops more */}
        <rect
          width="100%"
          height="100%"
          fill="rgba(2, 10, 36, 0.50)"
          mask="url(#ol-spotlight-mask)"
        />

        {/* Highlight ring around the spotlight */}
        {spotRect && (
          <motion.rect
            rx="12"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="1.5"
            style={{ pointerEvents: 'none' }}
            animate={{ x: spotRect.left - 2, y: spotRect.top - 2, width: spotRect.width + 4, height: spotRect.height + 4 }}
            initial={{ x: spotRect.left - 2, y: spotRect.top - 2, width: spotRect.width + 4, height: spotRect.height + 4 }}
            transition={{ duration: 0.38, ease: [0.4, 0, 0.2, 1] }}
          />
        )}
      </svg>

      {/* ── Tooltip card ────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          style={{ ...ttStyle, left: safeLeft, zIndex: 9901, pointerEvents: 'all', maxWidth: 'calc(100vw - 32px)' }}
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
        >
          <div
            style={{
              background: 'rgba(37, 90, 195, 0.95)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 14,
              backdropFilter: 'blur(24px)',
              overflow: 'hidden',
              width: TW,
              maxWidth: 'calc(100vw - 32px)',
              boxSizing: 'border-box',
            }}
          >
            {/* Progress bar row */}
            <div style={{ padding: '14px 16px 0 16px' }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 12, alignItems: 'center' }}>
                {steps.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      background: i <= currentStep ? '#16A34A' : 'rgba(255,255,255,0.12)',
                      transition: 'background 0.3s',
                    }}
                  />
                ))}
                {/* Skip × */}
                <button
                  onClick={skipTour}
                  aria-label={t('onboarding.tour.skipTour')}
                  style={{
                    marginLeft: 8,
                    color: 'rgba(255,255,255,0.35)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 3,
                    lineHeight: 0,
                    flexShrink: 0,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                >
                  <X size={14} />
                </button>
              </div>

              {/* Title */}
              <p
                style={{
                  color: 'white',
                  fontSize: 15,
                  fontWeight: 700,
                  lineHeight: 1.3,
                  margin: 0,
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                {t(step.titleKey)}
              </p>
            </div>

            {/* Description */}
            <div style={{ padding: '8px 16px 14px 16px' }}>
              <p
                style={{
                  color: 'rgba(255,255,255,0.62)',
                  fontSize: 13,
                  lineHeight: 1.7,
                  margin: 0,
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                }}
              >
                {t(step.descKey)}
              </p>
            </div>

            {/* Footer nav */}
            <div
              style={{
                padding: '10px 16px',
                borderTop: '1px solid rgba(255,255,255,0.07)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: 'rgba(255,255,255,0.28)',
                  fontFamily: 'Poppins, sans-serif',
                  letterSpacing: '0.04em',
                }}
              >
                {currentStep + 1} / {totalSteps}
              </span>

              <div style={{ display: 'flex', gap: 7 }}>
                {!isFirst && (
                  <button
                    onClick={prevStep}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      fontSize: 12,
                      fontWeight: 500,
                      padding: '7px 11px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.08)',
                      color: 'rgba(255,255,255,0.55)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer',
                      fontFamily: 'Poppins, sans-serif',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.13)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
                  >
                    <ChevronLeft size={12} />
                    {t('onboarding.tour.back')}
                  </button>
                )}

                <button
                  onClick={nextStep}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '7px 14px',
                    borderRadius: 8,
                    background: '#16A34A',
                    color: 'white',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'Poppins, sans-serif',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#15803D')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#16A34A')}
                >
                  {isLast ? t('onboarding.tour.finish') : t('onboarding.tour.next')}
                  {!isLast && <ChevronRight size={12} />}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
