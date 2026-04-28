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

      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-md w-full"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Card */}
          <div
            className="bg-white rounded-3xl px-8 py-12 sm:px-12 text-center"
            style={{
              boxShadow:
                '0 4px 48px rgba(0,65,122,0.09), 0 1px 4px rgba(0,65,122,0.05)',
            }}
          >
            {/* Icon */}
            <motion.div variants={scalePop} className="mb-8 flex justify-center">
              <div className="relative inline-flex items-center justify-center">
                {/* Animated pulse ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ width: 92, height: 92, backgroundColor: 'rgba(0,65,122,0.1)' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.45, 0, 0.45] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                />
                {/* Static ambient ring */}
                <div
                  className="absolute rounded-full"
                  style={{ width: 80, height: 80, backgroundColor: 'rgba(0,65,122,0.07)' }}
                />
                {/* Icon circle */}
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
              className="font-bold text-gray-900 mb-3 leading-snug"
              style={{
                fontSize: 'clamp(1.25rem, 3.5vw, 1.65rem)',
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
              }}
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
              className="text-fluid-body text-gray-500 max-w-xs mx-auto mb-10 leading-relaxed"
            >
              {t('deactivated.description')}
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6"
            >
              {/*
                Primary button: bg #00417a, text always white.
                Both the base text-white and hover:text-white are explicit so
                no inherited color can bleed through.
              */}
              <a
                href="mailto:contact@espritlivre.com"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-[#00417a] hover:bg-[#0052a3] hover:text-white transition-all duration-200 hover:shadow-lg min-w-[200px] justify-center"
              >
                {/* No color class on icon — inherits currentColor from parent text-white */}
                <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {t('deactivated.contactSupport')}
              </a>

              {/*
                Secondary button: base is transparent bg + blue text.
                Hover flips to solid blue bg + white text.
                Icon has NO explicit color class so it inherits currentColor
                and flips automatically with the parent text color — this
                fixes the "black icon on blue hover" bug from the old version.
              */}
              <button
                onClick={() => navigate('/')}
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold border-2 border-[#00417a] text-[#00417a] bg-transparent hover:bg-[#00417a] hover:text-white transition-all duration-200 hover:shadow-lg min-w-[200px] justify-center"
              >
                <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
                {t('deactivated.backHome')}
              </button>
            </motion.div>

            {/* Contact note */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-fluid-small text-gray-400"
              style={{ backgroundColor: '#f7f6f3', border: '1px solid #e9e4d9' }}
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>{t('deactivated.contactNote')}</span>
            </motion.div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
