import React, { useState } from 'react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Sparkles, Tag, Plus, X, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

export interface StepBasicDetailsProps {
  formData: {
    title: string;
    description: string;
    categorySlug: string;
    condition: string;
    tags: string[];
  };
  onChange: (data: any) => void;
  categories: Array<{ name: string; slug: string }>;
  onNext: () => void;
  onBack: () => void;
}

export function StepBasicDetails({
  formData,
  onChange,
  categories,
  onNext,
  onBack
}: StepBasicDetailsProps) {
  const [isAiGeneratingDesc, setIsAiGeneratingDesc] = useState(false);
  const [isAiSuggestingCat, setIsAiSuggestingCat] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const conditions = [
    { value: 'NEW', label: 'Brand New (Unopened/Unused)' },
    { value: 'LIKE_NEW', label: 'Like New (Mint Condition)' },
    { value: 'GOOD', label: 'Good (Minor Usage Signs)' },
    { value: 'FAIR', label: 'Fair (Visible Usage/Functional)' }
  ];

  const handleGenerateAiDesc = async () => {
    if (!formData.title) return;
    setIsAiGeneratingDesc(true);

    try {
      const { data } = await api.post('/products/ai/generate-desc', {
        title: formData.title,
        category: formData.categorySlug,
        condition: formData.condition,
        specifications: ''
      });

      if (data.description) {
        onChange({ ...formData, description: data.description });
      }
    } catch (err) {
      console.error('AI Description error:', err);
    } finally {
      setIsAiGeneratingDesc(false);
    }
  };

  const handleSuggestCategoryTags = async () => {
    if (!formData.title) return;
    setIsAiSuggestingCat(true);

    try {
      const { data } = await api.post('/products/ai/suggest-category-tags', {
        title: formData.title,
        description: formData.description
      });

      if (data.categorySlug) {
        onChange({
          ...formData,
          categorySlug: data.categorySlug,
          tags: Array.from(new Set([...formData.tags, ...(data.tags || [])]))
        });
      }
    } catch (err) {
      console.error('AI Category Suggestion error:', err);
    } finally {
      setIsAiSuggestingCat(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (!tagInput.trim()) return;

    const formatted = tagInput.trim().toLowerCase();
    if (!formData.tags.includes(formatted)) {
      onChange({ ...formData, tags: [...formData.tags, formatted] });
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onChange({ ...formData, tags: formData.tags.filter(t => t !== tagToRemove) });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-slate-100">Step 2 — Basic Details</h2>
        <p className="text-xs text-slate-400 mt-1">Describe your product and use AI assistance to generate listings faster.</p>
      </div>

      {/* Title Input */}
      <div className="space-y-2">
        <Input
          label="Product Title"
          placeholder="e.g. HK Dass Engineering Math 4th Sem or Hero Sprint Gear Cycle"
          required
          value={formData.title}
          onChange={(e) => onChange({ ...formData, title: e.target.value })}
        />
        {formData.title.length > 3 && (
          <button
            type="button"
            onClick={handleSuggestCategoryTags}
            disabled={isAiSuggestingCat}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            {isAiSuggestingCat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            Auto-suggest Category & Tags with AI
          </button>
        )}
      </div>

      {/* Description Header & Generator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
            Listing Description
          </label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            isLoading={isAiGeneratingDesc}
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
            onClick={handleGenerateAiDesc}
            disabled={!formData.title}
          >
            Generate with AI
          </Button>
        </div>

        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => onChange({ ...formData, description: e.target.value })}
          placeholder="Provide key details, condition notes, included accessories, or reasons for selling..."
          className="w-full glass-input text-xs rounded-xl p-3 placeholder:text-slate-500 focus:outline-none"
        />
      </div>

      {/* Category Dropdown */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Category
        </label>
        <select
          value={formData.categorySlug}
          onChange={(e) => onChange({ ...formData, categorySlug: e.target.value })}
          className="w-full glass-input text-xs rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug} className="bg-slate-900 text-slate-200">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Condition Radio Options */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Product Condition
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {conditions.map((c) => (
            <label
              key={c.value}
              className={`flex items-center gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                formData.condition === c.value
                  ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-200 font-semibold'
                  : 'glass-panel border-white/5 text-slate-300 hover:border-slate-700'
              }`}
            >
              <input
                type="radio"
                name="condition"
                value={c.value}
                checked={formData.condition === c.value}
                onChange={(e) => onChange({ ...formData, condition: e.target.value })}
                className="text-indigo-600 focus:ring-indigo-500"
              />
              <span>{c.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Tags Input */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
          Search Tags
        </label>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Add tag (e.g. textbook, Hostel 3) and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            leftIcon={<Tag className="w-4 h-4" />}
          />
          <Button variant="secondary" size="sm" type="button" onClick={handleAddTag}>
            Add
          </Button>
        </div>

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2">
            {formData.tags.map((t) => (
              <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                #{t}
                <X className="w-3 h-3 cursor-pointer hover:text-white" onClick={() => handleRemoveTag(t)} />
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Step Navigation */}
      <div className="flex justify-between pt-4 border-t border-white/5">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button variant="primary" onClick={onNext} disabled={!formData.title || !formData.description}>
          Continue to Pricing
        </Button>
      </div>
    </div>
  );
}
