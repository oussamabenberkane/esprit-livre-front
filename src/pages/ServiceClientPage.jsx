import { useState } from 'react';
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

  const faqData = [
    {
      category: 'Commandes',
      questions: [
        {
          question: 'Comment passer une commande ?',
          answer: 'Pour passer une commande, parcourez notre catalogue, ajoutez les livres à votre panier, puis cliquez sur l\'icône panier pour procéder au paiement. Suivez les étapes pour finaliser votre achat.'
        },
        {
          question: 'Puis-je modifier ou annuler ma commande ?',
          answer: 'Vous pouvez modifier ou annuler votre commande dans les 24 heures suivant sa validation. Contactez-nous rapidement par email ou téléphone avec votre numéro de commande.'
        },
        {
          question: 'Comment suivre ma commande ?',
          answer: 'Connectez-vous à votre compte et accédez à la page "Historique de commandes". Dans la section "Commandes en cours", vous pouvez suivre le statut de votre commande en temps réel.'
        }
      ]
    },
    {
      category: 'Livraison',
      questions: [
        {
          question: 'Quels sont les délais de livraison ?',
          answer: 'Les délais de livraison varient entre 2 à 5 jours ouvrables.'
        },
        {
          question: 'Quels sont les frais de livraison ?',
          answer: 'La livraison est gratuite pour toute commande supérieure à 7000DA. En dessous, les frais de port sont de 400DA.'
        }
      ]
    },
    {
      category: 'Retours & Remboursements',
      questions: [
        {
          question: 'Quelle est votre politique de retour ?',
          answer: 'Vous disposez de 3 jours après réception pour retourner un article en parfait état. Les frais de retour sont à votre charge sauf en cas de produit défectueux.'
        },
        {
          question: 'Comment effectuer un retour ?',
          answer: 'Contactez notre service client pour obtenir une autorisation de retour. Renvoyez l\'article dans son emballage d\'origine avec la facture. Le remboursement intervient sous 2 jours après réception.'
        },
        {
          question: 'Puis-je échanger un livre ?',
          answer: 'Oui, les échanges sont possibles dans les mêmes conditions que les retours. Précisez le livre souhaité en échange lors de votre demande.'
        }
      ]
    },
    {
      category: 'Compte & Paiement',
      questions: [
        {
          question: 'Comment créer un compte ?',
          answer: 'Cliquez sur l\'icône utilisateur en haut de la page et suivez les instructions pour créer votre compte. Vous bénéficierez d\'un suivi de commandes et d\'offres exclusives.'
        },
        {
          question: 'Quels sont les avantages d\'avoir un compte ?',
          answer: 'Avec un compte, vous pouvez consulter l\'historique de vos commandes et suivre leur statut en temps réel, ajouter des livres à vos favoris, et bénéficier de réductions exclusives réservées à nos membres.'
        },
        {
          question: 'Quels moyens de paiement acceptez-vous ?',
          answer: 'Nous acceptons les cartes CIB et el-dhahabia.'
        }
      ]
    },
    {
      category: 'Produits',
      questions: [
        {
          question: 'Les livres sont-ils neufs ?',
          answer: 'Tous nos livres sont neufs et proviennent directement des éditeurs ou distributeurs officiels. Nous garantissons la qualité de nos produits.'
        },
        {
          question: 'Proposez-vous des livres numériques ?',
          answer: 'Actuellement, nous nous concentrons sur les livres physiques. Les livres numériques seront bientôt disponibles sur notre plateforme.'
        },
        {
          question: 'Comment fonctionnent les précommandes ?',
          answer: 'Les précommandes vous permettent de réserver un livre avant sa sortie. Vous ne serez débité qu\'à l\'expédition, et vous recevrez le livre dès sa disponibilité.'
        }
      ]
    }
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setFormStatus('error');
      setTimeout(() => setFormStatus(''), 3000);
      return;
    }

    // Simulate form submission
    console.log('Form submitted:', formData);
    setFormStatus('success');

    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });

    // Clear success message after 5 seconds
    setTimeout(() => setFormStatus(''), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-32 pb-12 px-fluid-2xl">
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

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-fluid-body font-medium text-gray-700 mb-2">
                    {t('customerService.formName')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-fluid-small"
                    placeholder={t('customerService.formNamePlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-fluid-body font-medium text-gray-700 mb-2">
                    {t('customerService.formEmail')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-fluid-small"
                    placeholder={t('customerService.formEmailPlaceholder')}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-fluid-body font-medium text-gray-700 mb-2">
                    {t('customerService.formSubject')}
                  </label>
                  <div className="relative">
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-fluid-small bg-white appearance-none"
                      required
                    >
                      <option value="">{t('customerService.formSubjectPlaceholder')}</option>
                      <option value="commande">{t('customerService.formSubjectOrder')}</option>
                      <option value="livraison">{t('customerService.formSubjectDelivery')}</option>
                      <option value="retour">{t('customerService.formSubjectReturn')}</option>
                      <option value="produit">{t('customerService.formSubjectProduct')}</option>
                      <option value="compte">{t('customerService.formSubjectAccount')}</option>
                      <option value="autre">{t('customerService.formSubjectOther')}</option>
                    </select>

                    {/* Custom dropdown arrow */}
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-fluid-body font-medium text-gray-700 mb-2">
                    {t('customerService.formMessage')}
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-fluid-small resize-none"
                    placeholder={t('customerService.formMessagePlaceholder')}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-800 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-fluid-body"
                >
                  <Send className="w-5 h-5" />
                  {t('customerService.formSubmit')}
                </button>

                {/* Status Messages */}
                <AnimatePresence>
                  {formStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-fluid-small"
                    >
                      {t('customerService.formSuccess')}
                    </motion.div>
                  )}
                  {formStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-fluid-small"
                    >
                      {t('customerService.formError')}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </form>

            {/* Response Time Notice */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-fluid-small text-blue-900">
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
