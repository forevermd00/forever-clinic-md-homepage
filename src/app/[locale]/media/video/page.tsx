import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { VideoCard } from '@/components/media/VideoCard';
import { Pagination } from '@/components/common/Pagination';
import { getYoutubeVideos } from '@/lib/data/media';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { getSectionVisibility } from '@/lib/data/visibility';
import { getFirstVisibleMediaTab } from '@/lib/data/mediaRedirect';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'media' });
  const title = t('video');
  const description = t('videoDescription');
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

  const visibility = await getSectionVisibility();
  if (!visibility.nav.media) {
    permanentRedirect(`/${locale}`);
  }
  if (!visibility.media.video) {
    const firstTab = getFirstVisibleMediaTab(visibility.media);
    permanentRedirect(`/${locale}/media/${firstTab ?? 'press'}`);
  }

  const { items: videos, totalPages } = await getYoutubeVideos(
    locale,
    currentPage,
  );

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
              href={video.href}
              thumbnailUrl={video.thumbnailUrl}
              title={video.title}
              views={video.views}
              target="_blank"
              rel="noopener noreferrer"
            />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/${locale}/media/video`}
          className="mt-8"
        />
      </div>
    </section>
  );
}
