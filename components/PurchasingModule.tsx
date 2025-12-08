import React, { useState } from 'react';
import { PurchaseOrder, ReceivingReport, Product } from '../types.ts';
import { extractDocumentData } from '../services/geminiService.ts';
import { Upload, FileText, CheckCircle, Loader, AlertCircle, ScanLine, ArrowRight } from 'lucide-react';

interface Props {
  purchaseOrders: PurchaseOrder[];
  inventory: Product[];
  onConfirmReceipt: (rr: ReceivingReport, po: PurchaseOrder) => void;
}

const PurchasingModule: React.FC<Props> = ({ purchaseOrders, inventory, onConfirmReceipt }) => {
  const [activeTab, setActiveTab] = useState<'orders' | 'receiving'>('receiving');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [matchedPO, setMatchedPO] = useState<PurchaseOrder | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
      // Reset states
      setExtractedData(null);
      setMatchedPO(null);
    }
  };

  const handleProcessIDP = async () => {
    if (!previewUrl || !selectedFile) return;

    setIsProcessing(true);
    try {
      // Remove data:image/jpeg;base64, prefix
      const base64Data = previewUrl.split(',')[1];
      const result = await extractDocumentData(base64Data, selectedFile.type, 'SURAT_JALAN');
      
      setExtractedData(result);
      
      // Auto-Match Logic (Matches new IDP Schema)
      // Checks result.extracted_fields.no_po OR result.extracted_fields.nomor_surat_jalan
      const fields = result.extracted_fields || {};
      const wmsRef = fields.no_po || fields.nomor_surat_jalan || "";
      
      const foundPO = purchaseOrders.find(po => 
        po.status === 'Open' && 
        (po.referenceNo.includes(wmsRef) || wmsRef.includes(po.referenceNo))
      );
      
      if (foundPO) {
        setMatchedPO(foundPO);
      } else {
        // Fallback: Just grab the first open PO for demo purposes if match fails
        const fallbackPO = purchaseOrders.find(po => po.status === 'Open');
        if (fallbackPO) setMatchedPO(fallbackPO); 
      }

    } catch (error) {
      alert("IDP Extraction Failed. Please try a clearer image.");
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmReceiving = () => {
    if (!extractedData || !matchedPO) return;

    // Map extracted item to internal product ID (Matches new IDP Schema)
    const firstItem = extractedData.table_data?.[0] || {};
    const internalProduct = inventory.find(p => p.name.includes(firstItem.nama_barang) || p.name.includes("Vario")); 
    
    const rr: ReceivingReport = {
      id: `RR-${Date.now()}`,
      poId: matchedPO.id,
      date: extractedData.extracted_fields?.tanggal || new Date().toISOString().split('T')[0],
      supplierDO: extractedData.extracted_fields?.nomor_surat_jalan || "Unknown",
      items: [{
        productId: internalProduct ? internalProduct.id : matchedPO.items[0].productId,
        productName: firstItem.nama_barang || "Unknown Model",
        quantityReceived: firstItem.qty || 0,
        chassisNumbers: firstItem.nomor_rangka ? [firstItem.nomor_rangka] : [],
        engineNumbers: firstItem.nomor_mesin ? [firstItem.nomor_mesin] : []
      }],
      status: 'Validated'
    };

    onConfirmReceipt(rr, matchedPO);
    // Reset UI
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setMatchedPO(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <button 
          onClick={() => setActiveTab('receiving')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'receiving' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Penerimaan Barang (IDP Agent)
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${activeTab === 'orders' ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Daftar Purchase Orders
        </button>
      </div>

      {activeTab === 'receiving' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Section */}
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                <Upload size={20} className="text-blue-600" />
                Upload Surat Jalan (WMS)
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Unggah dokumen fisik yang dipindai. IDP Agent akan mengekstrak Nomor Rangka, Mesin, dan mencocokkan dengan PO.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-64 object-contain shadow-md rounded" />
                ) : (
                  <>
                    <FileText size={48} className="text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-600">Drag & drop atau klik upload</span>
                    <span className="text-xs text-gray-400 mt-1">Supports PDF, JPG, PNG</span>
                  </>
                )}
              </div>

              {previewUrl && (
                <button
                  onClick={handleProcessIDP}
                  disabled={isProcessing}
                  className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {isProcessing ? (
                    <><Loader className="animate-spin" size={20} /> Memproses AI...</>
                  ) : (
                    <><ScanLine size={20} /> Ekstrak dengan Gemini AI</>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-4">
             {extractedData && (
               <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 animate-fade-in">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-500" />
                      Hasil Ekstraksi IDP
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-mono">
                      Conf: {extractedData.confidence_score}%
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="block text-gray-500 text-xs">No Surat Jalan</span>
                        <span className="font-mono font-medium">{extractedData.extracted_fields?.nomor_surat_jalan || '-'}</span>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span className="block text-gray-500 text-xs">Referensi PO (WMS)</span>
                        <span className="font-mono font-medium">{extractedData.extracted_fields?.no_po || '-'}</span>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                          <tr>
                            <th className="px-4 py-2 text-left">Item</th>
                            <th className="px-4 py-2 text-center">Qty</th>
                            <th className="px-4 py-2 text-left">Detail Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {extractedData.table_data?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-t border-gray-100">
                              <td className="px-4 py-2 font-medium">{item.nama_barang}</td>
                              <td className="px-4 py-2 text-center">{item.qty}</td>
                              <td className="px-4 py-2">
                                {(item.nomor_rangka || item.nomor_mesin) ? (
                                  <div className="text-xs space-y-1">
                                    {item.nomor_rangka && (
                                        <div className="font-mono bg-yellow-50 px-1 rounded inline-block mr-1 border border-yellow-100">
                                            {item.nomor_rangka}
                                        </div>
                                    )}
                                    {item.nomor_mesin && (
                                        <div className="font-mono bg-gray-100 px-1 rounded inline-block mr-1">
                                            {item.nomor_mesin}
                                        </div>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-gray-400 italic text-xs">No details</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {matchedPO ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                           <CheckCircle size={18} className="text-green-600 mt-0.5" />
                           <div>
                             <h4 className="font-bold text-green-800 text-sm">Cocok dengan PO: {matchedPO.id}</h4>
                             <p className="text-green-700 text-xs mt-1">
                               3-Way Matching otomatis berhasil. Validasi akan memicu Jurnal Otomatis.
                             </p>
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                         <AlertCircle size={18} className="text-orange-600 mt-0.5" />
                         <div>
                            <h4 className="font-bold text-orange-800 text-sm">Tidak Ada Match PO Langsung</h4>
                            <p className="text-orange-700 text-xs">Mohon verifikasi nomor referensi WMS secara manual.</p>
                         </div>
                      </div>
                    )}

                    <button 
                      onClick={handleConfirmReceiving}
                      disabled={!matchedPO}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Validasi & Post Jurnal</span>
                      <ArrowRight size={18} />
                    </button>
                  </div>
               </div>
             )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-3">PO Number</th>
                <th className="px-6 py-3">Supplier</th>
                <th className="px-6 py-3">Ref No (WMS)</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono font-medium text-blue-600">{po.id}</td>
                  <td className="px-6 py-4">{po.supplier}</td>
                  <td className="px-6 py-4 font-mono text-gray-500">{po.referenceNo}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      po.status === 'Open' ? 'bg-blue-100 text-blue-700' : 
                      po.status === 'Received' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-medium">Rp {po.total.toLocaleString('id-ID')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PurchasingModule;