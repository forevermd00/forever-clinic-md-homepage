// TODO: i18n — apply getTranslations to page title, subtitle
import { ContentCard } from '@/components/media/ContentCard';
import { Pagination } from '@/components/common/Pagination';

const dummyBlogPosts = [
  {
    slug: 'spring-skincare-tips',
    date: '2026.04.18',
    title: '봄철 피부 관리 꿀팁 5가지',
    description:
      '환절기 피부 트러블을 예방하고 건강한 피부를 유지하는 방법을 소개합니다. 자외선 차단부터 보습까지, 전문의의 조언을 확인해보세요.',
  },
  {
    slug: 'exosome-explained',
    title: '엑소좀 시술이란? — 원리부터 효과까지',
    date: '2026.03.30',
    description:
      '최근 주목받고 있는 엑소좀 시술의 원리와 기대 효과, 시술 후 관리법에 대해 상세히 알려드립니다.',
  },
  {
    slug: 'lifting-comparison',
    title: '울쎄라 vs 써마지 — 어떤 리프팅이 나에게 맞을까?',
    date: '2026.03.05',
    description:
      '대표적인 비수술 리프팅 시술인 울쎄라와 써마지의 차이점을 비교 분석합니다. 피부 타입별 추천 시술을 확인해보세요.',
  },
];

export default async function BlogPage({
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
        {dummyBlogPosts.map((post) => (
          <ContentCard
            key={post.slug}
            href={`/${locale}/media/blog/${post.slug}`}
            date={post.date}
            title={post.title}
            description={post.description}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={5}
        basePath={`/${locale}/media/blog`}
        className="mt-8"
      />
    </section>
  );
}
