import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PauseCircle, Mail, Home, Info } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { logout } from '../services/authService';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const scalePop = {
  hidden: { opacity: 0, scale: 0.72 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};

export default function AccountDeactivated() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#f7f6f3',
        backgroundImage:
          'radial-gradient(circle, rgba(0,65,122,0.055) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      <Navbar />
      <div className="h-28 md:h-20" />

      <main className="flex-grow flex items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-3xl w-full"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Card */}
          <div
            className="bg-white rounded-3xl px-6 py-10 sm:px-14 sm:py-14 text-center"
            style={{
              boxShadow:
                '0 4px 48px rgba(0,65,122,0.09), 0 1px 4px rgba(0,65,122,0.05)',
            }}
          >
            {/* Icon */}
            <motion.div variants={scalePop} className="mb-8 flex justify-center">
              <div className="relative inline-flex items-center justify-center">
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: 92, height: 92, backgroundColor: 'rgba(0,65,122,0.1)' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.45, 0, 0.45] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                />
                <div
                  className="absolute rounded-full"
                  style={{ width: 80, height: 80, backgroundColor: 'rgba(0,65,122,0.07)' }}
                />
                <div
                  className="relative flex items-center justify-center rounded-full"
                  style={{ width: 68, height: 68, backgroundColor: '#00417a' }}
                >
                  <PauseCircle className="text-white" size={34} strokeWidth={1.5} />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              className="text-fluid-h1 font-bold text-gray-900 mb-3 leading-snug"
            >
              {t('deactivated.title')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-fluid-body font-semibold mb-3"
              style={{ color: '#00417a' }}
            >
              {t('deactivated.subtitle')}
            </motion.p>

            {/* Description */}
            <motion.p
              variants={fadeUp}
              className="text-fluid-body text-gray-500 max-w-md mx-auto mb-10 leading-relaxed"
            >
              {t('deactivated.description')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center gap-3 mb-8"
            >
              {/* Primary CTA */}
              <a
                href="mailto:contact@espritlivre.com"
                className="group flex items-center justify-center gap-2.5 w-full sm:w-auto sm:min-w-[260px] px-8 py-3.5 bg-[var(--color-brand-blue)] text-white rounded-xl font-medium hover:bg-[var(--color-brand-blue-light)] transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <Mail className="w-4.5 h-4.5 group-hover:scale-110 transition-transform duration-300" size={18} />
                {t('deactivated.contactSupport')}
              </a>

              {/* Secondary CTA — ghost/text style, clearly subordinate */}
              <button
                onClick={() => navigate('/')}
                className="group inline-flex items-center justify-center gap-2 px-4 py-2 text-fluid-body text-gray-500 hover:text-[var(--color-brand-blue)] transition-colors duration-200 font-medium"
              >
                <Home className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" size={16} />
                {t('deactivated.backHome')}
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={fadeUp} className="border-t border-gray-100 pt-6">
              <div className="inline-flex items-center gap-2 text-fluid-small text-gray-400">
                <Info className="w-3.5 h-3.5 shrink-0 text-gray-300" />
                <span>{t('deactivated.contactNote')}</span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
