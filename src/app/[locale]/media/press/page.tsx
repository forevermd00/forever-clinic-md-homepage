import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { ContentCard } from '@/components/media/ContentCard';
import { Pagination } from '@/components/common/Pagination';
import { getPressArticles } from '@/lib/data/media';
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
  const title = t('press');
  const description = t('pressDescription');
  return {
    title,
    description,
    alternates: getAlternates(locale, '/media/press'),
    openGraph: {
      title: `${title} | ${siteNames[locale] ?? siteNames.ko}`,
      description,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
  };
}

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

  const visibility = await getSectionVisibility();
  if (!visibility.nav.media) {
    redirect(`/${locale}`);
  }
  if (!visibility.media.press) {
    const firstTab = getFirstVisibleMediaTab(visibility.media);
    redirect(`/${locale}/media/${firstTab ?? 'press'}`);
  }

  const { items: pressArticles, totalPages } = await getPressArticles(
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
          {pressArticles.map((article) => (
            <ContentCard
              key={article.slug}
              href={`/${locale}/media/press/${article.slug}`}
              date={article.date}
              title={article.title}
              description={article.description}
              views={article.views}
            />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/${locale}/media/press`}
          className="mt-8"
        />
      </div>
    </section>
  );
}
