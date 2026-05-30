import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from './Navbar';
import Footer from './Footer';

const BRAND_BLUE = '#00417a';
const EASE = [0.22, 1, 0.36, 1];

export default function LegalLayout({ label, title, subtitle, lastUpdated, sections }) {
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState(sections[0]?.key ?? '');
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Store keys in a ref so the scroll listener never goes stale and
  // the effect only runs once regardless of sections reference changes.
  const keysRef = useRef(sections.map(s => s.key));

  useEffect(() => {
    const handleScroll = () => {
      const TRIGGER = window.innerHeight * 0.35;
      let current = keysRef.current[0] ?? '';
      for (const key of keysRef.current) {
        const el = document.getElementById(`section-${key}`);
        if (el && el.getBoundingClientRect().top <= TRIGGER) current = key;
      }
      setActiveSection(current);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (key) => {
    document.getElementById(`section-${key}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Reading progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-50 origin-left"
        style={{ scaleX, backgroundColor: BRAND_BLUE }}
      />

      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 md:pt-40 pb-10 md:pb-14 px-fluid-2xl overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(55% 55% at 50% 40%, rgba(0,65,122,0.05) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: EASE }}
            className="text-fluid-small font-semibold tracking-[0.28em] uppercase mb-4"
            style={{ color: BRAND_BLUE }}
          >
            {label}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.8, ease: EASE }}
            className="text-fluid-hero font-bold leading-tight mb-4"
            style={{ color: BRAND_BLUE }}
          >
            {title}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.45, duration: 0.6, ease: 'easeOut' }}
            className="mx-auto mb-5 h-[2px] w-16 origin-center"
            style={{ background: `linear-gradient(to right, transparent, ${BRAND_BLUE}, transparent)` }}
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6, ease: EASE }}
            className="text-fluid-h3 text-gray-500 max-w-xl mx-auto leading-relaxed mb-5"
          >
            {subtitle}
          </motion.p>

          {lastUpdated && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.4 }}
              className="inline-flex items-center gap-1.5 text-fluid-small text-gray-400"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{lastUpdated}</span>
            </motion.div>
          )}
        </div>
      </section>

      {/* Mobile sticky TOC */}
      <div className="lg:hidden sticky top-16 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="px-fluid-2xl py-2.5 flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {sections.map(({ key, icon: Icon }, i) => {
            const isActive = activeSection === key;
            return (
              <button
                key={key}
                onClick={() => scrollToSection(key)}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
                style={{
                  backgroundColor: isActive ? BRAND_BLUE : 'rgba(0,0,0,0.05)',
                  color: isActive ? '#fff' : '#6b7280',
                }}
              >
                <Icon className="w-3 h-3" />
                <span className="whitespace-nowrap">{sections[i].title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main layout — flex so sidebar sticky works naturally */}
      <div className="max-w-7xl mx-auto px-fluid-2xl pb-24 md:pb-32 pt-8 lg:pt-14">
        <div className="lg:flex lg:gap-12 xl:gap-16">

          {/* Desktop sticky TOC — self-contained width, sticky just works in flex */}
          <aside className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
            <div className="sticky top-28">
              <p
                className="text-[11px] font-semibold tracking-[0.22em] uppercase mb-4 pb-3 border-b border-gray-100"
                style={{ color: 'rgba(0,65,122,0.45)' }}
              >
                {t('legal.onThisPage')}
              </p>
              <nav className="space-y-0.5">
                {sections.map(({ key }, i) => {
                  const isActive = activeSection === key;
                  return (
                    <button
                      key={key}
                      onClick={() => scrollToSection(key)}
                      className="w-full text-left flex items-center gap-3 pl-3 pr-2 py-2.5 rounded-r-lg transition-all duration-200 border-l-2"
                      style={{
                        borderLeftColor: isActive ? BRAND_BLUE : 'transparent',
                        backgroundColor: isActive ? 'rgba(0,65,122,0.05)' : 'transparent',
                      }}
                    >
                      <span
                        className="text-[10px] font-mono font-bold flex-shrink-0 w-4 transition-colors duration-200"
                        style={{ color: isActive ? BRAND_BLUE : '#d1d5db' }}
                      >
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span
                        className="text-[13px] font-medium leading-snug transition-colors duration-200"
                        style={{ color: isActive ? BRAND_BLUE : '#9ca3af' }}
                      >
                        {sections[i].title}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {lastUpdated && (
                <div className="mt-8 pt-5 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                    <Calendar className="w-3 h-3 flex-shrink-0" />
                    <span>{lastUpdated}</span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0">
            {sections.map(({ key, icon: Icon, title: sectionTitle, content }, i) => (
              <motion.section
                key={key}
                id={`section-${key}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.04, ease: EASE }}
                className="scroll-mt-32 py-10 lg:py-12"
                style={{ borderBottom: i < sections.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none' }}
              >
                {/* Section header */}
                <div className="flex items-start gap-4 mb-6">
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center mt-0.5"
                    style={{ backgroundColor: 'rgba(0,65,122,0.07)' }}
                  >
                    <Icon className="w-[18px] h-[18px]" style={{ color: BRAND_BLUE }} />
                  </div>
                  <div>
                    <span
                      className="block text-[10px] font-mono font-bold tracking-widest mb-1"
                      style={{ color: 'rgba(0,65,122,0.3)' }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <h2
                      className="text-fluid-h1to2 font-bold leading-tight"
                      style={{ color: BRAND_BLUE }}
                    >
                      {sectionTitle}
                    </h2>
                  </div>
                </div>

                {/* Body with left accent */}
                <div
                  className="ml-14"
                  style={{ borderLeft: '2px solid rgba(0,65,122,0.09)', paddingLeft: '1.5rem' }}
                >
                  {Array.isArray(content) ? (
                    <div className="space-y-3">
                      {content.map((line, j) => (
                        <p key={j} className="text-fluid-body text-gray-600 leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-fluid-body text-gray-600 leading-relaxed">{content}</p>
                  )}
                </div>
              </motion.section>
            ))}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}
