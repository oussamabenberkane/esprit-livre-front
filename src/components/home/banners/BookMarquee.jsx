import React, { useState } from 'react';

/**
 * Split covers into two marquee rows. Both hero slides use this so the
 * rows they render are byte-identical and stay visually synced.
 */
export const splitMarqueeRows = (covers = []) => {
    const rowA = covers.slice(0, 8);
    const rowBRaw = covers.slice(8, 16);
    const rowB = rowBRaw.length >= 4 ? rowBRaw : [...rowA].reverse();
    return { rowA, rowB };
};

// Shared cycle durations so slide 2 and slide 3 animate at identical speeds.
export const MARQUEE_CYCLE_A = 60;
export const MARQUEE_CYCLE_B = 75;

const BOOK_SHADOW =
    '0 18px 32px -14px rgba(0,30,70,0.35), inset 2px 0 0 rgba(255,255,255,0.05), inset -2px 0 0 rgba(0,0,0,0.2)';

/**
 * Horizontally-scrolling strip of book covers.
 *
 * Uses a CSS `@keyframes` animation with a negative `animation-delay` derived
 * from `performance.now()` so that every instance — no matter when it mounts
 * — lands on the same visual position dictated by wall-clock time. Two
 * instances rendered in sibling slides will therefore stay synchronized even
 * when one of them was just mounted via AnimatePresence.
 */
const BookMarquee = ({
    covers = [],
    cycleSec = 60,
    reverse = false,
    gapClass = 'gap-3 sm:gap-4',
    widthStyle = 'clamp(70px, 8vw, 110px)',
    heightStyle = 'clamp(105px, 12vw, 165px)',
    className = '',
}) => {
    // Negative delay = how many seconds into the cycle we already are.
    // Computed once per mount from wall time so all instances converge.
    const [delay] = useState(() => {
        if (typeof window === 'undefined') return 0;
        return -((performance.now() / 1000) % cycleSec);
    });

    if (!covers.length) return null;

    const doubled = [...covers, ...covers];

    return (
        <div className={`flex ${gapClass} ${className}`} aria-hidden="true">
            <div
                className={`flex ${gapClass} shrink-0`}
                style={{
                    width: 'max-content',
                    animation: `${reverse ? 'heroMarqueeReverse' : 'heroMarquee'} ${cycleSec}s linear infinite`,
                    animationDelay: `${delay}s`,
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
