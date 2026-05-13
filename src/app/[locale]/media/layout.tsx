import { getPageHero } from '@/lib/data/hero';
import { urlFor } from '@/lib/sanity/image';
import { MediaLayoutClient } from '@/components/media/MediaLayoutClient';
import { getSectionVisibility } from '@/lib/data/visibility';

export default async function MediaLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const [visibility, press, video, blog, notice] = await Promise.all([
    getSectionVisibility(),
    getPageHero('press', locale),
    getPageHero('video', locale),
    getPageHero('blog', locale),
    getPageHero('notice', locale),
  ]);

  const heroData: Record<
    string,
    { title?: string; subtitle?: string; imageSrc?: string }
  > = {
    press: {
      title: press?.title,
      subtitle: press?.subtitle,
      imageSrc: press?.heroImage
        ? urlFor(press.heroImage)?.width(1200).height(630).url() || undefined
        : undefined,
    },
    video: {
      title: video?.title,
      subtitle: video?.subtitle,
      imageSrc: video?.heroImage
        ? urlFor(video.heroImage)?.width(1200).height(630).url() || undefined
        : undefined,
    },
    blog: {
      title: blog?.title,
      subtitle: blog?.subtitle,
      imageSrc: blog?.heroImage
        ? urlFor(blog.heroImage)?.width(1200).height(630).url() || undefined
        : undefined,
    },
    notice: {
      title: notice?.title,
      subtitle: notice?.subtitle,
      imageSrc: notice?.heroImage
        ? urlFor(notice.heroImage)?.width(1200).height(630).url() || undefined
        : undefined,
    },
  };

  return (
    <MediaLayoutClient heroData={heroData} mediaVisibility={visibility.media}>
      {children}
    </MediaLayoutClient>
  );
}
