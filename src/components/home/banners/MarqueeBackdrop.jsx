import React from 'react';
import BookMarquee, {
    splitMarqueeRows,
    MARQUEE_CYCLE_A,
    MARQUEE_CYCLE_B,
} from './BookMarquee';

/**
 * Persistent tilted dual-row marquee rendered behind the social-proof and
 * collection slides. It lives outside the slide transition so the book
 * strip keeps flowing continuously while only the content panels crossfade.
 */
const MarqueeBackdrop = ({ covers = [], visible = true }) => {
    const { rowA, rowB } = splitMarqueeRows(covers);
    if (!rowA.length) return null;

    return (
        <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out"
            style={{ opacity: visible ? 1 : 0 }}
        >
            <div
                className="absolute inset-0 overflow-hidden"
                style={{
                    transform: 'rotate(-4deg) scale(1.1)',
                    transformOrigin: 'center',
                }}
            >
                <div className="absolute left-0 right-0" style={{ top: '8%' }}>
                    <BookMarquee covers={rowA} cycleSec={MARQUEE_CYCLE_A} intro />
                </div>
                <div className="absolute left-0 right-0" style={{ top: '62%' }}>
                    <BookMarquee covers={rowB} cycleSec={MARQUEE_CYCLE_B} reverse />
                </div>
            </div>
        </div>
    );
};

export default MarqueeBackdrop;
