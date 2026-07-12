import React from 'react';
import { Shield, Cpu, Calendar, ClipboardCheck, ArrowRight, Layers, FileText, Wrench } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-white">Asset<span className="text-brand-400">Flow</span></span>
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Enterprise ERP</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#roles" className="hover:text-white transition-colors">Roles & Workflows</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={onLogin}
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-brand hover:bg-brand-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-brand/25 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,59,235,0.08),transparent_45%)]" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-brand-900/40 border border-brand-500/25 px-4 py-1.5 rounded-full text-brand-300 text-xs font-semibold mb-6">
            <span>Hackathon Edition</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
            <span>Production Grade architecture</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight md:leading-none">
            Simplify & Digitize Your Organization's <span className="text-brand-400">Asset Lifecycle</span>
          </h1>
          <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Centralized resource scheduling, conflict-free allocation, live maintenance auditing, and automated workflows designed for the modern enterprise.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-brand hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-xl transition-all shadow-xl shadow-brand/25 flex items-center justify-center space-x-3 group"
            >
              <span>Initialize Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-all flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>

          {/* Interactive Live Dashboard Mockup */}
          <div className="mt-16 max-w-5xl mx-auto border border-slate-800 bg-slate-900/30 rounded-2xl p-4 shadow-2xl relative">
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 bg-brand/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="border border-slate-800/80 bg-slate-950 rounded-xl overflow-hidden shadow-inner">
              {/* Fake Window Header */}
              <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-900 flex items-center justify-between">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-xs text-slate-500 font-mono">https://app.assetflow.com/dashboard</div>
                <div className="w-12" />
              </div>
              {/* Fake Dashboard Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4 text-left">
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4">
                  <span className="text-xs text-slate-400 font-medium">Assets Available</span>
                  <div className="text-2xl font-bold text-emerald-400 mt-1">142</div>
                  <span className="text-[10px] text-emerald-500 font-semibold mt-1 block">● Ready for allocation</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4">
                  <span className="text-xs text-slate-400 font-medium">Allocated Assets</span>
                  <div className="text-2xl font-bold text-brand-400 mt-1">87</div>
                  <span className="text-[10px] text-brand-400 font-semibold mt-1 block">● Held by employees</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4">
                  <span className="text-xs text-slate-400 font-medium">Under Maintenance</span>
                  <div className="text-2xl font-bold text-yellow-500 mt-1">5</div>
                  <span className="text-[10px] text-yellow-500/80 font-semibold mt-1 block">● Resolution pending</span>
                </div>
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4">
                  <span className="text-xs text-slate-400 font-medium">Overdue Returns</span>
                  <div className="text-2xl font-bold text-red-500 mt-1">3</div>
                  <span className="text-[10px] text-red-400 font-semibold mt-1 block">▲ Urgent follow-up</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-slate-900/30 border-y border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-extrabold text-white">Full-Spectrum Asset Operations</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              Every phase of an asset's cycle managed within a robust, structured database featuring strict constraint enforcement.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-850 transition-all">
              <div className="w-12 h-12 rounded-xl bg-brand/10 flex items-center justify-center text-brand mb-6">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Lifecycle Tracking</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Track assets from registration through Available, Allocated, Under Maintenance, and Retired states with fully logged historical records.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-850 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-6">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Conflict-Free Bookings</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Shared conference rooms, vehicles, or test rigs are scheduled with precision overlap protection, preventing double bookings down to the minute.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-850 transition-all">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center text-yellow-500 mb-6">
                <Wrench className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Maintenance Workflows</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Route faulty equipment through approvals, assign technicians, track progress in real-time, and auto-update asset availability states.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-850 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Structured Audit Cycles</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Initiate site or department-scoped audits, assign auditors, compile automatic discrepancy logs, and auto-report missing assets.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-850 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Role-Based Access (RBAC)</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Explicit controls for Employees, Asset Managers, Department Heads, and Admins. Prevent self-elevation of accounts.
              </p>
            </div>

            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 hover:border-slate-850 transition-all">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-400 mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">SaaS-grade DB Schema</h3>
              <p className="mt-3 text-slate-400 text-sm leading-relaxed">
                Powered by Prisma with a clean relational layout (PostgreSQL) guaranteeing data consistency and fast query execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role workflow section */}
      <section id="roles" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white">Enterprise Role Workflows</h2>
            <p className="mt-4 text-slate-400 leading-relaxed">
              AssetFlow mimics real-world enterprise organizational workflows. Staff accounts cannot self-appoint high privileges, keeping audit registers clean.
            </p>
            <div className="mt-8 space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-brand-400 text-xs">1</div>
                <div>
                  <h4 className="text-white font-semibold">User Signup</h4>
                  <p className="text-xs text-slate-400 mt-1">Users register as simple Employees without selection of administrative rights.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-brand-400 text-xs">2</div>
                <div>
                  <h4 className="text-white font-semibold">Admin Promotion</h4>
                  <p className="text-xs text-slate-400 mt-1">System Administrators promote Employees to Asset Managers or Department Heads inside the Org Setup Directory.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-brand-400 text-xs">3</div>
                <div>
                  <h4 className="text-white font-semibold">Conflict Handled Reallocation</h4>
                  <p className="text-xs text-slate-400 mt-1">Department Heads trigger transfers between staff. Overlap validation stops conflicting claims on laptops and items.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-800 bg-slate-900/30 rounded-2xl p-6 relative">
            <h3 className="text-white font-bold mb-4 flex items-center space-x-2">
              <span>Security Guard Rails</span>
              <span className="text-xs bg-red-950 border border-red-800/40 text-red-400 px-2.5 py-0.5 rounded-full font-semibold">Active</span>
            </h3>
            <div className="space-y-4 font-mono text-xs">
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <div className="text-slate-500">// Conflict Prevention Guard</div>
                <div className="text-slate-300 mt-2">IF asset.status == 'ALLOCATED' THEN</div>
                <div className="text-red-400 pl-4 mt-1">REJECT allocation_request</div>
                <div className="text-emerald-400 pl-4 mt-1">PROPOSE transfer_request(source: holder, target: requester)</div>
              </div>
              <div className="bg-slate-950 p-4 border border-slate-800 rounded-xl">
                <div className="text-slate-500">// Role Guard</div>
                <div className="text-slate-300 mt-2">IF user.role != 'ADMIN' AND route == '/api/org/employees/:id/role' THEN</div>
                <div className="text-red-400 pl-4 mt-1">RETURN 403_FORBIDDEN</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-10 bg-slate-950 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-slate-500 text-xs">
          <span>&copy; {new Date().getFullYear()} AssetFlow ERP System. </span>
        </div>
      </footer>
    </div>
  );
};
