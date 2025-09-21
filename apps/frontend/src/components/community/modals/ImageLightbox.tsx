import React, { useEffect, useCallback } from 'react';
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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, prev, next]);

  if (!isOpen || total === 0) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button aria-label="Close gallery" className="absolute inset-0 bg-black/80" onClick={onClose} />

      <div className="relative z-[71] h-full w-full flex items-center justify-center p-4">
        <button aria-label="Previous image" onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>

        <figure className="max-w-[90vw] max-h-[85vh] flex flex-col items-center">
          <img
            src={images[index]}
            alt={`Gallery item ${index + 1} of ${total}`}
            className="object-contain max-h-[80vh] max-w-[90vw]"
            loading="eager"
            decoding="async"
          />
          <figcaption className="mt-3 text-white/90 text-sm">{index + 1} / {total}</figcaption>
        </figure>

        <button aria-label="Next image" onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
          <ChevronRight className="w-6 h-6" />
        </button>

        <button aria-label="Close" onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
