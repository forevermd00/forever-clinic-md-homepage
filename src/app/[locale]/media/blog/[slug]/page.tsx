import { notFound } from 'next/navigation';
import { ArticleDetail } from '@/components/media/ArticleDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { getArticleJsonLd } from '@/lib/seo/jsonld';

const posts = [
  {
    slug: 'spring-skincare-tips',
    title: '봄철 피부 관리 꿀팁 5가지',
    date: '2026.04.18',
    content: `환절기 피부 트러블을 예방하고 건강한 피부를 유지하는 방법을 소개합니다.\n\n1. 자외선 차단제 꼼꼼히 바르기\n봄볕은 생각보다 강합니다. SPF 50 이상의 자외선 차단제를 2~3시간 간격으로 덧발라주세요.\n\n2. 보습은 가벼운 제형으로 전환\n겨울용 크림에서 로션이나 에센스 타입으로 교체하여 피부 부담을 줄이세요.\n\n3. 꽃가루 시즌 클렌징 강화\n외출 후 이중 세안으로 모공 속 미세먼지와 꽃가루를 제거해주세요.\n\n4. 각질 관리 주 1~2회\n과도한 각질 제거는 피하되, 부드러운 효소 클렌저로 정기 관리하세요.\n\n5. 수분 섭취 늘리기\n하루 8잔 이상의 물을 마시면 피부 수분 밸런스 유지에 도움됩니다.`,
  },
  {
    slug: 'exosome-explained',
    title: '엑소좀 시술이란? — 원리부터 효과까지',
    date: '2026.03.30',
    content: `최근 주목받고 있는 엑소좀 시술의 원리와 기대 효과에 대해 알려드립니다.\n\n■ 엑소좀이란?\n세포가 분비하는 나노 크기의 소포체로, 세포 간 신호 전달 역할을 합니다. 피부에 적용하면 콜라겐 생성을 촉진하고 피부 재생을 돕습니다.\n\n■ 시술 과정\n1. 피부 상태 분석 및 상담\n2. 마이크로니들 또는 레이저로 피부 경로 확보\n3. 엑소좀 용액 도포 및 침투\n4. 진정 마스크 적용\n\n■ 기대 효과\n- 피부 탄력 개선\n- 잔주름 감소\n- 피부결 정돈\n- 색소 개선\n\n■ 시술 후 관리\n시술 당일은 세안을 피하고, 48시간 동안 자외선 차단에 신경 써주세요.`,
  },
  {
    slug: 'lifting-comparison',
    title: '울쎄라 vs 써마지 — 어떤 리프팅이 나에게 맞을까?',
    date: '2026.03.05',
    content: `대표적인 비수술 리프팅 시술인 울쎄라와 써마지의 차이점을 비교합니다.\n\n■ 울쎄라 (Ultherapy)\n- 원리: 고밀도 초음파(MFU)로 SMAS층에 에너지 전달\n- 장점: 깊은 리프팅 효과, FDA 승인\n- 적합: 처진 피부, 턱선 개선, 이중턱\n- 지속: 12~18개월\n\n■ 써마지 FLX (Thermage)\n- 원리: RF 에너지로 진피층 콜라겐 재생\n- 장점: 피부 타이트닝, 모공 축소\n- 적합: 피부 탄력 저하, 전체적 타이트닝\n- 지속: 6~12개월\n\n■ 어떻게 선택할까?\n- 처진 정도가 심하다면 → 울쎄라\n- 전체적 탄력이 필요하다면 → 써마지\n- 둘 다 필요하다면 → 콤보 시술 추천\n\n정확한 진단은 전문의 상담을 통해 결정하시는 것을 권장합니다.`,
  },
];

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) notFound();

  const article = posts[index];
  const prevArticle = index < posts.length - 1 ? posts[index + 1] : null;
  const nextArticle = index > 0 ? posts[index - 1] : null;

  const baseUrl = 'https://forever-clinic-myeongdong.com';

  return (
    <>
      <JsonLd
        data={getArticleJsonLd({
          title: article.title,
          date: article.date,
          description: article.content.slice(0, 160),
          url: `${baseUrl}/${locale}/media/blog/${article.slug}`,
        })}
      />
      <ArticleDetail
        article={article}
        prevArticle={prevArticle}
        nextArticle={nextArticle}
        basePath={`/${locale}/media/blog`}
        locale={locale}
      />
    </>
  );
}
