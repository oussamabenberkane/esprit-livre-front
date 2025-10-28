import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ExternalLink, ShoppingBag, ChevronDown, Home, MapPin, Truck, X, Search } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { getLanguageCode, getFullLanguageName } from '../data/booksData';


// Mock cart data
const initialCartData = [
  {
    id: 1,
    title: "l'incompris",
    author: "Saneh Sangsuk",
    price: 2600,
    quantity: 1,
    language: "French",
    image: "https://images.unsplash.com/photo-1661936901394-a993c79303c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBmaWN0aW9ufGVufDF8fHx8MTc2MDM0NjMzNnww&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 2,
    title: "Le hobbit",
    author: "J.R.R Tolkien",
    price: 2100,
    quantity: 1,
    language: "English",
    image: "https://images.unsplash.com/photo-1620647885779-064b00c4c139?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBub3ZlbHxlbnwxfHx8fDE3NjAzNDYzMzd8MA&ixlib=rb-4.1.0&q=80&w=400"
  }
];

// Algerian Wilaya data (sample)
const wilayaData = {
  "Alger": ["Alger Centre", "Bab El Oued", "Hussein Dey", "Kouba", "Dar El Beida"],
  "Oran": ["Oran Centre", "Es Senia", "Bir El Djir", "Arzew"],
  "Constantine": ["Constantine Centre", "El Khroub", "Ain Smara", "Didouche Mourad"],
  "Annaba": ["Annaba Centre", "El Bouni", "Berrahal", "Seraidi"],
  "Blida": ["Blida Centre", "Boufarik", "Bougara", "Larbaâ"],
  "Tizi Ouzou": ["Tizi Ouzou Centre", "Azazga", "Draa El Mizan", "Tigzirt"],
  "Sétif": ["Sétif Centre", "El Eulma", "Ain Arnat", "Bougaa"],
  "Batna": ["Batna Centre", "Barika", "Arris", "Merouana"],
};

// CartItem Component
function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 md:gap-4 py-4 border-b border-neutral-200 last:border-b-0"
    >
      {/* Book Image */}
      <div className="flex-shrink-0">
        <img
          src={item.image}
          alt={item.title}
          className="w-20 h-30 md:w-28 md:h-40 object-cover rounded"
        />
      </div>

      {/* Book Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex flex-row justify-between">
            <div className="flex flex-col gap-1">
              <h1 className="font-[550] text-fluid-h3 mb-fluid-small">{item.title}</h1>
            </div>
            {/* Price */}
            <div className="text-right ml-2 flex flex-col items-end gap-1">
              <div>
                <span className="text-black text-fluid-h3 font-bold">{item.price * item.quantity}</span>
                <span className="text-fluid-medium font-semibold text-gray-600 ml-1">DZD</span>
              </div>
              {item.language && (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                  <span className="hidden sm:inline">{getFullLanguageName(item.language)}</span>
                  <span className="inline sm:hidden">{getLanguageCode(item.language)}</span>
                </span>
              )}
            </div>
          </div>
          <h1 className="text-[#717192] text-fluid-medium font-[400] md:text-fluid-small mb-fluid-xs">{item.author}</h1>
          <button
            onClick={() => window.location.href = `/book/${item.id}`}
            className="flex items-center gap-1 text-[#626e82] text-xs hover:text-blue-600 transition-colors"
          >
            <span><h1 className="text-fluid-medium">{t('cart.bookDetails')}</h1></span>
            <ExternalLink className="w-4 h-3" />
          </button>
        </div>

        {/* Quantity Controls & Delete - Mobile/Desktop Layout */}
        <div className="flex items-center justify-end mt-2">
          <div className="flex items-center gap-fluid-small md:gap-fluid-2xl">
            {/* Quantity Selector */}
            <div className="flex items-center gap-1">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                className="w-5 h-5 md:w-6 md:h-6 border border-neutral-200 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-3 h-3" />
              </motion.button>

              <motion.div
                key={item.quantity}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-7 h-5 md:w-8 md:h-6 bg-[#f3f3f5] rounded flex items-center justify-center text-xs md:text-sm"
              >
                {item.quantity}
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                className="w-5 h-5 md:w-6 md:h-6 border border-neutral-200 rounded flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </motion.button>
            </div>

            {/* Delete Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onRemove(item.id)}
              className="flex items-center gap-1 text-[#eb3223] text-xs hover:text-red-700 transition-colors ml-2 md:ml-4"
            >
              <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
              <span><h1 className="text-fluid-small md:text-fluid-h3">{t('cart.delete')}</h1></span>
            </motion.button>
          </div>


        </div>
      </div>
    </motion.div>
  );
}

// CartSummary Component
function CartSummary({ subtotal, shipping, onProceed }) {
  const { t } = useTranslation();
  const total = subtotal + shipping;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-neutral-100 rounded-lg p-4 md:p-6 mt-6"
    >
      {/* Summary Items */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center text-[#353535]">
          <span className="text-fluid-body font-[500]">{t('cart.subtotal')}</span>
          <span className="text-fluid-body font-[600]">
            {subtotal} <span className="text-xs">DZD</span>
          </span>
        </div>

        <div className="flex justify-between items-center text-[#353535]">
          <span className="text-fluid-body font-[500]">{t('cart.shipping')}</span>
          <span className="text-fluid-body font-[600]">
            {shipping} <span className="text-xs">DZD</span>
          </span>
        </div>

        <div className="flex justify-between items-center text-[#353535] text-fluid-body font-[500]">
          <span>{t('cart.estimatedDelivery')}</span>
          <span className="text-emerald-600">{t('cart.deliveryDays')}</span>
        </div>

        <div className="border-t border-gray-300 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-[#353535] text-fluid-body font-semibold">{t('cart.total')}</span>
            <span className="text-fluid-body font-[600]">
              {total} <span className="text-xs">DZD</span>
            </span>
          </div>
        </div>
      </div>

      {/* Proceed Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onProceed}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg transition-colors"
      >
        {t('cart.proceedToCheckout')}
      </motion.button>
    </motion.div>
  );
}

// CheckoutForm Component
function CheckoutForm({ onSubmit }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    wilaya: '',
    city: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    email: '',
    phone: '',
    wilaya: '',
    city: ''
  });

  const [availableCities, setAvailableCities] = useState([]);
  const [shippingPreference, setShippingPreference] = useState("home"); // "home" or "pickup"
  const [homeAddress, setHomeAddress] = useState("");
  const [pickupProvider, setPickupProvider] = useState("");

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const [wilayaSearch, setWilayaSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const dropdownRefs = useRef({});
  const wilayaInputRef = useRef(null);
  const cityInputRef = useRef(null);

  const pickupProviders = ["Yalidine", "ZRexpress"];

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!openDropdown) return;
      const activeDropdownRef = dropdownRefs.current[openDropdown];
      if (activeDropdownRef && !activeDropdownRef.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  // Filter functions
  const getFilteredWilayas = () => {
    return Object.keys(wilayaData).filter(wilaya =>
      wilaya.toLowerCase().includes(wilayaSearch.toLowerCase())
    );
  };

  const getFilteredCities = () => {
    return availableCities.filter(city =>
      city.toLowerCase().includes(citySearch.toLowerCase())
    );
  };

  const handleWilayaSelect = (wilaya) => {
    setFormData({ ...formData, wilaya, city: '' });
    setAvailableCities(wilayaData[wilaya] || []);
    setWilayaSearch("");
    setOpenDropdown(null);
    // Clear wilaya validation error when selected
    setValidationErrors(prev => ({ ...prev, wilaya: '' }));
  };

  const handleCitySelect = (city) => {
    setFormData({ ...formData, city });
    setCitySearch("");
    setOpenDropdown(null);
    // Clear city validation error when selected
    setValidationErrors(prev => ({ ...prev, city: '' }));
  };

  const handleProviderSelect = (provider) => {
    setPickupProvider(provider);
    setOpenDropdown(null);
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (Algerian format: 10 digits starting with 0)
  const validatePhone = (phone) => {
    const phoneRegex = /^0[5-7][0-9]{8}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email });

    // Only validate if email is not empty
    if (email.trim() !== '' && !validateEmail(email)) {
      setValidationErrors(prev => ({ ...prev, email: t('cart.emailError') }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: '' }));
    }
  };

  const handlePhoneChange = (e) => {
    const phone = e.target.value;
    // Only allow digits and spaces
    const sanitized = phone.replace(/[^\d\s]/g, '');
    setFormData({ ...formData, phone: sanitized });

    if (phone && !validatePhone(sanitized)) {
      setValidationErrors(prev => ({
        ...prev,
        phone: t('cart.phoneError')
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation before submit
    // Email is optional - only validate if provided
    const isEmailValid = formData.email.trim() === '' || validateEmail(formData.email);
    const isPhoneValid = validatePhone(formData.phone);
    const isWilayaValid = formData.wilaya.trim() !== '';
    const isCityValid = formData.city.trim() !== '';

    // Reset validation errors
    let errors = {
      email: '',
      phone: '',
      wilaya: '',
      city: ''
    };

    if (formData.email.trim() !== '' && !isEmailValid) {
      errors.email = t('cart.emailError');
    }

    if (!isPhoneValid) {
      errors.phone = t('cart.phoneError');
    }

    if (!isWilayaValid) {
      errors.wilaya = 'Please enter this field';
    }

    if (!isCityValid) {
      errors.city = 'Please enter this field';
    }

    setValidationErrors(errors);

    // Only submit if all validations pass
    if (isEmailValid && isPhoneValid && isWilayaValid && isCityValid) {
      onSubmit(formData);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white border border-neutral-200 rounded-lg p-4 md:p-6 mt-8"
    >
      <h2 className="text-black text-fluid-h2 font-[550] text-center mt-fluid-md mb-6">
        {t('cart.formTitle')}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500]  mb-2">
            {t('cart.fullName')}
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-fluid-small"
            placeholder={t('cart.fullNamePlaceholder')}
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
            {t('cart.phone')}
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={handlePhoneChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-fluid-small ${validationErrors.phone
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-200 focus:ring-emerald-500'
              }`}
            placeholder={t('cart.phonePlaceholder')}
            maxLength="14"
          />
          {validationErrors.phone && (
            <p className="mt-1 text-fluid-xs text-red-500">{validationErrors.phone}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
            {t('cart.email')} <span className="text-gray-400 text-xs">({t('cart.optional') || 'Optionnel'})</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={handleEmailChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all text-fluid-small ${validationErrors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-200 focus:ring-emerald-500'
              }`}
            placeholder={t('cart.emailPlaceholder')}
          />
          {validationErrors.email && (
            <p className="mt-1 text-fluid-xs text-red-500">{validationErrors.email}</p>
          )}
        </div>



        {/* Wilaya */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
            {t('cart.wilaya')}
          </label>

          <div className="relative" ref={el => dropdownRefs.current['wilaya'] = el}>
            <div
              className={`flex items-center bg-white rounded-lg border-2 transition-all duration-200 ${
                validationErrors.wilaya
                  ? 'border-red-500'
                  : openDropdown === 'wilaya' ? 'border-emerald-500 shadow-md' : 'border-neutral-200 hover:border-neutral-300'
                }`}
            >
              <div
                className="flex items-center flex-1 min-w-0 h-11 px-2.5 sm:px-3 cursor-text"
                onClick={() => {
                  if (wilayaInputRef.current) {
                    wilayaInputRef.current.focus();
                  }
                  if (openDropdown !== 'wilaya') {
                    setOpenDropdown('wilaya');
                  }
                }}
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" />
                <input
                  ref={wilayaInputRef}
                  type="text"
                  value={wilayaSearch}
                  onChange={(e) => setWilayaSearch(e.target.value)}
                  onFocus={() => {
                    setOpenDropdown('wilaya');
                  }}
                  placeholder={formData.wilaya || t('cart.wilayaPlaceholder')}
                  className={`flex-1 min-w-0 bg-transparent border-0 outline-none text-fluid-small cursor-text ${formData.wilaya ? 'text-gray-700 placeholder-gray-700 font-medium' : 'text-gray-400 placeholder-gray-400'
                    }`}
                />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'wilaya' ? null : 'wilaya');
                }}
                className="h-11 px-2 sm:px-3 hover:bg-gray-100 rounded-r-lg transition-colors flex items-center justify-center flex-shrink-0"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transform transition-transform duration-200 ${openDropdown === 'wilaya' ? 'rotate-180' : ''
                    }`}
                />
              </button>
            </div>

            <AnimatePresence>
              {openDropdown === 'wilaya' && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden"
                >
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <span className="text-fluid-xs font-medium text-gray-600">
                        {getFilteredWilayas().length} {getFilteredWilayas().length === 1 ? 'résultat' : 'résultats'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {getFilteredWilayas().map((wilaya) => (
                        <button
                          type="button"
                          key={wilaya}
                          onClick={() => handleWilayaSelect(wilaya)}
                          className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-fluid-small hover:bg-emerald-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0 ${formData.wilaya === wilaya ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                            }`}
                        >
                          <div className={`w-3 h-3 border-2 rounded-full mr-2 sm:mr-3 flex-shrink-0 ${formData.wilaya === wilaya ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                            }`}></div>
                          <span className="font-medium truncate">{wilaya}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {validationErrors.wilaya && (
            <p className="mt-1 text-fluid-xs text-red-500">{validationErrors.wilaya}</p>
          )}
        </div>

        {/* City/Commune */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
            {t('cart.city')}
          </label>

          <div className="relative" ref={el => dropdownRefs.current['city'] = el}>
            <div
              className={`flex items-center bg-white rounded-lg border-2 transition-all duration-200 ${
                !formData.wilaya ? 'bg-gray-100 cursor-not-allowed' :
                validationErrors.city ? 'border-red-500' :
                openDropdown === 'city' ? 'border-emerald-500 shadow-md' : 'border-neutral-200 hover:border-neutral-300'
                }`}
            >
              <div
                className={`flex items-center flex-1 min-w-0 h-11 px-2.5 sm:px-3 ${formData.wilaya ? 'cursor-text' : 'cursor-not-allowed'}`}
                onClick={() => {
                  if (!formData.wilaya) return;
                  if (cityInputRef.current) {
                    cityInputRef.current.focus();
                  }
                  if (openDropdown !== 'city') {
                    setOpenDropdown('city');
                  }
                }}
              >
                <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 mr-1.5 sm:mr-2 flex-shrink-0" />
                <input
                  ref={cityInputRef}
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  onFocus={() => {
                    if (formData.wilaya) {
                      setOpenDropdown('city');
                    }
                  }}
                  disabled={!formData.wilaya}
                  placeholder={formData.city || t('cart.cityPlaceholder')}
                  className={`flex-1 min-w-0 bg-transparent border-0 outline-none text-fluid-small cursor-text disabled:cursor-not-allowed ${formData.city ? 'text-gray-700 placeholder-gray-700 font-medium' : 'text-gray-400 placeholder-gray-400'
                    }`}
                />
              </div>
              <button
                type="button"
                disabled={!formData.wilaya}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (formData.wilaya) {
                    setOpenDropdown(openDropdown === 'city' ? null : 'city');
                  }
                }}
                className={`h-11 px-2 sm:px-3 rounded-r-lg transition-colors flex items-center justify-center flex-shrink-0 ${formData.wilaya ? 'hover:bg-gray-100' : 'cursor-not-allowed'
                  }`}
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 transform transition-transform duration-200 ${openDropdown === 'city' ? 'rotate-180' : ''
                    }`}
                />
              </button>
            </div>

            <AnimatePresence>
              {openDropdown === 'city' && formData.wilaya && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden"
                >
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-50 border-b border-gray-200">
                      <span className="text-fluid-xs font-medium text-gray-600">
                        {getFilteredCities().length} {getFilteredCities().length === 1 ? 'résultat' : 'résultats'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setOpenDropdown(null)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="max-h-52 overflow-y-auto">
                      {getFilteredCities().length > 0 ? (
                        getFilteredCities().map((city) => (
                          <button
                            type="button"
                            key={city}
                            onClick={() => handleCitySelect(city)}
                            className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-fluid-small hover:bg-emerald-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0 ${formData.city === city ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                              }`}
                          >
                            <div className={`w-3 h-3 border-2 rounded-full mr-2 sm:mr-3 flex-shrink-0 ${formData.city === city ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                              }`}></div>
                            <span className="font-medium truncate">{city}</span>
                          </button>
                        ))
                      ) : (
                        <div className="px-3 sm:px-4 py-6 text-fluid-small text-gray-500 text-center">
                          Aucun résultat
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {validationErrors.city && (
            <p className="mt-1 text-fluid-xs text-red-500">{validationErrors.city}</p>
          )}
        </div>

        {/* Shipping Preference */}
        <div className="mt-6">
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-3">
            {t('cart.shippingMethod')}
          </label>

          <div className="space-y-3">
            {/* Home Delivery Option */}
            <div>
              <button
                type="button"
                onClick={() => setShippingPreference("home")}
                className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all ${shippingPreference === "home"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-neutral-200 bg-gray-50 hover:border-neutral-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${shippingPreference === "home" ? "bg-emerald-100" : "bg-gray-100"
                    }`}>
                    <Home className={`w-5 h-5 ${shippingPreference === "home" ? "text-emerald-600" : "text-gray-600"
                      }`} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className={`font-medium text-fluid-small ${shippingPreference === "home" ? "text-emerald-900" : "text-gray-800"
                      }`}>
                      {t('cart.homeDelivery')}
                    </h3>
                    <p className={`text-fluid-xs ${shippingPreference === "home" ? "text-emerald-600" : "text-gray-500"
                      }`}>
                      {t('cart.homeDeliveryDesc')}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingPreference === "home"
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                    }`}>
                    {shippingPreference === "home" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </button>

              {/* Home Address Input - Appears when Home Delivery is selected */}
              <AnimatePresence>
                {shippingPreference === "home" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 px-3 md:px-4">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                          <Home className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={homeAddress}
                          onChange={(e) => setHomeAddress(e.target.value)}
                          placeholder={t('cart.homeAddressPlaceholder')}
                          className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-fluid-small transition-all placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Pickup Point Option */}
            <div>
              <button
                type="button"
                onClick={() => setShippingPreference("pickup")}
                className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all ${shippingPreference === "pickup"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-neutral-200 bg-gray-50 hover:border-neutral-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${shippingPreference === "pickup" ? "bg-emerald-100" : "bg-gray-100"
                    }`}>
                    <MapPin className={`w-5 h-5 ${shippingPreference === "pickup" ? "text-emerald-600" : "text-gray-600"
                      }`} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className={`font-medium text-fluid-small ${shippingPreference === "pickup" ? "text-emerald-900" : "text-gray-800"
                      }`}>
                      {t('cart.pickupPoint')}
                    </h3>
                    <p className={`text-fluid-xs ${shippingPreference === "pickup" ? "text-emerald-600" : "text-gray-500"
                      }`}>
                      {t('cart.pickupPointDesc')}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingPreference === "pickup"
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                    }`}>
                    {shippingPreference === "pickup" && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </button>

              {/* Pickup Provider Select - Appears when Pickup Point is selected */}
              <AnimatePresence>
                {shippingPreference === "pickup" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="mt-3 px-3 md:px-4">
                      <div className="relative" ref={el => dropdownRefs.current['provider'] = el}>
                        <div className={`flex items-center bg-white rounded-lg border-2 transition-all duration-200 ${openDropdown === 'provider' ? 'border-emerald-500 shadow-md' : 'border-neutral-200 hover:border-emerald-400'
                          }`}>
                          <div
                            className="flex items-center flex-1 min-w-0 h-11 px-2.5 sm:px-3 cursor-pointer"
                            onClick={() => {
                              setOpenDropdown(openDropdown === 'provider' ? null : 'provider');
                            }}
                          >
                            <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 mr-1.5 sm:mr-2 flex-shrink-0" />
                            <span className={`text-fluid-small truncate ${pickupProvider ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                              {pickupProvider || t('cart.selectProvider')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === 'provider' ? null : 'provider');
                            }}
                            className="h-11 px-2 sm:px-3 hover:bg-gray-100 rounded-r-lg transition-colors flex items-center justify-center flex-shrink-0"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 transform transition-transform duration-200 ${openDropdown === 'provider' ? 'rotate-180' : ''
                                }`}
                            />
                          </button>
                        </div>

                        <AnimatePresence>
                          {openDropdown === 'provider' && (
                            <motion.div
                              initial={{ opacity: 0, y: -10, height: 0 }}
                              animate={{ opacity: 1, y: 0, height: 'auto' }}
                              exit={{ opacity: 0, y: -10, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden"
                            >
                              <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                <div className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-50 border-b border-gray-200">
                                  <span className="text-fluid-xs font-medium text-gray-600">
                                    {pickupProviders.length} {pickupProviders.length === 1 ? 'option' : 'options'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setOpenDropdown(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="max-h-52 overflow-y-auto">
                                  {pickupProviders.map((provider) => (
                                    <button
                                      type="button"
                                      key={provider}
                                      onClick={() => handleProviderSelect(provider)}
                                      className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-fluid-small hover:bg-emerald-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0 ${pickupProvider === provider ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'
                                        }`}
                                    >
                                      <div className={`w-3 h-3 border-2 rounded-full mr-2 sm:mr-3 flex-shrink-0 ${pickupProvider === provider ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                                        }`}></div>
                                      <span className="font-medium truncate">{provider}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg transition-colors mt-6"
        >
          {t('cart.finalizeOrder')}
        </motion.button>
      </form>
    </motion.div>
  );
}

// Main CartCheckoutPage Component
export default function CartCheckoutPage() {
  const { t } = useTranslation();
  const [cartItems, setCartItems] = useState(initialCartData);
  const [showCheckout, setShowCheckout] = useState(false);
  const navigate = useNavigate();

  // Scroll to top when page loads
  useScrollToTop();

  const shippingFee = 700;

  // Calculate subtotal
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Update quantity
  const handleUpdateQuantity = (itemId, newQuantity) => {
    setCartItems(cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    ));
  };

  // Remove item
  const handleRemoveItem = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  // Proceed to checkout
  const handleProceedToCheckout = () => {
    setShowCheckout(true);
    // Smooth scroll to checkout section
    setTimeout(() => {
      document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle final order submission
  const handleOrderSubmit = (formData) => {
    console.log('Order submitted:', { cartItems, formData, total: subtotal + shippingFee });
    alert('Commande finalisée avec succès! 🎉');
  };

  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="min-h-screen bg-white">
        {/* Navigation Bar */}
        <section className="w-full max-w-[100vw] overflow-x-hidden">
          <Navbar cartCount={cartItems.length} />
        </section>

        {/* Responsive spacing for navbar - taller on mobile due to two-line layout */}
        <div className="h-28 md:h-20"></div>

        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          {/* Back to Shopping Link */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/allbooks')}
            className="inline-flex items-center gap-2 text-black text-xs md:text-sm hover:text-emerald-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span><h1 className="text-fluid-h2 font-[500] ">{t('cart.continueShop')}</h1></span>
          </motion.button>

          {/* Cart Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-neutral-200 rounded-lg p-4 md:p-6 shadow-sm"
          >
            {/* Cart Header */}
            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-black" />
              <h1 className="text-black font-[500]">
                {cartItems.length === 1 ? t('cart.title', { count: cartItems.length }) : t('cart.title_plural', { count: cartItems.length })}
              </h1>
            </div>

            {/* Cart Items */}
            <AnimatePresence mode="popLayout">
              {cartItems.length > 0 ? (
                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onUpdateQuantity={handleUpdateQuantity}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 text-gray-500"
                >
                  {t('cart.empty')}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <CartSummary
                subtotal={subtotal}
                shipping={shippingFee}
                onProceed={handleProceedToCheckout}
              />
            )}
          </motion.div>

          {/* Checkout Form Section */}
          <div id="checkout-section">
            {showCheckout && (
              <CheckoutForm onSubmit={handleOrderSubmit} />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
