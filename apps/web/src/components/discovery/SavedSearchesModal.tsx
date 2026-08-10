import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Bookmark, Trash2, Search, Tag, DollarSign } from 'lucide-react';
import { ProductFilters } from '../../hooks/useMarketplace';

export interface SavedSearchesModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSearches?: Array<{
    id: string;
    name: string;
    query?: string;
    category?: string;
    maxPrice?: number;
    transactionType?: string;
  }>;
  onApplySavedSearch: (filters: ProductFilters) => void;
  onDeleteSavedSearch: (id: string) => void;
}

export function SavedSearchesModal({
  isOpen,
  onClose,
  savedSearches = [],
  onApplySavedSearch,
  onDeleteSavedSearch
}: SavedSearchesModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Saved Search Alerts"
      description="Quickly re-apply your bookmarked search configurations."
    >
      <div className="space-y-4 pt-2">
        {savedSearches.length === 0 ? (
          <div className="py-8 text-center space-y-2">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-sm font-bold text-slate-300">No Saved Searches Yet</h4>
            <p className="text-xs text-slate-500">Save frequent queries like "Engineering textbooks under ₹1,000" to re-apply with one click.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {savedSearches.map((item) => (
              <div
                key={item.id}
                className="glass-card rounded-xl p-3 border border-white/5 flex items-center justify-between hover:border-slate-700 transition-all"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-200">{item.name}</h4>
                  <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400">
                    {item.query && <span className="bg-slate-800 px-2 py-0.5 rounded">Query: "{item.query}"</span>}
                    {item.category && <span className="bg-indigo-950 text-indigo-300 px-2 py-0.5 rounded">{item.category}</span>}
                    {item.maxPrice && <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded">Max: ₹{item.maxPrice}</span>}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      onApplySavedSearch({
                        search: item.query,
                        category: item.category,
                        maxPrice: item.maxPrice,
                        transactionType: item.transactionType
                      });
                      onClose();
                    }}
                  >
                    Apply
                  </Button>
                  <button
                    onClick={() => onDeleteSavedSearch(item.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}
