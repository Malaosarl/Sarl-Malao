import { useEffect, useState } from 'react';
import { Plus, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import api from '../../lib/api';
import Modal from '../../components/common/Modal';

interface InventoryItem {
  id: string;
  name: string;
  type: 'raw_material' | 'product';
  current_stock: number;
  min_stock_level: number;
  max_stock_level: number;
  is_low_stock: boolean;
  stock_percentage: number;
  unit: string;
}

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'low_stock' | 'raw_material' | 'product'>('all');
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockType, setStockType] = useState<'in' | 'out'>('in');

  useEffect(() => {
    fetchInventory();
  }, [filter]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter === 'low_stock') params.low_stock_only = 'true';
      if (filter === 'raw_material') params.type = 'raw_material';
      if (filter === 'product') params.type = 'product';

      const response = await api.get('/inventory', { params });
      setItems(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des stocks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stocks</h1>
          <p className="text-gray-600">Gestion des stocks et inventaire</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setStockType('in'); setShowStockModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-malao-green text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Entrée
          </button>
          <button
            onClick={() => { setStockType('out'); setShowStockModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Sortie
          </button>
        </div>
      </div>

      {}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-malao-orange text-white' : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          Tous
        </button>
        <button
          onClick={() => setFilter('low_stock')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
            filter === 'low_stock' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Stock bas
        </button>
        <button
          onClick={() => setFilter('raw_material')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'raw_material' ? 'bg-malao-orange text-white' : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          Matières premières
        </button>
        <button
          onClick={() => setFilter('product')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'product' ? 'bg-malao-orange text-white' : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          Produits finis
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total items</p>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
            </div>
            <Package className="w-8 h-8 text-malao-orange" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stock bas</p>
              <p className="text-2xl font-bold text-red-600">
                {items.filter(i => i.is_low_stock).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Valeur totale</p>
              <p className="text-2xl font-bold text-malao-green">-</p>
            </div>
            <TrendingUp className="w-8 h-8 text-malao-green" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rotation</p>
              <p className="text-2xl font-bold text-blue-600">-</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Inventaire</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Chargement...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Aucun item en stock</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Stock actuel</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Min</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Max</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Niveau</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{item.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          {item.type === 'raw_material' ? 'MP' : 'PF'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {item.current_stock} {item.unit}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.min_stock_level} {item.unit}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{item.max_stock_level} {item.unit}</td>
                      <td className="px-4 py-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              item.stock_percentage < 20 ? 'bg-red-600' :
                              item.stock_percentage < 50 ? 'bg-yellow-500' : 'bg-malao-green'
                            }`}
                            style={{ width: `${Math.min(item.stock_percentage, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 mt-1">{item.stock_percentage.toFixed(0)}%</span>
                      </td>
                      <td className="px-4 py-3">
                        {item.is_low_stock ? (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                            Stock bas
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {}
      <Modal
        isOpen={showStockModal}
        onClose={() => setShowStockModal(false)}
        title={stockType === 'in' ? 'Nouvelle entrée de stock' : 'Nouvelle sortie de stock'}
        size="md"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          try {
            await api.post('/inventory/movements', {
              item_id: formData.get('item_id'),
              type: stockType,
              quantity: parseFloat(formData.get('quantity') as string),
              unit_price: parseFloat(formData.get('unit_price') as string) || 0,
              reason: formData.get('reason') || '',
            });
            setShowStockModal(false);
            fetchInventory();
          } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de l\'enregistrement');
          }
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Item
              </label>
              <select
                name="item_id"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
              >
                <option value="">Sélectionner un item</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.current_stock} {item.unit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantité
              </label>
              <input
                type="number"
                name="quantity"
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix unitaire (FCFA)
              </label>
              <input
                type="number"
                name="unit_price"
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Raison
              </label>
              <textarea
                name="reason"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
                placeholder="Raison de l'entrée/sortie"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  stockType === 'in' ? 'bg-malao-green hover:bg-green-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {stockType === 'in' ? 'Enregistrer entrée' : 'Enregistrer sortie'}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}

