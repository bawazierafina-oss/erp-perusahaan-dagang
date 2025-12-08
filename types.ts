export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  FINANCE = 'FINANCE',
  PURCHASING = 'PURCHASING',
  DOCUMENT_SCANNER = 'DOCUMENT_SCANNER'
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  price: number;
  cost: number;
  location: string;
}

export interface SalesOrder {
  id: string;
  date: string;
  customer: string;
  items: { productId: string; quantity: number; price: number }[];
  total: number;
  status: 'Draft' | 'Confirmed' | 'Shipped';
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
}

export interface PurchaseOrder {
  id: string;
  supplier: string;
  date: string;
  expectedDate: string;
  items: { productId: string; quantity: number; cost: number }[];
  total: number;
  status: 'Open' | 'Received' | 'Cancelled';
  referenceNo: string; // WMS SO Number
}

export interface ReceivingReport {
  id: string;
  poId: string;
  date: string;
  supplierDO: string; // Delivery Order / Surat Jalan Number
  items: {
    productId: string;
    productName: string;
    quantityReceived: number;
    chassisNumbers: string[]; // Extracted by IDP
    engineNumbers: string[]; // Extracted by IDP
  }[];
  status: 'Draft' | 'Validated';
}

export interface JournalEntry {
  id: string;
  date: string;
  description: string;
  reference: string; // e.g., SO-001
  lines: {
    accountId: string;
    accountName: string;
    debit: number;
    credit: number;
  }[];
}

export interface ApsForecast {
  productId: string;
  productName: string;
  currentStock: number;
  predictedDemand: number;
  suggestedOrder: number;
  reasoning: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}