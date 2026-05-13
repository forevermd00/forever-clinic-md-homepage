// Notion 시술 DB에서 추출한 실제 데이터 (2026-05-06 기준)
// Notion: https://www.notion.so/hyperbasak/29c94c3c71dd408fa7984d99300aaf7d
// 가격 미확인 → [임시가격], 기타 미확인 항목 → [임시 데이터]
// TODO: Sanity 전환 후 이 파일의 정적 데이터 제거 예정

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
    treatments: [
      {
        name: '울쎄라피 프라임',
        slug: 'ultherapy-prime',
        category: 'lifting-laser',
        price: '₩1,500,000~ [임시가격]',
        priceNumeric: 1500000,
        hasEvent: true,
        description:
          'FDA 승인 초음파 리프팅 장비로, DeepSEE™ 실시간 영상 가이드 하에 SMAS 근막층까지 에너지를 전달합니다. 절개 없이 자연스러운 리프팅 효과를 제공합니다.',
        duration: '60~90분',
        anesthesia: '도포 마취 (선택)',
        recovery: '즉시 일상 가능',
        recommended: '전문의 상담 후 결정',
      },
      {
        name: '온다리프팅',
        slug: 'onda-lifting',
        category: 'lifting-laser',
        price: '₩600,000~ [임시가격]',
        priceNumeric: 600000,
        description:
          'Coolwaves 특허 기술의 마이크로파 에너지를 활용한 비침습 리프팅·바디 컨투어링 시술입니다. 내장 냉각 시스템으로 표피를 보호하며 깊은 층에 에너지를 전달합니다.',
        duration: '20~30분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '[임시 데이터]',
      },
      {
        name: '슈링크 유니버스',
        slug: 'shrink-universe',
        category: 'lifting-laser',
        price: '₩300,000~ [임시가격]',
        priceNumeric: 300000,
        hasEvent: true,
        description:
          'HIFU 기술을 활용한 초음파 리프팅으로, 피부 진피층과 SMAS층에 열 에너지를 전달하여 콜라겐 생성을 촉진합니다.',
        duration: '30~40분',
        anesthesia: '도포 마취 (선택)',
        recovery: '즉시 일상 가능',
        recommended: '3~6개월 간격',
      },
      {
        name: '티타늄',
        slug: 'titanium',
        category: 'lifting-laser',
        price: '₩400,000~ [임시가격]',
        priceNumeric: 400000,
        description:
          'MPT(Micro-Pulsed Technology) 기반 HIFU 시술로, 10종 교체형 카트리지를 통해 깊이별 맞춤 리프팅이 가능합니다. 기존 HIFU 대비 빠른 시술 속도가 장점입니다.',
        duration: '[임시 데이터]',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '[임시 데이터]',
      },
      {
        name: '써마지 FLX',
        slug: 'thermage-flx',
        category: 'lifting-laser',
        price: '₩1,200,000~ [임시가격]',
        priceNumeric: 1200000,
        description:
          'AccuREP 기술이 탑재된 4세대 단극성 RF 리프팅 장비입니다. 매 펄스마다 피부 임피던스를 측정하여 에너지를 자동 조절하며, 시술 후 콜라겐이 지속적으로 재생됩니다.',
        duration: '30~60분',
        anesthesia: '진동 마취',
        recovery: '즉시 일상 가능',
        recommended: '1년 간격',
      },
      {
        name: '루카스토닝',
        slug: 'lucas-toning',
        category: 'lifting-laser',
        price: '₩150,000~ [임시가격]',
        priceNumeric: 150000,
        description:
          '[임시 데이터] 1064nm Nd:YAG 레이저를 활용한 토닝 시술로, 기미·색소·피부톤 불균형을 개선합니다.',
        duration: '15~20분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '2주 간격',
      },
      {
        name: '피코토닝 (피코K)',
        slug: 'pico-toning',
        category: 'lifting-laser',
        price: '₩150,000~ [임시가격]',
        priceNumeric: 150000,
        description:
          '[임시 데이터] 피코초 단위 레이저로 멜라닌 색소를 미세하게 파괴하여 기미·잡티·색소침착을 개선합니다.',
        duration: '15~20분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '2~4주 간격',
      },
      {
        name: '하이쿡스',
        slug: 'highcox',
        category: 'lifting-laser',
        price: '₩300,000~ [임시가격]',
        priceNumeric: 300000,
        description:
          '[임시 데이터] 고강도 레이저 에너지를 활용한 피부 재생·리프팅 시술입니다.',
        duration: '[임시 데이터]',
        anesthesia: '[임시 데이터]',
        recovery: '[임시 데이터]',
        recommended: '[임시 데이터]',
      },
      {
        name: '악센토',
        slug: 'accento',
        category: 'lifting-laser',
        price: '₩300,000~ [임시가격]',
        priceNumeric: 300000,
        description:
          '[임시 데이터] RF 에너지를 활용한 피부 탄력 개선 시술입니다.',
        duration: '[임시 데이터]',
        anesthesia: '[임시 데이터]',
        recovery: '[임시 데이터]',
        recommended: '[임시 데이터]',
      },
      {
        name: '세르프',
        slug: 'serf',
        category: 'lifting-laser',
        price: '₩250,000~ [임시가격]',
        priceNumeric: 250000,
        description:
          '[임시 데이터] RF 에너지와 초음파를 결합한 복합 피부 개선 시술입니다.',
        duration: '[임시 데이터]',
        anesthesia: '[임시 데이터]',
        recovery: '[임시 데이터]',
        recommended: '[임시 데이터]',
      },
      {
        name: '포텐자',
        slug: 'potenza',
        category: 'lifting-laser',
        price: '₩350,000~ [임시가격]',
        priceNumeric: 350000,
        description:
          '미세 바늘(Microneedle)과 4가지 RF 모드를 결합한 최소 침습 시술입니다. Fusion Tip으로 약물을 깊은 층에 전달하며, 모공·흉터·탄력 개선에 효과적입니다.',
        duration: '30~45분',
        anesthesia: '도포 마취',
        recovery: '수일 내 자연 회복',
        recommended: '[임시 데이터]',
      },
    ],
  },
  {
    slug: 'petit-lifting',
    label: '쁘띠 & 실리프팅',
    labelEn: 'Petit & Thread Lifting',
    labelZh: '微整形 & 线雕',
    labelJa: 'プチ整形 & スレッドリフト',
    description: '주사·실을 이용한 즉각적인 리프팅 및 볼륨 개선 시술',
    bgColor: 'bg-[#f9f6f3]',
    treatments: [
      {
        name: '보톡스 (국산/해외)',
        slug: 'botox',
        category: 'petit-lifting',
        price: '₩100,000~ [임시가격]',
        priceNumeric: 100000,
        hasEvent: true,
        description:
          '[임시 데이터] 보툴리눔 톡신을 이용한 주름 개선 시술입니다. 이마·미간·눈가 등의 표정 주름을 효과적으로 완화합니다. 국산/해외 제품 중 선택 가능합니다.',
        duration: '10~15분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '3~6개월 간격',
      },
      {
        name: '실리프팅',
        slug: 'thread-lifting',
        category: 'petit-lifting',
        price: '₩500,000~ [임시가격]',
        priceNumeric: 500000,
        description:
          '[임시 데이터] 특수 흡수성 실을 이용한 즉각적 리프팅 시술입니다. 실이 피부를 물리적으로 끌어올리며 콜라겐 생성도 유도합니다.',
        duration: '30~60분',
        anesthesia: '도포 마취 + 국소 마취',
        recovery: '2~3일',
        recommended: '1~2년 간격',
      },
      {
        name: '필러 (벨로테로/쥬비덤)',
        slug: 'filler',
        category: 'petit-lifting',
        price: '₩300,000~ [임시가격]',
        priceNumeric: 300000,
        description:
          '[임시 데이터] 히알루론산 필러(벨로테로/쥬비덤)를 이용한 볼륨 개선 시술입니다. 팔자주름·볼·턱 등에 자연스러운 볼륨을 채웁니다.',
        duration: '15~30분',
        anesthesia: '도포 마취',
        recovery: '1~3일',
        recommended: '6개월~1년 간격',
      },
      {
        name: '지방분해주사',
        slug: 'fat-dissolving',
        category: 'petit-lifting',
        price: '₩100,000~ [임시가격]',
        priceNumeric: 100000,
        description:
          '[임시 데이터] 지방 분해 성분을 직접 주사하여 부분 비만을 개선하는 시술입니다. 이중턱·볼살·팔 등에 효과적입니다.',
        duration: '15~20분',
        anesthesia: '불필요',
        recovery: '1~2일',
        recommended: '2~4주 간격',
      },
      {
        name: '스킨보톡스',
        slug: 'skin-botox',
        category: 'petit-lifting',
        price: '₩200,000~ [임시가격]',
        priceNumeric: 200000,
        description:
          '[임시 데이터] 소량의 보톡스를 피부 진피층에 주사하여 모공 축소와 피부결 개선 효과를 줍니다.',
        duration: '20~30분',
        anesthesia: '도포 마취',
        recovery: '즉시 일상 가능',
        recommended: '3~4개월 간격',
      },
    ],
  },
  {
    slug: 'skincare',
    label: '스킨케어',
    labelEn: 'Skincare',
    labelZh: '皮肤护理',
    labelJa: 'スキンケア',
    description: '피부 보습·재생·결 개선을 위한 전문 피부 관리 시술',
    bgColor: 'bg-white',
    treatments: [
      {
        name: '하이드로페이셜',
        slug: 'hydrofacial',
        category: 'skincare',
        price: '₩150,000~ [임시가격]',
        priceNumeric: 150000,
        description:
          '[임시 데이터] 클렌징·각질 제거·수분 공급을 동시에 진행하는 3단계 피부 관리 시술입니다. 시술 직후 즉각적인 광채 효과를 확인할 수 있습니다.',
        duration: '30~45분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '2~4주 간격',
      },
      {
        name: '인텐스울트라',
        slug: 'intense-ultra',
        category: 'skincare',
        price: '₩200,000~ [임시가격]',
        priceNumeric: 200000,
        description:
          '[임시 데이터] 고강도 초음파를 활용한 피부 관리 시술로, 세포 재생과 보습을 동시에 개선합니다.',
        duration: '20~30분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '2~4주 간격',
      },
      {
        name: '아쿠아필',
        slug: 'aquapeel',
        category: 'skincare',
        price: '₩100,000~ [임시가격]',
        priceNumeric: 100000,
        description:
          '[임시 데이터] 물과 산소를 이용한 수분 필링 시술로, 모공 속 노폐물을 제거하고 피부 결을 부드럽게 개선합니다.',
        duration: '30분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '2~4주 간격',
      },
    ],
  },
  {
    slug: 'skin-booster',
    label: '스킨부스터',
    labelEn: 'Skin Booster',
    labelZh: '皮肤水光',
    labelJa: 'スキンブースター',
    description: '피부 속 콜라겐 생성을 유도하는 차세대 부스터 주사 시술',
    bgColor: 'bg-[#f9f6f3]',
    treatments: [
      {
        name: '고우리 (GOURI)',
        slug: 'gouri',
        category: 'skin-booster',
        price: '₩400,000~ [임시가격]',
        priceNumeric: 400000,
        hasEvent: true,
        description:
          '세계 최초 완전 액상형 PCL(폴리카프로락톤) 콜라겐 부스터입니다. CESABP 특허 기술로 주입 후 얼굴 전체에 균일하게 확산되며 자가 콜라겐 생성을 유도합니다.',
        duration: '짧은 시술 시간',
        anesthesia: '도포 마취 (선택)',
        recovery: '즉시 일상 가능',
        recommended: '[임시 데이터]',
      },
      {
        name: '스컬트라',
        slug: 'sculptra',
        category: 'skin-booster',
        price: '₩500,000~ [임시가격]',
        priceNumeric: 500000,
        description:
          '[임시 데이터] PLLA(폴리-L-락트산) 성분으로 콜라겐 생성을 장기간 유도하는 볼륨 부스터 시술입니다. 자연스러운 볼륨 회복 효과가 특징입니다.',
        duration: '20~30분',
        anesthesia: '도포 마취',
        recovery: '1~2일',
        recommended: '2~3회 시술',
      },
      {
        name: '래디어스',
        slug: 'radiesse',
        category: 'skin-booster',
        price: '₩400,000~ [임시가격]',
        priceNumeric: 400000,
        description:
          '[임시 데이터] CaHA(수산화칼슘) 성분 기반의 볼륨 필러로, 즉각적인 볼륨과 장기 콜라겐 생성 효과를 함께 제공합니다.',
        duration: '15~30분',
        anesthesia: '도포 마취',
        recovery: '1~3일',
        recommended: '1~1.5년 간격',
      },
      {
        name: '메타셀 (줄기세포)',
        slug: 'metacell',
        category: 'skin-booster',
        price: '₩300,000~ [임시가격]',
        priceNumeric: 300000,
        description:
          '[임시 데이터] 줄기세포 유래 성분을 활용한 피부 재생 부스터 시술입니다. 피부 탄력과 재생력을 높입니다.',
        duration: '[임시 데이터]',
        anesthesia: '[임시 데이터]',
        recovery: '[임시 데이터]',
        recommended: '[임시 데이터]',
      },
    ],
  },
  {
    slug: 'hair-removal',
    label: '제모클리닉',
    labelEn: 'Hair Removal',
    labelZh: '脱毛诊所',
    labelJa: '脱毛クリニック',
    description: '전신 레이저 제모 전문 클리닉',
    bgColor: 'bg-white',
    treatments: [
      {
        name: '젠틀맥스프로플러스',
        slug: 'gentle-max-pro-plus',
        category: 'hair-removal',
        price: '₩100,000~ [임시가격]',
        priceNumeric: 100000,
        description:
          '755nm 알렉산드라이트 + 1064nm Nd:YAG 듀얼 파장 레이저 제모 장비입니다. DCD 냉각 시스템으로 통증을 최소화하며, 모든 피부 타입과 전신 제모에 적용 가능합니다.',
        duration: '부위별 수분~1시간',
        anesthesia: 'DCD 냉각 시스템',
        recovery: '즉시 일상 가능',
        recommended: '4~8주 간격, 6~8회',
      },
    ],
  },
  {
    slug: 'anesthesia',
    label: '마취클리닉',
    labelEn: 'Anesthesia Clinic',
    labelZh: '镇静诊所',
    labelJa: '麻酔クリニック',
    description: '안전하고 편안한 시술을 위한 전문 마취 서비스',
    bgColor: 'bg-[#f9f6f3]',
    treatments: [
      {
        name: '수면마취',
        slug: 'sleep-anesthesia',
        category: 'anesthesia',
        price: '[임시가격]',
        priceNumeric: 0,
        description:
          '[임시 데이터] 전신 수면마취를 통해 시술 중 통증과 불안감 없이 편안하게 시술받을 수 있는 서비스입니다.',
        duration: '[임시 데이터]',
        anesthesia: '수면마취',
        recovery: '[임시 데이터]',
        recommended: '[임시 데이터]',
      },
      {
        name: '에어녹스 (반수면마취)',
        slug: 'airknox',
        category: 'anesthesia',
        price: '[임시가격]',
        priceNumeric: 0,
        description:
          '[임시 데이터] 반수면 상태에서 진행되는 마취 서비스로, 완전 수면마취보다 회복이 빠르면서도 시술 중 통증을 최소화합니다.',
        duration: '[임시 데이터]',
        anesthesia: '반수면마취',
        recovery: '[임시 데이터]',
        recommended: '[임시 데이터]',
      },
    ],
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
