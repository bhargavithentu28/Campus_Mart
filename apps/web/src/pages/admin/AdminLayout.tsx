import React from 'react';
import { ShieldCheck, BarChart3, Flag, Users, FileText, Activity, ArrowLeft } from 'lucide-react';

export interface AdminLayoutProps {
  currentTab: 'OVERVIEW' | 'REPORTS' | 'USERS' | 'AUDIT' | 'SYSTEM';
  onTabChange: (tab: 'OVERVIEW' | 'REPORTS' | 'USERS' | 'AUDIT' | 'SYSTEM') => void;
  onNavigateMarketplace: () => void;
  children: React.ReactNode;
}

export function AdminLayout({ currentTab, onTabChange, onNavigateMarketplace, children }: AdminLayoutProps) {
  const navItems = [
    { id: 'OVERVIEW', label: 'Overview Stats', icon: BarChart3 },
    { id: 'REPORTS', label: 'Moderation Queue', icon: Flag },
    { id: 'USERS', label: 'User Management', icon: Users },
    { id: 'AUDIT', label: 'Audit Logs', icon: FileText },
    { id: 'SYSTEM', label: 'System & Feature Flags', icon: Activity }
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="h-16 glass-panel border-b border-white/10 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onNavigateMarketplace} className="p-2 rounded-xl text-slate-400 hover:text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" /> Admin Moderation Console
            </h1>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-indigo-950 text-indigo-300 text-xs font-bold border border-indigo-800">
          ADMIN PRIVILEGED
        </span>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 max-w-7xl w-full mx-auto p-6 gap-8">
        {/* Sidebar Nav */}
        <aside className="w-64 glass-panel rounded-2xl p-4 border border-white/5 space-y-2 flex-shrink-0 h-fit">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="flex-1 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
