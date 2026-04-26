import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { CategorySection } from '@/components/treatments/CategorySection';
import { TREATMENT_CATEGORIES } from '@/components/treatments/treatmentData';

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

      {/* Category Sections — alternating layout */}
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
