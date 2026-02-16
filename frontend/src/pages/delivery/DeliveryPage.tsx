import { useEffect, useState } from 'react';
import { Plus, Truck, MapPin, Package } from 'lucide-react';
import api from '../../lib/api';

interface Vehicle {
  id: string;
  license_plate: string;
  type: string;
  capacity_tonnes: number;
  status: string;
  current_location?: string;
}

interface Delivery {
  id: string;
  order_id: string;
  order_number?: string;
  vehicle_id: string;
  vehicle_plate?: string;
  client_name?: string;
  delivery_date: string;
  status: string;
  destination: string;
}

export default function DeliveryPage() {
  const [activeTab, setActiveTab] = useState<'deliveries' | 'vehicles'>('deliveries');
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'deliveries') {
      fetchDeliveries();
    } else if (activeTab === 'vehicles') {
      fetchVehicles();
    }
  }, [activeTab]);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const response = await api.get('/delivery/deliveries');
      setDeliveries(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.get('/delivery/vehicles');
      setVehicles(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des véhicules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Livraisons</h1>
          <p className="text-gray-600">Gestion des livraisons et véhicules</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-malao-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Plus className="w-5 h-5" />
          {activeTab === 'deliveries' ? 'Nouvelle livraison' : 'Nouveau véhicule'}
        </button>
      </div>

      {}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('deliveries')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'deliveries'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Package className="w-5 h-5" />
            Livraisons
          </button>
          <button
            onClick={() => setActiveTab('vehicles')}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'vehicles'
                ? 'border-malao-orange text-malao-orange'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Truck className="w-5 h-5" />
            Véhicules
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
          {activeTab === 'deliveries' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Livraisons</h2>
                {deliveries.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucune livraison</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">N° Commande</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Client</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Destination</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Véhicule</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Statut</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {deliveries.map((delivery) => (
                          <tr key={delivery.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">{delivery.order_number || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{delivery.client_name || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600 flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {delivery.destination}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">{delivery.vehicle_plate || 'N/A'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {new Date(delivery.delivery_date).toLocaleDateString('fr-FR')}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(delivery.status)}`}>
                                {delivery.status}
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

          {activeTab === 'vehicles' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Véhicules</h2>
                {vehicles.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Aucun véhicule enregistré</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{vehicle.license_plate}</h3>
                            <p className="text-sm text-gray-600">{vehicle.type}</p>
                          </div>
                          <Truck className="w-6 h-6 text-malao-orange" />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Capacité:</span>
                            <span className="font-medium">{vehicle.capacity_tonnes} t</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Statut:</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              vehicle.status === 'available' ? 'bg-green-100 text-green-800' :
                              vehicle.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {vehicle.status}
                            </span>
                          </div>
                          {vehicle.current_location && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{vehicle.current_location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

