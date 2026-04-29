import { notFound } from 'next/navigation';
import { ArticleDetail } from '@/components/media/ArticleDetail';
import { getNoticeDetail } from '@/lib/data/media';

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const cmsResult = await getNoticeDetail(slug, locale);
  if (!cmsResult) notFound();

  return (
    <ArticleDetail
      article={cmsResult.article}
      prevArticle={cmsResult.prevArticle}
      nextArticle={cmsResult.nextArticle}
      basePath={`/${locale}/media/notice`}
      locale={locale}
    />
  );
}
