import React, { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { LandingPage } from './pages/LandingPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { ListingWizard } from './features/listing/ListingWizard';
import { AdminConsole } from './pages/admin/AdminConsole';

export default function App() {
  const [currentView, setCurrentView] = useState<'LANDING' | 'MARKETPLACE' | 'PRODUCT_DETAILS' | 'WISHLIST' | 'SELL' | 'ADMIN'>('MARKETPLACE');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('PRODUCT_DETAILS');
  };

  return (
    <QueryClientProvider client={queryClient}>
      {currentView === 'LANDING' && (
        <LandingPage />
      )}

      {currentView === 'MARKETPLACE' && (
        <MarketplacePage
          onSelectProduct={handleSelectProduct}
          onNavigateHome={() => setCurrentView('LANDING')}
          onNavigateSell={() => setCurrentView('SELL')}
        />
      )}

      {currentView === 'PRODUCT_DETAILS' && selectedProductId && (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={() => setCurrentView('MARKETPLACE')}
          onNavigateMarketplace={() => setCurrentView('MARKETPLACE')}
        />
      )}

      {currentView === 'WISHLIST' && (
        <WishlistPage
          onSelectProduct={handleSelectProduct}
          onNavigateMarketplace={() => setCurrentView('MARKETPLACE')}
        />
      )}

      {currentView === 'SELL' && (
        <ListingWizard
          onSuccess={() => setCurrentView('MARKETPLACE')}
          onCancel={() => setCurrentView('MARKETPLACE')}
        />
      )}

      {currentView === 'ADMIN' && (
        <AdminConsole
          onNavigateMarketplace={() => setCurrentView('MARKETPLACE')}
        />
      )}
    </QueryClientProvider>
  );
}
