import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

interface PressArticle {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  publisher: string;
  url: string;
  thumbnail?: string;
  views?: number;
}

interface PressArticleDetailProps {
  article: PressArticle;
  prevArticle?: { slug: string; title: string } | null;
  nextArticle?: { slug: string; title: string } | null;
  basePath: string;
  position?: number;
  total?: number;
}

export async function PressArticleDetail({
  article,
  prevArticle,
  nextArticle,
  basePath,
}: PressArticleDetailProps) {
  const t = await getTranslations('common');

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[800px]">
        {/* Title area */}
        <div className="border-b border-[#efe5d9] pb-6">
          <h1 className="text-[24px] font-bold text-[#2b2b2b] lg:text-[28px]">
            {article.title}
          </h1>
          <div className="mt-3 flex items-center justify-between gap-4 text-[13px] text-[#999]">
            <div className="flex items-center gap-3">
              {article.publisher && <span>{article.publisher}</span>}
              {article.publisher && article.date && <span>·</span>}
              <span>{article.date}</span>
            </div>
            {article.views !== undefined && (
              <span>
                {t('views')} {article.views.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail */}
        {article.thumbnail && (
          <div className="mt-8 overflow-hidden rounded-[8px]">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mt-8 text-[15px] leading-[1.8] text-[#2b2b2b]">
            {article.excerpt}
          </p>
        )}

        {/* 원문 보기 버튼 */}
        {article.url && (
          <div className="mt-8 flex justify-center">
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-[4px] bg-[#a83c44] px-8 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#8e2f37]"
            >
              {t('viewOriginalArticle')}
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 12L12 2M12 2H6M12 2V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        )}

        {/* Prev / Next navigation */}
        <div className="mt-10 border-t border-[#efe5d9]">
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
