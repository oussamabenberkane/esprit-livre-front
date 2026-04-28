import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Mail, Phone, Clock, Send } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { trackContact } from '../services/pixel.service';
import { API_BASE_URL } from '../services/apiConfig';

const BRAND_BLUE = '#00417a';
const EASE = [0.22, 1, 0.36, 1];

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
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
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
        trackContact();
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
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative pt-36 md:pt-44 pb-12 md:pb-20 px-fluid-2xl overflow-hidden">
        {/* Subtle radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(60% 60% at 50% 40%, rgba(0,65,122,0.04) 0%, transparent 70%)',
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
            {t('customerService.label')}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: EASE }}
            className="text-fluid-hero font-bold leading-tight mb-5 bg-gradient-to-r from-[var(--color-brand-blue)] via-blue-600 to-[var(--color-brand-blue-light)] bg-clip-text text-transparent"
          >
            {t('customerService.title')}
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
            {t('customerService.subtitle')}
          </motion.p>
        </div>
      </section>

      {/* ── Contact Info Cards ── */}
      <section className="max-w-6xl mx-auto px-fluid-2xl pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              href: 'mailto:contact@espritlivre.com',
              icon: Mail,
              title: t('customerService.email'),
              value: 'contact@espritlivre.com',
              isLink: true,
              delay: 0.1,
            },
            {
              href: 'tel:0123456789',
              icon: Phone,
              title: t('customerService.phone'),
              value: '01 23 45 67 89',
              isLink: true,
              delay: 0.2,
            },
            {
              icon: Clock,
              title: t('customerService.hours'),
              value: t('customerService.hoursValue'),
              isLink: false,
              delay: 0.3,
            },
          ].map((card) => {
            const Icon = card.icon;
            const inner = (
              <>
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,65,122,0.06)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: BRAND_BLUE }} />
                </div>
                <h3 className="text-fluid-body font-semibold mb-2" style={{ color: BRAND_BLUE }}>
                  {card.title}
                </h3>
                <p className={`text-fluid-small ${card.isLink ? 'text-blue-700' : 'text-gray-500'}`}>
                  {card.value}
                </p>
              </>
            );

            const cardClasses = 'rounded-xl p-6 text-center transition-all duration-300 border border-gray-100';

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: card.delay, ease: EASE }}
              >
                {card.isLink ? (
                  <a
                    href={card.href}
                    className={`block bg-white ${cardClasses} hover:shadow-xl hover:-translate-y-1`}
                    style={{
                      boxShadow: '0 4px 20px -4px rgba(0,30,70,0.08)',
                    }}
                  >
                    {inner}
                  </a>
                ) : (
                  <div
                    className={`bg-white ${cardClasses}`}
                    style={{
                      boxShadow: '0 4px 20px -4px rgba(0,30,70,0.08)',
                    }}
                  >
                    {inner}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── FAQ + Form divider section ── */}
      <section className="bg-gradient-to-br from-gray-50 via-white to-blue-50/30 py-16 md:py-20 px-fluid-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">

            {/* FAQ Section — wider column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, ease: EASE }}
              className="lg:col-span-3"
            >
              <h2
                className="text-fluid-h1to2 font-bold mb-8"
                style={{ color: BRAND_BLUE }}
              >
                {t('customerService.faqTitle')}
              </h2>

              <div className="space-y-8">
                {faqData.map((cat, categoryIndex) => (
                  <motion.div
                    key={categoryIndex}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: categoryIndex * 0.06, ease: EASE }}
                  >
                    <h3
                      className="text-fluid-h3 font-bold mb-4"
                      style={{ color: BRAND_BLUE }}
                    >
                      {cat.category}
                    </h3>
                    <div className="space-y-3">
                      {cat.questions.map((faq, questionIndex) => {
                        const globalIndex = `${categoryIndex}-${questionIndex}`;
                        const isOpen = openFaqIndex === globalIndex;

                        return (
                          <div
                            key={globalIndex}
                            className="rounded-xl overflow-hidden border transition-all duration-300 bg-white"
                            style={{
                              borderColor: isOpen ? 'rgba(0,65,122,0.15)' : 'rgba(0,0,0,0.06)',
                              boxShadow: isOpen
                                ? '0 8px 24px -6px rgba(0,30,70,0.1)'
                                : '0 2px 8px -2px rgba(0,0,0,0.04)',
                            }}
                          >
                            <button
                              onClick={() => toggleFaq(globalIndex)}
                              className="w-full px-5 py-4 text-left flex justify-between items-center hover:bg-gray-50/60 transition-colors"
                            >
                              <span className="text-fluid-body font-medium text-gray-800 pr-4">
                                {faq.question}
                              </span>
                              <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ChevronDown
                                  className="w-5 h-5 flex-shrink-0 transition-colors duration-200"
                                  style={{ color: isOpen ? BRAND_BLUE : '#9ca3af' }}
                                />
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
                                  <div className="px-5 pb-4 text-fluid-small text-gray-500 leading-relaxed">
                                    {faq.answer}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form — narrower column */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: 0.15, ease: EASE }}
              className="lg:col-span-2"
            >
              <h2
                className="text-fluid-h1to2 font-bold mb-8"
                style={{ color: BRAND_BLUE }}
              >
                {t('customerService.contactTitle')}
              </h2>

              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-4 xs:p-6 md:p-8 border border-gray-100"
                style={{
                  boxShadow: '0 8px 30px -8px rgba(0,30,70,0.08)',
                }}
              >
                <div className="space-y-4 xs:space-y-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-[0.875rem] xs:text-fluid-body font-medium text-gray-700 mb-1.5 xs:mb-2"
                    >
                      {t('customerService.formName')}
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 xs:px-4 xs:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-[0.875rem] xs:text-fluid-small bg-white outline-none"
                      placeholder={t('customerService.formNamePlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-[0.875rem] xs:text-fluid-body font-medium text-gray-700 mb-1.5 xs:mb-2"
                    >
                      {t('customerService.formEmail')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2.5 xs:px-4 xs:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-[0.875rem] xs:text-fluid-small bg-white outline-none"
                      placeholder={t('customerService.formEmailPlaceholder')}
                      required
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-[0.875rem] xs:text-fluid-body font-medium text-gray-700 mb-1.5 xs:mb-2"
                    >
                      {t('customerService.formSubject')}
                    </label>
                    <div className="relative" ref={dropdownRef}>
                      {/* Custom Dropdown Trigger */}
                      <button
                        type="button"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className={`w-full px-3 py-2.5 pr-9 xs:px-4 xs:py-3 xs:pr-10 border rounded-lg transition-all text-[0.875rem] xs:text-fluid-small bg-white text-left outline-none ${
                          isDropdownOpen
                            ? 'border-blue-500 ring-2 ring-blue-500'
                            : 'border-gray-200 hover:border-gray-300'
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
                        <ChevronDown className="w-4 h-4 xs:w-5 xs:h-5 text-gray-400" />
                      </motion.div>

                      {/* Custom Dropdown Menu */}
                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg overflow-hidden"
                            style={{
                              boxShadow: '0 12px 28px -6px rgba(0,30,70,0.12)',
                            }}
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
                    <label
                      htmlFor="message"
                      className="block text-[0.875rem] xs:text-fluid-body font-medium text-gray-700 mb-1.5 xs:mb-2"
                    >
                      {t('customerService.formMessage')}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows="6"
                      className="w-full px-3 py-2.5 xs:px-4 xs:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-[0.875rem] xs:text-fluid-small resize-none bg-white outline-none"
                      placeholder={t('customerService.formMessagePlaceholder')}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={formStatus === 'loading'}
                    className="w-full text-white font-semibold py-2.5 px-4 xs:py-3 xs:px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 xs:gap-2 text-[0.813rem] xs:text-fluid-body disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-0.5"
                    style={{
                      backgroundColor: BRAND_BLUE,
                      boxShadow: '0 8px 20px -6px rgba(0,65,122,0.4)',
                    }}
                    onMouseEnter={(e) => {
                      if (formStatus !== 'loading') {
                        e.target.style.backgroundColor = '#003366';
                        e.target.style.boxShadow = '0 12px 24px -6px rgba(0,65,122,0.5)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = BRAND_BLUE;
                      e.target.style.boxShadow = '0 8px 20px -6px rgba(0,65,122,0.4)';
                    }}
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
              <div
                className="mt-4 xs:mt-6 rounded-lg p-3 xs:p-4 border border-blue-100"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,65,122,0.03) 0%, rgba(0,82,163,0.06) 100%)',
                }}
              >
                <p className="text-[0.875rem] xs:text-fluid-small text-gray-600">
                  <span className="font-semibold" style={{ color: BRAND_BLUE }}>
                    {t('customerService.responseTime')}
                  </span>{' '}
                  {t('customerService.responseTimeValue')}
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
