import { Product, SalesOrder, JournalEntry, PurchaseOrder } from './types.ts';

export const INITIAL_INVENTORY: Product[] = [
  { id: '1', code: 'H-VAR-160', name: 'Honda Vario 160 ABS', category: 'Matic', stock: 5, minStock: 10, price: 29500000, cost: 26000000, location: 'WH-A1' },
  { id: '2', code: 'H-BEAT-DLX', name: 'Honda Beat Deluxe', category: 'Matic', stock: 45, minStock: 20, price: 18900000, cost: 16500000, location: 'WH-A2' },
  { id: '3', code: 'H-PCX-160', name: 'Honda PCX 160 CBS', category: 'Matic', stock: 2, minStock: 8, price: 32600000, cost: 29000000, location: 'WH-B1' },
  { id: '4', code: 'H-CRF-150', name: 'Honda CRF 150L', category: 'Sport', stock: 12, minStock: 5, price: 35700000, cost: 31000000, location: 'WH-C1' },
];

export const INITIAL_SALES: SalesOrder[] = [
  { 
    id: 'SO-2023-001', date: '2023-10-01', customer: 'Budi Santoso', 
    items: [{ productId: '2', quantity: 1, price: 18900000 }], 
    total: 18900000, status: 'Shipped', paymentStatus: 'Paid' 
  },
  { 
    id: 'SO-2023-002', date: '2023-10-02', customer: 'CV Maju Jaya', 
    items: [{ productId: '1', quantity: 2, price: 29500000 }], 
    total: 59000000, status: 'Confirmed', paymentStatus: 'Partial' 
  },
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: 'PO-2023-100',
    supplier: 'PT Wahana Makmur Sejati (WMS)',
    date: '2023-10-25',
    expectedDate: '2023-10-28',
    status: 'Open',
    referenceNo: 'WMS-SO-998877',
    total: 260000000,
    items: [
      { productId: '1', quantity: 10, cost: 26000000 } // Expecting 10 Varios
    ]
  }
];

export const INITIAL_JOURNALS: JournalEntry[] = [
  {
    id: 'JE-001', date: '2023-10-01', description: 'Sales Revenue SO-2023-001', reference: 'SO-2023-001',
    lines: [
      { accountId: '1101', accountName: 'Cash on Hand', debit: 18900000, credit: 0 },
      { accountId: '4101', accountName: 'Sales Revenue', debit: 0, credit: 18900000 }
    ]
  },
  {
    id: 'JE-002', date: '2023-10-01', description: 'COGS Recognition SO-2023-001', reference: 'SO-2023-001',
    lines: [
      { accountId: '5101', accountName: 'Cost of Goods Sold', debit: 16500000, credit: 0 },
      { accountId: '1301', accountName: 'Inventory', debit: 0, credit: 16500000 }
    ]
  }
];

export const AI_SYSTEM_INSTRUCTION = `
You are the AI Assistant for 'Synergy Trade', a large motorcycle dealer and trading company.
You have access to ERP data including Inventory, Sales, Purchasing and Finance.
Your goal is to assist with efficiency, prevent fraud, optimize stock (APS), and automate data entry (IDP).
Tone: Professional, analytical, and helpful.
Currency: Indonesian Rupiah (IDR).
`;