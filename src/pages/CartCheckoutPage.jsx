import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ExternalLink, ShoppingBag, ChevronDown, Home, MapPin, Truck, X, Search, Package, LogIn } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import PackBooksPopup from '../components/common/PackBooksPopup';
import RelayPointSelect from '../components/common/RelayPointSelect';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { getLanguageCode, getFullLanguageName } from '../data/booksData';
import { useCart } from '../contexts/CartContext';
import { getBookCoverUrl } from '../utils/imageUtils';
import { buildOrderPayload, createOrder, calculateDeliveryFee } from '../services/order.service';
import { getUserProfile } from '../services/user.service';
import { isAuthenticated, saveRedirectUrl } from '../services/authService';
import { PROVIDER_API_TO_DISPLAY, PROVIDER_DISPLAY_TO_API } from '../constants/orderEnums';
import wilayaData from '../utils/wilayaData';

// Order Tracking Prompt Popup Component
function OrderTrackingPrompt({ isOpen, onSignIn, onLater }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with blur and blue-grey tint */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40"
        onClick={onLater}
      />

      {/* Popup Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onLater}>
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in-scale"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icon and Title */}
          <div className="flex items-start gap-3 px-6 pt-6 pb-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-gray-900 font-semibold text-base sm:text-lg">
                {t('cart.orderTrackingPromptTitle')}
              </h3>
            </div>
          </div>

          {/* Message */}
          <p className="text-gray-600 text-sm sm:text-base px-6 pb-6 leading-relaxed">
            {t('cart.orderTrackingPromptMessage')}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 px-6 pb-6">
            <button
              onClick={onSignIn}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              {t('cart.signInButton')}
            </button>
            <button
              onClick={onLater}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg transition-colors font-medium text-sm sm:text-base"
            >
              {t('cart.laterButton')}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in-scale {
          animation: fadeInScale 0.2s ease-out;
        }
      `}</style>
    </>
  );
}

// Skeleton Loader Component
const SkeletonLoader = () => (
  <div className="animate-pulse bg-gray-200 rounded h-11 w-full"></div>
);

// CartItem Component
function CartItem({ item, onUpdateQuantity, onRemove }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
          src={getBookCoverUrl(item.id)}
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
          <h1 className="text-[#717192] text-fluid-medium font-[400] md:text-fluid-small mb-fluid-xs">{item.author?.name || item.author}</h1>
          <button
            onClick={() => navigate(`/books/${item.id}`)}
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

// PackItem Component - Similar to CartItem but for packs
function PackItem({ item, onUpdateQuantity, onRemove, onViewBooks }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 md:gap-4 py-4 border-b border-neutral-200 last:border-b-0"
    >
      {/* Pack Image - Show first book's cover with pack indicator */}
      <div className="flex-shrink-0 relative">
        <img
          src={item.books && item.books[0] ? item.books[0].coverImage : 'https://via.placeholder.com/120x180'}
          alt={item.title}
          className="w-20 h-30 md:w-28 md:h-40 object-cover rounded"
        />
        {/* Pack Badge Overlay */}
        <div className="absolute top-1 right-1 bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 shadow-md">
          <Package className="w-3 h-3" />
          <span>Pack</span>
        </div>
      </div>

      {/* Pack Details */}
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
            </div>
          </div>
          <h1 className="text-[#717192] text-fluid-medium font-[400] md:text-fluid-small mb-fluid-xs">
            {item.books?.length || 0} {t('cart.books')}
          </h1>
          <button
            onClick={() => onViewBooks(item)}
            className="flex items-center gap-1 text-[#626e82] text-xs hover:text-blue-600 transition-colors"
          >
            <span><h1 className="text-fluid-medium">{t('cart.viewPackBooks')}</h1></span>
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
function CartSummary({ subtotal, onProceed }) {
  const { t } = useTranslation();

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

        <div className="flex justify-between items-center text-[#353535] text-fluid-body font-[500]">
          <span>{t('cart.estimatedDelivery')}</span>
          <span className="text-emerald-600">{t('cart.deliveryDays')}</span>
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
function CheckoutForm({ onSubmit, isSubmitting = false, cartBooks = [], cartPacks = [], subtotal = 0, fixedShippingFee = 700 }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
    city: '',
    shipping: '',
    provider: '',
    relayPoint: ''
  });

  const [availableCities, setAvailableCities] = useState([]);
  const [shippingPreference, setShippingPreference] = useState("home"); // "home" or "pickup"
  const [homeAddress, setHomeAddress] = useState("");
  const [pickupProvider, setPickupProvider] = useState("ZRexpress"); // Default to ZR Express (always required)

  // Relay point state
  const [stopDeskId, setStopDeskId] = useState(null);

  // Shipping fee calculation state
  const [calculatedFee, setCalculatedFee] = useState(null);
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);

  // Profile loading state
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isUserAuthenticated, setIsUserAuthenticated] = useState(false);

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const [wilayaSearch, setWilayaSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");
  const dropdownRefs = useRef({});
  const wilayaInputRef = useRef(null);
  const cityInputRef = useRef(null);

  const pickupProviders = ["Yalidine", "ZRexpress"];

  // Load profile data on mount if user is authenticated
  useEffect(() => {
    const loadProfileData = async () => {
      const authenticated = isAuthenticated();
      setIsUserAuthenticated(authenticated);

      // Only fetch profile if authenticated
      if (!authenticated) return;

      try {
        setIsLoadingProfile(true);
        const profile = await getUserProfile();

        // Pre-populate form fields
        const fullName = `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
        setFormData({
          fullName: fullName,
          email: profile.email || '',
          phone: profile.phone || '',
          wilaya: profile.wilaya || '',
          city: profile.city || ''
        });

        // Pre-populate shipping preferences
        if (profile.defaultShippingMethod === 'HOME_DELIVERY') {
          setShippingPreference('home');
          setHomeAddress(profile.streetAddress || '');
          // Home delivery forces ZRexpress
          setPickupProvider('ZRexpress');
        } else if (profile.defaultShippingMethod === 'SHIPPING_PROVIDER') {
          setShippingPreference('pickup');
          // For pickup, set provider from profile or default to ZRexpress
          if (profile.defaultShippingProvider) {
            const displayProvider = PROVIDER_API_TO_DISPLAY[profile.defaultShippingProvider];
            setPickupProvider(displayProvider || 'ZRexpress');
          }
        } else {
          // No shipping method in profile - set provider from profile or default
          if (profile.defaultShippingProvider) {
            const displayProvider = PROVIDER_API_TO_DISPLAY[profile.defaultShippingProvider];
            setPickupProvider(displayProvider || 'ZRexpress');
          }
        }

        // Set available cities based on wilaya
        if (profile.wilaya && wilayaData[profile.wilaya]) {
          setAvailableCities(wilayaData[profile.wilaya]);
        }

      } catch (error) {
        console.error('Failed to load profile data:', error);
        // Silently fail - show empty form
      } finally {
        setIsLoadingProfile(false);
      }
    };

    loadProfileData();
  }, []);

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

  // Reactive shipping fee calculation
  useEffect(() => {
    // Prerequisites: wilaya, city, provider, and at least one cart item
    if (!formData.wilaya || !formData.city || !pickupProvider || (cartBooks.length === 0 && cartPacks.length === 0)) {
      setCalculatedFee(null);
      return;
    }

    setIsCalculatingFee(true);

    const timer = setTimeout(async () => {
      try {
        const result = await calculateDeliveryFee({
          shippingProvider: PROVIDER_DISPLAY_TO_API[pickupProvider],
          wilaya: formData.wilaya,
          city: formData.city,
          isStopDesk: shippingPreference === 'pickup',
          cartBooks,
          cartPacks,
        });

        setCalculatedFee(result.success ? result.fee : fixedShippingFee);
      } catch {
        setCalculatedFee(fixedShippingFee);
      } finally {
        setIsCalculatingFee(false);
      }
    }, 600);

    return () => {
      clearTimeout(timer);
      setIsCalculatingFee(false);
    };
  }, [formData.wilaya, formData.city, pickupProvider, shippingPreference, cartBooks, cartPacks, fixedShippingFee]);

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
    // Clear relay point when wilaya changes
    setStopDeskId(null);
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
    // Clear provider validation error when selected
    setValidationErrors(prev => ({ ...prev, provider: '' }));
    // Clear relay point when provider changes
    setStopDeskId(null);
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

    // Real-time validation: show error while typing if non-empty and invalid
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

    // Provider is always required
    const isProviderValid = pickupProvider.trim() !== '';

    // Shipping method validation
    const isHomeAddressValid = shippingPreference === 'home' ? homeAddress.trim() !== '' : true;
    // Relay point is required only for pickup shipping method
    const isRelayPointValid = shippingPreference === 'pickup' ? stopDeskId !== null : true;

    // Reset validation errors
    let errors = {
      email: '',
      phone: '',
      wilaya: '',
      city: '',
      shipping: '',
      provider: '',
      relayPoint: ''
    };

    if (formData.email.trim() !== '' && !isEmailValid) {
      errors.email = t('cart.emailError');
    }

    if (!isPhoneValid) {
      errors.phone = t('cart.phoneError');
    }

    if (!isWilayaValid) {
      errors.wilaya = t('cart.fieldRequired');
    }

    if (!isCityValid) {
      errors.city = t('cart.fieldRequired');
    }

    // Provider is always required
    if (!isProviderValid) {
      errors.provider = t('cart.providerRequired');
    }

    // Validate shipping address for home delivery
    if (shippingPreference === 'home' && !isHomeAddressValid) {
      errors.shipping = t('cart.homeAddressRequired');
    }

    // Validate relay point for pickup
    if (shippingPreference === 'pickup' && !isRelayPointValid) {
      errors.relayPoint = t('cart.relayPointRequired');
    }

    setValidationErrors(errors);

    // Only submit if all validations pass
    const hasNoErrors = isEmailValid && isPhoneValid && isWilayaValid && isCityValid &&
                        isProviderValid && isHomeAddressValid && isRelayPointValid;

    if (hasNoErrors) {
      onSubmit({
        ...formData,
        shippingPreference,
        homeAddress,
        pickupProvider,
        stopDeskId,
        shippingFee: calculatedFee ?? fixedShippingFee
      });
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

      {/* Guest Checkout Message */}
      {!isUserAuthenticated && !isLoadingProfile && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
              <LogIn className="w-3 h-3 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-blue-900 text-fluid-small">
                {t('cart.guestCheckoutMessage') || 'Log in to checkout faster with saved information.'}
              </p>
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="mt-2 text-blue-600 hover:text-blue-800 font-semibold text-fluid-xs underline"
              >
                {t('cart.loginNow') || 'Log in now'}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500]  mb-2">
            {t('cart.fullName')}
          </label>
          {isLoadingProfile ? (
            <SkeletonLoader />
          ) : (
            <input
              type="text"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-fluid-small"
              placeholder={t('cart.fullNamePlaceholder')}
            />
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
            {t('cart.phone')}
          </label>
          {isLoadingProfile ? (
            <SkeletonLoader />
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
            {t('cart.email')} <span className="text-gray-400 text-xs">({t('cart.optional') || 'Optionnel'})</span>
          </label>
          {isLoadingProfile ? (
            <SkeletonLoader />
          ) : (
            <>
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
            </>
          )}
        </div>



        {/* Shipping Method */}
        <div className="mt-6">
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-3">
            {t('cart.shippingMethod')}
          </label>

          <div className="space-y-3">
            {/* Home Delivery Option */}
            <div>
              <button
                type="button"
                onClick={() => {
                  setShippingPreference("home");
                  setPickupProvider("ZRexpress");
                  setStopDeskId(null);
                }}
                className={`w-full p-2.5 xs:p-3 md:p-4 rounded-lg border-2 transition-all ${shippingPreference === "home"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-neutral-200 bg-gray-50 hover:border-neutral-300"
                  }`}
              >
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${shippingPreference === "home" ? "bg-emerald-100" : "bg-gray-100"
                    }`}>
                    <Home className={`w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 ${shippingPreference === "home" ? "text-emerald-600" : "text-gray-600"
                      }`} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className={`font-medium text-xs xs:text-sm sm:text-fluid-small leading-tight ${shippingPreference === "home" ? "text-emerald-900" : "text-gray-800"
                      }`}>
                      {t('cart.homeDelivery')}
                    </h3>
                    <p className={`text-[10px] xs:text-xs sm:text-fluid-xs leading-tight mt-0.5 ${shippingPreference === "home" ? "text-emerald-600" : "text-gray-500"
                      }`}>
                      {t('cart.homeDeliveryDesc')}
                    </p>
                  </div>
                  <div className={`w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingPreference === "home"
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                    }`}>
                    {shippingPreference === "home" && (
                      <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </button>

              {/* Home Delivery Fields - Wilaya, Commune, Adresse */}
              <AnimatePresence>
                {shippingPreference === "home" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-4 px-3 md:px-4">
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

                      {/* Commune */}
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

                      {/* Adresse */}
                      <div>
                        <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
                          {t('cart.address')}
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none">
                            <Home className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            required
                            value={homeAddress}
                            onChange={(e) => setHomeAddress(e.target.value)}
                            placeholder={t('cart.homeAddressPlaceholder')}
                            className="w-full pl-10 pr-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-fluid-small transition-all placeholder:text-gray-400"
                          />
                        </div>
                        {validationErrors.shipping && (
                          <p className="mt-1 text-fluid-xs text-red-500">{validationErrors.shipping}</p>
                        )}
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
                onClick={() => {
                  setShippingPreference("pickup");
                  setPickupProvider("ZRexpress");
                }}
                className={`w-full p-2.5 xs:p-3 md:p-4 rounded-lg border-2 transition-all ${shippingPreference === "pickup"
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-neutral-200 bg-gray-50 hover:border-neutral-300"
                  }`}
              >
                <div className="flex items-center gap-2 xs:gap-3">
                  <div className={`w-8 h-8 xs:w-9 xs:h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${shippingPreference === "pickup" ? "bg-emerald-100" : "bg-gray-100"
                    }`}>
                    <MapPin className={`w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 ${shippingPreference === "pickup" ? "text-emerald-600" : "text-gray-600"
                      }`} />
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <h3 className={`font-medium text-xs xs:text-sm sm:text-fluid-small leading-tight ${shippingPreference === "pickup" ? "text-emerald-900" : "text-gray-800"
                      }`}>
                      {t('cart.pickupPoint')}
                    </h3>
                    <p className={`text-[10px] xs:text-xs sm:text-fluid-xs leading-tight mt-0.5 ${shippingPreference === "pickup" ? "text-emerald-600" : "text-gray-500"
                      }`}>
                      {t('cart.pickupPointDesc')}
                    </p>
                  </div>
                  <div className={`w-4 h-4 xs:w-4.5 xs:h-4.5 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingPreference === "pickup"
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-gray-300"
                    }`}>
                    {shippingPreference === "pickup" && (
                      <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                </div>
              </button>

              {/* Pickup Fields - Wilaya, Transporter, Relay Point */}
              <AnimatePresence>
                {shippingPreference === "pickup" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="mt-3 space-y-4 px-3 md:px-4">
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

                      {/* Transporter */}
                      <div>
                        <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
                          {t('cart.shippingProvider')}
                        </label>
                        <div className="relative" ref={el => dropdownRefs.current['provider'] = el}>
                          <div className={`flex items-center bg-white rounded-lg border-2 transition-all duration-200 ${
                            validationErrors.provider
                              ? 'border-red-500'
                              : openDropdown === 'provider' ? 'border-emerald-500 shadow-md' : 'border-neutral-200 hover:border-neutral-300'
                            }`}>
                            <div
                              className="flex items-center flex-1 min-w-0 h-11 px-3 cursor-pointer"
                              onClick={() => {
                                setOpenDropdown(openDropdown === 'provider' ? null : 'provider');
                              }}
                            >
                              <Truck className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" />
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
                              className="h-11 px-3 rounded-r-lg transition-colors flex items-center justify-center flex-shrink-0 hover:bg-gray-100"
                            >
                              <ChevronDown
                                className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${openDropdown === 'provider' ? 'rotate-180' : ''}`}
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
                                  <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
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
                                        className={`w-full text-left px-4 py-3 text-fluid-small hover:bg-emerald-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0 ${pickupProvider === provider ? 'bg-emerald-50 text-emerald-700' : 'text-gray-700'}`}
                                      >
                                        <div className={`w-3 h-3 border-2 rounded-full mr-3 flex-shrink-0 ${pickupProvider === provider ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'}`}></div>
                                        <span className="font-medium truncate">{provider}</span>
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                        {validationErrors.provider && (
                          <p className="mt-1 text-fluid-xs text-red-500">{validationErrors.provider}</p>
                        )}
                      </div>

                      {/* Sélection du point de relais */}
                      <div>
                        <label className="block text-[#353535] text-fluid-xs font-[500] mb-2">
                          {t('cart.selectRelayPoint')}
                        </label>
                        <RelayPointSelect
                          value={stopDeskId}
                          onChange={(id) => {
                            setStopDeskId(id);
                            if (id) {
                              setValidationErrors(prev => ({ ...prev, relayPoint: '' }));
                            }
                          }}
                          provider={PROVIDER_DISPLAY_TO_API[pickupProvider]}
                          wilaya={formData.wilaya}
                          error={!!validationErrors.relayPoint}
                        />
                        {validationErrors.relayPoint && (
                          <p className="mt-1 text-fluid-xs text-red-500">{validationErrors.relayPoint}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Order Cost Summary */}
        <div className="mt-6 bg-neutral-100 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-[#353535]">
              <span className="text-fluid-body font-[500]">{t('cart.subtotal')}</span>
              <span className="text-fluid-body font-[600]">
                {subtotal} <span className="text-xs">DZD</span>
              </span>
            </div>
            <div className="flex justify-between items-center text-[#353535]">
              <span className="text-fluid-body font-[500]">{t('cart.shipping')}</span>
              <span className="text-fluid-body font-[600]">
                {isCalculatingFee ? (
                  <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin align-middle" />
                ) : calculatedFee !== null ? (
                  <>{calculatedFee} <span className="text-xs">DZD</span></>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </span>
            </div>
            <div className="border-t border-gray-300 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-[#353535] text-fluid-body font-semibold">{t('cart.total')}</span>
                <span className="text-fluid-body font-[600]">
                  {isCalculatingFee ? (
                    <span className="inline-block w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin align-middle" />
                  ) : calculatedFee !== null ? (
                    <>{subtotal + calculatedFee} <span className="text-xs">DZD</span></>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          whileHover={!isSubmitting ? { scale: 1.02 } : {}}
          whileTap={!isSubmitting ? { scale: 0.98 } : {}}
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg transition-colors mt-6 flex items-center justify-center gap-2 ${
            isSubmitting
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-emerald-500 hover:bg-emerald-600 text-white'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('cart.submittingOrder') || 'Placing Order...'}</span>
            </>
          ) : (
            <span>{t('cart.finalizeOrder')}</span>
          )}
        </motion.button>
      </form>
    </motion.div>
  );
}

// Main CartCheckoutPage Component
export default function CartCheckoutPage() {
  const { t } = useTranslation();
  const {
    cartBooks,
    cartPacks,
    isLoading,
    error,
    updateQuantity,
    removeFromCart,
    updatePackQuantity,
    removePackFromCart,
    loadCartBooks,
    loadCartPacks,
    clearCart,
    clearPackCart
  } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPackBooksPopup, setShowPackBooksPopup] = useState(false);
  const [selectedPackForPopup, setSelectedPackForPopup] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [showOrderTrackingPrompt, setShowOrderTrackingPrompt] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Show 5 items per page in cart

  // Scroll to top when page loads
  useScrollToTop();

  // Load cart books and packs on mount
  useEffect(() => {
    loadCartBooks();
    loadCartPacks();
  }, [loadCartBooks, loadCartPacks]);

  const shippingFee = 700;

  // Calculate subtotal (books + packs)
  const subtotal = cartBooks.reduce((sum, item) => sum + (item.price * item.quantity), 0) +
    cartPacks.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Combine books and packs for unified display
  const allCartItems = [...cartBooks, ...cartPacks];

  // Pagination calculations
  const totalPages = Math.ceil(allCartItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCartItems = allCartItems.slice(startIndex, endIndex);

  // Update quantity for books
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    await updateQuantity(itemId, newQuantity);
    // Reload cart books to update UI
    await loadCartBooks();
  };

  // Update quantity for packs
  const handleUpdatePackQuantity = async (packId, newQuantity) => {
    await updatePackQuantity(packId, newQuantity);
    // Reload cart packs to update UI
    await loadCartPacks();
  };

  // Remove book from cart
  const handleRemoveItem = async (itemId) => {
    await removeFromCart(itemId);
    // If we removed the last item on current page, go to previous page
    if (paginatedCartItems.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Remove pack from cart
  const handleRemovePackItem = async (packId) => {
    await removePackFromCart(packId);
    // If we removed the last item on current page, go to previous page
    if (paginatedCartItems.length === 1 && currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Show pack books popup
  const handleViewPackBooks = (pack) => {
    setSelectedPackForPopup(pack);
    setShowPackBooksPopup(true);
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
  const handleOrderSubmit = async (formData) => {
    // Prevent multiple submissions
    if (isSubmittingOrder) return;

    // Validate cart is not empty
    if (allCartItems.length === 0) {
      setOrderError(t('cart.emptyCartError') || 'Your cart is empty');
      return;
    }

    try {
      setIsSubmittingOrder(true);
      setOrderError(null);

      // Use the calculated fee passed from CheckoutForm, fall back to fixed fee
      const resolvedShippingFee = formData.shippingFee ?? shippingFee;

      // Build order payload using the service helper
      const orderPayload = buildOrderPayload(formData, cartBooks, cartPacks, resolvedShippingFee);

      // Log payload for debugging (remove in production)
      console.log('Submitting order:', orderPayload);

      // Submit order to backend
      const createdOrder = await createOrder(orderPayload);

      console.log('Order created successfully:', createdOrder);

      // Clear both book and pack carts on success
      await clearCart();
      await clearPackCart();

      // Check if user is authenticated
      const userIsAuthenticated = isAuthenticated();

      // Store order data for potential use after sign-in
      setPendingOrderData({
        orderUniqueId: createdOrder.uniqueId,
        message: t('cart.orderSuccess') || 'Your order has been placed successfully!'
      });

      if (!userIsAuthenticated) {
        // Show order tracking prompt for unauthenticated users
        setShowOrderTrackingPrompt(true);
      } else {
        // Authenticated users go directly to home page
        navigate('/', {
          state: {
            orderSuccess: true,
            orderUniqueId: createdOrder.uniqueId,
            message: t('cart.orderSuccess') || 'Your order has been placed successfully!'
          }
        });
      }

    } catch (error) {
      console.error('Order submission error:', error);

      // Use error code for translation if available, fallback to error message
      let errorMessage;
      if (error.code) {
        // Try to translate the error code (e.g., 'error.insufficientstock')
        const translatedError = t(`errors.${error.code}`);

        // If translation exists and is different from the key, use it
        if (translatedError && translatedError !== `errors.${error.code}`) {
          errorMessage = translatedError;
        } else {
          // Fallback: try without 'errors.' prefix
          const translatedErrorAlt = t(error.code);
          errorMessage = translatedErrorAlt !== error.code ? translatedErrorAlt : error.message;
        }
      } else {
        errorMessage = error.message || t('cart.orderError') || 'Failed to place order. Please try again.';
      }

      setOrderError(errorMessage);

      // Scroll to top to show error message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Handle sign-in action from order tracking prompt
  const handleSignInFromPrompt = () => {
    setShowOrderTrackingPrompt(false);
    // Save redirect URL to orders page before navigating to auth
    saveRedirectUrl('/orders');
    // Navigate to auth page
    navigate('/auth');
  };

  // Handle "Later" action from order tracking prompt
  const handleLaterFromPrompt = () => {
    setShowOrderTrackingPrompt(false);
    // Redirect to home page with success message
    if (pendingOrderData) {
      navigate('/', {
        state: {
          orderSuccess: true,
          orderUniqueId: pendingOrderData.orderUniqueId,
          message: pendingOrderData.message
        }
      });
    } else {
      navigate('/');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <main className="w-full max-w-[100vw] overflow-x-hidden">
        <div className="min-h-screen bg-white">
          <section className="w-full max-w-[100vw] overflow-x-hidden">
            <Navbar />
          </section>
          <div className="h-28 md:h-20"></div>
          <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
              <p className="mt-4 text-gray-600">{t('cart.loading') || 'Loading cart...'}</p>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    );
  }

  // Show error state
  if (error) {
    return (
      <main className="w-full max-w-[100vw] overflow-x-hidden">
        <div className="min-h-screen bg-white">
          <section className="w-full max-w-[100vw] overflow-x-hidden">
            <Navbar />
          </section>
          <div className="h-28 md:h-20"></div>
          <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
            <div className="text-center py-12">
              <p className="text-red-600">{t('cart.error') || 'Error loading cart'}: {error}</p>
              <button
                onClick={() => loadCartBooks()}
                className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
              >
                {t('cart.retry') || 'Retry'}
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    );
  }

  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="min-h-screen bg-white">
        {/* Navigation Bar */}
        <section className="w-full max-w-[100vw] overflow-x-hidden">
          <Navbar />
        </section>

        {/* Responsive spacing for navbar - taller on mobile due to two-line layout */}
        <div className="h-28 md:h-20"></div>

        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          {/* Order Error Alert */}
          {orderError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center mt-0.5">
                  <X className="w-3 h-3 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-800 font-semibold text-fluid-small mb-1">
                    {t('cart.orderErrorTitle') || 'Order Failed'}
                  </h3>
                  <p className="text-red-700 text-fluid-xs">{orderError}</p>
                </div>
                <button
                  onClick={() => setOrderError(null)}
                  className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

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
            <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 text-black" />
                <h1 className="text-black font-[500]">
                  {allCartItems.length === 1 ? t('cart.title', { count: allCartItems.length }) : t('cart.title_plural', { count: allCartItems.length })}
                </h1>
              </div>
              {/* Results count - only show if there are items */}
              {!isLoading && allCartItems.length > 0 && (
                <div className="text-fluid-small text-gray-600">
                  {t('allBooks.resultsCount', {
                    start: allCartItems.length > 0 ? startIndex + 1 : 0,
                    end: Math.min(endIndex, allCartItems.length),
                    total: allCartItems.length
                  })}
                  {totalPages > 1 && (
                    <>
                      <span className="hidden sm:inline ml-2 text-gray-400">•</span>
                      <span className="hidden sm:inline ml-2">
                        {t('allBooks.page', { current: currentPage, total: totalPages })}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart Items - Books and Packs */}
            <AnimatePresence mode="popLayout">
              {allCartItems.length > 0 ? (
                <div className="space-y-2">
                  {paginatedCartItems.map((item) => (
                    item.isPack ? (
                      <PackItem
                        key={`pack-${item.id}`}
                        item={item}
                        onUpdateQuantity={handleUpdatePackQuantity}
                        onRemove={handleRemovePackItem}
                        onViewBooks={handleViewPackBooks}
                      />
                    ) : (
                      <CartItem
                        key={`book-${item.id}`}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemove={handleRemoveItem}
                      />
                    )
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

            {/* Pagination Controls */}
            {totalPages > 1 && allCartItems.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 py-4 border-t border-gray-200 text-fluid-small mt-4">
                <div></div>

                <div className="flex items-center gap-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.max(1, prev - 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95"
                    }`}
                    aria-label="Previous page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {(() => {
                      const pageNumbers = [];
                      const showEllipsisStart = currentPage > 3;
                      const showEllipsisEnd = currentPage < totalPages - 2;

                      // Always show first page
                      pageNumbers.push(
                        <button
                          key={1}
                          onClick={() => {
                            setCurrentPage(1);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                            currentPage === 1
                              ? "bg-emerald-600 text-white shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95"
                          }`}
                        >
                          1
                        </button>
                      );

                      // Show ellipsis after first page if needed
                      if (showEllipsisStart) {
                        pageNumbers.push(
                          <span key="ellipsis-start" className="flex items-center justify-center w-9 h-9 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      // Show pages around current page
                      const startPage = Math.max(2, currentPage - 1);
                      const endPage = Math.min(totalPages - 1, currentPage + 1);

                      for (let i = startPage; i <= endPage; i++) {
                        pageNumbers.push(
                          <button
                            key={i}
                            onClick={() => {
                              setCurrentPage(i);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              currentPage === i
                                ? "bg-emerald-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95"
                            }`}
                          >
                            {i}
                          </button>
                        );
                      }

                      // Show ellipsis before last page if needed
                      if (showEllipsisEnd) {
                        pageNumbers.push(
                          <span key="ellipsis-end" className="flex items-center justify-center w-9 h-9 text-gray-400">
                            ...
                          </span>
                        );
                      }

                      // Always show last page if more than 1 page
                      if (totalPages > 1) {
                        pageNumbers.push(
                          <button
                            key={totalPages}
                            onClick={() => {
                              setCurrentPage(totalPages);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`min-w-[36px] h-9 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                              currentPage === totalPages
                                ? "bg-emerald-600 text-white shadow-md"
                                : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95"
                            }`}
                          >
                            {totalPages}
                          </button>
                        );
                      }

                      return pageNumbers;
                    })()}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => {
                      setCurrentPage(prev => Math.min(totalPages, prev + 1));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    disabled={currentPage === totalPages}
                    className={`flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200 ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-600 active:scale-95"
                    }`}
                    aria-label="Next page"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Cart Summary */}
            {allCartItems.length > 0 && (
              <CartSummary
                subtotal={subtotal}
                onProceed={handleProceedToCheckout}
              />
            )}
          </motion.div>

          {/* Checkout Form Section */}
          <div id="checkout-section">
            {showCheckout && (
              <CheckoutForm
                onSubmit={handleOrderSubmit}
                isSubmitting={isSubmittingOrder}
                cartBooks={cartBooks}
                cartPacks={cartPacks}
                subtotal={subtotal}
                fixedShippingFee={shippingFee}
              />
            )}
          </div>
        </div>
      </div>
      <Footer />

      {/* Pack Books Popup */}
      {selectedPackForPopup && (
        <PackBooksPopup
          isOpen={showPackBooksPopup}
          onClose={() => {
            setShowPackBooksPopup(false);
            setSelectedPackForPopup(null);
          }}
          packTitle={selectedPackForPopup.title}
          packDescription={selectedPackForPopup.description}
          books={selectedPackForPopup.books}
        />
      )}

      {/* Order Tracking Prompt Popup */}
      <OrderTrackingPrompt
        isOpen={showOrderTrackingPrompt}
        onSignIn={handleSignInFromPrompt}
        onLater={handleLaterFromPrompt}
      />
    </main>
  );
}
