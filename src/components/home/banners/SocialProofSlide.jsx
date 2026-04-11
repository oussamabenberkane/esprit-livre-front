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
                className="font-['Poppins'] font-bold text-white tabular-nums leading-none"
                style={{
                    fontSize: 'clamp(1.5rem, 4.5vw, 2.4rem)',
                    letterSpacing: '-0.02em',
                }}
            >
                {formatNum(value)}
                {suffix && <span className="text-[#d4a84b]">{suffix}</span>}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
                <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 text-[#d4a84b]" strokeWidth={2.25} />
                <span
                    className="text-[10px] sm:text-[11px] font-semibold uppercase truncate text-white/85"
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
            {/* Semi-transparent navy wash — the persistent MarqueeBackdrop sits
                *under* this slide, so the books keep flowing through the tint
                without restarting on slide change. */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'linear-gradient(100deg, rgba(0,30,60,0.94) 0%, rgba(0,65,122,0.82) 45%, rgba(0,65,122,0.58) 100%)',
                }}
            />

            {/* Gold glow accent */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(50% 50% at 90% 100%, rgba(212,168,75,0.22) 0%, rgba(212,168,75,0) 60%)',
                }}
            />

            {/* Subtle gold hairline sitting toward the far right */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'linear-gradient(115deg, transparent 82%, rgba(212,168,75,0.14) 83%, rgba(212,168,75,0.14) 83.4%, transparent 84%)',
                }}
            />

            <GrainOverlay opacity={0.15} blend="overlay" />

            <div className="relative h-full w-full flex items-center">
                <div className="container-main w-full px-5 sm:px-8 md:px-fluid-lg">
                    <div className="max-w-3xl text-center md:text-left">
                        <motion.div
                            initial={rmInitial ?? { opacity: 0, y: 12 }}
                            animate={rmAnimate({ opacity: 1, y: 0 })}
                            transition={rmTransition({ delay: 0.1, duration: 0.55 })}
                            className="inline-flex items-center gap-1.5 rounded-full border border-[#d4a84b]/40 bg-[#d4a84b]/10 text-[#d4a84b] text-[10px] sm:text-fluid-vsmall font-semibold px-2.5 py-1 mb-2 sm:mb-3"
                            style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
                        >
                            <span className="relative flex h-1.5 w-1.5">
                                {!prefersReducedMotion && (
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4a84b] opacity-60" />
                                )}
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#d4a84b]" />
                            </span>
                            {t('homePage.hero.socialProof.eyebrow')}
                        </motion.div>

                        <motion.h2
                            initial={rmInitial ?? { opacity: 0, y: 14 }}
                            animate={rmAnimate({ opacity: 1, y: 0 })}
                            transition={rmTransition({ delay: 0.18, duration: 0.6 })}
                            className="font-['Poppins'] font-bold text-white leading-[1.06]"
                            style={{ fontSize: 'clamp(1.5rem, 5vw, 2.8rem)' }}
                        >
                            {t('homePage.hero.socialProof.title')}
                            <br />
                            <span className="italic font-medium text-[#d4a84b]">
                                {t('homePage.hero.socialProof.titleAccent')}
                            </span>
                        </motion.h2>

                        <motion.p
                            initial={rmInitial ?? { opacity: 0, y: 10 }}
                            animate={rmAnimate({ opacity: 1, y: 0 })}
                            transition={rmTransition({ delay: 0.28, duration: 0.55 })}
                            className="mt-2 text-white/80 text-fluid-small max-w-xl mx-auto md:mx-0"
                        >
                            {t('homePage.hero.socialProof.subtitle')}
                        </motion.p>

                        {/* Stats row */}
                        <div className="mt-4 sm:mt-5 grid grid-cols-3 gap-2 sm:gap-6 max-w-lg mx-auto md:mx-0 border-t border-white/10 pt-3 sm:pt-4">
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
                                className="group inline-flex items-center gap-2 rounded-full border border-[#d4a84b] text-[#d4a84b] font-semibold text-fluid-small px-5 py-2.5 sm:px-6 sm:py-3 hover:bg-[#d4a84b] hover:text-[#002a52] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#d4a84b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#00417a] min-h-[44px]"
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
