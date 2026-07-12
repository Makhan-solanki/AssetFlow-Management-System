import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Wrench, ArrowRight, UserPlus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Dropdown } from '../components/Dropdown';

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  status: string;
}

interface MaintenanceRequest {
  id: string;
  assetId: string;
  description: string;
  priority: string;
  status: 'PENDING' | 'APPROVED' | 'TECHNICIAN_ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  technicianAssigned: string | null;
  resolutionNotes: string | null;
  createdAt: string;
  asset: { name: string; assetTag: string; status: string };
  reporter: { name: string };
}

export const Maintenance: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');

  // Action states
  const [showAssignModal, setShowAssignModal] = useState<MaintenanceRequest | null>(null);
  const [technician, setTechnician] = useState('');

  const [showResolveModal, setShowResolveModal] = useState<MaintenanceRequest | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsRes, requestsRes] = await Promise.all([
        api.get('/assets'),
        api.get('/maintenance'),
      ]);
      setAssets(assetsRes.data.data);
      setRequests(requestsRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRaiseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/maintenance', {
        assetId: selectedAssetId,
        description,
        priority,
      });
      setMessage('Defect reported successfully.');
      setSelectedAssetId('');
      setDescription('');
      setPriority('Medium');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to submit request.');
    }
  };

  const handleStatusChange = async (requestId: string, status: string, additionalParams = {}) => {
    try {
      await api.put(`/maintenance/${requestId}/status`, { status, ...additionalParams });
      setMessage(`Card progressed to ${status}.`);
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to progress ticket.');
    }
  };

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignModal) return;
    handleStatusChange(showAssignModal.id, 'TECHNICIAN_ASSIGNED', { technicianAssigned: technician });
    setShowAssignModal(null);
    setTechnician('');
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showResolveModal) return;
    handleStatusChange(showResolveModal.id, 'RESOLVED', { resolutionNotes });
    setShowResolveModal(null);
    setResolutionNotes('');
  };

  const isPrivileged = currentUser?.role === 'ADMIN' || currentUser?.role === 'ASSET_MANAGER';

  // Group tickets by status for Kanban Board
  const getTicketsByStatus = (status: string) => {
    return requests.filter((r) => r.status === status);
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Maintenance Kanban</h1>
          <p className="text-sm text-slate-400 mt-1">Approving moves the asset to under maintenance, resolving returns it to available.</p>
        </div>
      </div>

      {message && (
        <div className="bg-purple-50 border border-purple-200 text-purple-800 p-4 rounded-xl text-xs flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold text-purple-500 hover:text-purple-800">&times;</button>
        </div>
      )}

      {/* Kanban Board Container */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {/* Column 1: Pending */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 min-w-[200px] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">Pending</h3>
          <div className="space-y-3">
            {getTicketsByStatus('PENDING').map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2 hover:border-slate-700 transition-all">
                <span className="font-bold text-white block">{r.asset?.assetTag}</span>
                <span className="text-[10px] text-slate-400 block truncate">{r.description}</span>
                {isPrivileged && (
                  <button 
                    onClick={() => handleStatusChange(r.id, 'APPROVED')}
                    className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-1 rounded text-[10px] flex items-center justify-center space-x-1"
                  >
                    <span>Approve</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Approved */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 min-w-[200px] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">Approved</h3>
          <div className="space-y-3">
            {getTicketsByStatus('APPROVED').map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2">
                <span className="font-bold text-white block">{r.asset?.assetTag}</span>
                <span className="text-[10px] text-slate-400 block truncate">{r.description}</span>
                {isPrivileged && (
                  <button 
                    onClick={() => setShowAssignModal(r)}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 font-semibold py-1 rounded text-[10px] flex items-center justify-center space-x-1"
                  >
                    <UserPlus className="w-3 h-3" />
                    <span>Assign Tech</span>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Technician Assigned */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 min-w-[200px] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">Technician Assigned</h3>
          <div className="space-y-3">
            {getTicketsByStatus('TECHNICIAN_ASSIGNED').map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2">
                <span className="font-bold text-white block">{r.asset?.assetTag}</span>
                <span className="text-[10px] text-slate-400 block truncate">{r.description}</span>
                <span className="block text-[10px] text-brand-400 font-semibold truncate">Tech: {r.technicianAssigned}</span>
                {isPrivileged && (
                  <button 
                    onClick={() => handleStatusChange(r.id, 'IN_PROGRESS')}
                    className="w-full bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-750 font-semibold py-1 rounded text-[10px]"
                  >
                    Start Work
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 4: In Progress */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 min-w-[200px] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">In Progress</h3>
          <div className="space-y-3">
            {getTicketsByStatus('IN_PROGRESS').map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2">
                <span className="font-bold text-white block">{r.asset?.assetTag}</span>
                <span className="text-[10px] text-slate-400 block truncate">{r.description}</span>
                <span className="block text-[10px] text-yellow-500 font-semibold">Parts ordered / Working</span>
                {isPrivileged && (
                  <button 
                    onClick={() => setShowResolveModal(r)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-1 rounded text-[10px]"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Column 5: Resolved */}
        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4 min-w-[200px] space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-2">Resolved</h3>
          <div className="space-y-3">
            {getTicketsByStatus('RESOLVED').map((r) => (
              <div key={r.id} className="bg-emerald-950/20 border border-emerald-900/30 p-3.5 rounded-xl text-xs space-y-2">
                <span className="font-bold text-emerald-400 block">{r.asset?.assetTag}</span>
                <span className="text-[10px] text-emerald-500/80 block truncate">{r.description}</span>
                <span className="block text-[9px] text-slate-500 font-mono">Resolved: {new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Defect report Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg space-y-4 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Wrench className="w-4 h-4 text-brand" />
          <span>Report Faulty Asset</span>
        </h3>
        <form onSubmit={handleRaiseRequest} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Select Asset *</label>
              <Dropdown
                value={selectedAssetId}
                onChange={(val) => setSelectedAssetId(val)}
                options={[
                  { value: '', label: 'Select Asset...' },
                  ...assets.map((asset) => ({
                    value: asset.id,
                    label: `${asset.name} (${asset.assetTag})`
                  }))
                ]}
              />
            </div>
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Severity *</label>
              <Dropdown
                value={priority}
                onChange={(val) => setPriority(val)}
                options={[
                  { value: 'Low', label: 'Low Severity' },
                  { value: 'Medium', label: 'Medium Severity' },
                  { value: 'High', label: 'High Severity' },
                  { value: 'Critical', label: 'Critical Severity' }
                ]}
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Defect Description *</label>
            <textarea
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
              placeholder="Projector bulb bulb flickering / ac unit making compressor noise..."
            />
          </div>
          <button type="submit" className="bg-brand hover:bg-brand-600 text-white font-semibold px-4 py-2.5 rounded-xl">
            Report Issue
          </button>
        </form>
      </div>

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-md">Assign Technician</h3>
              <button onClick={() => setShowAssignModal(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleAssignSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Technician Name / ID *</label>
                <input
                  type="text"
                  required
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  placeholder="e.g. R. Varma"
                />
              </div>
              <button type="submit" className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl">
                Assign & Dispatch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-100">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-md">Resolve Work Order</h3>
              <button onClick={() => setShowResolveModal(null)} className="text-slate-400 hover:text-white">&times;</button>
            </div>
            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Resolution Summary *</label>
                <textarea
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  placeholder="e.g. Compressor replaced, noise resolved. Ready for use."
                />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl">
                Complete Work Order
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
