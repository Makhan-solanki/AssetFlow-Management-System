import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Search, Plus, Filter, LayoutGrid, Calendar, MapPin, Tag } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  customFields: any;
}

interface Asset {
  id: string;
  name: string;
  assetTag: string;
  serialNumber: string;
  condition: string;
  location: string;
  status: string;
  isBookable: boolean;
  acquisitionCost: number;
  acquisitionDate: string;
  category: { name: string };
  department?: { name: string };
  customValues: any;
}

export const AssetDirectory: React.FC = () => {
  const { user } = useAuthStore();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);

  // Filter states
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedBookable, setSelectedBookable] = useState('');

  // Register form states
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [acquisitionDate, setAcquisitionDate] = useState('');
  const [acquisitionCost, setAcquisitionCost] = useState('');
  const [condition, setCondition] = useState('New');
  const [location, setLocation] = useState('');
  const [isBookable, setIsBookable] = useState(false);
  const [customFieldsValues, setCustomFieldsValues] = useState<any>({});
  
  const [message, setMessage] = useState('');

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (selectedCat) params.categoryId = selectedCat;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedBookable) params.isBookable = selectedBookable;

      const response = await api.get('/assets', { params });
      setAssets(response.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/org/categories');
      setCategories(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAssets();
    fetchCategories();
  }, [search, selectedCat, selectedStatus, selectedBookable]);

  const handleCategoryChange = (catId: string) => {
    setCategoryId(catId);
    const cat = categories.find((c) => c.id === catId);
    if (cat && cat.customFields) {
      const initialFields: any = {};
      (cat.customFields as any[]).forEach((f) => {
        initialFields[f.name] = f.type === 'boolean' ? false : '';
      });
      setCustomFieldsValues(initialFields);
    } else {
      setCustomFieldsValues({});
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/assets', {
        name,
        serialNumber,
        categoryId,
        acquisitionDate,
        acquisitionCost,
        condition,
        location,
        isBookable,
        customValues: customFieldsValues,
      });
      setMessage('Asset registered successfully!');
      setShowRegModal(false);
      setName('');
      setSerialNumber('');
      setCategoryId('');
      setAcquisitionDate('');
      setAcquisitionCost('');
      setCondition('New');
      setLocation('');
      setIsBookable(false);
      setCustomFieldsValues({});
      fetchAssets();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to register asset');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Asset Directory</h1>
          <p className="text-sm text-slate-400 mt-1">Locate, inspect, search, and register company equipment, devices, or furniture.</p>
        </div>
        
        {(user?.role === 'ADMIN' || user?.role === 'ASSET_MANAGER') && (
          <button
            onClick={() => setShowRegModal(true)}
            className="flex items-center justify-center space-x-2 bg-brand hover:bg-brand-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-brand/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Register Asset</span>
          </button>
        )}
      </div>

      {message && (
        <div className="bg-brand-900/20 border border-brand-500/30 text-brand-300 p-4 rounded-xl text-xs flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-bold hover:text-white">&times;</button>
        </div>
      )}

      {/* Advanced Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand"
            placeholder="Search by tag, name, serial..."
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto md:ml-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="ALLOCATED">Allocated</option>
            <option value="UNDER_MAINTENANCE">Under Maintenance</option>
            <option value="LOST">Lost</option>
            <option value="RETIRED">Retired</option>
          </select>

          <select
            value={selectedBookable}
            onChange={(e) => setSelectedBookable(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 focus:outline-none"
          >
            <option value="">Bookable Filter</option>
            <option value="true">Bookable Shared Resources</option>
            <option value="false">Non-Bookable Assets</option>
          </select>
        </div>
      </div>

      {/* Assets Grid */}
      {loading ? (
        <p className="text-slate-500 text-xs">Querying asset directory...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <div key={asset.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-750 transition-all flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] text-slate-400 font-bold bg-slate-950 border border-slate-800 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Tag className="w-2.5 h-2.5 text-brand" />
                    {asset.assetTag}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    asset.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-900/30' :
                    asset.status === 'ALLOCATED' ? 'bg-brand/10 text-brand border-brand/20' :
                    asset.status === 'UNDER_MAINTENANCE' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-800/30' :
                    'bg-red-500/10 text-red-400 border-red-900/30'
                  }`}>
                    {asset.status}
                  </span>
                </div>

                <h3 className="font-bold text-white text-md mt-3">{asset.name}</h3>
                <span className="text-[10px] text-slate-500 font-mono block">Serial: {asset.serialNumber}</span>

                <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
                    <span>{asset.category?.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{asset.location}</span>
                  </div>
                </div>

                {/* Category specific fields */}
                {asset.customValues && Object.keys(asset.customValues).length > 0 && (
                  <div className="border-t border-slate-850 pt-3.5 mt-3.5 space-y-1 text-[10px]">
                    {Object.entries(asset.customValues).map(([k, v]: [string, any]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-slate-500 uppercase">{k}:</span>
                        <span className="font-semibold text-slate-300">{String(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-slate-850 pt-4 mt-4 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Acq: {new Date(asset.acquisitionDate).toLocaleDateString()}</span>
                </span>
                <span className="font-semibold text-slate-300">Cost: ${asset.acquisitionCost}</span>
              </div>
            </div>
          ))}

          {assets.length === 0 && (
            <div className="col-span-full bg-slate-900/50 border border-slate-800 p-8 rounded-2xl text-center text-slate-500 text-xs">
              No assets match your search parameters.
            </div>
          )}
        </div>
      )}

      {/* Register Modal */}
      {showRegModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white text-md">Register New Asset</h3>
              <button 
                onClick={() => setShowRegModal(false)}
                className="text-slate-400 hover:text-white text-lg font-bold"
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleRegister} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    placeholder="e.g. MacBook Pro M3"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Serial Number *</label>
                  <input
                    type="text"
                    required
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    placeholder="e.g. SN-MBP16-9021"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="">Select Category...</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    placeholder="e.g. HQ - Room 302"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Acquisition Cost ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={acquisitionCost}
                    onChange={(e) => setAcquisitionCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                    placeholder="e.g. 1999.00"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Acquisition Date *</label>
                  <input
                    type="date"
                    required
                    value={acquisitionDate}
                    onChange={(e) => setAcquisitionDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Condition *</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="New">New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isBookable"
                    checked={isBookable}
                    onChange={(e) => setIsBookable(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-brand"
                  />
                  <label htmlFor="isBookable" className="text-slate-300 font-semibold select-none">
                    Shared / Bookable Resource
                  </label>
                </div>
              </div>

              {/* Render dynamic category custom schema fields */}
              {categoryId && categories.find((c) => c.id === categoryId)?.customFields && (
                <div className="border-t border-slate-800 pt-4 space-y-3">
                  <span className="font-bold text-slate-300 block text-[10px] uppercase tracking-wider">Category Attributes</span>
                  <div className="grid grid-cols-2 gap-4">
                    {(categories.find((c) => c.id === categoryId)?.customFields as any[]).map((field) => (
                      <div key={field.name}>
                        <label className="block text-slate-400 font-semibold mb-1 capitalize">
                          {field.name} {field.required ? '*' : ''}
                        </label>
                        {field.type === 'boolean' ? (
                          <input
                            type="checkbox"
                            checked={!!customFieldsValues[field.name]}
                            onChange={(e) => setCustomFieldsValues({
                              ...customFieldsValues,
                              [field.name]: e.target.checked
                            })}
                            className="w-4 h-4 mt-2 bg-slate-950 border-slate-800 rounded text-brand"
                          />
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            required={field.required}
                            value={customFieldsValues[field.name] || ''}
                            onChange={(e) => setCustomFieldsValues({
                              ...customFieldsValues,
                              [field.name]: field.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value
                            })}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                            placeholder={`Enter ${field.name}`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-3 rounded-xl transition-all mt-4"
              >
                Register Asset
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
