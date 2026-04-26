// TODO: i18n — apply getTranslations to page title, subtitle
import { ContentCard } from '@/components/media/ContentCard';
import { Pagination } from '@/components/common/Pagination';

const dummyPressArticles = [
  {
    slug: 'ulthera-award-2026',
    date: '2026.04.10',
    title: '포에버 클리닉 명동, 울쎄라 공식 인증 클리닉 선정',
    description:
      '포에버 클리닉 명동점이 울쎄라 본사로부터 공식 인증 클리닉으로 선정되었습니다. 연간 시술 건수와 안전 관리 기준을 충족하여 인증을 획득했습니다.',
  },
  {
    slug: 'myeongdong-expansion',
    date: '2026.03.22',
    title: '명동점 확장 이전 오픈 안내',
    description:
      '더 넓아진 공간, 최신 장비로 업그레이드된 포에버 클리닉 명동점이 새롭게 오픈합니다. 확장된 시설에서 더 편안한 시술 경험을 제공합니다.',
  },
  {
    slug: 'skincare-trend-2026',
    date: '2026.02.15',
    title: '2026 피부 관리 트렌드 — 전문의 인터뷰',
    description:
      '포에버 클리닉 원장이 올해의 피부 관리 트렌드에 대해 전문 매체와 인터뷰를 진행했습니다. 엑소좀과 스킨부스터의 부상에 대해 다루었습니다.',
  },
];

export default async function PressPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dummyPressArticles.map((article) => (
          <ContentCard
            key={article.slug}
            href={`/${locale}/media/press/${article.slug}`}
            date={article.date}
            title={article.title}
            description={article.description}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={5}
        basePath={`/${locale}/media/press`}
        className="mt-8"
      />
    </section>
  );
}
