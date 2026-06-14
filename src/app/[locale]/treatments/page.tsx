export const revalidate = 60;

import type { Metadata } from 'next';
import { Suspense } from 'react';
import { permanentRedirect } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import { HeroBanner } from '@/components/common/HeroBanner';
import { TreatmentsTabGrid } from '@/components/treatments/TreatmentsTabGrid';
import { getCategoryLabel } from '@/components/treatments/treatmentData';
import { getAllCategories } from '@/lib/data/treatments';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { getPageHero } from '@/lib/data/hero';
import { urlFor } from '@/lib/sanity/image';
import { getSectionVisibility } from '@/lib/data/visibility';

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
  zh: '项目介绍',
  ja: '施術案内',
};
const allTreatmentsLabel: Record<string, string> = {
  ko: '전체 시술 안내',
  en: 'All Treatments',
  zh: '全部施术项目',
  ja: '施術一覧',
};

const descriptions: Record<string, string> = {
  ko: '포에버의원 명동점(포에버 클리닉) 시술 안내. 리프팅, 실 리프팅, 피부케어, 토닝/색소, 보톡스/필러, 여드름/흉터 전체 시술 정보.',
  en: 'All treatments at Forever Clinic Myeongdong. Lifting, Thread Lifting, Skincare, Toning & Pigment, Botox & Filler, Acne & Scar.',
  zh: '明洞Forever皮肤科（Forever Clinic）施术指南。提升、线雕提升、皮肤护理、净肤/色素、肉毒素/玻尿酸、痘痘/疤痕等全部施术信息。',
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
  setRequestLocale(locale);

  const visibility = await getSectionVisibility();
  if (!visibility.nav.treatments) {
    permanentRedirect(`/${locale}`);
  }

  const t = await getTranslations('treatments');

  const [hero, rawCategories] = await Promise.all([
    getPageHero('treatments', locale),
    getAllCategories(locale),
  ]);
  const heroImageUrl = toImageUrl(hero?.heroImage, 1920, 400);

  // Apply megaMenuOrder to category tabs (signature always stays separate)
  const catOrder = visibility.megaMenuOrder;
  const categories = catOrder?.length
    ? [
        ...catOrder
          .map((slug) => rawCategories.find((c) => c.slug === slug))
          .filter((c): c is NonNullable<typeof c> => c !== undefined),
        ...rawCategories.filter((c) => !catOrder.includes(c.slug)),
      ]
    : rawCategories;

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
        <TreatmentsTabGrid
          locale={locale}
          categories={categories}
          showDetail={visibility.treatments.detail}
          showPrice={visibility.treatments.showPrice}
        />
      </Suspense>

      {/* 전체 시술 정적 링크 인덱스 (SEO 크롤 경로)
          탭은 JS 버튼이라 비활성 탭의 시술 상세 링크가 정적 DOM에 없음 →
          모든 시술 상세 페이지가 고아(orphan)가 되지 않도록 서버 렌더 링크 제공 */}
      {visibility.treatments.detail && (
        <nav
          aria-label={allTreatmentsLabel[locale] ?? allTreatmentsLabel.ko}
          className="border-t border-[#e8ded6] bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-12"
        >
          <div className="mx-auto max-w-[1272px]">
            <h2 className="text-[15px] font-bold tracking-wide text-[#2b2b2b]">
              {allTreatmentsLabel[locale] ?? allTreatmentsLabel.ko}
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-x-8 gap-y-8 md:grid-cols-3 lg:grid-cols-4">
              {categories.map((cat) => {
                const treatments = cat.treatments.filter((tr) => tr.slug);
                if (treatments.length === 0) return null;
                return (
                  <div key={cat.slug}>
                    <Link
                      href={`/${locale}/treatments?cat=${cat.slug}`}
                      className="text-[13px] font-bold text-[#a83c44]"
                      data-ga-id={`treatments-index.cat-${cat.slug}`}
                    >
                      {getCategoryLabel(cat, locale)}
                    </Link>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {treatments.map((tr) => (
                        <li key={tr.slug}>
                          <Link
                            href={`/${locale}/treatments/${cat.slug}/${tr.slug}`}
                            className="text-[12.5px] leading-snug text-[#706263] transition-colors hover:text-[#a83c44]"
                            data-ga-id={`treatments-index.link-${tr.slug}`}
                          >
                            {tr.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </>
  );
}
