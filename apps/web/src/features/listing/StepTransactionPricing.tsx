import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Sparkles, TrendingUp, DollarSign, CheckCircle2, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

export interface StepTransactionPricingProps {
  formData: {
    title: string;
    categorySlug: string;
    condition: string;
    transactionType: string;
    price: number;
    rentalPrice?: number;
    isNegotiable: boolean;
  };
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepTransactionPricing({
  formData,
  onChange,
  onNext,
  onBack
}: StepTransactionPricingProps) {
  const [isAiPredictingPrice, setIsAiPredictingPrice] = useState(false);
  const [aiPricingData, setAiPricingData] = useState<any>(null);

  const transactionModes = [
    { value: 'SELL', label: 'Sell Direct', desc: 'Outright sale to another student' },
    { value: 'RENT', label: 'Rent Semester', desc: 'Monthly or semester equipment rental' },
    { value: 'BORROW', label: 'Short Borrow', desc: 'Free or low-cost short borrowing' },
    { value: 'EXCHANGE', label: 'Barter Exchange', desc: 'Swap for another textbook or kit' },
    { value: 'DONATE', label: 'Free Giveaway', desc: 'Donate to junior students for free' }
  ];

  const handlePredictPrice = async () => {
    if (!formData.title || formData.price <= 0) return;
    setIsAiPredictingPrice(true);

    try {
      const { data } = await api.post('/products/ai/predict-price', {
        title: formData.title,
        category: formData.categorySlug,
        condition: formData.condition,
        price: formData.price
      });

      if (data.recommendedPrice) {
        setAiPricingData(data);
      }
    } catch (err) {
      console.error('AI Price Prediction error:', err);
    } finally {
      setIsAiPredictingPrice(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Step 3 — Transaction & Pricing</h2>
        <p className="text-xs text-slate-400 mt-1">Select your transaction mode and set a fair price using AI insights.</p>
      </div>

      {/* Transaction Modes Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Transaction Mode
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {transactionModes.map((m) => (
            <div
              key={m.value}
              onClick={() => onChange({ ...formData, transactionType: m.value })}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                formData.transactionType === m.value
                  ? 'bg-indigo-950/60 border-indigo-500/60 text-indigo-200 shadow-md shadow-indigo-600/10'
                  : 'glass-panel border-white/5 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-xs flex items-center justify-between">
                <span>{m.label}</span>
                {formData.transactionType === m.value && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Price Inputs */}
      {formData.transactionType !== 'DONATE' && (
        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Selling Price (₹)"
              type="number"
              min={0}
              placeholder="e.g. 1200"
              required
              value={formData.price || ''}
              onChange={(e) => onChange({ ...formData, price: e.target.value ? parseFloat(e.target.value) : 0 })}
            />

            {formData.transactionType === 'RENT' && (
              <Input
                label="Monthly Rental Rate (₹)"
                type="number"
                min={0}
                placeholder="e.g. 200"
                value={formData.rentalPrice || ''}
                onChange={(e) => onChange({ ...formData, rentalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isNegotiable}
                onChange={(e) => onChange({ ...formData, isNegotiable: e.target.checked })}
                className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Price is negotiable for fast pickup</span>
            </label>

            {formData.price > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                isLoading={isAiPredictingPrice}
                leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                onClick={handlePredictPrice}
              >
                AI Price Analysis
              </Button>
            )}
          </div>
        </div>
      )}

      {/* AI Pricing Card */}
      {aiPricingData && (
        <div className="glass-card rounded-2xl p-5 border border-indigo-500/30 bg-indigo-950/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-400" /> AI Pricing Analysis
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              Optimal Market Fair Deal
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center py-2 border-y border-white/5">
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Recommended</span>
              <p className="text-base font-extrabold text-emerald-400">₹{aiPricingData.recommendedPrice}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Quick 24h Sale</span>
              <p className="text-base font-extrabold text-amber-400">₹{aiPricingData.quickSalePrice}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase">Retail Value</span>
              <p className="text-base font-extrabold text-slate-400 line-through">₹{aiPricingData.marketPrice}</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{aiPricingData.explanation}</p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => onChange({ ...formData, price: aiPricingData.recommendedPrice })}
          >
            Apply Recommended Price (₹{aiPricingData.recommendedPrice})
          </Button>
        </div>
      )}

      {/* Step Navigation */}
      <div className="flex justify-between pt-4 border-t border-white/5">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={formData.transactionType !== 'DONATE' && formData.price <= 0}
        >
          Continue to Campus Location
        </Button>
      </div>
    </div>
  );
}
