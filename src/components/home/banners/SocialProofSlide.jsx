import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Truck, Users, ArrowUpRight } from 'lucide-react';
import GrainOverlay from './GrainOverlay';

const useCountUp = (target, { duration = 1400, active = true, instant = false } = {}) => {
    const [value, setValue] = useState(instant && active ? target : 0);

    useEffect(() => {
        if (!active) {
            setValue(0);
            return;
        }
        if (instant) {
            setValue(target);
            return;
        }
        let raf;
        const start = performance.now();
        const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setValue(Math.round(target * eased));
            if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [target, duration, active, instant]);

    return value;
};

const formatNum = (n) => new Intl.NumberFormat('fr-FR').format(n);

const Stat = ({ icon: Icon, target, label, suffix = '', active, delay = 0, instant = false }) => {
    const value = useCountUp(target, { active, instant });
    return (
        <motion.div
            initial={instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            animate={active ? { opacity: 1, y: 0 } : instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={instant ? { duration: 0 } : { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
        >
            <div
                className="font-['Poppins'] font-bold text-[#00417a] tabular-nums leading-none"
                style={{
                    fontSize: 'clamp(1.5rem, 4.5vw, 2.4rem)',
                    letterSpacing: '-0.02em',
                }}
            >
                {formatNum(value)}
                {suffix && <span className="text-[#b58929]">{suffix}</span>}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-[#b58929]" strokeWidth={2.25} />
                <span
                    className="text-[10px] sm:text-[11px] font-semibold uppercase truncate text-[#00417a]/70"
                    style={{ letterSpacing: '0.12em' }}
                >
                    {label}
                </span>
            </div>
        </motion.div>
    );
};

const SocialProofSlide = ({ isActive }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const prefersReducedMotion = useReducedMotion();
    const rmInitial = prefersReducedMotion ? { opacity: 1, y: 0 } : undefined;
    const rmAnimate = (base) =>
        prefersReducedMotion ? { opacity: 1, y: 0 } : isActive ? base : { opacity: 0, y: 14 };
    const rmTransition = (t) => (prefersReducedMotion ? { duration: 0 } : t);

    return (
        <div className="relative w-full h-full">
            {/* Warm cream base matching slides 1 & 3 */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(135deg, #f9f3e4 0%, #f3ead4 100%)',
                }}
            />

            {/* Subtle navy vignette from the left for depth */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(58% 70% at 18% 55%, rgba(0,65,122,0.08) 0%, rgba(0,65,122,0) 70%)',
                }}
            />

            {/* Gold bloom — upper right, shared light source across all slides */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(42% 55% at 88% 18%, rgba(212,168,75,0.22) 0%, rgba(212,168,75,0.06) 48%, rgba(212,168,75,0) 72%)',
                }}
            />

            {/* Navy radial wash — bottom right, subtle */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(120% 80% at 85% 110%, rgba(0,65,122,0.12) 0%, rgba(0,65,122,0) 55%)',
                }}
            />

            <GrainOverlay opacity={0.25} />

            {/* Decorative hairline frame */}
            <div className="absolute inset-3 sm:inset-5 md:inset-7 rounded-[22px] border border-[#00417a]/10 pointer-events-none" />

            <div className="relative h-full w-full flex items-center">
                <div className="container-main w-full px-5 sm:px-8 md:px-fluid-lg">
                    <div className="max-w-3xl text-center md:text-left">
                        <motion.div
                            initial={rmInitial ?? { opacity: 0, y: 12 }}
                            animate={rmAnimate({ opacity: 1, y: 0 })}
                            transition={rmTransition({ delay: 0.1, duration: 0.55 })}
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#00417a]/10 text-[#00417a] text-[10px] sm:text-fluid-vsmall font-semibold px-2.5 py-1 mb-2 sm:mb-3"
                            style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
                        >
                            <span className="relative flex h-1.5 w-1.5">
                                {!prefersReducedMotion && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#b58929] opacity-60" />
                                )}
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#b58929]" />
                            </span>
                            {t('homePage.hero.socialProof.eyebrow')}
                        </motion.div>

                        <motion.h2
                            initial={rmInitial ?? { opacity: 0, y: 14 }}
                            animate={rmAnimate({ opacity: 1, y: 0 })}
                            transition={rmTransition({ delay: 0.18, duration: 0.6 })}
                            className="font-['Poppins'] font-bold text-[#00417a] leading-[1.06]"
                            style={{ fontSize: 'clamp(1.5rem, 5vw, 2.8rem)' }}
                        >
                            {t('homePage.hero.socialProof.title')}
                            <br />
                            <span className="italic font-medium text-[#b58929]">
                                {t('homePage.hero.socialProof.titleAccent')}
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={rmInitial ?? { opacity: 0, y: 10 }}
                            animate={rmAnimate({ opacity: 1, y: 0 })}
                            transition={rmTransition({ delay: 0.28, duration: 0.55 })}
                            className="mt-2 text-[#00417a]/75 text-fluid-small max-w-xl mx-auto md:mx-0"
                        >
                            {t('homePage.hero.socialProof.subtitle')}
                        </motion.p>

                        {/* Stats row */}
                        <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-2 sm:gap-6 max-w-lg mx-auto md:mx-0 border-t border-[#00417a]/10 pt-3 sm:pt-4">
                            <Stat
                                icon={Users}
                                target={3286}
                                label={t('homePage.hero.socialProof.stat1Label')}
                                active={isActive}
                                delay={0.35}
                                instant={prefersReducedMotion}
                            />
                            <Stat
                                icon={Truck}
                                target={6185}
                                label={t('homePage.hero.socialProof.stat2Label')}
                                active={isActive}
                                delay={0.45}
                                instant={prefersReducedMotion}
                            />
                            <Stat
                                icon={ShieldCheck}
                                target={100}
                                suffix="%"
                                label={t('homePage.hero.socialProof.stat3Label')}
                                active={isActive}
                                delay={0.55}
                                instant={prefersReducedMotion}
                            />
                        </div>

                        <motion.div
                            initial={rmInitial ?? { opacity: 0, y: 10 }}
                            animate={rmAnimate({ opacity: 1, y: 0 })}
                            transition={rmTransition({ delay: 0.65, duration: 0.55 })}
                            className="mt-4 sm:mt-5 flex justify-center md:justify-start"
                        >
                            <button
                                type="button"
                                onClick={() => navigate('/auth')}
                                className="group inline-flex items-center gap-2 rounded-full bg-[#00417a] text-white font-semibold text-fluid-small px-5 py-2.5 sm:px-6 sm:py-3 shadow-[0_10px_24px_-8px_rgba(0,65,122,0.55)] hover:bg-[#003463] transition-all hover:shadow-[0_14px_30px_-10px_rgba(0,65,122,0.65)] hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a84b] focus-visible:ring-offset-2 min-h-[44px]"
                            >
                                {t('homePage.hero.socialProof.cta')}
                                <ArrowUpRight
                                    className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                                    strokeWidth={2.5}
                                />
                            </button>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialProofSlide;
