import { useEffect, useState } from 'react';
import { Plus, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import api from '../../lib/api';
import Modal from '../../components/common/Modal';

interface QualityControl {
  id: string;
  product_id: string;
  product_name?: string;
  control_date: string;
  is_conform: boolean;
  test_results: any;
  notes?: string;
}

interface NonConformity {
  id: string;
  product_id: string;
  product_name?: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
}

export default function QualityPage() {
  const [activeTab, setActiveTab] = useState<'controls' | 'nonconformities' | 'stats'>('controls');
  const [controls, setControls] = useState<QualityControl[]>([]);
  const [nonConformities, setNonConformities] = useState<NonConformity[]>([]);
  const [loading, setLoading] = useState(false);
  const [showControlModal, setShowControlModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'controls') {
      fetchControls();
    } else if (activeTab === 'nonconformities') {
      fetchNonConformities();
    }
  }, [activeTab]);

  const fetchControls = async () => {
    setLoading(true);
    try {
      const response = await api.get('/quality/controls');
      setControls(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des contrôles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNonConformities = async () => {
    setLoading(true);
    try {
      const response = await api.get('/quality/nonconformities');
      setNonConformities(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des non-conformités:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Qualité</h1>
          <p className="text-gray-600">Contrôles qualité et gestion des non-conformités</p>
        </div>
        <button
          onClick={() => activeTab === 'controls' && setShowControlModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-malao-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'controls' ? 'Nouveau contrôle' : 'Nouvelle non-conformité'}
        </button>
      </div>

      {}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('controls')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'controls'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Contrôles
          </button>
          <button
            onClick={() => setActiveTab('nonconformities')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'nonconformities'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <XCircle className="w-5 h-5" />
            Non-conformités
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === 'stats'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Statistiques
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
          {activeTab === 'controls' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contrôles qualité</h2>
                {controls.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucun contrôle enregistré</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Produit</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Résultat</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {controls.map((control) => (
                          <tr key={control.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {control.product_name || 'N/A'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(control.control_date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-3">
                              {control.is_conform ? (
                                <span className="flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  <CheckCircle className="w-4 h-4" />
                                  Conforme
                                </span>
                              ) : (
                                <span className="flex items-center gap-2 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  <XCircle className="w-4 h-4" />
                                  Non conforme
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{control.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'nonconformities' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Non-conformités</h2>
                {nonConformities.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucune non-conformité</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nonConformities.map((nc) => (
                      <div key={nc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{nc.product_name || 'N/A'}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                nc.severity === 'high' ? 'bg-red-100 text-red-800' :
                                nc.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {nc.severity}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                nc.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                nc.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {nc.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{nc.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(nc.created_at).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Taux de conformité</h3>
                <p className="text-3xl font-bold text-malao-green">-</p>
                <p className="text-sm text-gray-500 mt-1">30 derniers jours</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Non-conformités</h3>
                <p className="text-3xl font-bold text-red-600">{nonConformities.length}</p>
                <p className="text-sm text-gray-500 mt-1">En cours</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Contrôles</h3>
                <p className="text-3xl font-bold text-blue-600">{controls.length}</p>
                <p className="text-sm text-gray-500 mt-1">Total</p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Nouveau Contrôle Qualité */}
      <Modal
        isOpen={showControlModal}
        onClose={() => setShowControlModal(false)}
        title="Nouveau contrôle qualité"
        size="lg"
      >
        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          try {
            await api.post('/quality/controls', {
              product_id: formData.get('product_id'),
              control_date: formData.get('control_date'),
              is_conform: formData.get('is_conform') === 'on',
              test_results: JSON.parse(formData.get('test_results') as string || '{}'),
              notes: formData.get('notes') || '',
            });
            setShowControlModal(false);
            fetchControls();
          } catch (error) {
            console.error('Erreur:', error);
            alert('Erreur lors de la création du contrôle');
          }
        }}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Produit ID
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
                Date de contrôle
              </label>
              <input
                type="date"
                name="control_date"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_conform"
                id="is_conform"
                defaultChecked
                className="w-4 h-4 text-malao-orange border-gray-300 rounded focus:ring-malao-orange"
              />
              <label htmlFor="is_conform" className="ml-2 text-sm text-gray-700">
                Conforme
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Résultats des tests (JSON)
              </label>
              <textarea
                name="test_results"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent font-mono text-sm"
                placeholder='{"test1": "pass", "test2": "pass"}'
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-malao-orange focus:border-transparent"
                placeholder="Notes additionnelles"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowControlModal(false)}
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

