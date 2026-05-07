// TODO: i18n - apply getTranslations to page title, subtitle
import type { Metadata } from 'next';
import { VideoCard } from '@/components/media/VideoCard';
import { Pagination } from '@/components/common/Pagination';
import { getYoutubeVideos } from '@/lib/data/media';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === 'ko'
      ? '영상 콘텐츠'
      : locale === 'en'
        ? 'Videos'
        : locale === 'zh'
          ? '视频内容'
          : '動画コンテンツ';
  const description =
    locale === 'ko'
      ? '포에버 클리닉 명동 시술 과정과 후기 영상.'
      : 'Treatment process and review videos from Forever Clinic Myeongdong.';
  return {
    title,
    description,
    alternates: getAlternates(locale, '/media/video'),
    openGraph: {
      title: `${title} | ${siteNames[locale] ?? siteNames.ko}`,
      description,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
  };
}

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

  const videos = await getYoutubeVideos(locale);

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[1272px]">
        <div
          className="grid justify-center gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}
        >
          {videos.map((video) => (
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
      </div>
    </section>
  );
}
