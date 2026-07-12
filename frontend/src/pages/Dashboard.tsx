import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/Card';
import { 
  Laptop, 
  CalendarRange, 
  ShieldAlert, 
  Clock, 
  RefreshCw, 
  Wrench, 
  Plus, 
  TrendingUp 
} from 'lucide-react';

interface DashboardStats {
  totalAssets: number;
  availableAssets: number;
  allocatedAssets: number;
  activeBookings: number;
  pendingTransfers: number;
  maintenanceCount: number;
  overdueCount: number;
}

interface ActivityItem {
  id: string;
  type: 'allocation' | 'booking' | 'maintenance' | 'audit';
  title: string;
  subtitle: string;
  time: string;
}

interface DashboardProps {
  onQuickAction: (action: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onQuickAction }) => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data.data);
      
      setActivities([
        { id: '1', type: 'allocation', title: 'Asset Allocated', subtitle: 'MacBook Pro AF-0001 allocated to Alice Smith', time: '10 mins ago' },
        { id: '2', type: 'maintenance', title: 'Repair Raised', subtitle: 'Dell XPS 15 AF-0002 has flickering screen', time: '1 hour ago' },
        { id: '3', type: 'booking', title: 'Room Booked', subtitle: 'Conference Room Delta booked for tomorrow', time: '2 hours ago' },
      ]);
    } catch (err) {
      console.error('Failed to fetch stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome back, {user?.name}</h1>
          <p className="text-sm text-slate-400 mt-1">
            Here's a real-time operational snapshot of your organization's resources.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          className="self-start md:self-auto flex items-center space-x-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 px-3.5 py-2 rounded-xl transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Data</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          title="Assets Available"
          value={loading ? '...' : (stats?.availableAssets ?? 0)}
          icon={<Laptop className="w-5 h-5" />}
          indicatorText="● Ready for assignment"
          indicatorColor="text-emerald-400"
          accentBgColor="bg-emerald-500/5"
        />

        <Card
          title="Active Bookings"
          value={loading ? '...' : (stats?.activeBookings ?? 0)}
          icon={<CalendarRange className="w-5 h-5" />}
          indicatorText="● Conference rooms / spaces"
          indicatorColor="text-brand-400"
          accentBgColor="bg-brand/5"
        />

        <Card
          title="Under Maintenance"
          value={loading ? '...' : (stats?.maintenanceCount ?? 0)}
          icon={<Wrench className="w-5 h-5" />}
          indicatorText="● Repair tickets open"
          indicatorColor="text-yellow-500/80"
          accentBgColor="bg-yellow-500/5"
        />

        <Card
          title="Overdue Returns"
          value={loading ? '...' : (stats?.overdueCount ?? 0)}
          icon={<ShieldAlert className="w-5 h-5" />}
          indicatorText={stats?.overdueCount && stats.overdueCount > 0 ? '▲ Action required by manager' : '● No overdue assets'}
          indicatorColor={stats?.overdueCount && stats.overdueCount > 0 ? 'text-red-400 font-semibold' : 'text-slate-500'}
          accentBgColor={stats?.overdueCount && stats.overdueCount > 0 ? 'bg-red-500/5' : 'bg-slate-800/5'}
          className={stats?.overdueCount && stats.overdueCount > 0 ? 'bg-red-950/10 border-red-800/30' : ''}
        />
      </div>

      {/* Quick Action Dashboard Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-brand" />
            <span>Quick Workflows</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => onQuickAction('assets')}
              className="flex flex-col items-center justify-center p-5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-center transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-brand/10 text-brand flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Plus className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-white">Register Asset</span>
              <span className="text-[10px] text-slate-500 mt-1">Add AF-XXXX tag item</span>
            </button>

            <button 
              onClick={() => onQuickAction('bookings')}
              className="flex flex-col items-center justify-center p-5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-center transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <CalendarRange className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-white">Book Resource</span>
              <span className="text-[10px] text-slate-500 mt-1">Schedule conference room</span>
            </button>

            <button 
              onClick={() => onQuickAction('maintenance')}
              className="flex flex-col items-center justify-center p-5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 rounded-xl text-center transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-500 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-sm font-semibold text-white">Raise Repair</span>
              <span className="text-[10px] text-slate-500 mt-1">Report faulty equipment</span>
            </button>
          </div>

          <div className="border-t border-slate-800/80 pt-6">
            <h4 className="text-sm font-bold text-white mb-4">Role Quick Reference</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950/80 border border-slate-800/60 p-3.5 rounded-xl">
                <span className="text-brand font-semibold block">Employee Directory Promotion</span>
                <span className="text-slate-400 mt-1 block">Only Admins can promote employees to managers or assign department head privileges.</span>
              </div>
              <div className="bg-slate-950/80 border border-slate-800/60 p-3.5 rounded-xl">
                <span className="text-emerald-400 font-semibold block">Conflict Safeguards</span>
                <span className="text-slate-400 mt-1 block">System blocks double allocation and books overlap blocks natively at the backend controller level.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white flex items-center space-x-2 mb-6">
            <Clock className="w-5 h-5 text-slate-400" />
            <span>Recent Activity Log</span>
          </h3>
          <div className="space-y-4">
            {activities.map((act) => (
              <div key={act.id} className="flex space-x-4 text-xs">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  act.type === 'allocation' ? 'bg-brand/10 text-brand' :
                  act.type === 'maintenance' ? 'bg-yellow-500/10 text-yellow-500' :
                  'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {act.type === 'allocation' ? <Laptop className="w-4 h-4" /> :
                   act.type === 'maintenance' ? <Wrench className="w-4 h-4" /> :
                   <CalendarRange className="w-4 h-4" />}
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-slate-200">{act.title}</div>
                  <div className="text-slate-400">{act.subtitle}</div>
                  <div className="text-[10px] text-slate-500">{act.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
