/**
 * 명동 시그니처 프로그램 리브랜딩 주입 (2026-06)
 * - 기존 5개 시그니처 treatment 문서를 새 프로그램 데이터로 업데이트
 * - keywords는 SEO 전용(화면 비노출), priceOptions는 혜택가 단일가(정가/할인 제거)
 * 실행: node --env-file=.env.local scripts/patch-signature-2026-myeongdong.mjs
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'ecoamz42';
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const TOKEN = process.env.SANITY_API_TOKEN;

if (!TOKEN) {
  console.error('SANITY_API_TOKEN 누락. --env-file=.env.local 로 실행하세요.');
  process.exit(1);
}

const lstr = (o) => ({ _type: 'localizedString', ...o });
const ltext = (o) => ({ _type: 'localizedText', ...o });

const PROGRAMS = [
  {
    _id: 'treatment-signature-ai-lifting',
    slug: 'signature-1',
    sortOrder: 10,
    price: 4990000,
    name: {
      ko: '포에버 프레스티지 원데이',
      en: 'Forever Prestige One-day',
      ja: 'フォーエバー プレステージ ワンデイ',
      zh: '永远 尊享一日提升',
    },
    tagline: {
      ko: '시간을 아끼는 하이엔드 VIP를 위한 궁극의 원데이 마스터 코스',
      en: 'The ultimate one-day master course for high-end VIPs who value their time',
      ja: '時間を大切にするハイエンドVIPのための究極のワンデイマスターコース',
      zh: '为珍惜时间的高端VIP打造的极致一日尊享课程',
    },
    description: {
      ko: '울써튠 1:1 하이엔드 리프팅 — 단 하루, 당신만을 위해 정교하게 설계된 안티에이징 마스터피스. AI 진단 기반으로 얼굴 전체 구조 리프팅과 탄탄한 피부 밀도감을 동시에 설계하는 프리미엄 시그니처 리프팅 프로그램입니다.',
      en: 'An Ulthera-tune one-on-one high-end lifting — an anti-aging masterpiece precisely designed for you alone, in just one day. Based on AI diagnosis, this premium signature lifting program simultaneously designs full-face structural lifting and firm skin density.',
      ja: 'ウルセラチューン1対1ハイエンドリフティング——たった1日、あなただけのために緻密に設計されたアンチエイジングの傑作。AI診断に基づき、顔全体の構造的リフティングと引き締まった肌の密度感を同時に設計するプレミアムシグネチャーリフティングプログラムです。',
      zh: 'Ulthera 1对1高端提升——仅需一天，专为您精心设计的抗衰杰作。基于AI诊断，同时设计全脸结构性提升与紧致肌肤密度的高端臻选提升项目。',
    },
    composition: {
      ko: '이브뮤즈 AI 피부진단 + 수면 + 울쎄라피 프라임 600샷 + 써마지 600샷 + 티타늄 60KJ + 스킨보톡스(풀페이스+얼굴 윤곽라인)\n\n* 피부 진단 기반, 커스텀 샷 레이어링 진행\n* 전 과정 프라이빗 1인 VIP 룸 케어 서비스',
      en: 'EveMuse AI skin diagnosis + sleep sedation + Ulthera Prime 600 shots + Thermage 600 shots + Titanium 60KJ + Skin Botox (full face + facial contour line)\n\n* Custom shot layering based on skin diagnosis\n* Private one-person VIP room care throughout',
      ja: 'イブミューズAI肌診断 + 睡眠麻酔 + ウルセラプライム600ショット + サーマクール600ショット + チタン60KJ + スキンボトックス(フルフェイス+フェイスライン)\n\n* 肌診断に基づくカスタムショットレイヤリング\n* 全工程プライベート1名様VIPルームケアサービス',
      zh: 'EveMuse AI皮肤诊断 + 睡眠麻醉 + Ulthera超声提升 600发 + 热玛吉 600发 + 钛雕 60KJ + 水光肉毒(全脸+面部轮廓线)\n\n* 基于皮肤诊断的定制分层发数\n* 全程私享1人VIP房间护理服务',
    },
    keywords: {
      ko: '강한 리프팅, 턱라인, 심부볼, 마리오네트 주름, 팔자 처짐, 깊은 처짐',
      en: 'strong lifting, jawline, mid-cheek, marionette lines, nasolabial sagging, deep sagging',
      ja: '強力リフティング, フェイスライン, 中顔面, マリオネットライン, ほうれい線のたるみ, 深いたるみ',
      zh: '强力提升, 下颌线, 苹果肌, 木偶纹, 法令纹下垂, 深层松弛',
    },
    priceName: {
      ko: '프레스티지 혜택가',
      en: 'Prestige Special Price',
      ja: 'プレステージ特別価格',
      zh: '尊享优惠价',
    },
  },
  {
    _id: 'treatment-signature-design-filler',
    slug: 'signature-2',
    sortOrder: 20,
    price: 3990000,
    name: {
      ko: '포에버 아뜰리에 볼륨',
      en: 'Forever Atelier Volume',
      ja: 'フォーエバー アトリエ ボリューム',
      zh: '永远 艺术塑型填充',
    },
    tagline: {
      ko: '비수술적 하이엔드 3D 안면 윤곽 리모델링',
      en: 'Non-surgical high-end 3D facial contour remodeling',
      ja: '非手術のハイエンド3Dフェイスコンタリング・リモデリング',
      zh: '非手术高端3D面部轮廓重塑',
    },
    description: {
      ko: '맞춤형 디자인 필러 — 용량 제한 없이, 예술적 감각으로 빚어내는 자연스러운 풀페이스 입체 볼륨. 꺼진 볼륨과 불균형한 얼굴선을 얼굴형에 맞춰 정교하게 보완해, 자연스러운 풀페이스 볼륨과 고급스러운 동안 이미지를 완성하는 디자인 필러 프로그램입니다.',
      en: 'Custom design filler — natural full-face dimensional volume sculpted with artistic sensibility and no dosage limit. By precisely correcting deflated volume and uneven facial lines to suit your face shape, this design filler program completes natural full-face volume and an elegant, youthful look.',
      ja: 'オーダーメイドのデザインフィラー——容量制限なく、芸術的な感性で生み出す自然なフルフェイスの立体ボリューム。へこんだボリュームと不均衡なフェイスラインを顔型に合わせて緻密に補い、自然なフルフェイスボリュームと上品な童顔イメージを完成させるデザインフィラープログラムです。',
      zh: '定制设计填充——不限剂量，以艺术感塑造自然的全脸立体丰盈。根据脸型精准修补凹陷容积与不对称的面部线条，成就自然的全脸丰盈与高级童颜印象的设计填充项目。',
    },
    composition: {
      ko: '이브뮤즈 AI 안면 계측 + 원장님 1:1 맞춤 페이스 스케치 + 하이엔드 수입 필러 커스텀 시술 + 민트실 8줄 + 프리미엄 진정 케어(정품 LDM 또는 인텐스울트라)\n\n* 프리미엄 수입 정품 필러 무제한 사용 진행\n* 전 과정 프라이빗 1인 VIP 룸 케어 서비스',
      en: 'EveMuse AI facial measurement + 1:1 custom face sketch by the director + high-end imported filler custom treatment + 8 Mint threads + premium soothing care (genuine LDM or IntenseUltra)\n\n* Unlimited use of premium genuine imported filler\n* Private one-person VIP room care throughout',
      ja: 'イブミューズAI顔面計測 + 院長による1対1オーダーメイドフェイススケッチ + ハイエンド輸入フィラーのカスタム施術 + ミント糸8本 + プレミアム鎮静ケア(正規品LDMまたはインテンスウルトラ)\n\n* プレミアム輸入正規品フィラー無制限使用\n* 全工程プライベート1名様VIPルームケアサービス',
      zh: 'EveMuse AI面部测量 + 院长1对1定制面部设计 + 高端进口填充剂定制施术 + Mint线8根 + 高端舒缓护理(正品LDM或IntenseUltra)\n\n* 无限量使用高端进口正品填充剂\n* 全程私享1人VIP房间护理服务',
    },
    keywords: {
      ko: '꺼진 볼, 눈밑·눈물고랑, 팔자·마리오네트, 이마·관자, 비대칭',
      en: 'deflated cheeks, under-eye and tear trough, nasolabial and marionette, forehead and temples, asymmetry',
      ja: 'こけた頬, 目の下・涙袋ライン, ほうれい線・マリオネット, 額・こめかみ, 非対称',
      zh: '凹陷脸颊, 眼下泪沟, 法令纹木偶纹, 额头太阳穴, 不对称',
    },
    priceName: {
      ko: '아뜰리에 혜택가',
      en: 'Atelier Special Price',
      ja: 'アトリエ特別価格',
      zh: '尊享优惠价',
    },
  },
  {
    _id: 'treatment-signature-design-lift',
    slug: 'signature-3',
    sortOrder: 30,
    price: 2990000,
    name: {
      ko: '포에버 실루엣 프로파일',
      en: 'Forever Silhouette Profile',
      ja: 'フォーエバー シルエット プロファイル',
      zh: '永远 轮廓线雕提升',
    },
    tagline: {
      ko: '즉각적인 리프팅 효과를 위한 3D 풀페이스 실리프팅 패키지',
      en: 'A 3D full-face thread-lifting package for instant lifting results',
      ja: '即時リフト効果のための3Dフルフェイス糸リフトパッケージ',
      zh: '实现即时提升效果的3D全脸线雕套餐',
    },
    description: {
      ko: '즉각적인 라인 변화와 이후의 콜라겐 생성 효과까지. 수술 부담은 줄이고 빠른 리프팅 체감 효과를 높여, 미세 주름과 눈밑 굴곡까지 한 번에 매끄럽게 정리하는 고감도 하이브리드 리프팅 프로그램입니다.',
      en: 'Immediate line changes, plus collagen regeneration afterward. Reducing the burden of surgery while boosting a fast, tangible lifting effect, this high-sensitivity hybrid lifting program smooths everything from fine wrinkles to under-eye contours at once.',
      ja: '即時のラインの変化と、その後のコラーゲン生成効果まで。手術の負担を減らしながら、素早く実感できるリフト効果を高め、小じわや目元の凹凸まで一度に滑らかに整える高感度ハイブリッドリフティングプログラムです。',
      zh: '即时的线条改变，以及之后的胶原蛋白再生效果。在减轻手术负担的同时提升快速可感的提升效果，一次性平滑细纹与眼下凹凸的高敏感复合提升项目。',
    },
    composition: {
      ko: '이브뮤즈 AI 안면 계측 + 프리미엄 국소마취 + 프리미엄 실리프팅 16줄(볼+턱라인+얼굴전체+팔자+심부볼) + 잼버실 4줄(팔자+눈가+눈밑) 미세 밸런싱 필러 + 스킨보톡스 풀페이스\n\n* 전 과정 프라이빗 1인 VIP 룸 케어 서비스',
      en: 'EveMuse AI facial measurement + premium local anesthesia + 16 premium lifting threads (cheeks + jawline + full face + nasolabial folds + mid-cheek) + 4 Jamber threads (nasolabial folds + eye area + under-eye) micro-balancing filler + full-face Skin Botox\n\n* Private one-person VIP room care throughout',
      ja: 'イブミューズAI顔面計測 + プレミアム局所麻酔 + プレミアムリフティング糸16本(頬+フェイスライン+顔全体+ほうれい線+中顔面) + ジャンバー糸4本(ほうれい線+目元+目の下)微細バランシングフィラー + フルフェイススキンボトックス\n\n* 全工程プライベート1名様VIPルームケアサービス',
      zh: 'EveMuse AI面部测量 + 高端局部麻醉 + 高端提升线16根(脸颊+下颌线+全脸+法令纹+苹果肌) + Jamber线4根(法令纹+眼周+眼下)微调平衡填充 + 全脸水光肉毒\n\n* 全程私享1人VIP房间护理服务',
    },
    keywords: {
      ko: '턱라인, 팔자주름, 마리오네트, 눈밑지방, 눈물고랑, 피부탄력',
      en: 'jawline, nasolabial folds, marionette lines, under-eye fat, tear trough, skin elasticity',
      ja: 'フェイスライン, ほうれい線, マリオネットライン, 目の下のふくらみ, 涙袋ライン, 肌の弾力',
      zh: '下颌线, 法令纹, 木偶纹, 眼下脂肪, 泪沟, 皮肤弹力',
    },
    priceName: {
      ko: '시그니처 혜택가',
      en: 'Signature Special Price',
      ja: 'シグネチャー特別価格',
      zh: '臻选优惠价',
    },
  },
  {
    _id: 'treatment-signature-ai-poreless',
    slug: 'signature-4',
    sortOrder: 40,
    price: 2590000,
    name: {
      ko: '포에버 인피니트 글로우',
      en: 'Forever Infinite Glow',
      ja: 'フォーエバー インフィニット グロウ',
      zh: '永远 无瑕焕光',
    },
    tagline: {
      ko: '늘어진 탄력형 모공을 지우고 촘촘한 밀도감을 채우는 프리미엄 결·광 리셋 스킨 튜닝',
      en: 'A premium texture & glow reset that erases stretched, lax pores and restores dense, refined skin',
      ja: 'たるんだ毛穴を消し、きめ細かな密度感を満たすプレミアムなキメ・ツヤリセット',
      zh: '抚平松弛粗大毛孔、填充紧致密度的高端肤质与光泽焕新',
    },
    description: {
      ko: '모공·피부결·타이트닝 하이엔드 케어 — 탄력형 모공과 거친 결을 동시에 리셋, 결점 없이 빛나는 무결점 글래스 스킨. 다운타임 없이 당일 일상 복귀가 가능하며, 미세 주름과 탄력 저하로 늘어진 모공을 깊은 곳부터 촘촘하게 조여 투명한 수분광을 회복시키는 토탈 텍스처 케어입니다.',
      en: 'High-end pore, texture & tightening care — resetting lax pores and rough texture at once for flawless, radiant glass skin. With no downtime and same-day return to daily life, this total texture care firms pores stretched by fine wrinkles and lost elasticity from deep within, restoring a clear, dewy glow.',
      ja: '毛穴・キメ・タイトニングのハイエンドケア——たるんだ毛穴とざらついたキメを同時にリセットし、欠点のない輝くガラス肌へ。ダウンタイムなく当日からの日常復帰が可能で、小じわや弾力低下で広がった毛穴を深部から引き締め、透明感のあるうるおい艶を取り戻すトータルテクスチャーケアです。',
      zh: '毛孔·肤质·紧致高端护理——同时焕新松弛毛孔与粗糙肤质，呈现无瑕透亮的玻璃肌。无恢复期、当天即可回归日常，从深层紧致因细纹与弹力下降而松弛的毛孔，重塑通透水光的全方位肤质护理。',
    },
    composition: {
      ko: '울쎄라피 프라임 400샷 + 리투오 1 vial + 물광주사 + 수입 스킨보톡스 풀페이스 + 하이드라페이셜(또는 LDM)\n\n* 전 과정 프라이빗 1인 VIP 룸 케어 서비스',
      en: 'Ulthera Prime 400 shots + Rituo 1 vial + aqua-shine injection + imported full-face Skin Botox + Hydrafacial (or LDM)\n\n* Private one-person VIP room care throughout',
      ja: 'ウルセラプライム400ショット + リトゥオ1バイアル + 水光注射 + 輸入スキンボトックスフルフェイス + ハイドラフェイシャル(またはLDM)\n\n* 全工程プライベート1名様VIPルームケアサービス',
      zh: 'Ulthera超声提升 400发 + Rituo 1瓶 + 水光针 + 进口全脸水光肉毒 + 水飞梭(或LDM)\n\n* 全程私享1人VIP房间护理服务',
    },
    keywords: {
      ko: '모공, 블랙헤드, 피지, 피부결, 얕은 흉터',
      en: 'pores, blackheads, sebum, skin texture, shallow scars',
      ja: '毛穴, 黒ずみ, 皮脂, キメ, 浅い傷跡',
      zh: '毛孔, 黑头, 皮脂, 肤质, 浅疤痕',
    },
    priceName: {
      ko: '시그니처 혜택가',
      en: 'Signature Special Price',
      ja: 'シグネチャー特別価格',
      zh: '臻选优惠价',
    },
  },
  {
    _id: 'treatment-signature-men-reboot',
    slug: 'signature-5',
    sortOrder: 50,
    price: 2990000,
    name: {
      ko: '포에버 옴므 디파인',
      en: 'Forever Homme Defined',
      ja: 'フォーエバー オム ディファイン',
      zh: '永远 绅士轮廓焕肤',
    },
    tagline: {
      ko: '비즈니스 신뢰감을 완성하는 프라이빗 하안부 윤곽 & 피지 리셋 코스',
      en: 'A private lower-face contour & sebum reset course that completes a trustworthy business image',
      ja: 'ビジネスの信頼感を完成させるプライベートな下顔面輪郭&皮脂リセットコース',
      zh: '成就商务信赖感的私享下面部轮廓与控油焕新课程',
    },
    description: {
      ko: '남성 전용 하이엔드 윤곽 & 스킨 케어 — 한 번에 완성하는 성공한 남자의 선명한 페이스 프레임과 무결점 피부. 남성 피부 특성에 맞춰 두꺼운 하관 지방을 재배치하고 선을 살리며, 번들거리는 피지와 모공을 즉각적으로 제어하여 자연스럽고 선명한 인상을 완성하는 맨즈 익스클루시브 프로그램입니다.',
      en: 'Men-only high-end contour & skin care — completing the sharp face frame and flawless skin of a successful man, all at once. Tailored to men\'s skin, it repositions thick lower-face fat to define the jawline and instantly controls oily sebum and pores, completing a natural, sharp impression in this men\'s exclusive program.',
      ja: '男性専用ハイエンド輪郭&スキンケア——一度で完成する、成功した男のシャープなフェイスフレームと欠点のない肌。男性肌の特性に合わせて厚い下顔面の脂肪を再配置してラインを際立たせ、テカる皮脂と毛穴を即座にコントロールし、自然でシャープな印象を完成させるメンズエクスクルーシブプログラムです。',
      zh: '男士专属高端轮廓与肌肤护理——一次成就成功男士的清晰脸部框架与无瑕肌肤。针对男性肌肤特性重新分布厚重的下面部脂肪、勾勒线条，即时控制油光皮脂与毛孔，成就自然清晰印象的男士专属项目。',
    },
    composition: {
      ko: '울쎄라피 프라임 600샷 + 온다 10만줄(또는 티타늄) + 하이엔드 콜라겐 스티뮬레이터(래디어스 또는 고우리 1cc) + 수입 보톡스 3부위 + 하이드라페이셜(또는 LDM)\n\n* 전 과정 프라이빗 1인 VIP 룸 케어 서비스',
      en: 'Ulthera Prime 600 shots + Onda 100,000 shots (or Titanium) + high-end collagen stimulator (Radiesse or Gouri 1cc) + imported Botox in 3 areas + Hydrafacial (or LDM)\n\n* Private one-person VIP room care throughout',
      ja: 'ウルセラプライム600ショット + オンダ10万ショット(またはチタン) + ハイエンドコラーゲンスティミュレーター(ラディエッセまたはゴウリ1cc) + 輸入ボトックス3部位 + ハイドラフェイシャル(またはLDM)\n\n* 全工程プライベート1名様VIPルームケアサービス',
      zh: 'Ulthera超声提升 600发 + Onda 10万发(或钛雕) + 高端胶原蛋白刺激剂(Radiesse或Gouri 1cc) + 进口肉毒 3个部位 + 水飞梭(或LDM)\n\n* 全程私享1人VIP房间护理服务',
    },
    keywords: {
      ko: '아래턱라인, 심부볼, 모공, 피부두께, 탄력, 이마·미간·눈가 주름, 피지, 블랙헤드',
      en: 'lower jawline, mid-cheek, pores, skin thickness, elasticity, forehead/glabella/eye wrinkles, sebum, blackheads',
      ja: '下顎ライン, 中顔面, 毛穴, 肌の厚み, 弾力, 額・眉間・目元のしわ, 皮脂, 黒ずみ',
      zh: '下颌线, 苹果肌, 毛孔, 皮肤厚度, 弹力, 额头眉间眼周皱纹, 皮脂, 黑头',
    },
    priceName: {
      ko: '시그니처 혜택가',
      en: 'Signature Special Price',
      ja: 'シグネチャー特別価格',
      zh: '臻选优惠价',
    },
  },
];

async function run() {
  const mutations = PROGRAMS.map((p) => ({
    patch: {
      id: p._id,
      set: {
        name: lstr(p.name),
        'slug.current': p.slug,
        'slug._type': 'slug',
        category: 'signature',
        tagline: lstr(p.tagline),
        description: ltext(p.description),
        composition: ltext(p.composition),
        keywords: lstr(p.keywords),
        sortOrder: p.sortOrder,
        isSignature: true,
        isVisible: true,
        priceOptions: [
          {
            _type: 'priceOption',
            _key: 'benefit',
            name: lstr(p.priceName),
            price: p.price,
            isEvent: false,
          },
        ],
      },
      // 단일 혜택가 — 정가/할인 흔적 제거
      unset: [
        'priceOptions[0].discountPrice',
        'priceOptions[0].caption',
        'priceOptions[0].area',
      ],
    },
  }));

  const url = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}?returnIds=true`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error('ERROR:', JSON.stringify(json, null, 2));
    process.exit(1);
  }
  console.log('SUCCESS:', JSON.stringify(json.results ?? json, null, 2));
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
