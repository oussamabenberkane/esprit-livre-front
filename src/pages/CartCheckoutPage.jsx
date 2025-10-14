import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, ExternalLink, ShoppingBag, ChevronDown, Home, MapPin } from 'lucide-react';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';


// Mock cart data
const initialCartData = [
  {
    id: 1,
    title: "l'incompris",
    author: "Saneh Sangsuk",
    price: 2600,
    quantity: 1,
    image: "https://images.unsplash.com/photo-1661936901394-a993c79303c7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxib29rJTIwY292ZXIlMjBmaWN0aW9ufGVufDF8fHx8MTc2MDM0NjMzNnww&ixlib=rb-4.1.0&q=80&w=400"
  },
  {
    id: 2,
    title: "Le hobbit",
    author: "J.R.R Tolkien",
    price: 2100,
    quantity: 1,
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
            <h1 className="font-[550] text-fluid-h3 mb-fluid-small">{item.title}</h1>
            {/* Price */}
            <div className="text-right ml-2">
              <span className="text-black text-fluid-h3 font-bold">{item.price * item.quantity}</span>
              <span className="text-fluid-medium font-semibold text-gray-600 ml-1">DZD</span>
            </div>
          </div>
          <h1 className="text-[#717192] text-fluid-medium font-[400] md:text-fluid-small mb-fluid-xs">{item.author}</h1>
          <button className="flex items-center gap-1 text-[#626e82] text-xs hover:text-blue-600 transition-colors">
            <span><h1 className="text-fluid-medium">Détails du livre</h1></span>
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
              <span><h1 className="text-fluid-small md:text-fluid-h3">Supprimer</h1></span>
            </motion.button>
          </div>


        </div>
      </div>
    </motion.div>
  );
}

// CartSummary Component
function CartSummary({ subtotal, shipping, onProceed }) {
  const total = subtotal + shipping;
  const estimatedDelivery = "2–4 jours";

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
          <span className="text-fluid-body font-[500]">Sous-total :</span>
          <span className="text-fluid-body font-[600]">
            {subtotal} <span className="text-xs">DZD</span>
          </span>
        </div>

        <div className="flex justify-between items-center text-[#353535]">
          <span className="text-fluid-body font-[500]">Frais de livraison :</span>
          <span className="text-fluid-body font-[600]">
            {shipping} <span className="text-xs">DZD</span>
          </span>
        </div>

        <div className="flex justify-between items-center text-[#353535] text-fluid-body font-[500]">
          <span>Livraison estimée :</span>
          <span className="text-emerald-600">{estimatedDelivery}</span>
        </div>

        <div className="border-t border-gray-300 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className="text-[#353535] text-fluid-body font-semibold">Total à payer :</span>
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
        Passer à la confirmation
      </motion.button>
    </motion.div>
  );
}

// CheckoutForm Component
function CheckoutForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    wilaya: '',
    city: ''
  });

  const [validationErrors, setValidationErrors] = useState({
    email: '',
    phone: ''
  });

  const [availableCities, setAvailableCities] = useState([]);
  const [shippingPreference, setShippingPreference] = useState("home"); // "home" or "pickup"

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

    if (email && !validateEmail(email)) {
      setValidationErrors(prev => ({ ...prev, email: 'Veuillez entrer une adresse email valide' }));
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
        phone: 'Le numéro doit contenir 10 chiffres (ex: 0555 00 00 00)'
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleWilayaChange = (e) => {
    const selectedWilaya = e.target.value;
    setFormData({ ...formData, wilaya: selectedWilaya, city: '' });
    setAvailableCities(wilayaData[selectedWilaya] || []);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation before submit
    const isEmailValid = validateEmail(formData.email);
    const isPhoneValid = validatePhone(formData.phone);

    if (!isEmailValid) {
      setValidationErrors(prev => ({ ...prev, email: 'Veuillez entrer une adresse email valide' }));
    }

    if (!isPhoneValid) {
      setValidationErrors(prev => ({
        ...prev,
        phone: 'Le numéro doit contenir 10 chiffres (ex: 0555 00 00 00)'
      }));
    }

    // Only submit if all validations pass
    if (isEmailValid && isPhoneValid) {
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
      <h2 className="text-black text-fluid-h3 font-[550] text-center mt-fluid-md mb-6">
        Veuillez renseigner vos informations personnelles
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500]  mb-2">
            Nom complet
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full px-4 py-2.5 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            placeholder="Entrez votre nom complet"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
            Email
          </label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={handleEmailChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              validationErrors.email
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-200 focus:ring-emerald-500'
            }`}
            placeholder="exemple@email.com"
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
            Numéro de téléphone
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={handlePhoneChange}
            className={`w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
              validationErrors.phone
                ? 'border-red-500 focus:ring-red-500'
                : 'border-neutral-200 focus:ring-emerald-500'
            }`}
            placeholder="0555 00 00 00"
            maxLength="14"
          />
          {validationErrors.phone && (
            <p className="mt-1 text-sm text-red-500">{validationErrors.phone}</p>
          )}
        </div>

        {/* Wilaya */}
        <div>
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-2">
            Wilaya
          </label>

          <div className="relative">
            <select
              required
              value={formData.wilaya}
              onChange={handleWilayaChange}
              className="w-full px-4 py-2.5 pr-10 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white appearance-none"
            >
              <option value="">Sélectionnez votre wilaya</option>
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


        <div className="relative">
          <select
            required
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            disabled={!formData.wilaya}
            className="w-full px-4 py-2.5 pr-10 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all bg-white disabled:bg-gray-100 disabled:cursor-not-allowed appearance-none"
          >
            <option value="">Sélectionnez votre commune</option>
            {availableCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>

        {/* Shipping Preference */}
        <div className="mt-6">
          <label className="block text-[#353535] text-fluid-medium font-[500] mb-3">
            Mode de livraison
          </label>

          <div className="space-y-3">
            {/* Home Delivery Option */}
            <button
              type="button"
              onClick={() => setShippingPreference("home")}
              className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all ${
                shippingPreference === "home"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-neutral-200 bg-gray-50 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  shippingPreference === "home" ? "bg-emerald-100" : "bg-gray-100"
                }`}>
                  <Home className={`w-5 h-5 ${
                    shippingPreference === "home" ? "text-emerald-600" : "text-gray-600"
                  }`} />
                </div>
                <div className="text-left flex-1">
                  <h3 className={`font-medium text-sm md:text-base ${
                    shippingPreference === "home" ? "text-emerald-900" : "text-gray-800"
                  }`}>
                    Livraison à domicile
                  </h3>
                  <p className={`text-xs md:text-sm ${
                    shippingPreference === "home" ? "text-emerald-600" : "text-gray-500"
                  }`}>
                    Recevez vos livres directement chez vous
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  shippingPreference === "home"
                    ? "border-emerald-500 bg-emerald-500"
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
              type="button"
              onClick={() => setShippingPreference("pickup")}
              className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all ${
                shippingPreference === "pickup"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-neutral-200 bg-gray-50 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  shippingPreference === "pickup" ? "bg-emerald-100" : "bg-gray-100"
                }`}>
                  <MapPin className={`w-5 h-5 ${
                    shippingPreference === "pickup" ? "text-emerald-600" : "text-gray-600"
                  }`} />
                </div>
                <div className="text-left flex-1">
                  <h3 className={`font-medium text-sm md:text-base ${
                    shippingPreference === "pickup" ? "text-emerald-900" : "text-gray-800"
                  }`}>
                    Point de relais
                  </h3>
                  <p className={`text-xs md:text-sm ${
                    shippingPreference === "pickup" ? "text-emerald-600" : "text-gray-500"
                  }`}>
                    Retirez votre colis au point relais le plus proche
                  </p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                  shippingPreference === "pickup"
                    ? "border-emerald-500 bg-emerald-500"
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

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-lg transition-colors mt-6"
        >
          Finaliser la commande
        </motion.button>
      </form>
    </motion.div>
  );
}

// Main CartCheckoutPage Component
export default function CartCheckoutPage() {
  const [cartItems, setCartItems] = useState(initialCartData);
  const [showCheckout, setShowCheckout] = useState(false);
  const navigate = useNavigate();

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

        <div className="h-20"></div>

        <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
          {/* Back to Shopping Link */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate('/allbooks')}
            className="inline-flex items-center gap-2 text-black text-xs md:text-sm hover:text-emerald-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span><h1 className="text-fluid-h2 font-[500] ">Continuer mes achats</h1></span>
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
              Panier ({cartItems.length} article{cartItems.length > 1 ? 's' : ''})
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
                Votre panier est vide
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
