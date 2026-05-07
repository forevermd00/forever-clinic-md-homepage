import { notFound } from 'next/navigation';
import { ArticleDetail } from '@/components/media/ArticleDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArticleJsonLd } from '@/lib/seo/jsonld';
import { getPressDetail } from '@/lib/data/media';
import { ViewTracker } from '@/components/media/ViewTracker';

export default async function PressDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const cmsResult = await getPressDetail(slug, locale);
  if (!cmsResult) notFound();

  const baseUrl = 'https://forever-clinic-myeongdong.com';

  return (
    <>
      <ViewTracker id={cmsResult.article.slug} />
      <JsonLd
        data={getArticleJsonLd({
          title: cmsResult.article.title,
          date: cmsResult.article.date,
          description: cmsResult.article.content.slice(0, 160),
          url: `${baseUrl}/${locale}/media/press/${cmsResult.article.slug}`,
        })}
      />
      <ArticleDetail
        article={cmsResult.article}
        prevArticle={cmsResult.prevArticle}
        nextArticle={cmsResult.nextArticle}
        basePath={`/${locale}/media/press`}
        locale={locale}
        position={cmsResult.position}
        total={cmsResult.total}
      />
    </>
  );
}
