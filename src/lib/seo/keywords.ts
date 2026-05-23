const keywordsMap: Record<string, string[]> = {
  ko: [
    '명동피부과',
    '명동성형외과',
    '울쎄라명동',
    '써마지명동',
    '보톡스명동',
    '필러명동',
    '리프팅명동',
    '피부관리명동',
    '스킨케어명동',
    '피부과추천',
    '리프팅추천',
    '울쎄라가격',
    '써마지가격',
    '보톡스가격',
    '필러가격',
    '피코토닝',
    '스킨부스터',
    '물광주사',
    '피부재생',
    '안티에이징',
    '주름개선',
    '탄력관리',
    '명동역피부과',
    '중구피부과',
    '서울피부과추천',
    '프리미엄피부과',
    '1:1맞춤시술',
  ],
  en: [
    'myeongdong dermatology',
    'seoul skin clinic',
    'korea medical tourism',
    'ultherapy seoul',
    'thermage korea',
    'botox myeongdong',
    'filler korea',
    'skin care seoul',
    'anti-aging korea',
    'korean beauty clinic',
    'k-beauty clinic',
    'cosmetic dermatology seoul',
    'skin lifting korea',
    'premium skin clinic',
    'medical aesthetics korea',
    'facial rejuvenation seoul',
  ],
  zh: [
    '明洞皮肤科',
    '首尔皮肤管理',
    '韩国医疗旅游',
    '超声刀首尔',
    '热玛吉韩国',
    '肉毒素明洞',
    '玻尿酸韩国',
    '韩国美容',
    '首尔美容诊所',
    '明洞美容',
    '韩国抗衰老',
    '韩国提升',
    '韩国皮肤管理',
    '水光针韩国',
    '韩国整形',
    '明洞医美',
  ],
  ja: [
    '明洞皮膚科',
    'ソウルスキンクリニック',
    '韓国美容医療',
    'ウルセラソウル',
    'サーマジ韓国',
    'ボトックス明洞',
    'フィラー韓国',
    '韓国美容クリニック',
    'ソウル美容',
    '明洞美容',
    '韓国アンチエイジング',
    '韓国リフティング',
    '水光注射韓国',
    '韓国スキンケア',
  ],
};

export function getKeywords(locale: string): string[] {
  return keywordsMap[locale] ?? keywordsMap.ko;
}

export const siteNames: Record<string, string> = {
  ko: '포에버 클리닉 명동',
  en: 'Forever Clinic Myeongdong',
  zh: '永恒诊所 明洞',
  ja: 'フォーエバークリニック 明洞',
};

export const siteDescriptions: Record<string, string> = {
  ko: '서울 명동 프리미엄 피부과. 울쎄라, 써마지, 보톡스, 필러, 피부관리. Smart-Boutique 포지셔닝.',
  en: 'Premium dermatology clinic in Myeongdong, Seoul. Ultherapy, Thermage, Botox, Filler, Skin Care. Medical tourism in Korea.',
  zh: '首尔明洞高端皮肤科诊所。超声刀、热玛吉、肉毒素、玻尿酸、皮肤管理。韩国医疗旅游。',
  ja: 'ソウル明洞プレミアム皮膚科。ウルセラ、サーマジ、ボトックス、フィラー、スキンケア。韓国美容医療。',
};

export const ogLocales: Record<string, string> = {
  ko: 'ko_KR',
  en: 'en_US',
  zh: 'zh_CN',
  ja: 'ja_JP',
};

export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? 'https://md.foreverclinic.co.kr';

export function getAlternates(locale: string, path: string = '') {
  return {
    canonical: `${BASE_URL}/${locale}${path}`,
    languages: {
      'x-default': `${BASE_URL}/ko${path}`,
      ko: `${BASE_URL}/ko${path}`,
      en: `${BASE_URL}/en${path}`,
      zh: `${BASE_URL}/zh${path}`,
      ja: `${BASE_URL}/ja${path}`,
    },
  };
}
