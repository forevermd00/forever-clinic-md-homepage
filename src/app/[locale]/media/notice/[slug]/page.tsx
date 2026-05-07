import { notFound } from 'next/navigation';
import { ArticleDetail } from '@/components/media/ArticleDetail';
import { getNoticeDetail } from '@/lib/data/media';
import { ViewTracker } from '@/components/media/ViewTracker';

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const cmsResult = await getNoticeDetail(slug, locale);
  if (!cmsResult) notFound();

  return (
    <>
      <ViewTracker id={cmsResult.article.slug} />
      <ArticleDetail
        article={cmsResult.article}
        prevArticle={cmsResult.prevArticle}
        nextArticle={cmsResult.nextArticle}
        basePath={`/${locale}/media/notice`}
        locale={locale}
        position={cmsResult.position}
        total={cmsResult.total}
      />
    </>
  );
}
