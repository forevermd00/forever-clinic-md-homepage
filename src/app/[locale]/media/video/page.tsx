// TODO: i18n — apply getTranslations to page title, subtitle
import { VideoCard } from '@/components/media/VideoCard';
import { Pagination } from '@/components/common/Pagination';

const dummyVideos = [
  {
    slug: 'ulthera-process',
    title: '울쎄라 리프팅 시술 과정 A to Z',
    views: '조회수 12,340회',
  },
  {
    slug: 'thermage-review',
    title: '써마지 FLX 시술 후기 — 실제 고객 인터뷰',
    views: '조회수 8,920회',
  },
  {
    slug: 'skincare-routine',
    title: '피부과 전문의가 알려주는 데일리 스킨케어 루틴',
    views: '조회수 25,100회',
  },
];

export default async function VideoPage({
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
        {dummyVideos.map((video) => (
          <VideoCard
            key={video.slug}
            href={`/${locale}/media/video/${video.slug}`}
            title={video.title}
            views={video.views}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={5}
        basePath={`/${locale}/media/video`}
        className="mt-8"
      />
    </section>
  );
}
