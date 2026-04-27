// TODO: i18n - apply getTranslations to page title, subtitle
import type { Metadata } from 'next';
import { ContentCard } from '@/components/media/ContentCard';
import { Pagination } from '@/components/common/Pagination';
import { getPressArticles } from '@/lib/data/media';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === 'ko'
      ? '보도자료'
      : locale === 'en'
        ? 'Press'
        : locale === 'zh'
          ? '新闻报道'
          : 'プレス';
  const description =
    locale === 'ko'
      ? '포에버 클리닉 명동 보도자료 및 미디어 소식.'
      : 'Press releases and media news from Forever Clinic Myeongdong.';
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

  const pressArticles = await getPressArticles(locale);

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto grid max-w-[var(--container-max)] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pressArticles.map((article) => (
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
