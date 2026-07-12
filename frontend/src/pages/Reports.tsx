import React from 'react';
import { BarChart3, LineChart, TrendingUp, AlertTriangle, EyeOff, FileSpreadsheet } from 'lucide-react';

export const Reports: React.FC = () => {
  // Mock data for hackathon visualization
  const deptData = [
    { name: 'Eng', val: 85, color: 'bg-brand' },
    { name: 'Ops', val: 65, color: 'bg-brand/80' },
    { name: 'HR', val: 40, color: 'bg-brand/60' },
    { name: 'Sales', val: 50, color: 'bg-brand/70' },
    { name: 'Admin', val: 75, color: 'bg-brand-600' },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Reports & Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">Review resource utilization metrics, maintenance curves, and operational asset states.</p>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Utilization Chart */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-brand" />
            <span>Resource Utilization by Department (%)</span>
          </h3>
          <div className="h-48 flex items-end justify-between px-4 pb-2 border-b border-slate-800">
            {deptData.map((d, i) => (
              <div key={i} className="flex flex-col items-center space-y-3 w-12">
                <div 
                  style={{ height: `${d.val * 1.5}px` }} 
                  className={`w-8 ${d.color} rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-lg shadow-brand/10`} 
                />
                <span className="text-[10px] text-slate-400 font-semibold">{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Frequency Line Graph */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-6 flex items-center space-x-2">
            <LineChart className="w-4 h-4 text-brand" />
            <span>Maintenance Ticket Frequency Curve</span>
          </h3>
          <div className="h-48 relative border-b border-slate-800">
            {/* Custom SVG line chart for lightweight presentation */}
            <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
              <path
                d="M 5,45 Q 25,25 45,35 T 85,10"
                fill="none"
                stroke="#253beb"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M 5,45 Q 25,25 45,35 T 85,10 L 85,50 L 5,50 Z"
                fill="url(#grad)"
                opacity="0.1"
              />
              <defs>
                <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#253beb" />
                  <stop offset="100%" stopColor="#0b111e" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute bottom-1 left-2 text-[9px] text-slate-500 font-semibold">May</div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-semibold">Jun</div>
            <div className="absolute bottom-1 right-2 text-[9px] text-slate-500 font-semibold">Jul</div>
          </div>
        </div>
      </div>

      {/* Tables/Lists grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        {/* Most used assets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Most Used Assets (Shared Resources)</span>
          </h3>
          <div className="space-y-3 font-mono">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
              <span className="text-white">Room B2</span>
              <span className="text-emerald-400 font-bold">34 bookings this month</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
              <span className="text-white">Van AF-343</span>
              <span className="text-emerald-400 font-bold">21 trips this month</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
              <span className="text-white">Projector AF-335</span>
              <span className="text-emerald-400 font-bold">18 uses</span>
            </div>
          </div>
        </div>

        {/* Idle Assets */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <EyeOff className="w-4 h-4 text-slate-400" />
            <span>Idle Assets (Unused Log)</span>
          </h3>
          <div className="space-y-3 font-mono">
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
              <span className="text-white">Camera AF-0301</span>
              <span className="text-slate-400 font-bold">Unused 60+ days</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
              <span className="text-white">Chair AF-0410</span>
              <span className="text-slate-400 font-bold">Unused 45 days</span>
            </div>
            <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-850">
              <span className="text-white">Mic System AF-901</span>
              <span className="text-slate-400 font-bold">Unused 30+ days</span>
            </div>
          </div>
        </div>

        {/* Assets Due for Maintenance / Nearing Retirement */}
        <div className="col-span-full bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span>Assets Due for Maintenance / Nearing Retirement</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center">
              <div>
                <span className="text-white block font-bold">Forklift AF-0087</span>
                <span className="text-[10px] text-slate-500">Service due soon</span>
              </div>
              <span className="text-yellow-500 font-bold">Service due in 5 days</span>
            </div>
            
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex justify-between items-center">
              <div>
                <span className="text-white block font-bold">Laptop AF-0020</span>
                <span className="text-[10px] text-slate-500">Age: 4 years old</span>
              </div>
              <span className="text-yellow-500/80 font-bold">Nearing retirement</span>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => alert('Exporting full analytics report as CSV...')}
        className="bg-brand hover:bg-brand-600 text-white font-semibold px-5 py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand/20 active:scale-95"
      >
        <FileSpreadsheet className="w-4 h-4" />
        <span>Export Report</span>
      </button>
    </div>
  );
};
