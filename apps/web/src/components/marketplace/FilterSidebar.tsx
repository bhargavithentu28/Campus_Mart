import React from 'react';
import { Button } from '../ui/Button';
import { Filter, RotateCcw, Tag, ArrowUpDown } from 'lucide-react';
import { ProductFilters } from '../../hooks/useMarketplace';

export interface FilterSidebarProps {
  filters: ProductFilters;
  onChange: (newFilters: ProductFilters) => void;
  onReset: () => void;
  categories?: Array<{ name: string; slug: string; icon?: string }>;
}

export function FilterSidebar({
  filters,
  onChange,
  onReset,
  categories = []
}: FilterSidebarProps) {
  const transactionTypes = [
    { label: 'All Modes', value: '' },
    { label: 'Buy Direct', value: 'BUY' },
    { label: 'Rent Semester', value: 'RENT' },
    { label: 'Short Borrow', value: 'BORROW' },
    { label: 'Exchange Barter', value: 'EXCHANGE' },
    { label: 'Free Giveaway', value: 'DONATE' }
  ];

  const conditions = [
    { label: 'Brand New', value: 'BRAND_NEW' },
    { label: 'Like New', value: 'LIKE_NEW' },
    { label: 'Good', value: 'GOOD' },
    { label: 'Fair', value: 'FAIR' }
  ];

  const sortOptions = [
    { label: 'Newest First', value: 'latest' },
    { label: 'Price: Low to High', value: 'price_asc' },
    { label: 'Price: High to Low', value: 'price_desc' },
    { label: 'Most Popular', value: 'popular' }
  ];

  return (
    <aside className="w-full lg:w-64 glass-panel rounded-2xl p-5 border border-white/5 space-y-6 flex-shrink-0">
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-400" /> Filters & Sort
        </h3>
        <button
          onClick={onReset}
          className="text-xs text-slate-400 hover:text-indigo-400 transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Sort Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" /> Sort By
        </label>
        <select
          value={filters.sort || 'latest'}
          onChange={(e) => onChange({ ...filters, sort: e.target.value })}
          className="w-full glass-input text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Transaction Type Radio Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-indigo-400" /> Transaction Mode
        </label>
        <div className="space-y-1">
          {transactionTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => onChange({ ...filters, transactionType: type.value || undefined })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                (filters.transactionType || '') === type.value
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Price Filter */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Price Range (₹)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={filters.minPrice || ''}
            onChange={(e) => onChange({ ...filters, minPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full glass-input text-xs rounded-xl px-3 py-1.5 placeholder:text-slate-500"
          />
          <span className="text-slate-500 text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxPrice || ''}
            onChange={(e) => onChange({ ...filters, maxPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
            className="w-full glass-input text-xs rounded-xl px-3 py-1.5 placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Category List */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Categories
          </label>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => onChange({ ...filters, category: undefined })}
              className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !filters.category
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => onChange({ ...filters, category: cat.slug })}
                className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filters.category === cat.slug
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
