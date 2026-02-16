import { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, PieChart } from 'lucide-react';
import api from '../../lib/api';

interface CostAnalysis {
  total_cost_per_ton: number;
  raw_materials_cost: number;
  labor_cost: number;
  energy_cost: number;
  maintenance_cost: number;
  margin: number;
  profitability_rate: number;
}

export default function CostsPage() {
  const [analysis, setAnalysis] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  useEffect(() => {
    fetchCostAnalysis();
  }, [period]);

  const fetchCostAnalysis = async () => {
    setLoading(true);
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      if (period === 'week') {
        startDate.setDate(endDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(endDate.getMonth() - 1);
      } else {
        startDate.setMonth(endDate.getMonth() - 3);
      }

      const response = await api.get('/costs/analysis', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      setAnalysis(response.data.data);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'analyse:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Coûts et Rentabilité</h1>
          <p className="text-gray-600">Analyse des coûts de production et rentabilité</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'week' ? 'bg-malao-orange text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'month' ? 'bg-malao-orange text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Mois
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'quarter' ? 'bg-malao-orange text-white' : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            Trimestre
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Chargement...</div>
        </div>
      ) : (
        <>
          {}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Coût par tonne</h3>
                <DollarSign className="w-5 h-5 text-malao-orange" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {analysis?.total_cost_per_ton.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) || '-'} FCFA
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Marge</h3>
                <TrendingUp className="w-5 h-5 text-malao-green" />
              </div>
              <p className="text-3xl font-bold text-malao-green">
                {analysis?.margin.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) || '-'} FCFA
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Taux de rentabilité</h3>
                <PieChart className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {analysis?.profitability_rate ? `${analysis.profitability_rate.toFixed(1)}%` : '-'}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500">Période</h3>
              </div>
              <p className="text-2xl font-bold text-gray-900 capitalize">{period}</p>
            </div>
          </div>

          {}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Répartition des coûts</h2>
            {analysis ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Matières premières</span>
                    <span className="text-sm font-bold text-gray-900">
                      {analysis.raw_materials_cost.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-malao-orange h-2 rounded-full"
                      style={{
                        width: `${(analysis.raw_materials_cost / analysis.total_cost_per_ton) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Main d'œuvre</span>
                    <span className="text-sm font-bold text-gray-900">
                      {analysis.labor_cost.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${(analysis.labor_cost / analysis.total_cost_per_ton) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Énergie</span>
                    <span className="text-sm font-bold text-gray-900">
                      {analysis.energy_cost.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${(analysis.energy_cost / analysis.total_cost_per_ton) * 100}%`
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Maintenance</span>
                    <span className="text-sm font-bold text-gray-900">
                      {analysis.maintenance_cost.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 h-2 rounded-full"
                      style={{
                        width: `${(analysis.maintenance_cost / analysis.total_cost_per_ton) * 100}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <PieChart className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Aucune donnée disponible</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

