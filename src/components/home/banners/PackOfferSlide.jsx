import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Gift, Sparkles } from 'lucide-react';
import GrainOverlay from './GrainOverlay';

const formatDA = (n) => new Intl.NumberFormat('fr-FR').format(Math.round(n || 0));
const VISIBLE_CAP = 4;

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false
    );
    useEffect(() => {
        const mql = window.matchMedia('(max-width: 639px)');
        const handler = (e) => setIsMobile(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);
    return isMobile;
};

const getFanTransforms = (count, isMobile) => {
    const s = isMobile ? 0.62 : 1;
    const configs = {
        1: [{ rotate: 0, x: 0, y: 0, z: 5 }],
        2: [
            { rotate: -9, x: -32 * s, y: 4, z: 2 },
            { rotate: 9, x: 32 * s, y: 4, z: 2 },
        ],
        3: [
            { rotate: -11, x: -52 * s, y: 10, z: 1 },
            { rotate: 0, x: 0, y: 0, z: 5 },
            { rotate: 11, x: 52 * s, y: 10, z: 1 },
        ],
        4: [
            { rotate: -13, x: -74 * s, y: 12, z: 1 },
            { rotate: -5, x: -26 * s, y: 2, z: 3 },
            { rotate: 5, x: 26 * s, y: 2, z: 3 },
            { rotate: 13, x: 74 * s, y: 12, z: 1 },
        ],
        5: [
            { rotate: -14, x: -90 * s, y: 14, z: 1 },
            { rotate: -7, x: -46 * s, y: 6, z: 2 },
            { rotate: 0, x: 0, y: 0, z: 5 },
            { rotate: 7, x: 46 * s, y: 6, z: 2 },
            { rotate: 14, x: 90 * s, y: 14, z: 1 },
        ],
    };
    return configs[Math.min(Math.max(count, 1), 5)];
};

const OverflowTile = ({ overflowCount, hiddenTitles }) => {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);

    const showTooltip = () => setOpen(true);
    const hideTooltip = () => setOpen(false);

    return (
        <div
            className="relative h-full w-full"
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
            onFocus={showTooltip}
            onBlur={hideTooltip}
        >
            <button
                type="button"
                tabIndex={0}
                aria-label={t('homePage.hero.packOffer.moreBooksTooltip')}
                className="absolute inset-0 rounded-[3px] flex flex-col items-center justify-center gap-0.5 bg-gradient-to-br from-[#00417a] to-[#002a52] ring-1 ring-[#d4a84b]/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a84b] focus-visible:ring-offset-1"
                style={{
                    boxShadow:
                        '0 20px 40px -12px rgba(0,20,60,0.45), 0 6px 14px -6px rgba(0,0,0,0.3), inset 0 0 0 1px rgba(212,168,75,0.25)',
                }}
            >
                <span
                    className="text-[#d4a84b] font-bold tabular-nums leading-none"
                    style={{ fontSize: 'clamp(1rem, 2vw, 1.6rem)' }}
                >
                    +{overflowCount}
                </span>
                <span
                    className="text-[#f7f1e6]/70 font-semibold uppercase text-[7px] sm:text-[8px]"
                    style={{ letterSpacing: '0.12em' }}
                >
                    {t('homePage.hero.packOffer.moreBooksTooltip')}
                </span>
            </button>
            {hiddenTitles.length > 0 && (
                <motion.div
                    role="tooltip"
                    initial={false}
                    animate={open ? { opacity: 1, y: 0, pointerEvents: 'auto' } : { opacity: 0, y: 6, pointerEvents: 'none' }}
                    transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] z-30 w-max max-w-[220px]"
                >
                    <div className="rounded-lg bg-[#00417a] text-[#f7f1e6] shadow-[0_20px_40px_-14px_rgba(0,20,60,0.55)] ring-1 ring-[#d4a84b]/40">
                        <div className="px-3 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-[#d4a84b]">
                            {t('homePage.hero.packOffer.moreBooksTooltip')}
                        </div>
                        <ul className="px-3 pb-2 space-y-0.5 text-[11px] leading-snug">
                            {hiddenTitles.map((title, i) => (
                                <li key={i} className="truncate">
                                    · {title}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div
                        className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0"
                        style={{
                            borderLeft: '6px solid transparent',
                            borderRight: '6px solid transparent',
                            borderTop: '6px solid #00417a',
                        }}
                    />
                </motion.div>
            )}
        </div>
    );
};

const FannedBooks = ({ books = [] }) => {
    const isMobile = useIsMobile();
    const prefersReducedMotion = useReducedMotion();
    if (!books.length) return null;

    const overflowCount = Math.max(0, books.length - VISIBLE_CAP);
    const hasOverflow = overflowCount > 0;
    const visibleBooks = books.slice(0, VISIBLE_CAP);
    const slotCount = hasOverflow ? VISIBLE_CAP + 1 : visibleBooks.length;
    const transforms = getFanTransforms(slotCount, isMobile);
    const badgeIndex = Math.floor(visibleBooks.length / 2);
    const hiddenTitles = hasOverflow
        ? books.slice(VISIBLE_CAP).map((b) => b?.title).filter(Boolean)
        : [];

    const slots = [];
    for (let i = 0; i < slotCount; i++) {
        slots.push(i);
    }

    return (
        <div className="relative h-full w-full flex items-center justify-center">
            {slots.map((i) => {
                const tr = transforms[i];
                const isOverflowSlot = hasOverflow && i === slotCount - 1;
                const book = isOverflowSlot ? null : visibleBooks[i];
                const initial = prefersReducedMotion
                    ? { opacity: 1, y: tr.y, x: tr.x, rotate: tr.rotate }
                    : { opacity: 0, y: 24, rotate: 0, x: 0 };
                const animate = { opacity: 1, y: tr.y, x: tr.x, rotate: tr.rotate };
                const transition = prefersReducedMotion
                    ? { duration: 0 }
                    : { delay: 0.25 + i * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] };

                return (
                    <motion.div
                        key={i}
                        initial={initial}
                        animate={animate}
                        transition={transition}
                        whileHover={
                            prefersReducedMotion
                                ? undefined
                                : { y: tr.y - 8, transition: { duration: 0.25 } }
                        }
                        className="absolute"
                        style={{ zIndex: tr.z }}
                    >
                        <div
                            className="relative rounded-[3px] overflow-hidden bg-[#1a1a1a] ring-1 ring-black/10"
                            style={{
                                width: 'clamp(58px, 9vw, 128px)',
                                height: 'clamp(88px, 13.5vw, 192px)',
                                boxShadow:
                                    '0 20px 40px -12px rgba(0,20,60,0.45), 0 6px 14px -6px rgba(0,0,0,0.3), inset 2px 0 0 rgba(255,255,255,0.08), inset -2px 0 0 rgba(0,0,0,0.2)',
                            }}
                        >
                            {isOverflowSlot ? (
                                <OverflowTile
                                    overflowCount={overflowCount}
                                    hiddenTitles={hiddenTitles}
                                />
                            ) : (
                                <img
                                    src={book?.coverImage}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    draggable={false}
                                />
                            )}
                        </div>
                        {i === badgeIndex && !isOverflowSlot && (
                            <motion.div
                                initial={
                                    prefersReducedMotion
                                        ? { opacity: 1, scale: 1, rotate: 0 }
                                        : { opacity: 0, scale: 0.6, rotate: 10 }
                                }
                                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                                transition={
                                    prefersReducedMotion
                                        ? { duration: 0 }
                                        : { delay: 0.9, duration: 0.5, ease: 'backOut' }
                                }
                                className="absolute -top-3 -right-3 flex items-center gap-1 rounded-full bg-[#d4a84b] text-[#2a1c00] text-[10px] sm:text-xs font-bold px-2 py-1 shadow-lg"
                                style={{ letterSpacing: '0.02em' }}
                            >
                                <Gift className="w-3 h-3" strokeWidth={2.5} />
                                <span>+1</span>
                            </motion.div>
                        )}
                    </motion.div>
                );
            })}
        </div>
    );
};

const PackOfferSlide = ({ pack, isActive }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();

    const originalPrice = pack?.originalPrice || 0;
    const packPrice = pack?.packPrice || 0;
    const savings = Math.max(0, originalPrice - packPrice);
    const discountPercent = pack?.discountPercent || 0;
    const books = (pack?.books || []).filter((b) => b && b.coverImage);
    const hasCovers = books.length > 0;

    const fadeUp = {
        hidden: { opacity: 0, y: 18 },
        show: (i = 0) => ({
            opacity: 1,
            y: 0,
            transition: { delay: 0.1 + i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        }),
    };

    const animateState = prefersReducedMotion ? 'show' : isActive ? 'show' : 'hidden';

    return (
        <div className="relative w-full h-full">
            {/* Layered background: cream base + navy radial wash (bottom
                right) + gold bloom in the upper right. The upper-right gold
                bloom is the shared light source across all three hero slides,
                so the carousel reads as one scene. */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'radial-gradient(42% 55% at 88% 18%, rgba(212,168,75,0.22) 0%, rgba(212,168,75,0.06) 48%, rgba(212,168,75,0) 72%), radial-gradient(120% 80% at 85% 110%, rgba(0,65,122,0.18) 0%, rgba(0,65,122,0) 55%), linear-gradient(135deg, #f9f3e4 0%, #f3ead4 100%)',
                }}
            />
            <GrainOverlay opacity={0.25} />

            {/* Decorative hairline frame */}
            <div className="absolute inset-3 sm:inset-5 md:inset-7 rounded-[22px] border border-[#00417a]/10 pointer-events-none" />

            {/* Decorative giant serif O */}
            <div
                aria-hidden="true"
                className="absolute select-none pointer-events-none font-serif italic text-[#00417a]/[0.06]"
                style={{
                    fontSize: 'clamp(280px, 42vw, 540px)',
                    lineHeight: 1,
                    left: '-6%',
                    top: '-18%',
                    fontWeight: 400,
                }}
            >
                é
            </div>

            <div className="relative h-full w-full flex items-center">
                <div className="container-main w-full px-5 sm:px-8 md:px-fluid-lg">
                    <div
                        className={`flex flex-col ${
                            hasCovers ? 'md:grid md:grid-cols-12 md:items-center md:gap-4' : ''
                        }`}
                    >
                        {/* Copy */}
                        <motion.div
                            className={`${
                                hasCovers
                                    ? 'md:col-span-7 lg:col-span-7 text-center md:text-left order-2 md:order-1 mt-4 md:mt-0'
                                    : 'text-center max-w-2xl mx-auto'
                            }`}
                            initial="hidden"
                            animate={animateState}
                            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                        >
                            <motion.div
                                variants={fadeUp}
                                custom={0}
                                className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2 sm:mb-3"
                            >
                                <span
                                    className="inline-flex items-center gap-1.5 rounded-full bg-[#00417a]/10 text-[#00417a] text-[10px] sm:text-fluid-vsmall font-semibold px-2.5 py-1"
                                    style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
                                >
                                    <Sparkles className="w-3 h-3" strokeWidth={2.5} />
                                    {t('homePage.hero.packOffer.eyebrow')}
                                </span>
                                {discountPercent > 0 && (
                                    <span
                                        className="inline-flex items-center rounded-full bg-[#d4a84b] text-[#2a1c00] text-[10px] sm:text-fluid-vsmall font-bold px-2.5 py-1 shadow-[0_6px_14px_-6px_rgba(212,168,75,0.6)]"
                                        style={{ letterSpacing: '0.04em' }}
                                    >
                                        −{discountPercent}%
                                    </span>
                                )}
                            </motion.div>

                            <motion.h2
                                variants={fadeUp}
                                custom={1}
                                className="font-['Poppins'] font-bold text-[#00417a] leading-[1.08]"
                                style={{ fontSize: 'clamp(1.4rem, 5vw, 2.6rem)' }}
                            >
                                {t('homePage.hero.packOffer.title')}
                                <br className="sm:hidden" />
                                <span className="italic font-medium text-[#b58929]">
                                    {' '}
                                    {t('homePage.hero.packOffer.titleAccent')}
                                </span>
                            </motion.h2>

                            <motion.p
                                variants={fadeUp}
                                custom={2}
                                className="mt-2 text-[#00417a]/75 text-fluid-small max-w-md mx-auto md:mx-0"
                            >
                                {t('homePage.hero.packOffer.subtitle')}
                            </motion.p>

                            {pack && (
                                <motion.div
                                    variants={fadeUp}
                                    custom={3}
                                    className="mt-3 flex flex-wrap justify-center md:justify-start items-baseline gap-x-3 gap-y-1"
                                >
                                    <span
                                        className="font-bold text-[#00417a]"
                                        style={{
                                            fontSize: 'clamp(1.1rem, 2.2vw, 1.5rem)',
                                            letterSpacing: '-0.01em',
                                        }}
                                    >
                                        {formatDA(packPrice)} DA
                                    </span>
                                    {originalPrice > packPrice && (
                                        <>
                                            <span className="text-[#00417a]/55 text-fluid-small line-through">
                                                {formatDA(originalPrice)} DA
                                            </span>
                                            <span className="inline-flex items-center gap-1 rounded-full bg-[#d4a84b]/22 text-[#7a5a0f] text-[10px] sm:text-fluid-vsmall font-bold px-2 py-0.5">
                                                {t('homePage.hero.packOffer.savings', {
                                                    amount: formatDA(savings),
                                                })}
                                            </span>
                                        </>
                                    )}
                                </motion.div>
                            )}

                            <motion.div
                                variants={fadeUp}
                                custom={4}
                                className="mt-4 sm:mt-5 flex justify-center md:justify-start"
                            >
                                <button
                                    type="button"
                                    onClick={() => navigate('/products?tab=packs')}
                                    className="group inline-flex items-center gap-2 rounded-full bg-[#00417a] text-white font-semibold text-fluid-small px-5 py-2.5 sm:px-6 sm:py-3 shadow-[0_10px_24px_-8px_rgba(0,65,122,0.55)] hover:bg-[#003463] transition-all hover:shadow-[0_14px_30px_-10px_rgba(0,65,122,0.65)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a84b] focus-visible:ring-offset-2 min-h-[44px]"
                                >
                                    {t('homePage.hero.packOffer.cta')}
                                    <ArrowRight
                                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                        strokeWidth={2.5}
                                    />
                                </button>
                            </motion.div>
                        </motion.div>

                        {/* Fanned books — on top of the stack on mobile; hidden entirely when no covers */}
                        {hasCovers && (
                            <div className="md:col-span-5 lg:col-span-5 relative h-[130px] xs:h-[150px] sm:h-[190px] md:h-[260px] lg:h-[300px] order-1 md:order-2">
                                <FannedBooks books={books} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PackOfferSlide;
