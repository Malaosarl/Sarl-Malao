import { useEffect, useState } from 'react';
import { Plus, ShoppingCart, FileText, CheckCircle, Clock, Download } from 'lucide-react';
import api from '../../lib/api';
import Modal from '../../components/common/Modal';

interface Order {
  id: string;
  order_number: string;
  client_id: string;
  client_name?: string;
  total_amount: number;
  status: string;
  order_date: string;
  delivery_date?: string;
}

interface Quote {
  id: string;
  quote_number: string;
  client_id: string;
  client_name?: string;
  total_amount: number;
  status: string;
  valid_until: string;
}

export default function SalesPage() {
  const [activeTab, setActiveTab] = useState<'orders' | 'quotes' | 'clients'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    } else if (activeTab === 'quotes') {
      fetchQuotes();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sales/orders');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuotes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/sales/quotes');
      setQuotes(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des devis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Ventes</h1>
          <p className="text-gray-600">Gestion des ventes, devis et commandes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-malao-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Plus className="w-5 h-5" />
          {activeTab === 'orders' ? 'Nouvelle commande' : activeTab === 'quotes' ? 'Nouveau devis' : 'Nouveau client'}
        </button>
      </div>

      {}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ShoppingCart className="w-5 h-5" />
            Commandes
          </button>
          <button
            onClick={() => setActiveTab('quotes')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'quotes'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <FileText className="w-5 h-5" />
            Devis
          </button>
          <button
            onClick={() => setActiveTab('clients')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'clients'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Clients
          </button>
        </nav>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      ) : (
        <>
          {activeTab === 'orders' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Commandes</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucune commande</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">N° Commande</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Montant</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{order.order_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{order.client_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {order.total_amount.toLocaleString('fr-FR')} FCFA
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(order.order_date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'quotes' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Devis</h2>
                {quotes.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucun devis</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">N° Devis</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Montant</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Valide jusqu'au</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {quotes.map((quote) => (
                          <tr key={quote.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{quote.quote_number}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{quote.client_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {quote.total_amount.toLocaleString('fr-FR')} FCFA
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(quote.status)}`}>
                                {quote.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'clients' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Clients</h2>
                <div className="text-center py-12 text-gray-500">
                  <p>Gestion des clients à venir...</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Nouvelle Commande */}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Nouvelle commande"
        size="lg"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          try {
            await api.post('/sales/orders', {
              client_id: formData.get('client_id'),
              delivery_date: formData.get('delivery_date'),
              items: JSON.parse(formData.get('items') as string || '[]'),
            });
            setShowOrderModal(false);
            fetchOrders();
          } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création de la commande');
          }
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                type="text"
                name="client_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
                placeholder="ID du client"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de livraison
              </label>
              <input
                type="date"
                name="delivery_date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Articles (JSON)
              </label>
              <textarea
                name="items"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent font-mono text-sm"
                placeholder='[{"product_id": "...", "quantity": 10, "unit_price": 5000}]'
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowOrderModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-malao-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal Nouveau Devis */}
      <Modal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        title="Nouveau devis"
        size="lg"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          try {
            await api.post('/sales/quotes', {
              client_id: formData.get('client_id'),
              valid_until: formData.get('valid_until'),
              items: JSON.parse(formData.get('items') as string || '[]'),
            });
            setShowQuoteModal(false);
            fetchQuotes();
          } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création du devis');
          }
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client ID
              </label>
              <input
                type="text"
                name="client_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
                placeholder="ID du client"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valide jusqu'au
              </label>
              <input
                type="date"
                name="valid_until"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Articles (JSON)
              </label>
              <textarea
                name="items"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent font-mono text-sm"
                placeholder='[{"product_id": "...", "quantity": 10, "unit_price": 5000}]'
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowQuoteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-malao-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Créer
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

