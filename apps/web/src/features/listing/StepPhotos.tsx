import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Upload, X, Star, ArrowLeft, ArrowRight, Image as ImageIcon, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

export interface StepPhotosProps {
  images: string[];
  onChange: (images: string[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPhotos({ images, onChange, onNext, onBack }: StepPhotosProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);

    const newImageUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;

      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });

        const base64Data = await base64Promise;

        // Call backend upload endpoint
        const { data } = await api.post('/upload/image', {
          imageBase64: base64Data,
          filename: file.name
        });

        if (data.url) {
          newImageUrls.push(data.url);
        }
      } catch (err) {
        console.error('Image upload failed:', err);
      }
    }

    if (newImageUrls.length > 0) {
      onChange([...images, ...newImageUrls]);
    }

    setIsUploading(false);
  };

  const handleMakePrimary = (index: number) => {
    const updated = [...images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleMove = (index: number, direction: 'LEFT' | 'RIGHT') => {
    const newIdx = direction === 'LEFT' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Step 1 — Product Photos</h2>
        <p className="text-xs text-slate-400 mt-1">Upload clear photos of your item. Listings with multiple photos sell 3x faster.</p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFileUpload(e.dataTransfer.files); }}
        className={`glass-panel border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
          dragActive ? 'border-indigo-500 bg-indigo-950/20' : 'border-white/10 hover:border-slate-600'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          id="photo-upload-input"
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />
        <label htmlFor="photo-upload-input" className="cursor-pointer space-y-3 block">
          {isUploading ? (
            <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mx-auto" />
          ) : (
            <Upload className="w-10 h-10 text-indigo-400 mx-auto" />
          )}
          <div>
            <span className="text-sm font-bold text-slate-200 block">Click or drag photos to upload</span>
            <span className="text-xs text-slate-400">PNG, JPG, WEBP up to 10MB each</span>
          </div>
        </label>
      </div>

      {/* Photo Gallery Grid */}
      {images.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Uploaded Photos ({images.length})
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((url, idx) => (
              <div key={idx} className="relative group rounded-xl overflow-hidden glass-card border border-white/10 h-36">
                <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />

                {idx === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold shadow-md">
                    PRIMARY
                  </span>
                )}

                <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleMakePrimary(idx)}
                      className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                      title="Set as Primary"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'LEFT')}
                      className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 'RIGHT')}
                      className="p-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500"
                    title="Delete Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
        <Button variant="primary" onClick={onNext} disabled={images.length === 0 || isUploading}>
          Continue to Details
        </Button>
      </div>
    </div>
  );
}
