import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductGrid } from '../components/marketplace/ProductGrid';
import { FilterSidebar } from '../components/marketplace/FilterSidebar';
import { SearchAutocomplete } from '../components/discovery/SearchAutocomplete';
import { SavedSearchesModal } from '../components/discovery/SavedSearchesModal';
import { CampusTrendsWidget } from '../components/discovery/CampusTrendsWidget';
import { CampusHeatmapWidget } from '../components/discovery/CampusHeatmapWidget';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../features/auth/AuthModal';
import { useProducts, useCategories, useWishlist, useToggleWishlist, ProductFilters } from '../hooks/useMarketplace';
import { Bookmark, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../lib/api';

export interface MarketplacePageProps {
  onSelectProduct: (productId: string) => void;
  onNavigateHome: () => void;
  onNavigateSell?: () => void;
}

export function MarketplacePage({ onSelectProduct, onNavigateHome, onNavigateSell }: MarketplacePageProps) {
  const [filters, setFilters] = useState<ProductFilters>({
    page: 1,
    limit: 12,
    sort: 'latest'
  });

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);

  const { data: productData, isLoading, isError, refetch } = useProducts(filters);
  const { data: categories = [] } = useCategories();
  const { data: wishlist = [] } = useWishlist();
  const toggleWishlistMutation = useToggleWishlist();

  const wishlistIds = wishlist.map((p: any) => p.id);

  // Fetch search history & saved searches when authenticated
  useEffect(() => {
    if (currentUser) {
      api.get('/search/history').then(res => {
        if (res.data.history) {
          setRecentSearches(res.data.history.map((h: any) => h.query));
        }
      }).catch(() => {});

      api.get('/search/saved').then(res => {
        if (res.data.saved) {
          setSavedSearches(res.data.saved);
        }
      }).catch(() => {});
    }
  }, [currentUser]);

  const handleSaveCurrentSearch = async () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }

    try {
      const { data } = await api.post('/search/saved', {
        name: filters.search ? `Query: ${filters.search}` : `Category: ${filters.category || 'All'}`,
        filters
      });
      if (data.saved) {
        setSavedSearches(prev => [data.saved, ...prev]);
        setIsSavedModalOpen(true);
      }
    } catch (err) {
      console.error('Failed to save search:', err);
    }
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, limit: 12, sort: 'latest' });
  };

  const products = productData?.products || [];
  const pagination = productData?.pagination || { page: 1, totalPages: 1 };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreateListing={() => onNavigateSell ? onNavigateSell() : setIsAuthOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        
        {/* Header Search Banner */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel rounded-2xl p-6 border border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100">Campus Marketplace & Discovery</h1>
            <p className="text-xs text-slate-400 mt-1">Discover verified listings, trending equipment, and student deals across your university.</p>
          </div>

          <div className="w-full md:w-96 flex items-center gap-2">
            <SearchAutocomplete
              query={filters.search || ''}
              onQueryChange={(q) => setFilters(prev => ({ ...prev, search: q || undefined, page: 1 }))}
              onSelectQuery={(q) => setFilters(prev => ({ ...prev, search: q, page: 1 }))}
              onSelectProduct={onSelectProduct}
              recentTerms={recentSearches}
            />

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Bookmark className="w-4 h-4 text-indigo-400" />}
              onClick={() => setIsSavedModalOpen(true)}
              className="flex-shrink-0"
              title="Saved Searches"
            >
              Saved
            </Button>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {(filters.category || filters.transactionType || filters.search || filters.minPrice || filters.maxPrice) && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-semibold text-slate-400">Active Filters:</span>
            {filters.category && (
              <span className="inline-flex items-center gap-1 text-xs bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-800">
                Category: {filters.category}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setFilters(prev => ({ ...prev, category: undefined }))} />
              </span>
            )}
            {filters.transactionType && (
              <span className="inline-flex items-center gap-1 text-xs bg-purple-950 text-purple-300 px-2.5 py-1 rounded-full border border-purple-800">
                Mode: {filters.transactionType}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setFilters(prev => ({ ...prev, transactionType: undefined }))} />
              </span>
            )}
            {filters.search && (
              <span className="inline-flex items-center gap-1 text-xs bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full border border-slate-700">
                Search: "{filters.search}"
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => setFilters(prev => ({ ...prev, search: undefined }))} />
              </span>
            )}

            <button
              onClick={handleSaveCurrentSearch}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2 ml-2"
            >
              Save This Search
            </button>

            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold underline underline-offset-2 ml-2"
            >
              Clear All
            </button>
          </div>
        )}

        {/* Campus Trends Section */}
        <CampusTrendsWidget
          onSelectCategory={(slug) => setFilters(prev => ({ ...prev, category: slug, page: 1 }))}
        />

        {/* Main Feed Container */}
        <div className="flex flex-col lg:flex-row gap-8 pt-2">
          {/* Sidebar Filters */}
          <FilterSidebar
            filters={filters}
            onChange={(newFilters) => setFilters(newFilters)}
            onReset={handleResetFilters}
            categories={categories}
          />

          {/* Product Feed Grid */}
          <div className="flex-1 space-y-6">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              isError={isError}
              onRetry={refetch}
              onProductClick={onSelectProduct}
              onWishlistToggle={(productId) => {
                if (!currentUser) {
                  setIsAuthOpen(true);
                } else {
                  toggleWishlistMutation.mutate(productId);
                }
              }}
              wishlistIds={wishlistIds}
            />

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-white/5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, (prev.page || 1) - 1) }))}
                >
                  Previous
                </Button>

                <span className="text-xs font-semibold text-slate-400">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                  onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Campus Heatmap Widget */}
        <CampusHeatmapWidget />

      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />

      <SavedSearchesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedSearches={savedSearches}
        onApplySavedSearch={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters, page: 1 }))}
        onDeleteSavedSearch={async (id) => {
          setSavedSearches(prev => prev.filter(s => s.id !== id));
        }}
      />
    </div>
  );
}
