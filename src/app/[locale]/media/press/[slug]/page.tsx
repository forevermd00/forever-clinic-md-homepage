import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PressArticleDetail } from '@/components/media/PressArticleDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArticleJsonLd } from '@/lib/seo/jsonld';
import { getPressDetail } from '@/lib/data/media';
import { ViewTracker } from '@/components/media/ViewTracker';
import {
  BASE_URL,
  getAlternates,
  ogLocales,
  siteNames,
} from '@/lib/seo/keywords';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const cmsResult = await getPressDetail(slug, locale);
  if (!cmsResult) return {};
  const { article } = cmsResult;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: getAlternates(locale, `/media/press/${slug}`),
    openGraph: {
      title: `${article.title} | ${siteNames[locale] ?? siteNames.ko}`,
      description: article.excerpt,
      locale: ogLocales[locale] ?? 'ko_KR',
      ...(article.thumbnail
        ? { images: [{ url: article.thumbnail, width: 1200, height: 630 }] }
        : {}),
    },
  };
}

export default async function PressDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const cmsResult = await getPressDetail(slug, locale);
  if (!cmsResult) notFound();

  return (
    <>
      <ViewTracker id={cmsResult.article.slug} />
      <JsonLd
        data={getArticleJsonLd({
          title: cmsResult.article.title,
          date: cmsResult.article.date,
          description: cmsResult.article.excerpt.slice(0, 160),
          url: `${BASE_URL}/${locale}/media/press/${cmsResult.article.slug}`,
        })}
      />
      <PressArticleDetail
        article={cmsResult.article}
        prevArticle={cmsResult.prevArticle}
        nextArticle={cmsResult.nextArticle}
        basePath={`/${locale}/media/press`}
        position={cmsResult.position}
        total={cmsResult.total}
      />
    </>
  );
}
