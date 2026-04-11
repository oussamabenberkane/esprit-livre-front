import React, { useEffect, useRef } from 'react';
import { motion, useAnimation, useReducedMotion } from 'framer-motion';
import BookMarquee, {
    splitMarqueeRows,
    MARQUEE_CYCLE_A,
    MARQUEE_CYCLE_B,
} from './BookMarquee';

const EASE = [0.22, 1, 0.36, 1];
const REVEAL_DURATION = 1.2;

/**
 * Persistent book-cover backdrop behind slides 2 and 3.
 *
 * Reveal choreography (plays at most once per mount):
 *   1. A right-origin clip-path curtain opens the shell R→L.
 *   2. A gold wavefront highlight travels with the curtain's leading edge.
 *   3. A gold spotlight blooms in the upper right, then settles at low opacity.
 *   4. Both marquee rows slide in from the right on a stagger.
 *
 * On subsequent shows (e.g. user flips 0 → 1 after already seeing the reveal),
 * only the shell opacity animates. `prefers-reduced-motion` short-circuits to
 * a static composed state.
 *
 * The `currentSlide` prop drives a subtle depth shift between slide 2
 * (social-proof, camera pushed back) and slide 3 (collection, camera pulled
 * closer), so the same scene reads as two distinct moments.
 */
const MarqueeBackdrop = ({ covers = [], visible = true, currentSlide = 0 }) => {
    const prefersReducedMotion = useReducedMotion();
    const { rowA, rowB } = splitMarqueeRows(covers);
    const playedRef = useRef(false);

    const shellControls = useAnimation();
    const rowAControls = useAnimation();
    const rowBControls = useAnimation();
    const spotlightControls = useAnimation();
    const edgeControls = useAnimation();

    useEffect(() => {
        if (!rowA.length) return;

        if (!visible) {
            shellControls.start({
                opacity: 0,
                transition: { duration: 0.5, ease: EASE },
            });
            return;
        }

        if (prefersReducedMotion) {
            shellControls.set({ opacity: 1, clipPath: 'inset(0% 0% 0% 0%)' });
            rowAControls.set({ x: '0%', opacity: 1 });
            rowBControls.set({ x: '0%', opacity: 1 });
            spotlightControls.set({ opacity: 0.5, scale: 1 });
            edgeControls.set({ opacity: 0, x: '-100%' });
            playedRef.current = true;
            return;
        }

        if (playedRef.current) {
            shellControls.start({
                opacity: 1,
                transition: { duration: 0.5, ease: EASE },
            });
            return;
        }

        playedRef.current = true;

        shellControls.set({ opacity: 1, clipPath: 'inset(0% 0% 0% 100%)' });
        rowAControls.set({ x: '10%', opacity: 0 });
        rowBControls.set({ x: '16%', opacity: 0 });
        spotlightControls.set({ opacity: 0, scale: 0.82 });
        edgeControls.set({ x: '100%', opacity: 0 });

        shellControls.start({
            clipPath: 'inset(0% 0% 0% 0%)',
            transition: { duration: REVEAL_DURATION, ease: EASE },
        });

        edgeControls.start({
            opacity: [0, 0.95, 0.85, 0],
            x: ['100%', '45%', '-10%', '-55%'],
            transition: {
                duration: REVEAL_DURATION + 0.1,
                ease: EASE,
                times: [0, 0.2, 0.82, 1],
            },
        });

        spotlightControls.start({
            opacity: [0, 0.85, 0.5],
            scale: [0.82, 1.08, 1],
            transition: {
                duration: REVEAL_DURATION + 0.3,
                ease: EASE,
                times: [0, 0.55, 1],
            },
        });

        rowAControls.start({
            x: '0%',
            opacity: 1,
            transition: { duration: 1.1, ease: EASE, delay: 0.15 },
        });
        rowBControls.start({
            x: '0%',
            opacity: 1,
            transition: { duration: 1.2, ease: EASE, delay: 0.28 },
        });
    }, [
        visible,
        prefersReducedMotion,
        rowA.length,
        shellControls,
        rowAControls,
        rowBControls,
        spotlightControls,
        edgeControls,
    ]);

    if (!rowA.length) return null;

    const isCollectionMoment = currentSlide === 2;

    return (
        <motion.div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none overflow-hidden"
            initial={{ opacity: 0, clipPath: 'inset(0% 0% 0% 100%)' }}
            animate={shellControls}
            style={{ willChange: 'clip-path, opacity' }}
        >
            <motion.div
                className="absolute inset-0"
                animate={{
                    scale: isCollectionMoment ? 1.18 : 1.08,
                    y: isCollectionMoment ? '-1.5%' : '0%',
                }}
                transition={{
                    duration: prefersReducedMotion ? 0 : 0.9,
                    ease: EASE,
                }}
            >
                <div
                    className="absolute inset-0 overflow-hidden"
                    style={{
                        transform: 'rotate(-4deg)',
                        transformOrigin: 'center',
                    }}
                >
                    <motion.div
                        className="absolute left-0 right-0"
                        style={{ top: '8%', willChange: 'transform' }}
                        initial={{ x: '10%', opacity: 0 }}
                        animate={rowAControls}
                    >
                        <BookMarquee covers={rowA} cycleSec={MARQUEE_CYCLE_A} />
                    </motion.div>
                    <motion.div
                        className="absolute left-0 right-0"
                        style={{ top: '62%', willChange: 'transform' }}
                        initial={{ x: '16%', opacity: 0 }}
                        animate={rowBControls}
                    >
                        <BookMarquee covers={rowB} cycleSec={MARQUEE_CYCLE_B} reverse />
                    </motion.div>
                </div>
            </motion.div>

            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0, scale: 0.82 }}
                animate={spotlightControls}
                style={{
                    background:
                        'radial-gradient(55% 70% at 92% 18%, rgba(212,168,75,0.42) 0%, rgba(212,168,75,0.12) 45%, rgba(212,168,75,0) 70%)',
                    mixBlendMode: 'screen',
                    transformOrigin: '92% 18%',
                    willChange: 'opacity, transform',
                }}
            />

            <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ x: '100%', opacity: 0 }}
                animate={edgeControls}
                style={{
                    background:
                        'linear-gradient(270deg, rgba(212,168,75,0) 34%, rgba(212,168,75,0.32) 46%, rgba(255,240,200,0.85) 50%, rgba(212,168,75,0.32) 54%, rgba(212,168,75,0) 66%)',
                    mixBlendMode: 'screen',
                    willChange: 'transform, opacity',
                }}
            />
        </motion.div>
    );
};

export default MarqueeBackdrop;
