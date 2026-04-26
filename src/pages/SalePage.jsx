import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { Flame, Tag, ChevronDown, BookOpen, Sparkles, Percent } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import BookCard from '../components/common/BookCard';
import BookCardSkeleton from '../components/common/skeletons/BookCardSkeleton';
import { fetchAllBooks } from '../services/books.service';
import { useCart } from '../contexts/CartContext';

const PAGE_SIZE = 12;

function AnimatedCount({ target }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, v => Math.round(v));
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsub = rounded.on('change', v => setDisplay(v));
    const ctrl = animate(count, target, { duration: 1.2, ease: 'easeOut' });
    return () => { ctrl.stop(); unsub(); };
  }, [target]);

  return <span>{display}</span>;
}

const FloatingOrb = ({ style, delay = 0 }) => (
  <motion.div
    className="absolute rounded-full blur-3xl pointer-events-none"
    animate={{ y: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
    transition={{ duration: 6, repeat: Infinity, delay, ease: 'easeInOut' }}
    style={style}
  />
);

export default function SalePage() {
  const { t } = useTranslation();
  const { addToCart } = useCart();

  const [books, setBooks] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const initialized = useRef(false);

  const load = useCallback(async (page, append = false) => {
    try {
      if (page === 0) setLoading(true);
      else setLoadingMore(true);

      const result = await fetchAllBooks(page, PAGE_SIZE, { onSale: true });
      const incoming = result.books || [];

      setBooks(prev => append ? [...prev, ...incoming] : incoming);
      setTotalElements(result.totalElements || 0);
      setTotalPages(result.totalPages || 0);
      setCurrentPage(result.currentPage || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    load(0, false);
  }, [load]);

  const handleLoadMore = () => {
    if (currentPage + 1 < totalPages && !loadingMore) {
      load(currentPage + 1, true);
    }
  };

  const hasMore = currentPage + 1 < totalPages;

  return (
    <div className="min-h-screen bg-[#fafaf8] font-sans">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#1a0a00] via-[#7c1a00] to-[#b83200] pt-36 pb-20 md:pt-32 md:pb-28">
        {/* Orbs */}
        <FloatingOrb style={{ width: 400, height: 400, top: -100, left: -80, background: 'rgba(251,146,60,0.25)' }} delay={0} />
        <FloatingOrb style={{ width: 300, height: 300, bottom: -60, right: 60, background: 'rgba(239,68,68,0.2)' }} delay={2} />
        <FloatingOrb style={{ width: 200, height: 200, top: 40, right: '30%', background: 'rgba(253,186,116,0.15)' }} delay={4} />

        {/* Diagonal stripe texture */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 1px, transparent 16px)',
          }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/10 border border-white/20 backdrop-blur-sm text-orange-200 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-6"
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            {t('sale.badge', 'Offres limitées')}
          </motion.div>

          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h1
              className="text-6xl sm:text-7xl md:text-8xl font-black text-white leading-none tracking-tight mb-2"
              style={{ fontFamily: '"Georgia", "Times New Roman", serif', textShadow: '0 4px 40px rgba(0,0,0,0.4)' }}
            >
              {t('sale.title', 'Promotions')}
            </h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              {['●', '●', '●'].map((d, i) => (
                <motion.span
                  key={i}
                  className="text-orange-400/60 text-[8px]"
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                >{d}</motion.span>
              ))}
            </div>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-5 text-orange-100/80 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
          >
            {t('sale.subtitle', 'Des livres sélectionnés avec des remises exceptionnelles — pour un temps limité.')}
          </motion.p>

          {/* Stats chip */}
          {!loading && totalElements > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 inline-flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-3"
            >
              <Tag className="w-4 h-4 text-orange-300" />
              <span className="text-white font-bold text-lg tabular-nums">
                <AnimatedCount target={totalElements} />
              </span>
              <span className="text-orange-200 text-sm">
                {t('sale.statsLabel', 'livres en promotion')}
              </span>
            </motion.div>
          )}
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-10 sm:h-14">
            <path d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z" fill="#fafaf8" />
          </svg>
        </div>
      </section>

      {/* ── Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Loading skeleton grid */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-5xl mb-4">⚠️</div>
            <p className="text-gray-500">{t('sale.error', 'Une erreur est survenue. Veuillez réessayer.')}</p>
            <button
              onClick={() => load(0, false)}
              className="mt-4 px-6 py-2 bg-[#00417a] text-white rounded-lg hover:bg-[#003060] transition-colors text-sm font-semibold"
            >
              {t('sale.retry', 'Réessayer')}
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {!loading && !error && books.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-24"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
              className="text-7xl mb-6 inline-block"
            >
              🏷️
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {t('sale.emptyTitle', 'Aucune promotion pour le moment')}
            </h2>
            <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
              {t('sale.emptySubtitle', 'Revenez bientôt — de nouvelles offres sont régulièrement ajoutées.')}
            </p>
            <div className="flex items-center justify-center gap-1 mt-6">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-orange-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Books grid */}
        {!loading && !error && books.length > 0 && (
          <>
            {/* Section label */}
            <div className="flex items-center gap-3 mb-7">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {t('sale.gridLabel', 'Livres en promotion')}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-200 to-transparent" />
            </div>

            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: {},
                visible: { transition: { staggerChildren: 0.04 } }
              }}
            >
              <AnimatePresence mode="popLayout">
                {books.map((book, idx) => (
                  <motion.div
                    key={book.id}
                    layout
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } }
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <BookCard
                      id={book.id}
                      title={book.title}
                      author={book.author?.name}
                      price={book.price}
                      stock={book.stockQuantity}
                      badge={book.tags?.find(t => t.type === 'ETIQUETTE')}
                      preorderDate={book.preorderDate}
                      onSale={book.onSale}
                      discountType={book.discountType}
                      discountValue={book.discountValue}
                      onAddToCart={(id) => addToCart(id, 1)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Load more skeletons */}
            {loadingMore && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <BookCardSkeleton key={`more-${i}`} />
                ))}
              </div>
            )}

            {/* Load more button */}
            {hasMore && !loadingMore && (
              <div className="flex justify-center mt-12">
                <motion.button
                  onClick={handleLoadMore}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="group relative flex items-center gap-3 bg-white border-2 border-orange-300 text-orange-700 font-bold px-8 py-3.5 rounded-2xl shadow-sm hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
                >
                  <span>{t('sale.loadMore', 'Voir plus de promotions')}</span>
                  <motion.div
                    animate={{ y: [0, 3, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </motion.div>
                  <span className="ml-1 text-xs text-orange-400 font-normal">
                    ({totalElements - books.length} {t('sale.remaining', 'restants')})
                  </span>
                </motion.button>
              </div>
            )}

            {/* End of list */}
            {!hasMore && books.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-3 mt-12 text-gray-400 text-xs"
              >
                <div className="h-px w-16 bg-gray-200" />
                <BookOpen className="w-3.5 h-3.5" />
                <span>{t('sale.allShown', 'Toutes les promotions affichées')}</span>
                <div className="h-px w-16 bg-gray-200" />
              </motion.div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
