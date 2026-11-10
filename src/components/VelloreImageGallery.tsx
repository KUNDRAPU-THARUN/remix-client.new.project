import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Image as ImageIcon,
} from 'lucide-react';

interface VelloreImageGalleryProps {
  images: string[];
  title: string;
  className?: string;
  imageClassName?: string;
  aspectRatioClass?: string;
  showThumbnails?: boolean;
  altPrefix?: string;
}

export const VelloreImageGallery: React.FC<VelloreImageGalleryProps> = ({
  images,
  title,
  className = '',
  imageClassName = 'w-full h-full object-cover',
  aspectRatioClass = 'h-64 sm:h-80 md:h-96',
  showThumbnails = true,
  altPrefix = 'Photo',
}) => {
  const safeImages = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Touch gesture tracking
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const minSwipeDistance = 40; // minimum px for a valid swipe

  const total = safeImages.length;
  const hasMultiple = total > 1;

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const deltaX = touchEndX - touchStartX.current;
    const deltaY = touchEndY - touchStartY.current;

    // Only trigger if horizontal swipe is clearly dominant over vertical scroll
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX < 0) {
        handleNext(); // swipe left -> next photo
      } else {
        handlePrev(); // swipe right -> prev photo
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          handleNext();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          handlePrev();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsLightboxOpen(false);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, handleNext, handlePrev]);

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Gallery Container */}
      <div
        className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md select-none ${aspectRatioClass}`}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        tabIndex={0}
        role="region"
        aria-label={`${title} photo gallery`}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            handleNext();
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            handlePrev();
          }
        }}
      >
        <img
          src={safeImages[currentIndex]}
          alt={`${altPrefix} ${currentIndex + 1} of ${total} - ${title}`}
          className={imageClassName}
          loading="lazy"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />

        {/* Counter Pill */}
        <div className="absolute bottom-3 right-3 bg-black/65 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full border border-white/20 shadow-sm flex items-center gap-1.5 select-none">
          <ImageIcon className="w-3.5 h-3.5 text-white/80" />
          <span>
            {currentIndex + 1} / {total}
          </span>
        </div>

        {/* Fullscreen Expand Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute top-3 right-3 p-2 bg-black/50 hover:bg-black/80 text-white rounded-xl backdrop-blur-md transition cursor-pointer border border-white/20"
          title="Open Fullscreen Lightbox"
          aria-label="Open Fullscreen Lightbox"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Previous Button Overlay */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 shadow-md transition active:scale-95 cursor-pointer"
            aria-label="Previous photo"
            title="Previous photo"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Next Button Overlay */}
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/45 hover:bg-black/75 text-white backdrop-blur-md border border-white/20 shadow-md transition active:scale-95 cursor-pointer"
            aria-label="Next photo"
            title="Next photo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Thumbnails Strip */}
      {showThumbnails && hasMultiple && (
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-0.5 no-scrollbar">
          {safeImages.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-16 w-20 sm:h-20 sm:w-24 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                currentIndex === idx
                  ? 'border-red-600 ring-2 ring-red-400/50 scale-95 shadow-md'
                  : 'border-slate-200 opacity-60 hover:opacity-100'
              }`}
              aria-label={`View photo ${idx + 1} of ${total}`}
              aria-current={currentIndex === idx ? 'true' : undefined}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Modal / Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col justify-between p-4 sm:p-6 backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label={`${title} Fullscreen Gallery`}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Lightbox Header */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-200">
                {title}
              </span>
              <span className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded-full">
                {currentIndex + 1} / {total}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition cursor-pointer"
              title="Close Fullscreen (Esc)"
              aria-label="Close Fullscreen"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lightbox Image Container */}
          <div className="relative flex-1 flex items-center justify-center p-2 sm:p-6 min-h-0">
            <img
              src={safeImages[currentIndex]}
              alt={`${altPrefix} ${currentIndex + 1} of ${total} - ${title}`}
              className="max-h-full max-w-full object-contain rounded-xl shadow-2xl select-none"
            />

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
                  aria-label="Previous photo (Arrow Left)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md border border-white/20 transition cursor-pointer"
                  aria-label="Next photo (Arrow Right)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Footer with Thumbnails */}
          {hasMultiple && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto pt-3 border-t border-white/10 max-w-2xl mx-auto w-full">
              {safeImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-12 w-16 sm:h-14 sm:w-20 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                    currentIndex === idx
                      ? 'border-white scale-105 ring-2 ring-red-500'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                  aria-label={`Thumbnail ${idx + 1}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
