import React, { useState } from 'react';
import { TrendingUp, Flame, Tag, BookOpen, Laptop, Bike, Cpu, Sparkles } from 'lucide-react';

export interface CampusTrendsWidgetProps {
  onSelectCategory?: (slug: string) => void;
}

export function CampusTrendsWidget({ onSelectCategory }: CampusTrendsWidgetProps) {
  const [timeframe, setTimeframe] = useState<'24H' | '7D' | '30D'>('7D');

  const trendingCategories = [
    { name: 'Textbooks', slug: 'books', icon: BookOpen, growth: '+32%', count: '142 listings' },
    { name: 'Electronics & Gadgets', slug: 'electronics', icon: Laptop, growth: '+18%', count: '98 listings' },
    { name: 'Project Kits & Sensors', slug: 'project-kits', icon: Cpu, growth: '+14%', count: '64 listings' },
    { name: 'Cycles & Commute', slug: 'cycles', icon: Bike, growth: '+11%', count: '45 listings' }
  ];

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
        <div>
          <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-500 fill-amber-500" /> Campus Marketplace Trends
          </h3>
          <p className="text-xs text-slate-400">Real-time listing activity & demand spikes across your university.</p>
        </div>

        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 text-[10px] font-bold">
          {(['24H', '7D', '30D'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                timeframe === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t === '24H' ? 'Today' : t === '7D' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Category Growth Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendingCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.slug}
              onClick={() => onSelectCategory && onSelectCategory(cat.slug)}
              className="glass-card rounded-2xl p-4 border border-white/5 hover:border-indigo-500/40 cursor-pointer transition-all space-y-2 group bg-slate-900/40"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-extrabold border border-emerald-800">
                  {cat.growth}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {cat.name}
                </h4>
                <span className="text-[10px] text-slate-400">{cat.count}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
