/**
 * signatureProgram 문서 → treatment 문서 마이그레이션
 * 실행: node scripts/migrate-signature-to-treatment.mjs
 */

const PROJECT_ID = 'ecoamz42';
const DATASET = 'production';
const TOKEN =
  'sk9Vbbb1TLlbUEALuo70BPZcsIcYhkMmML7wJTHuHyvqROtkqhphtTdQe6lK477WXdPm6MV8Apj7bVU4O7jeQRmKDWPwTXG8Taeceteroa7outuexceWdTYkjwjhFTRNS6TiyY2obolGq8TRHu9B1pV0Y1JyFD4oldAVRrvkgNX3sNYypeTJ';

const PROGRAMS = [
  {
    oldId: 'signature-program-1',
    newId: 'treatment-signature-ai-lifting',
    slug: 'ai-signature-lifting',
    name: { ko: '포에버 AI 시그니처 리프팅', en: 'Forever AI Signature Lifting', zh: '永远AI签名提升', ja: 'フォーエバーAIシグネチャーリフティング' },
    tagline: { ko: 'AI 진단 기반 얼굴 전체 구조적 리프팅', en: 'AI-based full face structural lifting', zh: 'AI诊断全脸结构性提升', ja: 'AI診断ベースの全顔構造的リフティング' },
    keywords: { ko: '강한 리프팅 · 턱라인 · 심부볼 · 팔자 처짐', en: 'Strong lifting · Jawline · Deep cheeks · Nasolabial folds', zh: '强力提升 · 下颌线 · 深层颧颊 · 法令纹', ja: 'リフティング · フェイスライン · 深部頬 · ほうれい線' },
    description: { ko: 'AI 진단 기반으로 분석해, 얼굴 전체 구조 리프팅과 탄탄한 피부 밀도감을 동시에 설계하는 프리미엄 시그니처 리프팅 프로그램', en: 'A premium signature lifting program that analyzes AI diagnostics to simultaneously design full-face structural lifting and firm skin density', zh: '基于AI诊断分析，同时设计全脸结构提升和紧实肌肤密度的高端签名提升项目', ja: 'AI診断に基づいて分析し、全顔の構造リフティングと引き締まった肌の密度感を同時に設計するプレミアムシグネチャーリフティングプログラム' },
    composition: { ko: '이브뮤즈 AI 피부진단 + 수면 + 울쎄라피 프라임 600샷 + 써마지 600샷 + 티타늄 40KJ + LDM 12분 + 줄기세포 부스터 또는 맞춤수액 중 선택 (*샷수 추가 가능: 울쎄라피 ~1000샷, 써마지 ~900샷)', en: 'Evemuse AI Skin Diagnosis + Sleep + Ultherapy Prime 600 shots + Thermage 600 shots + Titanium 40KJ + LDM 12min + Stem Cell Booster or Custom IV drip (*Additional shots available)', zh: '依芙缪斯AI皮肤诊断 + 睡眠 + 超声刀600发 + 热玛吉600发 + 钛金激光40KJ + LDM 12分钟 + 干细胞促进剂或定制输液 (*可追加发数)', ja: 'イブミューズAI皮膚診断 + 睡眠 + ウルセラピープライム600ショット + サーマジ600ショット + チタニウム40KJ + LDM 12分 + 幹細胞ブースターまたはカスタム点滴から選択 (*ショット数追加可能)' },
    originalPrice: 7000000,
    discountedPrice: 5950000,
    sortOrder: 1,
  },
  {
    oldId: 'signature-program-2',
    newId: 'treatment-signature-design-filler',
    slug: 'signature-design-filler',
    name: { ko: '포에버 시그니처 디자인 필러', en: 'Forever Signature Design Filler', zh: '永远签名设计填充', ja: 'フォーエバーシグネチャーデザインフィラー' },
    tagline: { ko: '풀페이스 볼륨·비율 리모델링', en: 'Full-face volume and proportion remodeling', zh: '全脸容量比例重塑', ja: 'フルフェイスボリューム・プロポーションリモデリング' },
    keywords: { ko: '꺼진 볼 · 눈밑·눈물고랑 · 비대칭', en: 'Sunken cheeks · Under-eye · Asymmetry', zh: '凹陷颧颊 · 眼下 · 不对称', ja: '落ちた頬 · 目の下 · 非対称' },
    description: { ko: '꺼진 볼륨과 불균형한 얼굴선을 얼굴형에 맞춰 정교하게 보완해, 자연스러운 풀페이스 볼륨과 고급스러운 동안 이미지를 완성하는 디자인 필러 프로그램. 시술은 모두 원장님의 직접 상담 및 디자인으로 진행되고, 수입필러로 용량제한 없이 필요한 용량만큼만 시술됩니다.', en: 'A design filler program that precisely compensates for sunken volume and unbalanced facial lines to complete a natural full-face volume and luxurious youthful image. All procedures are conducted with direct consultation and design by the director, using imported fillers with no volume limit.', zh: '精准补偿凹陷容量和不均衡面部轮廓，完成自然的全脸容量和奢华年轻形象的设计填充项目。所有手术均由院长直接咨询和设计，使用进口填充剂，无容量限制。', ja: '凹んだボリュームと不均衡な顔のラインを顔の形に合わせて精密に補正し、自然なフルフェイスボリュームと高級感ある若々しいイメージを完成させるデザインフィラープログラム。すべての施術は院長の直接相談・デザインで行われ、輸入フィラーで容量制限なく必要な量だけ施術されます。' },
    composition: { ko: '원장 직접 상담 및 디자인 + 수입필러(벨로테로/쥬비덤) 용량 제한 없이 맞춤 적용', en: 'Direct consultation and design by director + Imported filler (Belotero/Juvederm) applied as needed without volume limit', zh: '院长直接咨询和设计 + 进口填充剂（贝洛特罗/乔雅登）按需定制，不限容量', ja: '院長による直接相談・デザイン + 輸入フィラー（ベロテロ/ジュビダーム）容量制限なく必要量をカスタム適用' },
    originalPrice: 5000000,
    discountedPrice: 4500000,
    sortOrder: 2,
  },
  {
    oldId: 'signature-program-3',
    newId: 'treatment-signature-design-lift',
    slug: 'signature-design-lift',
    name: { ko: '포에버 시그니처 디자인 리프트', en: 'Forever Signature Design Lift', zh: '永远签名设计提升', ja: 'フォーエバーシグネチャーデザインリフト' },
    tagline: { ko: '즉각적 리프팅, 하관 중심 퀵 리프팅', en: 'Immediate lifting, lower face-centered quick lifting', zh: '即时提升，以下面部为中心的快速提升', ja: '即効リフティング、下顔面中心のクイックリフティング' },
    keywords: { ko: '턱라인 · 팔자주름 · 마리오네트 · 눈밑', en: 'Jawline · Nasolabial folds · Marionette lines · Under-eye', zh: '下颌线 · 法令纹 · 木偶纹 · 眼下', ja: 'フェイスライン · ほうれい線 · マリオネットライン · 目の下' },
    description: { ko: '수술 부담은 줄이고 빠른 리프팅 체감 효과를 높여, 탄탄한 얼굴선과 정리된 하관 인상을 만들어주는 퀵 리프팅 패키지', en: 'A quick lifting package that reduces surgical burden and enhances fast lifting sensation, creating a firm facial line and neat lower face impression', zh: '减少手术负担，增强快速提升感，打造紧实面部轮廓和整洁下颌印象的快速提升套餐', ja: '手術の負担を減らし、素早いリフティング効果を高めて、引き締まった顔のラインと整った下顔部の印象を作るクイックリフティングパッケージ' },
    composition: { ko: '실리프팅 8줄 + 눈밑필러 + 팔자주름 잼버실 4줄 + 소프웨이브 턱선 100펄스', en: 'Thread lifting 8 threads + Under-eye filler + Nasolabial Juversyl 4 threads + Sofwave jawline 100 pulses', zh: '线雕8根 + 眼下填充 + 法令纹Juversyl 4根 + Sofwave下颌线100脉冲', ja: 'スレッドリフティング8本 + 目の下フィラー + ほうれい線ジュバーシル4本 + ソフウェーブフェイスライン100パルス' },
    originalPrice: 4400000,
    discountedPrice: 3390000,
    sortOrder: 3,
  },
  {
    oldId: 'signature-program-4',
    newId: 'treatment-signature-ai-poreless',
    slug: 'ai-poreless-lift',
    name: { ko: '포에버 AI 포어리스 리프트', en: 'Forever AI Poreless Lift', zh: '永远AI无毛孔提升', ja: 'フォーエバーAIポアレスリフト' },
    tagline: { ko: '모공·피부결·탄력 복합 개선', en: 'Pore, skin texture, and elasticity complex improvement', zh: '毛孔、肤质、弹性综合改善', ja: '毛穴・肌質・弾力の複合改善' },
    keywords: { ko: '모공 · 블랙헤드 · 피지 · 피부결 · 얕은 흉터', en: 'Pores · Blackheads · Sebum · Skin texture · Shallow scars', zh: '毛孔 · 黑头 · 皮脂 · 肤质 · 浅层疤痕', ja: '毛穴 · 黒ずみ · 皮脂 · 肌質 · 浅い瘢痕' },
    description: { ko: '당일 일상복귀가 가능한 여행 중 피부 부스팅 프로그램으로, 늘어진 탄력형 모공과 피부결을 리셋하고 수분광까지 회복시키는 프리미엄 토탈케어', en: 'A same-day return to daily life skin boosting program for travelers that resets enlarged pores and skin texture, and restores moisture glow', zh: '当天可恢复日常生活的旅行皮肤焕活项目，重置扩张的弹性毛孔和肤质，同时恢复水润光泽', ja: '当日日常復帰可能な旅行中の肌ブースティングプログラムで、たるんだ毛穴と肌質をリセットし水分ツヤまで回復させるプレミアムトータルケア' },
    composition: { ko: '울쎄라피 프라임 400샷 + 포텐자 펌핑팁 + 쥬베룩 4cc + 풀페이스 스킨보톡스(앨러간) + 하이드로페이셜 또는 커스텀 스킨케어', en: 'Ultherapy Prime 400 shots + Potenza Pumping Tip + Juvelouk 4cc + Full-face skin botox (Allergan) + Hydrofacial or Custom skincare', zh: '超声刀400发 + Potenza泵送针头 + 祛疤填充4cc + 全脸肤色肉毒素（艾尔建）+ 水光针或定制护肤', ja: 'ウルセラピープライム400ショット + ポテンザポンピングチップ + ジュベルーク4cc + フルフェイス肌ボトックス（アラガン）+ ハイドロフェイシャルまたはカスタムスキンケア' },
    originalPrice: 3000000,
    discountedPrice: 2180000,
    sortOrder: 4,
  },
  {
    oldId: 'signature-program-5',
    newId: 'treatment-signature-men-reboot',
    slug: 'men-total-reboot',
    name: { ko: '포에버 MEN 토탈 리부트', en: 'Forever MEN Total Reboot', zh: '永远男士全面重启', ja: 'フォーエバーMENトータルリブート' },
    tagline: { ko: '남성 전용 하관·피부 리셋', en: "Men's lower face and skin reset", zh: '男士下面部及肌肤重置', ja: '男性専用下顔面・肌リセット' },
    keywords: { ko: '턱라인 · 모공 · 피지 · 피부탄력 · 주름 (남성 전용)', en: 'Jawline · Pores · Sebum · Skin elasticity · Wrinkles (Men only)', zh: '下颌线 · 毛孔 · 皮脂 · 肌肤弹性 · 皱纹（男士专属）', ja: 'フェイスライン · 毛穴 · 皮脂 · 肌弾力 · シワ（男性専用）' },
    description: { ko: '넓고 거친 모공과 번들거리는 과다 피지를 정리하고, 남성형 페이스 컨투어 개선과 남자다운 입체감 회복을 통해 꾸민 티 없이 깔끔하고 선명한 인상을 만들어주는 맨즈 토탈 리부트 프로그램', en: "A men's total reboot program that clears wide and rough pores and excess sebum, improves masculine face contour, and restores manly three-dimensionality for a clean and sharp impression", zh: '整治宽大粗糙的毛孔和过多皮脂，改善男性面部轮廓，恢复男性立体感，打造整洁清晰印象的男士全面重启项目', ja: '広くて荒れた毛穴と脂っぽい過剰皮脂を整え、男性型フェイスコントゥア改善と男性らしい立体感の回復により、飾り気のないスッキリとした印象を作る男性専用トータルリブートプログラム' },
    composition: { ko: '울쎄라피 프라임 400샷 + 온다 10만줄 + 래디어스 OR 고우리 1실린지 + 맨즈 3종 보톡스(턱선, 모공, 미간) + 하이드로페이셜 또는 커스텀 스킨케어', en: 'Ultherapy Prime 400 shots + ONDA 100,000 pulses + Radiesse OR Gouri 1 syringe + Men\'s 3-type botox (jawline, pores, glabella) + Hydrofacial or Custom skincare', zh: '超声刀400发 + 欧达10万次 + Radiesse或Gouri 1支 + 男士三合一肉毒素（下颌线、毛孔、眉间）+ 水光针或定制护肤', ja: 'ウルセラピープライム400ショット + オンダ10万本 + ラジエスまたはゴウリ1シリンジ + メンズ3種ボトックス（フェイスライン、毛穴、眉間）+ ハイドロフェイシャルまたはカスタムスキンケア' },
    originalPrice: 3600000,
    discountedPrice: 3200000,
    sortOrder: 5,
  },
];

async function mutate(mutations) {
  const url = `https://${PROJECT_ID}.api.sanity.io/v2024-01-01/data/mutate/${DATASET}`;
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
  return json;
}

async function main() {
  // 1. treatment 문서 생성
  const createMutations = PROGRAMS.map((p) => ({
    createOrReplace: {
      _id: p.newId,
      _type: 'treatment',
      name: p.name,
      slug: { _type: 'slug', current: p.slug },
      category: 'signature',
      tagline: p.tagline,
      keywords: p.keywords,
      description: p.description,
      composition: p.composition,
      priceOptions: [
        {
          _type: 'priceOption',
          _key: 'pkg',
          name: { ko: '시그니처 패키지', en: 'Signature Package', zh: '签名套餐', ja: 'シグネチャーパッケージ' },
          price: p.originalPrice,
          discountPrice: p.discountedPrice,
        },
      ],
      isSignature: true,
      isEvent: false,
      isVisible: true,
      sortOrder: p.sortOrder,
    },
  }));

  console.log('1. Creating treatment documents...');
  const createResult = await mutate(createMutations);
  console.log('Created:', createResult.results.map((r) => r.operation).join(', '));

  // 2. 기존 signatureProgram 문서 삭제
  const deleteMutations = PROGRAMS.map((p) => ({
    delete: { id: p.oldId },
  }));

  console.log('2. Deleting old signatureProgram documents...');
  const deleteResult = await mutate(deleteMutations);
  console.log('Deleted:', deleteResult.results.map((r) => r.operation).join(', '));

  console.log('Migration complete!');
}

main().catch(console.error);
