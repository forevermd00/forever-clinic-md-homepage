'use client';

import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { cn } from '@/lib/utils/cn';

interface GalleryItem {
  id: string;
  name?: string;
  image?: { src: string; alt: string };
}

interface GalleryCarouselProps {
  items: GalleryItem[];
  className?: string;
}

export function GalleryCarousel({ items, className }: GalleryCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'center',
    slidesToScroll: 1,
    containScroll: false,
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const handleSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    handleSelect();
    emblaApi.on('select', handleSelect);
    return () => {
      emblaApi.off('select', handleSelect);
    };
  }, [emblaApi]);

  function getRelativePos(index: number): number {
    const len = items.length;
    let diff = index - selectedIndex;
    if (diff > len / 2) diff -= len;
    if (diff < -len / 2) diff += len;
    return diff;
  }

  function renderSlide(item: GalleryItem) {
    return item.image ? (
      <img
        src={item.image.src}
        alt={item.image.alt}
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#efe5d9] via-[#e8ddd0] to-[#d4c7bd]">
        {item.name && (
          <span className="text-[14px] font-medium text-[#b3a89c]">
            {item.name}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex" style={{ marginLeft: '-5%', marginRight: '-5%' }}>
          {items.map((item, index) => {
            const rel = getRelativePos(index);
            const isCenter = rel === 0;
            const isAdj = Math.abs(rel) === 1;

            // Coverflow: center big, adjacent overlap behind, rest hidden
            const scale = isCenter ? 1 : isAdj ? 0.8 : 0.7;
            const opacity = isCenter ? 1 : isAdj ? 0.55 : 0;
            const zIndex = isCenter ? 10 : isAdj ? 5 : 1;
            const translateX = isCenter ? 0 : rel < 0 ? 15 : -15;

            return (
              <div
                key={item.id}
                className="min-w-0 shrink-0 grow-0 basis-[70%] sm:basis-[55%] lg:basis-[45%]"
                style={{ zIndex }}
              >
                <button
                  type="button"
                  onClick={() => emblaApi?.scrollTo(index)}
                  data-ga-id={`gallery-slide-${item.id}`}
                  className="block w-full overflow-hidden rounded-[12px]"
                  style={{
                    height: '360px',
                    transform: `scale(${scale}) translateX(${translateX}%)`,
                    opacity,
                    boxShadow: isCenter
                      ? '0 8px 32px rgba(0,0,0,0.16)'
                      : 'none',
                    transition:
                      'transform 0.5s ease, opacity 0.5s ease, box-shadow 0.5s ease',
                    cursor: isCenter ? 'default' : 'pointer',
                    pointerEvents: opacity === 0 ? 'none' : 'auto',
                  }}
                >
                  {renderSlide(item)}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indicators */}
      <div className="mt-6 flex items-center justify-center gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            data-ga-id={`gallery-indicator-${index}`}
            className={cn(
              'h-2 rounded-full transition-all duration-300',
              index === selectedIndex ? 'w-6 bg-[#2b2b2b]' : 'w-2 bg-[#d4c8bd]',
            )}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
