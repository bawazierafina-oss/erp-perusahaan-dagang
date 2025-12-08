import React, { useState } from 'react';
import Layout from './components/Layout';
import { ModuleType, Product, SalesOrder, JournalEntry } from './types';
import { INITIAL_INVENTORY, INITIAL_SALES, INITIAL_JOURNALS } from './constants';
import InventoryAPS from './components/InventoryAPS';
import SalesModule from './components/SalesModule';
import FinanceModule from './components/FinanceModule';
import Dashboard from './components/Dashboard';
import AIChatWidget from './components/AIChatWidget';

const App: React.FC = () => {
  const [currentModule, setCurrentModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  
  // "Single Database" Concept - Centralized State
  const [inventory, setInventory] = useState<Product[]>(INITIAL_INVENTORY);
  const [sales, setSales] = useState<SalesOrder[]>(INITIAL_SALES);
  const [journals, setJournals] = useState<JournalEntry[]>(INITIAL_JOURNALS);

  // Transaction Handler (Simulating Atomic Transaction)
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

  // Prepare context for AI Chat
  const contextData = JSON.stringify({
    summary: `Total Revenue: ${sales.reduce((a,b)=>a+b.total,0)}, Total Stock items: ${inventory.length}`,
    lastSale: sales[0],
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
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <h3 className="text-xl font-bold">Purchasing Module</h3>
            <p>Connects to APS recommendations to generate POs.</p>
        </div>
      )}

      {/* Floating AI Assistant */}
      <AIChatWidget contextData={contextData} />
    </Layout>
  );
};

export default App;