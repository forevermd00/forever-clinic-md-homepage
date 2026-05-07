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
// 카테고리 값: lifting-laser | petit-lifting | skincare | skin-booster | hair-removal | anesthesia

const treatments = [

  // ── 마취클리닉 ──────────────────────────────────────────────────────────────
  {
    _id: 'treatment-sedation',
    _type: 'treatment',
    name: ls('수면마취', 'IV Sedation', '静脉麻醉', '静脈麻酔'),
    slug: { _type: 'slug', current: 'iv-sedation' },
    category: 'anesthesia',
    tagline: ls(
      '편안하고 안전한 수면 마취로 시술 불안감 제로',
      'Zero anxiety during procedures with safe IV sedation',
      '安全静脉麻醉，让您在无忧状态下接受治疗',
      '安全で快適な静脈麻酔で施術中の不安ゼロ'
    ),
    effects: [
      lsKeyed('시술 중 통증·불안 최소화', 'Minimized pain and anxiety', '减少疼痛和焦虑', '痛みと不安の最小化'),
      lsKeyed('심리적 편안함 제공', 'Psychological comfort', '心理上的安心感', '心理的な安心感'),
      lsKeyed('전문 마취 의사 상주 관리', 'Managed by anesthesiologist', '麻醉专科医师监护', '麻酔専門医による管理'),
    ],
    downtime: ls('없음 (1~2시간 안정 후 귀가)', 'None (rest 1-2h before discharge)', '无（休息1~2小时后离院）', 'なし（1~2時間安静後帰宅）'),
    treatmentTime: ls('시술 시간에 따라 상이', 'Varies by procedure', '根据治疗时间而定', '施術時間による'),
    isEvent: false,
    isVisible: true,
    sortOrder: 10,
  },
  {
    _id: 'treatment-airnox',
    _type: 'treatment',
    name: ls('에어녹스 (반수면마취)', 'Airnox (Conscious Sedation)', '笑气麻醉（半清醒麻醉）', 'エアノックス（半静脈麻酔）'),
    slug: { _type: 'slug', current: 'airnox-sedation' },
    category: 'anesthesia',
    tagline: ls(
      '산화질소로 가볍게 긴장 완화, 의식은 유지',
      'Light relaxation with nitrous oxide while staying conscious',
      '笑气轻松缓解紧张，保持清醒状态',
      '亜酸化窒素で軽くリラックス、意識は維持'
    ),
    effects: [
      lsKeyed('긴장·불안 완화', 'Relaxation and anxiety relief', '缓解紧张焦虑', '緊張・不安の緩和'),
      lsKeyed('의식 및 소통 유지', 'Consciousness maintained', '保持清醒和沟通', '意識と会話を維持'),
      lsKeyed('빠른 회복', 'Fast recovery', '快速恢复', '素早い回復'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('시술 시간에 따라 상이', 'Varies by procedure', '根据治疗时间而定', '施術時間による'),
    isEvent: false,
    isVisible: true,
    sortOrder: 20,
  },

  // ── 제모클리닉 ──────────────────────────────────────────────────────────────
  {
    _id: 'treatment-gentlemax-pro-plus',
    _type: 'treatment',
    name: ls('젠틀맥스프로플러스', 'GentleMax Pro Plus', '双波激光脱毛', 'ジェントルマックスプロプラス'),
    slug: { _type: 'slug', current: 'gentlemax-pro-plus' },
    category: 'hair-removal',
    tagline: ls(
      '755nm+1064nm 듀얼 파장으로 모든 피부 타입 제모',
      'Dual-wavelength hair removal for all skin types',
      '双波长激光适合所有肤色脱毛',
      'デュアル波長で全肌タイプに対応する脱毛'
    ),
    effects: [
      lsKeyed('영구적 모발 감소', 'Permanent hair reduction', '永久性减少毛发', '永久的な毛髪減少'),
      lsKeyed('모든 피부 타입 적용', 'Suitable for all skin types', '适合所有肤色', '全肌タイプに対応'),
      lsKeyed('피부톤 균일화 효과', 'Skin tone evening', '均匀肤色', '肌トーン均一化'),
      lsKeyed('DCD 냉각으로 통증 최소화', 'Minimal pain with DCD cooling', 'DCD冷却减轻疼痛', 'DCD冷却で痛み最小化'),
    ],
    downtime: ls('거의 없음 (일시적 붉어짐)', 'Minimal (temporary redness)', '基本无（暂时泛红）', 'ほぼなし（一時的な赤み）'),
    treatmentTime: ls('부위에 따라 수 분~60분', 'A few minutes to 60 min by area', '根据部位数分钟至60分钟', '部位により数分〜60分'),
    priceOptions: [
      priceOpt('겨드랑이', 'Underarms', '腋下', '脇', 80000),
      priceOpt('다리 전체', 'Full legs', '全腿', '両足全体', 300000),
      priceOpt('전신', 'Full body', '全身', '全身', 600000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 30,
  },

  // ── 스킨케어 ────────────────────────────────────────────────────────────────
  {
    _id: 'treatment-aquapeel',
    _type: 'treatment',
    name: ls('아쿠아필', 'Aqua Peel', '水光针清洁', 'アクアピール'),
    slug: { _type: 'slug', current: 'aqua-peel' },
    category: 'skincare',
    tagline: ls(
      '진공 흡입과 수분 공급을 동시에',
      'Vacuum extraction and hydration in one step',
      '负压吸引与水分补充同步进行',
      '真空吸引と水分補給を同時に'
    ),
    effects: [
      lsKeyed('모공 속 피지·각질 제거', 'Deep pore cleansing', '深层清洁毛孔', '毛穴の皮脂・角質除去'),
      lsKeyed('수분 보충', 'Hydration', '补水保湿', '水分補充'),
      lsKeyed('피부결 개선', 'Skin texture improvement', '改善肤质', '肌質改善'),
      lsKeyed('즉각적인 광채 효과', 'Immediate glow', '立即提亮', '即時のツヤ効果'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('약 30~40분', 'About 30-40 min', '约30~40分钟', '約30〜40分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 80000),
      priceOpt('5회 패키지', '5-session package', '5次套餐', '5回パッケージ', 350000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 40,
  },
  {
    _id: 'treatment-intense-ultra',
    _type: 'treatment',
    name: ls('인텐스울트라', 'Intense Ultra', '超声导入', 'インテンスウルトラ'),
    slug: { _type: 'slug', current: 'intense-ultra' },
    category: 'skincare',
    tagline: ls(
      '고강도 초음파로 유효 성분 깊숙이 침투',
      'High-intensity ultrasound for deep ingredient absorption',
      '高强度超声波促进有效成分深层渗透',
      '高強度超音波で有効成分を深く浸透'
    ),
    effects: [
      lsKeyed('유효 성분 흡수 극대화', 'Maximized ingredient absorption', '最大化有效成分吸收', '有効成分吸収の最大化'),
      lsKeyed('피부 탄력 개선', 'Improved skin elasticity', '改善皮肤弹性', '肌弾力改善'),
      lsKeyed('보습 강화', 'Enhanced hydration', '强化保湿', '保湿強化'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('약 30~40분', 'About 30-40 min', '约30~40分钟', '約30〜40分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 100000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 50,
  },
  {
    _id: 'treatment-ldm',
    _type: 'treatment',
    name: ls('LDM', 'LDM', 'LDM超声', 'LDM'),
    slug: { _type: 'slug', current: 'ldm' },
    category: 'skincare',
    tagline: ls(
      '듀얼 주파수 초음파로 피부 장벽을 강화',
      'Dual-frequency ultrasound to strengthen the skin barrier',
      '双频超声波强化皮肤屏障',
      'デュアル周波数超音波で肌バリアを強化'
    ),
    effects: [
      lsKeyed('피부 장벽 강화', 'Skin barrier reinforcement', '强化皮肤屏障', '肌バリア強化'),
      lsKeyed('보습 효과', 'Hydration effect', '保湿效果', '保湿効果'),
      lsKeyed('피부 진정', 'Skin calming', '镇静肌肤', '肌の鎮静'),
      lsKeyed('시술 후 재생 촉진', 'Post-procedure recovery', '促进术后恢复', '施術後の回復促進'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 100000),
      priceOpt('10회 패키지', '10-session package', '10次套餐', '10回パッケージ', 800000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 60,
  },
  {
    _id: 'treatment-hydrafacial',
    _type: 'treatment',
    name: ls('하이드로페이셜', 'HydraFacial', '水光焕肤', 'ハイドラフェイシャル'),
    slug: { _type: 'slug', current: 'hydrafacial' },
    category: 'skincare',
    tagline: ls(
      '클렌징·각질제거·보습을 한 번에 완성',
      'Cleansing, exfoliation, and hydration all in one',
      '清洁、去角质、补水一步完成',
      'クレンジング・角質除去・保湿を一度に'
    ),
    effects: [
      lsKeyed('모공 청소', 'Pore cleansing', '清洁毛孔', '毛穴クレンジング'),
      lsKeyed('각질 제거', 'Exfoliation', '去角质', '角質除去'),
      lsKeyed('수분 보충', 'Hydration', '深层补水', '水分補充'),
      lsKeyed('피부 광채 개선', 'Improved skin radiance', '改善肌肤光泽', '肌の輝き改善'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('약 30~45분', 'About 30-45 min', '约30~45分钟', '約30〜45分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 120000),
      priceOpt('5회 패키지', '5-session package', '5次套餐', '5回パッケージ', 500000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 70,
  },

  // ── 쁘띠 & 실리프팅 ─────────────────────────────────────────────────────────
  {
    _id: 'treatment-fat-dissolving',
    _type: 'treatment',
    name: ls('지방분해주사', 'Fat Dissolving Injection', '溶脂针', '脂肪溶解注射'),
    slug: { _type: 'slug', current: 'fat-dissolving' },
    category: 'petit-lifting',
    tagline: ls(
      '지방세포 분해·흡수로 부위별 윤곽 개선',
      'Targeted contouring by dissolving and absorbing fat cells',
      '分解吸收脂肪细胞，改善局部轮廓',
      '脂肪細胞の分解・吸収で部位別の輪郭改善'
    ),
    effects: [
      lsKeyed('이중턱 감소', 'Double chin reduction', '减少双下巴', '二重あご減少'),
      lsKeyed('부분 지방 감소', 'Localized fat reduction', '局部脂肪减少', '部分脂肪減少'),
      lsKeyed('얼굴 윤곽 개선', 'Facial contour improvement', '改善面部轮廓', '顔の輪郭改善'),
    ],
    downtime: ls('붓기 1~3일', 'Swelling 1-3 days', '肿胀1~3天', '腫れ1〜3日'),
    treatmentTime: ls('약 10~20분', 'About 10-20 min', '约10~20分钟', '約10〜20分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 150000),
      priceOpt('3회 패키지', '3-session package', '3次套餐', '3回パッケージ', 380000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 80,
  },
  {
    _id: 'treatment-filler',
    _type: 'treatment',
    name: ls('필러 (벨로테로/쥬비덤)', 'Filler (Belotero/Juvederm)', '玻尿酸填充（倍洛特罗/乔雅登）', 'フィラー（ベロテロ/ジュビダーム）'),
    slug: { _type: 'slug', current: 'filler' },
    category: 'petit-lifting',
    tagline: ls(
      '히알루론산으로 볼륨 복원과 자연스러운 윤곽',
      'Natural volume restoration and contouring with hyaluronic acid',
      '透明质酸填充恢复体积，自然改善轮廓',
      'ヒアルロン酸でボリューム復元と自然な輪郭形成'
    ),
    effects: [
      lsKeyed('볼륨 충전', 'Volume filling', '填充体积', 'ボリュームアップ'),
      lsKeyed('팔자주름 개선', 'Nasolabial fold improvement', '改善法令纹', 'ほうれい線改善'),
      lsKeyed('입술·코·턱 윤곽 교정', 'Lip, nose, chin contouring', '嘴唇·鼻·下巴轮廓矫正', '唇・鼻・顎の輪郭矯正'),
    ],
    downtime: ls('붓기·멍 1~3일', 'Swelling/bruising 1-3 days', '肿胀淤青1~3天', '腫れ・内出血1〜3日'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1cc', '1cc', '1cc', '1cc', 300000),
      priceOpt('2cc', '2cc', '2cc', '2cc', 550000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 90,
  },
  {
    _id: 'treatment-skin-botox',
    _type: 'treatment',
    name: ls('스킨보톡스', 'Skin Botox', '皮肤肉毒素', 'スキンボトックス'),
    slug: { _type: 'slug', current: 'skin-botox' },
    category: 'petit-lifting',
    tagline: ls(
      '진피층 보톡스로 모공·피지·탄력 한 번에',
      'Intradermal botox for pores, sebum, and elasticity',
      '真皮层肉毒素，同时改善毛孔、皮脂和弹性',
      '真皮層ボトックスで毛穴・皮脂・弾力を一度に'
    ),
    effects: [
      lsKeyed('모공 축소', 'Pore minimization', '缩小毛孔', '毛穴縮小'),
      lsKeyed('피지 조절', 'Sebum control', '控油', '皮脂コントロール'),
      lsKeyed('피부 탄력 개선', 'Improved elasticity', '改善弹性', '弾力改善'),
      lsKeyed('땀 분비 억제', 'Sweat reduction', '减少出汗', '汗の抑制'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 250000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 100,
  },
  {
    _id: 'treatment-botox',
    _type: 'treatment',
    name: ls('보톡스 (국산/해외)', 'Botox (Domestic/Imported)', '肉毒素（国产/进口）', 'ボトックス（国産/輸入）'),
    slug: { _type: 'slug', current: 'botox' },
    category: 'petit-lifting',
    tagline: ls(
      '자연스러운 주름 개선과 얼굴 윤곽 교정',
      'Natural wrinkle improvement and facial contouring',
      '自然改善皱纹并矫正面部轮廓',
      '自然なしわ改善と顔の輪郭矯正'
    ),
    effects: [
      lsKeyed('표정 주름 개선', 'Expression wrinkle improvement', '改善表情纹', '表情じわ改善'),
      lsKeyed('사각턱 축소', 'Jaw slimming', '瘦咬肌', 'エラ縮小'),
      lsKeyed('이마·눈가·미간 주름 개선', 'Forehead, crow\'s feet, frown lines', '额纹·鱼尾纹·眉间纹改善', '額・目尻・眉間のしわ改善'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('약 10~20분', 'About 10-20 min', '约10~20分钟', '約10〜20分'),
    priceOptions: [
      priceOpt('이마', 'Forehead', '额头', '額', 150000),
      priceOpt('미간', 'Glabella', '眉间', '眉間', 100000),
      priceOpt('사각턱', 'Jaw', '咬肌', 'エラ', 200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 110,
  },
  {
    _id: 'treatment-sili-lifting',
    _type: 'treatment',
    name: ls('실리프팅', 'Thread Lifting', '线雕提升', 'スレッドリフティング'),
    slug: { _type: 'slug', current: 'thread-lifting' },
    category: 'petit-lifting',
    tagline: ls(
      '녹는 실로 당기고 콜라겐을 생성하는 리프팅',
      'Lift and stimulate collagen with absorbable threads',
      '可吸收线提拉并促进胶原蛋白生成',
      '吸収糸で引き上げ、コラーゲン生成を促進'
    ),
    effects: [
      lsKeyed('피부 리프팅', 'Skin lifting', '皮肤提升', '肌のリフティング'),
      lsKeyed('탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('콜라겐 생성 촉진', 'Collagen stimulation', '促进胶原蛋白生成', 'コラーゲン生成促進'),
    ],
    downtime: ls('붓기·멍 3~7일', 'Swelling/bruising 3-7 days', '肿胀淤青3~7天', '腫れ・内出血3〜7日'),
    treatmentTime: ls('약 30~60분', 'About 30-60 min', '约30~60分钟', '約30〜60分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 500000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 120,
  },

  // ── 스킨부스터 ──────────────────────────────────────────────────────────────
  {
    _id: 'treatment-metacell',
    _type: 'treatment',
    name: ls('메타셀 (줄기세포)', 'Metacell (Stem Cell)', '干细胞注射', 'メタセル（幹細胞）'),
    slug: { _type: 'slug', current: 'metacell-stem-cell' },
    category: 'skin-booster',
    tagline: ls(
      '줄기세포 배양액으로 피부 근본 재생',
      'Fundamental skin regeneration with stem cell conditioned media',
      '干细胞培养液从根本上再生皮肤',
      '幹細胞培養液で肌を根本から再生'
    ),
    effects: [
      lsKeyed('피부 재생 및 회복', 'Skin regeneration', '皮肤再生恢复', '肌の再生・回復'),
      lsKeyed('탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('보습 강화', 'Hydration', '保湿强化', '保湿強化'),
      lsKeyed('항산화 효과', 'Antioxidant effect', '抗氧化效果', '抗酸化効果'),
    ],
    downtime: ls('거의 없음 (주사 부위 경미한 붓기)', 'Minimal (minor swelling at injection site)', '基本无（注射部位轻微肿胀）', 'ほぼなし（注射部位の軽微な腫れ）'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 300000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 130,
  },
  {
    _id: 'treatment-rejuran',
    _type: 'treatment',
    name: ls('리쥬란 (리쥬란HB / 아이리쥬란)', 'Rejuran (HB / Eye)', '利肤兰（HB/眼周）', 'リジュラン（HB / アイ）'),
    slug: { _type: 'slug', current: 'rejuran' },
    category: 'skin-booster',
    tagline: ls(
      '연어 DNA(PDRN)로 피부 재생과 보습을 동시에',
      'Simultaneous skin regeneration and hydration with salmon DNA (PDRN)',
      '三文鱼DNA(PDRN)同时实现皮肤再生与保湿',
      'サーモンDNA（PDRN）で肌再生と保湿を同時に'
    ),
    effects: [
      lsKeyed('피부 재생', 'Skin regeneration', '皮肤再生', '肌再生'),
      lsKeyed('보습 개선', 'Hydration improvement', '保湿改善', '保湿改善'),
      lsKeyed('탄력 회복', 'Elasticity restoration', '弹性恢复', '弾力回復'),
      lsKeyed('잔주름 개선', 'Fine line improvement', '细纹改善', '小じわ改善'),
    ],
    downtime: ls('붓기 1~2일', 'Swelling 1-2 days', '肿胀1~2天', '腫れ1〜2日'),
    treatmentTime: ls('약 30분', 'About 30 min', '约30分钟', '約30分'),
    priceOptions: [
      priceOpt('리쥬란HB 1회', 'Rejuran HB 1 session', '利肤兰HB 1次', 'リジュランHB 1回', 250000),
      priceOpt('아이리쥬란 1회', 'Rejuran Eye 1 session', '眼周利肤兰 1次', 'アイリジュラン 1回', 200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 140,
  },
  {
    _id: 'treatment-juvelook',
    _type: 'treatment',
    name: ls('쥬베룩', 'Juvelook', '朱维璐', 'ジュベルック'),
    slug: { _type: 'slug', current: 'juvelook' },
    category: 'skin-booster',
    tagline: ls(
      'PDRN + 히알루론산 복합 부스터로 피부 속부터 채움',
      'PDRN + HA complex booster to fill from within',
      'PDRN+透明质酸复合注射，从内而外充盈肌肤',
      'PDRN＋HAコンプレックスブースターで肌内部から充填'
    ),
    effects: [
      lsKeyed('피부 재생', 'Skin regeneration', '皮肤再生', '肌再生'),
      lsKeyed('보습 충전', 'Hydration filling', '深层补水', '保湿充填'),
      lsKeyed('탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('잔주름 개선', 'Fine line improvement', '细纹改善', '小じわ改善'),
    ],
    downtime: ls('붓기 1~2일', 'Swelling 1-2 days', '肿胀1~2天', '腫れ1〜2日'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 150,
  },
  {
    _id: 'treatment-sculptra',
    _type: 'treatment',
    name: ls('스컬트라', 'Sculptra', '舒颜萃', 'スカルプトラ'),
    slug: { _type: 'slug', current: 'sculptra' },
    category: 'skin-booster',
    tagline: ls(
      'PLLA 성분으로 콜라겐 생성을 장기적으로 촉진',
      'Long-term collagen stimulation with PLLA',
      'PLLA成分长期促进胶原蛋白生成',
      'PLLAで長期的なコラーゲン生成を促進'
    ),
    effects: [
      lsKeyed('콜라겐 생성 촉진', 'Collagen stimulation', '促进胶原蛋白生成', 'コラーゲン生成促進'),
      lsKeyed('자연스러운 볼륨 회복', 'Natural volume restoration', '自然恢复体积', '自然なボリューム回復'),
      lsKeyed('2년 이상 지속 효과', 'Effects lasting 2+ years', '效果持续2年以上', '2年以上持続する効果'),
    ],
    downtime: ls('붓기 2~3일', 'Swelling 2-3 days', '肿胀2~3天', '腫れ2〜3日'),
    treatmentTime: ls('약 30~40분', 'About 30-40 min', '约30~40分钟', '約30〜40分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 500000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 160,
  },
  {
    _id: 'treatment-radiesse',
    _type: 'treatment',
    name: ls('래디어스', 'Radiesse', '瑞得菲', 'レディエッセ'),
    slug: { _type: 'slug', current: 'radiesse' },
    category: 'skin-booster',
    tagline: ls(
      '칼슘 성분으로 즉각 볼륨과 장기 콜라겐 생성',
      'Immediate volume and long-term collagen with calcium hydroxylapatite',
      '钙成分立即补充体积并长期生成胶原蛋白',
      'カルシウム成分で即時ボリュームと長期コラーゲン生成'
    ),
    effects: [
      lsKeyed('즉각적인 볼륨 효과', 'Immediate volume effect', '立即补充体积', '即時のボリューム効果'),
      lsKeyed('콜라겐 생성 촉진', 'Collagen stimulation', '促进胶原蛋白生成', 'コラーゲン生成促進'),
      lsKeyed('피부 탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
    ],
    downtime: ls('붓기 1~3일', 'Swelling 1-3 days', '肿胀1~3天', '腫れ1〜3日'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1.5cc', '1.5cc', '1.5cc', '1.5cc', 400000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 170,
  },
  {
    _id: 'treatment-retuo',
    _type: 'treatment',
    name: ls('리투오', 'Retuo', '利妥奥', 'リチュオ'),
    slug: { _type: 'slug', current: 'retuo' },
    category: 'skin-booster',
    tagline: ls(
      'PCL 기반 스킨부스터로 피부 재생과 탄력 강화',
      'PCL-based skin booster for regeneration and firmness',
      'PCL基底肤质促进注射，再生肌肤并增强弹性',
      'PCLベーススキンブースターで肌再生と弾力強化'
    ),
    effects: [
      lsKeyed('피부 재생', 'Skin regeneration', '皮肤再生', '肌再生'),
      lsKeyed('탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('보습 강화', 'Enhanced hydration', '保湿强化', '保湿強化'),
    ],
    downtime: ls('거의 없음', 'Minimal', '基本无', 'ほぼなし'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 250000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 180,
  },
  {
    _id: 'treatment-gouri',
    _type: 'treatment',
    name: ls('고우리 (GOURI)', 'GOURI', '高瑞（GOURI）', 'ゴウリ（GOURI）'),
    slug: { _type: 'slug', current: 'gouri' },
    category: 'skin-booster',
    tagline: ls(
      '세계 최초 완전 액상형 PCL 콜라겐 부스터',
      'World\'s first fully liquid PCL collagen booster',
      '全球首款完全液态PCL胶原蛋白促进剂',
      '世界初の完全液状PCLコラーゲンブースター'
    ),
    effects: [
      lsKeyed('전면 확산형 콜라겐 생성', 'Full-face collagen stimulation', '全面扩散型胶原蛋白生成', '全面拡散型コラーゲン生成'),
      lsKeyed('피부 탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('결절·뭉침 우려 낮음', 'Low risk of nodules', '结节风险低', '結節・凝集リスクが低い'),
      lsKeyed('자연스러운 피부 재생', 'Natural skin regeneration', '自然肌肤再生', '自然な肌再生'),
    ],
    downtime: ls('거의 없음 (주사 부위 경미한 붉어짐)', 'Minimal (temporary redness at injection site)', '基本无（注射部位轻微泛红）', 'ほぼなし（注射部位の軽微な赤み）'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 300000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 190,
  },

  // ── 리프팅·레이저 ──────────────────────────────────────────────────────────
  {
    _id: 'treatment-haecox',
    _type: 'treatment',
    name: ls('하이쿡스', 'Haecox', '海高斯', 'ハイクックス'),
    slug: { _type: 'slug', current: 'haecox' },
    category: 'lifting-laser',
    tagline: ls(
      '집속 초음파와 RF 복합 에너지로 정밀 리프팅',
      'Precision lifting with combined HIFU and RF energy',
      '聚焦超声与RF复合能量精准提升',
      '集束超音波とRF複合エネルギーで精密リフティング'
    ),
    effects: [
      lsKeyed('피부 리프팅', 'Skin lifting', '皮肤提升', '肌のリフティング'),
      lsKeyed('탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('윤곽 개선', 'Contour improvement', '轮廓改善', '輪郭改善'),
    ],
    downtime: ls('거의 없음', 'Minimal', '基本无', 'ほぼなし'),
    treatmentTime: ls('약 30~50분', 'About 30-50 min', '约30~50分钟', '約30〜50分'),
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 400000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 200,
  },
  {
    _id: 'treatment-accento',
    _type: 'treatment',
    name: ls('악센토', 'Accento', '艾森托', 'アッチェント'),
    slug: { _type: 'slug', current: 'accento' },
    category: 'lifting-laser',
    tagline: ls(
      'RF 에너지로 피부 전층을 균일하게 리모델링',
      'Uniform skin remodeling with RF energy across all layers',
      'RF能量均匀重塑皮肤全层',
      'RFエネルギーで全皮膚層を均一にリモデリング'
    ),
    effects: [
      lsKeyed('콜라겐 생성 촉진', 'Collagen stimulation', '促进胶原蛋白生成', 'コラーゲン生成促進'),
      lsKeyed('피부 탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('주름 개선', 'Wrinkle improvement', '皱纹改善', 'しわ改善'),
    ],
    downtime: ls('거의 없음', 'Minimal', '基本无', 'ほぼなし'),
    treatmentTime: ls('약 30~40분', 'About 30-40 min', '约30~40分钟', '約30〜40分'),
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 350000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 210,
  },
  {
    _id: 'treatment-dermav',
    _type: 'treatment',
    name: ls('더마브이', 'Derma-V', '德玛V', 'デルマV'),
    slug: { _type: 'slug', current: 'derma-v' },
    category: 'lifting-laser',
    tagline: ls(
      '혈관 병변 치료에 특화된 레이저',
      'Specialized laser for vascular lesion treatment',
      '专为血管病变治疗设计的激光',
      '血管病変治療に特化したレーザー'
    ),
    effects: [
      lsKeyed('혈관 병변 개선', 'Vascular lesion improvement', '血管病变改善', '血管病変改善'),
      lsKeyed('홍조 치료', 'Redness treatment', '红血丝治疗', '赤み治療'),
      lsKeyed('피부 톤 개선', 'Skin tone improvement', '改善肤色', '肌トーン改善'),
    ],
    downtime: ls('붓기 1~2일', 'Swelling 1-2 days', '肿胀1~2天', '腫れ1〜2日'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 220,
  },
  {
    _id: 'treatment-lucas-toning',
    _type: 'treatment',
    name: ls('루카스토닝', 'Lucas Toning', '卢卡斯激光', 'ルカストーニング'),
    slug: { _type: 'slug', current: 'lucas-toning' },
    category: 'lifting-laser',
    tagline: ls(
      '기미 치료에 특화된 레이저 토닝',
      'Laser toning specialized for melasma treatment',
      '针对黄褐斑的专业激光调理',
      '肝斑治療に特化したレーザートーニング'
    ),
    effects: [
      lsKeyed('기미 개선', 'Melasma improvement', '黄褐斑改善', '肝斑改善'),
      lsKeyed('피부 톤 균일화', 'Skin tone evening', '均匀肤色', '肌トーン均一化'),
      lsKeyed('색소 침착 개선', 'Pigmentation improvement', '色素沉着改善', '色素沈着改善'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 120000),
      priceOpt('10회 패키지', '10-session package', '10次套餐', '10回パッケージ', 900000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 230,
  },
  {
    _id: 'treatment-pico-toning',
    _type: 'treatment',
    name: ls('피코토닝 (피코K)', 'Pico Toning (Pico K)', '皮秒激光（Pico K）', 'ピコトーニング（ピコK）'),
    slug: { _type: 'slug', current: 'pico-toning' },
    category: 'lifting-laser',
    tagline: ls(
      '피코초 레이저로 색소를 분쇄하고 균일한 피부톤',
      'Shatter pigment and even skin tone with picosecond laser',
      '皮秒激光粉碎色素，均匀肤色',
      'ピコ秒レーザーで色素を粉砕し均一な肌トーンへ'
    ),
    effects: [
      lsKeyed('색소 침착 개선', 'Pigmentation improvement', '色素沉着改善', '色素沈着改善'),
      lsKeyed('모공 축소', 'Pore minimization', '毛孔缩小', '毛穴縮小'),
      lsKeyed('기미·잡티 개선', 'Melasma and spot improvement', '黄褐斑·色斑改善', '肝斑・シミ改善'),
    ],
    downtime: ls('없음~경미한 붉어짐', 'None to mild redness', '无~轻微泛红', 'なし〜軽微な赤み'),
    treatmentTime: ls('약 20~30분', 'About 20-30 min', '约20~30分钟', '約20〜30分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 150000),
      priceOpt('5회 패키지', '5-session package', '5次套餐', '5回パッケージ', 600000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 240,
  },
  {
    _id: 'treatment-co2',
    _type: 'treatment',
    name: ls('CO2 레이저', 'CO2 Laser', 'CO2激光', 'CO2レーザー'),
    slug: { _type: 'slug', current: 'co2-laser' },
    category: 'lifting-laser',
    tagline: ls(
      '탄산가스 레이저로 피부 재생·흉터·모공 개선',
      'Skin resurfacing, scar, and pore improvement with CO2 laser',
      '二氧化碳激光改善皮肤再生、疤痕和毛孔',
      '炭酸ガスレーザーで肌再生・傷跡・毛穴改善'
    ),
    effects: [
      lsKeyed('피부 재생', 'Skin regeneration', '皮肤再生', '肌再生'),
      lsKeyed('흉터 개선', 'Scar improvement', '疤痕改善', '傷跡改善'),
      lsKeyed('모공 축소', 'Pore minimization', '毛孔缩小', '毛穴縮小'),
      lsKeyed('주름 개선', 'Wrinkle improvement', '皱纹改善', 'しわ改善'),
    ],
    downtime: ls('5~7일 (딱지 형성 후 탈락)', '5-7 days (crust formation and shedding)', '5~7天（结痂后脱落）', '5〜7日（かさぶた形成・脱落）'),
    treatmentTime: ls('약 30~60분', 'About 30-60 min', '约30~60分钟', '約30〜60分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 250,
  },
  {
    _id: 'treatment-shrink',
    _type: 'treatment',
    name: ls('슈링크 유니버스', 'Shrink Universe', '超声提升（Shrink）', 'シュリンクユニバース'),
    slug: { _type: 'slug', current: 'shrink-universe' },
    category: 'lifting-laser',
    tagline: ls(
      'MPT 기술의 HIFU로 빠르고 정밀한 리프팅',
      'Fast and precise lifting with MPT HIFU technology',
      'MPT技术HIFU快速精准提升',
      'MPT技術のHIFUで素早く精密なリフティング'
    ),
    effects: [
      lsKeyed('리프팅 효과', 'Lifting effect', '提升效果', 'リフティング効果'),
      lsKeyed('탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('윤곽 선명화', 'Contour definition', '轮廓分明', '輪郭の明確化'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('약 20~40분 (MPT 기술로 빠른 시술)', 'About 20-40 min (fast with MPT)', '约20~40分钟（MPT技术加速）', '約20〜40分（MPT技術で高速）'),
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 500000),
      priceOpt('얼굴 + 목', 'Face + Neck', '脸+颈', 'フェイス+ネック', 700000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 260,
  },
  {
    _id: 'treatment-inmode',
    _type: 'treatment',
    name: ls('인모드', 'InMode', '因莫德', 'インモード'),
    slug: { _type: 'slug', current: 'inmode' },
    category: 'lifting-laser',
    tagline: ls(
      'RF와 석션으로 지방과 피부를 동시에 리프팅',
      'Simultaneous fat and skin lifting with RF and suction',
      'RF和吸力同步提升脂肪与皮肤',
      'RFと吸引で脂肪と肌を同時にリフティング'
    ),
    effects: [
      lsKeyed('이중턱 개선', 'Double chin improvement', '改善双下巴', '二重あご改善'),
      lsKeyed('지방 감소', 'Fat reduction', '脂肪减少', '脂肪減少'),
      lsKeyed('피부 리프팅', 'Skin lifting', '皮肤提升', '肌のリフティング'),
    ],
    downtime: ls('붓기 1~2일', 'Swelling 1-2 days', '肿胀1~2天', '腫れ1〜2日'),
    treatmentTime: ls('약 30~40분', 'About 30-40 min', '约30~40分钟', '約30〜40分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 300000),
      priceOpt('5회 패키지', '5-session package', '5次套餐', '5回パッケージ', 1200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 270,
  },
  {
    _id: 'treatment-sylfirm',
    _type: 'treatment',
    name: ls('실펌X', 'Sylfirm X', '秀肤生X', 'シルファームX'),
    slug: { _type: 'slug', current: 'sylfirm-x' },
    category: 'lifting-laser',
    tagline: ls(
      '세계 최초 듀얼 웨이브 RF 마이크로니들링',
      'World\'s first dual-wave RF microneedling',
      '全球首款双波RF微针',
      '世界初デュアルウェーブRFマイクロニードリング'
    ),
    effects: [
      lsKeyed('색소 개선 (기미·잡티)', 'Pigment improvement', '色素改善（黄褐斑·色斑）', '色素改善（肝斑・シミ）'),
      lsKeyed('홍조 개선', 'Redness improvement', '红血丝改善', '赤み改善'),
      lsKeyed('모공·피부결 개선', 'Pore and texture improvement', '毛孔·肤质改善', '毛穴・肌質改善'),
    ],
    downtime: ls('붓기·붉어짐 1~3일', 'Swelling/redness 1-3 days', '肿胀泛红1~3天', '腫れ・赤み1〜3日'),
    treatmentTime: ls('약 30~40분', 'About 30-40 min', '约30~40分钟', '約30〜40分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 250000),
      priceOpt('3회 패키지', '3-session package', '3次套餐', '3回パッケージ', 600000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 280,
  },
  {
    _id: 'treatment-potenza',
    _type: 'treatment',
    name: ls('포텐자', 'Potenza', '波特扎RF微针', 'ポテンツァ'),
    slug: { _type: 'slug', current: 'potenza' },
    category: 'lifting-laser',
    tagline: ls(
      '4가지 RF 모드와 Fusion Tip으로 맞춤형 피부 재생',
      'Customized skin regeneration with 4 RF modes and Fusion Tip',
      '4种RF模式和Fusion Tip定制化肌肤再生',
      '4つのRFモードとFusion Tipでカスタマイズ肌再生'
    ),
    effects: [
      lsKeyed('모공 개선', 'Pore improvement', '毛孔改善', '毛穴改善'),
      lsKeyed('여드름 흉터 개선', 'Acne scar improvement', '痘疤改善', 'ニキビ跡改善'),
      lsKeyed('피부결·탄력 개선', 'Texture and elasticity improvement', '肤质·弹性改善', '肌質・弾力改善'),
      lsKeyed('약물 전달 (Fusion Tip)', 'Drug delivery (Fusion Tip)', '药物传递（Fusion Tip）', '薬剤導入（Fusion Tip）'),
    ],
    downtime: ls('붓기 1~2일', 'Swelling 1-2 days', '肿胀1~2天', '腫れ1〜2日'),
    treatmentTime: ls('약 30~45분', 'About 30-45 min', '约30~45分钟', '約30〜45分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 300000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 290,
  },
  {
    _id: 'treatment-alltight',
    _type: 'treatment',
    name: ls('올타이트', 'Alltight', '奥尔塔', 'オールタイト'),
    slug: { _type: 'slug', current: 'alltight' },
    category: 'lifting-laser',
    tagline: ls(
      '고주파 에너지로 피부 전층을 타이트하게',
      'Tighten all skin layers with high-frequency energy',
      '高频能量全层紧致肌肤',
      '高周波エネルギーで全皮膚層をタイトに'
    ),
    effects: [
      lsKeyed('피부 리프팅', 'Skin lifting', '皮肤提升', '肌のリフティング'),
      lsKeyed('탄력 강화', 'Firmness enhancement', '弹性增强', '弾力強化'),
      lsKeyed('윤곽 개선', 'Contour improvement', '轮廓改善', '輪郭改善'),
    ],
    downtime: ls('거의 없음', 'Minimal', '基本无', 'ほぼなし'),
    treatmentTime: ls('약 30~50분', 'About 30-50 min', '约30~50分钟', '約30〜50分'),
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 350000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 300,
  },
  {
    _id: 'treatment-onda',
    _type: 'treatment',
    name: ls('온다리프팅', 'Onda Lifting', 'Onda提升', 'オンダリフティング'),
    slug: { _type: 'slug', current: 'onda-lifting' },
    category: 'lifting-laser',
    tagline: ls(
      'Coolwaves 마이크로파 기술로 표피 손상 없이 깊은 리프팅',
      'Deep lifting without epidermal damage with Coolwaves microwave technology',
      'Coolwaves微波技术无表皮损伤深层提升',
      'Coolwaves マイクロ波技術で表皮ダメージなしの深層リフティング'
    ),
    effects: [
      lsKeyed('비침습 리프팅', 'Non-invasive lifting', '非侵入性提升', '非侵襲的リフティング'),
      lsKeyed('탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('바디 컨투어링', 'Body contouring', '身体塑形', 'ボディコンタリング'),
      lsKeyed('지방세포 리모델링', 'Fat cell remodeling', '脂肪细胞重塑', '脂肪細胞のリモデリング'),
    ],
    downtime: ls('거의 없음', 'Minimal', '基本无', 'ほぼなし'),
    treatmentTime: ls('부위에 따라 약 20~30분', 'About 20-30 min by area', '根据部位约20~30分钟', '部位により約20〜30分'),
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 500000),
      priceOpt('얼굴 + 목', 'Face + Neck', '脸+颈', 'フェイス+ネック', 700000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 310,
  },
  {
    _id: 'treatment-titan',
    _type: 'treatment',
    name: ls('티타늄 (슈링크)', 'Titanium (Ultraformer MPT)', '钛提升', 'チタニウム'),
    slug: { _type: 'slug', current: 'titanium' },
    category: 'lifting-laser',
    tagline: ls(
      'MPT 기술의 HIFU로 10종 카트리지 깊이별 정밀 리프팅',
      'Depth-precise lifting with 10 cartridges via MPT HIFU',
      'MPT技术10种软骨针头，精准深度提升',
      'MPT技術のHIFUで10種カートリッジの深度別精密リフティング'
    ),
    effects: [
      lsKeyed('SMAS층 리프팅', 'SMAS layer lifting', 'SMAS层提升', 'SMAS層リフティング'),
      lsKeyed('탄력 개선', 'Elasticity improvement', '弹性改善', '弾力改善'),
      lsKeyed('윤곽 선명화', 'Contour definition', '轮廓分明', '輪郭の明確化'),
    ],
    downtime: ls('없음', 'None', '无', 'なし'),
    treatmentTime: ls('약 30~60분 (부위 및 샷수에 따라 상이)', 'About 30-60 min by area and shots', '根据部位和剂量约30~60分钟', '部位・ショット数により約30〜60分'),
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 500000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 320,
  },
  {
    _id: 'treatment-serf',
    _type: 'treatment',
    name: ls('세르프', 'Serf', '赛尔夫', 'セルフ'),
    slug: { _type: 'slug', current: 'serf' },
    category: 'lifting-laser',
    tagline: ls(
      '피부 재생을 위한 프리미엄 레이저 필링',
      'Premium laser peeling for skin regeneration',
      '肌肤再生高级激光焕肤',
      '肌再生のためのプレミアムレーザーピーリング'
    ),
    effects: [
      lsKeyed('각질 제거', 'Exfoliation', '去角质', '角質除去'),
      lsKeyed('피부 톤 개선', 'Skin tone improvement', '改善肤色', '肌トーン改善'),
      lsKeyed('피부 재생 촉진', 'Skin regeneration', '促进皮肤再生', '肌再生促進'),
    ],
    downtime: ls('2~3일', '2-3 days', '2~3天', '2〜3日'),
    treatmentTime: ls('약 30~40분', 'About 30-40 min', '约30~40分钟', '約30〜40分'),
    priceOptions: [
      priceOpt('1회', '1 session', '1次', '1回', 150000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 330,
  },
  {
    _id: 'treatment-thermage',
    _type: 'treatment',
    name: ls('써마지 FLX', 'Thermage FLX', '热玛吉FLX', 'サーマジFLX'),
    slug: { _type: 'slug', current: 'thermage-flx' },
    category: 'lifting-laser',
    tagline: ls(
      '단극성 RF로 콜라겐 리모델링, AccuREP 기술로 균일한 에너지',
      'Monopolar RF collagen remodeling with AccuREP technology for even energy delivery',
      '单极RF胶原蛋白重塑，AccuREP技术均匀能量输出',
      '単極性RFコラーゲンリモデリング、AccuREP技術で均一なエネルギー'
    ),
    effects: [
      lsKeyed('피부 탄력 증진', 'Enhanced skin firmness', '增强皮肤弹性', '肌のハリ向上'),
      lsKeyed('윤곽 개선', 'Contour improvement', '轮廓改善', '輪郭改善'),
      lsKeyed('콜라겐 생성 촉진', 'Collagen stimulation', '促进胶原蛋白生成', 'コラーゲン生成促進'),
      lsKeyed('눈가·복부 등 다부위 적용', 'Multi-area application', '多部位适用', '多部位適用'),
    ],
    downtime: ls('거의 없음', 'Minimal', '基本无', 'ほぼなし'),
    treatmentTime: ls('부위에 따라 약 30~60분', 'About 30-60 min by area', '根据部位约30~60分钟', '部位により約30〜60分'),
    priceOptions: [
      priceOpt('전체 얼굴 900샷', 'Full Face 900 shots', '全脸900发', 'フルフェイス900ショット', 1200000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 340,
  },
  {
    _id: 'treatment-ulthera',
    _type: 'treatment',
    name: ls('울쎄라피 프라임', 'Ultherapy Prime', '超声刀Prime', 'ウルセラピープライム'),
    slug: { _type: 'slug', current: 'ultherapy-prime' },
    category: 'lifting-laser',
    tagline: ls(
      'SMAS층까지 도달하는 유일한 FDA 승인 비침습 리프팅',
      'The only FDA-cleared non-invasive lifting that reaches the SMAS layer',
      '唯一获FDA认可可达SMAS层的非侵入性提升',
      'SMAS層まで到達する唯一のFDA認可非侵襲リフティング'
    ),
    effects: [
      lsKeyed('SMAS층 리프팅', 'SMAS layer lifting', 'SMAS层提升', 'SMAS層リフティング'),
      lsKeyed('피부 탄력 개선', 'Skin elasticity improvement', '皮肤弹性改善', '肌弾力改善'),
      lsKeyed('주름 개선', 'Wrinkle improvement', '皱纹改善', 'しわ改善'),
      lsKeyed('FDA 승인 검증된 안전성', 'FDA-cleared safety', 'FDA认可安全性', 'FDA認可の実証された安全性'),
    ],
    downtime: ls('거의 없음 (일시적 붓기 가능)', 'Minimal (temporary swelling possible)', '基本无（可能暂时肿胀）', 'ほぼなし（一時的な腫れの可能性）'),
    treatmentTime: ls('부위에 따라 약 60~90분', 'About 60-90 min by area', '根据部位约60~90分钟', '部位により約60〜90分'),
    priceOptions: [
      priceOpt('전체 얼굴', 'Full Face', '全脸', 'フルフェイス', 1500000),
      priceOpt('전체 얼굴 + 목', 'Full Face + Neck', '全脸+颈', 'フルフェイス+ネック', 1800000),
    ],
    isEvent: false,
    isVisible: true,
    sortOrder: 350,
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
