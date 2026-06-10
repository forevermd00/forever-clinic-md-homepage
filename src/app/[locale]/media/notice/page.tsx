import type { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { NoticeTable } from '@/components/media/NoticeTable';
import { Pagination } from '@/components/common/Pagination';
import { getNotices } from '@/lib/data/media';
import { getAlternates, ogLocales, siteNames } from '@/lib/seo/keywords';
import { getSectionVisibility } from '@/lib/data/visibility';
import { getFirstVisibleMediaTab } from '@/lib/data/mediaRedirect';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'media' });
  const title = t('notice');
  const description = t('noticeDescription');
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

  const visibility = await getSectionVisibility();
  if (!visibility.nav.media) {
    permanentRedirect(`/${locale}`);
  }
  if (!visibility.media.notice) {
    const firstTab = getFirstVisibleMediaTab(visibility.media);
    permanentRedirect(`/${locale}/media/${firstTab ?? 'press'}`);
  }

  const { items: notices, totalPages } = await getNotices(locale, currentPage);

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[var(--container-max)]">
        <NoticeTable notices={notices} locale={locale} />
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath={`/${locale}/media/notice`}
          className="mt-8"
        />
      </div>
    </section>
  );
}
