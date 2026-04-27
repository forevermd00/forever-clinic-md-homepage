import { notFound } from 'next/navigation';
import { ArticleDetail } from '@/components/media/ArticleDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArticleJsonLd } from '@/lib/seo/jsonld';
import { getPressDetail } from '@/lib/data/media';

const FALLBACK_ARTICLES = [
  {
    slug: 'ulthera-award-2026',
    title: '포에버 클리닉 명동, 울쎄라 공식 인증 클리닉 선정',
    date: '2026.04.10',
    content: `포에버 클리닉 명동점이 울쎄라 본사(Merz Aesthetics)로부터 공식 인증 클리닉으로 선정되었습니다.\n\n이번 인증은 연간 시술 건수, 안전 관리 기준, 의료진 교육 이수 등 엄격한 심사를 거쳐 부여되었으며, 서울 중구 지역에서는 포에버 클리닉이 유일한 인증 클리닉입니다.\n\n김포에버 원장은 "울쎄라 시술의 핵심은 정확한 에너지 전달과 개인별 맞춤 프로토콜"이라며, "앞으로도 안전하고 효과적인 시술을 제공하기 위해 지속적으로 노력하겠다"고 밝혔습니다.\n\n포에버 클리닉 명동점은 2026년 6월 8일 그랜드 오픈을 앞두고 있습니다.`,
  },
  {
    slug: 'myeongdong-expansion',
    title: '명동점 확장 이전 오픈 안내',
    date: '2026.03.22',
    content: `포에버 클리닉 명동점이 더 넓은 공간으로 확장 이전합니다.\n\n■ 새 주소: 서울특별시 중구 명동길 14, 포에버빌딩 3층\n■ 확장 내용:\n- 총 면적 2배 확대 (120평 → 240평)\n- 시술실 6개, 상담실 3개, 프라이빗 리커버리룸 4개\n- 최신 울쎄라, 써마지 FLX, 피코슈어 프로 장비 도입\n\n확장된 공간에서 더 편안하고 프라이빗한 시술 경험을 제공하겠습니다.\n\n이전 기념 특별 프로모션도 준비 중이오니 많은 관심 부탁드립니다.`,
  },
  {
    slug: 'skincare-trend-2026',
    title: '2026 피부 관리 트렌드 — 전문의 인터뷰',
    date: '2026.02.15',
    content: `포에버 클리닉 김포에버 원장이 올해의 피부 관리 트렌드에 대해 전문 매체와 인터뷰를 진행했습니다.\n\n■ 2026 핵심 트렌드\n\n1. 엑소좀 기반 피부 재생\n"엑소좀은 기존 성장인자 시술을 넘어서는 차세대 재생 치료입니다. 세포 레벨에서 피부를 회복시키는 접근이 주류가 될 것입니다."\n\n2. 복합 리프팅 프로토콜\n"울쎄라+써마지 같은 단일 시술 조합을 넘어, 3~4가지 모달리티를 순차적으로 적용하는 맞춤형 프로토콜이 효과를 입증하고 있습니다."\n\n3. 데이터 기반 피부 분석\n"AI 피부 분석 시스템을 통해 시술 전후를 정량적으로 비교하고, 개인별 최적 시술 플랜을 설계하는 시대가 왔습니다."\n\n전체 인터뷰 내용은 뷰티 매거진 5월호에서 확인하실 수 있습니다.`,
  },
];

export default async function PressDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // Try CMS first
  const cmsResult = await getPressDetail(slug, locale);
  if (cmsResult) {
    const baseUrl = 'https://forever-clinic-myeongdong.com';
    return (
      <>
        <JsonLd
          data={getArticleJsonLd({
            title: cmsResult.article.title,
            date: cmsResult.article.date,
            description: cmsResult.article.content.slice(0, 160),
            url: `${baseUrl}/${locale}/media/press/${cmsResult.article.slug}`,
          })}
        />
        <ArticleDetail
          article={cmsResult.article}
          prevArticle={cmsResult.prevArticle}
          nextArticle={cmsResult.nextArticle}
          basePath={`/${locale}/media/press`}
          locale={locale}
        />
      </>
    );
  }

  // Fallback to hardcoded data
  const index = FALLBACK_ARTICLES.findIndex((a) => a.slug === slug);
  if (index === -1) notFound();

  const article = FALLBACK_ARTICLES[index];
  const prevArticle =
    index < FALLBACK_ARTICLES.length - 1 ? FALLBACK_ARTICLES[index + 1] : null;
  const nextArticle = index > 0 ? FALLBACK_ARTICLES[index - 1] : null;

  const baseUrl = 'https://forever-clinic-myeongdong.com';

  return (
    <>
      <JsonLd
        data={getArticleJsonLd({
          title: article.title,
          date: article.date,
          description: article.content.slice(0, 160),
          url: `${baseUrl}/${locale}/media/press/${article.slug}`,
        })}
      />
      <ArticleDetail
        article={article}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        basePath={`/${locale}/media/press`}
        locale={locale}
      />
    </>
  );
}
