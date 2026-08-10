import React, { useState, useEffect } from 'react';
import { Users, ShoppingBag, Flag, CheckCircle2, TrendingUp } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminOverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(res => {
        if (res.data.stats) setStats(res.data.stats);
      })
      .catch(err => console.error('Admin stats error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <div className="text-xs text-slate-400 animate-pulse">Loading overview metrics...</div>;
  }

  const cards = [
    { label: 'Total Verified Students', value: stats?.totalUsers || 0, icon: Users, color: 'text-indigo-400' },
    { label: 'Active Listings', value: stats?.activeListings || 0, icon: ShoppingBag, color: 'text-emerald-400' },
    { label: 'Pending Reports', value: stats?.pendingReports || 0, icon: Flag, color: 'text-rose-400' },
    { label: 'Completed Transactions', value: stats?.totalTransactions || 0, icon: CheckCircle2, color: 'text-purple-400' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Marketplace Overview</h2>
        <p className="text-xs text-slate-400 mt-1">Real-time database activity metrics across your university marketplace.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{card.label}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="text-2xl font-black text-slate-100 tracking-tight">{card.value}</p>
            </div>
          );
        })}
      </div>

      {/* Category Distribution Grid */}
      {stats?.categoryDistribution?.length > 0 && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-400" /> Category Breakdown
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.categoryDistribution.map((cat: any) => (
              <div key={cat.name} className="glass-card rounded-xl p-3 border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase block">{cat.name}</span>
                <span className="text-lg font-bold text-slate-100">{cat.count} listings</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
