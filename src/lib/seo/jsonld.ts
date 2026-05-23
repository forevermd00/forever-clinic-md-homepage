import { BASE_URL } from '@/lib/seo/keywords';

// MedicalBusiness — used in layout
export function getMedicalBusinessJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': BASE_URL,
    name:
      locale === 'ko'
        ? '포에버 클리닉 명동'
        : locale === 'en'
          ? 'Forever Clinic Myeongdong'
          : locale === 'zh'
            ? '永恒诊所 明洞'
            : 'フォーエバークリニック 明洞',
    url: `${BASE_URL}/${locale}`,
    telephone: process.env.NEXT_PUBLIC_CLINIC_PHONE ?? '+82-2-0000-0000',
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
    priceRange: '₩₩₩',
    image: `${BASE_URL}/images/heroes/brand-hero.png`,
    sameAs: [],
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
  },
  locale: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: treatment.name,
    description: treatment.description,
    category: treatment.category,
    url: `${BASE_URL}/${locale}/treatments/${treatment.category}/${treatment.slug}`,
    offers: {
      '@type': 'Offer',
      price: treatment.price,
      priceCurrency: 'KRW',
      availability: 'https://schema.org/InStock',
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
