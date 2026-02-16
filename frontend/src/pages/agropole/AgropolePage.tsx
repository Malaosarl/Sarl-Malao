import { useEffect, useState } from 'react';
import { Plus, MapPin, Sprout, Wheat } from 'lucide-react';
import api from '../../lib/api';

interface Site {
  id: string;
  name: string;
  location: string;
  area_hectares: number;
  parcel_count?: number;
}

interface Parcel {
  id: string;
  site_id: string;
  site_name?: string;
  area_hectares: number;
  current_crop?: string;
  status: string;
}

export default function AgropolePage() {
  const [activeTab, setActiveTab] = useState<'sites' | 'parcels' | 'crops'>('sites');
  const [sites, setSites] = useState<Site[]>([]);
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'sites') {
      fetchSites();
    } else if (activeTab === 'parcels') {
      fetchParcels();
    }
  }, [activeTab]);

  const fetchSites = async () => {
    setLoading(true);
    try {
      const response = await api.get('/agropole/sites');
      setSites(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des sites:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const response = await api.get('/agropole/parcels');
      setParcels(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des parcelles:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Agropôle</h1>
          <p className="text-gray-600">Gestion des sites, parcelles et cultures</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-malao-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Plus className="w-5 h-5" />
          {activeTab === 'sites' ? 'Nouveau site' : activeTab === 'parcels' ? 'Nouvelle parcelle' : 'Nouvelle culture'}
        </button>
      </div>

      {}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('sites')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'sites'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <MapPin className="w-5 h-5" />
            Sites
          </button>
          <button
            onClick={() => setActiveTab('parcels')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'parcels'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sprout className="w-5 h-5" />
            Parcelles
          </button>
          <button
            onClick={() => setActiveTab('crops')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'crops'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Wheat className="w-5 h-5" />
            Cultures
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
          {activeTab === 'sites' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sites.length === 0 ? (
                <div className="col-span-full text-center py-12 text-gray-500">
                  <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Aucun site enregistré</p>
                </div>
              ) : (
                sites.map((site) => (
                  <div key={site.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">{site.name}</h3>
                      <MapPin className="w-5 h-5 text-malao-orange" />
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{site.location}</p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">Superficie</p>
                        <p className="text-sm font-medium text-gray-900">{site.area_hectares} ha</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Parcelles</p>
                        <p className="text-sm font-medium text-gray-900">{site.parcel_count || 0}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'parcels' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Parcelles</h2>
                {parcels.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Sprout className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucune parcelle enregistrée</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Site</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Superficie</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Culture actuelle</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {parcels.map((parcel) => (
                          <tr key={parcel.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{parcel.site_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{parcel.area_hectares} ha</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{parcel.current_crop || '-'}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                parcel.status === 'active' ? 'bg-green-100 text-green-800' :
                                parcel.status === 'fallow' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {parcel.status}
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

          {activeTab === 'crops' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Cultures</h2>
                <div className="text-center py-12 text-gray-500">
                  <Wheat className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>Gestion des cultures à venir...</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

