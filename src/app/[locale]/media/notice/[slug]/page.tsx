import { notFound } from 'next/navigation';
import { ArticleDetail } from '@/components/media/ArticleDetail';

const notices = [
  {
    slug: 'chuseok-hours',
    title: '2025년 추석 연휴 진료 안내',
    date: '2025.09.01',
    views: 342,
    content: `안녕하세요, 포에버 클리닉입니다.\n\n추석 연휴 기간 진료 안내드립니다.\n\n■ 휴진: 2025.10.05 ~ 2025.10.07 (3일간)\n■ 정상 진료: 2025.10.08 (수) ~\n\n즐거운 추석 보내시길 바랍니다.`,
  },
  {
    slug: 'myeongdong-renewal',
    title: '포에버 클리닉 명동점 리뉴얼 오픈 안내',
    date: '2025.07.15',
    views: 891,
    content: `안녕하세요, 포에버 클리닉입니다.\n\n더 넓어진 공간, 최신 장비로 업그레이드된 포에버 클리닉 명동점이 새롭게 오픈합니다.\n\n■ 리뉴얼 포인트\n- 시술실 2개 추가 (총 6개 운영)\n- 프라이빗 리커버리룸 신설\n- 최신 울쎄라 장비 도입\n\n리뉴얼 기념 특별 할인 이벤트도 진행 중입니다.`,
  },
  {
    slug: 'privacy-policy-july',
    title: '개인정보처리방침 개정 안내 (2025년 7월)',
    date: '2025.06.30',
    views: 156,
    content: `안녕하세요, 포에버 클리닉입니다.\n\n개인정보보호법 개정에 따라 개인정보처리방침이 일부 변경되었습니다.\n\n주요 변경 사항은 아래와 같습니다.\n\n1. 개인정보 수집 항목 변경\n2. 개인정보 보유 기간 조정\n3. 제3자 제공 관련 조항 추가\n\n변경된 방침은 2025년 7월 1일부터 적용됩니다.`,
  },
  {
    slug: 'summer-hours',
    title: '여름 휴가 기간 진료 시간 변경 안내',
    date: '2025.06.10',
    views: 278,
    content: `안녕하세요, 포에버 클리닉입니다.\n\n여름 휴가 기간 진료 시간이 아래와 같이 변경됩니다.\n\n■ 변경 기간: 2025.08.01 ~ 2025.08.15\n■ 진료 시간: 10:00 - 17:00 (토요일 휴진)\n■ 8월 16일부터 정상 진료\n\n불편을 드려 죄송합니다.`,
  },
  {
    slug: 'pico-laser-upgrade',
    title: '신규 시술 도입 안내 – 피코 레이저 업그레이드',
    date: '2025.04.22',
    views: 504,
    content: `안녕하세요, 포에버 클리닉입니다.\n\n피코슈어 프로 레이저를 새롭게 도입하였습니다.\n색소 치료와 피부 재생에 더욱 효과적인 시술이 가능합니다.\n\n■ 적용 시술: 피코토닝, 색소 치료, 피부 재생\n■ 특징: 기존 대비 30% 향상된 에너지 전달\n\n자세한 상담은 내원 또는 전화로 문의해 주세요.`,
  },
  {
    slug: 'myeongdong-open',
    title: '포에버 클리닉 명동점 오픈 안내',
    date: '2025.03.01',
    views: 1203,
    content: `안녕하세요, 포에버 클리닉입니다.\n\n2025년 6월 8일, 서울 명동에 포에버 클리닉 명동점이 새롭게 오픈합니다.\n\n최신 장비와 숙련된 의료진이 여러분의 피부 건강을 책임지겠습니다. 오픈 기념 특별 프로모션도 준비되어 있으니 많은 관심 부탁드립니다.\n\n■ 위치: 서울특별시 중구 명동길 14, 포에버빌딩 3층\n■ 진료시간: 월~금 10:00-19:00 / 토 10:00-16:00\n■ 문의: 02-XXX-XXXX\n\n감사합니다.`,
  },
];

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const index = notices.findIndex((n) => n.slug === slug);
  if (index === -1) notFound();

  const article = notices[index];
  const prevArticle = index < notices.length - 1 ? notices[index + 1] : null;
  const nextArticle = index > 0 ? notices[index - 1] : null;

  return (
    <ArticleDetail
      article={article}
      prevArticle={prevArticle}
      nextArticle={nextArticle}
      basePath={`/${locale}/media/notice`}
      locale={locale}
    />
  );
}
