import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION } from "../constants.ts";
import { Product, SalesOrder, ApsForecast } from "../types.ts";

// Initialize Gemini Client
// Check if API Key is set correctly
const apiKey = process.env.API_KEY;
if (!apiKey || apiKey === "__API_KEY__") {
  console.error("CRITICAL: API_KEY is missing or invalid. Please check netlify.toml or local configuration.");
}
const ai = new GoogleGenAI({ apiKey: apiKey || "" });

const MODEL_FAST = 'gemini-2.5-flash';

/**
 * APS Agent: Analyzes inventory and sales history to predict demand.
 */
export const runApsAnalysis = async (inventory: Product[], salesHistory: SalesOrder[]): Promise<ApsForecast[]> => {
  try {
    const prompt = `
      Analyze the following inventory levels and recent sales history for a motorcycle dealer.
      
      Current Inventory:
      ${JSON.stringify(inventory.map(i => ({ name: i.name, stock: i.stock, min: i.minStock, id: i.id })))}

      Recent Sales Context:
      ${JSON.stringify(salesHistory.slice(0, 5))} (Sample data)

      Task: 
      1. Identify items with critical low stock (Indent risk).
      2. Predict short-term demand based on general market knowledge of these models (Vario/Beat are high volume).
      3. Suggest order quantities.
      
      Return a JSON array.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: AI_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              productId: { type: Type.STRING },
              productName: { type: Type.STRING },
              currentStock: { type: Type.NUMBER },
              predictedDemand: { type: Type.NUMBER },
              suggestedOrder: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              urgency: { type: Type.STRING, enum: ['Low', 'Medium', 'High', 'Critical'] },
            },
            required: ['productId', 'productName', 'currentStock', 'predictedDemand', 'suggestedOrder', 'reasoning', 'urgency']
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as ApsForecast[];
    }
    return [];
  } catch (error) {
    console.error("APS Agent Error:", error);
    throw error;
  }
};

/**
 * Audit Agent: Checks a transaction for anomalies.
 */
export const auditTransaction = async (transactionData: any): Promise<{ safe: boolean; analysis: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_FAST,
      contents: [{ role: 'user', parts: [{ text: `Audit this transaction for fraud risk or anomalies: ${JSON.stringify(transactionData)}` }] }],
      config: {
        systemInstruction: "You are an Internal Audit AI. Analyze for fraud, unusual amounts, or policy violations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            safe: { type: Type.BOOLEAN },
            analysis: { type: Type.STRING }
          }
        }
      }
    });
    
    if (response.text) {
      return JSON.parse(response.text);
    }
    return { safe: true, analysis: "AI unavailable" };
  } catch (error) {
    return { safe: true, analysis: "Audit service error" };
  }
};

// ==========================================
// IDP ENGINE CONFIGURATION (SYNERGY TRADE)
// ==========================================

const IDP_SYSTEM_PROMPT = `
You are an AI model yang berperan sebagai *Intelligent Document Processing (IDP) Engine* untuk aplikasi ERP bernama **Synergy Trade**.
Tugas Anda adalah membaca, memahami, mengekstrak, dan menstrukturkan data dari berbagai dokumen fisik maupun digital, lalu mengubahnya menjadi format data siap pakai untuk modul ERP (Penjualan, Pembelian, Persediaan, Akuntansi, dan Master Data).

## 1. Jenis Dokumen yang Harus Dipahami

Model harus dapat mengenali dan memproses dokumen berikut:

### Transaksi
* Surat Jalan
* Faktur Penjualan (Sales Invoice)
* Faktur Pembelian
* Sales Order
* Purchase Order
* Kwitansi
* Bukti Kas Masuk
* Bukti Kas Keluar

### Persediaan & Logistik
* Receiving Goods Note / BAPB
* Stock Opname Sheet
* Packing List
* Material Request

### Dokumen Identitas / Legal
* KTP / ID Card
* NPWP
* NIB/SIUP

Model harus otomatis mengidentifikasi jenis dokumen meskipun user tidak memilihnya.

## 2. Format Output

Seluruh hasil ekstraksi wajib dikembalikan dalam format JSON sesuai schema yang didefinisikan (document_type, confidence_score, extracted_fields, table_data, warnings).

### Field Rules
* **document_type** = tipe dokumen yang dikenali
* **confidence_score** = tingkat keyakinan AI dalam mengenali dokumen (0-100)
* **extracted_fields** = informasi utama header dokumen.
* **table_data** = daftar item/barang (row-by-row).
* **warnings** = catatan AI jika ada ketidakjelasan.

## 3. Aturan Pembacaan Dokumen

1. AI harus mengekstrak data meskipun dokumen buram, miring, atau scan rendah.
2. Jika data tidak tersedia, isi dengan **null**, jangan tebak.
3. Jika ada tabel, prioritaskan ekstraksi **item row-by-row**.
4. Jika dokumen adalah CSV/XLSX, baca seluruh kolom secara terstruktur.
5. Jika dokumen berupa kartu identitas (KTP), ekstrak NIK, Nama, TTL, Alamat, dll.

## 4. Behavior Requirements

* Gunakan bahasa Indonesia formal.
* Jangan memberikan komentar yang tidak diminta.
* Output harus *clean*, *structured*, dan *siap dikirim* ke modul ERP.
* Jangan pernah meminta klarifikasi—selalu gunakan kemampuan inference maksimal.
* Jika dokumen tidak dikenali, kembalikan document_type: "unknown" dengan warning yang sesuai.

Anda bertindak sebagai **AI Document Scanner paling cerdas** untuk sistem ERP modern berbasis cloud-native.
`;

const IDP_RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    document_type: { type: Type.STRING, description: "Jenis dokumen yang dikenali (e.g., Surat Jalan, Faktur, KTP)" },
    confidence_score: { type: Type.NUMBER, description: "0-100 score" },
    extracted_fields: {
      type: Type.OBJECT,
      description: "Field utama dokumen (Header)",
      properties: {
        // Transaksi / Umum
        nomor_surat_jalan: { type: Type.STRING, nullable: true },
        tanggal: { type: Type.STRING, nullable: true },
        nama_customer: { type: Type.STRING, nullable: true },
        nama_supplier: { type: Type.STRING, nullable: true },
        alamat: { type: Type.STRING, nullable: true },
        no_po: { type: Type.STRING, nullable: true },
        no_invoice: { type: Type.STRING, nullable: true },
        total_transaksi: { type: Type.NUMBER, nullable: true },
        
        // Identitas (KTP)
        nik: { type: Type.STRING, nullable: true },
        nama_lengkap: { type: Type.STRING, nullable: true },
        tempat_tanggal_lahir: { type: Type.STRING, nullable: true },
        jenis_kelamin: { type: Type.STRING, nullable: true },
        alamat_identitas: { type: Type.STRING, nullable: true },
        rt_rw: { type: Type.STRING, nullable: true },
        kelurahan: { type: Type.STRING, nullable: true },
        kecamatan: { type: Type.STRING, nullable: true },
        agama: { type: Type.STRING, nullable: true },
        status_perkawinan: { type: Type.STRING, nullable: true },
        pekerjaan: { type: Type.STRING, nullable: true },
      }
    },
    table_data: {
      type: Type.ARRAY,
      description: "Daftar item/barang dari tabel dokumen",
      items: {
        type: Type.OBJECT,
        properties: {
          kode_barang: { type: Type.STRING, nullable: true },
          nama_barang: { type: Type.STRING, nullable: true },
          qty: { type: Type.NUMBER, nullable: true },
          satuan: { type: Type.STRING, nullable: true },
          harga_satuan: { type: Type.NUMBER, nullable: true },
          subtotal: { type: Type.NUMBER, nullable: true },
          // Field Spesifik Otomotif (Synergy Trade)
          nomor_rangka: { type: Type.STRING, nullable: true },
          nomor_mesin: { type: Type.STRING, nullable: true }
        }
      }
    },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Catatan jika ada ketidakjelasan data"
    }
  },
  required: ['document_type', 'confidence_score', 'extracted_fields', 'table_data', 'warnings']
};

/**
 * IDP Agent: Extracts data from documents (Surat Jalan, KTP, etc.)
 */
export const extractDocumentData = async (
  fileBase64: string, 
  mimeType: string, 
  docTypeHint?: string
): Promise<any> => {
    try {
        const parts: any[] = [];
        
        // Handle CSV/Text formats via Text Prompt
        const lowerMime = mimeType.toLowerCase();
        if (lowerMime.includes('csv') || lowerMime.includes('text') || lowerMime.includes('json')) {
           try {
             // Basic Base64 decoding for text
             const textContent = atob(fileBase