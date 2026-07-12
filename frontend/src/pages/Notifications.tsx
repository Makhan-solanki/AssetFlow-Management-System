import React, { useState } from 'react';
import { Bell, Info, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: 'alert' | 'approval' | 'booking' | 'info';
  message: string;
  time: string;
}

export const Notifications: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'alert' | 'approval' | 'booking'>('all');

  const notificationsList: NotificationItem[] = [
    { id: '1', type: 'info', message: 'Laptop AF-0014 assigned to Priya shah', time: '2m ago' },
    { id: '2', type: 'approval', message: 'Maintenance request AF-0055 approved', time: '18m ago' },
    { id: '3', type: 'booking', message: 'Booking confirmed : Room B2 : 2:00 to 3:00 PM', time: '1h ago' },
    { id: '4', type: 'approval', message: 'Transfer approved : AF-0033 to facilities dept', time: '3h ago' },
    { id: '5', type: 'alert', message: 'Overdue return : AF-0021 was due 3 days ago', time: '1d ago' },
    { id: '6', type: 'alert', message: 'audit discrepancy flagged : AF-0088 damaged', time: '2d ago' },
  ];

  const filtered = notificationsList.filter((n) => {
    if (activeFilter === 'all') return true;
    return n.type === activeFilter;
  });

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Notifications & Activity Logs</h1>
          <p className="text-sm text-slate-400 mt-1">Audit log of system events, automated alerts, and custody handovers.</p>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            activeFilter === 'all' 
              ? 'bg-brand/10 border-brand text-brand-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('alert')}
          className={`px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            activeFilter === 'alert' 
              ? 'bg-red-500/10 border-red-900/30 text-red-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Alerts
        </button>
        <button
          onClick={() => setActiveFilter('approval')}
          className={`px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            activeFilter === 'approval' 
              ? 'bg-yellow-500/10 border-yellow-800/30 text-yellow-500' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Approvals
        </button>
        <button
          onClick={() => setActiveFilter('booking')}
          className={`px-5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            activeFilter === 'booking' 
              ? 'bg-emerald-500/10 border-emerald-900/30 text-emerald-400' 
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Bookings
        </button>
      </div>

      {/* Notifications Checklist Layout */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="divide-y divide-slate-850 font-mono text-xs">
          {filtered.map((item) => (
            <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-950/40 transition-colors">
              <div className="flex items-center space-x-3.5">
                {/* Indicator bullet colors */}
                <div className={`w-2 h-2 rounded-full shrink-0 ${
                  item.type === 'alert' ? 'bg-red-500 shadow-md shadow-red-500/30' :
                  item.type === 'approval' ? 'bg-yellow-500 shadow-md shadow-yellow-500/30' :
                  item.type === 'booking' ? 'bg-emerald-500 shadow-md shadow-emerald-500/30' :
                  'bg-brand'
                }`} />
                <span className="text-slate-200">{item.message}</span>
              </div>
              <span className="text-[10px] text-slate-500 shrink-0">{item.time}</span>
            </div>
          ))}

          {filtered.length === 0 && (
            <p className="text-slate-500 text-center py-8">No matching logs in this category.</p>
          )}
        </div>
      </div>
    </div>
  );
};
