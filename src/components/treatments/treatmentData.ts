export interface Treatment {
  name: string;
  slug: string;
  category: string;
  price: string;
  priceNumeric: number;
  hasEvent?: boolean;
  description: string;
  duration: string;
  anesthesia: string;
  recovery: string;
  recommended: string;
}

export interface TreatmentCategory {
  slug: string;
  label: string;
  labelEn: string;
  description: string;
  bgColor: string;
  treatments: Treatment[];
}

export const TREATMENT_CATEGORIES: TreatmentCategory[] = [
  {
    slug: 'lifting',
    label: '리프팅',
    labelEn: 'Lifting',
    description: '처진 피부를 끌어올려 탄력 있는 윤곽을 되찾는 시술',
    bgColor: 'bg-white',
    treatments: [
      {
        name: '울쎄라',
        slug: 'ulthera',
        category: 'lifting',
        price: '₩1,500,000~',
        priceNumeric: 1500000,
        hasEvent: true,
        description:
          'FDA 승인 초음파 리프팅 장비로, SMAS 근막층까지 에너지를 전달하여 피부 깊은 곳부터 탄력을 회복시킵니다. 자연스러운 리프팅 효과가 6개월~1년 지속됩니다.',
        duration: '60~90분',
        anesthesia: '도포 마취',
        recovery: '즉시 일상 가능',
        recommended: '6개월~1년 간격',
      },
      {
        name: '써마지 FLX',
        slug: 'thermage-flx',
        category: 'lifting',
        price: '₩1,200,000~',
        priceNumeric: 1200000,
        description:
          '고주파 에너지로 콜라겐 리모델링을 유도하는 비침습 리프팅 시술입니다. 시술 직후부터 타이트닝 효과를 느낄 수 있으며, 시간이 지날수록 효과가 증가합니다.',
        duration: '40~60분',
        anesthesia: '진동 마취',
        recovery: '즉시 일상 가능',
        recommended: '1년 간격',
      },
      {
        name: '슈링크 유니버스',
        slug: 'shrink-universe',
        category: 'lifting',
        price: '₩300,000~',
        priceNumeric: 300000,
        hasEvent: true,
        description:
          'HIFU 기술을 활용한 초음파 리프팅으로, 피부 진피층과 SMAS층에 열 에너지를 전달하여 콜라겐 생성을 촉진합니다. 부담 없는 가격으로 꾸준한 관리가 가능합니다.',
        duration: '30~40분',
        anesthesia: '도포 마취 (선택)',
        recovery: '즉시 일상 가능',
        recommended: '3~6개월 간격',
      },
      {
        name: '인모드',
        slug: 'inmode',
        category: 'lifting',
        price: '₩500,000~',
        priceNumeric: 500000,
        description:
          'RF(고주파) 에너지를 활용한 리프팅 시술로, 피부 탄력 개선과 지방 감소를 동시에 기대할 수 있습니다. 얼굴 윤곽 개선에 효과적입니다.',
        duration: '30~40분',
        anesthesia: '도포 마취',
        recovery: '즉시 일상 가능',
        recommended: '4~6주 간격, 3~5회',
      },
    ],
  },
  {
    slug: 'skincare',
    label: '피부케어',
    labelEn: 'Skincare',
    description: '피부 재생과 탄력을 위한 프리미엄 피부 관리 시술',
    bgColor: 'bg-[#f9f6f3]',
    treatments: [
      {
        name: '실펌X',
        slug: 'sylfirm-x',
        category: 'skincare',
        price: '₩300,000~',
        priceNumeric: 300000,
        description:
          '반복 펄스 기술을 적용한 마이크로니들 RF 시술로, 기미·홍조·모공·흉터 등 다양한 피부 고민을 개선합니다. 진피층 콜라겐 리모델링을 유도합니다.',
        duration: '30~40분',
        anesthesia: '도포 마취',
        recovery: '1~2일',
        recommended: '4주 간격, 3~5회',
      },
      {
        name: 'LDM',
        slug: 'ldm',
        category: 'skincare',
        price: '₩150,000~',
        priceNumeric: 150000,
        description:
          '초음파 듀얼 주파수를 활용한 피부 관리 시술로, 세포 재생과 보습을 동시에 개선합니다. 민감한 피부에도 부담 없이 시술 가능합니다.',
        duration: '20~30분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '2~4주 간격',
      },
      {
        name: '더마브이',
        slug: 'derma-v',
        category: 'skincare',
        price: '₩200,000~',
        priceNumeric: 200000,
        hasEvent: true,
        description:
          '혈관 레이저를 활용한 피부 톤 개선 시술로, 홍조·혈관 확장·여드름 자국 등을 효과적으로 치료합니다. 피부 전체적인 톤을 밝게 개선합니다.',
        duration: '20~30분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '3~4주 간격, 3~5회',
      },
      {
        name: '세르프',
        slug: 'serf',
        category: 'skincare',
        price: '₩250,000~',
        priceNumeric: 250000,
        description:
          'RF 에너지와 마이크로니들을 결합한 피부 재생 시술로, 모공·흉터·피부결 개선에 효과적입니다. 시술 후 빠른 회복이 가능합니다.',
        duration: '30~40분',
        anesthesia: '도포 마취',
        recovery: '1~2일',
        recommended: '4주 간격, 3~5회',
      },
    ],
  },
  {
    slug: 'toning',
    label: '토닝/색소',
    labelEn: 'Toning & Pigment',
    description: '맑고 균일한 피부톤을 위한 색소 개선 시술',
    bgColor: 'bg-white',
    treatments: [
      {
        name: '피코토닝',
        slug: 'pico-toning',
        category: 'toning',
        price: '₩150,000~',
        priceNumeric: 150000,
        description:
          '피코초 단위 레이저로 멜라닌 색소를 미세하게 파괴하여 기미·잡티·색소침착을 개선합니다. 피부 톤을 전체적으로 밝고 균일하게 만들어줍니다.',
        duration: '15~20분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '2~4주 간격, 5~10회',
      },
      {
        name: '루카스토닝',
        slug: 'lucas-toning',
        category: 'toning',
        price: '₩200,000~',
        priceNumeric: 200000,
        hasEvent: true,
        description:
          '1064nm 파장의 Nd:YAG 레이저를 활용한 토닝 시술로, 기미·색소·피부톤 불균형을 개선합니다. 낮은 에너지로 안전하고 꾸준한 관리가 가능합니다.',
        duration: '15~20분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '2주 간격, 10회 이상',
      },
    ],
  },
  {
    slug: 'botox-filler',
    label: '보톡스/필러',
    labelEn: 'Botox & Filler',
    description: '자연스러운 볼륨과 주름 개선을 위한 주사 시술',
    bgColor: 'bg-[#f9f6f3]',
    treatments: [
      {
        name: '보톡스',
        slug: 'botox',
        category: 'botox-filler',
        price: '₩100,000~',
        priceNumeric: 100000,
        description:
          '보툴리눔 톡신을 이용한 주름 개선 시술로, 이마·미간·눈가 등의 표정 주름을 효과적으로 완화합니다. 시술 시간이 짧고 일상 복귀가 즉시 가능합니다.',
        duration: '10~15분',
        anesthesia: '불필요',
        recovery: '즉시 일상 가능',
        recommended: '3~6개월 간격',
      },
      {
        name: '필러',
        slug: 'filler',
        category: 'botox-filler',
        price: '₩300,000~',
        priceNumeric: 300000,
        description:
          '히알루론산 기반 필러를 이용한 볼륨 개선 시술로, 팔자주름·볼·턱 등에 자연스러운 볼륨을 채워줍니다. 즉각적인 효과를 확인할 수 있습니다.',
        duration: '15~30분',
        anesthesia: '도포 마취 / 신경 차단 마취',
        recovery: '1~3일 (부기)',
        recommended: '6개월~1년 간격',
      },
      {
        name: '스킨보톡스',
        slug: 'skin-botox',
        category: 'botox-filler',
        price: '₩200,000~',
        priceNumeric: 200000,
        hasEvent: true,
        description:
          '소량의 보톡스를 피부 진피층에 주사하여 모공 축소와 피부결 개선 효과를 줍니다. 피부 전체의 질감을 매끄럽고 탄력 있게 가꿔줍니다.',
        duration: '20~30분',
        anesthesia: '도포 마취',
        recovery: '즉시 일상 가능',
        recommended: '3~4개월 간격',
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
