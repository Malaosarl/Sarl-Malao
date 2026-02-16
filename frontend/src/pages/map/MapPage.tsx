import { useEffect, useState, useRef } from 'react';
import Map, { Marker, Popup, Source, Layer } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Factory, Package, Sprout, Truck } from 'lucide-react';
import api from '../../lib/api';

interface MapLocation {
  id: string;
  name: string;
  type: 'site' | 'parcel' | 'warehouse' | 'delivery_point';
  latitude: number;
  longitude: number;
  description?: string;
  data?: any;
}

export default function MapPage() {
  const [viewState, setViewState] = useState({
    longitude: -15.1185, 
    latitude: 15.3950,
    zoom: 12
  });
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [mapType, setMapType] = useState<'sites' | 'parcels' | 'all'>('all');

  useEffect(() => {
    fetchLocations();
  }, [mapType]);

  const fetchLocations = async () => {
    try {
      
      const sitesResponse = await api.get('/agropole/sites');
      const sites = (sitesResponse.data.data || []).map((site: any) => ({
        id: site.id,
        name: site.name,
        type: 'site' as const,
        latitude: parseFloat(site.latitude || '15.3950'),
        longitude: parseFloat(site.longitude || '-15.1185'),
        description: site.location,
        data: site
      }));

      
      const parcelsResponse = await api.get('/agropole/parcels');
      const parcels = (parcelsResponse.data.data || []).map((parcel: any) => ({
        id: parcel.id,
        name: `Parcelle ${parcel.id.substring(0, 8)}`,
        type: 'parcel' as const,
        latitude: parseFloat(parcel.latitude || '15.3950'),
        longitude: parseFloat(parcel.longitude || '-15.1185'),
        description: `${parcel.area_hectares} ha - ${parcel.current_crop || 'Non cultivé'}`,
        data: parcel
      }));

      let allLocations = [...sites, ...parcels];
      
      if (mapType === 'sites') {
        allLocations = sites;
      } else if (mapType === 'parcels') {
        allLocations = parcels;
      }

      setLocations(allLocations);
    } catch (error) {
      console.error('Erreur lors du chargement des localisations:', error);
    }
  };

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'site':
        return <Factory className="w-6 h-6 text-malao-orange" />;
      case 'parcel':
        return <Sprout className="w-6 h-6 text-malao-green" />;
      case 'warehouse':
        return <Package className="w-6 h-6 text-blue-600" />;
      case 'delivery_point':
        return <Truck className="w-6 h-6 text-purple-600" />;
      default:
        return <MapPin className="w-6 h-6 text-gray-600" />;
    }
  };

  const getMarkerColor = (type: string) => {
    switch (type) {
      case 'site': return 'bg-malao-orange';
      case 'parcel': return 'bg-malao-green';
      case 'warehouse': return 'bg-blue-600';
      case 'delivery_point': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Cartographie</h1>
          <p className="text-gray-600">Visualisation des sites, parcelles et points d'intérêt</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMapType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mapType === 'all' ? 'bg-malao-orange text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Tout
          </button>
          <button
            onClick={() => setMapType('sites')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mapType === 'sites' ? 'bg-malao-orange text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Sites
          </button>
          <button
            onClick={() => setMapType('parcels')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              mapType === 'parcels' ? 'bg-malao-orange text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Parcelles
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
        <Map
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN ?? ''}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
        >
          {locations.map((location) => (
            <Marker
              key={location.id}
              longitude={location.longitude}
              latitude={location.latitude}
              anchor="bottom"
            >
              <button
                onClick={() => setSelectedLocation(location)}
                className={`${getMarkerColor(location.type)} text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform cursor-pointer`}
              >
                {getMarkerIcon(location.type)}
              </button>
            </Marker>
          ))}

          {selectedLocation && (
            <Popup
              longitude={selectedLocation.longitude}
              latitude={selectedLocation.latitude}
              anchor="top"
              onClose={() => setSelectedLocation(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-3">
                <h3 className="font-bold text-gray-900 mb-1">{selectedLocation.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{selectedLocation.description}</p>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedLocation.type === 'site' ? 'bg-malao-orange text-white' :
                    selectedLocation.type === 'parcel' ? 'bg-malao-green text-white' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedLocation.type}
                  </span>
                </div>
                {selectedLocation.data && (
                  <div className="mt-2 text-xs text-gray-500">
                    {selectedLocation.data.area_hectares && (
                      <p>Superficie: {selectedLocation.data.area_hectares} ha</p>
                    )}
                    {selectedLocation.data.current_crop && (
                      <p>Culture: {selectedLocation.data.current_crop}</p>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          )}
        </Map>
      </div>

      {/* Légende */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Légende</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Factory className="w-5 h-5 text-malao-orange" />
            <span className="text-sm text-gray-700">Sites</span>
          </div>
          <div className="flex items-center gap-2">
            <Sprout className="w-5 h-5 text-malao-green" />
            <span className="text-sm text-gray-700">Parcelles</span>
          </div>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">Entrepôts</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-purple-600" />
            <span className="text-sm text-gray-700">Points de livraison</span>
          </div>
        </div>
      </div>
    </div>
  );
}

