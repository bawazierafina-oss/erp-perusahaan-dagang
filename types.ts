export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  SALES = 'SALES',
  INVENTORY = 'INVENTORY',
  FINANCE = 'FINANCE',
  PURCHASING = 'PURCHASING'
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