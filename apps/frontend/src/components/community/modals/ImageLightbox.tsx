import React, { useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export type ImageLightboxProps = {
  isOpen: boolean;
  images: string[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
};

export default function ImageLightbox({ isOpen, images, index, onIndexChange, onClose }: Readonly<ImageLightboxProps>) {
  const total = images.length;

  const prev = useCallback(() => {
    if (total === 0) return;
    onIndexChange((index - 1 + total) % total);
  }, [index, total, onIndexChange]);

  const next = useCallback(() => {
    if (total === 0) return;
    onIndexChange((index + 1) % total);
  }, [index, total, onIndexChange]);

  useEffect(() => {
    if (!isOpen) return;
    
    // Prevent body scroll when lightbox is open
    document.body.style.overflow = 'hidden';
    
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose, prev, next]);

  if (!isOpen || total === 0) return null;

  const lightboxContent = (
    <div className="fixed inset-0 bg-black/80" style={{ zIndex: 999999 }}>
      <button aria-label="Close gallery" className="absolute inset-0" onClick={onClose} />

      <div className="relative z-10 h-full w-full flex items-center justify-center p-4">
        {total > 1 && (
          <button 
            aria-label="Previous image" 
            onClick={prev} 
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-20 backdrop-blur-sm"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <figure className="max-w-[90vw] max-h-[85vh] flex flex-col items-center z-10">
          <img
            src={images[index]}
            alt={`Gallery item ${index + 1} of ${total}`}
            className="object-contain max-h-[80vh] max-w-[90vw] select-none"
            loading="eager"
            decoding="async"
            draggable={false}
          />
          {total > 1 && (
            <figcaption className="mt-3 text-white/90 text-sm bg-black/30 px-3 py-1 rounded-full backdrop-blur-sm">
              {index + 1} / {total}
            </figcaption>
          )}
        </figure>

        {total > 1 && (
          <button 
            aria-label="Next image" 
            onClick={next} 
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-20 backdrop-blur-sm"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}

        <button 
          aria-label="Close" 
          onClick={onClose} 
          className="absolute top-4 right-4 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors z-20 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  // Use portal to render at document body level
  return typeof window !== 'undefined' ? createPortal(lightboxContent, document.body) : null;
}
