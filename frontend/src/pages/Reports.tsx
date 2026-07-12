import React, { useState, useEffect } from 'react';
import { BarChart3, LineChart, TrendingUp, AlertTriangle, EyeOff, FileSpreadsheet } from 'lucide-react';
import api from '../services/api';

interface Department {
  id: string;
  name: string;
}

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  status: string;
  condition: string;
  acquisitionDate: string;
  departmentId: string | null;
}

interface Booking {
  id: string;
  assetId: string;
  asset?: { name: string };
  startTime: string;
}

interface MaintenanceRequest {
  id: string;
  assetId: string;
  asset?: { name: string; assetTag: string };
  createdAt: string;
  status: string;
}

export const Reports: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [deptRes, assetRes, bookingRes, maintRes] = await Promise.all([
          api.get('/org/departments'),
          api.get('/assets'),
          api.get('/bookings'),
          api.get('/maintenance'),
        ]);

        setDepartments(deptRes.data.data || []);
        setAssets(assetRes.data.data || []);
        setBookings(bookingRes.data.data || []);
        setMaintenance(maintRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch report data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // 1. Calculate Department Utilization
  // Utilization = (Allocated Assets in Dept / Total Assets in Dept) * 100
  const deptUtilization = departments.map((dept) => {
    const deptAssets = assets.filter((a) => a.departmentId === dept.id);
    const allocated = deptAssets.filter((a) => a.status === 'ALLOCATED').length;
    const utilization = deptAssets.length > 0 ? Math.round((allocated / deptAssets.length) * 100) : 0;
    return {
      name: dept.name,
      val: utilization,
      color: 'bg-purple-600',
    };
  }).slice(0, 5); // top 5 departments

  // Default fallback if database is empty/new
  const displayDeptData = deptUtilization.length > 0 ? deptUtilization : [
    { name: 'Eng', val: 0, color: 'bg-purple-600' },
    { name: 'Ops', val: 0, color: 'bg-purple-500' },
    { name: 'HR', val: 0, color: 'bg-purple-400' }
  ];

  // 2. Calculate Maintenance Ticket Frequency Curve
  // Count tickets by month (May, June, July)
  const ticketCounts = { May: 0, June: 0, July: 0 };
  maintenance.forEach((m) => {
    const date = new Date(m.createdAt);
    const month = date.getMonth(); // 4 = May, 5 = June, 6 = July
    if (month === 4) ticketCounts.May++;
    else if (month === 5) ticketCounts.June++;
    else if (month === 6) ticketCounts.July++;
  });

  const maxTickets = Math.max(ticketCounts.May, ticketCounts.June, ticketCounts.July, 1);
  const yMay = 45 - (ticketCounts.May / maxTickets) * 35;
  const yJune = 45 - (ticketCounts.June / maxTickets) * 35;
  const yJuly = 45 - (ticketCounts.July / maxTickets) * 35;

  // 3. Most Used Shared Resources (Bookings count)
  const bookingCounts: Record<string, { name: string; count: number }> = {};
  bookings.forEach((b) => {
    const assetId = b.assetId;
    const assetName = b.asset?.name || assets.find(a => a.id === assetId)?.name || 'Unknown Asset';
    if (!bookingCounts[assetId]) {
      bookingCounts[assetId] = { name: assetName, count: 0 };
    }
    bookingCounts[assetId].count++;
  });

  const mostUsedAssets = Object.values(bookingCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  // 4. Idle Assets (Available status, not booked/allocated)
  const bookedAssetIds = new Set(bookings.map((b) => b.assetId));
  const idleAssets = assets
    .filter((a) => a.status === 'AVAILABLE' && !bookedAssetIds.has(a.id))
    .map((a) => {
      const ageDays = Math.round((new Date().getTime() - new Date(a.acquisitionDate).getTime()) / (1000 * 3600 * 24));
      return {
        name: a.name,
        tag: a.assetTag,
        idleDays: ageDays > 0 ? ageDays : 1,
      };
    })
    .slice(0, 3);

  // 5. Assets Due for Maintenance or Nearing Retirement
  const maintenanceOrRetirement = assets
    .filter((a) => {
      const ageYears = (new Date().getTime() - new Date(a.acquisitionDate).getTime()) / (1000 * 3600 * 24 * 365);
      return a.condition === 'Poor' || a.condition === 'Fair' || ageYears > 3;
    })
    .map((a) => {
      const ageYears = (new Date().getTime() - new Date(a.acquisitionDate).getTime()) / (1000 * 3600 * 24 * 365);
      const isRetiring = ageYears > 3;
      return {
        name: a.name,
        tag: a.assetTag,
        reason: isRetiring ? `Age: ${Math.round(ageYears * 10) / 10} years old` : `Condition: ${a.condition}`,
        badge: isRetiring ? 'Nearing retirement' : 'Condition Fair/Poor',
      };
    })
    .slice(0, 4);

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-800">Reports & Analytics</h1>
        <p className="text-sm text-slate-500 mt-1">Review real-time resource utilization metrics, maintenance curves, and operational asset states.</p>
      </div>

      {loading ? (
        <div className="text-slate-500 text-xs font-semibold py-8">Compiling real-time business reports...</div>
      ) : (
        <>
          {/* Visual Analytics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Utilization Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>Resource Utilization by Department (%)</span>
              </h3>
              <div className="h-48 flex items-end justify-between px-4 pb-2 border-b border-slate-100">
                {displayDeptData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center space-y-3 w-12">
                    <div 
                      style={{ height: `${Math.max(d.val * 1.5, 4)}px` }} 
                      className={`w-8 ${d.color} rounded-t-lg transition-all duration-500 hover:brightness-110 shadow-sm`} 
                    />
                    <span className="text-[10px] text-slate-500 font-semibold">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Maintenance Frequency Line Graph */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 mb-6 flex items-center space-x-2">
                <LineChart className="w-4 h-4 text-purple-600" />
                <span>Maintenance Ticket Frequency Curve</span>
              </h3>
              <div className="h-48 relative border-b border-slate-100">
                {/* Custom SVG line chart mapped to real counts */}
                <svg className="w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
                  <path
                    d={`M 5,${yMay} Q 25,${(yMay + yJune) / 2} 45,${yJune} T 85,${yJuly}`}
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <path
                    d={`M 5,${yMay} Q 25,${(yMay + yJune) / 2} 45,${yJune} T 85,${yJuly} L 85,50 L 5,50 Z`}
                    fill="url(#grad)"
                    opacity="0.1"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#ffffff" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute bottom-1 left-2 text-[9px] text-slate-500 font-bold">May ({ticketCounts.May})</div>
                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-slate-500 font-bold">Jun ({ticketCounts.June})</div>
                <div className="absolute bottom-1 right-2 text-[9px] text-slate-500 font-bold">Jul ({ticketCounts.July})</div>
              </div>
            </div>
          </div>

          {/* Tables/Lists grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
            {/* Most used assets */}
            <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Most Used Assets (Shared Resources)</span>
              </h3>
              <div className="space-y-3 font-sans">
                {mostUsedAssets.map((asset, i) => (
                  <div key={i} className="flex justify-between items-center bg-purple-50 p-3.5 rounded-xl">
                    <span className="text-slate-900 font-bold">{asset.name}</span>
                    <span className="text-purple-700 font-extrabold">{asset.count} bookings</span>
                  </div>
                ))}
                {mostUsedAssets.length === 0 && (
                  <div className="text-slate-500 italic p-3 text-center">No bookings recorded yet.</div>
                )}
              </div>
            </div>

            {/* Idle Assets */}
            <div className="bg-white rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <EyeOff className="w-4 h-4 text-slate-500" />
                <span>Idle Assets (Unused Log)</span>
              </h3>
              <div className="space-y-3 font-sans">
                {idleAssets.map((asset, i) => (
                  <div key={i} className="flex justify-between items-center bg-purple-50 p-3.5 rounded-xl">
                    <span className="text-slate-900 font-bold">{asset.name} ({asset.tag})</span>
                    <span className="text-slate-700 font-bold">Unused {asset.idleDays} days</span>
                  </div>
                ))}
                {idleAssets.length === 0 && (
                  <div className="text-slate-500 italic p-3 text-center">No idle assets found.</div>
                )}
              </div>
            </div>

            {/* Assets Due for Maintenance / Nearing Retirement */}
            <div className="col-span-full bg-white rounded-2xl p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold text-slate-800 flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Assets Nearing Retirement / Needing Maintenance</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                {maintenanceOrRetirement.map((asset, i) => (
                  <div key={i} className="bg-purple-50 p-3.5 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-slate-900 block font-bold">{asset.name} ({asset.tag})</span>
                      <span className="text-[10px] text-slate-600 font-semibold">{asset.reason}</span>
                    </div>
                    <span className={`font-extrabold px-2 py-0.5 rounded text-[10px] ${
                      asset.badge.includes('retirement') ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>{asset.badge}</span>
                  </div>
                ))}
                {maintenanceOrRetirement.length === 0 && (
                  <div className="col-span-full text-slate-500 italic p-3 text-center">All assets are in good condition and age thresholds.</div>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => alert('Exporting full analytics report as CSV...')}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-5 py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-2 shadow-sm active:scale-95 self-start"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </>
      )}
    </div>
  );
};
