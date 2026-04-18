import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Package, Calendar, Eye, ShoppingBag } from 'lucide-react';
import { getUserOrders } from '../../services/order.service';
import { isAuthenticated } from '../../services/authService';
import { getBookCoverUrl } from '../../utils/imageUtils';
import { getLanguageCode, getFullLanguageName } from '../../data/booksData';

const formatOrderDate = (dateString, locale = 'fr-FR') => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' });
};

const transformOrder = (apiOrder, locale) => ({
  id: apiOrder.uniqueId || apiOrder.id,
  date: formatOrderDate(apiOrder.createdAt, locale),
  status: apiOrder.status?.toLowerCase() || 'pending',
  total: apiOrder.totalAmount || 0,
  shippingCost: apiOrder.shippingCost || 0,
  items: apiOrder.orderItems?.map(item => {
    const isPack = item.bookPackId != null;
    const isBook = !isPack && item.bookId != null;
    const imageUrl = isPack
      ? (item.bookId ? getBookCoverUrl(item.bookId) : null)
      : isBook ? getBookCoverUrl(item.bookId) : null;
    return {
      id: isBook ? item.bookId : item.bookPackId,
      type: isBook ? 'book' : 'pack',
      title: isBook ? item.bookTitle : item.bookPackTitle,
      author: isBook ? item.bookAuthor : null,
      image: imageUrl,
      quantity: item.quantity || 1,
      unitPrice: item.unitPrice || 0,
      totalPrice: item.totalPrice || 0,
    };
  }) || [],
});

function StatusBadge({ status }) {
  const { t } = useTranslation();
  const cfg = {
    pending:   'bg-amber-50 text-amber-700 border-amber-200',
    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
    shipped:   'bg-purple-50 text-purple-700 border-purple-200',
    delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50 text-red-600 border-red-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${cfg[status] || cfg.pending}`}>
      {t(`orders.status.${status}`)}
    </span>
  );
}

function OrderCard({ order }) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-mono text-gray-600">{order.id}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Calendar className="w-3 h-3" />
            <span>{order.date}</span>
          </div>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {/* Book covers strip */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {order.items.map((item, i) => (
          <div key={i} className="flex-shrink-0 relative">
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                className="w-12 h-16 object-cover rounded-lg shadow-sm"
              />
            ) : (
              <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-300" />
              </div>
            )}
            {item.type === 'pack' && (
              <div className="absolute -top-1 -right-1 bg-[#00417a] text-white text-[8px] font-bold px-1 py-0.5 rounded-md shadow">
                Pack
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Expanded detail rows */}
      {isExpanded && (
        <div className="border-t border-gray-100 pt-3 mb-3 space-y-3">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="relative flex-shrink-0">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-10 h-14 object-cover rounded-lg" />
                ) : (
                  <div className="w-10 h-14 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 line-clamp-2 leading-snug">{item.title}</p>
                {item.author && <p className="text-[11px] text-gray-400 mt-0.5">{item.author}</p>}
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-gray-500">×{item.quantity}</span>
                  <span className="text-[11px] font-medium text-gray-700">
                    {item.unitPrice} {t('orders.currency')}
                  </span>
                  {item.type === 'pack' && (
                    <span className="text-[10px] font-semibold text-[#00417a] bg-blue-50 px-1.5 py-0.5 rounded">Pack</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          {order.shippingCost > 0 && (
            <div className="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>{t('orders.shippingCost', 'Frais de livraison')}</span>
              <span>{order.shippingCost} {t('orders.currency')}</span>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-[#00417a] text-xs font-medium hover:opacity-70 transition-opacity"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>{isExpanded ? t('orders.hideDetails') : t('orders.viewDetails')}</span>
        </button>
        <span className="text-sm font-bold text-gray-800">
          {order.total}
          <span className="text-xs font-normal text-gray-400 ml-1">{t('orders.currency')}</span>
        </span>
      </div>
    </div>
  );
}

export default function OrdersTab() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [currentOrders, setCurrentOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated()) { navigate('/auth'); return; }
      try {
        setLoading(true);
        setError(null);
        const response = await getUserOrders(0, 100);
        if (response?.page?.content) {
          const all = response.page.content.map(o => transformOrder(o, i18n.language));
          setCurrentOrders(all.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status)));
          setOrderHistory(all.filter(o => ['delivered', 'cancelled'].includes(o.status)));
        } else {
          setCurrentOrders([]);
          setOrderHistory([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load orders');
        if (err.message?.includes('Unauthorized')) navigate('/auth');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [navigate, i18n.language]);

  const totalOrders = currentOrders.length + orderHistory.length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-[3px] border-[#00417a] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400 text-sm">{t('orders.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-red-300" />
        </div>
        <p className="text-gray-500 text-sm text-center max-w-xs">{error}</p>
      </div>
    );
  }

  if (totalOrders === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mb-5 shadow-sm">
          <ShoppingBag className="w-10 h-10 text-gray-200" />
        </div>
        <h3 className="text-gray-700 font-semibold mb-1">{t('orders.emptyTitle')}</h3>
        <p className="text-gray-400 text-sm text-center max-w-xs mb-6 leading-relaxed">{t('orders.emptyMessage')}</p>
        <button
          onClick={() => navigate('/allbooks')}
          className="px-6 py-2.5 bg-[#00417a] text-white rounded-xl text-sm font-semibold hover:bg-[#003366] transition-colors shadow-sm"
        >
          {t('orders.startShopping')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-6">
      {currentOrders.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            {t('orders.currentOrders')}
          </h3>
          <div className="space-y-3">
            {currentOrders.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        </section>
      )}
      {orderHistory.length > 0 && (
        <section>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            {t('orders.orderHistory')}
          </h3>
          <div className="space-y-3">
            {orderHistory.map(order => <OrderCard key={order.id} order={order} />)}
          </div>
        </section>
      )}
    </div>
  );
}
