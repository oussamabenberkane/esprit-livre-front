import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Package, Calendar, Eye, PackageOpen, CheckCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import { getLanguageCode, getFullLanguageName } from '../../data/booksData';
import { getUserOrders } from '../../services/order.service';
import { isAuthenticated } from '../../services/authService';
import { getBookCoverUrl, getBookPackCoverUrl } from '../../utils/imageUtils';

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
const formatOrderDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Transform API order to UI format
 * @param {Object} apiOrder - Order from API
 * @returns {Object} Transformed order for UI
 */
const transformOrder = (apiOrder) => {
  return {
    id: apiOrder.uniqueId || apiOrder.id,
    date: formatOrderDate(apiOrder.createdAt),
    status: apiOrder.status?.toLowerCase() || 'pending',
    total: apiOrder.totalAmount || 0,
    shippingCost: apiOrder.shippingCost || 0,
    items: apiOrder.orderItems?.map(item => {
      // Determine if this is a book or a pack
      const isBook = item.bookId != null;
      const isPack = item.bookPackId != null;

      // Get the appropriate image URL
      let imageUrl;
      if (isBook) {
        imageUrl = getBookCoverUrl(item.bookId);
      } else if (isPack) {
        // Use the pack cover URL utility - this fetches the pack's cover image from the API
        imageUrl = getBookPackCoverUrl(item.bookPackId);
      } else {
        // Fallback for items that are neither book nor pack
        imageUrl = 'https://via.placeholder.com/200x300?text=No+Image';
      }

      return {
        // Item identification
        id: isBook ? item.bookId : item.bookPackId,
        type: isBook ? 'book' : 'pack',

        // Common fields
        title: isBook ? item.bookTitle : item.bookPackTitle,
        author: isBook ? item.bookAuthor : null,
        image: imageUrl,
        quantity: item.quantity || 1,
        unitPrice: item.unitPrice || 0,
        totalPrice: item.totalPrice || 0,

        // Book-specific (will be null for packs)
        language: null // Language info not available in API response
      };
    }) || []
  };
};

// Status Badge Component
function StatusBadge({ status }) {
  const { t } = useTranslation();

  const statusConfig = {
    pending: {
      color: "bg-yellow-100 text-yellow-700 border-yellow-300"
    },
    confirmed: {
      color: "bg-blue-100 text-blue-700 border-blue-300"
    },
    shipped: {
      color: "bg-purple-100 text-purple-700 border-purple-300"
    },
    delivered: {
      color: "bg-green-100 text-green-700 border-green-300"
    },
    cancelled: {
      color: "bg-red-100 text-red-700 border-red-300"
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs border ${config.color}`}>
      {t(`orders.status.${status}`)}
    </span>
  );
}

// Order Card Component
function OrderCard({ order }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleViewDetails = () => {
    setIsExpanded(!isExpanded);
    console.log(`View order details: ${order.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-shadow">
      {/* Order Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Package className="w-4 h-4 text-gray-500" />
            <span className="text-gray-800">{order.id}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <span>{order.date}</span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Order Items Preview */}
      <div className="flex gap-2 mb-3 overflow-x-auto">
        {order.items.map((item, index) => (
          <div key={index} className="flex-shrink-0 relative">
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-20 object-cover rounded"
            />
            {item.type === 'pack' && (
              <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-0.5">
                <PackageOpen className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-3 mb-3 space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-12 h-16 object-cover rounded"
                />
                {item.type === 'pack' && (
                  <div className="absolute -top-1 -right-1 bg-purple-500 rounded-full p-0.5">
                    <PackageOpen className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm text-gray-800 line-clamp-1">{item.title}</h4>
                  {item.type === 'pack' && (
                    <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                      Pack
                    </span>
                  )}
                </div>
                {item.author && <p className="text-xs text-gray-500">{item.author}</p>}
                {item.quantity > 1 && (
                  <p className="text-xs text-gray-600 mt-0.5">
                    {t('cart.quantity')}: {item.quantity}
                  </p>
                )}
                {item.language && (
                  <div className="mt-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                      <span className="hidden sm:inline">{getFullLanguageName(item.language)}</span>
                      <span className="inline sm:hidden">{getLanguageCode(item.language)}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <button
          onClick={handleViewDetails}
          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm transition-colors"
        >
          <Eye className="w-4 h-4" />
          <span>{isExpanded ? t('orders.hideDetails') : t('orders.viewDetails')}</span>
        </button>
        <div className="text-right">
          <span className="text-gray-800">
            {order.total} <span className="text-xs text-gray-600">{t('orders.currency')}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentOrders, setCurrentOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkedOrdersSuccess, setShowLinkedOrdersSuccess] = useState(false);
  const [linkedOrdersData, setLinkedOrdersData] = useState({ linkedOrdersCount: 0, updatedOrdersCount: 0 });

  // Scroll to top when page loads
  useScrollToTop();

  // Check for linked orders success state from navigation
  useEffect(() => {
    if (location.state?.linkedOrdersSuccess) {
      setShowLinkedOrdersSuccess(true);
      setLinkedOrdersData({
        linkedOrdersCount: location.state.linkedOrdersCount || 0,
        updatedOrdersCount: location.state.updatedOrdersCount || 0
      });

      // Clear the navigation state
      window.history.replaceState({}, document.title);

      // Auto-hide success message after 8 seconds
      const timer = setTimeout(() => {
        setShowLinkedOrdersSuccess(false);
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [location]);

  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        navigate('/auth');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch all orders (API will paginate, we'll fetch first page for now)
        const response = await getUserOrders(0, 100);

        if (response && response.content) {
          const allOrders = response.content.map(transformOrder);

          // Separate current orders (pending, confirmed, shipped) from history (delivered, cancelled)
          const current = allOrders.filter(order =>
            ['pending', 'confirmed', 'shipped'].includes(order.status)
          );
          const history = allOrders.filter(order =>
            ['delivered', 'cancelled'].includes(order.status)
          );

          setCurrentOrders(current);
          setOrderHistory(history);
        } else {
          setCurrentOrders([]);
          setOrderHistory([]);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Failed to load orders');

        // If unauthorized, redirect to auth
        if (err.message?.includes('Unauthorized')) {
          navigate('/auth');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const totalOrders = currentOrders.length + orderHistory.length;

  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden">
      <div className="min-h-screen bg-gray-50">
        {/* Navigation Bar */}
        <section className="w-full max-w-[100vw] overflow-x-hidden">
          <Navbar />
        </section>

        {/* Spacer for fixed navbar - larger on mobile for two-line navbar */}
        <div className="h-28 md:h-20"></div>

        {/* Linked Orders Success Message */}
        <AnimatePresence>
          {showLinkedOrdersSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 w-[90%] max-w-lg"
            >
              <div className="bg-emerald-50 border-2 border-emerald-500 rounded-lg shadow-lg p-4 md:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-emerald-900 font-bold text-base md:text-lg mb-1">
                      {t('orders.linkedSuccess.title')}
                    </h3>
                    <p className="text-emerald-700 text-sm mb-2">
                      {t('orders.linkedSuccess.message', {
                        count: linkedOrdersData.linkedOrdersCount,
                        total: linkedOrdersData.updatedOrdersCount
                      })}
                    </p>
                    {linkedOrdersData.linkedOrdersCount !== linkedOrdersData.updatedOrdersCount && (
                      <p className="text-emerald-600 text-xs">
                        {t('orders.linkedSuccess.updated', { count: linkedOrdersData.updatedOrdersCount })}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowLinkedOrdersSuccess(false)}
                    className="flex-shrink-0 text-emerald-600 hover:text-emerald-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white pt-8 pb-6 px-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">{t('orders.back')}</span>
          </button>

          <div className="flex items-center gap-3">
            <Package className="w-7 h-7" />
            <div>
              <h1 className="text-2xl">{t('orders.title')}</h1>
              <p className="text-blue-100 text-sm">
                {t('orders.count', { count: totalOrders })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {loading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">{t('orders.loading') || 'Loading orders...'}</p>
          </div>
        ) : error ? (
          // Error State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-xl text-gray-800 mb-2">{t('orders.errorTitle') || 'Error Loading Orders'}</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">{error}</p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {t('orders.back')}
            </button>
          </div>
        ) : totalOrders > 0 ? (
          <>
            {/* Current Orders */}
            {currentOrders.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg text-gray-800 mb-4">
                  {t('orders.currentOrders')}
                </h2>
                <div className="space-y-4">
                  {currentOrders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </section>
            )}

            {/* Order History */}
            {orderHistory.length > 0 && (
              <section>
                <h2 className="text-lg text-gray-800 mb-4">
                  {t('orders.orderHistory')}
                </h2>
                <div className="space-y-4">
                  {orderHistory.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              </section>
            )}
          </>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl text-gray-800 mb-2">{t('orders.emptyTitle')}</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              {t('orders.emptyMessage')}
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              {t('orders.startShopping')}
            </button>
          </div>
        )}
      </div>
      </div>
      <Footer />
    </main>
  );
}
