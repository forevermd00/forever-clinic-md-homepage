import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { TreatmentsTabGrid } from '@/components/treatments/TreatmentsTabGrid';
import { getAllCategories } from '@/lib/data/treatments';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { getPageHero } from '@/lib/data/hero';
import { urlFor } from '@/lib/sanity/image';

function toImageUrl(
  heroImage: unknown,
  w: number,
  h: number,
): string | undefined {
  return heroImage
    ? urlFor(heroImage)?.width(w).height(h).url() || undefined
    : undefined;
}

const titles: Record<string, string> = {
  ko: '시술 안내',
  en: 'Treatments',
  zh: '治疗项目',
  ja: '施術案内',
};
const descriptions: Record<string, string> = {
  ko: '포에버 클리닉 명동 시술 안내. 리프팅, 실 리프팅, 피부케어, 토닝/색소, 보톡스/필러, 여드름/흉터 전체 시술 정보.',
  en: 'All treatments at Forever Clinic Myeongdong. Lifting, Thread Lifting, Skincare, Toning & Pigment, Botox & Filler, Acne & Scar.',
  zh: '永恒诊所明洞全部治疗项目。提升、线提升、皮肤管理、色素管理、肉毒素与玻尿酸、痤疮与疤痕。',
  ja: 'フォーエバークリニック明洞の施術一覧。リフティング、スレッドリフト、スキンケア、トーニング、ボトックス＆フィラー、ニキビ・瘢痕。',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: titles[locale] ?? titles.ko,
    description: descriptions[locale] ?? descriptions.ko,
    keywords: [
      ...(locale === 'ko'
        ? [
            '울쎄라',
            '써마지',
            '보톡스',
            '필러',
            '피코토닝',
            '리프팅',
            '피부관리',
            '실리프팅',
            '여드름치료',
          ]
        : []),
      ...(locale === 'en'
        ? [
            'ultherapy',
            'thermage',
            'botox',
            'filler',
            'skin lifting',
            'thread lifting',
            'skincare',
          ]
        : []),
    ],
    alternates: getAlternates(locale, '/treatments'),
    openGraph: {
      title: `${titles[locale] ?? titles.ko} | ${siteNames[locale] ?? siteNames.ko}`,
      description: descriptions[locale] ?? descriptions.ko,
      locale: ogLocales[locale] ?? 'ko_KR',
      images: [
        { url: '/images/treatments/lifting.png', width: 1200, height: 630 },
      ],
    },
  };
}

export default async function TreatmentsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('treatments');

  const [hero, categories] = await Promise.all([
    getPageHero('treatments', locale),
    getAllCategories(locale),
  ]);
  const heroImageUrl = toImageUrl(hero?.heroImage, 1920, 400);

  return (
    <>
      {/* Hero */}
      <HeroBanner
        variant="page-title"
        title={hero?.title || t('title')}
        subtitle={hero?.subtitle || t('heroSubtitle')}
        imageSrc={heroImageUrl}
      />

      {/* 탭 그리드 — useSearchParams 사용으로 Suspense 필요 */}
      <Suspense
        fallback={<div className="h-96 animate-pulse bg-neutral-100" />}
      >
        <TreatmentsTabGrid locale={locale} categories={categories} />
      </Suspense>
    </>
  );
}
