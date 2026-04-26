// MedicalBusiness — used in layout
export function getMedicalBusinessJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'MedicalBusiness',
    '@id': 'https://forever-clinic-myeongdong.com',
    name:
      locale === 'ko'
        ? '포에버 클리닉 명동'
        : locale === 'en'
          ? 'Forever Clinic Myeongdong'
          : locale === 'zh'
            ? '永恒诊所 明洞'
            : 'フォーエバークリニック 明洞',
    url: `https://forever-clinic-myeongdong.com/${locale}`,
    telephone: '+82-2-XXX-XXXX',
    email: 'contact@forever-clinic.kr',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '명동길 14, 포에버빌딩 3층',
      addressLocality: '중구',
      addressRegion: '서울특별시',
      postalCode: '04536',
      addressCountry: 'KR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 37.5636,
      longitude: 126.9869,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '10:00',
        closes: '19:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '10:00',
        closes: '16:00',
      },
    ],
    medicalSpecialty: 'Dermatology',
    priceRange: '₩₩₩',
    image: 'https://forever-clinic-myeongdong.com/images/heroes/brand-hero.png',
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
    url: `https://forever-clinic-myeongdong.com/${locale}/treatments/${treatment.category}/${treatment.slug}`,
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
