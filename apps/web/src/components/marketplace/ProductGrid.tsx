import React from 'react';
import { ProductCard } from './ProductCard';
import { ProductCardSkeleton } from '../ui/Skeleton';
import { Button } from '../ui/Button';
import { PackageSearch, AlertCircle, RefreshCw } from 'lucide-react';

export interface ProductGridProps {
  products?: any[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  onProductClick: (productId: string) => void;
  onWishlistToggle?: (productId: string) => void;
  wishlistIds?: string[];
}

export function ProductGrid({
  products,
  isLoading,
  isError,
  onRetry,
  onProductClick,
  onWishlistToggle,
  wishlistIds = []
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-rose-500/20 max-w-md mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-950/60 text-rose-400 flex items-center justify-center mx-auto border border-rose-800/40">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Failed to load marketplace listings</h3>
        <p className="text-xs text-slate-400">Please check your network connection or verify that the API server is online.</p>
        {onRetry && (
          <Button variant="outline" size="sm" leftIcon={<RefreshCw className="w-4 h-4" />} onClick={onRetry}>
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center border border-white/5 max-w-md mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-full bg-indigo-950/60 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-800/40">
          <PackageSearch className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-100">No campus listings found</h3>
        <p className="text-xs text-slate-400">Try adjusting your category, price range, or transaction filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          isWishlisted={wishlistIds.includes(product.id)}
          onClick={onProductClick}
          onWishlistToggle={onWishlistToggle}
        />
      ))}
    </div>
  );
}
