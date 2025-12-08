import React, { useState } from 'react';
import { extractDocumentData } from '../services/geminiService.ts';
import { Upload, ScanLine, FileText, Check, Loader, Copy, UserSquare, Truck, FileSpreadsheet, AlertTriangle, Table } from 'lucide-react';

const DocumentScanner: React.FC = () => {
  const [docType, setDocType] = useState<'SURAT_JALAN' | 'KTP'>('SURAT_JALAN');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult(null);
      setErrorMsg(null);
    }
  };

  const handleScan = async () => {
    if (!previewUrl || !selectedFile) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const base64Data = previewUrl.split(',')[1];
      const data = await extractDocumentData(base64Data, selectedFile.type, docType);
      setResult(data);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "Gagal memindai dokumen.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderFilePreview = () => {
    if (!selectedFile || !previewUrl) return null;

    if (selectedFile.type.startsWith('image/')) {
        return <img src={previewUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg shadow-sm" />;
    }

    let icon = <FileText size={48} className="mb-2 text-gray-400" />;
    if (selectedFile.type === 'application/pdf') {
        icon = <FileText size={48} className="mb-2 text-red-500" />;
    } else if (selectedFile.type.includes('sheet') || selectedFile.type.includes('csv') || selectedFile.type.includes('excel')) {
        icon = <FileSpreadsheet size={48} className="mb-2 text-green-600" />;
    }

    return (
        <div className="w-full h-48 bg-gray-50 rounded-lg border border-gray-200 flex flex-col items-center justify-center text-gray-500">
            {icon}
            <span className="font-bold text-gray-700 max-w-[80%] truncate">{selectedFile.name}</span>
            <span className="text-xs text-gray-400 mt-1 uppercase">{selectedFile.type.split('/')[1] || 'FILE'}</span>
        </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-start justify-between">
            <div>
                <h2 className="text-3xl font-bold mb-2">Synergy IDP Scanner</h2>
                <p className="text-blue-200 max-w-xl">
                    Mesin Pemroses Dokumen Cerdas untuk ERP Synergy Trade.
                    Mendukung ekstraksi otomatis dari Surat Jalan, Invoice, KTP, dan CSV.
                </p>
            </div>
            <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm">
                <ScanLine size={40} className="text-blue-300" />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Controls & Upload */}
        <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-3">Konteks Dokumen</label>
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <button 
                        onClick={() => setDocType('SURAT_JALAN')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            docType === 'SURAT_JALAN' 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-500'
                        }`}
                    >
                        <Truck size={24} className="mb-2" />
                        <span className="text-xs font-bold">Logistik / Transaksi</span>
                    </button>
                    <button 
                        onClick={() => setDocType('KTP')}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                            docType === 'KTP' 
                            ? 'border-blue-600 bg-blue-50 text-blue-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-500'
                        }`}
                    >
                        <UserSquare size={24} className="mb-2" />
                        <span className="text-xs font-bold">Identitas / KTP</span>
                    </button>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50 relative hover:bg-gray-100 transition-colors cursor-pointer group">
                    <input 
                        type="file" 
                        accept="image/*,application/pdf,text/csv"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {previewUrl ? (
                        <div className="relative w-full">
                            {renderFilePreview()}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                <p className="text-white font-medium text-sm">Ganti File</p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <Upload size={40} className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm font-medium text-gray-600">Klik untuk upload</p>
                            <p className="text-xs text-gray-400 mt-1">Image, PDF, CSV</p>
                        </div>
                    )}
                </div>

                {errorMsg && (
                    <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex gap-2 items-start">
                        <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <button 
                    onClick={handleScan}
                    disabled={!selectedFile || isProcessing}
                    className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200"
                >
                    {isProcessing ? (
                        <><Loader className="animate-spin" size={20} /> Memproses AI...</>
                    ) : (
                        <><ScanLine size={20} /> Ekstrak Data</>
                    )}
                </button>
            </div>
        </div>

        {/* Right Column: Results */}
        <div className="lg:col-span-2">
            {result ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden animate-fade-in">
                    <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-green-800 flex items-center gap-2">
                                <Check size={20} /> Ekstraksi Berhasil
                            </h3>
                            <p className="text-xs text-green-700 mt-1">
                                Tipe: <span className="font-bold">{result.document_type}</span> | Akurasi: <span className="font-bold">{result.confidence_score}%</span>
                            </p>
                        </div>
                        <span className="text-xs font-mono text-green-600 bg-white px-2 py-1 rounded border border-green-200">
                            JSON Ready
                        </span>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* 1. Header Information (Extracted Fields) */}
                        {result.extracted_fields && Object.keys(result.extracted_fields).length > 0 && (
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Informasi Utama</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {Object.entries(result.extracted_fields).map(([key, value]) => {
                                        if(!value) return null;
                                        // Formatting keys nicely
                                        const label = key.replace(/_/g, ' ');
                                        return (
                                            <div key={key} className="bg-gray-50 p-2.5 rounded border border-gray-100">
                                                <label className="text-[10px] text-gray-400 block mb-0.5 uppercase">{label}</label>
                                                <p className="font-medium text-gray-800 text-sm truncate" title={String(value)}>{String(value)}</p>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 2. Table Data (Line Items) */}
                        {result.table_data && result.table_data.length > 0 && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-2 text-sm font-bold text-gray-600">
                                    <Table size={16} /> Item Barang / Jasa
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-600">
                                            <tr>
                                                <th className="px-4 py-2 text-left">Kode/Nama Barang</th>
                                                <th className="px-4 py-2 text-center">Qty</th>
                                                <th className="px-4 py-2 text-left">Satuan</th>
                                                <th className="px-4 py-2 text-right">Harga</th>
                                                <th className="px-4 py-2 text-right">Total</th>
                                                <th className="px-4 py-2 text-left">Detail Lain</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.table_data.map((item: any, i: number) => (
                                                <tr key={i} className="border-t border-gray-100 hover:bg-gray-50">
                                                    <td className="px-4 py-2 font-medium">
                                                        <div className="text-gray-900">{item.nama_barang}</div>
                                                        {item.kode_barang && <div className="text-xs text-gray-500 font-mono">{item.kode_barang}</div>}
                                                    </td>
                                                    <td className="px-4 py-2 text-center font-bold">{item.qty}</td>
                                                    <td className="px-4 py-2 text-gray-600">{item.satuan || '-'}</td>
                                                    <td className="px-4 py-2 text-right">
                                                        {item.harga_satuan ? item.harga_satuan.toLocaleString('id-ID') : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-right font-medium">
                                                        {item.subtotal ? item.subtotal.toLocaleString('id-ID') : '-'}
                                                    </td>
                                                    <td className="px-4 py-2 text-xs">
                                                        {item.nomor_rangka && <div className="text-gray-600">VIN: {item.nomor_rangka}</div>}
                                                        {item.nomor_mesin && <div className="text-gray-600">Eng: {item.nomor_mesin}</div>}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* 3. Warnings */}
                        {result.warnings && result.warnings.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <h5 className="text-yellow-800 font-bold text-xs flex items-center gap-1 mb-1">
                                    <AlertTriangle size={12} /> Catatan AI (Perlu Verifikasi)
                                </h5>
                                <ul className="list-disc list-inside text-xs text-yellow-700">
                                    {result.warnings.map((w: string, i: number) => <li key={i}>{w}</li>)}
                                </ul>
                            </div>
                        )}

                        {/* Raw JSON Debugger */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                            <details className="text-xs">
                                <summary className="cursor-pointer text-blue-600 hover:underline mb-2 font-medium">Lihat Raw JSON (Untuk Developer)</summary>
                                <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-[200px] text-green-400 font-mono shadow-inner">
                                    <pre>{JSON.stringify(result, null, 2)}</pre>
                                </div>
                            </details>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                        <button onClick={() => setResult(null)} className="text-sm text-gray-600 hover:text-gray-800 px-4 py-2 font-medium">Batal</button>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-6 py-2 rounded-lg shadow-sm transition-colors">
                            Kirim ke Modul ERP
                        </button>
                    </div>
                </div>
            ) : (
                <div className="h-full bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 p-12 min-h-[400px]">
                    <FileText size={48} className="mb-4 opacity-30" />
                    <p className="font-medium text-lg text-gray-500">Belum ada data</p>
                    <p className="text-sm mt-1 max-w-xs text-center">Silakan upload dokumen di sebelah kiri dan klik tombol "Ekstrak Data"</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DocumentScanner;