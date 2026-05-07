import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export interface NoticeItem {
  id: number;
  slug: string;
  title: string;
  date: string;
  views: number;
}

interface NoticeTableProps {
  notices: NoticeItem[];
  locale: string;
}

function formatViews(views: number): string {
  return views.toLocaleString();
}

async function NoticeTable({ notices, locale }: NoticeTableProps) {
  const t = await getTranslations('noticeTable');

  return (
    <div>
      <div className="mx-auto max-w-[var(--container-max)]">
        {/* Table header */}
        <div className="hidden min-h-[44px] items-center border-b border-[#efe5d9] bg-[#faf8f5] px-4 text-[13px] font-medium text-[#706263] md:flex">
          <div className="w-[80px] text-center">{t('number')}</div>
          <div className="flex-1 text-left">{t('title')}</div>
          <div className="w-[120px] text-center">{t('date')}</div>
          <div className="w-[100px] text-center">{t('views')}</div>
        </div>

        {/* Mobile header */}
        <div className="flex min-h-[44px] items-center border-b border-[#efe5d9] bg-[#faf8f5] px-4 text-[13px] font-medium text-[#706263] md:hidden">
          <div className="flex-1 text-left">{t('title')}</div>
          <div className="w-[80px] text-center">{t('date')}</div>
        </div>

        {/* Table rows */}
        {notices.map((notice) => (
          <div
            key={notice.id}
            className="flex min-h-[52px] items-center border-b border-[#efe5d9] px-4"
          >
            {/* Number - desktop only */}
            <div className="hidden w-[80px] text-center text-[14px] text-[#999] md:block">
              {notice.id}
            </div>

            {/* Title */}
            <div className="flex-1 text-left">
              <Link
                href={`/${locale}/media/notice/${notice.slug}`}
                className="text-[14px] font-medium text-[#2b2b2b] hover:underline"
              >
                {notice.title}
              </Link>
            </div>

            {/* Date */}
            <div className="w-[80px] text-center text-[13px] text-[#999] md:w-[120px]">
              {notice.date}
            </div>

            {/* Views - desktop only */}
            <div className="hidden w-[100px] text-center text-[13px] text-[#999] md:block">
              {formatViews(notice.views)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { NoticeTable };
