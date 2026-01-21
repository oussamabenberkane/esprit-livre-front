import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail, Phone, Clock, Send } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

export default function ServiceClientPage() {
  const { t } = useTranslation();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formStatus, setFormStatus] = useState(''); // 'success' or 'error'
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Build FAQ data from i18n
  const faqData = [
    {
      category: t('customerService.faq.orders.category'),
      category: t('customerService.faq.orders.category'),
      questions: [
        {
          question: t('customerService.faq.orders.q1.question'),
          answer: t('customerService.faq.orders.q1.answer')
        },
        {
          question: t('customerService.faq.orders.q2.question'),
          answer: t('customerService.faq.orders.q2.answer')
        },
        {
          question: t('customerService.faq.orders.q3.question'),
          answer: t('customerService.faq.orders.q3.answer')
        }
      ]
    },
    {
      category: t('customerService.faq.delivery.category'),
      category: t('customerService.faq.delivery.category'),
      questions: [
        {
          question: t('customerService.faq.delivery.q1.question'),
          answer: t('customerService.faq.delivery.q1.answer')
        },
        {
          question: t('customerService.faq.delivery.q2.question'),
          answer: t('customerService.faq.delivery.q2.answer')
        }
      ]
    },
    {
      category: t('customerService.faq.returns.category'),
      category: t('customerService.faq.returns.category'),
      questions: [
        {
          question: t('customerService.faq.returns.q1.question'),
          answer: t('customerService.faq.returns.q1.answer')
        },
        {
          question: t('customerService.faq.returns.q2.question'),
          answer: t('customerService.faq.returns.q2.answer')
        },
        {
          question: t('customerService.faq.returns.q3.question'),
          answer: t('customerService.faq.returns.q3.answer')
        }
      ]
    },
    {
      category: t('customerService.faq.account.category'),
      category: t('customerService.faq.account.category'),
      questions: [
        {
          question: t('customerService.faq.account.q1.question'),
          answer: t('customerService.faq.account.q1.answer')
        },
        {
          question: t('customerService.faq.account.q2.question'),
          answer: t('customerService.faq.account.q2.answer')
        },
        {
          question: t('customerService.faq.account.q3.question'),
          answer: t('customerService.faq.account.q3.answer')
        }
      ]
    },
    {
      category: t('customerService.faq.products.category'),
      category: t('customerService.faq.products.category'),
      questions: [
        {
          question: t('customerService.faq.products.q1.question'),
          answer: t('customerService.faq.products.q1.answer')
        },
        {
          question: t('customerService.faq.products.q2.question'),
          answer: t('customerService.faq.products.q2.answer')
        },
        {
          question: t('customerService.faq.products.q3.question'),
          answer: t('customerService.faq.products.q3.answer')
        }
      ]
    }
  ];

  // Subject options for custom dropdown
  const subjectOptions = [
    { value: '', label: t('customerService.formSubjectPlaceholder') },
    { value: 'commande', label: t('customerService.formSubjectOrder') },
    { value: 'livraison', label: t('customerService.formSubjectDelivery') },
    { value: 'retour', label: t('customerService.formSubjectReturn') },
    { value: 'produit', label: t('customerService.formSubjectProduct') },
    { value: 'compte', label: t('customerService.formSubjectAccount') },
    { value: 'autre', label: t('customerService.formSubjectOther') }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectSelect = (value) => {
    setFormData(prev => ({ ...prev, subject: value }));
    setIsDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormStatus('error');
      setTimeout(() => setFormStatus(''), 3000);
      return;
    }

    // Set loading state
    setFormStatus('loading');

    try {
      const response = await fetch('http://localhost:8080/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', response.status);
        setFormStatus('error');
        setTimeout(() => setFormStatus(''), 3000);
        return;
      }

      const data = await response.json();

      if (response.ok && data.success) {
        setFormStatus('success');
        // Reset form on success
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsDropdownOpen(false);
        // Clear success message after 5 seconds
        setTimeout(() => setFormStatus(''), 5000);
      } else {
        setFormStatus('error');
        setTimeout(() => setFormStatus(''), 3000);
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setFormStatus('error');
      setTimeout(() => setFormStatus(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      {/* Hero Section - Extra padding on mobile for navbar */}
      <div className="pt-36 md:pt-32 pb-12 px-fluid-2xl">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-fluid-hero font-bold text-gray-900 mb-4"
          >
            {t('customerService.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-fluid-h3 text-gray-600 max-w-2xl mx-auto"
          >
            {t('customerService.subtitle')}
          </motion.p>
        </div>
      </div>

      {/* Contact Info Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="max-w-6xl mx-auto px-fluid-2xl pb-16"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="mailto:contact@espritlivre.fr"
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <Mail className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:text-blue-700 transition-colors" />
            <h3 className="text-fluid-body font-semibold text-gray-900 mb-2">{t('customerService.email')}</h3>
            <p className="text-fluid-small text-blue-600 group-hover:text-blue-800 transition-colors">
              contact@espritlivre.fr
            </p>
          </a>
          <a
            href="tel:0123456789"
            className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
          >
            <Phone className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:text-blue-700 transition-colors" />
            <h3 className="text-fluid-body font-semibold text-gray-900 mb-2">{t('customerService.phone')}</h3>
            <p className="text-fluid-small text-blue-600 group-hover:text-blue-800 transition-colors">
              01 23 45 67 89
            </p>
          </a>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h3 className="text-fluid-body font-semibold text-gray-900 mb-2">{t('customerService.hours')}</h3>
            <p className="text-fluid-small text-gray-600">{t('customerService.hoursValue')}</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content: FAQ + Contact Form */}
      <div className="max-w-7xl mx-auto px-fluid-2xl pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h2 className="text-fluid-h2 font-bold text-gray-900 mb-6">
              {t('customerService.faqTitle')}
            </h2>

            <div className="space-y-6">
              {faqData.map((category, categoryIndex) => (
                <div key={category.category}>
                  <h3 className="text-fluid-h3 font-semibold text-blue-800 mb-3">
                    {category.category}
                  </h3>
                  <div className="space-y-3">
                    {category.questions.map((faq, questionIndex) => {
                      const globalIndex = `${categoryIndex}-${questionIndex}`;
                      const isOpen = openFaqIndex === globalIndex;

                      return (
                        <div
                          key={globalIndex}
                          className="bg-white rounded-lg shadow-sm overflow-hidden"
                        >
                          <button
                            onClick={() => toggleFaq(globalIndex)}
                            className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-fluid-body font-medium text-gray-900 pr-4">
                              {faq.question}
                            </span>
                            <motion.div
                              animate={{ rotate: isOpen ? 180 : 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                            </motion.div>
                          </button>

                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <div className="px-6 pb-4 text-fluid-small text-gray-600 leading-relaxed">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-fluid-h2 font-bold text-gray-900 mb-6">
              {t('customerService.contactTitle')}
            </h2>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-4 xs:p-6 md:p-8">
              <div className="space-y-4 xs:space-y-5">
                <div>
                  <label htmlFor="name" className="block text-[0.875rem] xs:text-fluid-body font-medium text-gray-700 mb-1.5 xs:mb-2">
                    {t('customerService.formName')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 xs:px-4 xs:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-[0.875rem] xs:text-fluid-small"
                    placeholder={t('customerService.formNamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-[0.875rem] xs:text-fluid-body font-medium text-gray-700 mb-1.5 xs:mb-2">
                    {t('customerService.formEmail')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 xs:px-4 xs:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-[0.875rem] xs:text-fluid-small"
                    placeholder={t('customerService.formEmailPlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-[0.875rem] xs:text-fluid-body font-medium text-gray-700 mb-1.5 xs:mb-2">
                    {t('customerService.formSubject')}
                  </label>
                  <div className="relative" ref={dropdownRef}>
                    {/* Custom Dropdown Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`w-full px-3 py-2.5 pr-9 xs:px-4 xs:py-3 xs:pr-10 border rounded-lg transition-all text-[0.875rem] xs:text-fluid-small bg-white text-left ${
                        isDropdownOpen
                          ? 'border-blue-500 ring-2 ring-blue-500'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${!formData.subject ? 'text-gray-400' : 'text-gray-900'}`}
                    >
                      {formData.subject
                        ? subjectOptions.find(opt => opt.value === formData.subject)?.label
                        : t('customerService.formSubjectPlaceholder')}
                    </button>

                    {/* Dropdown Arrow */}
                    <motion.div
                      animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-2.5 xs:right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      <ChevronDown className="w-4 h-4 xs:w-5 xs:h-5 text-gray-500" />
                    </motion.div>

                    {/* Custom Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden"
                        >
                          <div className="max-h-60 overflow-y-auto">
                            {subjectOptions.map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSubjectSelect(option.value)}
                                className={`w-full px-3 py-2.5 xs:px-4 xs:py-3 text-left text-[0.875rem] xs:text-fluid-small transition-colors ${
                                  formData.subject === option.value
                                    ? 'bg-blue-50 text-blue-800 font-medium'
                                    : option.value === ''
                                    ? 'text-gray-400 hover:bg-gray-50'
                                    : 'text-gray-900 hover:bg-gray-50'
                                }`}
                                disabled={option.value === ''}
                              >
                                {option.label}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Hidden input for form validation */}
                    <input
                      type="hidden"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-[0.875rem] xs:text-fluid-body font-medium text-gray-700 mb-1.5 xs:mb-2">
                    {t('customerService.formMessage')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-3 py-2.5 xs:px-4 xs:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-[0.875rem] xs:text-fluid-small resize-none"
                    placeholder={t('customerService.formMessagePlaceholder')}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={formStatus === 'loading'}
                  className="w-full bg-blue-800 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-4 xs:py-3 xs:px-6 rounded-lg transition-colors flex items-center justify-center gap-1.5 xs:gap-2 text-[0.813rem] xs:text-fluid-body"
                >
                  {formStatus === 'loading' ? (
                    <>
                      <div className="w-4 h-4 xs:w-5 xs:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-[0.813rem] xs:text-base">{t('customerService.formSubmitting') || 'Envoi en cours...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 xs:w-5 xs:h-5" />
                      <span className="text-[0.813rem] xs:text-base">{t('customerService.formSubmit')}</span>
                    </>
                  )}
                </button>

                {/* Status Messages */}
                <AnimatePresence>
                  {formStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-green-50 border border-green-200 text-green-800 px-3 py-2.5 xs:px-4 xs:py-3 rounded-lg text-[0.875rem] xs:text-fluid-small"
                    >
                      {t('customerService.formSuccess')}
                    </motion.div>
                  )}
                  {formStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-50 border border-red-200 text-red-800 px-3 py-2.5 xs:px-4 xs:py-3 rounded-lg text-[0.875rem] xs:text-fluid-small"
                    >
                      {t('customerService.formError')}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Response Time Notice */}
            <div className="mt-4 xs:mt-6 bg-blue-50 border border-blue-200 rounded-lg p-3 xs:p-4">
              <p className="text-[0.875rem] xs:text-fluid-small text-blue-900">
                <span className="font-semibold">{t('customerService.responseTime')}</span> {t('customerService.responseTimeValue')}
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
