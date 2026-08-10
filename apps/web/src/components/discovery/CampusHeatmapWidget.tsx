import React from 'react';
import { MapPin, ShieldCheck, Activity } from 'lucide-react';

export interface CampusHeatmapWidgetProps {
  heatmapData?: Array<{ locationName: string; activityCount: number; growth?: string }>;
}

export function CampusHeatmapWidget({ heatmapData }: CampusHeatmapWidgetProps) {
  const data = heatmapData || [
    { locationName: 'Hostel Block 3 Lounge', activityCount: 142, growth: '+34%' },
    { locationName: 'Central Library Courtyard', activityCount: 98, growth: '+18%' },
    { locationName: 'Main Gate Security Desk', activityCount: 76, growth: '+12%' },
    { locationName: 'Engineering Building Canteen', activityCount: 64, growth: '+8%' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div>
          <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Anonymized Activity Heatmap
          </h3>
          <p className="text-xs text-slate-400">Popular on-campus trade & pickup zones.</p>
        </div>

        <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> PRIVACY PROTECTED
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.map((item, idx) => (
          <div key={idx} className="glass-card rounded-xl p-3 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-slate-200 block">{item.locationName}</span>
                <span className="text-[10px] text-slate-400">{item.activityCount} exchanges this month</span>
              </div>
            </div>

            {item.growth && (
              <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800">
                {item.growth}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
