import { useState } from 'react';
import { ArrowLeft, Package, Calendar, Eye } from 'lucide-react';

// Mock orders data
const mockOrders = {
  current: [
    {
      id: "CMD-2024-001",
      date: "15 Jan 2024",
      status: "confirmed",
      total: 4500,
      items: [
        {
          title: "L'Étranger",
          author: "Albert Camus",
          image: "https://images.unsplash.com/photo-1760120482171-d9d5468f75fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
        },
        {
          title: "Le Petit Prince",
          author: "Antoine de Saint-Exupéry",
          image: "https://images.unsplash.com/photo-1620647885779-064b00c4c139?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
        }
      ]
    },
    {
      id: "CMD-2024-002",
      date: "12 Jan 2024",
      status: "shipped",
      total: 2200,
      items: [
        {
          title: "1984",
          author: "George Orwell",
          image: "https://images.unsplash.com/photo-1679180174039-c84e26f1a78d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
        }
      ]
    }
  ],
  history: [
    {
      id: "CMD-2023-089",
      date: "28 Déc 2023",
      status: "delivered",
      total: 3500,
      items: [
        {
          title: "Les Misérables",
          author: "Victor Hugo",
          image: "https://images.unsplash.com/photo-1746913361326-01c3214c7540?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
        }
      ]
    },
    {
      id: "CMD-2023-075",
      date: "10 Déc 2023",
      status: "delivered",
      total: 5000,
      items: [
        {
          title: "Le Comte de Monte-Cristo",
          author: "Alexandre Dumas",
          image: "https://images.unsplash.com/photo-1760120482171-d9d5468f75fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
        },
        {
          title: "Madame Bovary",
          author: "Gustave Flaubert",
          image: "https://images.unsplash.com/photo-1620647885779-064b00c4c139?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
        }
      ]
    },
    {
      id: "CMD-2023-042",
      date: "5 Nov 2023",
      status: "cancelled",
      total: 1800,
      items: [
        {
          title: "La Peste",
          author: "Albert Camus",
          image: "https://images.unsplash.com/photo-1679180174039-c84e26f1a78d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200"
        }
      ]
    }
  ]
};

// Status Badge Component
function StatusBadge({ status }) {
  const statusConfig = {
    pending: {
      label: "En attente",
      color: "bg-yellow-100 text-yellow-700 border-yellow-300"
    },
    confirmed: {
      label: "Confirmée",
      color: "bg-blue-100 text-blue-700 border-blue-300"
    },
    shipped: {
      label: "Expédiée",
      color: "bg-purple-100 text-purple-700 border-purple-300"
    },
    delivered: {
      label: "Livrée",
      color: "bg-green-100 text-green-700 border-green-300"
    },
    cancelled: {
      label: "Annulée",
      color: "bg-red-100 text-red-700 border-red-300"
    }
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-xs border ${config.color}`}>
      {config.label}
    </span>
  );
}

// Order Card Component
function OrderCard({ order }) {
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
          <div key={index} className="flex-shrink-0">
            <img
              src={item.image}
              alt={item.title}
              className="w-16 h-20 object-cover rounded"
            />
          </div>
        ))}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-3 mb-3 space-y-2">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.title}
                className="w-12 h-16 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-gray-800 line-clamp-1">{item.title}</h4>
                <p className="text-xs text-gray-500">{item.author}</p>
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
          <span>{isExpanded ? 'Masquer' : 'Voir les détails'}</span>
        </button>
        <div className="text-right">
          <span className="text-gray-800">
            {order.total} <span className="text-xs text-gray-600">DZD</span>
          </span>
        </div>
      </div>
    </div>
  );
}

export default function Orders() {
  const [currentOrders] = useState(mockOrders.current);
  const [orderHistory] = useState(mockOrders.history);

  const handleBack = () => {
    console.log('Navigate back to profile');
  };

  const totalOrders = currentOrders.length + orderHistory.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-blue-500 to-blue-600 text-white pt-8 pb-6 px-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour</span>
          </button>

          <div className="flex items-center gap-3">
            <Package className="w-7 h-7" />
            <div>
              <h1 className="text-2xl">Mes Commandes</h1>
              <p className="text-blue-100 text-sm">
                {totalOrders} {totalOrders > 1 ? 'commandes' : 'commande'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {totalOrders > 0 ? (
          <>
            {/* Current Orders */}
            {currentOrders.length > 0 && (
              <section className="mb-8">
                <h2 className="text-lg text-gray-800 mb-4">
                  Commandes en cours
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
                  Historique
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
            <h2 className="text-xl text-gray-800 mb-2">Aucune commande</h2>
            <p className="text-gray-500 text-center max-w-md mb-6">
              Vous n'avez pas encore passé de commande 📦
            </p>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Commencer mes achats
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
