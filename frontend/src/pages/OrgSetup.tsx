import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';
import { Layers, ShieldAlert, Check, UserPlus, FolderPlus, Grid, ChevronDown } from 'lucide-react';
import { Dropdown } from '../components/Dropdown';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  departmentId: string | null;
  department?: { name: string };
}

interface Department {
  id: string;
  name: string;
  status: string;
  headId: string | null;
  parentId: string | null;
  head?: { name: string };
  parent?: { name: string };
}

interface Category {
  id: string;
  name: string;
  customFields: any;
}

export const OrgSetup: React.FC = () => {
  const { user: currentUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'depts' | 'categories' | 'employees'>('depts');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  const [deptName, setDeptName] = useState('');
  const [deptHeadId, setDeptHeadId] = useState('');
  const [deptParentId, setDeptParentId] = useState('');

  const [isHeadDropdownOpen, setIsHeadDropdownOpen] = useState(false);
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);

  const [catName, setCatName] = useState('');
  const [customFieldName, setCustomFieldName] = useState('');
  const [customFieldType, setCustomFieldType] = useState('string');
  const [fieldsList, setFieldsList] = useState<{name: string, type: string, required: boolean}[]>([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, catRes, empRes] = await Promise.all([
        api.get('/org/departments'),
        api.get('/org/categories'),
        api.get('/org/employees')
      ]);
      setDepartments(deptRes.data.data);
      setCategories(catRes.data.data);
      setEmployees(empRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/org/departments', {
        name: deptName,
        headId: deptHeadId || undefined,
        parentId: deptParentId || undefined
      });
      setDeptName('');
      setDeptHeadId('');
      setDeptParentId('');
      setMessage('Department created successfully!');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/org/categories', {
        name: catName,
        customFields: fieldsList
      });
      setCatName('');
      setFieldsList([]);
      setMessage('Asset category created successfully!');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleAddField = () => {
    if (!customFieldName) return;
    setFieldsList([...fieldsList, { name: customFieldName, type: customFieldType, required: true }]);
    setCustomFieldName('');
  };

  const handlePromoteRole = async (employeeId: string, newRole: string) => {
    try {
      await api.put(`/org/employees/${employeeId}/role`, { role: newRole });
      setMessage('Role updated successfully.');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleUserStatus = async (employeeId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await api.put(`/org/employees/${employeeId}/role`, { status: nextStatus });
      setMessage('User status updated successfully.');
      fetchData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to update user status');
    }
  };

  if (currentUser?.role !== 'ADMIN') {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-sm text-slate-400">
          Only System Administrators are permitted to configure departments, categories, and manage roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Organization Setup</h1>
        <p className="text-sm text-slate-400 mt-1">Configure structural master data: departments, asset categories, and user permissions.</p>
      </div>

      {message && (
        <div className="bg-brand-900/20 border border-brand-500/30 text-brand-300 p-4 rounded-xl text-xs flex justify-between items-center">
          <span>{message}</span>
          <button onClick={() => setMessage('')} className="font-semibold hover:text-white">&times;</button>
        </div>
      )}

      {/* Tabs list */}
      <div className="flex border-b border-slate-850">
        <button
          onClick={() => setActiveTab('depts')}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'depts' ? 'border-brand text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Department Management
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'categories' ? 'border-brand text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Asset Categories
        </button>
        <button
          onClick={() => setActiveTab('employees')}
          className={`px-6 py-3.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'employees' ? 'border-brand text-brand-400' : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Employee Directory & Roles
        </button>
      </div>

      {/* Tab A - Department Management */}
      {activeTab === 'depts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 h-fit">
            <h3 className="text-md font-bold text-white flex items-center space-x-2">
              <FolderPlus className="w-4 h-4 text-brand" />
              <span>Create Department</span>
            </h3>
            <form onSubmit={handleCreateDept} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="e.g. Quality Assurance"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Department Head (Optional)</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHeadDropdownOpen(!isHeadDropdownOpen);
                      setIsParentDropdownOpen(false);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 flex items-center justify-between text-left font-semibold text-xs shadow-sm hover:border-slate-700 transition-all focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <span>
                      {deptHeadId 
                        ? employees.find(e => e.id === deptHeadId)?.name || 'Select Head...' 
                        : 'Select Head...'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {isHeadDropdownOpen && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100">
                      <div 
                        onClick={() => { setDeptHeadId(''); setIsHeadDropdownOpen(false); }}
                        className="px-3.5 py-2 hover:bg-slate-850 cursor-pointer text-slate-400 font-semibold text-left"
                      >
                        Select Head...
                      </div>
                      {employees.map((emp) => (
                        <div
                          key={emp.id}
                          onClick={() => { setDeptHeadId(emp.id); setIsHeadDropdownOpen(false); }}
                          className={`px-3.5 py-2 hover:bg-slate-850 cursor-pointer transition-colors text-left ${
                            deptHeadId === emp.id ? 'bg-purple-100/40 text-brand font-bold' : 'text-slate-100'
                          }`}
                        >
                          {emp.name} ({emp.email})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Parent Department (Optional Hierarchy)</label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsParentDropdownOpen(!isParentDropdownOpen);
                      setIsHeadDropdownOpen(false);
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-100 flex items-center justify-between text-left font-semibold text-xs shadow-sm hover:border-slate-700 transition-all focus:outline-none focus:ring-1 focus:ring-brand"
                  >
                    <span>
                      {deptParentId 
                        ? departments.find(d => d.id === deptParentId)?.name || 'None (Top Level)' 
                        : 'None (Top Level)'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </button>
                  {isParentDropdownOpen && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-100">
                      <div 
                        onClick={() => { setDeptParentId(''); setIsParentDropdownOpen(false); }}
                        className="px-3.5 py-2 hover:bg-slate-850 cursor-pointer text-slate-400 font-semibold text-left"
                      >
                        None (Top Level)
                      </div>
                      {departments.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => { setDeptParentId(d.id); setIsParentDropdownOpen(false); }}
                          className={`px-3.5 py-2 hover:bg-slate-850 cursor-pointer transition-colors text-left ${
                            deptParentId === d.id ? 'bg-purple-100/40 text-brand font-bold' : 'text-slate-100'
                          }`}
                        >
                          {d.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl transition-all"
              >
                Save Department
              </button>
            </form>
          </div>

          {/* List of Departments */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-hidden">
            <h3 className="text-md font-bold text-white mb-6">Existing Departments</h3>
            {loading ? (
              <p className="text-slate-500 text-xs">Loading departments...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-400">
                      <th className="pb-3 font-semibold">Department</th>
                      <th className="pb-3 font-semibold">Head Assigned</th>
                      <th className="pb-3 font-semibold">Parent Division</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="text-slate-300">
                        <td className="py-4 font-semibold text-white">{dept.name}</td>
                        <td className="py-4">{dept.head?.name || <span className="text-slate-500">Unassigned</span>}</td>
                        <td className="py-4">{dept.parent?.name || <span className="text-slate-500">—</span>}</td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${
                            dept.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-850 text-slate-500'
                          }`}>
                            {dept.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab B - Asset Categories */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create category Form */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4 h-fit">
            <h3 className="text-md font-bold text-white flex items-center space-x-2">
              <Grid className="w-4 h-4 text-brand" />
              <span>Create Category</span>
            </h3>
            <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={catName}
                  onChange={(e) => setCatName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                  placeholder="e.g. Vehicles, Testing Gear"
                />
              </div>

              <div className="border-t border-slate-850 pt-4 space-y-3">
                <span className="font-semibold text-slate-300 block">Category Specific Fields</span>
                <div className="space-y-2">
                  <input
                    type="text"
                    value={customFieldName}
                    onChange={(e) => setCustomFieldName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:ring-1 focus:ring-brand"
                    placeholder="Field name (e.g. horsepower)"
                  />
                  <div className="flex gap-2">
                    <Dropdown
                      value={customFieldType}
                      onChange={(val) => setCustomFieldType(val)}
                      options={[
                        { value: 'string', label: 'String' },
                        { value: 'number', label: 'Number' },
                        { value: 'boolean', label: 'Boolean' },
                      ]}
                      className="flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddField}
                      className="bg-slate-850 hover:bg-slate-800 text-slate-300 px-5 py-2.5 rounded-xl border border-slate-850 font-semibold"
                    >
                      Add Field
                    </button>
                  </div>
                </div>
                {fieldsList.length > 0 && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-1.5">
                    {fieldsList.map((f, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded">
                        <span>{f.name} ({f.type})</span>
                        <button 
                          type="button" 
                          onClick={() => setFieldsList(fieldsList.filter((_, idx) => idx !== i))}
                          className="text-red-400 hover:text-red-300 font-bold"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-brand hover:bg-brand-600 text-white font-semibold py-2.5 rounded-xl transition-all"
              >
                Save Category
              </button>
            </form>
          </div>

          {/* List of categories */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-md font-bold text-white mb-6">Existing Categories</h3>
            {loading ? (
              <p className="text-slate-500 text-xs">Loading categories...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <div key={cat.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <span className="font-bold text-white text-sm block">{cat.name}</span>
                    <span className="text-[10px] text-slate-500 block">Schema fields:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(cat.customFields as any[] || []).map((f, i) => (
                        <span key={i} className="bg-slate-900 border border-slate-850 px-2 py-0.5 rounded text-slate-400">
                          {f.name}: {f.type}
                        </span>
                      ))}
                      {(!cat.customFields || (cat.customFields as any[]).length === 0) && (
                        <span className="text-slate-500 italic">No custom attributes.</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab C - Employees Directory & Privilege promotion */}
      {activeTab === 'employees' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-md font-bold text-white mb-6 flex items-center space-x-2">
            <UserPlus className="w-5 h-5 text-brand" />
            <span>Manage Employee Directory Roles</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-850 text-slate-400">
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Email</th>
                  <th className="pb-3 font-semibold">Current Department</th>
                  <th className="pb-3 font-semibold">Assigned Role</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {employees.map((emp) => (
                  <tr key={emp.id} className="text-slate-300">
                    <td className="py-4 font-semibold text-white">{emp.name}</td>
                    <td className="py-4 text-slate-400">{emp.email}</td>
                    <td className="py-4">{emp.department?.name || <span className="text-slate-500">Unassigned</span>}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        emp.role === 'ADMIN' ? 'bg-red-500/10 text-red-400 border border-red-800/20' :
                        emp.role === 'ASSET_MANAGER' ? 'bg-brand-500/10 text-brand-400 border border-brand-800/20' :
                        emp.role === 'DEPARTMENT_HEAD' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-800/20' :
                        'bg-slate-850 text-slate-400'
                      }`}>
                        {emp.role}
                      </span>
                    </td>
                    <td className="py-4 text-right space-x-2">
                      {emp.id !== currentUser.id && (
                        <>
                          <select
                            value={emp.role}
                            onChange={(e) => handlePromoteRole(emp.id, e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-slate-100 text-[11px] font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand cursor-pointer shadow-sm hover:border-slate-600 transition-all"
                          >
                            <option value="EMPLOYEE">Make Employee</option>
                            <option value="ASSET_MANAGER">Make Asset Manager</option>
                            <option value="DEPARTMENT_HEAD">Make Dept Head</option>
                            <option value="ADMIN">Make Admin</option>
                          </select>

                          <button
                            onClick={() => handleToggleUserStatus(emp.id, emp.status)}
                            className={`px-3 py-1 rounded text-[10px] font-semibold transition-all ${
                              emp.status === 'ACTIVE' 
                                ? 'bg-red-950/40 hover:bg-red-950 text-red-400 border border-red-900/30' 
                                : 'bg-emerald-950/40 hover:bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                            }`}
                          >
                            {emp.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
