import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Edit2, Heart, Package, LogOut, User, Home, MapPin, ChevronDown } from 'lucide-react';

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

  const handleWilayaChange = (e) => {
    const newWilaya = e.target.value;
    setUserData({ ...userData, wilaya: newWilaya, city: '' });
    setAvailableCities(wilayaData[newWilaya] || []);
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
    <div className="min-h-screen bg-gray-50 pb-20">
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

          {/* Location */}
          <div className="space-y-4">
            {/* Wilaya */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm text-gray-600 mb-2">{t('profile.wilaya')}</label>
              <div className="relative">
                <select
                  value={userData.wilaya}
                  onChange={handleWilayaChange}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm appearance-none"
                >
                  {Object.keys(wilayaData).map((wilaya) => (
                    <option key={wilaya} value={wilaya}>
                      {wilaya}
                    </option>
                  ))}
                </select>

                {/* Custom dropdown arrow */}
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* City */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="block text-sm text-gray-600 mb-2">{t('profile.city')}</label>
              <div className="relative">
                <select
                  value={userData.city}
                  onChange={(e) => setUserData({ ...userData, city: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm appearance-none"
                >
                  <option value="">{t('profile.cityPlaceholder')}</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>

                {/* Custom dropdown arrow */}
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Preference Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-4">
          <h2 className="text-lg text-gray-800 mb-4">{t('profile.shippingPreference')}</h2>

          <div className="space-y-3">
            {/* Home Delivery Option */}
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

            {/* Pickup Point Option */}
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
  );
}
