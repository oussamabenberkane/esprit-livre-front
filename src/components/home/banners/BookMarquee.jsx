import React from 'react';
import { useReducedMotion } from 'framer-motion';

/**
 * Split covers into two marquee rows. Both rows live inside the shared
 * MarqueeBackdrop layer, so this keeps the row contents predictable.
 */
export const splitMarqueeRows = (covers = []) => {
    const rowA = covers.slice(0, 8);
    const rowBRaw = covers.slice(8, 16);
    const rowB = rowBRaw.length >= 4 ? rowBRaw : [...rowA].reverse();
    return { rowA, rowB };
};

export const MARQUEE_CYCLE_A = 60;
export const MARQUEE_CYCLE_B = 75;

const BOOK_SHADOW =
    '0 18px 32px -14px rgba(0,30,70,0.35), inset 2px 0 0 rgba(255,255,255,0.05), inset -2px 0 0 rgba(0,0,0,0.2)';

/**
 * Horizontally-scrolling strip of book covers.
 *
 * The books render in place from t=0 (no slide-in intro). Under
 * `prefers-reduced-motion`, the row stays still.
 */
const BookMarquee = ({
    covers = [],
    cycleSec = MARQUEE_CYCLE_A,
    reverse = false,
    gapClass = 'gap-3 sm:gap-4',
    widthStyle = 'clamp(70px, 8vw, 110px)',
    heightStyle = 'clamp(105px, 12vw, 165px)',
    className = '',
}) => {
    const prefersReducedMotion = useReducedMotion();
    if (!covers.length) return null;

    const doubled = [...covers, ...covers];
    const loopName = reverse ? 'heroMarqueeReverse' : 'heroMarquee';
    const animation = prefersReducedMotion
        ? 'none'
        : `${loopName} ${cycleSec}s linear infinite`;

    return (
        <div className={`flex ${gapClass} ${className}`} aria-hidden="true">
            <div
                className={`flex ${gapClass} shrink-0`}
                style={{
                    width: 'max-content',
                    animation,
                    willChange: 'transform',
                }}
            >
                {doubled.map((src, i) => (
                    <div
                        key={i}
                        className="shrink-0 rounded-[3px] overflow-hidden bg-[#1a1a1a]"
                        style={{
                            width: widthStyle,
                            height: heightStyle,
                            boxShadow: BOOK_SHADOW,
                        }}
                    >
                        {src && (
                            <img
                                src={src}
                                alt=""
                                className="w-full h-full object-cover"
                                loading="lazy"
                                draggable={false}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BookMarquee;
