import React from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { MapPin, ShieldCheck, Clock } from 'lucide-react';

export interface StepCampusDetailsProps {
  formData: {
    pickupLocation: string;
    pickupTime?: string;
  };
  userCollege?: any;
  onChange: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepCampusDetails({
  formData,
  userCollege,
  onChange,
  onNext,
  onBack
}: StepCampusDetailsProps) {
  const commonSpots = [
    'Hostel Block 3 Courtyard',
    'Main Library Entrance',
    'Central Canteen Lounge',
    'Main Campus Gate Security Desk',
    'Engineering Department Building'
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Step 4 — Campus Meeting Location</h2>
        <p className="text-xs text-slate-400 mt-1">Specify a safe on-campus spot to meet the buyer/renter.</p>
      </div>

      {/* University Preselected Banner */}
      <div className="glass-card rounded-2xl p-4 border border-indigo-500/20 bg-indigo-950/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <div>
            <span className="text-xs font-bold text-slate-100 block">{userCollege?.name || 'COEP Technological University'}</span>
            <span className="text-[10px] text-slate-400">Preselected from your verified student domain</span>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-extrabold border border-emerald-800">
          VERIFIED CAMPUS
        </span>
      </div>

      {/* On-Campus Pickup Spot */}
      <div className="space-y-2">
        <Input
          label="On-Campus Meeting / Pickup Spot"
          placeholder="e.g. Hostel Block 3 Lounge or Main Library Desk"
          required
          value={formData.pickupLocation}
          onChange={(e) => onChange({ ...formData, pickupLocation: e.target.value })}
          leftIcon={<MapPin className="w-4 h-4 text-indigo-400" />}
        />

        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Quick Suggestions:</span>
          <div className="flex flex-wrap gap-1.5">
            {commonSpots.map((spot) => (
              <button
                key={spot}
                type="button"
                onClick={() => onChange({ ...formData, pickupLocation: spot })}
                className="px-2.5 py-1 rounded-lg glass-panel text-[11px] text-slate-300 hover:text-indigo-300 hover:border-indigo-500/40 transition-all"
              >
                {spot}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Preferred Hours */}
      <div className="space-y-2">
        <Input
          label="Preferred Pickup Hours (Optional)"
          placeholder="e.g. Weekdays 5 PM - 8 PM or Weekends any time"
          value={formData.pickupTime || ''}
          onChange={(e) => onChange({ ...formData, pickupTime: e.target.value })}
          leftIcon={<Clock className="w-4 h-4 text-indigo-400" />}
        />
      </div>

      {/* Step Navigation */}
      <div className="flex justify-between pt-4 border-t border-white/5">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button
          variant="primary"
          onClick={onNext}
          disabled={!formData.pickupLocation.trim()}
        >
          Review & Preview Listing
        </Button>
      </div>
    </div>
  );
}
