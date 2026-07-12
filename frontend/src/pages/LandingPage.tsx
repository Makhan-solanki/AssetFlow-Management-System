import React, { useState } from 'react';
import { Shield, Cpu, Calendar, ClipboardCheck, ArrowRight, Layers, FileText, Wrench } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  const [emailInput, setEmailInput] = useState('');

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput) {
      alert(`Demo requested for: ${emailInput}. We will contact you shortly!`);
      setEmailInput('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-brand selection:text-white font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight text-slate-100">Asset<span className="text-brand">Flow</span></span>
              <span className="block text-[10px] text-slate-400 font-medium uppercase tracking-wider">Enterprise ERP</span>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-400">
            <a href="#features" className="hover:text-slate-100 transition-colors">Features</a>
            <a href="#architecture" className="hover:text-slate-100 transition-colors">Architecture</a>
            <a href="#roles" className="hover:text-slate-100 transition-colors">Roles & Workflows</a>
          </nav>
          <div className="flex items-center space-x-4">
            <button
              onClick={onLogin}
              className="text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="bg-brand hover:bg-brand-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.06),transparent_45%)]" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-brand-100 border border-brand-200 px-4 py-1.5 rounded-full text-brand text-xs font-semibold mb-6">
            <span>Hackathon Edition</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            <span>Production Grade Architecture</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-100 max-w-4xl mx-auto leading-tight md:leading-none">
            Simplify & Digitize Your Organization's <span className="text-brand">Asset Lifecycle</span>
          </h1>
          <p className="mt-6 text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Centralized resource scheduling, conflict-free allocation, live maintenance auditing, and automated workflows designed for the modern enterprise.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-brand hover:bg-brand-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all shadow-xl shadow-brand/20 flex items-center justify-center space-x-3 group"
            >
              <span>Initialize Workspace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="#features"
              className="w-full sm:w-auto border border-slate-800 hover:border-slate-700 bg-slate-900/50 hover:bg-slate-900 text-slate-400 hover:text-slate-100 font-semibold px-8 py-3.5 rounded-xl transition-all flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>
        </div>
      </section>

      {/* Features Grid Section (Re-styled exactly matching image 1) */}
      <section id="features" className="py-20 bg-slate-950 border-t border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Lifecycle */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:shadow-lg hover:border-slate-700/60 transition-all flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">Lifecycle Tracking</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Track assets from registration through Available, Allocated, Under Maintenance, and Retired states with fully logged historical records.
              </p>
            </div>

            {/* Card 2: Bookings */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:shadow-lg hover:border-slate-700/60 transition-all flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">Conflict-Free Bookings</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Shared conference rooms, vehicles, or test rigs are scheduled with precision overlap protection, preventing double bookings down to the minute.
              </p>
            </div>

            {/* Card 3: Maintenance */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:shadow-lg hover:border-slate-700/60 transition-all flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-6">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">Maintenance Workflows</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Route faulty equipment through approvals, assign technicians, track progress in real-time, and auto-update asset availability states.
              </p>
            </div>

            {/* Card 4: Audits */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:shadow-lg hover:border-slate-700/60 transition-all flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                <ClipboardCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">Structured Audit Cycles</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Initiate site or department-scoped audits, assign auditors, compile automatic discrepancy logs, and auto-report missing assets.
              </p>
            </div>

            {/* Card 5: RBAC */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:shadow-lg hover:border-slate-700/60 transition-all flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">Role-Based Access (RBAC)</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Explicit controls for Employees, Asset Managers, Department Heads, and Admins. Prevent self-elevation of accounts.
              </p>
            </div>

            {/* Card 6: Schema */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 hover:shadow-lg hover:border-slate-700/60 transition-all flex flex-col items-start text-left">
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center mb-6">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-3">SaaS-grade DB Schema</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Powered by Prisma with a clean relational layout (PostgreSQL) guaranteeing data consistency and fast query execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Layer Illustration Section (matching image 2 isometric representation) */}
      <section id="architecture" className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Isometric Layer Simulation */}
          <div className="relative h-[320px] flex items-center justify-center">
            {/* Layer 3: Database */}
            <div className="absolute w-80 h-32 bg-slate-900/40 border border-slate-800 rounded-2xl shadow-xl transform rotate-x-60 rotate-z-[-20deg] translate-y-16 scale-90 flex items-center justify-center group hover:translate-y-12 transition-all">
              <div className="text-slate-500 font-mono text-[10px] transform rotate-z-[20deg] rotate-x-[-60deg] text-center">
                <Layers className="w-5 h-5 text-indigo-400 mx-auto mb-1" />
                <span>Neon Postgres DB</span>
              </div>
            </div>

            {/* Layer 2: Business Logic API */}
            <div className="absolute w-80 h-32 bg-white border border-slate-800 rounded-2xl shadow-xl transform rotate-x-60 rotate-z-[-20deg] flex items-center justify-center group hover:-translate-y-4 transition-all">
              <div className="text-slate-100 font-mono text-[10px] transform rotate-z-[20deg] rotate-x-[-60deg] text-center">
                <Cpu className="w-5 h-5 text-brand mx-auto mb-1" />
                <span>Business validation engines</span>
              </div>
            </div>

            {/* Layer 1: Dashboard UI */}
            <div className="absolute w-80 h-32 bg-purple-100 border border-purple-200 rounded-2xl shadow-2xl transform rotate-x-60 rotate-z-[-20deg] -translate-y-16 scale-105 flex items-center justify-center group hover:-translate-y-20 transition-all">
              <div className="text-purple-700 font-semibold text-[10px] transform rotate-z-[20deg] rotate-x-[-60deg] text-center">
                <Layers className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <span>Operations Dashboard</span>
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="text-left space-y-8">
            <h2 className="text-3xl font-extrabold text-slate-100">Multi-layered Enterprise Safeguards</h2>
            <div className="space-y-6">
              <div>
                <span className="text-brand font-bold block text-sm">Visual Operations Dashboard</span>
                <p className="text-slate-400 text-xs mt-1">Build real-time control rooms. Track allocation logs, active schedulers, and technician resolved maintenance boards.</p>
              </div>
              <div>
                <span className="text-emerald-500 font-bold block text-sm">Conflict Prevention Engines</span>
                <p className="text-slate-400 text-xs mt-1">A calculation layer that validates timeline reservations, blocks double-allocations, and manages transfers.</p>
              </div>
              <div>
                <span className="text-purple-600 font-bold block text-sm">Neon Postgres Data Layer</span>
                <p className="text-slate-400 text-xs mt-1">Structured PostgreSQL relationships enforced by Prisma ORM for total data persistence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Callout Banner (matching image 3 callout) */}
      <section className="py-24 bg-purple-100 border-t border-slate-800 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10 space-y-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-100 leading-tight">
            Stop manually tracking your hardware.<br />Start automated auditing.
          </h2>
          
          <form onSubmit={handleDemoSubmit} className="max-w-md mx-auto flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-md">
            <input 
              type="email" 
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="Enter your work email" 
              className="flex-1 bg-transparent border-0 outline-none text-slate-100 text-xs px-4 py-2 placeholder-slate-400 focus:ring-0"
            />
            <button 
              type="submit"
              className="bg-brand hover:bg-brand-600 text-white font-semibold text-xs px-5 py-2.5 rounded-full transition-all shrink-0 active:scale-95"
            >
              Get a demo
            </button>
          </form>
        </div>
      </section>

      {/* Footer Column (matching image 3 multi-column layout) */}
      <footer className="bg-slate-900 border-t border-slate-850 py-16 px-6 font-sans">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-left">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-brand" />
              <span className="font-bold text-sm text-slate-100">AssetFlow</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              High-fidelity enterprise asset management designed for modern teams.
            </p>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Guides</span>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#architecture" className="hover:text-slate-100 transition-colors">Enterprise Asset Management Guide</a></li>
              <li><a href="#features" className="hover:text-slate-100 transition-colors">SaaS Audit Best Practices Guide</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resources</span>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#features" className="hover:text-slate-100 transition-colors">Customers</a></li>
              <li><a href="#features" className="hover:text-slate-100 transition-colors">Launches</a></li>
              <li><a href="#features" className="hover:text-slate-100 transition-colors">Pricing</a></li>
              <li><a href="#features" className="hover:text-slate-100 transition-colors">Use cases</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company</span>
            <ul className="space-y-2 text-xs text-slate-500">
              <li><a href="#features" className="hover:text-slate-100 transition-colors">About</a></li>
              <li><a href="#features" className="hover:text-slate-100 transition-colors">Help docs</a></li>
              <li><a href="#features" className="hover:text-slate-100 transition-colors">LinkedIn</a></li>
              <li><a href="#features" className="hover:text-slate-100 transition-colors">X</a></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800 mt-12 pt-8 flex items-center justify-between text-slate-500 text-xs">
          <span>&copy; {new Date().getFullYear()} AssetFlow ERP System. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};
