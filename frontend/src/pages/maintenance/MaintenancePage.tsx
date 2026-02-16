import { useEffect, useState } from 'react';
import { Plus, Wrench, Calendar, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

interface Asset {
  id: string;
  name: string;
  type: string;
  status: string;
  last_maintenance_date?: string;
  next_maintenance_date?: string;
}

interface WorkOrder {
  id: string;
  asset_id: string;
  asset_name?: string;
  type: string;
  status: string;
  scheduled_date: string;
  description?: string;
}

export default function MaintenancePage() {
  const [activeTab, setActiveTab] = useState<'assets' | 'workorders' | 'calendar'>('assets');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'assets') {
      fetchAssets();
    } else if (activeTab === 'workorders') {
      fetchWorkOrders();
    }
  }, [activeTab]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await api.get('/maintenance/assets');
      setAssets(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des équipements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/maintenance/workorders');
      setWorkOrders(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des ordres de travail:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'broken': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Maintenance</h1>
          <p className="text-gray-600">Gestion des équipements et maintenance</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-malao-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Plus className="w-5 h-5" />
          {activeTab === 'assets' ? 'Nouvel équipement' : 'Nouvel ordre'}
        </button>
      </div>

      {}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('assets')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'assets'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wrench className="w-5 h-5" />
            Équipements
          </button>
          <button
            onClick={() => setActiveTab('workorders')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'workorders'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Ordres de travail
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'calendar'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Calendar className="w-5 h-5" />
            Calendrier
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
          {activeTab === 'assets' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Équipements</h2>
                {assets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Wrench className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucun équipement enregistré</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Équipement</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Dernière maintenance</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Prochaine maintenance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {assets.map((asset) => (
                          <tr key={asset.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{asset.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{asset.type}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(asset.status)}`}>
                                {asset.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {asset.last_maintenance_date ? new Date(asset.last_maintenance_date).toLocaleDateString('fr-FR') : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {asset.next_maintenance_date ? new Date(asset.next_maintenance_date).toLocaleDateString('fr-FR') : '-'}
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

          {activeTab === 'workorders' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ordres de travail</h2>
                {workOrders.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucun ordre de travail</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {workOrders.map((wo) => (
                      <div key={wo.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{wo.asset_name || 'N/A'}</h3>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                wo.type === 'preventive' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                                {wo.type}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                wo.status === 'completed' ? 'bg-green-100 text-green-800' :
                                wo.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {wo.status}
                              </span>
                            </div>
                            {wo.description && <p className="text-sm text-gray-600 mb-2">{wo.description}</p>}
                            <p className="text-xs text-gray-500">
                              Planifié le {new Date(wo.scheduled_date).toLocaleDateString('fr-FR')}
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

          {activeTab === 'calendar' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Calendrier de maintenance</h2>
                <div className="text-center py-12 text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Calendrier à venir...</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

