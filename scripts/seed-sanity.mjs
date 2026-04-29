import { createClient } from '@sanity/client';

// Use SANITY_WRITE_TOKEN env var if available, otherwise fall back to SANITY_API_TOKEN / hardcoded token
const token =
  process.env.SANITY_WRITE_TOKEN ||
  process.env.SANITY_API_TOKEN;

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

// Helper: keyed localizedString for arrays (Sanity needs _key on array items)
let keyCounter = 0;
function k() {
  return `key-${++keyCounter}`;
}

function ls(ko, en, zh, ja) {
  return { _type: 'localizedString', ko, en, zh, ja };
}

function lt(ko, en, zh, ja) {
  return { _type: 'localizedText', ko, en, zh, ja };
}

function lsKeyed(ko, en, zh, ja) {
  return { _type: 'localizedString', _key: k(), ko, en, zh, ja };
}

function ref(id) {
  return { _type: 'reference', _ref: id };
}

function priceOpt(ko, en, zh, ja, price, discountPrice) {
  const opt = {
    _type: 'priceOption',
    _key: k(),
    name: ls(ko, en, zh, ja),
    price,
  };
  if (discountPrice) opt.discountPrice = discountPrice;
  return opt;
}

function bh(dayKo, dayEn, dayZh, dayJa, open, close, noteKo, noteEn, noteZh, noteJa) {
  const item = {
    _type: 'businessHours',
    _key: k(),
    day: ls(dayKo, dayEn, dayZh, dayJa),
    open,
    close,
  };
  if (noteKo) item.note = ls(noteKo, noteEn, noteZh, noteJa);
  return item;
}

// ── Treatments ──────────────────────────────────────────────────────────────

const treatments = [
  {
    _id: 'treatment-ulthera',
    _type: 'treatment',
    name: ls('울쎄라 리프팅', 'Ultherapy', '超声刀提升', 'ウルセラリフティング'),
    slug: { _type: 'slug', current: 'ultherapy' },
    category: 'lifting',
    tagline: ls(
      '초음파 에너지로 피부 깊숙이 리프팅',
      'Deep skin lifting with focused ultrasound energy',
      '超声波能量深层提升肌肤',
      '超音波エネルギーで肌の奥深くからリフティング'
    ),
    effects: [
      lsKeyed('피부 탄력 개선', 'Improved skin elasticity', '改善皮肤弹性', '肌の弾力改善'),
      lsKeyed('주름 개선', 'Wrinkle reduction', '改善皱纹', 'しわ改善'),
    ],
    duration: '약 60~90분',
    downtime: '거의 없음',
    treatmentTime: '1회',
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 1500000),
      priceOpt('턱선', 'Jawline', '下颌线', 'ジョーライン', 800000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 1,
  },
  {
    _id: 'treatment-thermage',
    _type: 'treatment',
    name: ls('써마지 FLX', 'Thermage FLX', '热玛吉FLX', 'サーマジFLX'),
    slug: { _type: 'slug', current: 'thermage-flx' },
    category: 'lifting',
    tagline: ls(
      'RF 에너지로 콜라겐 리모델링',
      'Collagen remodeling with RF energy',
      'RF能量胶原蛋白重塑',
      'RFエネルギーでコラーゲンリモデリング'
    ),
    effects: [
      lsKeyed('피부 탄력 증진', 'Enhanced skin firmness', '增强皮肤弹性', '肌のハリ向上'),
      lsKeyed('윤곽 개선', 'Contour improvement', '轮廓改善', '輪郭改善'),
    ],
    duration: '약 40~60분',
    downtime: '거의 없음',
    treatmentTime: '1회',
    priceOptions: [
      priceOpt('전체 얼굴 900샷', 'Full Face 900 shots', '全脸900发', 'フルフェイス900ショット', 1200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 2,
  },
  {
    _id: 'treatment-shrink',
    _type: 'treatment',
    name: ls('슈링크 유니버스', 'Shrink Universe', '超声提升', 'シュリンクユニバース'),
    slug: { _type: 'slug', current: 'shrink-universe' },
    category: 'lifting',
    tagline: ls(
      'HIFU 기술로 탄력 있는 피부',
      'Firm skin with HIFU technology',
      'HIFU技术紧致肌肤',
      'HIFU技術でハリのある肌へ'
    ),
    effects: [
      lsKeyed('리프팅 효과', 'Lifting effect', '提升效果', 'リフティング効果'),
      lsKeyed('탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
    ],
    duration: '약 30~40분',
    downtime: '없음',
    treatmentTime: '1회',
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 500000),
      priceOpt('얼굴 + 목', 'Face + Neck', '脸+颈', 'フェイス+ネック', 700000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 3,
  },
  {
    _id: 'treatment-inmode',
    _type: 'treatment',
    name: ls('인모드', 'InMode', '因莫德', 'インモード'),
    slug: { _type: 'slug', current: 'inmode' },
    category: 'lifting',
    tagline: ls(
      'RF와 석션으로 동시 리프팅',
      'Simultaneous lifting with RF and suction',
      'RF和吸力同步提升',
      'RFと吸引で同時リフティング'
    ),
    effects: [
      lsKeyed('이중턱 개선', 'Double chin improvement', '改善双下巴', '二重あご改善'),
      lsKeyed('지방 감소', 'Fat reduction', '脂肪减少', '脂肪減少'),
    ],
    duration: '약 30~40분',
    downtime: '1~2일',
    treatmentTime: '3~5회 권장',
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 300000),
      priceOpt('5회 패키지', '5-session package', '5次套餐', '5回パッケージ', 1200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 4,
  },
  {
    _id: 'treatment-sylfirm',
    _type: 'treatment',
    name: ls('실펌X', 'Sylfirm X', '秀肤生X', 'シルファームX'),
    slug: { _type: 'slug', current: 'sylfirm-x' },
    category: 'skincare',
    tagline: ls(
      '세계 최초 듀얼 웨이브 RF 마이크로니들링',
      'World\'s first dual-wave RF microneedling',
      '全球首款双波RF微针',
      '世界初デュアルウェーブRFマイクロニードリング'
    ),
    effects: [
      lsKeyed('색소 개선', 'Pigment improvement', '色素改善', '色素改善'),
      lsKeyed('홍조 개선', 'Redness improvement', '红血丝改善', '赤み改善'),
    ],
    duration: '약 30~40분',
    downtime: '1~3일',
    treatmentTime: '3~5회 권장',
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 250000),
      priceOpt('3회 패키지', '3-session package', '3次套餐', '3回パッケージ', 600000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 5,
  },
  {
    _id: 'treatment-ldm',
    _type: 'treatment',
    name: ls('LDM', 'LDM', 'LDM', 'LDM'),
    slug: { _type: 'slug', current: 'ldm' },
    category: 'skincare',
    tagline: ls(
      '초음파로 피부 장벽 강화',
      'Strengthen skin barrier with ultrasound',
      '超声波强化皮肤屏障',
      '超音波で肌バリア強化'
    ),
    effects: [
      lsKeyed('보습 효과', 'Hydration effect', '保湿效果', '保湿効果'),
      lsKeyed('피부 진정', 'Skin calming', '镇静肌肤', '肌の鎮静'),
    ],
    duration: '약 20~30분',
    downtime: '없음',
    treatmentTime: '주 1~2회 권장',
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 100000),
      priceOpt('10회 패키지', '10-session package', '10次套餐', '10回パッケージ', 800000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 6,
  },
  {
    _id: 'treatment-dermav',
    _type: 'treatment',
    name: ls('더마브이', 'Derma-V', '德玛V', 'デルマV'),
    slug: { _type: 'slug', current: 'derma-v' },
    category: 'skincare',
    tagline: ls(
      '혈관 치료 특화 레이저',
      'Specialized vascular treatment laser',
      '血管治疗专用激光',
      '血管治療特化レーザー'
    ),
    effects: [
      lsKeyed('혈관 병변 개선', 'Vascular lesion improvement', '血管病变改善', '血管病変改善'),
      lsKeyed('홍조 치료', 'Redness treatment', '红血丝治疗', '赤み治療'),
    ],
    duration: '약 20~30분',
    downtime: '1~2일',
    treatmentTime: '3~5회 권장',
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 7,
  },
  {
    _id: 'treatment-serf',
    _type: 'treatment',
    name: ls('세르프', 'Serf', '赛尔夫', 'セルフ'),
    slug: { _type: 'slug', current: 'serf' },
    category: 'skincare',
    tagline: ls(
      '피부 재생을 위한 프리미엄 필링',
      'Premium peeling for skin regeneration',
      '肌肤再生高级焕肤',
      '肌再生のためのプレミアムピーリング'
    ),
    effects: [
      lsKeyed('각질 제거', 'Exfoliation', '去角质', '角質除去'),
      lsKeyed('피부 톤 개선', 'Skin tone improvement', '改善肤色', '肌トーン改善'),
    ],
    duration: '약 30~40분',
    downtime: '2~3일',
    treatmentTime: '2~4주 간격 권장',
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 150000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 8,
  },
  {
    _id: 'treatment-pico-toning',
    _type: 'treatment',
    name: ls('피코토닝', 'Pico Toning', '皮秒激光', 'ピコトーニング'),
    slug: { _type: 'slug', current: 'pico-toning' },
    category: 'toning',
    tagline: ls(
      '피코초 레이저로 균일한 피부톤',
      'Even skin tone with picosecond laser',
      '皮秒激光均匀肤色',
      'ピコ秒レーザーで均一な肌トーンへ'
    ),
    effects: [
      lsKeyed('색소 침착 개선', 'Pigmentation improvement', '色素沉着改善', '色素沈着改善'),
      lsKeyed('모공 축소', 'Pore minimization', '毛孔缩小', '毛穴縮小'),
    ],
    duration: '약 20~30분',
    downtime: '없음',
    treatmentTime: '4~6회 권장',
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 150000),
      priceOpt('5회 패키지', '5-session package', '5次套餐', '5回パッケージ', 600000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 9,
  },
  {
    _id: 'treatment-lucas-toning',
    _type: 'treatment',
    name: ls('루카스토닝', 'Lucas Toning', '卢卡斯激光', 'ルカストーニング'),
    slug: { _type: 'slug', current: 'lucas-toning' },
    category: 'toning',
    tagline: ls(
      '기미 치료에 특화된 레이저 토닝',
      'Laser toning specialized for melasma treatment',
      '针对黄褐斑的专业激光调理',
      '肝斑治療に特化したレーザートーニング'
    ),
    effects: [
      lsKeyed('기미 개선', 'Melasma improvement', '黄褐斑改善', '肝斑改善'),
      lsKeyed('피부 톤 균일화', 'Skin tone evening', '均匀肤色', '肌トーン均一化'),
    ],
    duration: '약 20~30분',
    downtime: '없음',
    treatmentTime: '6~10회 권장',
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 120000),
      priceOpt('10회 패키지', '10-session package', '10次套餐', '10回パッケージ', 900000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 10,
  },
  {
    _id: 'treatment-botox',
    _type: 'treatment',
    name: ls('보톡스', 'Botox', '肉毒素', 'ボトックス'),
    slug: { _type: 'slug', current: 'botox' },
    category: 'botox-filler',
    tagline: ls(
      '자연스러운 주름 개선',
      'Natural wrinkle improvement',
      '自然改善皱纹',
      '自然なしわ改善'
    ),
    effects: [
      lsKeyed('표정 주름 개선', 'Expression wrinkle improvement', '改善表情纹', '表情じわ改善'),
      lsKeyed('사각턱 축소', 'Jaw slimming', '瘦咬肌', 'エラ縮小'),
    ],
    duration: '약 10~20분',
    downtime: '없음',
    treatmentTime: '3~6개월 간격',
    priceOptions: [
      priceOpt('이마', 'Forehead', '额头', '額', 150000),
      priceOpt('미간', 'Glabella', '眉间', '眉間', 100000),
      priceOpt('사각턱', 'Jaw', '咬肌', 'エラ', 200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 11,
  },
  {
    _id: 'treatment-filler',
    _type: 'treatment',
    name: ls('필러', 'Filler', '玻尿酸填充', 'フィラー'),
    slug: { _type: 'slug', current: 'filler' },
    category: 'botox-filler',
    tagline: ls(
      '볼륨 복원과 윤곽 개선',
      'Volume restoration and contour improvement',
      '恢复体积改善轮廓',
      'ボリューム復元と輪郭改善'
    ),
    effects: [
      lsKeyed('볼륨 충전', 'Volume filling', '填充体积', 'ボリュームアップ'),
      lsKeyed('팔자주름 개선', 'Nasolabial fold improvement', '改善法令纹', 'ほうれい線改善'),
    ],
    duration: '약 20~30분',
    downtime: '1~2일',
    treatmentTime: '6~12개월 유지',
    priceOptions: [
      priceOpt('1cc', '1cc', '1cc', '1cc', 300000),
      priceOpt('2cc', '2cc', '2cc', '2cc', 550000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 12,
  },
  {
    _id: 'treatment-skin-botox',
    _type: 'treatment',
    name: ls('스킨보톡스', 'Skin Botox', '皮肤肉毒素', 'スキンボトックス'),
    slug: { _type: 'slug', current: 'skin-botox' },
    category: 'botox-filler',
    tagline: ls(
      '모공 축소와 피부 탄력 개선',
      'Pore minimization and skin elasticity improvement',
      '缩小毛孔改善弹性',
      '毛穴縮小と肌弾力改善'
    ),
    effects: [
      lsKeyed('모공 축소', 'Pore minimization', '缩小毛孔', '毛穴縮小'),
      lsKeyed('피지 조절', 'Sebum control', '控油', '皮脂コントロール'),
    ],
    duration: '약 20~30분',
    downtime: '없음',
    treatmentTime: '3~4개월 간격',
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 250000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 13,
  },
];

// ── Doctors ─────────────────────────────────────────────────────────────────

const doctors = [
  {
    _id: 'doctor-1',
    _type: 'doctor',
    name: ls('김영호', 'Dr. Young-Ho Kim', '金永浩', 'キム・ヨンホ'),
    position: ls('대표원장', 'Medical Director', '首席院长', '代表院長'),
    philosophy: lt(
      '환자 한 분 한 분의 피부 특성을 정확히 파악하고, 최적의 시술을 제안하는 것이 저의 진료 철학입니다.',
      'My philosophy is to precisely understand each patient\'s unique skin characteristics and recommend the most suitable treatment.',
      '准确了解每位患者的皮肤特征，提供最佳治疗方案是我的诊疗理念。',
      '一人ひとりの肌特性を正確に把握し、最適な施術を提案することが私の診療哲学です。'
    ),
    specialties: [
      lsKeyed('리프팅', 'Lifting', '提升', 'リフティング'),
      lsKeyed('피부 재생', 'Skin Regeneration', '皮肤再生', '肌再生'),
    ],
    licenseNumber: '제 12345호',
    isVisible: true,
    sortOrder: 1,
  },
  {
    _id: 'doctor-2',
    _type: 'doctor',
    name: ls('이서연', 'Dr. Seo-Yeon Lee', '李叙妍', 'イ・ソヨン'),
    position: ls('피부과 전문의', 'Dermatologist', '皮肤科专家', '皮膚科専門医'),
    philosophy: lt(
      '자연스러운 아름다움을 추구하며, 과하지 않은 시술로 최대의 효과를 이끌어냅니다.',
      'I pursue natural beauty, achieving maximum results through minimal treatment.',
      '追求自然美丽，用最少的治疗达到最佳效果。',
      '自然な美しさを追求し、過度でない施術で最大の効果を引き出します。'
    ),
    specialties: [
      lsKeyed('보톡스/필러', 'Botox/Filler', '肉毒素/填充', 'ボトックス/フィラー'),
      lsKeyed('색소 치료', 'Pigment Treatment', '色素治疗', '色素治療'),
    ],
    licenseNumber: '제 23456호',
    isVisible: true,
    sortOrder: 2,
  },
  {
    _id: 'doctor-3',
    _type: 'doctor',
    name: ls('박민준', 'Dr. Min-Jun Park', '朴敏俊', 'パク・ミンジュン'),
    position: ls('피부과 전문의', 'Dermatologist', '皮肤科专家', '皮膚科専門医'),
    philosophy: lt(
      '최신 장비와 검증된 프로토콜로 안전하고 효과적인 시술을 제공합니다.',
      'I provide safe and effective treatments with state-of-the-art equipment and proven protocols.',
      '使用最新设备和经过验证的方案提供安全有效的治疗。',
      '最新機器と検証されたプロトコルで安全で効果的な施術を提供します。'
    ),
    specialties: [
      lsKeyed('레이저 토닝', 'Laser Toning', '激光调理', 'レーザートーニング'),
      lsKeyed('피부 관리', 'Skincare', '皮肤护理', 'スキンケア'),
    ],
    licenseNumber: '제 34567호',
    isVisible: true,
    sortOrder: 3,
  },
  {
    _id: 'doctor-4',
    _type: 'doctor',
    name: ls('정하은', 'Dr. Ha-Eun Jung', '郑荷恩', 'チョン・ハウン'),
    position: ls('피부과 전문의', 'Dermatologist', '皮肤科专家', '皮膚科専門医'),
    philosophy: lt(
      '환자와의 소통을 가장 중요하게 생각하며, 맞춤 시술 플랜을 설계합니다.',
      'I value communication with patients above all and design customized treatment plans.',
      '最重视与患者的沟通，设计定制化治疗方案。',
      '患者様とのコミュニケーションを最も大切にし、オーダーメイドの施術プランを設計します。'
    ),
    specialties: [
      lsKeyed('스킨케어', 'Skincare', '皮肤护理', 'スキンケア'),
      lsKeyed('안티에이징', 'Anti-aging', '抗衰老', 'アンチエイジング'),
    ],
    licenseNumber: '제 45678호',
    isVisible: true,
    sortOrder: 4,
  },
];

// ── Clinic Info ─────────────────────────────────────────────────────────────

const clinicInfo = {
  _id: 'forever-myeongdong-clinic-info',
  _type: 'clinicInfo',
  address: ls(
    '서울특별시 강남구 테헤란로 123 포에버빌딩 4층',
    '4F, Forever Building, 123 Teheran-ro, Gangnam-gu, Seoul',
    '首尔特别市江南区德黑兰路123号 Forever大厦4楼',
    'ソウル特別市江南区テヘラン路123 フォーエバービル4階'
  ),
  phone: '02-555-1234',
  email: 'info@foreverclinic.kr',
  businessHours: [
    bh('월~금', 'Mon-Fri', '周一至周五', '月〜金', '10:00', '19:00', null, null, null, null),
    bh('토요일', 'Saturday', '周六', '土曜日', '10:00', '15:00', null, null, null, null),
    bh('점심시간', 'Lunch Break', '午休', '昼休み', '13:00', '14:00', null, null, null, null),
  ],
  closedDayNotice: ls(
    '일요일 및 공휴일 휴진',
    'Closed on Sundays and public holidays',
    '周日及法定节假日休息',
    '日曜日・祝日休診'
  ),
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3165.123!2d127.028!3d37.5!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1',
  walkingGuide: lt(
    '강남역 3번 출구에서 도보 5분, 테헤란로를 따라 직진 후 포에버빌딩 4층으로 오시면 됩니다.',
    '5-minute walk from Gangnam Station Exit 3. Walk straight along Teheran-ro and come to the 4th floor of Forever Building.',
    '从江南站3号出口步行5分钟，沿德黑兰路直行至Forever大厦4楼。',
    '江南駅3番出口から徒歩5分、テヘラン路沿いに直進、フォーエバービル4階です。'
  ),
  snsLinks: [
    { _type: 'snsLink', _key: k(), platform: 'instagram', url: 'https://instagram.com/foreverclinic', label: '@foreverclinic' },
    { _type: 'snsLink', _key: k(), platform: 'youtube', url: 'https://youtube.com/@foreverclinic', label: 'Forever Clinic' },
    { _type: 'snsLink', _key: k(), platform: 'blog', url: 'https://blog.naver.com/foreverclinic', label: '포에버 클리닉 블로그' },
  ],
  messengerLinks: [
    { _type: 'snsLink', _key: k(), platform: 'wechat', url: 'weixin://foreverclinic', label: 'foreverclinic' },
    { _type: 'snsLink', _key: k(), platform: 'xiaohongshu', url: 'https://xiaohongshu.com/foreverclinic', label: 'Forever Clinic' },
  ],
};

// ── Facilities ──────────────────────────────────────────────────────────────

const facilities = [
  {
    _id: 'facility-1',
    _type: 'facility',
    name: ls('프라이빗 상담실', 'Private Consultation Room', '私人咨询室', 'プライベートカウンセリングルーム'),
    description: lt(
      '1:1 맞춤 상담이 가능한 독립된 프라이빗 공간입니다.',
      'An independent private space for personalized 1:1 consultations.',
      '可进行一对一定制咨询的独立私人空间。',
      '1対1のオーダーメイドカウンセリングが可能な独立したプライベート空間です。'
    ),
    sortOrder: 1,
  },
  {
    _id: 'facility-2',
    _type: 'facility',
    name: ls('시술실', 'Treatment Room', '治疗室', '施術室'),
    description: lt(
      '최신 장비를 갖춘 청결하고 쾌적한 시술 공간입니다.',
      'A clean and comfortable treatment space equipped with state-of-the-art devices.',
      '配备最新设备的清洁舒适治疗空间。',
      '最新機器を備えた清潔で快適な施術空間です。'
    ),
    sortOrder: 2,
  },
  {
    _id: 'facility-3',
    _type: 'facility',
    name: ls('리커버리 라운지', 'Recovery Lounge', '恢复休息室', 'リカバリーラウンジ'),
    description: lt(
      '시술 후 편안한 회복을 위한 프리미엄 라운지입니다.',
      'A premium lounge for comfortable post-treatment recovery.',
      '术后舒适恢复的高级休息室。',
      '施術後の快適な回復のためのプレミアムラウンジです。'
    ),
    sortOrder: 3,
  },
  {
    _id: 'facility-4',
    _type: 'facility',
    name: ls('대기 공간', 'Waiting Area', '等候区', '待合スペース'),
    description: lt(
      '편안한 분위기의 대기 공간으로, 음료 서비스를 제공합니다.',
      'A comfortable waiting area with complimentary beverage service.',
      '舒适氛围的等候区，提供免费饮品服务。',
      '落ち着いた雰囲気の待合スペースで、ドリンクサービスをご用意しています。'
    ),
    sortOrder: 4,
  },
  {
    _id: 'facility-5',
    _type: 'facility',
    name: ls('파우더룸', 'Powder Room', '化妆间', 'パウダールーム'),
    description: lt(
      '시술 전후 메이크업 및 세안이 가능한 파우더룸입니다.',
      'A powder room available for makeup and cleansing before and after treatment.',
      '术前术后可化妆和洁面的化妆间。',
      '施術前後のメイクや洗顔が可能なパウダールームです。'
    ),
    sortOrder: 5,
  },
  {
    _id: 'facility-6',
    _type: 'facility',
    name: ls('멸균 소독실', 'Sterilization Room', '消毒灭菌室', '滅菌消毒室'),
    description: lt(
      '의료 기구의 철저한 멸균 소독을 위한 전용 공간입니다.',
      'A dedicated space for thorough sterilization of medical instruments.',
      '用于医疗器械彻底灭菌消毒的专用空间。',
      '医療器具の徹底した滅菌消毒のための専用スペースです。'
    ),
    sortOrder: 6,
  },
];

// ── Equipment ───────────────────────────────────────────────────────────────

const equipment = [
  {
    _id: 'equipment-1',
    _type: 'equipment',
    name: ls('울쎄라 시스템', 'Ultherapy System', '超声刀系统', 'ウルセラシステム'),
    description: lt(
      'FDA 승인 고강도 집속 초음파(HIFU) 시스템으로, 비침습적 피부 리프팅에 사용됩니다.',
      'FDA-approved High-Intensity Focused Ultrasound (HIFU) system for non-invasive skin lifting.',
      'FDA批准的高强度聚焦超声(HIFU)系统，用于非侵入性皮肤提升。',
      'FDA認可の高密度焦点式超音波（HIFU）システムで、非侵襲的なスキンリフティングに使用されます。'
    ),
    manufacturer: 'Merz Aesthetics',
    sortOrder: 1,
  },
  {
    _id: 'equipment-2',
    _type: 'equipment',
    name: ls('써마지 FLX 장비', 'Thermage FLX Device', '热玛吉FLX设备', 'サーマジFLXデバイス'),
    description: lt(
      '4세대 RF 장비로, 피부 깊숙이 열에너지를 전달해 콜라겐을 생성합니다.',
      '4th generation RF device that delivers thermal energy deep into the skin for collagen production.',
      '第四代RF设备，将热能深层传递到皮肤以产生胶原蛋白。',
      '第4世代RF機器で、肌の奥深くに熱エネルギーを伝達しコラーゲンを生成します。'
    ),
    manufacturer: 'Solta Medical',
    sortOrder: 2,
  },
  {
    _id: 'equipment-3',
    _type: 'equipment',
    name: ls('실펌X 장비', 'Sylfirm X Device', '秀肤生X设备', 'シルファームXデバイス'),
    description: lt(
      '세계 최초 듀얼 웨이브 RF 마이크로니들링 시스템으로, 기미와 홍조 치료에 탁월합니다.',
      'World\'s first dual-wave RF microneedling system, excellent for melasma and rosacea treatment.',
      '全球首款双波RF微针系统，对黄褐斑和红血丝治疗效果卓越。',
      '世界初のデュアルウェーブRFマイクロニードリングシステムで、肝斑やバラ色斑の治療に優れています。'
    ),
    manufacturer: 'Viol',
    sortOrder: 3,
  },
  {
    _id: 'equipment-4',
    _type: 'equipment',
    name: ls('피코슈어 프로', 'PicoSure Pro', '皮秒蜂巢Pro', 'ピコシュアプロ'),
    description: lt(
      '피코초 레이저 기술로 색소와 문신 제거, 피부 톤 개선에 사용됩니다.',
      'Picosecond laser technology used for pigment and tattoo removal, and skin tone improvement.',
      '皮秒激光技术用于色素和纹身去除及肤色改善。',
      'ピコ秒レーザー技術で色素やタトゥー除去、肌トーン改善に使用されます。'
    ),
    manufacturer: 'Cynosure',
    sortOrder: 4,
  },
  {
    _id: 'equipment-5',
    _type: 'equipment',
    name: ls('인모드 장비', 'InMode Device', '因莫德设备', 'インモードデバイス'),
    description: lt(
      'RF 에너지와 석션 기술을 결합한 멀티플랫폼 장비입니다.',
      'A multi-platform device combining RF energy and suction technology.',
      '结合RF能量和吸力技术的多平台设备。',
      'RFエネルギーと吸引技術を組み合わせたマルチプラットフォーム機器です。'
    ),
    manufacturer: 'InMode',
    sortOrder: 5,
  },
  {
    _id: 'equipment-6',
    _type: 'equipment',
    name: ls('LDM MED 장비', 'LDM MED Device', 'LDM MED设备', 'LDM MEDデバイス'),
    description: lt(
      '의료용 초음파 장비로, 피부 장벽 강화와 약물 흡수 촉진에 사용됩니다.',
      'Medical ultrasound device used for skin barrier strengthening and drug absorption enhancement.',
      '医用超声设备，用于加强皮肤屏障和促进药物吸收。',
      '医療用超音波機器で、肌バリア強化と薬物吸収促進に使用されます。'
    ),
    manufacturer: 'Zimmer MedizinSysteme',
    sortOrder: 6,
  },
];

// ── Promotions ──────────────────────────────────────────────────────────────

const promotions = [
  {
    _id: 'promotion-1',
    _type: 'promotion',
    title: ls(
      '울쎄라 봄맞이 특별 이벤트',
      'Ultherapy Spring Special Event',
      '超声刀春季特别活动',
      'ウルセラ春の特別イベント'
    ),
    treatment: ref('treatment-ulthera'),
    eventPrice: 1200000,
    startDate: '2026-04-01',
    endDate: '2026-05-31',
    description: lt(
      '봄을 맞아 울쎄라 전체 얼굴 시술을 특별가에 만나보세요.',
      'Welcome spring with our Ultherapy full face treatment at a special price.',
      '迎接春天，以特别价格体验超声刀全脸治疗。',
      '春を迎えて、ウルセラフルフェイス施術を特別価格でご体験ください。'
    ),
    showOnMain: true,
    sortOrder: 1,
  },
  {
    _id: 'promotion-2',
    _type: 'promotion',
    title: ls(
      '피코토닝 5회 패키지 할인',
      'Pico Toning 5-Session Package Discount',
      '皮秒激光5次套餐折扣',
      'ピコトーニング5回パッケージ割引'
    ),
    treatment: ref('treatment-pico-toning'),
    eventPrice: 500000,
    startDate: '2026-04-15',
    endDate: '2026-06-30',
    description: lt(
      '깨끗한 피부를 위한 피코토닝 패키지를 할인가에 제공합니다.',
      'Get our Pico Toning package for clear skin at a discounted price.',
      '以折扣价提供皮秒激光套餐，打造洁净肌肤。',
      'クリアな肌のためのピコトーニングパッケージを割引価格でご提供します。'
    ),
    showOnMain: true,
    sortOrder: 2,
  },
  {
    _id: 'promotion-3',
    _type: 'promotion',
    title: ls(
      '보톡스 + 필러 동시 시술 이벤트',
      'Botox + Filler Combination Event',
      '肉毒素+玻尿酸联合治疗活动',
      'ボトックス+フィラー同時施術イベント'
    ),
    treatment: ref('treatment-botox'),
    eventPrice: 400000,
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    description: lt(
      '보톡스와 필러를 함께 시술하시면 특별 할인을 드립니다.',
      'Special discount when you combine Botox and Filler treatments.',
      '同时进行肉毒素和玻尿酸治疗即可享受特别折扣。',
      'ボトックスとフィラーを同時に施術される場合、特別割引をご提供します。'
    ),
    showOnMain: true,
    sortOrder: 3,
  },
];

// ── Brand Philosophy ────────────────────────────────────────────────────────

const brandPhilosophy = {
  _id: 'forever-myeongdong-brand',
  _type: 'brandPhilosophy',
  title: ls(
    '영원한 아름다움, 포에버 클리닉',
    'Timeless Beauty, Forever Clinic',
    '永恒之美，Forever Clinic',
    '永遠の美しさ、フォーエバークリニック'
  ),
  subtitle: ls(
    '과학과 예술이 만나는 피부 의학',
    'Dermatology where science meets art',
    '科学与艺术相遇的皮肤医学',
    '科学とアートが出会う皮膚医学'
  ),
  content: lt(
    '포에버 클리닉은 최신 의료 기술과 풍부한 임상 경험을 바탕으로, 환자 한 분 한 분에게 최적화된 맞춤 시술을 제공합니다. 자연스러운 아름다움을 추구하며, 안전하고 효과적인 시술로 고객의 만족을 최우선으로 합니다.',
    'Forever Clinic provides personalized treatments optimized for each patient, backed by cutting-edge medical technology and extensive clinical experience. We pursue natural beauty and prioritize patient satisfaction through safe and effective procedures.',
    'Forever Clinic基于最新医疗技术和丰富的临床经验，为每位患者提供优化的定制治疗方案。我们追求自然之美，以安全有效的治疗将患者满意度放在首位。',
    'フォーエバークリニックは最新の医療技術と豊富な臨床経験を基に、患者様お一人おひとりに最適化されたオーダーメイド施術を提供します。自然な美しさを追求し、安全で効果的な施術でお客様の満足を最優先にします。'
  ),
  values: [
    {
      _key: 'honesty',
      titleKo: '정직',
      titleEn: 'Honesty',
      description: lt(
        '투명한 시술 정보 공개와 정량 기준 준수로 환자와의 신뢰를 구축합니다',
        'We build trust with patients through transparent treatment information and adherence to quantitative standards',
        '通过透明的治疗信息公开和遵守定量标准来建立与患者的信任',
        '透明な施術情報の公開と定量基準の遵守で患者様との信頼を構築します'
      ),
    },
    {
      _key: 'precision',
      titleKo: '정교',
      titleEn: 'Precision',
      description: lt(
        '밀리미터 단위의 정밀한 시술 설계로 자연스러운 결과를 추구합니다',
        'We pursue natural results through millimeter-precise treatment planning',
        '通过毫米级精密治疗设计追求自然的效果',
        'ミリ単位の精密な施術設計で自然な結果を追求します'
      ),
    },
    {
      _key: 'expertise',
      titleKo: '전문',
      titleEn: 'Expertise',
      description: lt(
        '피부과 전문의의 깊은 학술 역량과 풍부한 임상 경험이 뒷받침됩니다',
        'Backed by deep academic expertise and extensive clinical experience of dermatology specialists',
        '以皮肤科专家的深厚学术能力和丰富临床经验为后盾',
        '皮膚科専門医の深い学術的力量と豊富な臨床経験が裏付けとなります'
      ),
    },
    {
      _key: 'dignity',
      titleKo: '존엄',
      titleEn: 'Dignity',
      description: lt(
        '환자 한 분 한 분의 고유한 아름다움을 존중하는 시술 철학입니다',
        'A treatment philosophy that respects the unique beauty of each patient',
        '尊重每位患者独特之美的治疗理念',
        '患者様お一人おひとりの固有の美しさを尊重する施術哲学です'
      ),
    },
  ],
};

// ── Stats Strip ─────────────────────────────────────────────────────────────

const statsStrip = {
  _id: 'forever-myeongdong-stats',
  _type: 'statsStrip',
  stats: [
    {
      _type: 'object',
      _key: k(),
      label: ls('누적 시술 건수', 'Total Treatments', '累计治疗数', '累計施術件数'),
      number: 50000,
      unit: '+',
    },
    {
      _type: 'object',
      _key: k(),
      label: ls('진료 경력', 'Years of Experience', '诊疗经验', '診療経歴'),
      number: 15,
      unit: '년+',
    },
    {
      _type: 'object',
      _key: k(),
      label: ls('전문의', 'Specialists', '专科医生', '専門医'),
      number: 4,
      unit: '명',
    },
    {
      _type: 'object',
      _key: k(),
      label: ls('보유 장비', 'Equipment', '设备', '保有機器'),
      number: 20,
      unit: '대+',
    },
  ],
};

// ── Hero Content ────────────────────────────────────────────────────────────

const heroContent = {
  _id: 'forever-myeongdong-hero',
  _type: 'heroContent',
  mainTitle: ls(
    '당신의 아름다움이 영원하도록',
    'Your Beauty, Forever',
    '让您的美丽永恒',
    'あなたの美しさが永遠に'
  ),
  mainSubtitle: ls(
    '강남 프리미엄 피부과 포에버 클리닉',
    'Gangnam Premium Dermatology - Forever Clinic',
    '江南高端皮肤科 Forever Clinic',
    '江南プレミアム皮膚科 フォーエバークリニック'
  ),
  pageHeroes: [
    {
      _type: 'object',
      _key: k(),
      pageKey: 'before-after',
      title: ls('Before & After', 'Before & After', 'Before & After', 'Before & After'),
      subtitle: ls('실제 시술 전후 비교 사진', 'Real treatment before & after photos', '真实治疗前后对比照片', '実際の施術前後の比較写真'),
    },
    {
      _type: 'object',
      _key: k(),
      pageKey: 'treatments',
      title: ls('시술 안내', 'Treatments', '治疗项目', '施術案内'),
      subtitle: ls('맞춤형 프리미엄 피부 시술', 'Customized premium skin treatments', '定制化高端皮肤治疗', 'オーダーメイドプレミアムスキン施術'),
    },
    {
      _type: 'object',
      _key: k(),
      pageKey: 'brand',
      title: ls('브랜드 철학', 'Brand Philosophy', '品牌理念', 'ブランド哲学'),
      subtitle: ls('영원한 아름다움을 추구하는 철학', 'Our philosophy of pursuing timeless beauty', '追求永恒之美的理念', '永遠の美しさを追求する哲学'),
    },
    {
      _type: 'object',
      _key: k(),
      pageKey: 'promotions',
      title: ls('프로모션', 'Promotions', '促销活动', 'プロモーション'),
      subtitle: ls('지금 진행 중인 특별 이벤트', 'Current special events', '正在进行的特别活动', '現在開催中の特別イベント'),
    },
    {
      _type: 'object',
      _key: k(),
      pageKey: 'press',
      title: ls('보도자료', 'Press', '新闻报道', 'プレスリリース'),
      subtitle: ls('미디어에 소개된 포에버 클리닉', 'Forever Clinic in the media', '媒体报道的Forever Clinic', 'メディアに紹介されたフォーエバークリニック'),
    },
    {
      _type: 'object',
      _key: k(),
      pageKey: 'video',
      title: ls('영상 콘텐츠', 'Video', '视频内容', '動画コンテンツ'),
      subtitle: ls('시술 영상과 전문의 인터뷰', 'Treatment videos and specialist interviews', '治疗视频和专家访谈', '施術動画と専門医インタビュー'),
    },
    {
      _type: 'object',
      _key: k(),
      pageKey: 'blog',
      title: ls('블로그', 'Blog', '博客', 'ブログ'),
      subtitle: ls('피부 건강을 위한 전문 정보', 'Expert information for skin health', '关于皮肤健康的专业信息', '肌の健康のための専門情報'),
    },
    {
      _type: 'object',
      _key: k(),
      pageKey: 'notice',
      title: ls('공지사항', 'Notice', '公告', 'お知らせ'),
      subtitle: ls('클리닉 소식과 안내', 'Clinic news and announcements', '诊所新闻和公告', 'クリニックのニュースとお知らせ'),
    },
    {
      _type: 'object',
      _key: k(),
      pageKey: 'estimate',
      title: ls('견적', 'Estimate', '报价', 'お見積り'),
      subtitle: ls('맞춤 시술 견적을 확인하세요', 'Check your customized treatment estimate', '查看定制化治疗报价', 'オーダーメイド施術のお見積りをご確認ください'),
    },
    {
      _type: 'object',
      _key: k(),
      pageKey: 'contact',
      title: ls('예약/상담', 'Contact', '预约/咨询', '予約/相談'),
      subtitle: ls('편하게 상담 문의해 주세요', 'Feel free to contact us', '请随时咨询我们', 'お気軽にご相談ください'),
    },
  ],
};

// ── Press Articles ──────────────────────────────────────────────────────────

const pressArticles = [
  {
    _id: 'press-1',
    _type: 'pressArticle',
    title: ls(
      '포에버 클리닉, 울쎄라 시술 1만 건 돌파',
      'Forever Clinic surpasses 10,000 Ultherapy treatments',
      'Forever Clinic超声刀治疗突破1万例',
      'フォーエバークリニック、ウルセラ施術1万件突破'
    ),
    source: '한국경제',
    url: 'https://example.com/press/1',
    publishDate: '2025-12-15',
  },
  {
    _id: 'press-2',
    _type: 'pressArticle',
    title: ls(
      '강남 피부과 트렌드: 리프팅 시술의 진화',
      'Gangnam dermatology trends: Evolution of lifting treatments',
      '江南皮肤科趋势：提升治疗的进化',
      '江南皮膚科トレンド：リフティング施術の進化'
    ),
    source: '조선일보',
    url: 'https://example.com/press/2',
    publishDate: '2026-01-20',
  },
  {
    _id: 'press-3',
    _type: 'pressArticle',
    title: ls(
      '포에버 클리닉 김영호 원장 인터뷰',
      'Interview with Dr. Young-Ho Kim of Forever Clinic',
      'Forever Clinic金永浩院长专访',
      'フォーエバークリニック キム・ヨンホ院長インタビュー'
    ),
    source: '매일경제',
    url: 'https://example.com/press/3',
    publishDate: '2026-03-10',
  },
];

// ── YouTube Videos ──────────────────────────────────────────────────────────

const youtubeVideos = [
  {
    _id: 'youtube-1',
    _type: 'youtubeVideo',
    title: ls(
      '울쎄라 vs 써마지, 어떤 시술이 나에게 맞을까?',
      'Ultherapy vs Thermage: Which is right for you?',
      '超声刀vs热玛吉，哪种适合你？',
      'ウルセラvsサーマジ、どちらが自分に合う？'
    ),
    youtubeId: 'dQw4w9WgXcQ',
    description: lt(
      '포에버 클리닉 김영호 원장이 울쎄라와 써마지의 차이점과 각 시술의 적합한 대상을 설명합니다.',
      'Dr. Young-Ho Kim of Forever Clinic explains the differences between Ultherapy and Thermage and who each treatment is best suited for.',
      'Forever Clinic金永浩院长讲解超声刀与热玛吉的区别及各治疗的适合对象。',
      'フォーエバークリニックのキム・ヨンホ院長がウルセラとサーマジの違いと各施術の適合対象を説明します。'
    ),
    publishDate: '2026-02-01',
  },
  {
    _id: 'youtube-2',
    _type: 'youtubeVideo',
    title: ls(
      '피코토닝 시술 과정 공개',
      'Pico Toning treatment process revealed',
      '皮秒激光治疗过程公开',
      'ピコトーニング施術過程公開'
    ),
    youtubeId: 'jNQXAC9IVRw',
    description: lt(
      '피코토닝 시술의 전 과정을 영상으로 확인해보세요.',
      'Watch the full Pico Toning treatment process.',
      '观看皮秒激光治疗的完整过程。',
      'ピコトーニング施術の全過程を映像でご確認ください。'
    ),
    publishDate: '2026-03-15',
  },
  {
    _id: 'youtube-3',
    _type: 'youtubeVideo',
    title: ls(
      '보톡스 시술, 이것만 알면 됩니다',
      'Everything you need to know about Botox',
      '关于肉毒素你只需知道这些',
      'ボトックス施術、これだけ知っておけばOK'
    ),
    youtubeId: '9bZkp7q19f0',
    description: lt(
      '보톡스 시술 전 꼭 알아야 할 사항을 정리했습니다.',
      'We\'ve compiled everything you need to know before getting Botox.',
      '整理了注射肉毒素前必须了解的事项。',
      'ボトックス施術前に必ず知っておくべき事項をまとめました。'
    ),
    publishDate: '2026-04-01',
  },
];

// ── Blog Posts ───────────────────────────────────────────────────────────────

const blogPosts = [
  {
    _id: 'blog-1',
    _type: 'blogPost',
    title: ls(
      '봄철 피부 관리 가이드',
      'Spring Skincare Guide',
      '春季护肤指南',
      '春のスキンケアガイド'
    ),
    slug: { _type: 'slug', current: 'spring-skincare-guide' },
    category: 'skincare',
    content: lt(
      '봄철에는 건조하고 미세먼지가 많아 피부 장벽이 약해지기 쉽습니다. LDM 시술과 적절한 보습 관리로 건강한 피부를 유지하세요.',
      'In spring, dry weather and fine dust can weaken the skin barrier. Maintain healthy skin with LDM treatments and proper moisturizing.',
      '春季干燥多尘，皮肤屏障容易变弱。通过LDM治疗和适当的保湿护理保持健康肌肤。',
      '春は乾燥と微粒子が多く、肌バリアが弱まりやすい時期です。LDM施術と適切な保湿ケアで健康な肌を維持しましょう。'
    ),
    publishDate: '2026-03-20',
  },
  {
    _id: 'blog-2',
    _type: 'blogPost',
    title: ls(
      '리프팅 시술 비교: 울쎄라, 써마지, 슈링크',
      'Lifting Treatment Comparison: Ultherapy, Thermage, Shrink',
      '提升治疗对比：超声刀、热玛吉、超声提升',
      'リフティング施術比較：ウルセラ、サーマジ、シュリンク'
    ),
    slug: { _type: 'slug', current: 'lifting-treatment-comparison' },
    category: 'treatment-guide',
    content: lt(
      '3대 리프팅 시술의 원리, 효과, 가격을 비교 분석합니다.',
      'A comparative analysis of the principles, effects, and pricing of the three major lifting treatments.',
      '对比分析三大提升治疗的原理、效果和价格。',
      '3大リフティング施術の原理、効果、価格を比較分析します。'
    ),
    publishDate: '2026-04-05',
  },
  {
    _id: 'blog-3',
    _type: 'blogPost',
    title: ls(
      '기미 치료, 어떤 레이저가 좋을까?',
      'Melasma Treatment: Which laser is best?',
      '黄褐斑治疗：哪种激光最好？',
      '肝斑治療、どのレーザーがいい？'
    ),
    slug: { _type: 'slug', current: 'melasma-laser-guide' },
    category: 'treatment-guide',
    content: lt(
      '기미 치료에 사용되는 다양한 레이저의 특징과 적합한 피부 타입을 안내합니다.',
      'A guide to the various lasers used for melasma treatment and which skin types they are best for.',
      '介绍用于黄褐斑治疗的各种激光特点及适合的皮肤类型。',
      '肝斑治療に使用される様々なレーザーの特徴と適した肌タイプをご案内します。'
    ),
    publishDate: '2026-04-15',
  },
];

// ── Notices ──────────────────────────────────────────────────────────────────

const notices = [
  {
    _id: 'notice-1',
    _type: 'notice',
    title: ls('5월 휴진 안내', 'May Clinic Closure Notice', '5月休诊通知', '5月休診のお知らせ'),
    content: lt(
      '5월 5일(어린이날), 5월 6일(대체공휴일)은 휴진입니다.',
      'The clinic will be closed on May 5th (Children\'s Day) and May 6th (substitute holiday).',
      '5月5日（儿童节）和5月6日（补休日）休诊。',
      '5月5日（こどもの日）、5月6日（振替休日）は休診です。'
    ),
    publishDate: '2026-04-20',
    isPinned: true,
  },
  {
    _id: 'notice-2',
    _type: 'notice',
    title: ls('울쎄라 이벤트 안내', 'Ultherapy Event Notice', '超声刀活动通知', 'ウルセライベントのお知らせ'),
    content: lt(
      '4월 한정 울쎄라 전체 얼굴 시술 특별가 이벤트를 진행합니다.',
      'Special pricing for Ultherapy full face treatment in April.',
      '4月限定超声刀全脸治疗特价活动。',
      '4月限定ウルセラフルフェイス施術特別価格イベントを実施します。'
    ),
    publishDate: '2026-04-01',
    isPinned: true,
  },
  {
    _id: 'notice-3',
    _type: 'notice',
    title: ls('주차 안내', 'Parking Information', '停车须知', '駐車案内'),
    content: lt(
      '포에버빌딩 지하 주차장을 이용하시면 2시간 무료 주차가 가능합니다.',
      'Free 2-hour parking is available at the Forever Building underground parking garage.',
      '使用Forever大厦地下停车场可免费停车2小时。',
      'フォーエバービル地下駐車場をご利用いただくと、2時間無料駐車が可能です。'
    ),
    publishDate: '2026-03-01',
    isPinned: false,
  },
  {
    _id: 'notice-4',
    _type: 'notice',
    title: ls('신규 장비 도입 안내', 'New Equipment Introduction', '新设备引进通知', '新規機器導入のお知らせ'),
    content: lt(
      '최신 피코슈어 프로 장비를 도입하여 더욱 정밀한 색소 치료가 가능합니다.',
      'We have introduced the latest PicoSure Pro for more precise pigment treatment.',
      '引进最新PicoSure Pro设备，可进行更精准的色素治疗。',
      '最新ピコシュアプロ機器を導入し、より精密な色素治療が可能になりました。'
    ),
    publishDate: '2026-02-15',
    isPinned: false,
  },
  {
    _id: 'notice-5',
    _type: 'notice',
    title: ls('진료시간 변경 안내', 'Business Hours Change Notice', '营业时间变更通知', '診療時間変更のお知らせ'),
    content: lt(
      '4월부터 토요일 진료시간이 오전 10시~오후 3시로 변경됩니다.',
      'Starting April, Saturday hours will change to 10:00 AM - 3:00 PM.',
      '从4月起，周六营业时间变更为上午10点至下午3点。',
      '4月より土曜日の診療時間が午前10時〜午後3時に変更となります。'
    ),
    publishDate: '2026-03-25',
    isPinned: false,
  },
  {
    _id: 'notice-6',
    _type: 'notice',
    title: ls('홈페이지 리뉴얼 안내', 'Website Renewal Notice', '网站改版通知', 'ホームページリニューアルのお知らせ'),
    content: lt(
      '더 나은 서비스를 위해 홈페이지가 리뉴얼되었습니다. 새로운 기능들을 확인해보세요.',
      'Our website has been renewed for better service. Check out the new features.',
      '为了更好的服务，网站已全面改版。请查看新功能。',
      'より良いサービスのためにホームページがリニューアルされました。新機能をご確認ください。'
    ),
    publishDate: '2026-04-25',
    isPinned: true,
  },
];

// ── Quick Entry Cards ───────────────────────────────────────────────────────

const quickEntryCards = [
  // Treatment tab (4)
  {
    _id: 'qec-treatment-1',
    _type: 'quickEntryCard',
    tab: 'treatment',
    title: ls('리프팅', 'Lifting', '提升', 'リフティング'),
    description: ls('처진 피부를 탄력 있게', 'Firm up sagging skin', '紧致松弛肌肤', 'たるんだ肌をハリのある肌へ'),
    linkUrl: '/treatments?category=lifting',
    sortOrder: 1,
    isVisible: true,
  },
  {
    _id: 'qec-treatment-2',
    _type: 'quickEntryCard',
    tab: 'treatment',
    title: ls('스킨케어', 'Skincare', '皮肤护理', 'スキンケア'),
    description: ls('건강한 피부 관리', 'Healthy skin management', '健康肌肤管理', '健康な肌管理'),
    linkUrl: '/treatments?category=skincare',
    sortOrder: 2,
    isVisible: true,
  },
  {
    _id: 'qec-treatment-3',
    _type: 'quickEntryCard',
    tab: 'treatment',
    title: ls('토닝', 'Toning', '激光调理', 'トーニング'),
    description: ls('맑고 균일한 피부톤', 'Clear and even skin tone', '清透均匀的肤色', '透明感のある均一な肌トーン'),
    linkUrl: '/treatments?category=toning',
    sortOrder: 3,
    isVisible: true,
  },
  {
    _id: 'qec-treatment-4',
    _type: 'quickEntryCard',
    tab: 'treatment',
    title: ls('보톡스/필러', 'Botox/Filler', '肉毒素/填充', 'ボトックス/フィラー'),
    description: ls('자연스러운 볼륨과 윤곽', 'Natural volume and contour', '自然的丰盈与轮廓', '自然なボリュームと輪郭'),
    linkUrl: '/treatments?category=botox-filler',
    sortOrder: 4,
    isVisible: true,
  },
  // Concern tab (4)
  {
    _id: 'qec-concern-1',
    _type: 'quickEntryCard',
    tab: 'concern',
    title: ls('주름/탄력', 'Wrinkles/Elasticity', '皱纹/弹性', 'しわ/弾力'),
    description: ls('나이 들어 보이는 주름이 고민이에요', 'Worried about aging wrinkles', '担心显老的皱纹', '老けて見えるしわが気になる'),
    linkUrl: '/treatments?category=lifting',
    sortOrder: 1,
    isVisible: true,
  },
  {
    _id: 'qec-concern-2',
    _type: 'quickEntryCard',
    tab: 'concern',
    title: ls('색소/기미', 'Pigmentation/Melasma', '色素/黄褐斑', '色素/肝斑'),
    description: ls('얼룩덜룩한 피부톤이 고민이에요', 'Uneven skin tone concerns', '肤色不均的烦恼', 'ムラのある肌トーンが気になる'),
    linkUrl: '/treatments?category=toning',
    sortOrder: 2,
    isVisible: true,
  },
  {
    _id: 'qec-concern-3',
    _type: 'quickEntryCard',
    tab: 'concern',
    title: ls('모공/피부결', 'Pores/Texture', '毛孔/肤质', '毛穴/肌質'),
    description: ls('넓은 모공과 거친 피부결이 고민이에요', 'Large pores and rough skin texture', '毛孔粗大肤质粗糙的烦恼', '開いた毛穴と荒い肌質が気になる'),
    linkUrl: '/treatments/sylfirm-x',
    sortOrder: 3,
    isVisible: true,
  },
  {
    _id: 'qec-concern-4',
    _type: 'quickEntryCard',
    tab: 'concern',
    title: ls('홍조/붉은기', 'Redness/Rosacea', '红血丝/红斑', '赤み/酒さ'),
    description: ls('붉은 피부가 고민이에요', 'Concerned about red skin', '为泛红的皮肤烦恼', '赤い肌が気になる'),
    linkUrl: '/treatments/derma-v',
    sortOrder: 4,
    isVisible: true,
  },
  // Situation tab (4)
  {
    _id: 'qec-situation-1',
    _type: 'quickEntryCard',
    tab: 'situation',
    title: ls('결혼 전 관리', 'Pre-Wedding Care', '婚前护理', 'ウェディング前ケア'),
    description: ls('인생에서 가장 빛나는 날을 위해', 'For the most radiant day of your life', '为人生中最闪耀的一天', '人生で最も輝く日のために'),
    linkUrl: '/treatments?category=skincare',
    sortOrder: 1,
    isVisible: true,
  },
  {
    _id: 'qec-situation-2',
    _type: 'quickEntryCard',
    tab: 'situation',
    title: ls('면접/중요한 자리', 'Interview/Important Events', '面试/重要场合', '面接/大事な場'),
    description: ls('첫인상이 중요한 순간을 위해', 'For moments when first impressions matter', '为第一印象重要的时刻', '第一印象が大切な瞬間のために'),
    linkUrl: '/treatments?category=botox-filler',
    sortOrder: 2,
    isVisible: true,
  },
  {
    _id: 'qec-situation-3',
    _type: 'quickEntryCard',
    tab: 'situation',
    title: ls('피부 트러블 SOS', 'Skin Trouble SOS', '皮肤问题SOS', '肌トラブルSOS'),
    description: ls('갑작스러운 피부 트러블 긴급 케어', 'Emergency care for sudden skin trouble', '突发皮肤问题紧急护理', '急な肌トラブルの緊急ケア'),
    linkUrl: '/treatments/ldm',
    sortOrder: 3,
    isVisible: true,
  },
  {
    _id: 'qec-situation-4',
    _type: 'quickEntryCard',
    tab: 'situation',
    title: ls('정기 피부 관리', 'Regular Skincare', '定期护肤', '定期スキンケア'),
    description: ls('꾸준한 관리로 건강한 피부 유지', 'Maintain healthy skin with regular care', '通过定期护理保持健康肌肤', '継続的なケアで健康な肌を維持'),
    linkUrl: '/treatments?category=skincare',
    sortOrder: 4,
    isVisible: true,
  },
];

// ── Seed function ───────────────────────────────────────────────────────────

async function seed() {
  console.log('🌱 Starting Sanity seed for dataset: develop\n');

  const allDocs = [
    ...treatments,
    ...doctors,
    clinicInfo,
    ...facilities,
    ...equipment,
    ...promotions,
    brandPhilosophy,
    statsStrip,
    heroContent,
    ...pressArticles,
    ...youtubeVideos,
    ...blogPosts,
    ...notices,
    ...quickEntryCards,
  ];

  console.log(`Total documents to seed: ${allDocs.length}\n`);

  let success = 0;
  let failed = 0;

  for (const doc of allDocs) {
    try {
      await client.createOrReplace(doc);
      console.log(`  [OK] ${doc._type} - ${doc._id}`);
      success++;
    } catch (err) {
      console.error(`  [FAIL] ${doc._type} - ${doc._id}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\nDone! ${success} succeeded, ${failed} failed.`);
}

seed().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
