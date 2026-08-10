import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Mail, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../lib/api';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any, token: string) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [collegeInfo, setCollegeInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [devCode, setDevCode] = useState('');

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/auth/send-otp', { email });
      if (data.success) {
        setCollegeInfo(data.college);
        if (data.devCode) {
          setDevCode(data.devCode);
        }
        setStep('OTP');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to verify university email domain.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const { data } = await api.post('/verify-otp', {
        email,
        code: otp,
        name: name || undefined
      });

      if (data.success) {
        if (data.accessToken) {
          localStorage.setItem('campusmart_access_token', data.accessToken);
        }
        onSuccess(data.user, data.accessToken);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Invalid or expired OTP code.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="md"
      title="Verified Student Access"
      description="Connect using your official university email address (.edu / .ac.in)."
    >
      <div className="space-y-4 pt-2">
        
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {step === 'EMAIL' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <Input
              label="University Email Address"
              placeholder="e.g. student@coep.ac.in or alex@mit.edu"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              helperText="Only verified campus email domains are permitted."
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Send Verification Code
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            {collegeInfo && (
              <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-between text-xs text-indigo-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  {collegeInfo.name} ({collegeInfo.code})
                </span>
                <span className="text-[10px] text-slate-400">{email}</span>
              </div>
            )}

            {devCode && (
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-[11px] text-emerald-300 font-mono text-center">
                Dev Simulation OTP Code: <strong>{devCode}</strong>
              </div>
            )}

            <Input
              label="Your Full Name (Optional)"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <Input
              label="6-Digit OTP Code"
              placeholder="Enter 6-digit code"
              type="text"
              required
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('EMAIL')}
                className="w-1/3"
              >
                Back
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="w-2/3"
                isLoading={isLoading}
              >
                Verify & Login
              </Button>
            </div>
          </form>
        )}

      </div>
    </Modal>
  );
}
