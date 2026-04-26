'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { HeroBanner } from '@/components/common/HeroBanner';
import { MediaSectionNav } from '@/components/media/MediaSectionNav';

const heroContent: Record<
  string,
  { title: string; subtitle: string; imageSrc?: string }
> = {
  press: {
    title: '보도자료',
    subtitle: '포에버 클리닉의 최신 소식을 전합니다',
    imageSrc: '/images/heroes/press-hero.png',
  },
  video: {
    title: '영상 콘텐츠',
    subtitle: '시술 과정과 후기 영상을 확인해보세요',
    imageSrc: '/images/heroes/video-hero.png',
  },
  blog: {
    title: '블로그',
    subtitle: '피부 관리 팁과 시술 정보를 공유합니다',
    imageSrc: '/images/heroes/blog-hero.png',
  },
  notice: {
    title: '공지사항',
    subtitle: '포에버 클리닉의 공지사항을 확인해주세요',
    imageSrc: '/images/heroes/press-hero.png',
  },
};

export default function MediaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segment = pathname.split('/media/')[1]?.split('/')[0] || 'press';
  const hero = heroContent[segment] || heroContent.press;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <HeroBanner
        variant={hero.imageSrc ? 'fullscreen' : 'page-title'}
        title={hero.title}
        subtitle={hero.subtitle}
        imageSrc={hero.imageSrc}
        className={hero.imageSrc ? '!h-[280px] !max-h-[280px]' : ''}
      />
      <MediaSectionNav />
      {children}
    </>
  );
}
