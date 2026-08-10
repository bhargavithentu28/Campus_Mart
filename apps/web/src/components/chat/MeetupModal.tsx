import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';

export interface MeetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitMeetup: (location: string, time: string) => void;
}

export function MeetupModal({ isOpen, onClose, onSubmitMeetup }: MeetupModalProps) {
  const [location, setLocation] = useState('Hostel Block 3 Lounge');
  const [time, setTime] = useState('Today at 6:00 PM');

  const commonSpots = [
    'Hostel Block 3 Lounge',
    'Main Library Entrance',
    'Central Canteen Lounge',
    'Main Gate Security Desk'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location.trim() || !time.trim()) return;
    onSubmitMeetup(location, time);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Propose Campus Meetup"
      description="Select a safe on-campus spot to meet and exchange the item."
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div className="glass-card rounded-xl p-3.5 border border-indigo-500/20 bg-indigo-950/20 flex items-center gap-2 text-xs text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Always meet in well-lit public campus locations (Library, Hostels, Canteen).</span>
        </div>

        <div className="space-y-2">
          <Input
            label="Pickup Location"
            required
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4 text-indigo-400" />}
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
            {commonSpots.map((spot) => (
              <button
                key={spot}
                type="button"
                onClick={() => setLocation(spot)}
                className="px-2.5 py-1 rounded-lg glass-panel text-[10px] text-slate-300 hover:text-indigo-300"
              >
                {spot}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Meeting Date & Time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          leftIcon={<Clock className="w-4 h-4 text-indigo-400" />}
        />

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
            Cancel
          </Button>
          <Button type="submit" variant="primary" className="w-2/3">
            Propose Meetup
          </Button>
        </div>
      </form>
    </Modal>
  );
}
