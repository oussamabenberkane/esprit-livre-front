import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Building2, Server, Copyright, Mail } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const BRAND_BLUE = '#00417a';
const EASE = [0.22, 1, 0.36, 1];

const SECTIONS = [
  { key: 'editor', icon: Building2 },
  { key: 'hosting', icon: Server },
  { key: 'ip', icon: Copyright },
  { key: 'contact', icon: Mail },
];

export default function MentionsLegalesPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-36 md:pt-44 pb-12 md:pb-20 px-fluid-2xl overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 40%, rgba(0,65,122,0.04) 0%, transparent 70%)',
          }}
        />
        <div className="relative max-w-5xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: EASE }}
            className="text-fluid-small font-semibold tracking-[0.25em] uppercase mb-5"
            style={{ color: BRAND_BLUE }}
          >
            {t('mentionsLegales.label')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
            className="text-fluid-hero font-bold leading-tight mb-5 bg-gradient-to-r from-[var(--color-brand-blue)] via-blue-600 to-[var(--color-brand-blue-light)] bg-clip-text text-transparent"
          >
            {t('mentionsLegales.title')}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.55, duration: 0.7, ease: 'easeOut' }}
            className="mx-auto mb-5 h-[2px] w-20 origin-center bg-gradient-to-r from-transparent via-[var(--color-brand-blue)] to-transparent"
          />

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: EASE }}
            className="text-fluid-h3 text-gray-500 max-w-2xl mx-auto leading-relaxed"
          >
            {t('mentionsLegales.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Sections */}
      <section className="max-w-6xl mx-auto px-fluid-2xl pb-20 md:pb-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SECTIONS.map(({ key, icon: Icon }, i) => (
            <motion.div
              key={key}
              id={key}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: EASE }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100"
              style={{ boxShadow: '0 4px 24px -6px rgba(0,30,70,0.08)' }}
            >
              <div
                className="w-11 h-11 rounded-xl mb-5 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(0,65,122,0.07)' }}
              >
                <Icon className="w-5 h-5" style={{ color: BRAND_BLUE }} />
              </div>
              <h2
                className="text-fluid-h2 font-bold mb-4 leading-tight"
                style={{ color: BRAND_BLUE }}
              >
                {t(`mentionsLegales.sections.${key}.title`)}
              </h2>
              <div className="space-y-1">
                {t(`mentionsLegales.sections.${key}.lines`, { returnObjects: true }).map(
                  (line, j) => (
                    <p key={j} className="text-fluid-body text-gray-600 leading-relaxed">
                      {line}
                    </p>
                  )
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
