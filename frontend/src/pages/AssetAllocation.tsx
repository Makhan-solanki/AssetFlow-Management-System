import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Laptop, ClipboardCheck, ArrowRightLeft, ShieldAlert, Check, UserCheck } from 'lucide-react';

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Allocation {
  id: string;
  assetId: string;
  userId: string;
  expectedReturnDate: string | null;
  status: string;
  isOverdue: boolean;
  notes: string | null;
  asset: { name: string; assetTag: string; serialNumber: string };
  user: { name: string; email: string };
  allocatedBy: { name: string };
  allocatedAt: string;
}

interface Transfer {
  id: string;
  assetId: string;
  sourceUserId: string;
  targetUserId: string;
  notes: string | null;
  status: string;
  asset: { name: string; assetTag: string };
  sourceUser: { name: string };
  targetUser: { name: string };
  requestedBy: { name: string };
}

export const AssetAllocation: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [activeSubTab, setActiveSubTab] = useState<'issue' | 'active' | 'transfers'>('issue');
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);

  // Issue forms
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');

  // Conflict state
  const [conflictError, setConflictError] = useState<{
    conflict: boolean;
    message: string;
    holderName: string;
    assetId: string;
    targetUserId: string;
  } | null>(null);

  // Return modal forms
  const [showReturnModal, setShowReturnModal] = useState<Allocation | null>(null);
  const [returnCondition, setReturnCondition] = useState('Good');
  const [returnNotes, setReturnNotes] = useState('');

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsRes, empRes, allocRes, transRes] = await Promise.all([
        api.get('/assets'),
        api.get('/org/employees'),
        api.get('/allocations'),
        api.get('/allocations/transfers'),
      ]);
      setAssets(assetsRes.data.data);
      setEmployees(empRes.data.data);
      setAllocations(allocRes.data.data);
      setTransfers(transRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    try {
      await api.post('/allocations', {
        assetId: selectedAssetId,
        userId: selectedUserId,
        expectedReturnDate: expectedReturnDate || undefined,
        notes,
      });
      setMessage('Asset allocated successfully.');
      setSelectedAssetId('');
      setSelectedUserId('');
      setExpectedReturnDate('');
      setNotes('');
      fetchData();
    } catch (err: any) {
      if (err.response?.status === 409 && err.response?.data?.conflict) {
        setConflictError({
          conflict: true,
          message: err.response.data.message,
          holderName: err.response.data.holderName,
          assetId: selectedAssetId,
          targetUserId: selectedUserId,
        });
      } else {
        setMessage(err.response?.data?.message || 'Allocation failed.');
      }
    }
  };

  const handleCreateTransfer = async () => {
    if (!conflictError) return;
    try {
      await api.post('/allocations/transfers', {
        assetId: conflictError.assetId,
        targetUserId: conflictError.targetUserId,
        notes: `Auto-raised transfer request from current holder (${conflictError.holderName}).`,
      });
      setMessage('Transfer request raised and current allocation holder notified.');
      setConflictError(null);
      setSelectedAssetId('');
      setSelectedUserId('');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to submit transfer request.');
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReturnModal) return;
    try {
      await api.put(`/allocations/${showReturnModal.id}/return`, {
        condition: returnCondition,
        notes: returnNotes,
      });
      setMessage('Asset returned successfully and marked as AVAILABLE.');
      setShowReturnModal(null);
      setReturnNotes('');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to return asset.');
    }
  };

  const handleTransferApproval = async (transferId: string, action: 'APPROVE' | 'REJECT') => {
    try {
      await api.put(`/allocations/transfers/${transferId}`, { action });
      setMessage(`Transfer request ${action === 'APPROVE' ? 'approved' : 'rejected'}.`);
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to handle transfer.');
    }
  };

  const isPrivileged = currentUser?.role === 'ADMIN' || currentUser?.role === 'ASSET_MANAGER' || currentUser?.role === 'DEPARTMENT_HEAD';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Asset Allocation & Transfers</h1>
        <p className="text-sm text-slate-400 mt-1">Assign equipment to staff members, log return inspections, or request internal custody transfers.</p>
      </div>

      {message && (
        <div className="bg-brand-900/20 border border-brand-500/30 text-brand-300 p-4 rounded-xl text-xs flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold hover:text-white">&times;</button>
        </div>
      )}

      {/* Sub tabs switcher */}
      <div className="flex border-b border-slate-850">
        <button
          onClick={() => setActiveSubTab('issue')}
          className={`px-6 py-3 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'issue' ? 'border-brand text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Issue Asset
        </button>
        <button
          onClick={() => setActiveSubTab('active')}
          className={`px-6 py-3 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'active' ? 'border-brand text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Allocations ({allocations.filter(a => a.status === 'ALLOCATED').length})
        </button>
        <button
          onClick={() => setActiveSubTab('transfers')}
          className={`px-6 py-3 text-xs font-bold border-b-2 transition-all ${
            activeSubTab === 'transfers' ? 'border-brand text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Transfer Approvals ({transfers.filter(t => t.status === 'PENDING').length})
        </button>
      </div>

      {/* Tab A - Issue Asset */}
      {activeSubTab === 'issue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
            <h3 className="text-md font-bold text-white flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-brand" />
              <span>Allocate Resource</span>
            </h3>

            {!isPrivileged ? (
              <div className="bg-slate-950 border border-slate-850 p-6 rounded-xl text-center text-slate-500 text-xs">
                Only Admins, Managers, and Department Heads can assign assets.
              </div>
            ) : (
              <form onSubmit={handleAllocate} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Select Asset *</label>
                    <select
                      required
                      value={selectedAssetId}
                      onChange={(e) => {
                        setSelectedAssetId(e.target.value);
                        setConflictError(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                    >
                      <option value="">Select Asset...</option>
                      {assets.map((asset) => (
                        <option key={asset.id} value={asset.id}>
                          {asset.name} ({asset.assetTag}) — {asset.status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Allocate To Employee *</label>
                    <select
                      required
                      value={selectedUserId}
                      onChange={(e) => {
                        setSelectedUserId(e.target.value);
                        setConflictError(null);
                      }}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                    >
                      <option value="">Select Employee...</option>
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Expected Return Date</label>
                  <input
                    type="date"
                    value={expectedReturnDate}
                    onChange={(e) => setExpectedReturnDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Notes / Instructions</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    placeholder="Provide details on assignment condition or return milestones..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none"
                  />
                </div>

                {conflictError && (
                  <div className="bg-red-950/60 border border-red-800/40 text-red-300 p-4 rounded-xl space-y-3">
                    <div className="flex items-start space-x-2.5">
                      <ShieldAlert className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      <span>{conflictError.message}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCreateTransfer}
                      className="bg-brand hover:bg-brand-600 text-white font-semibold px-4 py-2 rounded-lg text-[10px] transition-all"
                    >
                      Request Internal Custody Transfer
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl transition-all"
                >
                  Create Custody Allocation
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl text-xs space-y-4">
            <h3 className="font-bold text-white">Custody Rules</h3>
            <ul className="space-y-3 text-slate-400 list-disc pl-4 leading-relaxed">
              <li>Assets cannot be double-allocated. The database prevents overwrites.</li>
              <li>If an asset is already allocated, the system prompts a <strong>Transfer Request</strong> to route approval through the department head.</li>
              <li>Expected return dates feed notifications and mark status as <strong>Overdue</strong> dynamically.</li>
            </ul>
          </div>
        </div>
      )}

      {/* Tab B - Active Allocations */}
      {activeSubTab === 'active' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-md font-bold text-white mb-6">Custody Handover Log</h3>
          {loading ? (
            <p className="text-slate-500 text-xs">Loading active handovers...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400">
                    <th className="pb-3 font-semibold">Asset Tag / Name</th>
                    <th className="pb-3 font-semibold">Held By</th>
                    <th className="pb-3 font-semibold">Allocated By</th>
                    <th className="pb-3 font-semibold">Expected Return</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {allocations.map((alloc) => (
                    <tr key={alloc.id} className="text-slate-300">
                      <td className="py-4">
                        <span className="font-bold text-white">{alloc.asset?.name}</span>
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{alloc.asset?.assetTag}</span>
                      </td>
                      <td className="py-4">
                        <span className="font-medium text-slate-200">{alloc.user?.name}</span>
                        <span className="block text-[10px] text-slate-500 mt-0.5">{alloc.user?.email}</span>
                      </td>
                      <td className="py-4 text-slate-400">{alloc.allocatedBy?.name}</td>
                      <td className="py-4">
                        {alloc.expectedReturnDate 
                          ? new Date(alloc.expectedReturnDate).toLocaleDateString() 
                          : <span className="text-slate-500">Continuous</span>}
                      </td>
                      <td className="py-4">
                        {alloc.status === 'RETURNED' ? (
                          <span className="px-2 py-0.5 bg-slate-850 text-slate-500 rounded-full font-bold">Returned</span>
                        ) : alloc.isOverdue ? (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-400 border border-red-900/30 rounded-full font-bold">OVERDUE</span>
                        ) : (
                          <span className="px-2 py-0.5 bg-brand-500/10 text-brand-400 rounded-full font-bold">Allocated</span>
                        )}
                      </td>
                      <td className="py-4 text-right">
                        {alloc.status === 'ALLOCATED' && isPrivileged && (
                          <button
                            onClick={() => setShowReturnModal(alloc)}
                            className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-[10px] font-semibold text-white px-3 py-1.5 rounded-lg transition-all"
                          >
                            Mark Returned
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allocations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No allocations currently registered in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab C - Transfer Requests */}
      {activeSubTab === 'transfers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-md font-bold text-white mb-6">Custody Transfers Approvals</h3>
          {loading ? (
            <p className="text-slate-500 text-xs">Loading transfer requests...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-850 text-slate-400">
                    <th className="pb-3 font-semibold">Asset Tag</th>
                    <th className="pb-3 font-semibold">Current Holder</th>
                    <th className="pb-3 font-semibold">Target Employee</th>
                    <th className="pb-3 font-semibold">Requested By</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {transfers.map((trans) => (
                    <tr key={trans.id} className="text-slate-300">
                      <td className="py-4 font-semibold text-white">
                        {trans.asset?.name}
                        <span className="block text-[10px] text-slate-500 font-mono mt-0.5">{trans.asset?.assetTag}</span>
                      </td>
                      <td className="py-4 text-slate-400">{trans.sourceUser?.name}</td>
                      <td className="py-4 font-medium text-slate-200">{trans.targetUser?.name}</td>
                      <td className="py-4 text-slate-400">{trans.requestedBy?.name}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full font-semibold ${
                          trans.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                          trans.status === 'REJECTED' ? 'bg-red-500/10 text-red-400' :
                          'bg-yellow-500/10 text-yellow-500'
                        }`}>
                          {trans.status}
                        </span>
                      </td>
                      <td className="py-4 text-right space-x-2">
                        {trans.status === 'PENDING' && isPrivileged && (
                          <>
                            <button
                              onClick={() => handleTransferApproval(trans.id, 'APPROVE')}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-2.5 py-1 rounded text-[10px] transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleTransferApproval(trans.id, 'REJECT')}
                              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-2.5 py-1 rounded text-[10px] transition-all"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                  {transfers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No pending custody transfer requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-md">Mark Asset Returned</h3>
              <button 
                onClick={() => setShowReturnModal(null)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleReturnSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Return Inspection Condition</label>
                <select
                  value={returnCondition}
                  onChange={(e) => setReturnCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Return Notes / Comments</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white"
                  placeholder="Record screen inspection scratch status or keys status..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-all"
              >
                Check In & Make Available
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
