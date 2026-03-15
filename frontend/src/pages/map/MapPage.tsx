import { useEffect, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MapPin, Factory, Package, Sprout, Truck } from 'lucide-react';
import api from '../../lib/api';
import './MapPage.css';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapboxToken, setMapboxToken] = useState<string | null>(null);

  useEffect(() => {
    // Vérifier le token Mapbox
    const token = import.meta.env.VITE_MAPBOX_TOKEN;
    if (!token) {
      setError('Token Mapbox manquant. Veuillez configurer VITE_MAPBOX_TOKEN dans votre environnement.');
      setLoading(false);
      return;
    }
    setMapboxToken(token);
    fetchLocations();
  }, [mapType]);

  const fetchLocations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Récupérer les sites
      let sites: MapLocation[] = [];
      try {
        const sitesResponse = await api.get('/agropole/sites');
        sites = (sitesResponse.data.data || []).map((site: any) => ({
          id: site.id,
          name: site.name,
          type: 'site' as const,
          latitude: parseFloat(site.latitude || '15.3950'),
          longitude: parseFloat(site.longitude || '-15.1185'),
          description: site.location,
          data: site
        }));
      } catch (err) {
        console.warn('Erreur lors du chargement des sites:', err);
        // Utiliser des données de démonstration
        sites = [
          {
            id: 'site-1',
            name: 'Site Principal MALAO',
            type: 'site' as const,
            latitude: 15.3950,
            longitude: -15.1185,
            description: 'Site de production principal',
            data: { area_hectares: 50 }
          }
        ];
      }

      // Récupérer les parcelles
      let parcels: MapLocation[] = [];
      try {
        const parcelsResponse = await api.get('/agropole/parcels');
        parcels = (parcelsResponse.data.data || []).map((parcel: any) => ({
          id: parcel.id,
          name: `Parcelle ${parcel.id.substring(0, 8)}`,
          type: 'parcel' as const,
          latitude: parseFloat(parcel.latitude || '15.3950'),
          longitude: parseFloat(parcel.longitude || '-15.1185'),
          description: `${parcel.area_hectares} ha - ${parcel.current_crop || 'Non cultivé'}`,
          data: parcel
        }));
      } catch (err) {
        console.warn('Erreur lors du chargement des parcelles:', err);
        // Utiliser des données de démonstration
        parcels = [
          {
            id: 'parcel-1',
            name: 'Parcelle A1',
            type: 'parcel' as const,
            latitude: 15.4050,
            longitude: -15.1085,
            description: '10 ha - Maïs',
            data: { area_hectares: 10, current_crop: 'Maïs' }
          },
          {
            id: 'parcel-2',
            name: 'Parcelle B2',
            type: 'parcel' as const,
            latitude: 15.3850,
            longitude: -15.1285,
            description: '15 ha - Sorgho',
            data: { area_hectares: 15, current_crop: 'Sorgho' }
          }
        ];
      }

      let allLocations = [...sites, ...parcels];
      
      if (mapType === 'sites') {
        allLocations = sites;
      } else if (mapType === 'parcels') {
        allLocations = parcels;
      }

      setLocations(allLocations);
    } catch (error) {
      console.error('Erreur lors du chargement des localisations:', error);
      setError('Impossible de charger les données de la carte');
    } finally {
      setLoading(false);
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
          <div className="flex items-center justify-center">
            <div className="text-gray-500">Chargement de la carte...</div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden map-container">
          {mapboxToken ? (
            <Map
              {...viewState}
              onMove={evt => setViewState(evt.viewState)}
              mapboxAccessToken={mapboxToken}
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
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-gray-500 mb-4">Mapbox n'est pas disponible</div>
                <div className="text-sm text-gray-400">
                  Veuillez configurer VITE_MAPBOX_TOKEN pour utiliser la carte interactive
                </div>
              </div>
            </div>
          )}
        </div>
      )}

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
        <div className="mt-4 text-sm text-gray-500">
          {locations.length} localisation{locations.length > 1 ? 's' : ''} affichée{locations.length > 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}

