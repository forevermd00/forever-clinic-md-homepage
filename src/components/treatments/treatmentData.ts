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
  descriptionEn?: string;
  descriptionZh?: string;
  descriptionJa?: string;
  bgColor: string;
  treatments: Treatment[];
}

export function getCategoryLabel(
  cat: TreatmentCategory,
  locale: string,
): string {
  if (locale === 'en') return cat.labelEn;
  if (locale === 'zh') return cat.labelZh ?? cat.labelEn;
  if (locale === 'ja') return cat.labelJa ?? cat.labelEn;
  return cat.label;
}

export function getCategoryDescription(
  cat: TreatmentCategory,
  locale: string,
): string {
  if (locale === 'en') return cat.descriptionEn ?? cat.description;
  if (locale === 'zh')
    return cat.descriptionZh ?? cat.descriptionEn ?? cat.description;
  if (locale === 'ja')
    return cat.descriptionJa ?? cat.descriptionEn ?? cat.description;
  return cat.description;
}

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  {
    slug: 'signature',
    label: '시그니처',
    labelEn: 'Signature',
    labelZh: '招牌项目',
    labelJa: 'シグネチャー',
    description: '복수 시술을 결합한 포에버 시그니처 패키지 프로그램',
    descriptionEn:
      'Forever signature package programs combining multiple treatments',
    descriptionZh: '结合多项疗程的Forever招牌套餐项目',
    descriptionJa:
      '複数の施術を組み合わせたフォーエバーシグネチャーパッケージプログラム',
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
    descriptionEn:
      'Treatments that firm and lift the skin using ultrasound, radiofrequency, and laser energy',
    descriptionZh: '通过超声波、射频、激光能量提升皮肤弹力的疗程',
    descriptionJa:
      '超音波・高周波・レーザーエネルギーで肌の弾力を引き上げる施術',
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
    descriptionEn:
      'Immediate lifting and volume enhancement treatments using injections and threads',
    descriptionZh: '利用注射和线雕进行即时提拉和改善容量的疗程',
    descriptionJa:
      '注射・糸を使った即効性のあるリフティングおよびボリューム改善施術',
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
    descriptionEn:
      'Professional skincare treatments for hydration, regeneration, and skin texture improvement',
    descriptionZh: '专业皮肤管理疗程，改善肌肤水分、再生和肤质',
    descriptionJa: '肌の保湿・再生・キメ改善のための専門スキンケア施術',
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
    descriptionEn:
      'Next-generation booster injection treatments that stimulate collagen production in the skin',
    descriptionZh: '促进皮肤内胶原蛋白生成的新一代水光注射疗程',
    descriptionJa: '肌のコラーゲン生成を促す次世代ブースター注射施術',
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
    descriptionEn: 'Specialized full-body laser hair removal clinic',
    descriptionZh: '专业全身激光脱毛诊所',
    descriptionJa: '全身レーザー脱毛専門クリニック',
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
    descriptionEn:
      'Professional anesthesia service for safe and comfortable procedures',
    descriptionZh: '为安全舒适的治疗提供专业麻醉服务',
    descriptionJa: '安全で快適な施術のための専門麻酔サービス',
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
