import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import GrainOverlay from './GrainOverlay';

const CollectionSlide = ({ isActive }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();

    const handleClick = (e) => {
        e.preventDefault();
        navigate('/products');
    };

    const rmInitial = prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : undefined;
    const rmFadeInitial = prefersReducedMotion ? { opacity: 1, y: 0 } : undefined;

    return (
        <div className="relative w-full h-full">
            {/* Cream vignette — lightened so the persistent MarqueeBackdrop
                books stay readable through the wash, then a whisper of navy
                from the top-left to echo slide 2's navy gravity and keep the
                three slides feeling like one scene. */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(78% 88% at 50% 55%, rgba(249,243,228,0.22) 0%, rgba(249,243,228,0.58) 52%, rgba(241,230,204,0.76) 100%)',
                }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'linear-gradient(128deg, rgba(0,42,84,0.16) 0%, rgba(0,42,84,0.05) 26%, rgba(0,42,84,0) 48%)',
                }}
            />
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(38% 50% at 92% 14%, rgba(212,168,75,0.16) 0%, rgba(212,168,75,0) 65%)',
                    mixBlendMode: 'screen',
                }}
            />

            <GrainOverlay opacity={0.22} />

            {/* Centered frosted content panel */}
            <div className="relative h-full w-full flex items-center justify-center px-4 sm:px-6">
                <motion.a
                    href="/products"
                    onClick={handleClick}
                    initial={rmInitial ?? { opacity: 0, y: 18, scale: 0.98 }}
                    animate={
                        prefersReducedMotion
                            ? { opacity: 1, y: 0, scale: 1 }
                            : isActive
                            ? { opacity: 1, y: 0, scale: 1 }
                            : { opacity: 0, y: 18, scale: 0.98 }
                    }
                    transition={
                        prefersReducedMotion
                            ? { duration: 0 }
                            : { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
                    }
                    className="group relative max-w-2xl w-full text-center rounded-2xl sm:rounded-3xl px-5 sm:px-10 py-6 sm:py-8 no-underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a84b] focus-visible:ring-offset-2"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(255,253,247,0.92) 0%, rgba(253,249,238,0.85) 100%)',
                        backdropFilter: 'blur(14px)',
                        WebkitBackdropFilter: 'blur(14px)',
                        border: '1px solid rgba(0,65,122,0.12)',
                        boxShadow:
                            '0 40px 80px -30px rgba(0,65,122,0.25), 0 12px 30px -10px rgba(0,30,60,0.15)',
                    }}
                >
                    <motion.div
                        initial={rmFadeInitial ?? { opacity: 0, y: 8 }}
                        animate={
                            prefersReducedMotion
                                ? { opacity: 1, y: 0 }
                                : isActive
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: 8 }
                        }
                        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.15, duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 text-[#00417a]/70 text-[10px] sm:text-fluid-vsmall font-semibold mb-2"
                        style={{ letterSpacing: '0.18em', textTransform: 'uppercase' }}
                    >
                        <span className="h-px w-4 sm:w-6 bg-[#00417a]/40" />
                        {t('homePage.hero.collection.eyebrow')}
                        <span className="h-px w-4 sm:w-6 bg-[#00417a]/40" />
                    </motion.div>

                    <motion.h2
                        initial={rmFadeInitial ?? { opacity: 0, y: 10 }}
                        animate={
                            prefersReducedMotion
                                ? { opacity: 1, y: 0 }
                                : isActive
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: 10 }
                        }
                        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.22, duration: 0.6 }}
                        className="font-['Poppins'] font-bold text-[#00417a] leading-[1.06]"
                        style={{ fontSize: 'clamp(1.5rem, 5vw, 2.8rem)' }}
                    >
                        {t('homePage.hero.collection.title')}
                        <br className="sm:hidden" />
                        <span className="italic font-medium text-[#b58929]">
                            {' '}
                            {t('homePage.hero.collection.titleAccent')}
                        </span>
                    </motion.h2>

                    <motion.p
                        initial={rmFadeInitial ?? { opacity: 0, y: 8 }}
                        animate={
                            prefersReducedMotion
                                ? { opacity: 1, y: 0 }
                                : isActive
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: 8 }
                        }
                        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.32, duration: 0.55 }}
                        className="mt-2 text-[#00417a]/70 text-fluid-small max-w-md mx-auto"
                    >
                        {t('homePage.hero.collection.subtitle')}
                    </motion.p>

                    <motion.div
                        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0 }}
                        animate={
                            prefersReducedMotion
                                ? { opacity: 1 }
                                : isActive
                                ? { opacity: 1 }
                                : { opacity: 0 }
                        }
                        transition={prefersReducedMotion ? { duration: 0 } : { delay: 0.45, duration: 0.5 }}
                        className="mt-4 inline-flex items-center gap-1.5 text-[#00417a] text-fluid-small font-semibold"
                    >
                        {t('homePage.hero.collection.hint')}
                        <ArrowRight
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                            strokeWidth={2.5}
                        />
                    </motion.div>
                </motion.a>
            </div>
        </div>
    );
};

export default CollectionSlide;
