import React, { useState } from 'react';
import { cn } from '../../lib/utils';
import { Maximize2 } from 'lucide-react';
import { Modal } from '../ui/Modal';

export interface ProductGalleryProps {
  images?: Array<{ url: string; isPrimary?: boolean }>;
  title: string;
}

export function ProductGallery({ images = [], title }: ProductGalleryProps) {
  const defaultImage =
    images.length > 0
      ? images[0].url
      : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

  const [selectedImage, setSelectedImage] = useState(defaultImage);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const galleryList = images.length > 0 ? images.map(i => i.url) : [defaultImage];

  return (
    <div className="space-y-4">
      {/* Primary Image View */}
      <div className="relative w-full h-[380px] sm:h-[450px] rounded-2xl overflow-hidden glass-panel border border-white/10 group bg-slate-900">
        <img
          src={selectedImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        <button
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-3 right-3 p-2 rounded-xl glass-panel text-slate-300 hover:text-white transition-colors"
          title="Fullscreen preview"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Thumbnail Strip */}
      {galleryList.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {galleryList.map((url, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedImage(url)}
              className={cn(
                'w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all',
                selectedImage === url
                  ? 'border-indigo-500 scale-95 shadow-md shadow-indigo-500/20'
                  : 'border-white/10 opacity-70 hover:opacity-100'
              )}
            >
              <img src={url} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      <Modal isOpen={isLightboxOpen} onClose={() => setIsLightboxOpen(false)} maxWidth="2xl">
        <div className="p-2 flex items-center justify-center">
          <img src={selectedImage} alt={title} className="max-h-[80vh] w-auto object-contain rounded-xl" />
        </div>
      </Modal>
    </div>
  );
}
