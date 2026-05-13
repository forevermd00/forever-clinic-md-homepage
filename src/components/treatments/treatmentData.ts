export interface Treatment {
  name: string;
  slug: string;
  category: string;
  price: string;
  priceNumeric: number;
  hasEvent?: boolean;
  hasSignature?: boolean;
  originalPriceNumeric?: number;
  discountRate?: number;
  keywords?: string;
  composition?: string;
  description: string;
  duration: string;
  anesthesia: string;
  recovery: string;
  recommended: string;
  imageUrl?: string;
}

export interface TreatmentCategory {
  slug: string;
  label: string;
  labelEn: string;
  labelZh?: string;
  labelJa?: string;
  description: string;
  bgColor: string;
  treatments: Treatment[];
}

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  {
    slug: 'signature',
    label: '시그니처',
    labelEn: 'Signature',
    labelZh: '招牌项目',
    labelJa: 'シグネチャー',
    description: '복수 시술을 결합한 포에버 시그니처 패키지 프로그램',
    bgColor: 'bg-[#1a1a1a]',
    treatments: [],
  },
  {
    slug: 'lifting-laser',
    label: '리프팅·레이저',
    labelEn: 'Lifting & Laser',
    labelZh: '提拉·激光',
    labelJa: 'リフティング・レーザー',
    description: '초음파·고주파·레이저 에너지로 피부 탄력을 끌어올리는 시술',
    bgColor: 'bg-white',
    treatments: [],
  },
  {
    slug: 'petit-lifting',
    label: '쁘띠 & 실리프팅',
    labelEn: 'Petit & Thread Lifting',
    labelZh: '微整形 & 线雕',
    labelJa: 'プチ整形 & スレッドリフト',
    description: '주사·실을 이용한 즉각적인 리프팅 및 볼륨 개선 시술',
    bgColor: 'bg-[#f9f6f3]',
    treatments: [],
  },
  {
    slug: 'skincare',
    label: '스킨케어',
    labelEn: 'Skincare',
    labelZh: '皮肤护理',
    labelJa: 'スキンケア',
    description: '피부 보습·재생·결 개선을 위한 전문 피부 관리 시술',
    bgColor: 'bg-white',
    treatments: [],
  },
  {
    slug: 'skin-booster',
    label: '스킨부스터',
    labelEn: 'Skin Booster',
    labelZh: '皮肤水光',
    labelJa: 'スキンブースター',
    description: '피부 속 콜라겐 생성을 유도하는 차세대 부스터 주사 시술',
    bgColor: 'bg-[#f9f6f3]',
    treatments: [],
  },
  {
    slug: 'hair-removal',
    label: '제모클리닉',
    labelEn: 'Hair Removal',
    labelZh: '脱毛诊所',
    labelJa: '脱毛クリニック',
    description: '전신 레이저 제모 전문 클리닉',
    bgColor: 'bg-white',
    treatments: [],
  },
  {
    slug: 'anesthesia',
    label: '마취클리닉',
    labelEn: 'Anesthesia Clinic',
    labelZh: '镇静诊所',
    labelJa: '麻酔クリニック',
    description: '안전하고 편안한 시술을 위한 전문 마취 서비스',
    bgColor: 'bg-[#f9f6f3]',
    treatments: [],
  },
];

export function getCategoryBySlug(slug: string): TreatmentCategory | undefined {
  return TREATMENT_CATEGORIES.find((c) => c.slug === slug);
}

export function getTreatmentBySlug(
  categorySlug: string,
  treatmentSlug: string,
): { category: TreatmentCategory; treatment: Treatment } | undefined {
  const category = getCategoryBySlug(categorySlug);
  if (!category) return undefined;
  const treatment = category.treatments.find((t) => t.slug === treatmentSlug);
  if (!treatment) return undefined;
  return { category, treatment };
}
