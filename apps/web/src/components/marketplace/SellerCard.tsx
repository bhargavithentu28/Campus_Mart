import React from 'react';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { ShieldCheck, MessageSquare, Star, GraduationCap } from 'lucide-react';

export interface SellerCardProps {
  seller?: {
    id?: string;
    name?: string;
    avatar?: string;
    isVerified?: boolean;
    badges?: string[];
    createdAt?: string;
    college?: { name?: string; code?: string };
    _count?: { reviewsReceived?: number };
  };
  onContactSeller?: () => void;
}

export function SellerCard({ seller, onContactSeller }: SellerCardProps) {
  if (!seller) return null;

  return (
    <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-4">
      <div className="flex items-center gap-3">
        <Avatar name={seller.name} src={seller.avatar} isVerified={seller.isVerified} size="lg" />
        <div>
          <h4 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
            {seller.name}
            {seller.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
          </h4>
          <p className="text-xs text-slate-400 flex items-center gap-1">
            <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
            {seller.college?.name || 'Verified University Student'}
          </p>
        </div>
      </div>

      {seller.badges && seller.badges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {seller.badges.map((b, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 text-[10px] font-semibold border border-indigo-800/40">
              {b}
            </span>
          ))}
        </div>
      )}

      <Button
        variant="primary"
        className="w-full"
        leftIcon={<MessageSquare className="w-4 h-4" />}
        onClick={onContactSeller}
      >
        Contact Seller
      </Button>
    </div>
  );
}
