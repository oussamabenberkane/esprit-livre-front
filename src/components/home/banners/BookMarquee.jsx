import React from 'react';

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
 * When `intro` is true the row starts off-screen to the right
 * (`translateX(100vw)`) and slides in progressively before entering the
 * infinite loop. The intro duration equals `cycleSec` so the intro speed
 * matches the loop speed — the handoff into the infinite loop is seamless.
 */
const BookMarquee = ({
    covers = [],
    cycleSec = MARQUEE_CYCLE_A,
    reverse = false,
    intro = false,
    gapClass = 'gap-3 sm:gap-4',
    widthStyle = 'clamp(70px, 8vw, 110px)',
    heightStyle = 'clamp(105px, 12vw, 165px)',
    className = '',
}) => {
    if (!covers.length) return null;

    const doubled = [...covers, ...covers];
    const loopName = reverse ? 'heroMarqueeReverse' : 'heroMarquee';
    const animation = intro
        ? `heroMarqueeIntro ${cycleSec}s linear forwards, ${loopName} ${cycleSec}s ${cycleSec}s linear infinite`
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
