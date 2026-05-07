// TODO: i18n - apply getTranslations to page title, subtitle
import type { Metadata } from 'next';
import { ContentCard } from '@/components/media/ContentCard';
import { Pagination } from '@/components/common/Pagination';
import { getBlogPosts } from '@/lib/data/media';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === 'ko'
      ? '블로그'
      : locale === 'en'
        ? 'Blog'
        : locale === 'zh'
          ? '博客'
          : 'ブログ';
  const description =
    locale === 'ko'
      ? '포에버 클리닉 명동 피부 관리 팁과 시술 정보 블로그.'
      : 'Skin care tips and treatment information blog from Forever Clinic Myeongdong.';
  return {
    title,
    description,
    alternates: getAlternates(locale, '/media/blog'),
    openGraph: {
      title: `${title} | ${siteNames[locale] ?? siteNames.ko}`,
      description,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
  };
}

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

  const blogPosts = await getBlogPosts(locale);

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[1272px]">
        <div
          className="grid justify-center gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}
        >
          {blogPosts.map((post, idx) => (
            <ContentCard
              key={post.slug}
              href={`/${locale}/media/blog/${post.slug}`}
              date={post.date}
              title={post.title}
              description={post.description}
              position={idx + 1}
              total={blogPosts.length}
              views={post.views}
            />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={5}
          basePath={`/${locale}/media/blog`}
          className="mt-8"
        />
      </div>
    </section>
  );
}
