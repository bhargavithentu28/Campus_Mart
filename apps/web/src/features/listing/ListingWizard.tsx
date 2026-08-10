import React, { useState, useEffect } from 'react';
import { StepPhotos } from './StepPhotos';
import { StepBasicDetails } from './StepBasicDetails';
import { StepTransactionPricing } from './StepTransactionPricing';
import { StepCampusDetails } from './StepCampusDetails';
import { StepReviewPreview } from './StepReviewPreview';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { useCategories } from '../../hooks/useMarketplace';
import { api } from '../../lib/api';
import { ArrowLeft, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export interface ListingWizardProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ListingWizard({ onSuccess, onCancel }: ListingWizardProps) {
  const [step, setStep] = useState(1);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  const { data: categories = [] } = useCategories();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categorySlug: 'books',
    condition: 'LIKE_NEW',
    transactionType: 'SELL',
    price: 0,
    rentalPrice: undefined as number | undefined,
    isNegotiable: true,
    pickupLocation: 'Hostel Block 3 Courtyard',
    pickupTime: 'Weekdays 5 PM - 8 PM',
    images: [] as string[],
    tags: ['campus', 'verified']
  });

  // Restore autosaved draft on initial mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('campusmart_draft_listing');
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.title || parsed.images?.length > 0) {
          setFormData(parsed);
        }
      } catch (err) {
        console.error('Failed to parse saved draft:', err);
      }
    }
  }, []);

  // Autosave draft on form change
  useEffect(() => {
    localStorage.setItem('campusmart_draft_listing', JSON.stringify(formData));
  }, [formData]);

  const handlePublish = async () => {
    setErrorMessage('');
    setIsPublishing(true);

    try {
      const { data } = await api.post('/products', {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        rentalPrice: formData.rentalPrice,
        condition: formData.condition,
        category: formData.categorySlug,
        transactionType: formData.transactionType,
        images: formData.images,
        pickupLocation: formData.pickupLocation,
        pickupTime: formData.pickupTime,
        isNegotiable: formData.isNegotiable,
        tags: formData.tags
      });

      if (data.success) {
        localStorage.removeItem('campusmart_draft_listing');
        onSuccess();
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to publish product listing.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar user={currentUser} onOpenAuth={() => {}} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        
        {/* Progress Header */}
        <div className="flex items-center justify-between glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-slate-100">Create Campus Listing</h1>
              <span className="text-xs text-indigo-400 font-semibold">Step {step} of 5</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-800/50">
            <Save className="w-3.5 h-3.5" /> Draft Autosaved
          </div>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-white/5">
          <div
            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Active Step Content */}
        <div className="glass-panel rounded-2xl p-6 border border-white/10">
          {step === 1 && (
            <StepPhotos
              images={formData.images}
              onChange={(images) => setFormData(prev => ({ ...prev, images }))}
              onNext={() => setStep(2)}
              onBack={onCancel}
            />
          )}

          {step === 2 && (
            <StepBasicDetails
              formData={formData}
              onChange={(updated) => setFormData(updated)}
              categories={categories}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}

          {step === 3 && (
            <StepTransactionPricing
              formData={formData}
              onChange={(updated) => setFormData(updated)}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}

          {step === 4 && (
            <StepCampusDetails
              formData={formData}
              userCollege={currentUser?.college}
              onChange={(updated) => setFormData(updated)}
              onNext={() => setStep(5)}
              onBack={() => setStep(3)}
            />
          )}

          {step === 5 && (
            <StepReviewPreview
              formData={formData}
              currentUser={currentUser}
              onPublish={handlePublish}
              onBack={() => setStep(4)}
              isPublishing={isPublishing}
            />
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
