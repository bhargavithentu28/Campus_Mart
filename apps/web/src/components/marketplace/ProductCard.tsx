import React, { useState } from 'react';
import { Badge } from '../ui/Badge';
import { Avatar } from '../ui/Avatar';
import { Heart, ShieldAlert } from 'lucide-react';
import { cn } from '../../lib/utils';
import { TransactionType, ProductCondition } from '@campusmart/shared-types';

export interface ProductCardProps {
  product: {
    id: string;
    title: string;
    description: string;
    price: number;
    rentalPrice?: number;
    condition: ProductCondition;
    transactionType: TransactionType;
    isNegotiable?: boolean;
    pickupLocation: string;
    viewsCount?: number;
    images?: Array<{ url: string; isPrimary: boolean }>;
    seller?: { name: string; avatar?: string; isVerified?: boolean };
    category?: { name: string; icon?: string };
    aiAnalysis?: { scamScore?: number; isFlagged?: boolean };
  };
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
  onClick?: (productId: string) => void;
}

export function ProductCard({
  product,
  onWishlistToggle,
  isWishlisted = false,
  onClick
}: ProductCardProps) {
  const [liked, setLiked] = useState(isWishlisted);

  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLiked(!liked);
    if (onWishlistToggle) onWishlistToggle(product.id);
  };

  const formattedPrice =
    product.transactionType === 'DONATE'
      ? 'FREE'
      : `₹${product.price.toLocaleString('en-IN')}`;

  return (
    <div
      onClick={() => onClick && onClick(product.id)}
      className="glass-card rounded-2xl p-4 border border-white/5 cursor-pointer group flex flex-col justify-between"
    >
      <div>
        {/* Image Container */}
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-900 mb-3">
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            <Badge transactionType={product.transactionType} />
            <Badge condition={product.condition} size="sm" />
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleLikeClick}
            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-rose-400 transition-colors z-10"
          >
            <Heart className={cn('w-4 h-4', liked && 'fill-rose-500 text-rose-500')} />
          </button>

          {/* AI Scam Warning Badge if flagged */}
          {product.aiAnalysis?.isFlagged && (
            <div className="absolute bottom-2 left-2 right-2 px-2 py-1 rounded-lg bg-amber-950/90 border border-amber-800/80 text-[10px] text-amber-300 font-semibold flex items-center gap-1 backdrop-blur-sm">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Under Safety Moderation</span>
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {product.title}
          </h4>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-base font-extrabold text-slate-100 tracking-tight">
            {formattedPrice}
            {product.rentalPrice && product.transactionType === 'RENT' && (
              <span className="text-[10px] text-slate-400 font-normal"> / mo</span>
            )}
          </span>
          {product.isNegotiable && (
            <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">Negotiable</span>
          )}
        </div>

        {product.seller && (
          <div className="flex items-center gap-2">
            <Avatar name={product.seller.name} src={product.seller.avatar} isVerified={product.seller.isVerified} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}
