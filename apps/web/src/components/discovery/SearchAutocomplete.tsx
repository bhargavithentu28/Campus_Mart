import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, TrendingUp, History, X, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';

export interface SearchAutocompleteProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSelectQuery: (q: string) => void;
  onSelectProduct?: (productId: string) => void;
  trendingTerms?: string[];
  recentTerms?: string[];
  onClearRecent?: () => void;
}

export function SearchAutocomplete({
  query,
  onQueryChange,
  onSelectQuery,
  onSelectProduct,
  trendingTerms = ['Cycles', 'Calculators', 'Engineering Math', 'iPads', 'Lab Manuals'],
  recentTerms = [],
  onClearRecent
}: SearchAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAiInterpreting, setIsAiInterpreting] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search fetching
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get(`/products?search=${encodeURIComponent(query)}&limit=5`);
        if (data.products) {
          setResults(data.products);
        }
      } catch (err) {
        console.error('Autocomplete fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAiSearch = async () => {
    if (!query.trim()) return;
    setIsAiInterpreting(true);

    try {
      const { data } = await api.post('/search/ai-interpret', { prompt: query });
      if (data.filters?.search) {
        onSelectQuery(data.filters.search);
      }
    } catch (err) {
      console.error('AI search interpretation error:', err);
    } finally {
      setIsAiInterpreting(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              setIsOpen(false);
              onSelectQuery(query);
            }
          }}
          placeholder="Search books, cycles, lab kits, or ask AI (e.g. books under 500)..."
          className="w-full glass-input text-xs rounded-xl pl-10 pr-20 py-2.5 placeholder:text-slate-500 focus:outline-none"
        />

        {query.length > 2 && (
          <button
            type="button"
            onClick={handleAiSearch}
            disabled={isAiInterpreting}
            className="absolute right-2 px-2.5 py-1 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-[10px] font-bold flex items-center gap-1 hover:bg-indigo-600/50 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-indigo-400" /> Ask AI
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-panel rounded-2xl border border-white/10 p-3 shadow-2xl z-50 space-y-3 bg-slate-950/95 backdrop-blur-2xl">
          
          {/* Live Product Results */}
          {results.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2">
                Matching Listings ({results.length})
              </span>
              <div className="space-y-1">
                {results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setIsOpen(false);
                      if (onSelectProduct) onSelectProduct(p.id);
                    }}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={p.images?.[0]?.url || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'}
                        alt={p.title}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                      <div>
                        <span className="text-xs font-semibold text-slate-200 block line-clamp-1">{p.title}</span>
                        <span className="text-[10px] text-slate-400">{p.category?.name || 'Item'} • {p.condition}</span>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-100">
                      {p.transactionType === 'DONATE' ? 'FREE' : `₹${p.price}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Search Terms */}
          {recentTerms.length > 0 && !query.trim() && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <History className="w-3 h-3 text-slate-400" /> Recent Searches
                </span>
                {onClearRecent && (
                  <button onClick={onClearRecent} className="text-[10px] text-slate-400 hover:text-slate-200">
                    Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 px-1">
                {recentTerms.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsOpen(false);
                      onSelectQuery(term);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/5 text-xs text-slate-300 hover:text-indigo-300 hover:border-indigo-800 transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {trendingTerms.length > 0 && !query.trim() && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-indigo-400" /> Trending on Campus
              </span>
              <div className="flex flex-wrap gap-1.5 px-1">
                {trendingTerms.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIsOpen(false);
                      onSelectQuery(term);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/40 text-xs text-indigo-300 hover:bg-indigo-900/60 transition-all flex items-center gap-1"
                  >
                    {term} <ArrowRight className="w-3 h-3 text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
