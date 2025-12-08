import React from 'react';
import { ModuleType } from '../types.ts';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Truck, 
  LogOut,
  UserCircle,
  Menu,
  Bell,
  ScanLine,
  BrainCircuit
} from 'lucide-react';

interface LayoutProps {
  currentModule: ModuleType;
  setModule: (m: ModuleType) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentModule, setModule, children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white">Synergy Trade</span>
              <span className="text-[10px] text-blue-400 tracking-wider uppercase">Intelligent ERP</span>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1 px-2 overflow-y-auto">
          {/* AI TOOLS SECTION */}
          {sidebarOpen && (
            <div className="px-4 mb-2 mt-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Alat AI
            </div>
          )}
          
          <button
            onClick={() => setModule(ModuleType.DOCUMENT_SCANNER)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors group ${
              currentModule === ModuleType.DOCUMENT_SCANNER
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ScanLine size={20} className={currentModule === ModuleType.DOCUMENT_SCANNER ? 'text-white' : 'text-indigo-400 group-hover:text-white'} />
            {sidebarOpen && <span className="text-sm font-medium">AI Document Scanner</span>}
          </button>

          {/* ERP MODULES SECTION */}
          {sidebarOpen && (
            <div className="px-4 mb-2 mt-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Modul ERP
            </div>
          )}

          {[
            { id: ModuleType.DASHBOARD, label: 'Dashboard Utama', icon: <LayoutDashboard size={20} /> },
            { id: ModuleType.SALES, label: 'Penjualan', icon: <ShoppingCart size={20} /> },
            { id: ModuleType.PURCHASING, label: 'Pembelian', icon: <Truck size={20} /> },
            { id: ModuleType.INVENTORY, label: 'Persediaan', icon: <Package size={20} /> },
            { id: ModuleType.FINANCE, label: 'Akuntansi', icon: <CreditCard size={20} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentModule === item.id 
                  ? 'bg-slate-800 text-white border-l-4 border-blue-500' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-900">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold ring-2 ring-slate-700">
              <BrainCircuit size={16} className="text-white" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate text-white">Gemini Pro 2.5</p>
                <p className="text-xs text-green-400 truncate flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                  System Online
                </p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-800">
             {currentModule === ModuleType.DOCUMENT_SCANNER && "Intelligent Document Processing (IDP)"}
             {currentModule === ModuleType.DASHBOARD && "Executive Dashboard"}
             {currentModule === ModuleType.SALES && "Sales Module"}
             {currentModule === ModuleType.PURCHASING && "Purchasing Module"}
             {currentModule === ModuleType.INVENTORY && "Inventory Management"}
             {currentModule === ModuleType.FINANCE && "Finance & Accounting"}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              <UserCircle size={18} />
              <span className="text-sm font-medium">Synergy Trade</span>
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;