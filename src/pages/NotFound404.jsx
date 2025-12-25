import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const NotFound404 = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
      <Navbar />

      {/* Responsive spacing for navbar - taller on mobile due to two-line layout */}
      <div className="h-28 md:h-20"></div>

      <main className="flex-grow flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-4xl w-full text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* 404 Number */}
          <motion.div
            variants={itemVariants}
            className="mb-8"
          >
            <h1 className="text-[clamp(6rem,15vw,12rem)] font-bold leading-none bg-gradient-to-r from-[var(--color-brand-blue)] via-blue-600 to-[var(--color-brand-blue-light)] bg-clip-text text-transparent">
              404
            </h1>
          </motion.div>

          {/* Error Message */}
          <motion.div variants={itemVariants} className="mb-10">
            <h2 className="text-fluid-h1 font-semibold text-gray-900 mb-3">
              {t('404.title')}
            </h2>
            <p className="text-fluid-body text-gray-600 max-w-2xl mx-auto">
              {t('404.description')}
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            {/* Go Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-brand-blue)] border-2 border-[var(--color-brand-blue)] rounded-lg font-medium hover:bg-[var(--color-brand-blue)] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg min-w-[200px] justify-center"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" />
              {t('404.goBack')}
            </button>

            {/* Home Button */}
            <button
              onClick={() => navigate('/')}
              className="group flex items-center gap-2 px-6 py-3 bg-[var(--color-brand-blue)] text-white rounded-lg font-medium hover:bg-[var(--color-brand-blue-light)] transition-all duration-300 shadow-md hover:shadow-lg min-w-[200px] justify-center"
            >
              <Home className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
              {t('404.home')}
            </button>

            {/* Browse Books Button */}
            <button
              onClick={() => navigate('/allbooks')}
              className="group flex items-center gap-2 px-6 py-3 bg-white text-[var(--color-brand-blue)] border-2 border-[var(--color-brand-blue)] rounded-lg font-medium hover:bg-[var(--color-brand-blue)] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg min-w-[200px] justify-center"
            >
              <Search className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
              {t('404.browseBooks')}
            </button>
          </motion.div>

          {/* Helpful Links */}
          <motion.div
            variants={itemVariants}
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <p className="text-fluid-small text-gray-500 mb-4">
              {t('404.helpfulLinks')}
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-fluid-small">
              <button
                onClick={() => navigate('/packs')}
                className="text-[var(--color-brand-blue)] hover:underline hover:text-[var(--color-brand-blue-light)] transition-colors"
              >
                {t('404.promotionalPacks')}
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate('/team')}
                className="text-[var(--color-brand-blue)] hover:underline hover:text-[var(--color-brand-blue-light)] transition-colors"
              >
                {t('404.team')}
              </button>
              <span className="text-gray-300">•</span>
              <button
                onClick={() => navigate('/service-client')}
                className="text-[var(--color-brand-blue)] hover:underline hover:text-[var(--color-brand-blue-light)] transition-colors"
              >
                {t('404.customerService')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound404;
