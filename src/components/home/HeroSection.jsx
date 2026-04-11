import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SWIPE_THRESHOLD = 60;
const EASE = [0.22, 1, 0.36, 1];

const variants = {
    enter: (dir) => ({
        x: dir > 0 ? '100%' : '-100%',
        opacity: 0.4,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.7, ease: EASE },
    },
    exit: (dir) => ({
        x: dir > 0 ? '-100%' : '100%',
        opacity: 0.4,
        transition: { duration: 0.7, ease: EASE },
    }),
};

const HeroCarousel = ({
    slides = [],
    className = '',
    currentSlide = 0,
    onSlideChange,
    autoScrollMs = 7000,
    backdrop = null,
}) => {
    const { t } = useTranslation();
    const [isHovered, setIsHovered] = useState(false);
    const [rightArrowOffset, setRightArrowOffset] = useState(16);
    const directionRef = useRef(1);
    const prevSlideRef = useRef(currentSlide);

    // Compute direction by shortest circular path (runs pre-commit so AnimatePresence sees fresh value)
    if (prevSlideRef.current !== currentSlide && slides.length > 0) {
        const old = prevSlideRef.current;
        const neu = currentSlide;
        const n = slides.length;
        const forwardDist = (neu - old + n) % n;
        const backwardDist = (old - neu + n) % n;
        directionRef.current = forwardDist <= backwardDist ? 1 : -1;
        prevSlideRef.current = currentSlide;
    }

    useEffect(() => {
        const calculateRightOffset = () => {
            const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
            let basePadding = 16;
            if (window.innerWidth >= 768) basePadding = 32;
            else if (window.innerWidth >= 640) basePadding = 24;
            setRightArrowOffset(basePadding + scrollbarW);
        };
        calculateRightOffset();
        window.addEventListener('resize', calculateRightOffset);
        return () => window.removeEventListener('resize', calculateRightOffset);
    }, []);

    const goTo = (targetIndex, dir) => {
        if (!onSlideChange || slides.length === 0) return;
        const wrapped = ((targetIndex % slides.length) + slides.length) % slides.length;
        if (wrapped === currentSlide) return;
        directionRef.current = dir;
        onSlideChange(wrapped);
    };

    const prev = () => goTo(currentSlide - 1, -1);
    const next = () => goTo(currentSlide + 1, 1);

    useEffect(() => {
        if (slides.length <= 1 || !onSlideChange || isHovered) return;
        const id = setInterval(() => {
            directionRef.current = 1;
            onSlideChange((currentSlide + 1) % slides.length);
        }, autoScrollMs);
        return () => clearInterval(id);
    }, [currentSlide, slides.length, onSlideChange, autoScrollMs, isHovered]);

    const activeSlide = slides[currentSlide];

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`relative hero-height overflow-hidden ${className}`}>
                {backdrop}
                <AnimatePresence initial={false} custom={directionRef.current} mode="popLayout">
                    <motion.div
                        key={currentSlide}
                        custom={directionRef.current}
                        variants={variants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.18}
                        onDragEnd={(_, info) => {
                            if (info.offset.x < -SWIPE_THRESHOLD) next();
                            else if (info.offset.x > SWIPE_THRESHOLD) prev();
                        }}
                        className="absolute inset-0 h-full w-full touch-pan-y"
                        style={{ willChange: 'transform' }}
                    >
                        {activeSlide && typeof activeSlide.content === 'function'
                            ? activeSlide.content({ isActive: true })
                            : activeSlide?.content}
                    </motion.div>
                </AnimatePresence>
            </div>

            {slides.length > 1 && (
                <>
                    <button
                        onClick={prev}
                        className="absolute left-3 sm:left-6 md:left-8 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all z-20 backdrop-blur-sm"
                        aria-label={t('aria.previousSlide')}
                    >
                        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-[#00417a]" />
                    </button>
                    <button
                        onClick={next}
                        className="absolute top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 sm:p-3 rounded-full shadow-lg transition-all z-20 backdrop-blur-sm"
                        style={{ right: `${rightArrowOffset}px` }}
                        aria-label={t('aria.nextSlide')}
                    >
                        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-[#00417a]" />
                    </button>
                </>
            )}
        </div>
    );
};

export default HeroCarousel;
