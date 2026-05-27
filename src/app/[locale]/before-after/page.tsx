import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { BAGrid } from '@/components/ba/BAGrid';
import { type BACase } from '@/components/ba/BACard';
import { getBACases } from '@/lib/data/ba';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { getPageHero } from '@/lib/data/hero';
import { urlFor } from '@/lib/sanity/image';
import { getSectionVisibility } from '@/lib/data/visibility';

const titles: Record<string, string> = {
  ko: '비포 & 애프터',
  en: 'Before & After',
  zh: '前后对比',
  ja: 'ビフォー＆アフター',
};
const descriptions: Record<string, string> = {
  ko: '포에버 클리닉 명동 시술 전후 사진. 울쎄라, 써마지, 보톡스, 필러 등 실제 시술 결과를 확인하세요.',
  en: 'Before and after photos of treatments at Forever Clinic Myeongdong. See real results of Ultherapy, Thermage, Botox, Filler.',
  zh: '永恒诊所明洞治疗前后照片。查看超声刀、热玛吉、肉毒素、玻尿酸的实际效果。',
  ja: 'フォーエバークリニック明洞の施術ビフォーアフター写真。ウルセラ、サーマジ、ボトックス、フィラーの実際の結果をご確認ください。',
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
    alternates: getAlternates(locale, '/before-after'),
    openGraph: {
      title: `${titles[locale] ?? titles.ko} | ${siteNames[locale] ?? siteNames.ko}`,
      description: descriptions[locale] ?? descriptions.ko,
      locale: ogLocales[locale] ?? 'ko_KR',
      images: [{ url: '/images/heroes/ba-hero.png', width: 1200, height: 630 }],
    },
  };
}

function mapCmsCases(
  cmsCases: Awaited<ReturnType<typeof getBACases>>['items'],
): BACase[] {
  return cmsCases.map((c) => ({
    id: c._id,
    title: c.title,
    sessions: c.sessions,
    category: c.categories?.[0] ?? '',
    beforeImage: c.beforeImage,
    afterImage: c.afterImage,
  }));
}

export default async function BeforeAfterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; cat?: string }>;
}) {
  const { locale } = await params;

  const visibility = await getSectionVisibility();
  if (!visibility.nav.bnA) {
    redirect(`/${locale}`);
  }

  const { page, cat } = await searchParams;
  const currentPage = Number(page) || 1;
  const activeCategory = cat || 'all';
  const t = await getTranslations('ba');

  const [{ items: baCaseItems, totalPages }, hero] = await Promise.all([
    getBACases(locale, activeCategory, currentPage),
    getPageHero('before-after', locale),
  ]);
  const cases = mapCmsCases(baCaseItems);
  const heroImageUrl = hero?.heroImage
    ? urlFor(hero.heroImage)?.width(1200).height(630).url() || undefined
    : undefined;

  return (
    <>
      <HeroBanner
        variant="fullscreen"
        title={hero?.title || t('title')}
        subtitle={hero?.subtitle || t('heroSubtitle')}
        imageSrc={heroImageUrl}
        className="!h-[280px] !max-h-[280px]"
      />
      <BAGrid
        cases={cases}
        locale={locale}
        currentPage={currentPage}
        totalPages={totalPages}
        activeCategory={activeCategory}
      />
    </>
  );
}
