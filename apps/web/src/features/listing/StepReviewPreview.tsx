import React from 'react';
import { ProductCard } from '../../components/marketplace/ProductCard';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, ShieldCheck, Rocket } from 'lucide-react';
import { TransactionType, ProductCondition } from '@campusmart/shared-types';

export interface StepReviewPreviewProps {
  formData: {
    title: string;
    description: string;
    categorySlug: string;
    condition: string;
    transactionType: string;
    price: number;
    rentalPrice?: number;
    isNegotiable: boolean;
    pickupLocation: string;
    pickupTime?: string;
    images: string[];
    tags: string[];
  };
  currentUser?: any;
  onPublish: () => void;
  onBack: () => void;
  isPublishing?: boolean;
}

export function StepReviewPreview({
  formData,
  currentUser,
  onPublish,
  onBack,
  isPublishing = false
}: StepReviewPreviewProps) {
  const previewProduct = {
    id: 'preview_temp_id',
    title: formData.title || 'Untitled Listing',
    description: formData.description || 'No description provided.',
    price: formData.price || 0,
    rentalPrice: formData.rentalPrice,
    condition: formData.condition as ProductCondition,
    transactionType: formData.transactionType as TransactionType,
    isNegotiable: formData.isNegotiable,
    pickupLocation: formData.pickupLocation || 'Main Campus',
    images: formData.images.map((url, idx) => ({ url, isPrimary: idx === 0 })),
    seller: {
      name: currentUser?.name || 'Verified Student',
      avatar: currentUser?.avatar,
      isVerified: true
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Step 5 — Preview & Publish</h2>
        <p className="text-xs text-slate-400 mt-1">Verify your listing card exactly as it will appear in the campus marketplace.</p>
      </div>

      {/* Product Card Preview Box */}
      <div className="max-w-xs mx-auto">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 text-center mb-3">
          Marketplace Card Preview
        </label>
        <ProductCard product={previewProduct} />
      </div>

      {/* Details Summary Table */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 space-y-3 text-xs">
        <h4 className="font-bold text-slate-200 uppercase tracking-wider border-b border-white/5 pb-2">Listing Summary</h4>
        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div><span className="text-slate-400">Category:</span> {formData.categorySlug}</div>
          <div><span className="text-slate-400">Mode:</span> {formData.transactionType}</div>
          <div><span className="text-slate-400">Condition:</span> {formData.condition}</div>
          <div><span className="text-slate-400">Pickup Spot:</span> {formData.pickupLocation}</div>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex justify-between pt-4 border-t border-white/5">
        <Button variant="outline" onClick={onBack} disabled={isPublishing}>Back</Button>
        <Button
          variant="primary"
          size="lg"
          isLoading={isPublishing}
          leftIcon={<Rocket className="w-4 h-4" />}
          onClick={onPublish}
        >
          Publish Listing Now
        </Button>
      </div>
    </div>
  );
}
