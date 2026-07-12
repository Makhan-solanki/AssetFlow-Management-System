import React, { useEffect, useState } from 'react';
import { useAuthStore } from './store/useAuthStore';
import { LandingPage } from './pages/LandingPage';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { AssetDirectory } from './pages/AssetDirectory';
import { AssetAllocation } from './pages/AssetAllocation';
import { ResourceBooking } from './pages/ResourceBooking';
import { Maintenance } from './pages/Maintenance';
import { Audit } from './pages/Audit';
import { OrgSetup } from './pages/OrgSetup';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';

import { 
  Layers, 
  LayoutDashboard, 
  Laptop, 
  UserCheck, 
  CalendarRange, 
  Wrench, 
  ClipboardCheck, 
  Settings, 
  LogOut, 
  User,
  ShieldCheck,
  BarChart3,
  Bell
} from 'lucide-react';

function App() {
  const { isAuthenticated, user, checkAuth, logout } = useAuthStore();
  const [showLogin, setShowLogin] = useState(false);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [signUpMode, setSignUpMode] = useState(false);

  const getMenuFromHash = () => {
    const hash = window.location.hash;
    if (!hash) return 'dashboard';
    const path = hash.split('?')[0].replace('#/', '');
    return path || 'dashboard';
  };

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const handleHashChange = () => {
      setActiveMenu(getMenuFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    
    if (isAuthenticated) {
      if (!window.location.hash) {
        window.location.hash = '#/dashboard';
      } else {
        setActiveMenu(getMenuFromHash());
      }
    }
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  const handleMenuChange = (menu: string) => {
    window.location.hash = `#/${menu}`;
  };

  const handleQuickAction = (action: string) => {
    handleMenuChange(action);
  };

  if (!isAuthenticated) {
    if (showLogin) {
      return (
        <Login 
          onSuccess={() => setShowLogin(false)} 
          onBack={() => setShowLogin(false)}
          initialIsSignUp={signUpMode}
        />
      );
    }
    return (
      <LandingPage 
        onGetStarted={() => { setSignUpMode(true); setShowLogin(true); }}
        onLogin={() => { setSignUpMode(false); setShowLogin(true); }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-brand selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-850 flex flex-col justify-between shrink-0">
        <div>
          {/* Logo */}
          <div className="h-16 px-6 border-b border-slate-850 flex items-center space-x-3 bg-slate-950/20">
            <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center shadow-lg shadow-brand/25">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">Asset<span className="text-brand-400">Flow</span></span>
              <span className="block text-[8px] text-slate-500 font-semibold uppercase tracking-wider">Enterprise ERP</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5 text-xs">
            <button
              onClick={() => handleMenuChange('dashboard')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeMenu === 'dashboard' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Snapshot</span>
            </button>

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => handleMenuChange('setup')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                  activeMenu === 'setup' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Organization Setup</span>
              </button>
            )}

            <button
              onClick={() => handleMenuChange('assets')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeMenu === 'assets' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Laptop className="w-4 h-4" />
              <span>Asset Directory</span>
            </button>

            <button
              onClick={() => handleMenuChange('allocations')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeMenu === 'allocations' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Custody Allocation</span>
            </button>

            <button
              onClick={() => handleMenuChange('bookings')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeMenu === 'bookings' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <CalendarRange className="w-4 h-4" />
              <span>Resource Booking</span>
            </button>

            <button
              onClick={() => handleMenuChange('maintenance')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeMenu === 'maintenance' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Maintenance Order</span>
            </button>

            <button
              onClick={() => handleMenuChange('audit')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeMenu === 'audit' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Asset Reconciliation</span>
            </button>

            <button
              onClick={() => handleMenuChange('reports')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeMenu === 'reports' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => handleMenuChange('notifications')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                activeMenu === 'notifications' ? 'bg-brand text-white shadow-lg shadow-brand/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </button>
          </nav>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-850 bg-slate-950/20 text-xs">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-white block truncate">{user?.name}</span>
              <span className="block text-[9px] text-slate-500 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 py-2 rounded-xl transition-all font-semibold"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 flex flex-col bg-slate-950">
        {/* Top Header */}
        <header className="h-16 px-6 border-b border-slate-850 flex items-center justify-between bg-slate-900/10">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
            <span>AssetFlow Workspace</span>
            <span>&rarr;</span>
            <span className="text-slate-200 capitalize">{activeMenu.replace('-', ' ')}</span>
          </div>

          <div className="flex items-center space-x-3 text-xs bg-brand/5 border border-brand-500/20 px-3 py-1.5 rounded-full text-brand-300">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span>Role: <strong className="font-bold text-white uppercase">{user?.role}</strong></span>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {activeMenu === 'dashboard' && <Dashboard onQuickAction={handleQuickAction} />}
          {activeMenu === 'assets' && <AssetDirectory />}
          {activeMenu === 'allocations' && <AssetAllocation />}
          {activeMenu === 'bookings' && <ResourceBooking />}
          {activeMenu === 'maintenance' && <Maintenance />}
          {activeMenu === 'audit' && <Audit />}
          {activeMenu === 'setup' && <OrgSetup />}
          {activeMenu === 'reports' && <Reports />}
          {activeMenu === 'notifications' && <Notifications />}
        </div>
      </main>
    </div>
  );
}

export default App;

