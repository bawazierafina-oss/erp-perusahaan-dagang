import React, { useState } from 'react';
import Layout from './components/Layout';
import { ModuleType, Product, SalesOrder, JournalEntry, PurchaseOrder, ReceivingReport } from './types';
import { INITIAL_INVENTORY, INITIAL_SALES, INITIAL_JOURNALS, INITIAL_PURCHASE_ORDERS } from './constants';
import InventoryAPS from './components/InventoryAPS';
import SalesModule from './components/SalesModule';
import FinanceModule from './components/FinanceModule';
import PurchasingModule from './components/PurchasingModule';
import DocumentScanner from './components/DocumentScanner';
import Dashboard from './components/Dashboard';
import AIChatWidget from './components/AIChatWidget';

const App: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  
  // "Single Database" Concept - Centralized State
  const [inventory, setInventory] = useState<Product[]>(INITIAL_INVENTORY);
  const [sales, setSales] = useState<SalesOrder[]>(INITIAL_SALES);
  const [journals, setJournals] = useState<JournalEntry[]>(INITIAL_JOURNALS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);

  // Transaction Handler (Sales: Order-to-Cash)
  const handleCreateOrder = (order: SalesOrder, autoJournals: JournalEntry[], cogsJournals: JournalEntry[]) => {
    // 1. Add Sales Order
    setSales(prev => [order, ...prev]);

    // 2. Reduce Inventory
    const orderItem = order.items[0]; // Simplification for demo
    setInventory(prev => prev.map(item => {
      if (item.id === orderItem.productId) {
        return { ...item, stock: item.stock - orderItem.quantity };
      }
      return item;
    }));

    // 3. Post Journals (Revenue + COGS)
    setJournals(prev => [...prev, ...autoJournals, ...cogsJournals]);

    // Navigate to Finance to show the result
    setCurrentModule(ModuleType.FINANCE);
  };

  // Transaction Handler (Purchasing: Procure-to-Pay)
  const handleConfirmReceipt = (rr: ReceivingReport, po: PurchaseOrder) => {
    // 1. Update PO Status
    setPurchaseOrders(prev => prev.map(p => p.id === po.id ? { ...p, status: 'Received' } : p));

    // 2. Increase Inventory
    const receivedItem = rr.items[0];
    setInventory(prev => prev.map(item => {
      if (item.id === receivedItem.productId) {
        return { ...item, stock: item.stock + receivedItem.quantityReceived };
      }
      return item;
    }));

    // 3. Auto-Accounting: Debit Inventory, Credit AP
    const totalValue = po.items.reduce((sum, item) => sum + (item.cost * item.quantity), 0);
    
    const purchaseJournal: JournalEntry = {
      id: `JE-${Date.now()}-PUR`,
      date: rr.date,
      description: `Inventory Receipt RR-${rr.id}`,
      reference: `PO-${po.id}`,
      lines: [
        { accountId: '1301', accountName: 'Inventory Asset', debit: totalValue, credit: 0 },
        { accountId: '2101', accountName: 'Accounts Payable', debit: 0, credit: totalValue }
      ]
    };

    setJournals(prev => [...prev, purchaseJournal]);
    
    // Navigate to Finance to show result
    setCurrentModule(ModuleType.FINANCE);
  };

  // Prepare context for AI Chat
  const contextData = JSON.stringify({
    summary: `Total Revenue: ${sales.reduce((a,b)=>a+b.total,0)}, Total Stock items: ${inventory.length}`,
    lastSale: sales[0],
    openPOs: purchaseOrders.filter(p => p.status === 'Open').length,
    lowStock: inventory.filter(i => i.stock < i.minStock).map(i => i.name)
  });

  return (
    <Layout currentModule={currentModule} setModule={setCurrentModule}>
      {currentModule === ModuleType.DASHBOARD && (
        <Dashboard inventory={inventory} sales={sales} />
      )}
      
      {currentModule === ModuleType.INVENTORY && (
        <InventoryAPS inventory={inventory} salesHistory={sales} />
      )}

      {currentModule === ModuleType.SALES && (
        <SalesModule inventory={inventory} onCreateOrder={handleCreateOrder} />
      )}

      {currentModule === ModuleType.FINANCE && (
        <FinanceModule journals={journals} />
      )}

      {currentModule === ModuleType.PURCHASING && (
        <PurchasingModule 
          purchaseOrders={purchaseOrders} 
          inventory={inventory}
          onConfirmReceipt={handleConfirmReceipt}
        />
      )}

      {currentModule === ModuleType.DOCUMENT_SCANNER && (
        <DocumentScanner />
      )}

      {/* Floating AI Assistant */}
      <AIChatWidget contextData={contextData} />
    </Layout>
  );
};

export default App;