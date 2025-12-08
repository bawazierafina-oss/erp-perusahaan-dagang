import React, { useState } from 'react';
import { Product, SalesOrder, JournalEntry } from '../types.ts';
import { Plus, Save, FileText, Check } from 'lucide-react';
import { auditTransaction } from '../services/geminiService.ts';

interface Props {
  inventory: Product[];
  onCreateOrder: (order: SalesOrder, autoJournal: JournalEntry[], cogsJournal: JournalEntry[]) => void;
}

const SalesModule: React.FC<Props> = ({ inventory, onCreateOrder }) => {
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [customerName, setCustomerName] = useState<string>('');
  const [auditResult, setAuditResult] = useState<{safe: boolean, analysis: string} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const product = inventory.find(p => p.id === selectedProduct);
  const totalAmount = product ? product.price * quantity : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !customerName) return;

    setIsProcessing(true);
    setAuditResult(null);

    const newOrder: SalesOrder = {
      id: `SO-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      customer: customerName,
      items: [{ productId: product.id, quantity, price: product.price }],
      total: totalAmount,
      status: 'Confirmed',
      paymentStatus: 'Paid' // Simplification: Immediate payment
    };

    // 1. Audit Agent Check (Fraud Prevention)
    const audit = await auditTransaction(newOrder);
    setAuditResult(audit);

    if (!audit.safe) {
      setIsProcessing(false);
      return; // Stop if fraud detected
    }

    // 2. Auto-Accounting Agent Logic
    // Journal 1: Revenue (Cash vs Sales)
    const revJournal: JournalEntry = {
      id: `JE-${Date.now()}-REV`,
      date: newOrder.date,
      description: `Sales Revenue ${newOrder.id}`,
      reference: newOrder.id,
      lines: [
        { accountId: '1101', accountName: 'Cash / Bank', debit: totalAmount, credit: 0 },
        { accountId: '4101', accountName: 'Sales Revenue', debit: 0, credit: totalAmount }
      ]
    };

    // Journal 2: COGS (COGS vs Inventory)
    const cogsAmount = product.cost * quantity;
    const cogsJournal: JournalEntry = {
      id: `JE-${Date.now()}-COGS`,
      date: newOrder.date,
      description: `COGS Recognition ${newOrder.id}`,
      reference: newOrder.id,
      lines: [
        { accountId: '5101', accountName: 'Cost of Goods Sold', debit: cogsAmount, credit: 0 },
        { accountId: '1301', accountName: 'Inventory Asset', debit: 0, credit: cogsAmount }
      ]
    };

    setTimeout(() => {
        onCreateOrder(newOrder, [revJournal], [cogsJournal]);
        setCustomerName('');
        setQuantity(1);
        setIsProcessing(false);
    }, 1500); // Simulate network delay
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Order Form */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FileText className="text-blue-600" />
                New Sales Order (Order-to-Cash)
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                        <input 
                            type="text" 
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="e.g. CV Makmur Sentosa"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input 
                            type="date" 
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50"
                            value={new Date().toISOString().split('T')[0]}
                            readOnly
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Model</label>
                    <select 
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        value={selectedProduct}
                        onChange={(e) => setSelectedProduct(e.target.value)}
                        required
                    >
                        <option value="">Select Unit...</option>
                        {inventory.map(p => (
                            <option key={p.id} value={p.id}>{p.code} - {p.name} (Stock: {p.stock})</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                        <input 
                            type="number" 
                            min="1"
                            max={product ? product.stock : 99}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                        />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                         <div className="w-full p-2 bg-gray-100 rounded-lg font-bold text-gray-800 text-right">
                            Rp {totalAmount.toLocaleString('id-ID')}
                         </div>
                    </div>
                </div>

                <div className="pt-4 flex items-center gap-4">
                    <button 
                        type="submit" 
                        disabled={isProcessing || !selectedProduct}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:bg-gray-400"
                    >
                        {isProcessing ? 'Processing Agent...' : <><Save size={18} /> Process Order</>}
                    </button>
                </div>
            </form>
        </div>
      </div>

      {/* Real-time Status & AI Feedback */}
      <div className="space-y-6">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-xl shadow-lg">
            <h3 className="font-bold border-b border-slate-700 pb-2 mb-4">Auto-Accounting Agent</h3>
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-300">
                   <div className={`w-3 h-3 rounded-full ${selectedProduct ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'}`}></div>
                   Inventory Check
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                   <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-blue-400 animate-pulse' : 'bg-gray-600'}`}></div>
                   Fraud / Audit Check
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300">
                   <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`}></div>
                   Journal Generation (Rev & COGS)
                </div>
            </div>
        </div>

        {/* Audit Result Display */}
        {auditResult && (
            <div className={`p-4 rounded-xl border ${auditResult.safe ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h4 className={`font-bold mb-1 ${auditResult.safe ? 'text-green-800' : 'text-red-800'}`}>
                    {auditResult.safe ? 'Audit Passed' : 'Audit Alert!'}
                </h4>
                <p className="text-sm text-gray-700">{auditResult.analysis}</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SalesModule;