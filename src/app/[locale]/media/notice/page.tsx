// TODO: i18n — apply getTranslations to page title, subtitle
import { NoticeTable, type NoticeItem } from '@/components/media/NoticeTable';
import { Pagination } from '@/components/common/Pagination';

const dummyNotices: NoticeItem[] = [
  {
    id: 1,
    slug: 'myeongdong-open',
    title: '포에버 클리닉 명동점 오픈 안내',
    date: '2025.03.01',
    views: 1203,
  },
  {
    id: 2,
    slug: 'pico-laser-upgrade',
    title: '신규 시술 도입 안내 – 피코 레이저 업그레이드',
    date: '2025.04.22',
    views: 504,
  },
  {
    id: 3,
    slug: 'summer-hours',
    title: '여름 휴가 기간 진료 시간 변경 안내',
    date: '2025.06.10',
    views: 278,
  },
  {
    id: 4,
    slug: 'privacy-policy-july',
    title: '개인정보처리방침 개정 안내 (2025년 7월)',
    date: '2025.06.30',
    views: 156,
  },
  {
    id: 5,
    slug: 'myeongdong-renewal',
    title: '포에버 클리닉 명동점 리뉴얼 오픈 안내',
    date: '2025.07.15',
    views: 891,
  },
  {
    id: 6,
    slug: 'chuseok-hours',
    title: '2025년 추석 연휴 진료 안내',
    date: '2025.09.01',
    views: 342,
  },
];

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

  return (
    <section className="bg-[#faf8f5] px-5 py-12 md:px-10 lg:px-[120px] lg:py-16">
      <div className="mx-auto max-w-[var(--container-max)]">
        <NoticeTable notices={dummyNotices} locale={locale} />
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
