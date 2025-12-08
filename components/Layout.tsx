import React from 'react';
import { ModuleType } from '../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  CreditCard, 
  Truck, 
  LogOut,
  UserCircle,
  Menu,
  Bell
} from 'lucide-react';

interface LayoutProps {
  currentModule: ModuleType;
  setModule: (m: ModuleType) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentModule, setModule, children }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const navItems = [
    { id: ModuleType.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: ModuleType.SALES, label: 'Sales (Order-to-Cash)', icon: <ShoppingCart size={20} /> },
    { id: ModuleType.INVENTORY, label: 'Inventory & APS', icon: <Package size={20} /> },
    { id: ModuleType.PURCHASING, label: 'Purchasing', icon: <Truck size={20} /> },
    { id: ModuleType.FINANCE, label: 'Finance & Accounting', icon: <CreditCard size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 flex flex-col shadow-xl z-20`}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
          {sidebarOpen && <span className="font-bold text-lg tracking-tight text-blue-400">MITRA ERP</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 hover:bg-slate-700 rounded">
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 py-6 space-y-1 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setModule(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                currentModule === item.id 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">
              AD
            </div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-slate-400 truncate">Head Office</p>
              </div>
            )}
            {sidebarOpen && <LogOut size={16} className="text-slate-400 cursor-pointer hover:text-red-400" />}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shadow-sm z-10">
          <h1 className="text-xl font-bold text-gray-800">
            {navItems.find(n => n.id === currentModule)?.label}
          </h1>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              <UserCircle size={18} />
              <span className="text-sm font-medium">PT Mitra Makmurjaya Mandiri</span>
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