import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { toPlainText } from '@portabletext/toolkit';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArticleJsonLd } from '@/lib/seo/jsonld';
import { getBlogDetail } from '@/lib/data/media';
import { BlogContent } from '@/components/media/BlogContent';
import { ViewTracker } from '@/components/media/ViewTracker';

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations('common');

  const cmsResult = await getBlogDetail(slug, locale);
  if (!cmsResult) notFound();

  const { article, prevArticle, nextArticle } = cmsResult;
  const basePath = `/${locale}/media/blog`;
  const baseUrl = 'https://forever-clinic-myeongdong.com';
  const plainText =
    article.content.length > 0 ? toPlainText(article.content) : '';

  return (
    <>
      <ViewTracker id={article._id} />
      <JsonLd
        data={getArticleJsonLd({
          title: article.title,
          date: article.date,
          description: plainText.slice(0, 160),
          url: `${baseUrl}${basePath}/${article.slug}`,
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
              {cmsResult.position !== undefined &&
                cmsResult.total !== undefined && (
                  <span className="shrink-0 pt-1 text-[13px] text-[#999]">
                    {cmsResult.position}/{cmsResult.total}
                  </span>
                )}
            </div>
            <div className="mt-3 flex items-center gap-4 text-[13px] text-[#999]">
              <span>{article.date}</span>
            </div>
          </div>

          {/* Content */}
          <BlogContent value={article.content} />

          {/* Prev / Next navigation */}
          <div className="border-t border-[#efe5d9]">
            {prevArticle && (
              <Link
                href={`${basePath}/${prevArticle.slug}`}
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
