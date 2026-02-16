import { useEffect, useState } from 'react';
import { Plus, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../lib/api';
import Modal from '../../components/common/Modal';

interface ProductionOrder {
  id: string;
  product_id: string;
  product_name?: string;
  quantity_planned: number;
  quantity_produced: number;
  status: string;
  scheduled_date: string;
  production_date?: string;
}

interface Formula {
  id: string;
  name: string;
  version: string;
  product_id: string;
  is_active: boolean;
  ingredients: any[];
}

export default function ProductionPage() {
  const [activeTab, setActiveTab] = useState<'planning' | 'formulas' | 'kpis'>('planning');
  const [orders, setOrders] = useState<ProductionOrder[]>([]);
  const [formulas, setFormulas] = useState<Formula[]>([]);
  const [loading, setLoading] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'planning') {
      fetchOrders();
    } else if (activeTab === 'formulas') {
      fetchFormulas();
    }
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/production/planning');
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des ordres:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFormulas = async () => {
    setLoading(true);
    try {
      const response = await api.get('/production/formulas');
      setFormulas(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des formules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Production</h1>
          <p className="text-gray-600">Gestion de la production industrielle</p>
        </div>
        <div className="flex gap-3">
          {activeTab === 'planning' && (
            <button
              onClick={() => setShowOrderModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-malao-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvel ordre
            </button>
          )}
          {activeTab === 'formulas' && (
            <button
              onClick={() => setShowFormulaModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-malao-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle formule
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('planning')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'planning'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Planning
            </div>
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'formulas'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Formules
          </button>
          <button
            onClick={() => setActiveTab('kpis')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'kpis'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              KPIs
            </div>
          </button>
        </nav>
      </div>

      {}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      ) : (
        <>
          {activeTab === 'planning' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ordres de production</h2>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucun ordre de production</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Produit</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Planifié</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Produit</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{order.product_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{order.quantity_planned} t</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{order.quantity_produced || 0} t</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {order.scheduled_date ? new Date(order.scheduled_date).toLocaleDateString('fr-FR') : '-'}
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

          {activeTab === 'formulas' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Formules de production</h2>
                {formulas.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucune formule enregistrée</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {formulas.map((formula) => (
                      <div key={formula.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">{formula.name}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            formula.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {formula.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">Version {formula.version}</p>
                        {formula.ingredients && formula.ingredients.length > 0 && (
                          <div className="text-sm text-gray-500">
                            <p className="font-medium mb-1">Ingrédients:</p>
                            <ul className="list-disc list-inside space-y-1">
                              {formula.ingredients.slice(0, 3).map((ing: any, idx: number) => (
                                <li key={idx}>{ing.raw_material_name}: {ing.percentage}%</li>
                              ))}
                              {formula.ingredients.length > 3 && (
                                <li className="text-gray-400">+{formula.ingredients.length - 3} autres</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'kpis' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Taux d'atteinte</h3>
                <p className="text-3xl font-bold text-malao-orange">-</p>
                <p className="text-sm text-gray-500 mt-1">Production vs planifié</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Rendement</h3>
                <p className="text-3xl font-bold text-malao-green">-</p>
                <p className="text-sm text-gray-500 mt-1">Efficacité moyenne</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Consommation énergétique</h3>
                <p className="text-3xl font-bold text-blue-600">-</p>
                <p className="text-sm text-gray-500 mt-1">kWh par tonne</p>
              </div>
            </div>
          )}
        </>
      )}

      {}
      <Modal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        title="Nouvel ordre de production"
        size="lg"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          try {
            await api.post('/production/orders', {
              product_id: formData.get('product_id'),
              quantity_planned: parseFloat(formData.get('quantity_planned') as string),
              scheduled_date: formData.get('scheduled_date'),
            });
            setShowOrderModal(false);
            fetchOrders();
          } catch (error) {
            console.error('Erreur lors de la création:', error);
            alert('Erreur lors de la création de l\'ordre');
          }
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produit
              </label>
              <input
                type="text"
                name="product_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
                placeholder="ID du produit"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité planifiée (tonnes)
              </label>
              <input
                type="number"
                name="quantity_planned"
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date prévue
              </label>
              <input
                type="date"
                name="scheduled_date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
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

      {/* Modal Créer Formule */}
      <Modal
        isOpen={showFormulaModal}
        onClose={() => setShowFormulaModal(false)}
        title="Nouvelle formule de production"
        size="xl"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          try {
            await api.post('/production/formulas', {
              product_id: formData.get('product_id'),
              name: formData.get('name'),
              version: formData.get('version'),
              is_active: formData.get('is_active') === 'on',
            });
            setShowFormulaModal(false);
            fetchFormulas();
          } catch (error) {
            console.error('Erreur lors de la création:', error);
            alert('Erreur lors de la création de la formule');
          }
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produit
              </label>
              <input
                type="text"
                name="product_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
                placeholder="ID du produit"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la formule
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  name="version"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
                  placeholder="v1.0"
                />
              </div>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                defaultChecked
                className="w-4 h-4 text-malao-orange border-gray-300 rounded focus:ring-malao-orange"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Formule active
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowFormulaModal(false)}
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
