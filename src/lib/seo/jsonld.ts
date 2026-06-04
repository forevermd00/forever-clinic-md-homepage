import { BASE_URL } from '@/lib/seo/keywords';

// 로케일별 값 선택 헬퍼 (정의되지 않은 로케일은 ko로 폴백)
function byLocale<T>(map: Record<string, T>, locale: string): T {
  return map[locale] ?? map.ko;
}

// MedicalBusiness — used in layout
export function getMedicalBusinessJsonLd(
  locale: string,
  opts?: { phone?: string; sameAs?: string[] },
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': BASE_URL,
    name:
      locale === 'ko'
        ? '포에버의원 명동점'
        : locale === 'en'
          ? 'Forever Clinic Myeongdong'
          : locale === 'zh'
            ? '永恒诊所 明洞'
            : 'フォーエバークリニック 明洞',
    alternateName:
      locale === 'ko'
        ? ['포에버 클리닉 명동', '포에버의원', '포에버클리닉']
        : locale === 'en'
          ? 'Forever Clinic'
          : locale === 'zh'
            ? 'Forever Clinic 永恒诊所'
            : 'Forever Clinic',
    description: byLocale(
      {
        ko: '포에버의원 명동점은 서울 명동에 위치한 피부과로 울쎄라·써마지 리프팅, 보톡스·필러, 스킨케어를 제공합니다. 한국어·영어·중국어·일본어 상담이 가능하며 외국인 환자 진료를 환영합니다.',
        en: 'Forever Clinic Myeongdong is a dermatology clinic in Myeongdong, Seoul, offering Ulthera and Thermage lifting, Botox and filler, and skincare. Consultations are available in Korean, English, Chinese, and Japanese, and international patients are welcome.',
        zh: '永恒诊所明洞店是位于首尔明洞的皮肤科诊所，提供超声刀(Ulthera)·热玛吉(Thermage)提升、肉毒素·填充及皮肤管理。可用韩语·英语·中文·日语咨询，欢迎外国患者就诊。',
        ja: 'フォーエバークリニック明洞店はソウル明洞に位置する皮膚科で、ウルセラ・サーマジェのリフティング、ボトックス・フィラー、スキンケアを提供します。韓国語・英語・中国語・日本語での相談が可能で、外国人患者を歓迎します。',
      },
      locale,
    ),
    url: `${BASE_URL}/${locale}`,
    telephone:
      opts?.phone ?? process.env.NEXT_PUBLIC_CLINIC_PHONE ?? '+82-2-332-8121',
    email: 'contact@forever-clinic.kr',
    address: {
      '@type': 'PostalAddress',
      streetAddress:
        locale === 'ko'
          ? '남대문로 78, 타임워크빌딩 1-2층'
          : locale === 'zh'
            ? '南大门路78号 Timework大厦1-2层'
            : locale === 'ja'
              ? '南大門路78、タイムワークビル1-2階'
              : '78 Namdaemun-ro, 1-2F Timework Building',
      addressLocality:
        locale === 'ko'
          ? '중구'
          : locale === 'zh'
            ? '中区'
            : locale === 'ja'
              ? '中区'
              : 'Jung-gu',
      addressRegion:
        locale === 'ko'
          ? '서울특별시'
          : locale === 'zh'
            ? '首尔特别市'
            : locale === 'ja'
              ? 'ソウル特別市'
              : 'Seoul',
      postalCode: '04533',
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.5606,
      longitude: 126.9782,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '20:30',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday', 'Sunday'],
        opens: '10:00',
        closes: '18:30',
      },
    ],
    medicalSpecialty: 'Dermatology',
    // 외국인 진료 가능 언어
    availableLanguage: ['Korean', 'English', 'Chinese', 'Japanese'],
    // 진료 지역
    areaServed: byLocale(
      {
        ko: ['명동', '서울 중구', '서울'],
        en: ['Myeongdong', 'Jung-gu, Seoul', 'Seoul'],
        zh: ['明洞', '首尔中区', '首尔'],
        ja: ['明洞', 'ソウル中区', 'ソウル'],
      },
      locale,
    ),
    // 강점 시술
    availableService: byLocale<string[]>(
      {
        ko: [
          '울쎄라 리프팅',
          '써마지 리프팅',
          'HIFU 리프팅',
          '보톡스·필러',
          '실리프팅',
          '스킨케어(하이드로페이셜·아쿠아필)',
          '콜라겐 부스터(고우리·스컬트라)',
        ],
        en: [
          'Ulthera Lifting',
          'Thermage Lifting',
          'HIFU Lifting',
          'Botox & Filler',
          'Thread Lifting',
          'Skincare (Hydrofacial & Aqua Peel)',
          'Collagen Booster (Gouri & Sculptra)',
        ],
        zh: [
          '超声刀(Ulthera)提升',
          '热玛吉(Thermage)提升',
          'HIFU提升',
          '肉毒素·填充',
          '线雕提升',
          '皮肤管理(水光焕肤·Aqua Peel)',
          '胶原蛋白再生(Gouri·Sculptra)',
        ],
        ja: [
          'ウルセラリフティング',
          'サーマジェリフティング',
          'HIFUリフティング',
          'ボトックス・フィラー',
          '糸リフティング',
          'スキンケア(ハイドロフェイシャル・アクアピール)',
          'コラーゲンブースター(Gouri・Sculptra)',
        ],
      },
      locale,
    ).map((name) => ({ '@type': 'MedicalProcedure', name })),
    priceRange: '₩₩₩',
    image: `${BASE_URL}/images/heroes/brand-hero.png`,
    sameAs: opts?.sameAs ?? [
      'https://instagram.com/forever_clinic_myeongdong',
      'https://pf.kakao.com/_PxjxmKX',
    ],
  };
}

// Product — for treatment detail pages
export function getTreatmentProductJsonLd(
  treatment: {
    name: string;
    description: string;
    price: number;
    slug: string;
    category: string;
    image?: string;
  },
  locale: string,
) {
  const url = `${BASE_URL}/${locale}/treatments/${treatment.category}/${treatment.slug}`;
  // 이미지: 시술 이미지(절대 URL) 우선, 없으면 브랜드 히어로 폴백
  const imageUrl = treatment.image
    ? treatment.image.startsWith('http')
      ? treatment.image
      : `${BASE_URL}${treatment.image}`
    : `${BASE_URL}/images/heroes/brand-hero.png`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: treatment.name,
    description: treatment.description,
    category: treatment.category,
    url,
    image: [imageUrl],
    offers: {
      '@type': 'Offer',
      price: treatment.price,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      url,
      // 의원 내원 시술 — 별도 배송 없음(무료) 명시
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 0,
          currency: 'KRW',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'KR',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 0,
            unitCode: 'DAY',
          },
        },
      },
      // 의료 시술 — 반품 불가 정책 명시
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'KR',
        returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
      },
    },
    brand: { '@type': 'Brand', name: 'Forever Clinic Myeongdong' },
  };
}

// BreadcrumbList
export function getBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Article — for blog/press
export function getArticleJsonLd(article: {
  title: string;
  date: string;
  description: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    datePublished: article.date,
    description: article.description,
    url: article.url,
    publisher: {
      '@type': 'Organization',
      name: 'Forever Clinic Myeongdong',
    },
  };
}

// FAQPage — for treatment detail pages with FAQ items
export function getFaqPageJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}

// ItemList — for category pages
export function getItemListJsonLd(
  items: { name: string; url: string; price?: number }[],
  _locale: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}
