import Link from 'next/link';
import { SectionLayout } from '@/components/common/SectionLayout';
import { cn } from '@/lib/utils/cn';

interface GallerySectionProps {
  locale?: string;
}

const GALLERY_ITEMS = [
  { id: 1, label: '로비' },
  { id: 2, label: '상담실' },
  { id: 3, label: '시술실' },
  { id: 4, label: 'VIP룸' },
  { id: 5, label: '리커버리' },
];

function GallerySection({ locale: _locale }: GallerySectionProps) {
  return (
    <SectionLayout
      title="시설 안내"
      subtitle="편안하고 프라이빗한 진료 공간"
      background="ivory"
    >
      <div
        className={cn(
          'flex gap-4 overflow-x-auto pb-4',
          'lg:justify-center lg:overflow-x-visible',
        )}
      >
        {GALLERY_ITEMS.map((item) => (
          <div
            key={item.id}
            className="relative h-[260px] w-[224px] shrink-0 rounded-[12px] bg-neutral-100"
          >
            <span className="absolute inset-x-0 bottom-4 text-center text-[14px] font-medium text-neutral-600">
              {item.label}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/ko/brand#facilities"
          className="text-forever-red text-[15px] font-medium hover:underline"
        >
          시설 전체 보기 →
        </Link>
      </div>
    </SectionLayout>
  );
}

export { GallerySection, type GallerySectionProps };
