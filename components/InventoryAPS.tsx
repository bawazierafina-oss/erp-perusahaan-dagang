import React, { useState } from 'react';
import { Product, ApsForecast, SalesOrder } from '../types';
import { runApsAnalysis } from '../services/geminiService';
import { AlertTriangle, TrendingUp, RefreshCw, CheckCircle, Package } from 'lucide-react';

interface Props {
  inventory: Product[];
  salesHistory: SalesOrder[];
}

const InventoryAPS: React.FC<Props> = ({ inventory, salesHistory }) => {
  const [forecasts, setForecasts] = useState<ApsForecast[]>([]);
  const [loading, setLoading] = useState(false);

  const handleRunAPS = async () => {
    setLoading(true);
    try {
      const results = await runApsAnalysis(inventory, salesHistory);
      setForecasts(results);
    } catch (error) {
      alert("Failed to run APS analysis. Check API Key.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Total Valuation</p>
              <h3 className="text-2xl font-bold text-gray-800">
                Rp {inventory.reduce((acc, item) => acc + (item.stock * item.cost), 0).toLocaleString('id-ID')}
              </h3>
            </div>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Items Low Stock</p>
              <h3 className="text-2xl font-bold text-red-600">
                {inventory.filter(i => i.stock < i.minStock).length}
              </h3>
            </div>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 rounded-xl shadow-lg text-white">
          <div className="flex flex-col h-full justify-between">
            <div>
              <h3 className="font-bold text-lg mb-1">AI APS Agent</h3>
              <p className="text-blue-100 text-sm">Advanced Planning & Scheduling</p>
            </div>
            <button 
              onClick={handleRunAPS}
              disabled={loading}
              className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg transition-all text-sm font-semibold disabled:opacity-50"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : <TrendingUp size={16} />}
              {loading ? 'Analyzing Demand...' : 'Run Forecasting'}
            </button>
          </div>
        </div>
      </div>

      {/* Forecast Results (APS) */}
      {forecasts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50 flex justify-between items-center">
            <h3 className="font-bold text-blue-800 flex items-center gap-2">
              <Package size={18} />
              APS Recommendations (Google AI)
            </h3>
            <span className="text-xs font-mono text-blue-600 bg-blue-100 px-2 py-1 rounded">
              Generated just now
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 font-semibold">Model</th>
                  <th className="px-6 py-3 font-semibold text-center">Current</th>
                  <th className="px-6 py-3 font-semibold text-center">AI Predicted Demand</th>
                  <th className="px-6 py-3 font-semibold text-center">Suggested Order</th>
                  <th className="px-6 py-3 font-semibold">Reasoning</th>
                  <th className="px-6 py-3 font-semibold text-center">Urgency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {forecasts.map((forecast, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-800">{forecast.productName}</td>
                    <td className="px-6 py-4 text-center">{forecast.currentStock}</td>
                    <td className="px-6 py-4 text-center text-blue-600 font-bold">{forecast.predictedDemand}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-indigo-100 text-indigo-700 py-1 px-3 rounded-full font-bold">
                        +{forecast.suggestedOrder}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 max-w-xs">{forecast.reasoning}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        forecast.urgency === 'Critical' ? 'bg-red-100 text-red-700' :
                        forecast.urgency === 'High' ? 'bg-orange-100 text-orange-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {forecast.urgency}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Current Inventory Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-800">Current Warehouse Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Product Name</th>
                <th className="px-6 py-3 text-right">Stock</th>
                <th className="px-6 py-3 text-right">Min. Stock</th>
                <th className="px-6 py-3 text-right">Cost (Avg)</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-gray-600">{item.code}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                  <td className="px-6 py-4 text-right">{item.stock}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{item.minStock}</td>
                  <td className="px-6 py-4 text-right">Rp {item.cost.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-center">
                    {item.stock < item.minStock ? (
                      <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">
                        <AlertTriangle size={10} /> INDENT RISK
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">
                        <CheckCircle size={10} /> OK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryAPS;