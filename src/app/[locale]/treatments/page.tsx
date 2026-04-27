import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { CategorySection } from '@/components/treatments/CategorySection';
import { TREATMENT_CATEGORIES } from '@/components/treatments/treatmentData';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

const titles: Record<string, string> = {
  ko: '시술 안내',
  en: 'Treatments',
  zh: '治疗项目',
  ja: '施術案内',
};
const descriptions: Record<string, string> = {
  ko: '포에버 클리닉 명동 시술 안내. 리프팅, 피부케어, 토닝/색소, 보톡스/필러 전체 시술 정보.',
  en: 'All treatments at Forever Clinic Myeongdong. Lifting, Skincare, Toning & Pigment, Botox & Filler.',
  zh: '永恒诊所明洞全部治疗项目。提升、皮肤管理、色素管理、肉毒素与玻尿酸。',
  ja: 'フォーエバークリニック明洞の施術一覧。リフティング、スキンケア、トーニング、ボトックス＆フィラー。',
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
          ]
        : []),
      ...(locale === 'en'
        ? [
            'ultherapy',
            'thermage',
            'botox',
            'filler',
            'skin lifting',
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

const categoryImages: Record<string, string> = {
  lifting: '/images/treatments/lifting.png',
  skincare: '/images/treatments/skincare.png',
  toning: '/images/treatments/toning.png',
  'botox-filler': '/images/treatments/botox-filler.jpg',
};

export default async function TreatmentsHubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('treatments');
  const tc = await getTranslations('common');

  return (
    <>
      {/* Hero */}
      <HeroBanner
        variant="fullscreen"
        title={t('title')}
        subtitle={t('heroSubtitle')}
        imageSrc="/images/treatments/lifting.png"
        className="!h-[280px] !max-h-[280px]"
      />

      {/* Event Section */}
      <CategorySection
        labelEn="Event"
        label={t('eventLabel')}
        description={t('eventDescription')}
        href={`/${locale}/promotions`}
        ctaText={tc('viewEvents')}
        bgColor="bg-[#faf5f0]"
        imagePosition="right"
        imageSrc="/images/heroes/promo-hero.png"
        isEvent
      />

      {/* Category Sections - alternating layout */}
      {TREATMENT_CATEGORIES.map((category, index) => {
        // Event is text-left/image-right, so lifting (index 0) starts image-left/text-right
        const imagePosition = index % 2 === 0 ? 'left' : 'right';
        const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-[#f9f6f3]';

        return (
          <CategorySection
            key={category.slug}
            labelEn={category.labelEn}
            label={category.label}
            description={category.description}
            href={`/${locale}/treatments/${category.slug}`}
            ctaText={tc('viewTreatments')}
            bgColor={bgColor}
            imagePosition={imagePosition}
            imageSrc={categoryImages[category.slug]}
          />
        );
      })}

      {/* Bottom CTA */}
      <section className="bg-[#2b2b2b] py-12 text-center">
        <h2 className="text-[24px] font-bold text-white lg:text-[28px]">
          {tc('startConsultation')}
        </h2>
        <Link
          href={`/${locale}/contact`}
          className="mt-6 inline-flex items-center justify-center rounded-[var(--radius-button)] border-[1.5px] border-white px-8 py-3 font-semibold text-white transition-colors hover:bg-white/10"
        >
          {tc('consultationReservation')}
        </Link>
      </section>
    </>
  );
}
