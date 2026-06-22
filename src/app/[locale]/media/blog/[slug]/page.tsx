import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArticleJsonLd } from '@/lib/seo/jsonld';
import { getBlogDetail } from '@/lib/data/media';
import { sanityFetch } from '@/lib/sanity/fetch';
import { BlogContent } from '@/components/media/BlogContent';
import { ViewTracker } from '@/components/media/ViewTracker';
import {
  BASE_URL,
  getAlternates,
  ogLocales,
  siteNames,
} from '@/lib/seo/keywords';

// 마크다운 본문에서 메타 설명용 평문 추출 (문법 기호 제거)
function mdToPlainText(md: string): string {
  return (md || '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '') // 이미지 제거
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크 → 텍스트
    .replace(/<[^>]+>/g, '') // 인라인 HTML 제거
    .replace(/[#>*_`~|-]/g, ' ') // 마크다운 기호 제거
    .replace(/\s+/g, ' ')
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cmsResult = await getBlogDetail(slug, locale);
  if (!cmsResult) return {};
  const { article } = cmsResult;
  const plainText = mdToPlainText(article.content);
  const description = plainText.slice(0, 160);
  return {
    title: article.title,
    description,
    alternates: getAlternates(locale, `/media/blog/${slug}`),
    openGraph: {
      title: `${article.title} | ${siteNames[locale] ?? siteNames.ko}`,
      description,
      locale: ogLocales[locale] ?? 'ko_KR',
      ...(article.thumbnail ? { images: [{ url: article.thumbnail }] } : {}),
    },
  };
}

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const items = await sanityFetch<{ slug: string }[]>(
      `*[_type == "blogPost" && isVisible != false]{ "slug": slug.current }`,
    );
    return (items ?? []).filter((i) => i.slug).map((i) => ({ slug: i.slug }));
  } catch {
    return [];
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('common');

  const cmsResult = await getBlogDetail(slug, locale);
  if (!cmsResult) notFound();

  const { article, prevArticle, nextArticle } = cmsResult;
  const basePath = `/${locale}/media/blog`;
  const plainText = mdToPlainText(article.content);

  return (
    <>
      <ViewTracker id={article._id} />
      <JsonLd
        data={getArticleJsonLd({
          title: article.title,
          date: article.date,
          description: plainText.slice(0, 160),
          url: `${BASE_URL}${basePath}/${article.slug}`,
        })}
      />
      <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
        <div className="mx-auto max-w-[800px]">
          {/* Title area */}
          <div className="border-b border-[#efe5d9] pb-6">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-[24px] font-bold text-[#2b2b2b] lg:text-[28px]">
                {article.title}
              </h1>
            </div>
            <div className="mt-3 flex items-center gap-4 text-[13px] text-[#999]">
              <span>{article.date}</span>
              {article.views !== undefined && (
                <span>
                  {t('views')} {article.views.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Content */}
          <BlogContent value={article.content} />

          {/* Prev / Next navigation */}
          <div className="border-t border-[#efe5d9]">
            {prevArticle && (
              <Link
                href={`${basePath}/${prevArticle.slug}`}
                data-ga-id="media-article.prev"
                className="flex items-center gap-3 border-b border-[#efe5d9] px-4 py-4 transition-colors hover:bg-[#f3eee6]"
              >
                <span className="w-[60px] shrink-0 text-[13px] font-medium text-[#999]">
                  {t('prevArticle')}
                </span>
                <span className="text-[14px] text-[#2b2b2b]">
                  {prevArticle.title}
                </span>
              </Link>
            )}
            {nextArticle && (
              <Link
                href={`${basePath}/${nextArticle.slug}`}
                data-ga-id="media-article.next"
                className="flex items-center gap-3 border-b border-[#efe5d9] px-4 py-4 transition-colors hover:bg-[#f3eee6]"
              >
                <span className="w-[60px] shrink-0 text-[13px] font-medium text-[#999]">
                  {t('nextArticle')}
                </span>
                <span className="text-[14px] text-[#2b2b2b]">
                  {nextArticle.title}
                </span>
              </Link>
            )}
          </div>

          {/* Back to list */}
          <div className="flex justify-center pt-8">
            <Link
              href={basePath}
              data-ga-id="media-article.back"
              className="rounded-[4px] border border-[#2b2b2b] px-8 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b] hover:text-white"
            >
              {t('backToListShort')}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
