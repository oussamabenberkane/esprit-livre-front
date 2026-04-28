import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BookOpen, PauseCircle, Mail, Home, Info } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { logout } from '../services/authService';

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

const scalePop = {
  hidden: { opacity: 0, scale: 0.78 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

export default function AccountDeactivated() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    logout();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <Navbar />
      <div className="h-28 md:h-20" />

      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-2xl w-full text-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Icon composition */}
          <motion.div variants={scalePop} className="mb-10 flex justify-center">
            <div className="relative inline-flex items-center justify-center">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-full bg-[var(--color-brand-blue)] opacity-8 blur-2xl scale-150" />
              {/* Soft ambient ring */}
              <div className="absolute w-36 h-36 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 opacity-60" />
              {/* Icon container */}
              <div className="relative w-28 h-28 rounded-full bg-white shadow-xl flex items-center justify-center ring-4 ring-blue-100">
                {/* Book base */}
                <BookOpen
                  className="absolute text-[var(--color-brand-blue)] opacity-30"
                  size={52}
                  strokeWidth={1.4}
                />
                {/* Pause overlay */}
                <PauseCircle
                  className="relative text-[var(--color-brand-blue)]"
                  size={36}
                  strokeWidth={1.8}
                />
              </div>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="text-fluid-h1 font-bold text-gray-900 mb-4 leading-tight"
          >
            {t('deactivated.title')}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            className="text-fluid-body font-medium text-[var(--color-brand-blue)] mb-4"
          >
            {t('deactivated.subtitle')}
          </motion.p>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            className="text-fluid-body text-gray-600 max-w-lg mx-auto mb-10 leading-relaxed"
          >
            {t('deactivated.description')}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeUp}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          >
            <a
              href="mailto:contact@espritlivre.fr"
              className="group flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-blue)] text-white rounded-lg font-medium hover:bg-[var(--color-brand-blue-light)] transition-all duration-300 shadow-md hover:shadow-lg min-w-[220px] justify-center"
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {t('deactivated.contactSupport')}
            </a>

            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-brand-blue)] border-2 border-[var(--color-brand-blue)] rounded-lg font-medium hover:bg-[var(--color-brand-blue)] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg min-w-[220px] justify-center"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {t('deactivated.backHome')}
            </button>
          </motion.div>

          {/* Contact note */}
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-fluid-small text-gray-500"
          >
            <Info className="w-4 h-4 text-[var(--color-brand-blue)] shrink-0" />
            <span>{t('deactivated.contactNote')}</span>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
