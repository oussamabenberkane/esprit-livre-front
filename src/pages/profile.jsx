import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit2, Heart, Package, LogOut, User, Home, MapPin, ChevronDown, Truck, X, Search } from 'lucide-react';
import { useScrollToTop } from '../hooks/useScrollToTop';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

// Algerian Wilaya data
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

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "Ahmed Benali",
    email: "ahmed.benali@email.com",
    phone: "+213 555 12 34 56",
    wilaya: "Alger",
    city: "Kouba"
  });

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [availableCities, setAvailableCities] = useState(wilayaData[userData.wilaya] || []);
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

  // Scroll to top when page loads
  useScrollToTop();

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
    setUserData({ ...userData, wilaya, city: '' });
    setAvailableCities(wilayaData[wilaya] || []);
    setWilayaSearch("");
    setOpenDropdown(null);
  };

  const handleCitySelect = (city) => {
    setUserData({ ...userData, city });
    setCitySearch("");
    setOpenDropdown(null);
  };

  const handleProviderSelect = (provider) => {
    setPickupProvider(provider);
    setOpenDropdown(null);
  };

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Navigation functions
  const handleBack = () => {
    navigate(-1);
  };

  const handleEditEmail = () => {
    setIsEditingEmail(!isEditingEmail);
  };

  const handleEditPhone = () => {
    setIsEditingPhone(!isEditingPhone);
  };

  const navigateToFavorites = () => {
    navigate('/favorites');
  };

  const navigateToOrders = () => {
    navigate('/orders');
  };

  const handleLogout = () => {
    // TODO: Add actual logout logic
    console.log('User logged out');
    alert('Logged out successfully');
    navigate('/');
  };

  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <section className="w-full max-w-[100vw] overflow-x-hidden">
          <Navbar />
        </section>

        {/* Responsive spacing for navbar - taller on mobile due to two-line layout */}
        <div className="h-28 md:h-20"></div>

        {/* Header */}
        <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white pt-8 pb-24 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-6 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">{t('profile.back')}</span>
          </button>

          {/* User Info */}
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-white text-blue-600 flex items-center justify-center border-4 border-blue-400 shadow-lg">
              <span className="text-2xl">{getInitials(userData.name)}</span>
            </div>

            {/* Name */}
            <div>
              <h1 className="text-2xl mb-1">{userData.name}</h1>
              <p className="text-blue-100 text-sm">{t('profile.memberSince')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 -mt-16">
        {/* Personal Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-lg text-gray-800 mb-4">{t('profile.personalInfo')}</h2>

          {/* Phone */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-600">{t('profile.phone')}</label>
              <button
                onClick={handleEditPhone}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span>{t('profile.edit')}</span>
              </button>
            </div>
            {isEditingPhone ? (
              <input
                type="tel"
                value={userData.phone}
                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            ) : (
              <p className="text-gray-800">{userData.phone}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-600">{t('profile.email')}</label>
              <button
                onClick={handleEditEmail}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors text-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span>{t('profile.edit')}</span>
              </button>
            </div>
            {isEditingEmail ? (
              <input
                type="email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            ) : (
              <p className="text-gray-800">{userData.email}</p>
            )}
          </div>

          

          {/* Location */}
          <div className="space-y-4">
            {/* Wilaya */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm text-gray-600 mb-2">{t('profile.wilaya')}</label>
              <div className="relative" ref={el => dropdownRefs.current['wilaya'] = el}>
                <div
                  className={`flex items-center bg-white rounded-lg border-2 transition-all duration-200 ${
                    openDropdown === 'wilaya' ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="flex items-center flex-1 h-11 px-3 cursor-text"
                    onClick={() => {
                      if (wilayaInputRef.current) {
                        wilayaInputRef.current.focus();
                      }
                      if (openDropdown !== 'wilaya') {
                        setOpenDropdown('wilaya');
                      }
                    }}
                  >
                    <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      ref={wilayaInputRef}
                      type="text"
                      value={wilayaSearch}
                      onChange={(e) => setWilayaSearch(e.target.value)}
                      onFocus={() => {
                        setOpenDropdown('wilaya');
                      }}
                      placeholder={userData.wilaya}
                      className="flex-1 bg-transparent border-0 outline-none text-sm text-gray-700 placeholder-gray-700 cursor-text font-medium"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'wilaya' ? null : 'wilaya');
                    }}
                    className="h-11 px-3 hover:bg-gray-100 rounded-r-lg transition-colors flex items-center flex-shrink-0"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
                        openDropdown === 'wilaya' ? 'rotate-180' : ''
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
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <span className="text-xs font-medium text-gray-600">
                            {getFilteredWilayas().length} {getFilteredWilayas().length === 1 ? 'résultat' : 'résultats'}
                          </span>
                          <button
                            onClick={() => setOpenDropdown(null)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="max-h-52 overflow-y-auto">
                          {getFilteredWilayas().map((wilaya) => (
                            <button
                              key={wilaya}
                              onClick={() => handleWilayaSelect(wilaya)}
                              className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0 ${
                                userData.wilaya === wilaya ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                              }`}
                            >
                              <div className={`w-3 h-3 border-2 rounded-full mr-3 flex-shrink-0 ${
                                userData.wilaya === wilaya ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                              }`}></div>
                              <span className="font-medium">{wilaya}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* City */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm text-gray-600 mb-2">{t('profile.city')}</label>
              <div className="relative" ref={el => dropdownRefs.current['city'] = el}>
                <div
                  className={`flex items-center bg-white rounded-lg border-2 transition-all duration-200 ${
                    openDropdown === 'city' ? 'border-blue-500 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="flex items-center flex-1 h-11 px-3 cursor-text"
                    onClick={() => {
                      if (cityInputRef.current) {
                        cityInputRef.current.focus();
                      }
                      if (openDropdown !== 'city') {
                        setOpenDropdown('city');
                      }
                    }}
                  >
                    <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                    <input
                      ref={cityInputRef}
                      type="text"
                      value={citySearch}
                      onChange={(e) => setCitySearch(e.target.value)}
                      onFocus={() => {
                        setOpenDropdown('city');
                      }}
                      placeholder={userData.city || t('profile.cityPlaceholder')}
                      className={`flex-1 bg-transparent border-0 outline-none text-sm cursor-text ${
                        userData.city ? 'text-gray-700 placeholder-gray-700 font-medium' : 'text-gray-400 placeholder-gray-400'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === 'city' ? null : 'city');
                    }}
                    className="h-11 px-3 hover:bg-gray-100 rounded-r-lg transition-colors flex items-center flex-shrink-0"
                  >
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
                        openDropdown === 'city' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>

                <AnimatePresence>
                  {openDropdown === 'city' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 z-50 mt-2 overflow-hidden"
                    >
                      <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                          <span className="text-xs font-medium text-gray-600">
                            {getFilteredCities().length} {getFilteredCities().length === 1 ? 'résultat' : 'résultats'}
                          </span>
                          <button
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
                                key={city}
                                onClick={() => handleCitySelect(city)}
                                className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0 ${
                                  userData.city === city ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                <div className={`w-3 h-3 border-2 rounded-full mr-3 flex-shrink-0 ${
                                  userData.city === city ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                }`}></div>
                                <span className="font-medium">{city}</span>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-sm text-gray-500 text-center">
                              Aucun résultat
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Preference Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-lg text-gray-800 mb-4">{t('profile.shippingPreference')}</h2>

          <div className="space-y-3">
            {/* Home Delivery Option */}
            <div>
              <button
                onClick={() => setShippingPreference("home")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${shippingPreference === "home"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shippingPreference === "home" ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                    <Home className={`w-5 h-5 ${shippingPreference === "home" ? "text-blue-600" : "text-gray-600"
                      }`} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className={`font-medium ${shippingPreference === "home" ? "text-blue-900" : "text-gray-800"
                      }`}>
                      {t('profile.homeDelivery')}
                    </h3>
                    <p className={`text-sm ${shippingPreference === "home" ? "text-blue-600" : "text-gray-500"
                      }`}>
                      {t('profile.homeDeliveryDesc')}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingPreference === "home"
                      ? "border-blue-500 bg-blue-500"
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
                    <div className="mt-3 px-3">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none">
                          <Home className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          value={homeAddress}
                          onChange={(e) => setHomeAddress(e.target.value)}
                          placeholder={t('profile.homeAddressPlaceholder')}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-all placeholder:text-gray-400"
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
                onClick={() => setShippingPreference("pickup")}
                className={`w-full p-4 rounded-lg border-2 transition-all ${shippingPreference === "pickup"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50 hover:border-gray-300"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${shippingPreference === "pickup" ? "bg-blue-100" : "bg-gray-100"
                    }`}>
                    <MapPin className={`w-5 h-5 ${shippingPreference === "pickup" ? "text-blue-600" : "text-gray-600"
                      }`} />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className={`font-medium ${shippingPreference === "pickup" ? "text-blue-900" : "text-gray-800"
                      }`}>
                      {t('profile.pickupPoint')}
                    </h3>
                    <p className={`text-sm ${shippingPreference === "pickup" ? "text-blue-600" : "text-gray-500"
                      }`}>
                      {t('profile.pickupPointDesc')}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${shippingPreference === "pickup"
                      ? "border-blue-500 bg-blue-500"
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
                    <div className="mt-3 px-3">
                      <div className="relative" ref={el => dropdownRefs.current['provider'] = el}>
                        <div className={`flex items-center bg-white rounded-lg border-2 transition-all duration-200 ${
                          openDropdown === 'provider' ? 'border-blue-500 shadow-md' : 'border-gray-300 hover:border-blue-400'
                        }`}>
                          <div
                            className="flex items-center flex-1 h-11 px-3 cursor-pointer"
                            onClick={() => {
                              setOpenDropdown(openDropdown === 'provider' ? null : 'provider');
                            }}
                          >
                            <Truck className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                            <span className={`text-sm ${pickupProvider ? 'text-gray-700 font-medium' : 'text-gray-400'}`}>
                              {pickupProvider || t('profile.selectProvider')}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenDropdown(openDropdown === 'provider' ? null : 'provider');
                            }}
                            className="h-11 px-3 hover:bg-gray-100 rounded-r-lg transition-colors flex items-center flex-shrink-0"
                          >
                            <ChevronDown
                              className={`w-4 h-4 text-blue-500 transform transition-transform duration-200 ${
                                openDropdown === 'provider' ? 'rotate-180' : ''
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
                                <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b border-gray-200">
                                  <span className="text-xs font-medium text-gray-600">
                                    {pickupProviders.length} {pickupProviders.length === 1 ? 'option' : 'options'}
                                  </span>
                                  <button
                                    onClick={() => setOpenDropdown(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="max-h-52 overflow-y-auto">
                                  {pickupProviders.map((provider) => (
                                    <button
                                      key={provider}
                                      onClick={() => handleProviderSelect(provider)}
                                      className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors flex items-center border-b border-gray-100 last:border-b-0 ${
                                        pickupProvider === provider ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                      }`}
                                    >
                                      <div className={`w-3 h-3 border-2 rounded-full mr-3 flex-shrink-0 ${
                                        pickupProvider === provider ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                                      }`}></div>
                                      <span className="font-medium">{provider}</span>
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

        {/* Navigation Cards */}
        <div className="space-y-3">
          {/* Favorites */}
          <button
            onClick={navigateToFavorites}
            className="w-full bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Heart className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-left">
                <h3 className="text-gray-800">{t('profile.myFavorites')}</h3>
                <p className="text-sm text-gray-500">{t('profile.favoritesSaved')}</p>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </button>

          {/* Orders */}
          <button
            onClick={navigateToOrders}
            className="w-full bg-white rounded-xl shadow-md p-4 flex items-center justify-between hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-gray-800">{t('profile.myOrders')}</h3>
                <p className="text-sm text-gray-500">{t('profile.ordersHistory')}</p>
              </div>
            </div>
            <ArrowLeft className="w-5 h-5 text-gray-400 rotate-180" />
          </button>
        </div>

        {/* Logout Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>{t('profile.logout')}</span>
          </button>
        </div>
      </div>
      </div>
      <Footer />
    </main>
  );
}
