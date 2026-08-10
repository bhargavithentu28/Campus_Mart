import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { DollarSign, Tag, TrendingUp, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  productTitle: string;
  originalPrice: number;
  onSubmitOffer: (amount: number, message?: string) => void;
}

export function OfferModal({
  isOpen,
  onClose,
  productTitle,
  originalPrice,
  onSubmitOffer
}: OfferModalProps) {
  const [offerAmount, setOfferAmount] = useState(Math.round(originalPrice * 0.9));
  const [note, setNote] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (offerAmount <= 0) return;
    onSubmitOffer(offerAmount, note);
    onClose();
  };

  const discountPercent = Math.round(((originalPrice - offerAmount) / originalPrice) * 100);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Make a Price Offer"
      description={`Submit a price offer to the seller for "${productTitle}".`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="glass-card rounded-xl p-4 border border-white/5 flex items-center justify-between text-xs">
          <span className="text-slate-400">Listed Price:</span>
          <span className="text-base font-extrabold text-slate-100">₹{originalPrice.toLocaleString('en-IN')}</span>
        </div>

        <div className="space-y-2">
          <Input
            label="Your Offer Amount (₹)"
            type="number"
            min={1}
            required
            value={offerAmount || ''}
            onChange={(e) => setOfferAmount(parseFloat(e.target.value) || 0)}
            leftIcon={<DollarSign className="w-4 h-4 text-emerald-400" />}
          />

          {discountPercent > 0 && (
            <div className="flex items-center justify-between text-[11px] text-emerald-400 font-semibold px-1">
              <span>{discountPercent}% below asking price</span>
              <span>Savings: ₹{(originalPrice - offerAmount).toLocaleString('en-IN')}</span>
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Note for Seller (Optional)
          </label>
          <textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Can collect today evening at Hostel Block 3..."
            className="w-full glass-input text-xs rounded-xl p-3 placeholder:text-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="w-2/3">
            Send Offer (₹{offerAmount})
          </Button>
        </div>
      </form>
    </Modal>
  );
}
