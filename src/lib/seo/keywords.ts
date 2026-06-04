const keywordsMap: Record<string, string[]> = {
  ko: [
    '포에버의원',
    '포에버의원명동점',
    '포에버의원 명동점',
    '포에버클리닉',
    '포에버클리닉명동',
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
  ko: '포에버의원 명동점',
  en: 'Forever Clinic Myeongdong',
  zh: '永恒诊所 明洞',
  ja: 'フォーエバークリニック 明洞',
};

// 홈 전용 키워드 리치 타이틀 (절대 타이틀 — 템플릿 미적용)
export const homeTitles: Record<string, string> = {
  ko: '포에버의원 명동점 | 서울 명동 피부과 써마지 울쎄라',
  en: 'Forever Clinic Myeongdong | Seoul Dermatology — Ultherapy & Thermage',
  zh: '永恒诊所 明洞（Forever Clinic）| 首尔明洞皮肤科 热玛吉 超声刀',
  ja: 'フォーエバークリニック明洞（Forever Clinic）| ソウル明洞皮膚科 サーマジ・ウルセラ',
};

export const siteDescriptions: Record<string, string> = {
  ko: '포에버의원 명동점(포에버 클리닉). 서울 명동 피부과 — 울쎄라·써마지 리프팅, 보톡스·필러, 스킨케어. 한·중·일·영 상담 가능, 외국인 환자 환영.',
  en: 'Dermatology clinic in Myeongdong, Seoul. Ultherapy, Thermage, Botox & Filler, skincare. English, Chinese & Japanese consultation available.',
  zh: '首尔明洞皮肤科诊所。超声刀、热玛吉提升，肉毒素、玻尿酸微整形，皮肤护理。提供中文咨询，欢迎外国患者。',
  ja: 'ソウル明洞の皮膚科クリニック。ウルセラ・サーマジリフティング、ボトックス・フィラー、スキンケア。日本語対応可、外国人患者歓迎。',
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
