import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface ArticleItem {
  slug: string;
  title: string;
  date: string;
  content: string;
  views?: number;
}

interface ArticleDetailProps {
  article: ArticleItem;
  prevArticle?: { slug: string; title: string } | null;
  nextArticle?: { slug: string; title: string } | null;
  basePath: string; // e.g. "/${locale}/media/notice"
  locale: string;
  position?: number;
  total?: number;
}

export async function ArticleDetail({
  article,
  prevArticle,
  nextArticle,
  basePath,
  position,
  total,
}: ArticleDetailProps) {
  const t = await getTranslations('common');

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[800px]">
        {/* Title area */}
        <div className="border-b border-[#efe5d9] pb-6">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-[24px] font-bold text-[#2b2b2b] lg:text-[28px]">
              {article.title}
            </h1>
            {position !== undefined && total !== undefined && (
              <span className="shrink-0 pt-1 text-[13px] text-[#999]">
                {position}/{total}
              </span>
            )}
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
        <div className="py-10 text-[15px] leading-[1.8] whitespace-pre-line text-[#2b2b2b]">
          {article.content}
        </div>

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
  );
}
