import { sanityFetch } from '@/lib/sanity/fetch';
import {
  signatureProgramsQuery,
  signatureProgramBySlugQuery,
} from '@/lib/sanity/queries';

export type SignatureProgram = {
  _id: string;
  slug?: string;
  name: string;
  keywords: string;
  position: string;
  originalPrice: number;
  discountedPrice: number;
  discountRate: number;
  description?: string;
  composition?: string;
  category?: string;
};

const FALLBACK_PROGRAMS: SignatureProgram[] = [
  {
    _id: 'signature-program-1',
    category: 'signature',
    slug: 'ai-signature-lifting',
    name: '포에버 AI 시그니처 리프팅',
    keywords: '강한 리프팅 · 턱라인 · 심부볼 · 팔자 처짐',
    position: 'AI 진단 기반 얼굴 전체 구조적 리프팅',
    originalPrice: 7000000,
    discountedPrice: 5950000,
    discountRate: 15,
    description:
      'AI 진단 기반으로 분석해, 얼굴 전체 구조 리프팅과 탄탄한 피부 밀도감을 동시에 설계하는 프리미엄 시그니처 리프팅 프로그램',
    composition:
      '이브뮤즈 AI 피부진단 + 수면 + 울쎄라피 프라임 600샷 + 써마지 600샷 + 티타늄 40KJ + LDM 12분 + 줄기세포 부스터 또는 맞춤수액 중 선택 (*샷수 추가 가능: 울쎄라피 ~1000샷, 써마지 ~900샷)',
  },
  {
    _id: 'signature-program-2',
    category: 'signature',
    slug: 'signature-design-filler',
    name: '포에버 시그니처 디자인 필러',
    keywords: '꺼진 볼 · 눈밑·눈물고랑 · 비대칭',
    position: '풀페이스 볼륨·비율 리모델링',
    originalPrice: 5000000,
    discountedPrice: 4500000,
    discountRate: 10,
    description:
      '꺼진 볼륨과 불균형한 얼굴선을 얼굴형에 맞춰 정교하게 보완해, 자연스러운 풀페이스 볼륨과 고급스러운 동안 이미지를 완성하는 디자인 필러 프로그램. 시술은 모두 원장님의 직접 상담 및 디자인으로 진행되고, 수입필러로 용량제한 없이 필요한 용량만큼만 시술됩니다.',
    composition:
      '원장 직접 상담 및 디자인 + 수입필러(벨로테로/쥬비덤) 용량 제한 없이 맞춤 적용',
  },
  {
    _id: 'signature-program-3',
    category: 'signature',
    slug: 'signature-design-lift',
    name: '포에버 시그니처 디자인 리프트',
    keywords: '턱라인 · 팔자주름 · 마리오네트 · 눈밑',
    position: '즉각적 리프팅, 하관 중심 퀵 리프팅',
    originalPrice: 4400000,
    discountedPrice: 3390000,
    discountRate: 23,
    description:
      '수술 부담은 줄이고 빠른 리프팅 체감 효과를 높여, 탄탄한 얼굴선과 정리된 하관 인상을 만들어주는 퀵 리프팅 패키지',
    composition:
      '실리프팅 8줄 + 눈밑필러 + 팔자주름 잼버실 4줄 + 소프웨이브 턱선 100펄스',
  },
  {
    _id: 'signature-program-4',
    category: 'signature',
    slug: 'ai-poreless-lift',
    name: '포에버 AI 포어리스 리프트',
    keywords: '모공 · 블랙헤드 · 피지 · 피부결 · 얕은 흉터',
    position: '모공·피부결·탄력 복합 개선',
    originalPrice: 3000000,
    discountedPrice: 2180000,
    discountRate: 27,
    description:
      '당일 일상복귀가 가능한 여행 중 피부 부스팅 프로그램으로, 늘어진 탄력형 모공과 피부결을 리셋하고 수분광까지 회복시키는 프리미엄 토탈케어',
    composition:
      '울쎄라피 프라임 400샷 + 포텐자 펌핑팁 + 쥬베룩 4cc + 풀페이스 스킨보톡스(앨러간) + 하이드로페이셜 또는 커스텀 스킨케어',
  },
  {
    _id: 'signature-program-5',
    category: 'signature',
    slug: 'men-total-reboot',
    name: '포에버 MEN 토탈 리부트',
    keywords: '턱라인 · 모공 · 피지 · 피부탄력 · 주름 (남성 전용)',
    position: '남성 전용 하관·피부 리셋',
    originalPrice: 3600000,
    discountedPrice: 3200000,
    discountRate: 11,
    description:
      '넓고 거친 모공과 번들거리는 과다 피지를 정리하고, 남성형 페이스 컨투어 개선과 남자다운 입체감 회복을 통해 꾸민 티 없이 깔끔하고 선명한 인상을 만들어주는 맨즈 토탈 리부트 프로그램',
    composition:
      '울쎄라피 프라임 400샷 + 온다 10만줄 + 래디어스 OR 고우리 1실린지 + 맨즈 3종 보톡스(턱선, 모공, 미간) + 하이드로페이셜 또는 커스텀 스킨케어',
  },
];

export async function getSignaturePrograms(
  locale: string,
): Promise<SignatureProgram[]> {
  const data = await sanityFetch<SignatureProgram[]>(signatureProgramsQuery, {
    locale,
  });
  if (!data || data.length === 0) return FALLBACK_PROGRAMS;
  return data;
}

export async function getSignatureProgramBySlug(
  slug: string,
  locale: string,
): Promise<SignatureProgram | null> {
  const data = await sanityFetch<SignatureProgram | null>(
    signatureProgramBySlugQuery,
    { slug, locale },
  );
  if (!data) {
    // Fallback: slug으로 검색
    return FALLBACK_PROGRAMS.find((p) => p.slug === slug) ?? null;
  }
  return data;
}
