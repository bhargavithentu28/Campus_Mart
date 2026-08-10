import React, { useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ProductGrid } from '../components/marketplace/ProductGrid';
import { Button } from '../components/ui/Button';
import { AuthModal } from '../features/auth/AuthModal';
import { useWishlist, useToggleWishlist } from '../hooks/useMarketplace';
import { Heart, ArrowLeft } from 'lucide-react';

export interface WishlistPageProps {
  onSelectProduct: (productId: string) => void;
  onNavigateMarketplace: () => void;
}

export function WishlistPage({ onSelectProduct, onNavigateMarketplace }: WishlistPageProps) {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { data: wishlist = [], isLoading, isError, refetch } = useWishlist();
  const toggleWishlistMutation = useToggleWishlist();

  const wishlistIds = wishlist.map((p: any) => p.id);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar
        user={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenCreateListing={() => setIsAuthOpen(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        <div className="flex items-center justify-between glass-panel rounded-2xl p-6 border border-white/10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" /> Saved Wishlist
            </h1>
            <p className="text-xs text-slate-400 mt-1">Bookmarked campus items and seller offers.</p>
          </div>

          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={onNavigateMarketplace}>
            Back to Marketplace
          </Button>
        </div>

        <ProductGrid
          products={wishlist}
          isLoading={isLoading}
          isError={isError}
          onRetry={refetch}
          onProductClick={onSelectProduct}
          onWishlistToggle={(productId) => toggleWishlistMutation.mutate(productId)}
          wishlistIds={wishlistIds}
        />
      </main>

      <Footer />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
}
