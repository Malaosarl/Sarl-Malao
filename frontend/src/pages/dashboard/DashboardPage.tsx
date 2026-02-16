import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../../lib/api';

interface DashboardData {
  production: { today: number; planned: number; rate: number; unit: string };
  quality: { conformityRate: number; unit: string };
  orders: { pending: number; unit: string };
  stock: { total: number; unit: string };
}

const COLORS = ['#F47C20', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [productionData, setProductionData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchProductionData();
    fetchKPIs();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setData(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductionData = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);
      
      const response = await api.get('/production/planning', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      setProductionData(response.data.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des données de production:', error);
    }
  };

  const fetchKPIs = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);
      
      const response = await api.get('/production/kpis', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      setKpis(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement des KPIs:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">Tableau de bord</h1>
        <p className="text-gray-700 text-base break-words">Vue d'ensemble de la production MALAO</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI Cards */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Production du jour</h3>
          <p className="text-3xl font-bold text-malao-orange break-words">
            {data?.production.today.toFixed(2) || '0'} {data?.production.unit || 't'}
          </p>
          <p className="text-sm text-gray-700 mt-1 break-words">
            {data?.production.rate || 0}% de l'objectif
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Taux de conformité</h3>
          <p className="text-3xl font-bold text-malao-green break-words">
            {data?.quality.conformityRate || 0}%
          </p>
          <p className="text-sm text-gray-700 mt-1 break-words">Contrôles qualité (30 derniers jours)</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Commandes en cours</h3>
          <p className="text-3xl font-bold text-blue-600 break-words">
            {data?.orders.pending || 0}
          </p>
          <p className="text-sm text-gray-700 mt-1 break-words">À traiter</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Stock disponible</h3>
          <p className="text-3xl font-bold text-purple-600 break-words">
            {data?.stock.total.toFixed(2) || '0'} {data?.stock.unit || 't'}
          </p>
          <p className="text-sm text-gray-700 mt-1 break-words">En inventaire</p>
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 break-words">Production (7 derniers jours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={productionData.length > 0 ? productionData.map((item: any) => ({
              date: new Date(item.production_date || item.date).toLocaleDateString('fr-FR', { weekday: 'short' }),
              planned: parseFloat(item.total_planned || item.quantity_planned || 0),
              actual: parseFloat(item.total_quantity || item.quantity_produced || 0),
            })) : [
              { date: 'Lun', planned: 0, actual: 0 },
              { date: 'Mar', planned: 0, actual: 0 },
              { date: 'Mer', planned: 0, actual: 0 },
              { date: 'Jeu', planned: 0, actual: 0 },
              { date: 'Ven', planned: 0, actual: 0 },
              { date: 'Sam', planned: 0, actual: 0 },
              { date: 'Dim', planned: 0, actual: 0 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} />
              <Legend wrapperStyle={{ color: '#111827' }} />
              <Line type="monotone" dataKey="planned" stroke="#9CA3AF" strokeWidth={2} name="Planifié" />
              <Line type="monotone" dataKey="actual" stroke="#F47C20" strokeWidth={2} name="Réalisé" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 break-words">Répartition des stocks</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Matières premières', value: 45 },
                  { name: 'Produits finis', value: 30 },
                  { name: 'En-cours', value: 15 },
                  { name: 'Emballages', value: 10 },
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {[
                  { name: 'Matières premières', value: 45 },
                  { name: 'Produits finis', value: 30 },
                  { name: 'En-cours', value: 15 },
                  { name: 'Emballages', value: 10 },
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 break-words">Commandes par statut</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { status: 'En attente', count: data?.orders.pending || 0 },
              { status: 'Confirmées', count: 12 },
              { status: 'En production', count: 8 },
              { status: 'Prêtes', count: 5 },
              { status: 'Livrées', count: 25 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" stroke="#374151" />
              <YAxis stroke="#374151" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} />
              <Bar dataKey="count" fill="#F47C20" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 break-words">Taux de conformité (30 derniers jours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[
              { week: 'Sem 1', rate: 95 },
              { week: 'Sem 2', rate: 97 },
              { week: 'Sem 3', rate: 94 },
              { week: 'Sem 4', rate: 96 },
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" stroke="#374151" />
              <YAxis domain={[90, 100]} stroke="#374151" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', color: '#111827' }} />
              <Line type="monotone" dataKey="rate" stroke="#4CAF50" strokeWidth={3} name="Taux (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

