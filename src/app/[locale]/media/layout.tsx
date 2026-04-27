'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { HeroBanner } from '@/components/common/HeroBanner';
import { MediaSectionNav } from '@/components/media/MediaSectionNav';

const heroKeys: Record<
  string,
  { titleKey: string; subtitleKey: string; imageSrc?: string }
> = {
  press: {
    titleKey: 'press',
    subtitleKey: 'pressSubtitle',
    imageSrc: '/images/heroes/press-hero.png',
  },
  video: {
    titleKey: 'video',
    subtitleKey: 'videoSubtitle',
    imageSrc: '/images/heroes/video-hero.png',
  },
  blog: {
    titleKey: 'blog',
    subtitleKey: 'blogSubtitle',
    imageSrc: '/images/heroes/blog-hero.png',
  },
  notice: {
    titleKey: 'notice',
    subtitleKey: 'noticeSubtitle',
    imageSrc: '/images/heroes/press-hero.png',
  },
};

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const t = useTranslations('media');
  const segment = pathname.split('/media/')[1]?.split('/')[0] || 'press';
  const hero = heroKeys[segment] || heroKeys.press;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <HeroBanner
        variant={hero.imageSrc ? 'fullscreen' : 'page-title'}
        title={t(hero.titleKey)}
        subtitle={t(hero.subtitleKey)}
        imageSrc={hero.imageSrc}
        className={hero.imageSrc ? '!h-[280px] !max-h-[280px]' : ''}
      />
      <MediaSectionNav />
      {children}
    </>
  );
}
