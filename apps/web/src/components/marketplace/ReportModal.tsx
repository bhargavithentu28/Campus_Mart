import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Flag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useReportListing } from '../../hooks/useMarketplace';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productTitle: string;
}

export function ReportModal({ isOpen, onClose, productId, productTitle }: ReportModalProps) {
  const [reason, setReason] = useState('SCAM');
  const [description, setDescription] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const reportMutation = useReportListing();

  const reportReasons = [
    { value: 'SCAM', label: 'Suspicious Scam / Phishing Price' },
    { value: 'SPAM', label: 'Spam or Duplicate Listing' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate Content or Policy Violation' },
    { value: 'COUNTERFEIT', label: 'Fake / Counterfeit Product' },
    { value: 'MISLEADING', label: 'Misleading Description or Photos' },
    { value: 'OTHER', label: 'Other Safety Concern' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const fullReason = `${reason}: ${description}`.trim();

    reportMutation.mutate(
      { productId, reason: fullReason },
      {
        onSuccess: () => {
          setIsSuccess(true);
          setTimeout(() => {
            setIsSuccess(false);
            onClose();
          }, 1800);
        },
        onError: (err: any) => {
          setErrorMessage(err.response?.data?.message || 'Failed to submit moderation report.');
        }
      }
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Report Listing"
      description={`Submit a safety report for "${productTitle}". Reports are reviewed by campus moderators.`}
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-100">Report Submitted</h3>
          <p className="text-xs text-slate-400">Thank you for keeping CampusMart safe. Our moderators will review this listing.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Reason for Report
            </label>
            <div className="space-y-1.5">
              {reportReasons.map((r) => (
                <label
                  key={r.value}
                  className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    reason === r.value
                      ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200'
                      : 'glass-panel border-white/5 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={(e) => setReason(e.target.value)}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>{r.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Additional Details (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any extra details for moderators..."
              rows={3}
              className="w-full glass-input text-xs rounded-xl p-3 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="w-1/3">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              className="w-2/3"
              isLoading={reportMutation.isPending}
              leftIcon={<Flag className="w-4 h-4" />}
            >
              Submit Report
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
