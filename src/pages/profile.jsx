import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, Edit2, Heart, LogOut, Home, MapPin,
  ChevronDown, ChevronRight, Truck, X, CheckCircle, AlertCircle,
  Info, User, ShoppingBag, HelpCircle,
} from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { getUserProfile, updateUserProfile } from '../services/user.service';
import { isAuthenticated, logout as authLogout, getAndClearRedirectUrl } from '../services/authService';
import { formatMemberSinceDate } from '../utils/dateUtils';
import wilayaData from '../utils/wilayaData';
import { validateProfileData } from '../utils/validation';
import OrdersTab from '../components/profil/OrdersTab';
import FavoritesTab from '../components/profil/FavoritesTab';
import { useOnboarding } from '../contexts/OnboardingContext';

const TABS = ['information', 'orders', 'favorites'];

export default function Profile() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // 'idle' | 'pending' | 'saving' | 'saved' | 'error'
  const debounceRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Tab state — synced with URL ?tab=
  // null = show 3-button menu; a tab id = show that section
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    if (TABS.includes(tab)) return tab;
    // On first login, go straight to information
    if (searchParams.get('firstLogin') === 'true') return 'information';
    return null;
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (!tab) {
        next.delete('tab');
      } else {
        next.set('tab', tab);
      }
      return next;
    }, { replace: true });
  };

  // First-login logic
  const isFirstLoginParam = searchParams.get('firstLogin') === 'true';
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [shippingPreference, setShippingPreference] = useState('home');
  const [homeAddress, setHomeAddress] = useState('');
  const [pickupProvider, setPickupProvider] = useState('');
  const [stopDeskId, setStopDeskId] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showFirstLoginBanner, setShowFirstLoginBanner] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRefs = useRef({});

  // Refs for scrolling to error fields
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const homeAddressRef = useRef(null);
  const pickupProviderRef = useRef(null);

  const pickupProviders = ['Yalidine', 'ZRexpress'];

  const { startProfileTour, startOnboarding, isTourActive, steps, currentStep, phase } = useOnboarding();

  const handleRestartTour = () => {
    startOnboarding(userData?.firstName || '');
    navigate('/');
  };

  useScrollToTop();

  // Switch to the tab indicated by the active tour step
  useEffect(() => {
    if (!isTourActive) return;
    const step = steps[currentStep];
    if (step?.tabId) handleTabChange(step.tabId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTourActive, currentStep, steps]);

  // Start profile tour when ?tour=true is in the URL.
  // Guard against re-firing when the user navigates back here after the tour
  // is already complete (phase captured at mount time reflects context state).
  useEffect(() => {
    if (searchParams.get('tour') !== 'true') return;
    if (phase === 'complete') return;

    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.delete('tour');
      next.delete('tab');
      return next;
    }, { replace: true });

    setActiveTab(null);
    const timer = setTimeout(() => startProfileTour(), 500);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to phone for first-time users
  useEffect(() => {
    if (isFirstLogin && phoneRef.current && !loading) {
      searchParams.delete('firstLogin');
      setSearchParams(searchParams, { replace: true });
      setTimeout(() => {
        phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const phoneInput = phoneRef.current?.querySelector('input[type="tel"]');
        if (phoneInput) setTimeout(() => phoneInput.focus(), 500);
      }, 300);
    }
  }, [isFirstLogin, loading]);

  // Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuthenticated()) {
        navigate('/auth', { replace: true, state: { from: '/profile' } });
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const profile = await getUserProfile();
        setUserData({
          id: profile.id,
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          imageUrl: profile.imageUrl || null,
          phone: profile.phone || '',
          wilaya: profile.wilaya || '',
          city: profile.city || '',
          streetAddress: profile.streetAddress || '',
          defaultShippingMethod: profile.defaultShippingMethod || null,
          defaultShippingProvider: profile.defaultShippingProvider || null,
          createdDate: profile.createdDate || null,
        });
        if (profile.wilaya && wilayaData[profile.wilaya]) {
          setAvailableCities(wilayaData[profile.wilaya]);
        }
        if (profile.defaultShippingMethod) {
          setShippingPreference(profile.defaultShippingMethod === 'HOME_DELIVERY' ? 'home' : 'pickup');
        }
        if (profile.streetAddress) setHomeAddress(profile.streetAddress);
        if (profile.defaultShippingProvider) {
          const providerMap = { YALIDINE: 'Yalidine', ZR: 'ZRexpress' };
          setPickupProvider(providerMap[profile.defaultShippingProvider] || '');
        }
        const savedStopDeskId = localStorage.getItem('defaultStopDeskId');
        if (savedStopDeskId) setStopDeskId(savedStopDeskId);
        if (isFirstLoginParam && !profile.phone) {
          setIsFirstLogin(true);
          setShowFirstLoginBanner(true);
          setIsEditingPhone(true);
        } else if (isFirstLoginParam && profile.phone) {
          const redirectUrl = getAndClearRedirectUrl() || '/';
          navigate(redirectUrl, { replace: true });
          return;
        }
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to load profile');
        setLoading(false);
        if (err.message.includes('Unauthorized')) {
          authLogout();
          navigate('/auth', { replace: true, state: { from: '/profile' } });
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  // Mark form as initialized after data loads (prevents auto-save on initial render)
  useEffect(() => {
    if (!loading && userData) {
      const t = setTimeout(() => { isInitializedRef.current = true; }, 200);
      return () => clearTimeout(t);
    }
  }, [loading, userData]);

  // Auto-save with debounce
  useEffect(() => {
    if (!isInitializedRef.current || isFirstLogin || !userData) return;
    setAutoSaveStatus('pending');
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => handleSaveProfile(true), 1500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [userData, homeAddress, shippingPreference, pickupProvider, stopDeskId]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!openDropdown) return;
      const activeRef = dropdownRefs.current[openDropdown];
      if (activeRef && !activeRef.contains(e.target)) setOpenDropdown(null);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const handleWilayaSelect = (wilaya) => {
    setUserData({ ...userData, wilaya, city: '' });
    setAvailableCities(wilayaData[wilaya] || []);
    setStopDeskId(null);
    setWilayaSearch('');
    setOpenDropdown(null);
  };

  const handleCitySelect = (city) => {
    setUserData({ ...userData, city });
    setCitySearch('');
    setOpenDropdown(null);
  };

  const handleProviderSelect = (provider) => {
    setPickupProvider(provider);
    setStopDeskId(null);
    setOpenDropdown(null);
    if (validationErrors.pickupProvider) {
      setValidationErrors({ ...validationErrors, pickupProvider: null });
    }
  };

  const getInitials = (name) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const handleBack = () => {
    if (activeTab !== null) {
      handleTabChange(null);
    } else {
      navigate(-1);
    }
  };
  const handleEditPhone = () => setIsEditingPhone(!isEditingPhone);
  const handleLogout = () => { authLogout(); navigate('/'); };

  const handleSaveProfile = async (isAutoSave = false) => {
    if (!userData) return;
    setValidationErrors({});
    const validation = validateProfileData(userData, homeAddress, shippingPreference, pickupProvider);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      if (!isAutoSave) {
        const fieldRefMap = {
          firstName: firstNameRef, lastName: lastNameRef, email: emailRef,
          phone: phoneRef, homeAddress: homeAddressRef, pickupProvider: pickupProviderRef,
        };
        const firstErrorRef = fieldRefMap[validation.firstErrorField];
        if (firstErrorRef?.current) {
          firstErrorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const inputEl = firstErrorRef.current.querySelector('input, textarea, button');
          if (inputEl) setTimeout(() => inputEl.focus(), 500);
        }
      }
      if (isAutoSave) setAutoSaveStatus('idle');
      return;
    }
    try {
      setSaving(true);
      if (isAutoSave) setAutoSaveStatus('saving');
      setError(null);
      const providerMap = { Yalidine: 'YALIDINE', ZRexpress: 'ZR' };
      const updateData = {
        id: userData.id,
        firstName: userData.firstName?.trim() || null,
        lastName: userData.lastName.trim(),
        email: userData.email.trim(),
        imageUrl: userData.imageUrl,
        phone: userData.phone.trim(),
        wilaya: userData.wilaya?.trim() || null,
        city: userData.city?.trim() || null,
        streetAddress: homeAddress?.trim() || null,
        defaultShippingMethod: shippingPreference === 'home' ? 'HOME_DELIVERY' : 'SHIPPING_PROVIDER',
        defaultShippingProvider:
          shippingPreference === 'pickup' && pickupProvider ? providerMap[pickupProvider] : null,
      };
      const updateResponse = await updateUserProfile(updateData);
      if (shippingPreference === 'pickup' && stopDeskId) {
        localStorage.setItem('defaultStopDeskId', stopDeskId);
      } else {
        localStorage.removeItem('defaultStopDeskId');
      }
      setIsEditingPhone(false);
      setValidationErrors({});
      setShowFirstLoginBanner(false);
      setSaving(false);
      if (isFirstLogin && updateResponse) {
        sessionStorage.setItem('el_onboarding_pending', 'profile_saved');
        const { linkedOrdersCount = 0, updatedOrdersCount = 0 } = updateResponse;
        if (linkedOrdersCount > 0) {
          navigate('/orders', {
            replace: true,
            state: { linkedOrdersSuccess: true, linkedOrdersCount, updatedOrdersCount },
          });
        } else {
          const redirectUrl = getAndClearRedirectUrl() || '/';
          navigate(redirectUrl, { replace: true, state: { profileCompleted: true } });
        }
      } else if (!isAutoSave) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        setAutoSaveStatus('saved');
        setTimeout(() => setAutoSaveStatus('idle'), 2500);
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
      setSaving(false);
      if (isAutoSave) setAutoSaveStatus('error');
    }
  };

  // ── Loading ────────────────────────────────────────────────────
  if (loading) {
    return (
      <main className="w-full max-w-[100vw] overflow-x-hidden">
        <div className="min-h-screen bg-gray-50">
          <section className="w-full max-w-[100vw] overflow-x-hidden"><Navbar /></section>
          <div className="h-28 md:h-20" />
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-10 h-10 border-[3px] border-[#00417a] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-gray-400 text-sm">Chargement...</p>
          </div>
          <Footer />
        </div>
      </main>
    );
  }

  // ── Error ──────────────────────────────────────────────────────
  if (error && !userData) {
    return (
      <main className="w-full max-w-[100vw] overflow-x-hidden">
        <div className="min-h-screen bg-gray-50">
          <section className="w-full max-w-[100vw] overflow-x-hidden"><Navbar /></section>
          <div className="h-28 md:h-20" />
          <div className="max-w-md mx-auto px-4 py-20 text-center">
            <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
              <p className="text-red-500 mb-4 text-sm">{error}</p>
              <button
                onClick={() => navigate('/')}
                className="px-5 py-2 bg-[#00417a] text-white rounded-xl text-sm font-medium hover:bg-[#003366] transition-colors"
              >
                Accueil
              </button>
            </div>
          </div>
          <Footer />
        </div>
      </main>
    );
  }

  if (!userData) return null;

  // ── Tabs config ────────────────────────────────────────────────
  const tabs = [
    { id: 'information', label: t('profile.tabs.information', 'Informations'), icon: User },
    { id: 'orders',      label: t('profile.tabs.orders',      'Commandes'),    icon: ShoppingBag },
    { id: 'favorites',   label: t('profile.tabs.favorites',   'Favoris'),      icon: Heart },
  ];

  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="min-h-screen bg-gray-50">

        {/* Navbar */}
        <section className="w-full max-w-[100vw] overflow-x-hidden">
          <Navbar />
        </section>

        {/* ── Floating toasts ─────────────────────────────────── */}
        <AnimatePresence>
          {showSuccessMessage && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
            >
              <div className="bg-white border border-emerald-200 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{t('profile.updateSuccess')}</p>
                  <p className="text-xs text-gray-400">{t('profile.updateSuccessMessage')}</p>
                </div>
                <button onClick={() => setShowSuccessMessage(false)} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showFirstLoginBanner && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
            >
              <div className="bg-white border border-blue-200 rounded-2xl shadow-lg px-4 py-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{t('profile.firstLogin.title')}</p>
                  <p className="text-xs text-gray-400">{t('profile.firstLogin.message')}</p>
                </div>
                <button onClick={() => setShowFirstLoginBanner(false)} className="text-gray-300 hover:text-gray-500 flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Blue hero header ─────────────────────────────────── */}
        <div data-tour="profile-header" className="bg-gradient-to-br from-[#00417a] via-[#00518f] to-[#0065a8] text-white pt-34 sm:pt-28 pb-7 px-4">
          <div className="max-w-3xl mx-auto">
            {/* Back + Logout */}
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 backdrop-blur-sm text-white/80 hover:text-white transition-all text-xs sm:text-sm font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{t('profile.back')}</span>
              </button>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 hover:border-white/25 backdrop-blur-sm text-white/80 hover:text-white transition-all text-xs sm:text-sm font-medium"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span>{t('profile.logout')}</span>
              </button>
            </div>

            {/* Avatar + name */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/25 shadow-xl flex items-center justify-center flex-shrink-0">
                <span className="text-xl sm:text-2xl font-semibold tracking-wide">
                  {getInitials(`${userData.firstName} ${userData.lastName}`)}
                </span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold leading-tight">
                  {`${userData.firstName} ${userData.lastName}`.trim()}
                </h1>
                <p className="text-white/50 text-xs sm:text-sm mt-0.5">
                  {t('profile.memberSince')} {formatMemberSinceDate(userData.createdDate, i18n.language)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Sticky section nav when inside a tab ─────────────── */}
        {activeTab !== null && (
          <div data-tour="profile-tabs" className="sticky top-28 md:top-20 z-30 bg-white border-b border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
            <div className="max-w-3xl mx-auto px-4 py-2.5 flex items-center gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const isActive = tab.id === activeTab;
                return (
                  <button
                    key={tab.id}
                    data-tour={`profile-tab-${tab.id}`}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap flex-shrink-0 ${
                      isActive
                        ? 'bg-[#00417a] text-white shadow-sm'
                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Menu buttons (default view, below header) ─────────── */}
        {activeTab === null && (
          <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
            <div className="space-y-3" data-tour="profile-tabs">
              {[
                {
                  id: 'information',
                  label: t('profile.tabs.information', 'Informations'),
                  icon: User,
                  desc: t('profile.menu.infoDesc', 'Vos données personnelles et préférences'),
                  color: '#00417a',
                  bg: '#dbeafe',
                },
                {
                  id: 'favorites',
                  label: t('profile.tabs.favorites', 'Favoris'),
                  icon: Heart,
                  desc: t('profile.menu.favDesc', 'Vos livres sauvegardés'),
                  color: '#EE0027',
                  bg: '#fee2e2',
                },
                {
                  id: 'orders',
                  label: t('profile.tabs.orders', 'Commandes'),
                  icon: ShoppingBag,
                  desc: t('profile.menu.ordersDesc', 'Historique de vos achats'),
                  color: '#0369a1',
                  bg: '#e0f2fe',
                },
              ].map((item, i) => (
                <motion.button
                  key={item.id}
                  data-tour={`profile-tab-${item.id}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.25, ease: 'easeOut' }}
                  onClick={() => handleTabChange(item.id)}
                  className="w-full bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-[0_2px_10px_rgba(15,23,42,0.05)] active:scale-[0.995] transition-all text-left group px-4 py-4 sm:px-5 sm:py-4 flex items-center gap-4"
                >
                  <div
                    className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: item.bg }}
                  >
                    <item.icon className="w-5 h-5" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm sm:text-[15px] leading-snug">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 flex-shrink-0 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all duration-200" />
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab content ──────────────────────────────────────── */}
        {activeTab !== null && (
        <div data-tour="profile-tab-content" className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
            >

              {/* ORDERS TAB */}
              {activeTab === 'orders' && <OrdersTab />}

              {/* FAVORITES TAB */}
              {activeTab === 'favorites' && <FavoritesTab />}

              {/* INFORMATION TAB */}
              {activeTab === 'information' && (
                <div className="space-y-4 pb-10">

                  {/* Personal info card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      {t('profile.personalInfo')}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      <div ref={firstNameRef} className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <label className="block text-[11px] text-gray-400 mb-1 font-medium uppercase tracking-wide">
                          {t('profile.firstName')}
                        </label>
                        <p className="text-gray-800 font-semibold text-sm sm:text-base">{userData.firstName || '—'}</p>
                      </div>

                      <div ref={lastNameRef} className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <label className="block text-[11px] text-gray-400 mb-1 font-medium uppercase tracking-wide">
                          {t('profile.lastName')}
                        </label>
                        <p className="text-gray-800 font-semibold text-sm sm:text-base">{userData.lastName || '—'}</p>
                      </div>

                      <div ref={emailRef} className="p-3 sm:p-4 bg-gray-50 rounded-xl sm:col-span-2">
                        <label className="block text-[11px] text-gray-400 mb-1 font-medium uppercase tracking-wide">
                          {t('profile.email')}
                        </label>
                        <p className="text-gray-800 font-semibold text-sm sm:text-base overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                          {userData.email}
                        </p>
                      </div>
                    </div>

                    {/* Phone — editable */}
                    <div
                      ref={phoneRef}
                      className={`mb-4 p-3 sm:p-4 rounded-xl ${validationErrors.phone ? 'bg-red-50 border-2 border-red-200' : 'bg-gray-50'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <label className={`text-[11px] font-medium uppercase tracking-wide ${validationErrors.phone ? 'text-red-400' : 'text-gray-400'}`}>
                          {t('profile.phone')} <span className="text-red-400">*</span>
                        </label>
                        <button
                          onClick={handleEditPhone}
                          className="flex items-center gap-1 text-[#00417a] hover:opacity-70 transition-opacity text-xs font-medium"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{t('profile.edit')}</span>
                        </button>
                      </div>
                      {isEditingPhone ? (
                        <>
                          <input
                            type="tel"
                            value={userData.phone}
                            onChange={(e) => {
                              setUserData({ ...userData, phone: e.target.value });
                              if (validationErrors.phone) setValidationErrors({ ...validationErrors, phone: null });
                            }}
                            placeholder="0555 12 34 56"
                            className={`w-full px-3 py-2.5 border rounded-xl text-sm bg-white transition-all ${
                              validationErrors.phone
                                ? 'border-red-300 focus:ring-2 focus:ring-red-400'
                                : 'border-gray-200 focus:ring-2 focus:ring-[#00417a]/20 focus:border-[#00417a]'
                            }`}
                          />
                          {validationErrors.phone && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                              <p className="text-xs text-red-500">{validationErrors.phone}</p>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <p className="text-gray-800 font-semibold text-sm">{userData.phone || '—'}</p>
                          {validationErrors.phone && (
                            <div className="flex items-center gap-1.5 mt-2">
                              <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                              <p className="text-xs text-red-500">{validationErrors.phone}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Location dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Wilaya */}
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <label className="block text-[11px] text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                          {t('profile.wilaya')}
                        </label>
                        <select
                          value={userData.wilaya || ''}
                          onChange={(e) => handleWilayaSelect(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00417a] hover:border-gray-300 bg-white appearance-none text-sm text-gray-700 font-medium transition-all duration-200"
                        >
                          <option value="">Sélectionner une wilaya</option>
                          {Object.keys(wilayaData).map(wilaya => (
                            <option key={wilaya} value={wilaya}>{wilaya}</option>
                          ))}
                        </select>
                      </div>

                      {/* City */}
                      <div className="p-3 sm:p-4 bg-gray-50 rounded-xl">
                        <label className="block text-[11px] text-gray-400 mb-1.5 font-medium uppercase tracking-wide">
                          {t('profile.city')}
                        </label>
                        <select
                          value={userData.city || ''}
                          onChange={(e) => handleCitySelect(e.target.value)}
                          disabled={!userData.wilaya}
                          className={`w-full px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00417a] bg-white appearance-none text-sm transition-all duration-200 ${
                            !userData.wilaya ? 'border-gray-200 cursor-not-allowed bg-gray-50 text-gray-400' : 'border-gray-200 hover:border-gray-300 text-gray-700 font-medium'
                          }`}
                        >
                          <option value="">{userData.wilaya ? t('profile.cityPlaceholder') : 'Sélectionner une wilaya d\'abord'}</option>
                          {availableCities.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Shipping preference card */}
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                      {t('profile.shippingPreference')}
                    </h2>
                    <div className="space-y-3">
                      {/* Home delivery */}
                      <div>
                        <button
                          onClick={() => setShippingPreference('home')}
                          className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${shippingPreference === 'home' ? 'border-[#00417a] bg-blue-50/40' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${shippingPreference === 'home' ? 'bg-[#00417a]/10' : 'bg-gray-100'}`}>
                              <Home className={`w-4 h-4 sm:w-5 sm:h-5 ${shippingPreference === 'home' ? 'text-[#00417a]' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold text-sm ${shippingPreference === 'home' ? 'text-[#00417a]' : 'text-gray-700'}`}>{t('profile.homeDelivery')}</p>
                              <p className={`text-xs mt-0.5 ${shippingPreference === 'home' ? 'text-blue-400' : 'text-gray-400'}`}>{t('profile.homeDeliveryDesc')}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingPreference === 'home' ? 'border-[#00417a] bg-[#00417a]' : 'border-gray-300'}`}>
                              {shippingPreference === 'home' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                        <AnimatePresence>
                          {shippingPreference === 'home' && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              className="overflow-hidden"
                            >
                              <div ref={homeAddressRef} className="mt-3 px-1">
                                <div className="relative">
                                  <div className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${validationErrors.homeAddress ? 'text-red-400' : 'text-[#00417a]'}`}>
                                    <Home className="w-4 h-4" />
                                  </div>
                                  <input
                                    type="text"
                                    value={homeAddress}
                                    onChange={(e) => {
                                      setHomeAddress(e.target.value);
                                      if (validationErrors.homeAddress) setValidationErrors({ ...validationErrors, homeAddress: null });
                                    }}
                                    placeholder={t('profile.homeAddressPlaceholder')}
                                    className={`w-full pl-10 pr-4 py-2.5 border rounded-xl bg-white text-sm transition-all placeholder:text-gray-300 ${
                                      validationErrors.homeAddress
                                        ? 'border-red-300 focus:ring-2 focus:ring-red-400'
                                        : 'border-gray-200 focus:ring-2 focus:ring-[#00417a]/20 focus:border-[#00417a]'
                                    }`}
                                  />
                                </div>
                                {validationErrors.homeAddress && (
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                    <p className="text-xs text-red-500">{validationErrors.homeAddress}</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Pickup point */}
                      <div>
                        <button
                          onClick={() => setShippingPreference('pickup')}
                          className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all text-left ${shippingPreference === 'pickup' ? 'border-[#00417a] bg-blue-50/40' : 'border-gray-100 bg-gray-50 hover:border-gray-200'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${shippingPreference === 'pickup' ? 'bg-[#00417a]/10' : 'bg-gray-100'}`}>
                              <MapPin className={`w-4 h-4 sm:w-5 sm:h-5 ${shippingPreference === 'pickup' ? 'text-[#00417a]' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-semibold text-sm ${shippingPreference === 'pickup' ? 'text-[#00417a]' : 'text-gray-700'}`}>{t('profile.pickupPoint')}</p>
                              <p className={`text-xs mt-0.5 ${shippingPreference === 'pickup' ? 'text-blue-400' : 'text-gray-400'}`}>{t('profile.pickupPointDesc')}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${shippingPreference === 'pickup' ? 'border-[#00417a] bg-[#00417a]' : 'border-gray-300'}`}>
                              {shippingPreference === 'pickup' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                        </button>
                        <AnimatePresence>
                          {shippingPreference === 'pickup' && (
                            <motion.div
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                            >
                              <div ref={pickupProviderRef} className="mt-3 px-1">
                                <div className="relative" ref={el => dropdownRefs.current['provider'] = el}>
                                  <div className={`flex items-center bg-white rounded-xl border-2 transition-all duration-200 ${validationErrors.pickupProvider ? 'border-red-300' : openDropdown === 'provider' ? 'border-[#00417a] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div
                                      className="flex items-center flex-1 min-w-0 h-10 px-3 cursor-pointer"
                                      onClick={() => setOpenDropdown(openDropdown === 'provider' ? null : 'provider')}
                                    >
                                      <Truck className="w-4 h-4 text-[#00417a] mr-2 flex-shrink-0" />
                                      <span className={`text-sm truncate ${pickupProvider ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                                        {pickupProvider || t('profile.selectProvider')}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpenDropdown(openDropdown === 'provider' ? null : 'provider'); }}
                                      className="h-10 px-3 hover:bg-gray-100 rounded-r-xl transition-colors flex items-center flex-shrink-0"
                                    >
                                      <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${openDropdown === 'provider' ? 'rotate-180' : ''}`} />
                                    </button>
                                  </div>
                                  <AnimatePresence>
                                    {openDropdown === 'provider' && (
                                      <motion.div
                                        initial={{ opacity: 0, y: -8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute top-full left-0 right-0 z-50 mt-1.5"
                                      >
                                        <div className="bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                                          <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
                                            <span className="text-[11px] text-gray-400">{pickupProviders.length} options</span>
                                            <button onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600"><X className="w-3.5 h-3.5" /></button>
                                          </div>
                                          {pickupProviders.map(provider => (
                                            <button
                                              key={provider}
                                              onClick={() => handleProviderSelect(provider)}
                                              className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors ${pickupProvider === provider ? 'bg-blue-50 text-[#00417a]' : 'text-gray-700 hover:bg-gray-50'}`}
                                            >
                                              <div className={`w-3 h-3 rounded-full border-2 flex-shrink-0 ${pickupProvider === provider ? 'border-[#00417a] bg-[#00417a]' : 'border-gray-300'}`} />
                                              <span className="font-medium">{provider}</span>
                                            </button>
                                          ))}
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                                {validationErrors.pickupProvider && (
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
                                    <p className="text-xs text-red-500">{validationErrors.pickupProvider}</p>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Validation error banner */}
                  {Object.keys(validationErrors).length > 0 && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-red-700">{t('profile.validationError')}</p>
                        <p className="text-xs text-red-400 mt-0.5">
                          {Object.keys(validationErrors).length}{' '}
                          {Object.keys(validationErrors).length === 1 ? 'champ nécessite' : 'champs nécessitent'} votre attention
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Save button (first-login only) / Auto-save status */}
                  {isFirstLogin ? (
                    <div className="pt-2">
                      <button
                        onClick={() => handleSaveProfile(false)}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#00417a] hover:bg-[#003366] text-white rounded-2xl font-semibold text-sm sm:text-base shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
                      >
                        {saving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>{t('profile.saving')}</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>{t('profile.save')}</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end pt-1 pb-2 h-8">
                      <AnimatePresence mode="wait">
                        {(autoSaveStatus === 'pending' || autoSaveStatus === 'saving') && (
                          <motion.div
                            key="saving"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-1.5 text-gray-400"
                          >
                            <div className="w-3 h-3 border-[1.5px] border-gray-300 border-t-gray-500 rounded-full animate-spin" />
                            <span className="text-xs">{t('profile.saving', 'Sauvegarde...')}</span>
                          </motion.div>
                        )}
                        {autoSaveStatus === 'saved' && (
                          <motion.div
                            key="saved"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-1.5 text-emerald-500"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span className="text-xs font-medium">{t('profile.saved', 'Sauvegardé')}</span>
                          </motion.div>
                        )}
                        {autoSaveStatus === 'error' && (
                          <motion.div
                            key="error"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-1.5 text-red-400"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span className="text-xs">{t('profile.saveError', 'Erreur de sauvegarde')}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
        )}

        {/* ── Replay onboarding tour ─────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 pb-8 pt-2 flex justify-center">
          <button
            onClick={handleRestartTour}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-gray-500 hover:text-[#00417a] bg-white border border-gray-100 hover:border-[#00417a]/30 hover:bg-blue-50/60 shadow-sm hover:shadow-md transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>{t('profile.restartTour', 'Revoir la visite guidée')}</span>
          </button>
        </div>

      </div>
      <Footer />
    </main>
  );
}
