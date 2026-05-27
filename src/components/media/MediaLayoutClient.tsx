'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { HeroBanner } from '@/components/common/HeroBanner';
import { MediaSectionNav } from '@/components/media/MediaSectionNav';
import type { SectionVisibility } from '@/lib/data/visibility';

const fallbackKeys: Record<string, { titleKey: string; subtitleKey: string }> =
  {
    press: { titleKey: 'press', subtitleKey: 'pressSubtitle' },
    video: { titleKey: 'video', subtitleKey: 'videoSubtitle' },
    blog: { titleKey: 'blog', subtitleKey: 'blogSubtitle' },
    notice: { titleKey: 'notice', subtitleKey: 'noticeSubtitle' },
  };

interface MediaLayoutClientProps {
  heroData: Record<
    string,
    { title?: string; subtitle?: string; imageSrc?: string }
  >;
  mediaVisibility: SectionVisibility['media'];
  mediaOrder?: string[] | null;
  children: React.ReactNode;
}

export function MediaLayoutClient({
  heroData,
  mediaVisibility,
  mediaOrder,
  children,
}: MediaLayoutClientProps) {
  const pathname = usePathname();
  const t = useTranslations('media');
  const segment = pathname.split('/media/')[1]?.split('/')[0] || 'press';
  const hero = heroData[segment] || heroData.press;
  const keys = fallbackKeys[segment] || fallbackKeys.press;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <HeroBanner
        variant={hero?.imageSrc ? 'fullscreen' : 'page-title'}
        title={hero?.title || t(keys.titleKey)}
        subtitle={hero?.subtitle || t(keys.subtitleKey)}
        imageSrc={hero?.imageSrc}
        className={hero?.imageSrc ? '!h-[280px] !max-h-[280px]' : ''}
      />
      <MediaSectionNav
        mediaVisibility={mediaVisibility}
        mediaOrder={mediaOrder}
      />
      {children}
    </>
  );
}
