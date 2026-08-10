import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, ToggleLeft, ToggleRight, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';

export function AdminSystemPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [health, setHealth] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/admin/feature-flags'),
      api.get('/admin/health')
    ])
      .then(([flagsRes, healthRes]) => {
        if (flagsRes.data.flags) setFlags(flagsRes.data.flags);
        if (healthRes.data.services) setHealth(healthRes.data.services);
      })
      .catch(err => console.error('Fetch system error:', err))
      .finally(() => setIsLoading(false));
  }, []);

  const handleToggleFlag = async (key: string, currentEnabled: boolean) => {
    try {
      await api.post('/admin/feature-flags/toggle', { key, enabled: !currentEnabled });
      setFlags(prev => prev.map(f => f.key === key ? { ...f, enabled: !currentEnabled } : f));
    } catch (err) {
      console.error('Toggle flag error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">System & Feature Flags</h2>
        <p className="text-xs text-slate-400 mt-1">Operational health statuses and dynamic feature flag controls.</p>
      </div>

      {/* Health Checks */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> Infrastructure Health Checks
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {health.map((svc) => (
            <div key={svc.name} className="glass-card rounded-xl p-3.5 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-200 block">{svc.name}</span>
                <span className="text-[10px] text-slate-400">Latency: {svc.latency}</span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-extrabold border border-emerald-800 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {svc.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Flags Manager */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> Platform Feature Flags
        </h3>
        <div className="space-y-2">
          {flags.map((flag) => (
            <div key={flag.key} className="glass-card rounded-xl p-4 border border-white/5 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-100 font-mono block">{flag.key}</span>
                <span className="text-xs text-slate-400">{flag.description || 'System feature toggle'}</span>
              </div>

              <button
                onClick={() => handleToggleFlag(flag.key, flag.enabled)}
                className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
              >
                {flag.enabled ? (
                  <ToggleRight className="w-8 h-8 text-indigo-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-600" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
