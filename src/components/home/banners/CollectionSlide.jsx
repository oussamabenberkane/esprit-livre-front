import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import GrainOverlay from './GrainOverlay';

const SPINE_PALETTE = [
    ['#0a5394', '#002d56'],
    ['#d4a84b', '#8a6a1a'],
    ['#00417a', '#001e3d'],
    ['#b58929', '#5a3f0a'],
    ['#0f4d85', '#062e52'],
    ['#c99531', '#6b4410'],
    ['#1a5a94', '#003663'],
    ['#a97b1c', '#4a2f04'],
];

const Marquee = ({ covers, rowOffset = 0, speed = 55, reverse = false }) => {
    const hasCovers = covers.length > 0;
    const fallback = hasCovers ? covers : Array.from({ length: 8 }, (_, i) => null);
    const list = [...fallback, ...fallback];

    return (
        <div
            className="absolute left-0 right-0 flex gap-3 sm:gap-4"
            style={{
                top: `${rowOffset}%`,
                willChange: 'transform',
            }}
        >
            <motion.div
                className="flex gap-3 sm:gap-4 shrink-0"
                animate={{ x: reverse ? ['-50%', '0%'] : ['0%', '-50%'] }}
                transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
            >
                {list.map((src, i) => {
                    const [from, to] = SPINE_PALETTE[i % SPINE_PALETTE.length];
                    return (
                        <div
                            key={i}
                            className="shrink-0 rounded-[3px] overflow-hidden bg-[#1a1a1a]"
                            style={{
                                width: 'clamp(70px, 8vw, 110px)',
                                height: 'clamp(105px, 12vw, 165px)',
                                boxShadow:
                                    '0 18px 32px -14px rgba(0,30,70,0.35), inset 2px 0 0 rgba(255,255,255,0.05), inset -2px 0 0 rgba(0,0,0,0.2)',
                            }}
                        >
                            {src ? (
                                <img
                                    src={src}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    draggable={false}
                                />
                            ) : (
                                <div
                                    className="w-full h-full flex flex-col justify-between p-2"
                                    style={{
                                        background: `linear-gradient(150deg, ${from} 0%, ${to} 100%)`,
                                    }}
                                >
                                    <div className="h-[2px] w-1/2 bg-white/35" />
                                    <div className="h-[2px] w-6 bg-[#d4a84b]" />
                                    <div className="h-[2px] w-1/3 bg-white/25 self-end" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </motion.div>
        </div>
    );
};

const CollectionSlide = ({ covers = [], isActive }) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const rowA = covers.slice(0, 8);
    const rowB = covers.slice(8, 16).length >= 4 ? covers.slice(8, 16) : covers.slice(0, 8).reverse();

    const handleClick = () => navigate('/allbooks');

    return (
        <div
            className="relative w-full h-full cursor-pointer group"
            onClick={handleClick}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClick();
                }
            }}
        >
            {/* Cream base */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        'linear-gradient(180deg, #f9f3e4 0%, #f1e6cc 100%)',
                }}
            />

            {/* Marquee rows in background, tilted */}
            <div
                className="absolute inset-0 opacity-90 pointer-events-none"
                style={{
                    transform: 'rotate(-4deg) scale(1.1)',
                    transformOrigin: 'center',
                }}
            >
                <Marquee covers={rowA} rowOffset={8} speed={60} />
                <Marquee covers={rowB} rowOffset={62} speed={75} reverse />
            </div>

            {/* Soft vignette to focus center */}
            <div
                aria-hidden="true"
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(60% 75% at 50% 50%, rgba(249,243,228,0) 0%, rgba(249,243,228,0.85) 60%, rgba(241,230,204,0.95) 100%)',
                }}
            />

            <GrainOverlay opacity={0.22} />

            {/* Centered frosted content panel */}
            <div className="relative h-full w-full flex items-center justify-center px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 18, scale: 0.98 }}
                    animate={isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 18, scale: 0.98 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    className="relative max-w-2xl w-full text-center rounded-2xl sm:rounded-3xl px-5 sm:px-10 py-6 sm:py-8"
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                        transition={{ delay: 0.15, duration: 0.5 }}
                        className="inline-flex items-center gap-1.5 text-[#00417a]/70 text-[10px] sm:text-fluid-vsmall font-semibold mb-2"
                        style={{ letterSpacing: '0.18em', textTransform: 'uppercase' }}
                    >
                        <span className="h-px w-4 sm:w-6 bg-[#00417a]/40" />
                        {t('homePage.hero.collection.eyebrow')}
                        <span className="h-px w-4 sm:w-6 bg-[#00417a]/40" />
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 10 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                        transition={{ delay: 0.22, duration: 0.6 }}
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
                        initial={{ opacity: 0, y: 8 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                        transition={{ delay: 0.32, duration: 0.55 }}
                        className="mt-2 text-[#00417a]/70 text-fluid-small max-w-md mx-auto"
                    >
                        {t('homePage.hero.collection.subtitle')}
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={isActive ? { opacity: 1 } : { opacity: 0 }}
                        transition={{ delay: 0.45, duration: 0.5 }}
                        className="mt-4 inline-flex items-center gap-1.5 text-[#00417a] text-fluid-small font-semibold"
                    >
                        {t('homePage.hero.collection.hint')}
                        <ArrowRight
                            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1.5"
                            strokeWidth={2.5}
                        />
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default CollectionSlide;
