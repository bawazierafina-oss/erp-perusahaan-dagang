import React from 'react';
import { SalesOrder, Product } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, Package, ShoppingBag, Activity } from 'lucide-react';

interface Props {
  inventory: Product[];
  sales: SalesOrder[];
}

const Dashboard: React.FC<Props> = ({ inventory, sales }) => {
  const totalRevenue = sales.reduce((acc, curr) => acc + curr.total, 0);
  const totalStock = inventory.reduce((acc, curr) => acc + curr.stock, 0);
  
  // Prepare Chart Data
  const chartData = sales.map(s => ({
    name: s.id.split('-')[2] || s.date,
    amount: s.total
  }));

  const stockData = inventory.map(i => ({
    name: i.code.split('-')[1], // Shorten name
    stock: i.stock
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI Cards */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <div className="p-2 bg-green-100 text-green-600 rounded-lg"><DollarSign size={20} /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">Rp {(totalRevenue / 1000000).toFixed(1)} M</p>
          <span className="text-xs text-green-600 flex items-center mt-1">
             <Activity size={12} className="mr-1" /> +12.5% vs last month
          </span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Active Orders</h3>
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ShoppingBag size={20} /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{sales.length}</p>
          <span className="text-xs text-gray-400 mt-1">Pending Shipment: 1</span>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-500 text-sm font-medium">Total Units</h3>
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Package size={20} /></div>
          </div>
          <p className="text-2xl font-bold text-gray-800">{totalStock}</p>
          <span className="text-xs text-red-500 mt-1">3 Models below safety stock</span>
        </div>

        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl shadow-sm text-white">
          <h3 className="text-slate-300 text-sm font-medium mb-1">System Health</h3>
          <p className="text-xl font-bold">100% Operational</p>
          <div className="mt-4 flex gap-2">
             <span className="px-2 py-1 bg-white/10 rounded text-xs">Gemini AI Active</span>
             <span className="px-2 py-1 bg-white/10 rounded text-xs">DB Synced</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80">
           <h3 className="font-bold text-gray-800 mb-4">Sales Trend</h3>
           <ResponsiveContainer width="100%" height="100%">
             <LineChart data={chartData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
               <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
               <YAxis stroke="#9ca3af" fontSize={12} />
               <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                  formatter={(value: number) => [`Rp ${value.toLocaleString()}`, 'Revenue']}
               />
               <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 8 }} />
             </LineChart>
           </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-80">
           <h3 className="font-bold text-gray-800 mb-4">Inventory by Model</h3>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={stockData}>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb"/>
               <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
               <YAxis stroke="#9ca3af" fontSize={12} />
               <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px' }} />
               <Bar dataKey="stock" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;