import { getTranslations } from 'next-intl/server';
import { HeroBanner } from '@/components/common/HeroBanner';
import { BAGrid } from '@/components/ba/BAGrid';
import { type BACase } from '@/components/ba/BACard';

const DUMMY_BA_CASES: BACase[] = [
  {
    id: '1',
    treatmentName: '울쎄라 리프팅',
    sessionCount: 3,
    category: 'lifting',
  },
  {
    id: '2',
    treatmentName: '써마지 FLX',
    sessionCount: 1,
    category: 'lifting',
  },
  { id: '3', treatmentName: '피코토닝', sessionCount: 5, category: 'toning' },
  { id: '4', treatmentName: '아쿠아필', sessionCount: 2, category: 'skincare' },
  {
    id: '5',
    treatmentName: '보톡스 이마',
    sessionCount: 1,
    category: 'botox-filler',
  },
  { id: '6', treatmentName: '실리프팅', sessionCount: 4, category: 'lifting' },
  { id: '7', treatmentName: '레이저토닝', sessionCount: 8, category: 'toning' },
  {
    id: '8',
    treatmentName: '히알루론산 필러',
    sessionCount: 1,
    category: 'botox-filler',
  },
  { id: '9', treatmentName: 'LDM 관리', sessionCount: 3, category: 'skincare' },
  {
    id: '10',
    treatmentName: '인모드 리프팅',
    sessionCount: 2,
    category: 'lifting',
  },
  {
    id: '11',
    treatmentName: '제네시스 토닝',
    sessionCount: 6,
    category: 'toning',
  },
  {
    id: '12',
    treatmentName: '스킨보톡스',
    sessionCount: 2,
    category: 'botox-filler',
  },
];

export default async function BeforeAfterPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; cat?: string }>;
}) {
  const { locale } = await params;
  const { page, cat } = await searchParams;
  const currentPage = Number(page) || 1;
  const activeCategory = cat || 'all';
  const t = await getTranslations('ba');

  return (
    <>
      <HeroBanner
        variant="fullscreen"
        title={t('title')}
        subtitle={t('heroSubtitle')}
        imageSrc="/images/heroes/ba-hero.png"
        className="!h-[280px] !max-h-[280px]"
      />
      <BAGrid
        cases={DUMMY_BA_CASES}
        locale={locale}
        currentPage={currentPage}
        activeCategory={activeCategory}
      />
    </>
  );
}
