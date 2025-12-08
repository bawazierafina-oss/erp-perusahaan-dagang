import React from 'react';
import { JournalEntry } from '../types';
import { FileSpreadsheet, Search } from 'lucide-react';

interface Props {
  journals: JournalEntry[];
}

const FinanceModule: React.FC<Props> = ({ journals }) => {
  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">General Ledger</h2>
            <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="Search Reference..." 
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center gap-2">
                <FileSpreadsheet size={18} className="text-gray-500"/>
                <span className="font-semibold text-gray-700">Posted Journals (Real-time Integration)</span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 font-medium">Date</th>
                            <th className="px-6 py-3 font-medium">Ref #</th>
                            <th className="px-6 py-3 font-medium">Description</th>
                            <th className="px-6 py-3 font-medium">Account</th>
                            <th className="px-6 py-3 text-right font-medium">Debit</th>
                            <th className="px-6 py-3 text-right font-medium">Credit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {journals.slice().reverse().map((journal) => (
                            <React.Fragment key={journal.id}>
                                {journal.lines.map((line, idx) => (
                                    <tr key={`${journal.id}-${idx}`} className={`hover:bg-gray-50 ${idx === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                        <td className="px-6 py-2 text-gray-600 whitespace-nowrap">
                                            {idx === 0 ? journal.date : ''}
                                        </td>
                                        <td className="px-6 py-2 text-blue-600 font-mono text-xs">
                                            {idx === 0 ? journal.reference : ''}
                                        </td>
                                        <td className="px-6 py-2 text-gray-800 font-medium">
                                            {idx === 0 ? journal.description : ''}
                                        </td>
                                        <td className="px-6 py-2">
                                            <span className="text-gray-500 mr-2 font-mono text-xs">{line.accountId}</span>
                                            {line.accountName}
                                        </td>
                                        <td className="px-6 py-2 text-right font-mono text-gray-700">
                                            {line.debit > 0 ? line.debit.toLocaleString('id-ID') : '-'}
                                        </td>
                                        <td className="px-6 py-2 text-right font-mono text-gray-700">
                                            {line.credit > 0 ? line.credit.toLocaleString('id-ID') : '-'}
                                        </td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-100 h-1"><td colSpan={6}></td></tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );
};

export default FinanceModule;