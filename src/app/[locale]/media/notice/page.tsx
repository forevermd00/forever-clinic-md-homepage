// TODO: i18n — apply getTranslations to page title, subtitle
import type { Metadata } from 'next';
import { NoticeTable } from '@/components/media/NoticeTable';
import { Pagination } from '@/components/common/Pagination';
import { getNotices } from '@/lib/data/media';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title =
    locale === 'ko'
      ? '공지사항'
      : locale === 'en'
        ? 'Notice'
        : locale === 'zh'
          ? '公告'
          : 'お知らせ';
  const description =
    locale === 'ko'
      ? '포에버 클리닉 명동 공지사항.'
      : 'Notices from Forever Clinic Myeongdong.';
  return {
    title,
    description,
    alternates: getAlternates(locale, '/media/notice'),
    openGraph: {
      title: `${title} | ${siteNames[locale] ?? siteNames.ko}`,
      description,
      locale: ogLocales[locale] ?? 'ko_KR',
    },
  };
}

export default async function NoticePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page } = await searchParams;
  const currentPage = Number(page) || 1;

  const notices = await getNotices(locale);

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[var(--container-max)]">
        <NoticeTable notices={notices} locale={locale} />
        <Pagination
          currentPage={currentPage}
          totalPages={5}
          basePath={`/${locale}/media/notice`}
          className="mt-8"
        />
      </div>
    </section>
  );
}
