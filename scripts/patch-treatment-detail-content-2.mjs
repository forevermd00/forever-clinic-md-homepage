import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// .env.local 수동 로드 (dotenv 미설치 환경 대응)
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  // .env.local 없으면 환경변수 직접 사용
}

const token =
  process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

if (!token) {
  console.error('ERROR: SANITY_WRITE_TOKEN 또는 SANITY_API_TOKEN 환경변수가 필요합니다.');
  process.exit(1);
}

const client = createClient({
  projectId: 'ecoamz42',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  token,
  apiVersion: '2024-01-01',
  useCdn: false,
});

let keyCounter = 0;
function k() {
  return `dpc2-${++keyCounter}`;
}

function ls(ko, en, zh, ja) {
  return { _type: 'localizedString', _key: k(), ko, en, zh: zh ?? ko, ja: ja ?? ko };
}

function lt(ko, en, zh, ja) {
  return { _type: 'localizedText', ko, en, zh: zh ?? ko, ja: ja ?? ko };
}

function faqItem(qKo, qEn, qZh, qJa, aKo, aEn, aZh, aJa) {
  return {
    _type: 'faqItem',
    _key: k(),
    question: { _type: 'localizedString', ko: qKo, en: qEn, zh: qZh ?? qKo, ja: qJa ?? qKo },
    answer: { _type: 'localizedString', ko: aKo, en: aEn, zh: aZh ?? aKo, ja: aJa ?? aKo },
  };
}

// ──────────────────────────────────────────────
// 24개 시술 데이터 정의
// ──────────────────────────────────────────────

const treatments = [
  // 1. 에어녹스 반수면마취
  {
    id: 'treatment-airnox',
    data: {
      description: lt(
        '아산화질소(N2O)와 산소를 혼합하여 흡입하는 방식의 경미한 진정 마취입니다. 프로포폴 수면마취보다 의식 저하 정도가 낮아 반수면 상태에서 시술을 받을 수 있습니다. 금식이 필요 없고 시술 후 빠르게 회복되어 대부분의 경우 직접 귀가가 가능합니다.',
        'A mild sedation method using inhaled nitrous oxide (N2O) mixed with oxygen. It induces a lighter level of sedation than propofol, allowing treatment in a semi-conscious state. No fasting is required, and recovery is rapid—most patients can travel home on their own after treatment.',
        '一种通过吸入氧化亚氮（N2O）与氧气混合气体实现的轻度镇静方式。意识抑制程度低于丙泊酚，可在半清醒状态下完成治疗。无需空腹，恢复迅速，大多数情况下可自行回家。',
        '亜酸化窒素（N2O）と酸素の混合ガスを吸入する軽度の鎮静方法です。プロポフォール麻酔より意識の低下が少なく、半覚醒状態で施術を受けられます。絶食不要で回復も早く、ほとんどの場合そのままご帰宅いただけます。',
      ),
      features: [
        ls('시술 중 불안·통증 완화로 편안한 경험', 'Reduced anxiety and pain for a more comfortable treatment experience', '缓解施术中的不安与疼痛，带来舒适体验', '施術中の不安・痛みを軽減し、快適な体験を提供します'),
        ls('금식 불필요, 시술 전 일상 유지 가능', 'No fasting required—maintain your normal routine before treatment', '无需空腹，施术前可正常生活', '絶食不要で、施術前も普段通りの生活が可能です'),
        ls('빠른 회복으로 당일 귀가 가능', 'Rapid recovery allows same-day discharge', '恢复迅速，当日即可回家', '回復が早く、当日にそのままご帰宅いただけます'),
        ls('프로포폴 대비 부작용 위험 낮음', 'Lower risk of side effects compared to propofol sedation', '与丙泊酚相比，副作用风险更低', 'プロポフォールと比べて副作用のリスクが低いです'),
      ],
      recommendedFor: [
        ls('통증에 민감하여 시술이 두려운 분', 'Those sensitive to pain who feel apprehensive about treatments', '对疼痛敏感、对施术感到不安的人', '痛みに敏感で施術が不安な方'),
        ls('금식이 어려운 일정에 시술을 받아야 할 때', 'When fasting is difficult to accommodate in your schedule', '日程紧张、难以空腹的情况下需要接受施术时', '絶食が難しいスケジュールで施術を受けたい場合'),
        ls('프로포폴 수면마취보다 가벼운 진정을 원하는 분', 'Those who prefer lighter sedation over full propofol sedation', '希望比丙泊酚麻醉更轻度镇静的人', 'プロポフォールより軽い鎮静を希望する方'),
        ls('시술 후 바로 귀가가 필요한 분', 'Those who need to travel home independently right after treatment', '施术后需要立即自行回家的人', '施術後すぐに自分で帰宅が必要な方'),
      ],
      procedure: [
        ls('상담 및 건강 상태 확인', 'Consultation and health status check', '咨询及健康状况确认', 'カウンセリングと健康状態の確認'),
        ls('코 마스크 착용 후 아산화질소·산소 혼합 가스 흡입 시작', 'Place nasal mask and begin inhaling nitrous oxide and oxygen mixture', '佩戴鼻罩，开始吸入氧化亚氮与氧气混合气体', '鼻マスクを装着し、亜酸化窒素・酸素混合ガスの吸入を開始'),
        ls('2~3분 내 진정 효과 발현, 반수면 상태 유지', 'Sedation takes effect within 2–3 minutes; semi-conscious state maintained', '2~3分钟内产生镇静效果，维持半清醒状态', '2〜3分以内に鎮静効果が現れ、半覚醒状態を維持'),
        ls('시술 진행', 'Treatment performed', '进行施术', '施術を実施'),
        ls('순수 산소 흡입 전환으로 빠른 회복', 'Switch to pure oxygen for rapid recovery', '切换为纯氧吸入，快速恢复', '純酸素吸入に切り替えて迅速に回復'),
        ls('회복 확인 후 귀가', 'Confirm recovery and discharge', '确认恢复后离院', '回復を確認してからご帰宅'),
      ],
      precautions: [
        ls('임신 중 또는 코막힘 심한 경우 시술 불가, 사전 고지 필수', 'Not suitable during pregnancy or with severe nasal congestion; must inform in advance', '妊娠中或鼻塞严重者不可施术，须提前告知', '妊娠中または鼻づまりがひどい場合は施術不可、事前申告が必須です'),
        ls('폐쇄공포증·비타민 B12 결핍 시 사전 상담 필요', 'Consult in advance if you have claustrophobia or vitamin B12 deficiency', '患有幽闭恐惧症或维生素B12缺乏症时，需提前咨询', '閉所恐怖症・ビタミンB12欠乏症がある場合は事前相談が必要です'),
        ls('시술 당일 음주 금지', 'No alcohol on the day of treatment', '施术当日禁止饮酒', '施術当日は飲酒禁止です'),
        ls('일부 민감한 분은 오심·어지러움 발생 가능, 완화 시까지 안정', 'Some may experience nausea or dizziness; rest until symptoms subside', '部分敏感人士可能出现恶心或头晕，症状缓解前请休息', '敏感な方は吐き気・めまいが生じる場合があります。症状が落ち着くまでお休みください'),
      ],
      faq: [
        faqItem(
          '수면마취와 어떻게 다른가요?', 'How is it different from full sedation?',
          '与全身麻醉有什么区别？', '全身麻酔とどう違いますか？',
          '프로포폴 수면마취는 의식이 완전히 없어지는 반면, 에어녹스는 반수면 상태로 의료진과 간단한 의사소통이 가능합니다. 금식도 필요 없어 일정이 자유롭습니다.',
          'Propofol sedation results in complete loss of consciousness, whereas AirNox maintains a semi-conscious state where you can communicate briefly with staff. No fasting is required, giving you scheduling flexibility.',
          '丙泊酚麻醉会完全失去意识，而爱尔诺斯可在半清醒状态下与医护人员进行简单沟通。无需空腹，时间安排更灵活。',
          'プロポフォール麻酔は意識が完全になくなりますが、エアノックスは半覚醒状態でスタッフと簡単なやり取りが可能です。絶食も不要でスケジュールの自由度が高いです。',
        ),
        faqItem(
          '시술 후 바로 운전할 수 있나요?', 'Can I drive right after treatment?',
          '施术后可以立即驾车吗？', '施術後すぐに運転できますか？',
          '회복이 빠르고 대부분 귀가가 가능하지만, 개인차가 있으므로 회복 상태 확인 후 의료진 안내에 따라주세요.',
          'Recovery is rapid and most patients can travel home independently, but individual responses vary. Please follow the guidance of medical staff after confirming your recovery status.',
          '恢复较快，大多数人可以自行回家，但个体差异存在，请在确认恢复状态后遵从医护人员的指导。',
          '回復は早く多くの方が自力で帰宅できますが、個人差があります。回復状態を確認のうえ、スタッフの案内に従ってください。',
        ),
        faqItem(
          '어떤 시술에 에어녹스를 적용할 수 있나요?', 'Which treatments can be combined with AirNox?',
          '爱尔诺斯可以配合哪些施术使用？', 'どのような施術にエアノックスを併用できますか？',
          '울쎄라, 써마지, 보톡스, 필러 등 다양한 시술에 병행 가능합니다. 상담을 통해 적합 여부를 확인하세요.',
          'It can be combined with various treatments including Ultherapy, Thermage, Botox, and filler. Suitability can be confirmed through consultation.',
          '可与超声刀、热玛吉、肉毒素、填充剂等多种施术配合使用。请通过咨询确认是否适合。',
          'ウルセラ、サーマジ、ボトックス、フィラーなど様々な施術と併用可能です。詳しくはカウンセリングでご確認ください。',
        ),
        faqItem(
          '효과가 느껴지지 않으면 어떻게 하나요?', 'What if I do not feel the sedation effect?',
          '如果感觉不到效果该怎么办？', '効果を感じない場合はどうすればよいですか？',
          '가스 농도를 조절할 수 있어 상태에 따라 조정 가능합니다. 진정이 불충분하면 의료진에게 바로 알려주세요.',
          'Gas concentration can be adjusted based on your response. If sedation feels insufficient, notify medical staff immediately.',
          '可以调节气体浓度，根据状态进行调整。如果镇静效果不足，请立即告知医护人员。',
          'ガス濃度を調整できるため、状態に応じて対応可能です。鎮静が不十分と感じたらすぐにスタッフへお知らせください。',
        ),
      ],
    },
  },

  // 2. 아쿠아필
  {
    id: 'treatment-aquapeel',
    data: {
      description: lt(
        '각질 제거, 피지 흡입, 영양 주입을 3단계로 동시에 진행하는 피부 관리 시술입니다. 특수 나선형 팁이 모공 속 피지와 노폐물을 흡입하는 동시에 피부에 맞춤 영양 앰플을 주입해 클렌징과 수분 공급을 한 번에 해결합니다. 블랙헤드·화이트헤드·모공 관리에 특히 효과적입니다.',
        'A skin care treatment that simultaneously performs three steps: exfoliation, sebum suction, and nutrient infusion. A specialized spiral tip suctions sebum and impurities from pores while infusing customized nutrient ampoules, addressing cleansing and hydration in a single session. Particularly effective for blackheads, whiteheads, and pore management.',
        '同步进行去角质、吸附皮脂、注入营养三个步骤的皮肤护理项目。专用螺旋头在吸出毛孔深处皮脂和废物的同时注入定制营养安瓶，一次完成清洁与补水。对黑头、白头及毛孔管理尤为有效。',
        '角質除去・皮脂吸引・栄養注入を3ステップで同時に行うスキンケア施術です。専用スパイラルチップが毛穴の皮脂と老廃物を吸引しながら、カスタム栄養アンプルを注入し、クレンジングと保湿を一度に実現します。黒ずみ・白ニキビ・毛穴ケアに特に効果的です。',
      ),
      features: [
        ls('블랙헤드·화이트헤드 제거 및 모공 청결', 'Removal of blackheads and whiteheads with thorough pore cleansing', '去除黑头、白头，彻底清洁毛孔', '黒ずみ・白ニキビの除去と毛穴の徹底クレンジング'),
        ls('맞춤 영양 앰플 주입으로 수분·탄력 개선', 'Improved hydration and elasticity through customized nutrient ampoule infusion', '注入定制营养安瓶，改善水分与弹力', 'カスタム栄養アンプル注入で保湿・弾力を改善'),
        ls('피부결 정돈 및 피부톤 균일화', 'Refined skin texture and more even skin tone', '改善肤质、均匀肤色', '肌のキメを整え、トーンを均一に'),
        ls('피지 과다 분비 조절', 'Regulation of excess sebum production', '调节皮脂过度分泌', '皮脂の過剰分泌を抑制'),
      ],
      recommendedFor: [
        ls('블랙헤드·모공이 신경 쓰이는 분', 'Those bothered by blackheads or enlarged pores', '困扰于黑头或毛孔粗大的人', '黒ずみや毛穴が気になる方'),
        ls('피부가 칙칙하고 피부결이 고르지 않을 때', 'When skin looks dull and texture is uneven', '肤色暗沉、肤质不均匀时', '肌がくすんで肌のキメが不均一なとき'),
        ls('피지가 많고 트러블이 자주 생기는 분', 'Those with excess sebum and frequent breakouts', '皮脂分泌旺盛、易长痘的人', '皮脂が多くニキビができやすい方'),
        ls('다운타임 없이 피부 관리를 받고 싶을 때', 'When you want skin care with no downtime', '希望零恢复期接受皮肤管理时', 'ダウンタイムなしでスキンケアを受けたいとき'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('피부 타입에 맞는 클렌징 솔루션 선택', 'Select cleansing solution suited to skin type', '根据肤质选择清洁溶液', '肌タイプに合わせたクレンジングソリューションを選択'),
        ls('나선형 팁으로 각질 제거 및 피지 흡입', 'Exfoliation and sebum suction using spiral tip', '使用螺旋头去除角质并吸附皮脂', 'スパイラルチップで角質除去と皮脂吸引'),
        ls('맞춤 영양 앰플 동시 주입', 'Simultaneous infusion of customized nutrient ampoule', '同步注入定制营养安瓶', 'カスタム栄養アンプルを同時注入'),
        ls('진정 마스크 후 보습 마무리', 'Soothing mask followed by moisturizing finish', '镇静面膜后保湿收尾', '鎮静マスク後に保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 당일 과도한 열 자극(사우나·찜질방) 자제', 'Avoid excessive heat stimulation (sauna, jjimjilbang) on treatment day', '施术当日避免过度热刺激（桑拿、汗蒸房）', '施術当日はサウナ・チムジルバンなどの過度な熱刺激を避けてください'),
        ls('시술 후 자외선 차단제 꼼꼼히 도포', 'Apply sunscreen thoroughly after treatment', '施术后认真涂抹防晒霜', '施術後は日焼け止めをしっかり塗布してください'),
        ls('활성 여드름·피부 염증 심한 경우 사전 상담 필요', 'Consult in advance if you have active acne or significant skin inflammation', '活动性痤疮或皮肤炎症严重时，需提前咨询', '活性ニキビや肌の炎症がひどい場合は事前相談が必要です'),
        ls('시술 후 당일 강한 스크럽·필링 제품 사용 자제', 'Avoid strong scrubs or peeling products on treatment day', '施术当日避免使用强效磨砂或去角质产品', '施術当日は強いスクラブ・ピーリング製品の使用を避けてください'),
      ],
      faq: [
        faqItem(
          '아쿠아필과 일반 클렌징의 차이는 무엇인가요?', 'How is Aquapeel different from regular cleansing?',
          '水光针洁肤与普通洁面有什么区别？', 'アクアピールと普通の洗顔の違いは何ですか？',
          '일반 클렌징은 표면 세안에 그치지만, 아쿠아필은 모공 깊숙이 피지와 노폐물을 흡입하는 동시에 영양 앰플을 주입합니다. 클렌징과 보습 관리를 동시에 받을 수 있습니다.',
          'Regular cleansing only addresses the surface, while Aquapeel deeply suctions sebum and impurities from within pores while simultaneously infusing nutrient ampoules—combining cleansing and hydration care in one step.',
          '普通洁面只停留在表面清洁，而水光针洁肤能深入毛孔吸附皮脂和废物，同时注入营养安瓶，一次完成清洁与保湿护理。',
          '普通の洗顔は表面のクレンジングにとどまりますが、アクアピールは毛穴の奥から皮脂と老廃物を吸引しながら栄養アンプルを注入し、クレンジングと保湿ケアを同時に行えます。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often should I get this treatment?',
          '多久做一次比较好？', 'どのくらいの頻度で受ければよいですか？',
          '피부 상태에 따라 다르지만 2~4주 간격으로 정기 관리를 권장합니다.',
          'Depending on skin condition, regular maintenance every 2–4 weeks is recommended.',
          '根据肤质状况而定，建议每2~4周定期护理一次。',
          '肌の状態によりますが、2〜4週間ごとの定期ケアをお勧めします。',
        ),
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '거의 없습니다. 시술 후 가벼운 홍조가 있을 수 있으나 수 시간 내 완화됩니다.',
          'Minimal. Mild redness may occur after treatment but subsides within a few hours.',
          '几乎没有。施术后可能出现轻微泛红，数小时内即可缓解。',
          'ほとんどありません。施術後に軽い赤みが出ることがありますが、数時間以内に落ち着きます。',
        ),
        faqItem(
          '민감성 피부도 받을 수 있나요?', 'Is it suitable for sensitive skin?',
          '敏感肌也可以做吗？', '敏感肌でも受けられますか？',
          '네, 피부 타입에 맞는 솔루션을 선택하여 진행하므로 민감성 피부도 가능합니다. 사전 상담을 통해 확인하세요.',
          'Yes, solutions are selected to match your skin type, making it suitable for sensitive skin as well. Please confirm through prior consultation.',
          '可以，我们会根据肤质选择适合的溶液，敏感肌同样适用。请通过事前咨询进行确认。',
          'はい、肌タイプに合わせたソリューションを選んで施術するため、敏感肌の方も対応可能です。事前カウンセリングでご確認ください。',
        ),
      ],
    },
  },

  // 3. 인텐스울트라
  {
    id: 'treatment-intense-ultra',
    data: {
      description: lt(
        'HIFU(고강도 집속 초음파) 에너지로 피부 리프팅과 탄력을 개선하면서 피부톤까지 동시에 케어하는 복합 장비입니다. 울쎄라와 유사한 초음파 원리를 적용하되 다양한 카트리지로 피부 깊이에 따라 맞춤 에너지를 전달합니다. 진입장벽을 낮춰 처음 HIFU 리프팅을 시작하는 분들에게 적합합니다.',
        'A multi-functional device that uses HIFU (High-Intensity Focused Ultrasound) energy to improve skin lifting and elasticity while simultaneously addressing skin tone. Applying the same ultrasound principle as Ultherapy, it delivers customized energy to varying skin depths using interchangeable cartridges. Its accessible approach makes it well-suited for those beginning HIFU lifting for the first time.',
        '利用HIFU（高强度聚焦超声）能量改善皮肤提升和弹力，同时护理肤色的复合仪器。采用与超声刀相似的超声原理，通过多种探头向不同皮肤深度传递定制能量。入门门槛低，适合首次尝试HIFU提升的人群。',
        'HIFU（高密度焦点式超音波）エネルギーで肌のリフティングと弾力を改善しながら、肌トーンまで同時にケアする複合機器です。ウルセラと同様の超音波原理を採用し、さまざまなカートリッジで肌の深さに応じたカスタムエネルギーを届けます。初めてHIFUリフティングを始める方に適しています。',
      ),
      features: [
        ls('피부 리프팅 및 탄력 개선', 'Improved skin lifting and elasticity', '改善皮肤提升与弹力', '肌のリフティングと弾力を改善'),
        ls('피부톤 밝아짐 및 피부결 개선', 'Brighter skin tone and improved skin texture', '肤色提亮、肤质改善', '肌のトーンアップとキメの改善'),
        ls('얼굴 윤곽 및 처짐 개선', 'Improved facial contours and reduced sagging', '改善面部轮廓及松弛', '顔のたるみと輪郭を改善'),
        ls('다양한 깊이 맞춤 에너지 전달', 'Customized energy delivery to various skin depths', '向不同深度传递定制能量', '様々な深度へのカスタムエネルギー照射'),
      ],
      recommendedFor: [
        ls('처음 HIFU 리프팅을 시도하는 분', 'Those trying HIFU lifting for the first time', '首次尝试HIFU提升的人', '初めてHIFUリフティングを試みる方'),
        ls('피부 탄력이 저하되고 처짐이 느껴질 때', 'When skin elasticity has decreased and sagging is noticeable', '皮肤弹力下降、感到松弛时', '肌の弾力が低下しているとき'),
        ls('리프팅과 피부톤 개선을 동시에 원할 때', 'When you want both lifting and skin tone improvement', '希望同时改善提升效果和肤色时', 'リフティングと肌トーン改善を同時に望む場合'),
        ls('수술 없이 비침습적 리프팅을 원할 때', 'When you want non-invasive lifting without surgery', '希望无需手术的非侵入性提升时', '手術なしの非侵襲的リフティングを希望するとき'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('마취 크림 도포 30~40분', 'Anesthetic cream applied for 30–40 minutes', '涂抹麻醉膏30~40分钟', '麻酔クリームを30〜40分塗布'),
        ls('피부 상태에 따라 카트리지 선택 및 에너지 설정', 'Select cartridge and set energy based on skin condition', '根据皮肤状态选择探头并设置能量', '肌の状態に応じてカートリッジを選択しエネルギーを設定'),
        ls('부위별 HIFU 에너지 조사', 'HIFU energy application by treatment zone', '按部位照射HIFU能量', '部位ごとにHIFUエネルギーを照射'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '施术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を避けてください'),
        ls('시술 직후 홍반·부종·따끔함은 수 시간 내 완화', 'Redness, swelling, and tingling after treatment resolve within a few hours', '施术后即时出现的红斑、浮肿、刺痛感将在数小时内缓解', '施術直後の赤み・腫れ・ひりつきは数時間以内に落ち着きます'),
        ls('외출 시 자외선 차단제 필수 도포', 'Sunscreen is essential when going outdoors', '外出时必须涂抹防晒霜', '外出時は日焼け止めが必須です'),
        ls('임플란트·금속 삽입물 보유 시 사전 고지', 'Inform staff in advance if you have implants or metal inserts', '有植入物或金属内植物时须提前告知', 'インプラント・金属挿入物がある場合は事前申告が必要です'),
      ],
      faq: [
        faqItem(
          '울쎄라와 어떻게 다른가요?', 'How is it different from Ultherapy?',
          '与超声刀有什么区别？', 'ウルセラとどう違いますか？',
          '울쎄라는 DeepSEE™ 실시간 이미징으로 피부 구조를 확인하며 시술하는 프리미엄 장비이고, 인텐스울트라는 유사한 HIFU 원리로 보다 접근하기 쉬운 비용으로 리프팅 효과를 기대할 수 있습니다.',
          "Ultherapy is a premium device that uses DeepSEE™ real-time imaging to visualize skin structure during treatment. Intense Ultra applies a similar HIFU principle and delivers lifting results at a more accessible price point.",
          '超声刀是利用DeepSEE™实时成像确认皮肤结构的高端仪器，而英特斯超声采用类似HIFU原理，以更亲民的价格实现提升效果。',
          'ウルセラはDeepSEE™リアルタイムイメージングで肌の構造を確認しながら施術するプレミアム機器で、インテンスウルトラは同様のHIFU原理をより手頃な価格でご利用いただける機器です。',
        ),
        faqItem(
          '효과는 언제 나타나나요?', 'When do results appear?',
          '效果什么时候出现？', '効果はいつ現れますか？',
          '시술 후 1~3개월에 걸쳐 점진적으로 나타나며, 3~6개월 시점에 최대 효과를 확인할 수 있습니다.',
          'Results develop gradually over 1–3 months after treatment, with peak effects visible around 3–6 months.',
          '施术后1~3个月逐渐显现，3~6个月时可确认最佳效果。',
          '施術後1〜3ヶ月かけて徐々に現れ、3〜6ヶ月時点で最大の効果を確認できます。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often is treatment recommended?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるのが良いですか？',
          '6개월~1년 간격을 권장합니다. 개인 피부 상태에 따라 달라질 수 있습니다.',
          'Every 6 months to 1 year is recommended. Frequency may vary based on individual skin condition.',
          '建议每6个月至1年接受一次。可根据个人皮肤状态调整。',
          '6ヶ月〜1年ごとをお勧めします。個人の肌の状態によって異なる場合があります。',
        ),
      ],
    },
  },

  // 4. 하이드로페이셜
  {
    id: 'treatment-hydrafacial',
    data: {
      description: lt(
        '미국 BeautyHealth社의 정품 Vortex 시스템으로 각질 제거, 딥 클렌징, 수분 공급을 동시에 진행하는 피부 관리 시술입니다. 독특한 소용돌이(Vortex) 흡입 방식이 모공 속 피지와 노폐물을 효과적으로 제거하는 동시에 피부에 필요한 성분을 깊이 주입합니다. 피부 타입에 관계없이 적용 가능하며 즉각적인 광채 효과를 기대할 수 있습니다.',
        "A skin treatment using BeautyHealth's authentic Vortex system that simultaneously exfoliates, deep-cleanses, and hydrates. The unique vortex suction method effectively removes sebum and impurities from deep within pores while infusing essential ingredients into the skin. Suitable for all skin types, with an immediately visible radiance effect.",
        '采用美国BeautyHealth正品Vortex系统，同步进行去角质、深层清洁、补水的皮肤护理项目。独特的旋涡式吸附方式有效清除毛孔深处的皮脂和废物，同时深层注入肌肤所需成分。适用于所有肤质，可期待即时光泽效果。',
        '米国BeautyHealthの正規Vortexシステムを使用し、角質除去・ディープクレンジング・保湿を同時に行うスキンケア施術です。独自のボルテックス吸引方式が毛穴の皮脂と老廃物を効果的に除去しながら、肌に必要な成分を深く注入します。すべての肌タイプに対応し、即時の輝き効果が期待できます。',
      ),
      features: [
        ls('즉각적인 피부 광채 및 투명감 개선', 'Immediate improvement in skin radiance and clarity', '即时改善皮肤光泽与透明感', '即時の肌の輝きと透明感の改善'),
        ls('모공 딥클렌징 및 블랙헤드 제거', 'Deep pore cleansing and blackhead removal', '毛孔深层清洁及去除黑头', '毛穴のディープクレンジングと黒ずみ除去'),
        ls('집중 수분 공급으로 피부 탄력 개선', 'Improved skin elasticity through intensive hydration', '集中补水改善皮肤弹力', '集中保湿で肌の弾力を改善'),
        ls('피부톤 균일화 및 피부결 정돈', 'More even skin tone and refined skin texture', '均匀肤色、改善肤质', '肌のトーンを均一にしてキメを整える'),
      ],
      recommendedFor: [
        ls('피부가 칙칙하고 즉각적인 광채를 원할 때', 'When skin looks dull and you want immediate radiance', '肤色暗沉、希望即时焕发光泽时', '肌がくすんでいて即時の輝きを求めるとき'),
        ls('모공·피지·블랙헤드 관리가 필요할 때', 'When pore, sebum, and blackhead management is needed', '需要毛孔、皮脂、黑头管理时', '毛穴・皮脂・黒ずみのケアが必要なとき'),
        ls('중요한 행사 전 피부 컨디션을 높이고 싶을 때', 'When you want to boost skin condition before an important event', '重要活动前希望提升皮肤状态时', '大切なイベント前に肌の状態を整えたいとき'),
        ls('다운타임 없이 피부 관리를 원할 때', 'When you want skin care with no downtime', '希望零恢复期接受皮肤管理时', 'ダウンタイムなしでスキンケアを受けたいとき'),
      ],
      procedure: [
        ls('세안 및 클렌징', 'Cleansing', '洗脸及清洁', '洗顔・クレンジング'),
        ls('Vortex 필링 팁으로 각질 제거', 'Exfoliation with Vortex peeling tip', '使用Vortex去角质头去除角质', 'Vortexピーリングチップで角質除去'),
        ls('Vortex 추출 팁으로 모공 속 피지·노폐물 흡입', 'Sebum and impurity suction from pores using Vortex extraction tip', '使用Vortex提取头吸附毛孔内皮脂和废物', 'Vortex抽出チップで毛穴の皮脂・老廃物を吸引'),
        ls('맞춤 부스터 세럼 주입', 'Infusion of customized booster serum', '注入定制精华液', 'カスタムブースターセラムを注入'),
        ls('LED 광선 치료 또는 진정 마스크 후 보습 마무리', 'LED light therapy or soothing mask, then moisturizing finish', 'LED光疗或镇静面膜后保湿收尾', 'LED光線治療または鎮静マスク後に保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 당일 강한 열 자극 자제', 'Avoid strong heat stimulation on treatment day', '施术当日避免强热刺激', '施術当日は強い熱刺激を避けてください'),
        ls('시술 후 자외선 차단제 필수 도포', 'Sunscreen is essential after treatment', '施术后必须涂抹防晒霜', '施術後は日焼け止めが必須です'),
        ls('활성 여드름·피부 염증 심한 경우 사전 상담', 'Consult in advance if you have active acne or significant inflammation', '活动性痤疮或皮肤炎症严重时需提前咨询', '活性ニキビや肌の炎症がひどい場合は事前相談が必要です'),
        ls('레티놀 등 강한 성분 제품 당일 사용 자제', 'Avoid products with strong ingredients such as retinol on treatment day', '施术当日避免使用含视黄醇等刺激性成分的产品', '施術当日はレチノールなど刺激の強い成分の製品を避けてください'),
      ],
      faq: [
        faqItem(
          '효과가 얼마나 지속되나요?', 'How long do results last?',
          '效果能持续多久？', '効果はどのくらい持続しますか？',
          '즉각적인 효과는 1~2주 지속됩니다. 4주 간격 정기 관리로 효과를 지속시키는 것을 권장합니다.',
          'The immediate effect lasts 1–2 weeks. Regular maintenance every 4 weeks is recommended to sustain results.',
          '即时效果可持续1~2周。建议每4周进行定期护理以维持效果。',
          '即時効果は1〜2週間持続します。4週間ごとの定期ケアで効果を維持することをお勧めします。',
        ),
        faqItem(
          '다른 시술과 병행 가능한가요?', 'Can it be combined with other treatments?',
          '可以与其他施术搭配进行吗？', '他の施術と併用できますか？',
          '네, 레이저나 리프팅 시술 전후 피부 컨디셔닝으로 활용하기도 합니다.',
          'Yes, it is often used as skin conditioning before or after laser or lifting treatments.',
          '可以，也常用作激光或提升施术前后的皮肤调理。',
          'はい、レーザーやリフティング施術の前後のスキンコンディショニングとしても活用されます。',
        ),
        faqItem(
          '민감성·건성 피부도 가능한가요?', 'Is it suitable for sensitive or dry skin?',
          '敏感肌或干性肌肤也可以做吗？', '敏感肌・乾燥肌でも受けられますか？',
          '네, 피부 타입에 맞는 세럼을 선택하여 진행하므로 민감성·건성 피부도 안전하게 받을 수 있습니다.',
          'Yes, serums are selected to suit your skin type, making it safe for sensitive and dry skin.',
          '可以，我们会根据肤质选择适合的精华液，敏感肌和干性肌肤均可安全进行。',
          'はい、肌タイプに合わせたセラムを選んで施術するため、敏感肌・乾燥肌の方も安心して受けられます。',
        ),
      ],
    },
  },

  // 5. 지방분해주사
  {
    id: 'treatment-fat-dissolving',
    data: {
      description: lt(
        '포스파티딜콜린(PC)과 데옥시콜산(DC) 계열 성분을 주사로 주입하여 지방세포막을 분해하는 시술입니다. 분해된 지방세포는 체내 대사 과정을 통해 자연 배출됩니다. 이중턱, 볼 지방, 턱선 주변 국소 지방에 집중적으로 적용하며, 시술을 반복할수록 효과가 누적됩니다.',
        'A treatment that injects phosphatidylcholine (PC) and deoxycholic acid (DC) compounds to break down fat cell membranes. The dissolved fat cells are then naturally eliminated through the body\'s metabolic processes. Applied primarily to localized fat areas such as double chin, cheek fat, and jawline—effects accumulate with repeated sessions.',
        '通过注射磷脂酰胆碱（PC）和脱氧胆酸（DC）成分分解脂肪细胞膜的项目。被分解的脂肪细胞通过体内代谢自然排出。主要针对双下巴、面颊脂肪、下颌线周围局部脂肪，重复施术效果累积显著。',
        'ホスファチジルコリン（PC）とデオキシコール酸（DC）系の成分を注射し、脂肪細胞膜を分解する施術です。分解された脂肪細胞は体内の代謝を通じて自然に排出されます。二重あご・頬の脂肪・フェイスライン周辺の部分脂肪に集中的に適用し、繰り返すほど効果が蓄積されます。',
      ),
      features: [
        ls('이중턱·볼 지방 감소로 얼굴 윤곽 개선', 'Reduced double chin and cheek fat for a more defined facial contour', '减少双下巴和面颊脂肪，改善面部轮廓', '二重あご・頬の脂肪を減らし、フェイスラインを改善'),
        ls('국소 지방 분해 및 자연 배출', 'Breakdown and natural elimination of localized fat', '局部脂肪分解并自然排出', '部分脂肪の分解と自然な排出'),
        ls('반복 시술로 효과 누적', 'Cumulative results with repeated sessions', '重复施术效果累积', '繰り返し施術で効果が蓄積'),
        ls('수술 없이 라인 개선 가능', 'Line improvement without surgery', '无需手术即可改善轮廓', '手術なしでラインを改善'),
      ],
      recommendedFor: [
        ls('이중턱이 생겨 턱선이 무너진 분', 'Those with a double chin and a less defined jawline', '出现双下巴、下颌线不清晰的人', '二重あごでフェイスラインが崩れた方'),
        ls('볼 지방이 많아 얼굴이 크고 둥글어 보이는 분', 'Those whose face looks large or round due to excess cheek fat', '面颊脂肪多、脸看起来大而圆的人', '頬の脂肪が多くて顔が大きく丸く見える方'),
        ls('수술 없이 부분 지방을 줄이고 싶은 분', 'Those who want to reduce localized fat without surgery', '希望无需手术减少局部脂肪的人', '手術なしで部分脂肪を減らしたい方'),
        ls('다이어트로 빠지지 않는 부위 지방이 고민인 분', 'Those with stubborn fat that does not respond to diet', '困扰于节食也无法消除的局部脂肪的人', 'ダイエットでは落ちない部位の脂肪が悩みの方'),
      ],
      procedure: [
        ls('부위 확인 및 주입 포인트 설계', 'Assess target area and map injection points', '确认部位并设计注射点', '部位の確認と注入ポイントの設計'),
        ls('마취 크림 도포 또는 냉각 처리', 'Apply anesthetic cream or cooling', '涂抹麻醉膏或冷却处理', '麻酔クリーム塗布またはクーリング'),
        ls('지방분해 성분 정밀 주입', 'Precise injection of fat-dissolving compound', '精准注射脂肪分解成分', '脂肪溶解成分を精密に注入'),
        ls('주입 부위 가볍게 마사지', 'Gentle massage of injection sites', '轻柔按摩注射部位', '注入部位を軽くマッサージ'),
        ls('진정 케어 후 마무리', 'Soothing care and finish', '镇静护理后收尾', '鎮静ケアでフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 3~7일 붓기·멍·통증 발생 가능 (자연 완화)', 'Swelling, bruising, and discomfort may occur for 3–7 days, resolving naturally', '施术后3~7天可能出现浮肿、瘀青和疼痛（自然缓解）', '施術後3〜7日間は腫れ・あざ・痛みが生じることがあります（自然に改善）'),
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '施术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を避けてください'),
        ls('임신·수유 중 시술 불가', 'Not available during pregnancy or breastfeeding', '妊娠或哺乳期间不可施术', '妊娠・授乳中は施術不可です'),
        ls('간·신장 기능 이상 시 사전 고지 필수', 'Must inform staff in advance of liver or kidney conditions', '肝肾功能异常时须提前告知', '肝臓・腎臓の機能異常がある場合は事前申告が必須です'),
      ],
      faq: [
        faqItem(
          '효과는 언제 나타나나요?', 'When do results appear?',
          '效果什么时候出现？', '効果はいつ現れますか？',
          '시술 후 2~4주에 걸쳐 점진적으로 나타납니다. 효과를 충분히 보려면 2~4회 반복 시술을 권장합니다.',
          'Results appear gradually over 2–4 weeks after treatment. 2–4 sessions are recommended for optimal results.',
          '施术后2~4周内逐渐显现。为取得充分效果，建议重复施术2~4次。',
          '施術後2〜4週間かけて徐々に現れます。十分な効果を得るには2〜4回の繰り返し施術をお勧めします。',
        ),
        faqItem(
          '붓기가 많이 생기나요?', 'Is there significant swelling?',
          '会有很多浮肿吗？', '腫れはひどいですか？',
          '시술 부위에 3~7일 붓기와 멍이 생길 수 있습니다. 붓기가 가라앉으면서 점차 라인이 개선됩니다.',
          'Swelling and bruising in the treated area may last 3–7 days. As swelling subsides, contour improvement becomes visible.',
          '施术部位可能出现3~7天的浮肿和瘀青。随着浮肿消退，轮廓逐渐改善。',
          '施術部位に3〜7日間の腫れとあざが生じることがあります。腫れが引くにつれてラインが改善されていきます。',
        ),
        faqItem(
          '지방흡입과 어떻게 다른가요?', 'How is it different from liposuction?',
          '与吸脂有什么区别？', '脂肪吸引とどう違いますか？',
          '지방흡입은 외과적으로 지방을 직접 제거하는 방식이고, 지방분해주사는 주사로 지방세포를 분해해 자연 배출하는 비수술 방법입니다. 즉각성은 지방흡입이 높지만 회복 부담이 적습니다.',
          'Liposuction surgically removes fat directly, while fat-dissolving injections break down fat cells via injection for natural elimination. Liposuction delivers faster results, but fat-dissolving injections involve significantly less recovery burden.',
          '吸脂是通过外科手术直接去除脂肪的方式，而溶脂注射是通过注射分解脂肪细胞使其自然排出的非手术方法。吸脂效果更即时，但溶脂注射的恢复负担更小。',
          '脂肪吸引は外科的に脂肪を直接除去する方法で、脂肪溶解注射は注射で脂肪細胞を分解して自然排出させる非手術的な方法です。即効性は脂肪吸引が高いですが、回復の負担が少ないです。',
        ),
        faqItem(
          '몇 회 받는 것이 좋나요?', 'How many sessions are recommended?',
          '建议做几次？', '何回受けるのが良いですか？',
          '부위·지방량에 따라 다르며, 일반적으로 4주 간격으로 2~4회를 권장합니다.',
          'Varies by area and fat volume; generally 2–4 sessions spaced 4 weeks apart are recommended.',
          '根据部位和脂肪量而定，一般建议每4周进行一次，共2~4次。',
          '部位・脂肪量によりますが、一般的に4週間ごとに2〜4回をお勧めします。',
        ),
      ],
    },
  },

  // 6. 스킨보톡스
  {
    id: 'treatment-skin-botox',
    data: {
      description: lt(
        '보툴리눔 독소를 진피층에 소량으로 다발 주입하는 시술입니다. 근육 이완이 목적인 일반 보톡스와 달리, 스킨보톡스는 진피 내 피지선과 땀샘에 직접 작용하여 모공 축소, 피지 조절, 피부 탄력 개선 효과를 냅니다. 피부 전체가 탄탄하고 매끄러워지며 모공이 축소되는 물광 피부 효과를 기대할 수 있습니다.',
        'A treatment that injects small amounts of botulinum toxin at multiple points into the dermis. Unlike standard Botox aimed at muscle relaxation, Skin Botox acts directly on sebaceous glands and sweat glands within the dermis to minimize pores, regulate sebum, and improve skin elasticity. Expect firmer, smoother skin and reduced pores—the signature "glass skin" effect.',
        '将少量肉毒素多点注射至真皮层的项目。与以放松肌肉为目的的普通肉毒素不同，皮肤肉毒素直接作用于真皮内的皮脂腺和汗腺，达到收缩毛孔、调节皮脂、改善皮肤弹力的效果。可期待皮肤整体紧致光滑、毛孔缩小的水光肌效果。',
        'ボツリヌストキシンを真皮層に少量ずつ多点注入する施術です。筋肉弛緩を目的とする通常のボトックスとは異なり、スキンボトックスは真皮内の皮脂腺・汗腺に直接作用し、毛穴縮小・皮脂調整・肌の弾力改善効果をもたらします。肌全体がハリのあるなめらかな「ガラス肌」効果が期待できます。',
      ),
      features: [
        ls('모공 축소 및 피부결 개선', 'Minimized pores and improved skin texture', '收缩毛孔、改善肤质', '毛穴縮小と肌のキメ改善'),
        ls('피지 과다 분비 억제', 'Reduced excess sebum production', '抑制皮脂过度分泌', '皮脂の過剰分泌を抑制'),
        ls('피부 탄력 개선 및 리프팅 효과', 'Improved skin elasticity with subtle lifting effect', '改善皮肤弹力，具有一定提升效果', '肌の弾力改善とリフティング効果'),
        ls('물광 피부 효과', '"Glass skin" effect for a luminous, smooth complexion', '水光肌效果', 'ガラス肌効果'),
      ],
      recommendedFor: [
        ls('모공이 크고 피지가 많은 분', 'Those with large pores and excess sebum', '毛孔粗大、皮脂分泌旺盛的人', '毛穴が大きく皮脂が多い方'),
        ls('피부가 처지고 탄력이 저하된 분', 'Those with sagging or reduced skin elasticity', '皮肤松弛、弹力下降的人', '肌がたるんで弾力が低下した方'),
        ls('피부 전체를 탄탄하게 관리하고 싶을 때', 'When you want to firm and tighten overall skin', '希望全面紧致皮肤时', '肌全体をハリのある状態にケアしたいとき'),
        ls('메이크업 지속력을 높이고 싶을 때', 'When you want to improve makeup longevity', '希望提升妆容持久度时', 'メイクの持ちを良くしたいとき'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 20~30분', 'Cleanse and apply anesthetic cream for 20–30 minutes', '洗脸后涂抹麻醉膏20~30分钟', '洗顔後に麻酔クリームを20〜30分塗布'),
        ls('주입 포인트 설계', 'Map injection points', '设计注射点', '注入ポイントを設計'),
        ls('보툴리눔 독소 진피층 다발 주입', 'Multiple micro-injections of botulinum toxin into the dermis', '多点注射肉毒素至真皮层', 'ボツリヌストキシンを真皮層に多点注入'),
        ls('주입 부위 가볍게 압박 및 정리', 'Light compression and cleanup of injection sites', '轻压注射部位并整理', '注入部位を軽く圧迫して整える'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('임신·수유 중 시술 불가', 'Not available during pregnancy or breastfeeding', '妊娠或哺乳期间不可施术', '妊娠・授乳中は施術不可です'),
        ls('시술 후 4시간 눕거나 시술 부위 문지르는 행위 자제', 'Do not lie down or rub the treated area for 4 hours after treatment', '施术后4小时内避免平躺或摩擦施术部位', '施術後4時間は横になったり施術部位をこすらないでください'),
        ls('당일 사우나·격렬한 운동 자제', 'Avoid sauna and strenuous exercise on treatment day', '施术当日避免桑拿及剧烈运动', '当日はサウナや激しい運動を避けてください'),
        ls('신경근육 질환 보유 시 사전 고지 필수', 'Must inform staff in advance of neuromuscular conditions', '患有神经肌肉疾病时须提前告知', '神経筋疾患がある場合は事前申告が必須です'),
      ],
      faq: [
        faqItem(
          '일반 보톡스와 어떻게 다른가요?', 'How is it different from regular Botox?',
          '与普通肉毒素有什么区别？', '通常のボトックスとどう違いますか？',
          '일반 보톡스는 근육층에 주입해 근육 이완으로 주름을 펴는 목적이지만, 스킨보톡스는 진피층에 소량을 촘촘히 주입해 모공 축소·피지 조절·피부 탄력 개선을 목적으로 합니다.',
          'Regular Botox is injected into the muscle layer to relax muscles and smooth wrinkles. Skin Botox is injected in small amounts throughout the dermis to minimize pores, regulate sebum, and improve skin elasticity.',
          '普通肉毒素注射至肌肉层以放松肌肉、消除皱纹为目的，而皮肤肉毒素是将少量密集注射至真皮层，以收缩毛孔、调节皮脂、改善皮肤弹力为目的。',
          '通常のボトックスは筋肉層に注入して筋肉を弛緩させシワを伸ばすことが目的ですが、スキンボトックスは真皮層に少量を密に注入し、毛穴縮小・皮脂調整・肌の弾力改善を目的としています。',
        ),
        faqItem(
          '효과가 언제 나타나고 얼마나 유지되나요?', 'When do results appear and how long do they last?',
          '效果什么时候出现，能维持多久？', '効果はいつ現れて、どのくらい持続しますか？',
          '시술 후 2~4주에 효과가 나타나며, 3~6개월 유지됩니다. 정기적 관리로 효과를 연장할 수 있습니다.',
          'Results appear within 2–4 weeks and last 3–6 months. Regular maintenance can extend results.',
          '施术后2~4周效果显现，维持3~6个月。通过定期护理可以延长效果。',
          '施術後2〜4週間で効果が現れ、3〜6ヶ月持続します。定期的なメンテナンスで効果を延長できます。',
        ),
        faqItem(
          '시술 후 다운타임이 있나요?', 'Is there any downtime?',
          '施术后有恢复期吗？', '施術後にダウンタイムはありますか？',
          '주사 자국이 당일~다음날 남을 수 있으나 수 시간~1일 내 자연 소실됩니다. 별도의 회복 기간은 필요 없습니다.',
          'Injection marks may be visible on the day or the following day but disappear naturally within hours to one day. No separate recovery period is needed.',
          '注射痕迹可能当天或次日残留，但会在数小时至1天内自然消失。无需额外恢复期。',
          '注射跡が当日〜翌日残ることがありますが、数時間〜1日以内に自然消滅します。別途の回復期間は不要です。',
        ),
      ],
    },
  },

  // 7. 보톡스
  {
    id: 'treatment-botox',
    data: {
      description: lt(
        '보툴리눔 독소를 근육층에 주입하여 신경 신호를 일시적으로 차단, 근육을 이완시키는 시술입니다. 눈가·이마 등의 표정 주름, 사각턱 윤곽 개선, 종아리 라인 보정 등 다양한 목적으로 활용됩니다. 시술 시간이 짧고 즉각적인 결과를 기대할 수 있어 바쁜 일상에서도 부담 없이 받을 수 있는 시술입니다.',
        'A treatment that injects botulinum toxin into the muscle layer to temporarily block nerve signals and relax muscles. It is used for a variety of purposes, including smoothing expression lines around the eyes and forehead, refining jawline contours, and reshaping calf lines. With a short treatment time and immediate results, it fits seamlessly into a busy routine.',
        '将肉毒素注射至肌肉层，暂时阻断神经信号、放松肌肉的项目。可用于改善眼角、额头等表情纹、面部轮廓（方下巴）及小腿线条等多种目的。施术时间短、效果即时，适合繁忙日程中无负担接受。',
        '筋肉層にボツリヌストキシンを注入し、神経信号を一時的にブロックして筋肉を弛緩させる施術です。目元・額のシワ、フェイスラインの改善、ふくらはぎのラインの補正など様々な目的に活用されます。施術時間が短く即効性があり、忙しい日常でも気軽に受けられます。',
      ),
      features: [
        ls('눈가·이마·미간 주름 완화', 'Smoothed wrinkles around the eyes, forehead, and frown lines', '淡化眼角、额头、眉间皱纹', '目元・額・眉間のシワを緩和'),
        ls('사각턱 근육 이완으로 얼굴 윤곽 개선', 'Refined facial contour through masseter muscle relaxation', '咬肌放松改善面部轮廓', '咬筋の弛緩でフェイスラインを改善'),
        ls('종아리 근육 이완으로 다리 라인 보정', 'Reshaped calf line through muscle relaxation', '放松小腿肌肉改善腿部线条', 'ふくらはぎの筋肉を弛緩させて脚のラインを整える'),
        ls('다한증·과도한 땀 억제', 'Reduced excessive sweating and hyperhidrosis', '抑制多汗症及过度出汗', '多汗症・過度な発汗を抑制'),
      ],
      recommendedFor: [
        ls('눈가·이마·미간 주름이 깊어질 때', 'When wrinkles around the eyes, forehead, or frown lines deepen', '眼角、额头、眉间皱纹加深时', '目元・額・眉間のシワが深くなったとき'),
        ls('사각턱이 얼굴을 크고 각져 보이게 할 때', 'When a square jaw makes the face look large and angular', '方下巴使脸看起来大而有棱角时', 'エラが顔を大きく四角く見せているとき'),
        ls('종아리 라인이 굵고 근육질로 보일 때', 'When calf lines appear thick or overly muscular', '小腿线条粗壮、过于肌肉发达时', 'ふくらはぎのラインが太く筋肉質に見えるとき'),
        ls('다한증으로 일상 불편함을 느낄 때', 'When hyperhidrosis causes everyday discomfort', '多汗症导致日常不适时', '多汗症で日常生活に不便を感じるとき'),
      ],
      procedure: [
        ls('세안 후 시술 부위 표시', 'Cleanse and mark treatment areas', '洗脸后标记施术部位', '洗顔後に施術部位をマーキング'),
        ls('마취 크림 도포 (필요 시)', 'Apply anesthetic cream if needed', '涂抹麻醉膏（如需）', '必要に応じて麻酔クリームを塗布'),
        ls('보툴리눔 독소 정밀 주입', 'Precise botulinum toxin injection', '精准注射肉毒素', 'ボツリヌストキシンを精密に注入'),
        ls('주입 후 즉각 확인 및 마무리', 'Immediate post-injection check and finish', '注射后即时确认并收尾', '注入後に即時確認してフィニッシュ'),
      ],
      precautions: [
        ls('임신·수유 중 시술 불가', 'Not available during pregnancy or breastfeeding', '妊娠或哺乳期间不可施术', '妊娠・授乳中は施術不可です'),
        ls('시술 후 4시간 눕거나 주입 부위 마사지 금지', 'Do not lie down or massage the injection area for 4 hours after treatment', '施术后4小时内禁止平躺或按摩注射部位', '施術後4時間は横になったり注入部位をマッサージしないでください'),
        ls('당일 사우나·격렬한 운동·음주 자제', 'Avoid sauna, strenuous exercise, and alcohol on treatment day', '施术当日避免桑拿、剧烈运动及饮酒', '当日はサウナ・激しい運動・飲酒を避けてください'),
        ls('신경근육 질환 보유 시 사전 고지 필수', 'Must inform staff in advance of neuromuscular conditions', '患有神经肌肉疾病时须提前告知', '神経筋疾患がある場合は事前申告が必須です'),
      ],
      faq: [
        faqItem(
          '효과는 언제 나타나고 얼마나 지속되나요?', 'When do results appear and how long do they last?',
          '效果什么时候出现，能维持多久？', '効果はいつ現れてどのくらい持続しますか？',
          '시술 후 3~7일부터 효과가 나타나며, 4~6개월 유지됩니다. 반복 시술로 효과 기간이 길어질 수 있습니다.',
          'Results appear 3–7 days after treatment and last 4–6 months. Repeated sessions may extend the duration of effects.',
          '施术后3~7天效果开始显现，维持4~6个月。重复施术可能延长效果持续时间。',
          '施術後3〜7日から効果が現れ、4〜6ヶ月持続します。繰り返し施術で効果期間が延びることがあります。',
        ),
        faqItem(
          '자연스럽게 보이나요?', 'Will results look natural?',
          '看起来自然吗？', '自然に見えますか？',
          '적절한 용량을 주입하면 표정이 굳지 않고 자연스럽게 개선됩니다. 원하는 정도를 상담 시 충분히 말씀해 주세요.',
          'With the appropriate dosage, expressions remain natural and results look subtle. Please communicate your desired outcome clearly during consultation.',
          '注射适当剂量后，表情不会僵硬，改善自然。请在咨询时充分说明您期望的程度。',
          '適切な量を注入すれば表情が固まらず自然に改善されます。ご希望の程度をカウンセリング時にしっかりお伝えください。',
        ),
        faqItem(
          '사각턱 보톡스는 얼마나 자주 받아야 하나요?', 'How often should I get jawline Botox?',
          '方下巴肉毒素多久做一次比较好？', 'エラボトックスはどのくらいの頻度で受けるべきですか？',
          '처음에는 4~6개월 간격으로 2~3회 시술 후 유지 간격이 늘어납니다.',
          'Initially, 2–3 sessions spaced 4–6 months apart, after which the maintenance interval typically lengthens.',
          '最初以4~6个月为间隔进行2~3次后，维持间隔会逐渐延长。',
          '最初は4〜6ヶ月間隔で2〜3回施術後、メンテナンス間隔が延びていきます。',
        ),
        faqItem(
          '시술 후 바로 일상생활이 가능한가요?', 'Can I resume daily activities right after?',
          '施术后可以立即恢复日常生活吗？', '施術後すぐに日常生活に戻れますか？',
          '네, 시술 시간이 짧고 다운타임이 거의 없어 바로 일상 복귀가 가능합니다.',
          'Yes, the treatment is quick and requires virtually no downtime, allowing immediate return to daily activities.',
          '可以，施术时间短，几乎没有恢复期，可立即恢复日常生活。',
          'はい、施術時間が短くダウンタイムがほとんどないため、すぐに日常生活に復帰できます。',
        ),
      ],
    },
  },

  // 8. 메타셀 줄기세포
  {
    id: 'treatment-metacell',
    data: {
      description: lt(
        '줄기세포 배양액에서 추출한 성장인자와 사이토카인 성분을 피부에 주입하는 스킨부스터입니다. 줄기세포 자체를 주입하는 것이 아니라 줄기세포가 분비하는 생리활성물질을 활용하여 피부 재생력을 극대화합니다. 탄력, 보습, 피부톤 개선을 동시에 기대할 수 있으며, 시술 후 피부가 안에서부터 살아나는 듯한 변화를 느낄 수 있습니다.',
        'A skin booster that injects growth factors and cytokines extracted from stem cell culture medium into the skin. Rather than injecting stem cells themselves, it uses the bioactive substances secreted by stem cells to maximize skin regenerative capacity. Simultaneously improves elasticity, hydration, and skin tone—delivering a transformation that feels like skin reviving from within.',
        '将从干细胞培养液中提取的生长因子和细胞因子注射至皮肤的水光针项目。不是直接注射干细胞本身，而是利用干细胞分泌的生物活性物质，最大化皮肤再生能力。可同时期待弹力、保湿、肤色改善，施术后感受皮肤从内部焕活的变化。',
        '幹細胞培養液から抽出した成長因子とサイトカイン成分を肌に注入するスキンブースターです。幹細胞そのものを注入するのではなく、幹細胞が分泌する生理活性物質を活用して肌の再生力を最大化します。弾力・保湿・肌トーンの改善を同時に期待でき、施術後は肌が内側から蘇るような変化を感じられます。',
      ),
      features: [
        ls('피부 재생력 극대화 및 손상 회복 가속화', 'Maximized skin regenerative capacity and accelerated damage recovery', '最大化皮肤再生能力，加速损伤修复', '肌の再生力を最大化し、ダメージ回復を加速'),
        ls('탄력·보습 동시 개선', 'Simultaneous improvement of elasticity and hydration', '弹力与保湿同步改善', '弾力・保湿を同時に改善'),
        ls('피부톤 밝아짐 및 피부결 개선', 'Brighter skin tone and improved skin texture', '提亮肤色、改善肤质', '肌のトーンアップとキメの改善'),
        ls('성장인자 활성화로 콜라겐·엘라스틴 재생 촉진', 'Stimulated collagen and elastin regeneration through growth factor activation', '激活生长因子，促进胶原蛋白和弹性蛋白再生', '成長因子の活性化でコラーゲン・エラスチンの再生を促進'),
      ],
      recommendedFor: [
        ls('피부 재생력이 떨어져 회복이 느린 분', 'Those whose skin regenerates slowly or has reduced recovery capacity', '皮肤再生能力下降、恢复缓慢的人', '肌の再生力が低下して回復が遅い方'),
        ls('탄력 저하와 건조함을 동시에 개선하고 싶을 때', 'When you want to address both reduced elasticity and dryness at once', '希望同时改善弹力下降和干燥问题时', '弾力低下と乾燥を同時に改善したいとき'),
        ls('레이저·박피 후 회복 촉진을 원할 때', 'When you want to accelerate recovery after laser or resurfacing treatments', '希望在激光或换肤术后加速恢复时', 'レーザー・ピーリング後の回復促進を希望するとき'),
        ls('전반적인 피부 활력 회복을 원하는 분', 'Those who want to restore overall skin vitality', '希望全面恢复皮肤活力的人', '全体的な肌の活力回復を望む方'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 20~30분', 'Cleanse and apply anesthetic cream for 20–30 minutes', '洗脸后涂抹麻醉膏20~30分钟', '洗顔後に麻酔クリームを20〜30分塗布'),
        ls('주입 포인트 및 깊이 설계', 'Map injection points and depth', '设计注射点及深度', '注入ポイントと深さを設計'),
        ls('줄기세포 배양액 성분 미세 주입', 'Micro-injection of stem cell culture medium components', '微量注射干细胞培养液成分', '幹細胞培養液成分をマイクロ注入'),
        ls('부위별 균등 분포', 'Even distribution across treatment areas', '各部位均匀分布', '部位ごとに均等に分布'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 당일 세안은 저자극 제품으로 부드럽게', 'On treatment day, cleanse gently with a mild product', '施术当日用低刺激产品温和洗脸', '施術当日は低刺激製品でやさしく洗顔してください'),
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '施术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を避けてください'),
        ls('주사 자국·붉음증은 1~3일 내 자연 소실', 'Injection marks and redness disappear naturally within 1–3 days', '注射痕迹和红肿在1~3天内自然消退', '注射跡・赤みは1〜3日以内に自然消失します'),
        ls('면역 억제제 복용 중이라면 사전 고지', 'Inform staff in advance if taking immunosuppressants', '正在服用免疫抑制剂时须提前告知', '免疫抑制剤を服用中の場合は事前申告が必要です'),
      ],
      faq: [
        faqItem(
          '줄기세포를 직접 주입하는 건가요?', 'Are stem cells directly injected?',
          '是直接注射干细胞吗？', '幹細胞を直接注入するのですか？',
          '아닙니다. 줄기세포 배양액에서 추출한 성장인자와 생리활성물질을 활용하는 방식입니다. 줄기세포 자체를 주입하지 않아 안전합니다.',
          'No. This treatment uses growth factors and bioactive substances extracted from stem cell culture medium—not stem cells themselves—making it safe.',
          '不是。这是利用从干细胞培养液中提取的生长因子和生物活性物质的方式，不注射干细胞本身，因此安全。',
          'いいえ。幹細胞培養液から抽出した成長因子と生理活性物質を活用する方法です。幹細胞そのものを注入しないため安全です。',
        ),
        faqItem(
          '효과가 언제 나타나나요?', 'When do results appear?',
          '效果什么时候出现？', '効果はいつ現れますか？',
          '시술 후 2~4주에 걸쳐 점진적으로 나타납니다. 초기 집중 시술 후 유지 관리로 효과를 이어나갈 수 있습니다.',
          'Results appear gradually over 2–4 weeks after treatment. Effects can be sustained through maintenance sessions following an initial intensive course.',
          '施术后2~4周内逐渐显现。初期集中施术后通过维护管理可持续效果。',
          '施術後2〜4週間かけて徐々に現れます。初期集中施術後はメンテナンスで効果を維持できます。',
        ),
        faqItem(
          '몇 회 시술하면 좋나요?', 'How many sessions are recommended?',
          '建议做几次？', '何回施術するのが良いですか？',
          '초기 집중으로 2~4주 간격 3~5회, 이후 유지로 1~3개월 간격을 권장합니다.',
          'For initial intensive care, 3–5 sessions spaced 2–4 weeks apart; for maintenance, every 1–3 months.',
          '初期集中：每2~4周一次，共3~5次；之后维护：每1~3个月一次。',
          '初期集中ケアとして2〜4週間ごとに3〜5回、その後のメンテナンスとして1〜3ヶ月ごとをお勧めします。',
        ),
      ],
    },
  },

  // 9. 쥬베룩
  {
    id: 'treatment-juvelook',
    data: {
      description: lt(
        '히알루론산(HA)과 PDLLA(폴리-D-L-젖산) 복합 성분으로 구성된 스킨부스터입니다. HA 성분이 즉각적인 수분과 탄력을 제공하는 동시에, PDLLA 성분이 서서히 분해되며 콜라겐 생성을 장기적으로 자극합니다. 즉각 수분 효과와 장기 콜라겐 재생이라는 이중 작용으로 피부 속부터 건강하게 개선됩니다.',
        'A skin booster composed of a compound of hyaluronic acid (HA) and PDLLA (poly-D-L-lactic acid). The HA component delivers immediate hydration and elasticity, while PDLLA gradually dissolves to stimulate long-term collagen production. This dual action—immediate moisture plus long-term collagen regeneration—improves skin health from within.',
        '由透明质酸（HA）与PDLLA（聚-D-L-乳酸）复合成分组成的水光针项目。HA成分即时提供水分与弹力，同时PDLLA成分缓慢分解，长期刺激胶原蛋白生成。通过即时补水与长期胶原再生的双重作用，从皮肤内部健康改善。',
        'ヒアルロン酸（HA）とPDLLA（ポリ-D-L-乳酸）の複合成分で構成されたスキンブースターです。HA成分が即時の保湿と弾力を提供しながら、PDLLA成分がゆっくり分解されて長期的なコラーゲン生成を刺激します。即時保湿と長期コラーゲン再生という二重作用で、肌の内側から健やかに改善します。',
      ),
      features: [
        ls('즉각 수분 공급 및 탄력 개선', 'Immediate hydration and improved elasticity', '即时补水并改善弹力', '即時の保湿と弾力改善'),
        ls('PDLLA에 의한 장기 콜라겐 생성 촉진', 'Long-term collagen production stimulated by PDLLA', 'PDLLA促进长期胶原蛋白生成', 'PDLLAによる長期的なコラーゲン生成促進'),
        ls('피부 밀도·볼륨감 개선', 'Improved skin density and volume', '改善皮肤密度和饱满感', '肌の密度・ボリューム感の改善'),
        ls('잔주름 완화 및 피부결 정돈', 'Reduced fine lines and refined skin texture', '淡化细纹、整顿肤质', '小じわの緩和とキメの整備'),
      ],
      recommendedFor: [
        ls('피부 수분·탄력이 동시에 저하된 분', 'Those experiencing simultaneous decline in skin hydration and elasticity', '皮肤水分和弹力同时下降的人', '肌の保湿と弾力が同時に低下した方'),
        ls('스킨부스터로 즉각 효과와 장기 효과를 함께 원할 때', 'When you want both immediate and long-term effects from a skin booster', '希望通过水光针同时获得即时效果和长期效果时', 'スキンブースターで即時効果と長期効果を同時に望む場合'),
        ls('자연스럽게 피부 볼륨감을 회복하고 싶을 때', 'When you want to naturally restore skin volume', '希望自然地恢复皮肤饱满感时', '自然に肌のボリューム感を取り戻したいとき'),
        ls('잔주름이 늘어나고 피부가 푸석해질 때', 'When fine lines multiply and skin starts to look lackluster', '细纹增多、皮肤变得粗糙干燥时', '小じわが増えて肌がくすんできたとき'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 20~30분', 'Cleanse and apply anesthetic cream for 20–30 minutes', '洗脸后涂抹麻醉膏20~30分钟', '洗顔後に麻酔クリームを20〜30分塗布'),
        ls('주입 포인트 및 깊이 설계', 'Map injection points and depth', '设计注射点及深度', '注入ポイントと深さを設計'),
        ls('HA+PDLLA 복합 성분 미세 주입', 'Micro-injection of HA+PDLLA compound', '微量注射HA+PDLLA复合成分', 'HA+PDLLA複合成分をマイクロ注入'),
        ls('부위별 균등 분포 및 마사지', 'Even distribution across areas with gentle massage', '各部位均匀分布并轻柔按摩', '部位ごとに均等に分布してマッサージ'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 2~3일 시술 부위 강하게 마사지 금지', 'Do not massage the treated area firmly for 2–3 days', '施术后2~3天内禁止用力按摩施术部位', '施術後2〜3日は施術部位を強くマッサージしないでください'),
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '施术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を避けてください'),
        ls('주사 자국·붓기는 1~3일 내 자연 소실', 'Injection marks and swelling disappear naturally within 1–3 days', '注射痕迹和浮肿在1~3天内自然消退', '注射跡・腫れは1〜3日以内に自然消失します'),
        ls('임신·수유 중 시술 불가', 'Not available during pregnancy or breastfeeding', '妊娠或哺乳期间不可施术', '妊娠・授乳中は施術不可です'),
      ],
      faq: [
        faqItem(
          '리쥬란과 어떻게 다른가요?', 'How is it different from Rejuran?',
          '与丽珠兰有什么区别？', 'リジュランとどう違いますか？',
          '리쥬란은 PN(연어 DNA) 성분 기반으로 항염·재생에 특화되고, 쥬베룩은 HA+PDLLA 복합 성분으로 즉각 수분과 장기 콜라겐 재생을 동시에 기대할 수 있습니다.',
          'Rejuran is PN (salmon DNA) based and specialized for anti-inflammatory and regenerative effects. Juvelook combines HA+PDLLA for simultaneous immediate hydration and long-term collagen regeneration.',
          '丽珠兰以PN（鲑鱼DNA）成分为基础，专注于抗炎和再生；而优贝鲁克以HA+PDLLA复合成分，可同时期待即时补水和长期胶原再生效果。',
          'リジュランはPN（サーモンDNA）成分ベースで抗炎・再生に特化しており、ジュベルックはHA+PDLLAの複合成分で即時保湿と長期コラーゲン再生を同時に期待できます。',
        ),
        faqItem(
          '효과가 얼마나 유지되나요?', 'How long do results last?',
          '效果能维持多久？', '効果はどのくらい持続しますか？',
          'HA 성분의 즉각 효과는 몇 주, PDLLA에 의한 콜라겐 재생 효과는 수개월 이상 지속됩니다. 정기적 관리로 효과를 연장할 수 있습니다.',
          "The immediate HA effect lasts several weeks, while PDLLA-induced collagen regeneration persists for several months. Regular maintenance extends results.",
          'HA成分的即时效果持续数周，PDLLA引起的胶原再生效果可维持数个月以上。通过定期护理可延长效果。',
          'HA成分の即時効果は数週間、PDLLAによるコラーゲン再生効果は数ヶ月以上持続します。定期的なメンテナンスで効果を延長できます。',
        ),
        faqItem(
          '몇 회 시술이 적당한가요?', 'How many sessions are appropriate?',
          '做几次比较合适？', '何回の施術が適切ですか？',
          '2~4주 간격으로 3~5회를 권장하며, 이후 유지 관리는 개인 피부 상태에 맞춰 결정합니다.',
          '3–5 sessions spaced 2–4 weeks apart are recommended; subsequent maintenance frequency is tailored to individual skin condition.',
          '建议每2~4周进行一次，共3~5次；之后维护频率根据个人皮肤状态决定。',
          '2〜4週間ごとに3〜5回をお勧めし、その後のメンテナンス頻度は個人の肌の状態に合わせて決定します。',
        ),
      ],
    },
  },

  // 10. 스컬트라
  {
    id: 'treatment-sculptra',
    data: {
      description: lt(
        'PLLA(폴리락틱산) 성분의 콜라겐 자극제로, 꺼진 볼륨을 자연스럽게 회복시키고 장기적인 콜라겐 재생을 유도합니다. 즉각적인 볼륨을 채우는 일반 필러와 달리, 시술 후 수개월에 걸쳐 내 피부가 스스로 콜라겐을 만들어가며 자연스러운 볼륨과 탄력이 회복됩니다. 효과가 나타나기까지 시간이 걸리지만, 자연스럽고 오래 유지된다는 것이 가장 큰 특징입니다.',
        'A PLLA (poly-L-lactic acid) collagen stimulator that naturally restores lost volume and induces long-term collagen regeneration. Unlike conventional fillers that add immediate volume, Sculptra works gradually over months as your own skin produces collagen—restoring natural volume and elasticity on its own schedule. Results take time to develop but are notably natural-looking and long-lasting.',
        'PLLA（聚左旋乳酸）成分的胶原蛋白刺激剂，自然修复凹陷部位并诱导长期胶原再生。与即时填充的普通填充剂不同，施术后数月内皮肤自主生成胶原蛋白，自然恢复丰盈感和弹力。效果显现需要时间，但自然持久是其最大特点。',
        'PLLA（ポリ乳酸）成分のコラーゲン刺激剤で、失われたボリュームを自然に回復させ、長期的なコラーゲン再生を促します。即時にボリュームを補う通常のフィラーとは異なり、施術後数ヶ月かけて自分の肌がコラーゲンを生成しながら自然なボリュームと弾力を取り戻します。効果が現れるまで時間がかかりますが、自然で長続きするのが最大の特徴です。',
      ),
      features: [
        ls('꺼진 볼·관자놀이 볼륨 자연스러운 회복', 'Natural restoration of volume in hollow cheeks and temples', '自然修复凹陷的面颊和太阳穴', 'こけた頬・こめかみのボリュームを自然に回復'),
        ls('PLLA에 의한 장기 콜라겐 재생', 'Long-term collagen regeneration stimulated by PLLA', 'PLLA促进长期胶原蛋白再生', 'PLLAによる長期的なコラーゲン再生'),
        ls('전반적인 얼굴 탄력·밀도 개선', 'Overall improvement in facial firmness and density', '全面改善面部弹力和密度', '顔全体の弾力・密度の改善'),
        ls('2년 이상 장기 유지 가능', 'Effects can last 2 years or more', '效果可维持2年以上', '2年以上の長期維持が可能'),
      ],
      recommendedFor: [
        ls('나이가 들면서 볼·관자놀이가 꺼져 보이는 분', 'Those whose cheeks or temples have hollowed with age', '随年龄增长面颊和太阳穴变得凹陷的人', '年齢とともに頬・こめかみがこけて見える方'),
        ls('필러보다 자연스럽고 오래가는 볼륨 회복을 원할 때', 'When you want more natural and longer-lasting volume restoration than filler', '希望比填充剂更自然持久地恢复丰盈感时', 'フィラーより自然で長続きするボリューム回復を望む場合'),
        ls('전반적인 얼굴 노화를 근본적으로 개선하고 싶을 때', 'When you want a fundamental approach to addressing overall facial aging', '希望从根本上改善面部整体老化时', '顔全体の老化を根本的に改善したいとき'),
        ls('한 번에 큰 변화보다 자연스러운 변화를 원할 때', 'When you prefer gradual, natural-looking changes over dramatic immediate results', '比起一次大幅改变，更希望自然渐进变化时', '一度に大きな変化より自然な変化を好む場合'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 20~30분', 'Cleanse and apply anesthetic cream for 20–30 minutes', '洗脸后涂抹麻醉膏20~30分钟', '洗顔後に麻酔クリームを20〜30分塗布'),
        ls('주입 부위 및 양 설계', 'Plan injection sites and volume', '设计注射部位和用量', '注入部位と量を設計'),
        ls('PLLA 성분 희석 후 정밀 주입', 'Dilute PLLA and inject precisely', 'PLLA成分稀释后精准注射', 'PLLA成分を希釈して精密に注入'),
        ls('주입 부위 5분 마사지 (분포 균일화)', '5-minute massage of injection sites to distribute evenly', '注射部位按摩5分钟（使分布均匀）', '注入部位を5分マッサージ（均等分布のため）'),
        ls('진정 케어 후 마무리', 'Soothing care and finish', '镇静护理后收尾', '鎮静ケアでフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 5일간 하루 5분씩 5회 마사지 필수 (5-5-5 룰)', 'Follow the 5-5-5 rule: massage 5 times a day for 5 minutes each for 5 days after treatment', '施术后5天内每天按摩5次，每次5分钟（5-5-5法则）', '施術後5日間は1日5回・1回5分のマッサージが必須です（5-5-5ルール）'),
        ls('시술 후 결절 예방을 위해 과잉 주입 금지, 상담 충분히 진행', 'Avoid over-injection to prevent nodule formation; thorough consultation is essential', '为防止结节，禁止过度注射，须充分进行咨询', '結節予防のため過剰注入は禁止。十分なカウンセリングが必須です'),
        ls('임신·수유 중 시술 불가', 'Not available during pregnancy or breastfeeding', '妊娠或哺乳期间不可施术', '妊娠・授乳中は施術不可です'),
        ls('효과 발현까지 1~3개월 소요, 조급하게 추가 시술 금지', 'Results take 1–3 months to develop; avoid additional injections prematurely', '效果显现需1~3个月，切勿急于追加施术', '効果が現れるまで1〜3ヶ月かかります。焦って追加注入しないでください'),
      ],
      faq: [
        faqItem(
          '효과가 언제부터 나타나나요?', 'When do results appear?',
          '效果什么时候开始出现？', '効果はいつから現れますか？',
          '시술 직후에는 부기로 인한 일시적 볼륨이 생기다가 가라앉습니다. 실제 효과는 1~3개월에 걸쳐 콜라겐이 생성되면서 나타납니다.',
          'Immediately after treatment, temporary volume from swelling appears and then subsides. True results develop gradually over 1–3 months as collagen is produced.',
          '施术后即时会因浮肿产生临时丰盈感，随后消退。真正的效果会在1~3个月内随胶原蛋白生成而逐渐显现。',
          '施術直後は腫れによる一時的なボリュームが生じてから落ち着きます。本来の効果は1〜3ヶ月かけてコラーゲンが生成されながら現れます。',
        ),
        faqItem(
          '몇 회 시술이 필요한가요?', 'How many sessions are needed?',
          '需要做几次？', '何回施術が必要ですか？',
          '보통 6~8주 간격으로 2~3회를 권장합니다. 개인 볼륨 손실 정도에 따라 달라질 수 있습니다.',
          '2–3 sessions spaced 6–8 weeks apart are generally recommended. Frequency varies depending on the degree of individual volume loss.',
          '通常建议每6~8周进行一次，共2~3次。根据个人丰盈度损失程度可能有所不同。',
          '通常6〜8週間ごとに2〜3回をお勧めします。個人のボリューム損失の程度によって異なります。',
        ),
        faqItem(
          '일반 필러와 병행 가능한가요?', 'Can it be combined with regular filler?',
          '可以与普通填充剂配合使用吗？', '通常のフィラーと併用できますか？',
          '네, 스컬트라로 장기 콜라겐 재생을 도모하면서 즉각 볼륨이 필요한 부위에 HA 필러를 함께 사용하기도 합니다.',
          'Yes, Sculptra can be combined with HA filler—using Sculptra for long-term collagen stimulation while filler immediately addresses areas needing volume.',
          '可以，也有同时使用塑然雅进行长期胶原再生，并在需要即时丰盈的部位配合HA填充剂的方案。',
          'はい、スカルプトラで長期コラーゲン再生を促しながら、即時ボリュームが必要な部位にHAフィラーを併用することもあります。',
        ),
      ],
    },
  },

  // 11. 래디어스
  {
    id: 'treatment-radiesse',
    data: {
      description: lt(
        'CaHA(칼슘히드록시아파타이트) 성분의 필러로, 즉각적인 볼륨 보충과 장기 콜라겐 자극이라는 두 가지 효과를 동시에 냅니다. 주입 즉시 볼륨이 생기며, CaHA 미세 입자가 서서히 분해되면서 콜라겐 생성을 지속적으로 자극합니다. 피부 밀도와 탄력을 개선하는 콜라겐 자극제로도 활용 가능합니다.',
        'A CaHA (calcium hydroxyapatite) filler that delivers two simultaneous effects: immediate volume restoration and long-term collagen stimulation. Volume is visible right after injection, and as the CaHA microspheres gradually dissolve, they continuously stimulate collagen production. It can also be used as a collagen stimulator to improve skin density and elasticity.',
        '羟基磷灰石钙（CaHA）成分的填充剂，同时发挥即时补充丰盈感和长期刺激胶原蛋白两种效果。注射后立即产生丰盈感，随着CaHA微粒缓慢分解，持续刺激胶原蛋白生成。也可作为改善皮肤密度和弹力的胶原蛋白刺激剂使用。',
        'CaHA（ハイドロキシアパタイトカルシウム）成分のフィラーで、即時のボリューム補充と長期コラーゲン刺激という2つの効果を同時にもたらします。注入直後からボリュームが生まれ、CaHAのマイクロ粒子がゆっくり分解されながらコラーゲン生成を継続的に刺激します。肌の密度と弾力を改善するコラーゲン刺激剤としても活用できます。',
      ),
      features: [
        ls('즉각적인 볼륨 보충 효과', 'Immediate volume restoration effect', '即时补充丰盈感', '即時のボリューム補充効果'),
        ls('CaHA에 의한 장기 콜라겐 자극', 'Long-term collagen stimulation by CaHA', 'CaHA促进长期胶原蛋白刺激', 'CaHAによる長期コラーゲン刺激'),
        ls('피부 밀도·탄력 개선', 'Improved skin density and elasticity', '改善皮肤密度和弹力', '肌の密度・弾力の改善'),
        ls('HA 필러 대비 긴 유지 기간', 'Longer duration compared to HA filler', '比HA填充剂维持时间更长', 'HAフィラーより長い持続期間'),
      ],
      recommendedFor: [
        ls('즉각 볼륨과 장기 효과를 동시에 원할 때', 'When you want immediate volume and long-term effects at the same time', '希望同时获得即时丰盈感和长期效果时', '即時ボリュームと長期効果を同時に望む場合'),
        ls('손등·목 등 피부 밀도 개선이 필요한 부위', 'Areas needing skin density improvement such as the back of hands or neck', '手背、颈部等需要改善皮肤密度的部位', '手の甲・首など肌の密度改善が必要な部位'),
        ls('HA 필러보다 오래 지속되는 효과를 원할 때', 'When you want longer-lasting effects than HA filler', '希望比HA填充剂效果更持久时', 'HAフィラーより長く続く効果を望む場合'),
        ls('볼·턱선 윤곽 개선 및 볼륨 회복이 필요할 때', 'When cheek or jawline contouring and volume restoration are needed', '需要改善面颊、下颌线轮廓及恢复丰盈感时', '頬・フェイスラインの輪郭改善とボリューム回復が必要なとき'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 또는 국소마취', 'Cleanse and apply anesthetic cream or local anesthesia', '洗脸后涂抹麻醉膏或局部麻醉', '洗顔後に麻酔クリーム塗布または局所麻酔'),
        ls('주입 부위 및 양 설계', 'Plan injection sites and volume', '设计注射部位和用量', '注入部位と量を設計'),
        ls('CaHA 성분 정밀 주입', 'Precise CaHA injection', 'CaHA成分精准注射', 'CaHA成分を精密に注入'),
        ls('균일 분포를 위한 부드러운 마사지', 'Gentle massage for even distribution', '轻柔按摩使分布均匀', '均等分布のためのやさしいマッサージ'),
        ls('진정 케어 후 마무리', 'Soothing care and finish', '镇静护理后收尾', '鎮静ケアでフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 1~3일 붓기·멍 가능 (자연 완화)', 'Swelling and bruising possible for 1–3 days, resolving naturally', '施术后1~3天可能出现浮肿和瘀青（自然缓解）', '施術後1〜3日間は腫れ・あざが生じる場合があります（自然に改善）'),
        ls('시술 부위 과도한 압박·마사지 금지', 'Avoid excessive pressure or massage on treated areas', '禁止对施术部位施加过度压力或按摩', '施術部位への過度な圧迫・マッサージは禁止です'),
        ls('임신·수유 중 시술 불가', 'Not available during pregnancy or breastfeeding', '妊娠或哺乳期间不可施术', '妊娠・授乳中は施術不可です'),
        ls('시술 후 1주일 사우나·음주 자제', 'Avoid sauna and alcohol for 1 week', '施术后1周内避免桑拿和饮酒', '施術後1週間はサウナ・飲酒を避けてください'),
      ],
      faq: [
        faqItem(
          'HA 필러와 어떻게 다른가요?', 'How is it different from HA filler?',
          '与HA填充剂有什么区别？', 'HAフィラーとどう違いますか？',
          'HA 필러는 히알루론산으로 즉각 볼륨을 채우는 방식이고, 래디어스는 CaHA 성분으로 즉각 볼륨과 장기 콜라겐 자극을 동시에 기대할 수 있습니다. 유지 기간도 더 길어 경제적입니다.',
          'HA filler uses hyaluronic acid to add immediate volume, while Radiesse uses CaHA to simultaneously provide immediate volume and long-term collagen stimulation. It also lasts longer, making it more cost-effective.',
          'HA填充剂用透明质酸即时填充丰盈感，而丽得姿用CaHA成分，可同时期待即时丰盈和长期胶原刺激效果。维持时间更长，性价比更高。',
          'HAフィラーはヒアルロン酸で即時ボリュームを補う方法で、ラディエスはCaHA成分で即時ボリュームと長期コラーゲン刺激を同時に期待できます。持続期間も長くコスパに優れています。',
        ),
        faqItem(
          '효과는 얼마나 유지되나요?', 'How long do results last?',
          '效果能维持多久？', '効果はどのくらい持続しますか？',
          '개인차가 있지만 일반적으로 12~18개월 유지됩니다.',
          'Individual results vary, but effects generally last 12–18 months.',
          '存在个体差异，但一般维持12~18个月。',
          '個人差がありますが、一般的に12〜18ヶ月持続します。',
        ),
        faqItem(
          '얼굴 외 부위에도 사용 가능한가요?', 'Can it be used on areas other than the face?',
          '除面部外，其他部位也可以使用吗？', '顔以外の部位にも使用できますか？',
          '네, 손등·목·데콜테 등 피부 밀도와 탄력 개선이 필요한 부위에도 활용됩니다.',
          'Yes, it is also used on areas such as the back of the hands, neck, and décolletage that need density and elasticity improvement.',
          '可以，也可用于手背、颈部、前胸等需要改善皮肤密度和弹力的部位。',
          'はい、手の甲・首・デコルテなど肌の密度と弾力の改善が必要な部位にも活用されます。',
        ),
      ],
    },
  },

  // 13. 하이쿡스
  {
    id: 'treatment-haecox',
    data: {
      description: lt(
        '고강도 집속 초음파(HIFU) 에너지를 피부 표면부터 SMAS(근막층)까지 정밀하게 전달하여 피부 탄력과 리프팅 효과를 제공하는 장비입니다. 얼굴과 목 리프팅에 주로 사용되며, 여러 깊이의 카트리지로 피부층별 맞춤 에너지를 전달합니다. 비수술적 방법으로 처진 피부를 끌어올리고 윤곽을 개선합니다.',
        'A device that precisely delivers High-Intensity Focused Ultrasound (HIFU) energy from the skin surface down to the SMAS (superficial muscular aponeurotic system) layer, providing elasticity and lifting effects. Primarily used for face and neck lifting, it delivers targeted energy to each skin layer using multiple-depth cartridges. It non-surgically lifts sagging skin and improves facial contours.',
        '将高强度聚焦超声（HIFU）能量从皮肤表面精准传递至SMAS（筋膜层），提供皮肤弹力和提升效果的仪器。主要用于面部和颈部提升，通过多种深度的探头向各皮肤层传递定制能量。以非手术方式提升松弛皮肤并改善轮廓。',
        '皮膚表面からSMAS（筋膜層）まで高密度焦点式超音波（HIFU）エネルギーを精密に届け、肌の弾力とリフティング効果を提供する機器です。顔と首のリフティングに主に使用され、複数の深さのカートリッジで肌の層ごとにカスタムエネルギーを届けます。非手術的な方法でたるんだ肌を引き上げ、輪郭を改善します。',
      ),
      features: [
        ls('SMAS층 자극으로 근본적인 피부 리프팅', 'Fundamental skin lifting through SMAS layer stimulation', '刺激SMAS层，实现根本性皮肤提升', 'SMAS層の刺激で根本的な肌リフティング'),
        ls('처진 얼굴·목 윤곽 개선', 'Improved sagging face and neck contours', '改善面部和颈部松弛轮廓', 'たるんだ顔・首の輪郭を改善'),
        ls('콜라겐 재생으로 장기 탄력 효과', 'Long-term elasticity improvement through collagen regeneration', '胶原蛋白再生带来长期弹力效果', 'コラーゲン再生による長期弾力効果'),
        ls('비수술 비침습적 시술', 'Non-surgical, non-invasive procedure', '无创非手术施术', '非手術・非侵襲的な施術'),
      ],
      recommendedFor: [
        ls('얼굴·목 처짐이 신경 쓰이는 분', 'Those bothered by sagging on the face or neck', '困扰于面部和颈部松弛的人', '顔・首のたるみが気になる方'),
        ls('수술 없이 리프팅 효과를 원할 때', 'When you want a lifting effect without surgery', '希望无需手术获得提升效果时', '手術なしでリフティング効果を希望するとき'),
        ls('이중턱·턱선 윤곽 개선이 필요할 때', 'When improvement of double chin or jawline contour is needed', '需要改善双下巴或下颌线轮廓时', '二重あご・フェイスラインの輪郭改善が必要なとき'),
        ls('콜라겐 재생을 통한 장기 탄력 관리를 원할 때', 'When long-term elasticity management through collagen regeneration is desired', '希望通过胶原蛋白再生进行长期弹力管理时', 'コラーゲン再生による長期的な弾力管理を希望するとき'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('마취 크림 도포 30~40분', 'Anesthetic cream applied for 30–40 minutes', '涂抹麻醉膏30~40分钟', '麻酔クリームを30〜40分塗布'),
        ls('피부층별 카트리지 선택 및 에너지 설정', 'Select cartridge and set energy per skin layer', '根据皮肤层选择探头并设置能量', '肌の層ごとにカートリッジを選択してエネルギーを設定'),
        ls('부위별 HIFU 에너지 조사', 'HIFU energy application by treatment zone', '按部位照射HIFU能量', '部位ごとにHIFUエネルギーを照射'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '施术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を避けてください'),
        ls('시술 직후 홍반·부종은 수 시간 내 완화', 'Redness and swelling after treatment resolve within a few hours', '施术后即时出现的红斑、浮肿在数小时内缓解', '施術直後の赤み・腫れは数時間以内に落ち着きます'),
        ls('임플란트·금속 삽입물 보유 시 사전 고지 필수', 'Inform staff in advance if you have implants or metal inserts', '有植入物或金属内植物时须提前告知', 'インプラント・金属挿入物がある場合は事前申告が必須です'),
        ls('외출 시 자외선 차단제 필수 도포', 'Sunscreen is essential when going outdoors', '外出时必须涂抹防晒霜', '外出時は日焼け止めが必須です'),
      ],
      faq: [
        faqItem(
          '효과는 언제 나타나나요?', 'When do results appear?',
          '效果什么时候出现？', '効果はいつ現れますか？',
          '시술 후 1~3개월에 걸쳐 점진적으로 나타나며, 3~6개월 시점에 최대 효과를 확인할 수 있습니다.',
          'Results develop gradually over 1–3 months, with peak effects visible around 3–6 months.',
          '施术后1~3个月逐渐显现，3~6个月时可确认最佳效果。',
          '施術後1〜3ヶ月かけて徐々に現れ、3〜6ヶ月時点で最大の効果を確認できます。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often is treatment recommended?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるのが良いですか？',
          '6개월~1년 간격으로 받는 것을 권장합니다.',
          'Treatment every 6 months to 1 year is recommended.',
          '建议每6个月至1年接受一次。',
          '6ヶ月〜1年ごとに受けることをお勧めします。',
        ),
        faqItem(
          '통증이 심한가요?', 'Is it painful?',
          '会很痛吗？', '痛みはひどいですか？',
          '마취 크림 도포 후 진행하여 통증을 크게 줄일 수 있습니다. 통증에 민감하신 경우 추가 진통 옵션을 상담해 주세요.',
          'Anesthetic cream is applied beforehand to significantly reduce discomfort. If you are sensitive to pain, please discuss additional pain relief options during consultation.',
          '涂抹麻醉膏后进行，可大幅减轻疼痛。对疼痛敏感的人，请咨询额外的止痛选项。',
          '麻酔クリームを塗布してから施術するため、痛みを大幅に軽減できます。痛みに敏感な方は追加の鎮痛オプションについてご相談ください。',
        ),
      ],
    },
  },

  // 14. 악센토
  {
    id: 'treatment-accento',
    data: {
      description: lt(
        'RF(고주파) 에너지를 피부 표피부터 진피까지 전층에 균일하게 전달하여 피부 탄력을 개선하는 장비입니다. 고주파 열 에너지가 진피 내 콜라겐과 엘라스틴 재생을 자극하며, 피부 전체를 탄탄하고 매끄럽게 만들어 줍니다. 얼굴 전체의 리프팅과 피부 질감 개선에 효과적입니다.',
        'A device that uniformly delivers RF (radiofrequency) energy from the epidermis to the full dermis layer to improve skin elasticity. The RF thermal energy stimulates collagen and elastin regeneration within the dermis, firming and smoothing the entire skin. Effective for full-face lifting and skin texture improvement.',
        '将射频（RF）能量均匀传递至皮肤全层（从表皮到真皮），改善皮肤弹力的仪器。高频热能刺激真皮内胶原蛋白和弹力蛋白再生，使整体皮肤紧致光滑。对全面部提升和皮肤质感改善效果显著。',
        '表皮から真皮全層にRF（高周波）エネルギーを均一に届けて肌の弾力を改善する機器です。高周波熱エネルギーが真皮内のコラーゲン・エラスチン再生を刺激し、肌全体をハリのあるなめらかな状態に整えます。顔全体のリフティングと肌質改善に効果的です。',
      ),
      features: [
        ls('진피층 콜라겐·엘라스틴 재생 촉진', 'Stimulated collagen and elastin regeneration in the dermis', '促进真皮层胶原蛋白和弹力蛋白再生', '真皮層のコラーゲン・エラスチン再生を促進'),
        ls('피부 탄력 개선 및 리프팅 효과', 'Improved skin elasticity and lifting effect', '改善皮肤弹力并具有提升效果', '肌の弾力改善とリフティング効果'),
        ls('피부 전층 균일한 에너지 전달', 'Uniform energy delivery across all skin layers', '向皮肤全层均匀传递能量', '肌の全層への均一なエネルギー照射'),
        ls('피부 질감·결 개선', 'Improved skin texture and tone', '改善肤质和肤色', '肌質・キメの改善'),
      ],
      recommendedFor: [
        ls('피부 전체적으로 탄력이 저하된 분', 'Those whose overall skin elasticity has decreased', '整体皮肤弹力下降的人', '全体的な肌の弾力が低下した方'),
        ls('잔주름이 늘어나고 피부가 처질 때', 'When fine lines increase and skin begins to sag', '细纹增多、皮肤开始松弛时', '小じわが増えて肌がたるんできたとき'),
        ls('RF 기반 탄력 관리를 처음 시작하는 분', 'Those starting RF-based elasticity management for the first time', '首次开始RF弹力管理的人', '初めてRFベースの弾力ケアを始める方'),
        ls('피부 질감과 탄력을 동시에 개선하고 싶을 때', 'When you want to improve both skin texture and elasticity simultaneously', '希望同时改善肤质和弹力时', '肌質と弾力を同時に改善したいとき'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('마취 크림 도포 (필요 시)', 'Apply anesthetic cream if needed', '涂抹麻醉膏（如需）', '必要に応じて麻酔クリームを塗布'),
        ls('피부 상태에 따른 에너지 설정', 'Set energy parameters based on skin condition', '根据皮肤状态设置能量', '肌の状態に応じてエネルギーを設定'),
        ls('핸드피스로 부위별 RF 에너지 조사', 'RF energy application by zone using handpiece', '使用手柄按部位照射RF能量', 'ハンドピースで部位ごとにRFエネルギーを照射'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '施术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を避けてください'),
        ls('시술 직후 홍조·열감은 수 시간 내 완화', 'Redness and heat after treatment resolve within a few hours', '施术后即时出现的红肿和热感在数小时内缓解', '施術直後の赤み・熱感は数時間以内に落ち着きます'),
        ls('페이스메이커 등 금속 삽입물 보유 시 시술 불가', 'Not suitable for those with pacemakers or metal inserts', '有起搏器等金属内植物时不可施术', 'ペースメーカーなど金属挿入物がある方は施術不可です'),
        ls('외출 시 자외선 차단제 도포 필수', 'Sunscreen application is essential when going outdoors', '外出时必须涂抹防晒霜', '外出時は日焼け止めの塗布が必須です'),
      ],
      faq: [
        faqItem(
          '효과는 언제 나타나나요?', 'When do results appear?',
          '效果什么时候出现？', '効果はいつ現れますか？',
          '시술 후 2~4주부터 나타나기 시작하며, 2~3개월 시점에 최대 효과를 확인할 수 있습니다.',
          'Results begin appearing 2–4 weeks after treatment, with peak effects around 2–3 months.',
          '施术后2~4周开始显现，2~3个月时可确认最佳效果。',
          '施術後2〜4週間から現れ始め、2〜3ヶ月時点で最大の効果を確認できます。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often should I receive treatment?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるべきですか？',
          '3~4주 간격으로 3~5회를 권장하며, 이후 유지 관리는 2~3개월 간격으로 진행합니다.',
          '3–5 sessions spaced 3–4 weeks apart are recommended; maintenance is then every 2–3 months.',
          '建议每3~4周进行一次，共3~5次；之后每2~3个月进行维护管理。',
          '3〜4週間ごとに3〜5回をお勧めし、その後のメンテナンスは2〜3ヶ月ごとに行います。',
        ),
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '거의 없습니다. 시술 직후 홍조·열감이 수 시간 내 완화되며 일상생활 바로 가능합니다.',
          'Minimal. Redness and warmth resolve within a few hours, and daily activities can resume immediately.',
          '几乎没有。施术后即时出现的红肿和热感在数小时内缓解，可立即恢复日常生活。',
          'ほとんどありません。施術直後の赤み・熱感が数時間以内に落ち着き、すぐに日常生活に復帰できます。',
        ),
      ],
    },
  },

  // 15. 더마브이
  {
    id: 'treatment-dermav',
    data: {
      description: lt(
        '집속 초음파 에너지로 피부 표층부터 SMAS층까지 정밀하게 타깃하는 리프팅 장비입니다. 선택적 에너지 전달 방식으로 주변 조직 손상 없이 목표 깊이에 집중적으로 열 응고점을 형성하여 피부 리프팅과 콜라겐 재생을 유도합니다. 얼굴과 목의 처짐 개선에 효과적입니다.',
        'A lifting device that precisely targets from the superficial skin layer to the SMAS using focused ultrasound energy. Its selective energy delivery method creates concentrated thermal coagulation points at the target depth without damaging surrounding tissue, inducing skin lifting and collagen regeneration. Effective for improving sagging on the face and neck.',
        '利用集束超声能量从皮肤表层精准靶向至SMAS层的提升仪器。通过选择性能量传递方式，在不损伤周围组织的情况下，在目标深度集中形成热凝固点，诱导皮肤提升和胶原蛋白再生。对改善面部和颈部松弛效果显著。',
        '集束超音波エネルギーで皮膚の表層からSMAS層まで精密にターゲットするリフティング機器です。選択的エネルギー照射方式で周囲組織を損傷せずに目標の深さへ集中的に熱凝固点を形成し、肌のリフティングとコラーゲン再生を促します。顔と首のたるみ改善に効果的です。',
      ),
      features: [
        ls('SMAS층까지 정밀 에너지 전달로 근본 리프팅', 'Fundamental lifting through precise energy delivery to the SMAS layer', '精准传递能量至SMAS层，实现根本性提升', 'SMAS層への精密なエネルギー照射で根本的なリフティング'),
        ls('주변 조직 손상 없는 선택적 에너지 조사', 'Selective energy application without damage to surrounding tissue', '选择性能量照射，不损伤周围组织', '周囲組織を損傷しない選択的エネルギー照射'),
        ls('콜라겐 재생으로 장기 탄력 개선', 'Long-term elasticity improvement through collagen regeneration', '胶原蛋白再生带来长期弹力改善', 'コラーゲン再生による長期的な弾力改善'),
        ls('얼굴·목 처짐 및 윤곽 개선', 'Improved sagging and contours on face and neck', '改善面部和颈部松弛及轮廓', '顔・首のたるみと輪郭を改善'),
      ],
      recommendedFor: [
        ls('얼굴·목 처짐이 진행된 분', 'Those with progressing sagging on the face or neck', '面部和颈部松弛加剧的人', '顔・首のたるみが進んでいる方'),
        ls('비수술로 확실한 리프팅 효과를 원할 때', 'When you want a definitive lifting effect without surgery', '希望无需手术获得明确提升效果时', '手術なしで確実なリフティング効果を望む場合'),
        ls('이전 리프팅 효과가 줄어들어 재관리가 필요할 때', 'When previous lifting effects have diminished and re-treatment is needed', '之前的提升效果减弱、需要再次管理时', '以前のリフティング効果が薄れて再ケアが必要なとき'),
        ls('SMAS층 자극을 통한 깊은 리프팅을 원할 때', 'When deep lifting through SMAS layer stimulation is desired', '希望通过刺激SMAS层实现深层提升时', 'SMAS層刺激による深いリフティングを望む場合'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('마취 크림 도포 30~40분', 'Anesthetic cream applied for 30–40 minutes', '涂抹麻醉膏30~40分钟', '麻酔クリームを30〜40分塗布'),
        ls('피부층별 에너지 깊이 설정', 'Set energy depth per skin layer', '根据皮肤层设置能量深度', '肌の層ごとにエネルギー深度を設定'),
        ls('집속 초음파 에너지 부위별 조사', 'Focused ultrasound energy application by zone', '按部位照射集束超声能量', '部位ごとに集束超音波エネルギーを照射'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '施术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を避けてください'),
        ls('시술 직후 홍반·부종·따끔함은 수 시간 내 완화', 'Redness, swelling, and tingling after treatment resolve within a few hours', '施术后即时出现的红斑、浮肿、刺痛感在数小时内缓解', '施術直後の赤み・腫れ・ひりつきは数時間以内に落ち着きます'),
        ls('금속 삽입물·임플란트 보유 시 사전 고지', 'Inform staff in advance if you have metal inserts or implants', '有金属内植物或植入物时须提前告知', '金属挿入物・インプラントがある場合は事前申告が必要です'),
        ls('시술 후 자외선 차단 철저히', 'Apply sunscreen diligently after treatment', '施术后认真防晒', '施術後は日焼け止めをしっかり行ってください'),
      ],
      faq: [
        faqItem(
          '효과는 언제 나타나나요?', 'When do results appear?',
          '效果什么时候出现？', '効果はいつ現れますか？',
          '1~3개월에 걸쳐 점진적으로 나타나며, 3~6개월 시점에 최대 효과를 확인할 수 있습니다.',
          'Results develop gradually over 1–3 months, with peak effects visible at 3–6 months.',
          '1~3个月内逐渐显现，3~6个月时可确认最佳效果。',
          '1〜3ヶ月かけて徐々に現れ、3〜6ヶ月時点で最大の効果を確認できます。',
        ),
        faqItem(
          '울쎄라와 어떻게 다른가요?', 'How is it different from Ultherapy?',
          '与超声刀有什么区别？', 'ウルセラとどう違いますか？',
          '울쎄라는 DeepSEE™ 실시간 이미징을 통해 피부 구조를 직접 확인하며 시술하는 미국 FDA 승인 프리미엄 장비이며, 더마브이는 집속 초음파 방식으로 SMAS층 리프팅을 목표로 하는 장비입니다.',
          'Ultherapy is a US FDA-cleared premium device that uses DeepSEE™ real-time imaging to visualize skin structure during treatment. Derma-V is a focused ultrasound device targeting SMAS layer lifting.',
          '超声刀是通过DeepSEE™实时成像确认皮肤结构的美国FDA认证高端仪器，而德玛蒂是以集束超声方式为目标进行SMAS层提升的仪器。',
          'ウルセラはDeepSEE™リアルタイムイメージングで肌の構造を直接確認しながら施術する米国FDA承認のプレミアム機器で、ダーマVは集束超音波方式でSMAS層リフティングを目標とする機器です。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often is treatment recommended?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるのが良いですか？',
          '6개월~1년 간격으로 유지 관리를 권장합니다.',
          'Maintenance every 6 months to 1 year is recommended.',
          '建议每6个月至1年进行一次维护管理。',
          '6ヶ月〜1年ごとのメンテナンスをお勧めします。',
        ),
      ],
    },
  },

  // 16. 루카스토닝
  {
    id: 'treatment-lucas-toning',
    data: {
      description: lt(
        '1064nm Nd:YAG 레이저를 저출력·고속 반복으로 조사하는 레이저 토닝 시술입니다. 표피의 멜라닌 색소를 선택적으로 파괴하여 피부톤을 밝게 하고 기미·잡티를 개선합니다. 모공 수축과 피지 분비 조절 효과도 있어 피부 전반의 질을 개선하는 대표적인 유지 관리 레이저입니다.',
        'A laser toning treatment that irradiates a 1064nm Nd:YAG laser at low intensity with high-speed repetition. It selectively destroys melanin pigment in the epidermis to brighten skin tone and improve melasma and blemishes. It also tightens pores and regulates sebum secretion, making it a representative maintenance laser for overall skin quality improvement.',
        '以低能量高速重复照射1064nm Nd:YAG激光的激光嫩肤项目。选择性破坏表皮黑色素，提亮肤色，改善黄褐斑和色斑。还具有收缩毛孔和调节皮脂分泌的效果，是改善整体皮肤质量的代表性维护管理激光。',
        '1064nm Nd:YAGレーザーを低出力・高速繰り返しで照射するレーザートーニング施術です。表皮のメラニン色素を選択的に破壊して肌トーンを明るくし、シミ・そばかすを改善します。毛穴の引き締めと皮脂分泌調整効果もあり、肌全体の質を向上させる代表的なメンテナンスレーザーです。',
      ),
      features: [
        ls('기미·잡티 개선 및 피부톤 균일화', 'Improved melasma and blemishes with more even skin tone', '改善黄褐斑和色斑，均匀肤色', 'シミ・そばかすの改善と肌トーンの均一化'),
        ls('모공 수축 및 피지 조절', 'Pore tightening and sebum regulation', '收缩毛孔，调节皮脂', '毛穴の引き締めと皮脂調整'),
        ls('피부 전반 밝기·투명도 개선', 'Improved overall skin brightness and clarity', '改善整体皮肤亮度和透明感', '肌全体の明るさ・透明感の改善'),
        ls('반복 시술로 누적 효과', 'Cumulative effects with repeated sessions', '重复施术累积效果', '繰り返し施術で効果が蓄積'),
      ],
      recommendedFor: [
        ls('기미·잡티·색소 침착이 고민인 분', 'Those bothered by melasma, blemishes, or hyperpigmentation', '困扰于黄褐斑、色斑和色素沉着的人', 'シミ・そばかす・色素沈着が気になる方'),
        ls('피부톤이 칙칙하고 균일하지 않을 때', 'When skin tone is dull or uneven', '肤色暗沉不均匀时', '肌トーンがくすんで不均一なとき'),
        ls('모공이 크고 피지가 많은 분', 'Those with large pores and excess sebum', '毛孔粗大、皮脂分泌旺盛的人', '毛穴が大きく皮脂が多い方'),
        ls('정기적인 피부 유지 관리를 원하는 분', 'Those who want regular skin maintenance', '希望定期进行皮肤维护管理的人', '定期的な肌のメンテナンスを希望する方'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('보호 안경 착용', 'Put on protective eyewear', '佩戴保护眼镜', '保護眼鏡を装着'),
        ls('1064nm Nd:YAG 레이저 전면 균등 조사', 'Even irradiation across the full face with 1064nm Nd:YAG laser', '用1064nm Nd:YAG激光均匀照射全面部', '1064nm Nd:YAGレーザーを全顔に均等照射'),
        ls('색소·모공 집중 부위 추가 조사', 'Additional focused treatment on pigmented areas and pores', '对色素和毛孔集中部位追加照射', '色素・毛穴の集中部位に追加照射'),
        ls('진정 마스크 및 보습·자외선 차단 마무리', 'Soothing mask followed by moisturizing and SPF finish', '镇静面膜后保湿和防晒收尾', '鎮静マスク後に保湿・日焼け止めでフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 자외선 차단 철저히 (색소 재발 예방)', 'Apply sunscreen diligently after treatment to prevent pigment recurrence', '施术后认真防晒（预防色素再发）', '施術後は日焼け止めをしっかり行ってください（色素再発予防）'),
        ls('시술 후 당일 사우나·찜질방 자제', 'Avoid sauna and jjimjilbang on treatment day', '施术当日避免桑拿和汗蒸房', '施術当日はサウナ・チムジルバンを避けてください'),
        ls('시술 직후 약한 홍조는 수 시간 내 소실', 'Mild redness immediately after treatment disappears within a few hours', '施术后即时出现的轻微红肿在数小时内消退', '施術直後の軽い赤みは数時間以内に消失します'),
        ls('레티놀·AHA·BHA 등 자극 성분 제품 당일 사용 자제', 'Avoid products with irritating ingredients such as retinol, AHA, BHA on treatment day', '施术当日避免使用含视黄醇、AHA、BHA等刺激性成分的产品', '施術当日はレチノール・AHA・BHAなど刺激成分の製品を避けてください'),
      ],
      faq: [
        faqItem(
          '기미에 얼마나 효과적인가요?', 'How effective is it for melasma?',
          '对黄褐斑效果如何？', 'シミにどのくらい効果がありますか？',
          '루카스토닝은 기미 관리에 널리 활용됩니다. 다만 기미는 자외선·호르몬 영향을 받으므로 꾸준한 자외선 차단과 반복 관리가 중요합니다.',
          'Lucas Toning is widely used for melasma management. However, since melasma is influenced by UV exposure and hormones, consistent sun protection and repeated treatments are important.',
          '卢卡斯嫩肤被广泛用于黄褐斑管理。但由于黄褐斑受紫外线和激素影响，持续防晒和反复管理非常重要。',
          'ルーカストーニングはシミ管理に広く活用されています。ただしシミは紫外線・ホルモンの影響を受けるため、継続的な日焼け止めと繰り返しのケアが重要です。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often should I receive treatment?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるべきですか？',
          '초기 집중 관리로 2~4주 간격, 이후 유지 관리로 4~8주 간격을 권장합니다.',
          'Every 2–4 weeks for initial intensive care, then every 4–8 weeks for maintenance.',
          '初期集中管理每2~4周一次，之后维护管理每4~8周一次。',
          '初期集中ケアとして2〜4週間ごと、その後のメンテナンスとして4〜8週間ごとをお勧めします。',
        ),
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '거의 없습니다. 시술 후 약한 홍조가 수 시간 내 소실되며 바로 일상 복귀가 가능합니다.',
          'Minimal. Mild redness after treatment disappears within a few hours, allowing immediate return to daily activities.',
          '几乎没有。施术后轻微红肿数小时内消退，可立即恢复日常生活。',
          'ほとんどありません。施術後の軽い赤みが数時間以内に消え、すぐに日常生活に復帰できます。',
        ),
      ],
    },
  },

  // 17. 피코토닝 피코K
  {
    id: 'treatment-pico-toning',
    data: {
      description: lt(
        '피코초(1조 분의 1초) 단위의 극초단 레이저 펄스로 멜라닌 색소 입자를 광음향 효과로 분쇄하는 레이저 토닝입니다. 기존 나노초 레이저보다 훨씬 짧은 펄스 폭으로 주변 조직 열 손상 없이 색소를 효과적으로 분해합니다. 기미·잡티 제거, 피부톤 균일화에 탁월하며 피부 재생 촉진 효과도 있습니다.',
        'A laser toning treatment that uses ultra-short picosecond (one trillionth of a second) laser pulses to shatter melanin pigment particles through a photoacoustic effect. With a far shorter pulse width than conventional nanosecond lasers, it effectively breaks down pigment without thermal damage to surrounding tissue. Outstanding for removing melasma and blemishes, evening skin tone, and promoting skin regeneration.',
        '利用皮秒（万亿分之一秒）超短激光脉冲通过光声效应粉碎黑色素颗粒的激光嫩肤项目。比传统纳秒激光脉冲宽度更短，在不损伤周围组织热量的情况下有效分解色素。在消除黄褐斑、色斑、均匀肤色方面表现卓越，还能促进皮肤再生。',
        'ピコ秒（1兆分の1秒）の超短レーザーパルスで光音響効果によりメラニン色素粒子を粉砕するレーザートーニングです。従来のナノ秒レーザーよりはるかに短いパルス幅で、周囲組織への熱ダメージなしに色素を効果的に分解します。シミ・そばかすの除去、肌トーンの均一化に優れ、肌再生促進効果もあります。',
      ),
      features: [
        ls('기미·잡티·색소 침착 효과적 분해', 'Effective breakdown of melasma, blemishes, and hyperpigmentation', '有效分解黄褐斑、色斑和色素沉着', 'シミ・そばかす・色素沈着を効果的に分解'),
        ls('주변 열 손상 최소화로 안전한 시술', 'Safe treatment with minimized thermal damage to surrounding tissue', '最小化周围热损伤，安全施术', '周囲への熱ダメージを最小化した安全な施術'),
        ls('피부톤 균일화 및 밝아짐', 'More even and brighter skin tone', '均匀肤色并使肌肤更亮泽', '肌トーンの均一化と明るさアップ'),
        ls('피부 재생 촉진 효과', 'Skin regeneration-promoting effect', '促进皮肤再生效果', '肌再生を促進する効果'),
      ],
      recommendedFor: [
        ls('기미·잡티·색소 침착이 고민인 분', 'Those bothered by melasma, blemishes, or hyperpigmentation', '困扰于黄褐斑、色斑和色素沉着的人', 'シミ・そばかす・色素沈着が気になる方'),
        ls('피부톤이 불균일하고 칙칙한 분', 'Those with uneven or dull skin tone', '肤色不均匀、暗沉的人', '肌トーンが不均一でくすんでいる方'),
        ls('나노 레이저로 효과 부족을 느낀 분', 'Those who found nanosecond laser insufficient', '觉得纳秒激光效果不足的人', 'ナノ秒レーザーで効果不足を感じた方'),
        ls('피부톤을 전반적으로 균일하고 맑게 개선하고 싶을 때', 'When you want overall improvement in skin tone uniformity and clarity', '希望全面均匀且透亮地改善肤色时', '肌トーンを全体的に均一で明るく改善したいとき'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('보호 안경 착용', 'Put on protective eyewear', '佩戴保护眼镜', '保護眼鏡を装着'),
        ls('피코초 레이저 전면 균등 조사', 'Even full-face irradiation with picosecond laser', '皮秒激光均匀照射全面部', 'ピコ秒レーザーを全顔に均等照射'),
        ls('색소 집중 부위 추가 조사', 'Additional focused treatment on pigmented areas', '对色素集中部位追加照射', '色素の集中部位に追加照射'),
        ls('진정 케어 및 보습·자외선 차단 마무리', 'Soothing care, moisturizing, and SPF finish', '镇静护理、保湿和防晒收尾', '鎮静ケア・保湿・日焼け止めでフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 철저한 자외선 차단 필수', 'Thorough sun protection is essential after treatment', '施术后必须认真防晒', '施術後は徹底した日焼け止めが必須です'),
        ls('시술 직후 약한 홍조는 수 시간 내 소실', 'Mild redness immediately after treatment disappears within a few hours', '施术后即时出现的轻微红肿在数小时内消退', '施術直後の軽い赤みは数時間以内に消えます'),
        ls('시술 후 당일 사우나·찜질방 자제', 'Avoid sauna and jjimjilbang on treatment day', '施术当日避免桑拿和汗蒸房', '施術当日はサウナ・チムジルバンを避けてください'),
        ls('자극 성분(레티놀·AHA·BHA) 제품 당일 사용 자제', 'Avoid products with irritating ingredients (retinol, AHA, BHA) on treatment day', '施术当日避免使用含刺激成分（视黄醇、AHA、BHA）的产品', '施術当日は刺激成分（レチノール・AHA・BHA）の製品を避けてください'),
      ],
      faq: [
        faqItem(
          '루카스토닝과 피코토닝의 차이는 무엇인가요?', 'What is the difference between Lucas Toning and Pico Toning?',
          '卢卡斯嫩肤和皮秒嫩肤有什么区别？', 'ルーカストーニングとピコトーニングの違いは何ですか？',
          '루카스토닝은 나노초 Nd:YAG 레이저를 사용하고, 피코토닝은 피코초 레이저로 더 짧은 펄스 폭을 사용합니다. 피코토닝이 열 손상 없이 더 효과적으로 색소를 분해하는 경향이 있습니다.',
          'Lucas Toning uses a nanosecond Nd:YAG laser, while Pico Toning uses a picosecond laser with a much shorter pulse width. Pico Toning tends to break down pigment more effectively with less thermal damage.',
          '卢卡斯嫩肤使用纳秒Nd:YAG激光，皮秒嫩肤使用脉冲宽度更短的皮秒激光。皮秒嫩肤往往在更少热损伤的情况下更有效地分解色素。',
          'ルーカストーニングはナノ秒Nd:YAGレーザーを使用し、ピコトーニングはより短いパルス幅のピコ秒レーザーを使用します。ピコトーニングは熱ダメージなしにより効果的に色素を分解する傾向があります。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often should I receive treatment?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるべきですか？',
          '2~4주 간격으로 5~10회를 권장하며, 이후 유지 관리로 4~8주 간격을 권장합니다.',
          '5–10 sessions spaced 2–4 weeks apart are recommended, followed by maintenance every 4–8 weeks.',
          '建议每2~4周进行一次，共5~10次，之后维护管理每4~8周一次。',
          '2〜4週間ごとに5〜10回をお勧めし、その後のメンテナンスとして4〜8週間ごとをお勧めします。',
        ),
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '거의 없습니다. 시술 후 가벼운 홍조가 수 시간 내 소실됩니다.',
          'Minimal. Mild redness after treatment disappears within a few hours.',
          '几乎没有。施术后轻微红肿数小时内消退。',
          'ほとんどありません。施術後の軽い赤みが数時間以内に消えます。',
        ),
      ],
    },
  },

  // 18. CO2 레이저
  {
    id: 'treatment-co2',
    data: {
      description: lt(
        '이산화탄소(CO2) 레이저가 피부 수분에 흡수되어 표피를 박피하고 진피를 자극하는 방식의 피부 재생 레이저입니다. 흉터, 깊은 주름, 피부 노화, 모공 등 피부 표면 문제를 근본적으로 개선합니다. 프랙셔널 방식은 피부 전체가 아닌 점 형태로 에너지를 전달하여 회복 기간을 단축하면서도 효과적인 재생을 유도합니다.',
        'A skin resurfacing laser in which the CO2 (carbon dioxide) laser is absorbed by skin moisture to ablate the epidermis and stimulate the dermis. It fundamentally addresses surface skin issues including scars, deep wrinkles, skin aging, and pores. The fractional method delivers energy in a dotted pattern rather than treating the entire skin surface, shortening recovery time while still inducing effective regeneration.',
        '二氧化碳（CO2）激光被皮肤水分吸收，剥脱表皮并刺激真皮的皮肤再生激光。从根本上改善疤痕、深层皱纹、皮肤老化和毛孔等皮肤表面问题。点阵方式以点状传递能量而非整体照射，在缩短恢复期的同时有效诱导再生。',
        '二酸化炭素（CO2）レーザーが皮膚の水分に吸収されて表皮を剥離し真皮を刺激する皮膚再生レーザーです。傷跡・深いシワ・皮膚老化・毛穴など皮膚表面の問題を根本的に改善します。フラクショナル方式は点状にエネルギーを届けることで回復期間を短縮しながらも効果的な再生を促します。',
      ),
      features: [
        ls('흉터·여드름 흉터·수술 흉터 개선', 'Improved appearance of scars, acne scars, and surgical scars', '改善疤痕、痘坑和手术疤痕', '傷跡・ニキビ跡・手術跡の改善'),
        ls('깊은 주름·피부 노화 개선', 'Reduced deep wrinkles and skin aging', '改善深层皱纹和皮肤老化', '深いシワ・皮膚老化の改善'),
        ls('모공·피부 질감 개선', 'Improved pores and skin texture', '改善毛孔和肤质', '毛穴・肌質の改善'),
        ls('피부 전반적인 재생 및 탄력 회복', 'Overall skin regeneration and elasticity restoration', '全面皮肤再生及弹力恢复', '肌全体の再生と弾力回復'),
      ],
      recommendedFor: [
        ls('여드름 흉터·패인 흉터가 고민인 분', 'Those bothered by acne scars or depressed scars', '困扰于痘坑或凹陷疤痕的人', 'ニキビ跡・凹み傷跡が気になる方'),
        ls('깊은 주름·피부 노화가 진행된 분', 'Those with deep wrinkles or progressed skin aging', '深层皱纹或皮肤老化加剧的人', '深いシワや肌の老化が進んだ方'),
        ls('모공이 크고 피부 질감이 거친 분', 'Those with large pores and rough skin texture', '毛孔粗大、肤质粗糙的人', '毛穴が大きく肌質が荒れている方'),
        ls('근본적인 피부 재생 관리를 원하는 분', 'Those who want fundamental skin regeneration management', '希望进行根本性皮肤再生管理的人', '根本的な肌再生ケアを望む方'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 30~60분', 'Cleanse and apply anesthetic cream for 30–60 minutes', '洗脸后涂抹麻醉膏30~60分钟', '洗顔後に麻酔クリームを30〜60分塗布'),
        ls('시술 범위 및 에너지 설정', 'Set treatment area and energy parameters', '设置施术范围和能量', '施術範囲とエネルギーを設定'),
        ls('CO2 프랙셔널 레이저 조사', 'CO2 fractional laser irradiation', 'CO2点阵激光照射', 'CO2フラクショナルレーザー照射'),
        ls('집중 부위 추가 조사', 'Additional focused treatment on targeted areas', '对集中部位追加照射', '集中部位に追加照射'),
        ls('재생 앰플 도포 및 진정 마스크 마무리', 'Apply regenerating ampoule and finish with soothing mask', '涂抹再生安瓶后镇静面膜收尾', '再生アンプル塗布と鎮静マスクでフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 7~14일 회복 기간 필요 (프랙셔널 기준)', '7–14 days of recovery time needed after treatment (fractional basis)', '施术后需要7~14天恢复期（点阵标准）', '施術後7〜14日の回復期間が必要です（フラクショナル基準）'),
        ls('회복 기간 동안 자외선 차단 철저히', 'Apply sunscreen diligently during recovery period', '恢复期间认真防晒', '回復期間中は日焼け止めをしっかり行ってください'),
        ls('딱지 형성 시 임의로 제거 금지', 'Do not forcibly remove scabs if they form', '结痂时禁止随意去除', '痂が形成された場合は無理に除去しないでください'),
        ls('회복 기간 사우나·찜질방·강한 운동 금지', 'Avoid sauna, jjimjilbang, and strenuous exercise during recovery', '恢复期间禁止桑拿、汗蒸房和剧烈运动', '回復期間中はサウナ・チムジルバン・激しい運動を禁止'),
        ls('재생 관리 제품 안내에 따라 사용', 'Use regeneration care products as instructed', '按照指引使用再生护理产品', '再生ケア製品は案内に従って使用してください'),
      ],
      faq: [
        faqItem(
          '다운타임이 얼마나 되나요?', 'How long is the downtime?',
          '恢复期有多长？', 'ダウンタイムはどのくらいですか？',
          '프랙셔널 방식 기준 7~14일이며, 에너지·면적에 따라 다를 수 있습니다. 사전 상담 시 정확한 예상 기간을 안내받으세요.',
          'Approximately 7–14 days for the fractional method, which may vary depending on energy level and treatment area. Please get an accurate estimate during your prior consultation.',
          '点阵方式约为7~14天，根据能量和面积可能有所不同。请在事前咨询时获取准确的预期时间。',
          'フラクショナル方式で7〜14日程度で、エネルギー・面積によって異なります。事前カウンセリングで正確な目安をご確認ください。',
        ),
        faqItem(
          '여드름 흉터에 효과적인가요?', 'Is it effective for acne scars?',
          '对痘坑有效吗？', 'ニキビ跡に効果がありますか？',
          '네, CO2 프랙셔널 레이저는 여드름으로 인한 패인 흉터 개선에 효과적으로 활용됩니다. 흉터 깊이와 범위에 따라 시술 횟수가 달라질 수 있습니다.',
          'Yes, CO2 fractional laser is effectively used for improving depressed scars from acne. The number of sessions may vary based on scar depth and extent.',
          '是的，CO2点阵激光被有效用于改善痤疮引起的凹陷疤痕。施术次数可能根据疤痕深度和范围而有所不同。',
          'はい、CO2フラクショナルレーザーはニキビによる凹み傷跡の改善に効果的に活用されます。傷跡の深さと範囲によって施術回数が変わります。',
        ),
        faqItem(
          '몇 회 받아야 하나요?', 'How many sessions are needed?',
          '需要做几次？', '何回受けるべきですか？',
          '피부 상태와 목표에 따라 다르지만, 여드름 흉터의 경우 3~5회를 권장하는 경우가 많습니다.',
          'Varies based on skin condition and goals, but 3–5 sessions are often recommended for acne scarring.',
          '根据皮肤状态和目标而定，痘坑的情况多数建议3~5次。',
          '肌の状態と目標によりますが、ニキビ跡の場合3〜5回をお勧めするケースが多いです。',
        ),
      ],
    },
  },

  // 19. 슈링크 유니버스
  {
    id: 'treatment-shrink',
    data: {
      description: lt(
        '마이크로포커스 초음파(MFU) 기술로 피부층과 SMAS층을 동시에 타깃하는 HIFU 리프팅 장비입니다. 기존 슈링크보다 발전된 유니버스 모델로 더 다양한 카트리지와 촘촘한 샷 간격으로 정밀한 에너지 전달이 가능합니다. 처진 얼굴 리프팅과 콜라겐 재생에 효과적입니다.',
        'A HIFU lifting device that simultaneously targets the skin layer and SMAS using Micro-Focused Ultrasound (MFU) technology. The advanced Universe model features a wider range of cartridges and denser shot spacing for more precise energy delivery compared to the original Shrink. Effective for lifting sagging facial skin and stimulating collagen regeneration.',
        '利用微聚焦超声（MFU）技术同时靶向皮肤层和SMAS层的HIFU提升仪器。比原有型号更先进的Universe型号，通过更多种类的探头和更密集的射点间距，实现精准的能量传递。对松弛面部提升和胶原蛋白再生效果显著。',
        'マイクロフォーカス超音波（MFU）技術で肌の層とSMAS層を同時にターゲットするHIFUリフティング機器です。従来のシュリンクより進化したユニバースモデルは、より多様なカートリッジと密なショット間隔で精密なエネルギー照射が可能です。たるんだ顔のリフティングとコラーゲン再生に効果的です。',
      ),
      features: [
        ls('피부층·SMAS층 동시 타깃 리프팅', 'Simultaneous skin layer and SMAS-targeting lifting', '同时靶向皮肤层和SMAS层的提升', '肌の層とSMAS層を同時にターゲットするリフティング'),
        ls('처진 얼굴·턱선 윤곽 개선', 'Improved sagging face and jawline contour', '改善面部松弛和下颌线轮廓', 'たるんだ顔・フェイスラインの輪郭を改善'),
        ls('콜라겐 재생으로 장기 탄력 개선', 'Long-term elasticity improvement through collagen regeneration', '胶原蛋白再生带来长期弹力改善', 'コラーゲン再生による長期的な弾力改善'),
        ls('촘촘한 샷 간격으로 균일한 효果', 'Uniform results with dense shot spacing', '密集射点间距带来均匀效果', '密なショット間隔で均一な効果'),
      ],
      recommendedFor: [
        ls('얼굴 처짐·이중턱이 신경 쓰이는 분', 'Those bothered by facial sagging or a double chin', '困扰于面部松弛或双下巴的人', '顔のたるみ・二重あごが気になる方'),
        ls('V라인·턱선을 정돈하고 싶을 때', 'When you want to refine your V-line or jawline', '希望整顿V线和下颌线时', 'Vライン・フェイスラインを整えたいとき'),
        ls('비수술로 확실한 리프팅을 원할 때', 'When you want a definitive lifting effect without surgery', '希望无需手术获得明确提升效果时', '手術なしで確実なリフティングを望む場合'),
        ls('콜라겐 재생을 통한 장기 관리를 원할 때', 'When long-term management through collagen regeneration is desired', '希望通过胶原蛋白再生进行长期管理时', 'コラーゲン再生による長期ケアを望む場合'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('마취 크림 도포 30~40분', 'Anesthetic cream applied for 30–40 minutes', '涂抹麻醉膏30~40分钟', '麻酔クリームを30〜40分塗布'),
        ls('카트리지 선택 및 에너지·깊이 설정', 'Select cartridge and set energy and depth', '选择探头并设置能量和深度', 'カートリッジを選択してエネルギーと深さを設定'),
        ls('부위별 MFU 에너지 조사', 'MFU energy application by treatment zone', '按部位照射MFU能量', '部位ごとにMFUエネルギーを照射'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '施术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を避けてください'),
        ls('시술 직후 홍반·부종은 수 시간 내 완화', 'Redness and swelling after treatment resolve within a few hours', '施术后即时出现的红斑和浮肿在数小时内缓解', '施術直後の赤み・腫れは数時間以内に落ち着きます'),
        ls('금속 삽입물·임플란트 보유 시 사전 고지', 'Inform staff in advance if you have metal inserts or implants', '有金属内植物或植入物时须提前告知', '金属挿入物・インプラントがある場合は事前申告が必要です'),
        ls('시술 후 자외선 차단 철저히', 'Apply sunscreen diligently after treatment', '施术后认真防晒', '施術後は日焼け止めをしっかり行ってください'),
      ],
      faq: [
        faqItem(
          '효과가 언제 나타나나요?', 'When do results appear?',
          '效果什么时候出现？', '効果はいつ現れますか？',
          '시술 후 1~3개월에 걸쳐 점진적으로 나타나며, 3~6개월 시점에 최대 효과를 확인할 수 있습니다.',
          'Results develop gradually over 1–3 months, with peak effects visible at 3–6 months.',
          '施术后1~3个月逐渐显现，3~6个月时可确认最佳效果。',
          '施術後1〜3ヶ月かけて徐々に現れ、3〜6ヶ月時点で最大の効果を確認できます。',
        ),
        faqItem(
          '울쎄라와 어떻게 다른가요?', 'How is it different from Ultherapy?',
          '与超声刀有什么区别？', 'ウルセラとどう違いますか？',
          '울쎄라는 DeepSEE™ 실시간 이미징으로 피부 구조를 확인하며 시술하는 미국 FDA 승인 장비입니다. 슈링크 유니버스는 마이크로포커스 초음파로 리프팅 효과를 목표로 하며, 경제적인 비용으로 HIFU 리프팅을 받을 수 있습니다.',
          "Ultherapy is a US FDA-cleared device that uses DeepSEE™ real-time imaging to visualize skin structure during treatment. Shrink Universe targets lifting using micro-focused ultrasound and offers HIFU lifting at a more accessible cost.",
          '超声刀是通过DeepSEE™实时成像确认皮肤结构的美国FDA认证仪器。晶致宇宙以微聚焦超声为目标实现提升效果，可以更实惠的价格接受HIFU提升。',
          'ウルセラはDeepSEE™リアルタイムイメージングで肌の構造を確認しながら施術する米国FDA承認機器です。シュリンクユニバースはマイクロフォーカス超音波でリフティング効果を目標とし、リーズナブルな価格でHIFUリフティングが受けられます。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often is treatment recommended?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるのが良いですか？',
          '6개월~1년 간격으로 유지 관리를 권장합니다.',
          'Maintenance every 6 months to 1 year is recommended.',
          '建议每6个月至1年进行一次维护管理。',
          '6ヶ月〜1年ごとのメンテナンスをお勧めします。',
        ),
      ],
    },
  },

  // 20. 인모드
  {
    id: 'treatment-inmode',
    data: {
      description: lt(
        'RF(고주파) 에너지를 미세침을 통해 피부 깊숙이 전달하는 미세침 RF 장비입니다. 대표 모드인 Morpheus8은 마이크로니들 어레이로 진피 깊은 층까지 RF 에너지를 전달하여 피부 리모델링, 여드름 흉터, 모공 개선에 효과적입니다. 표피 손상을 최소화하면서 진피 깊이 에너지를 전달하는 것이 특징입니다.',
        'A microneedle RF device that delivers RF (radiofrequency) energy deep into the skin through microneedles. The signature Morpheus8 mode delivers RF energy to the deep dermis via a microneedle array, making it highly effective for skin remodeling, acne scars, and pore improvement. Its defining feature is delivering energy to deep dermis while minimizing epidermal damage.',
        '通过微针将射频（RF）能量深度传递至皮肤的微针RF仪器。代表模式Morpheus8通过微针阵列将RF能量传递至真皮深层，对皮肤重塑、痘坑和毛孔改善效果显著。最大化减少表皮损伤的同时将能量传递至真皮深层是其特点。',
        '極細の針（マイクロニードル）を通じてRF（高周波）エネルギーを肌の深部に届けるマイクロニードルRF機器です。代表モードのMorpheus8はマイクロニードルアレイで真皮の深部にRFエネルギーを届け、肌のリモデリング・ニキビ跡・毛穴改善に高い効果を発揮します。表皮ダメージを最小限に抑えながら真皮の深さにエネルギーを届けるのが特徴です。',
      ),
      features: [
        ls('여드름 흉터·패인 흉터 개선', 'Improved acne scars and depressed scars', '改善痘坑和凹陷疤痕', 'ニキビ跡・凹み傷跡の改善'),
        ls('모공 축소 및 피부 질감 개선', 'Reduced pores and improved skin texture', '收缩毛孔、改善肤质', '毛穴縮小と肌質改善'),
        ls('피부 리모델링으로 탄력 개선', 'Improved elasticity through skin remodeling', '皮肤重塑改善弹力', '肌のリモデリングで弾力改善'),
        ls('표피 손상 최소화로 빠른 회복', 'Faster recovery with minimized epidermal damage', '最小化表皮损伤，恢复更快', '表皮ダメージを最小化して回復が早い'),
      ],
      recommendedFor: [
        ls('여드름 흉터·패인 피부가 고민인 분', 'Those troubled by acne scars or depressed skin', '困扰于痘坑或凹陷皮肤的人', 'ニキビ跡・凹んだ肌が気になる方'),
        ls('모공이 크고 피부 질감이 거친 분', 'Those with large pores and rough skin texture', '毛孔粗大、肤质粗糙的人', '毛穴が大きく肌質が荒れている方'),
        ls('피부 탄력과 리모델링을 동시에 원할 때', 'When you want skin elasticity and remodeling simultaneously', '希望同时获得皮肤弹力和重塑效果时', '肌の弾力とリモデリングを同時に望む場合'),
        ls('CO2 레이저보다 짧은 회복 기간을 원할 때', 'When you want a shorter recovery time than CO2 laser', '希望比CO2激光恢复期更短时', 'CO2レーザーより短い回復期間を希望するとき'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 30~60분', 'Cleanse and apply anesthetic cream for 30–60 minutes', '洗脸后涂抹麻醉膏30~60分钟', '洗顔後に麻酔クリームを30〜60分塗布'),
        ls('시술 부위 및 니들 깊이·에너지 설정', 'Set treatment area, needle depth, and energy parameters', '设置施术部位、针深度和能量', '施術部位・針の深さ・エネルギーを設定'),
        ls('마이크로니들 RF 에너지 조사', 'Microneedle RF energy application', '微针RF能量照射', 'マイクロニードルRFエネルギーを照射'),
        ls('집중 부위 추가 조사', 'Additional focused treatment on targeted areas', '对集中部位追加照射', '集中部位に追加照射'),
        ls('재생 앰플 도포 및 진정 마스크 마무리', 'Apply regenerating ampoule and finish with soothing mask', '涂抹再生安瓶后镇静面膜收尾', '再生アンプル塗布と鎮静マスクでフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 3~7일 붉음증·딱지 형성 가능 (자연 소실)', 'Redness and scab formation may occur for 3–7 days, resolving naturally', '施术后3~7天可能出现红肿和结痂（自然消退）', '施術後3〜7日間は赤み・痂の形成が生じる場合があります（自然消失）'),
        ls('회복 기간 동안 자외선 차단 철저히', 'Apply sunscreen diligently during recovery', '恢复期间认真防晒', '回復期間中は日焼け止めをしっかり行ってください'),
        ls('딱지 임의 제거 금지', 'Do not forcibly remove scabs', '禁止随意去除结痂', '痂を無理に除去しないでください'),
        ls('시술 후 재생 관리 제품 안내에 따라 사용', 'Use regeneration care products as instructed after treatment', '施术后按指引使用再生护理产品', '施術後は再生ケア製品を案内に従って使用してください'),
        ls('임신 중 또는 피부 감염·염증 활성기 시술 불가', 'Not suitable during pregnancy or when active skin infection or inflammation is present', '妊娠中或皮肤感染/炎症活动期不可施术', '妊娠中または皮膚感染・炎症の活動期は施術不可です'),
      ],
      faq: [
        faqItem(
          'CO2 레이저와 어떻게 다른가요?', 'How is it different from CO2 laser?',
          '与CO2激光有什么区别？', 'CO2レーザーとどう違いますか？',
          'CO2 레이저는 표피를 박피하는 방식으로 회복 기간이 길고 효과적입니다. 인모드는 미세침으로 진피에 RF를 전달해 표피 손상을 줄이면서 피부 리모델링을 도모합니다. 회복 기간이 상대적으로 짧습니다.',
          'CO2 laser ablates the epidermis for effective results but requires a longer recovery period. InMode delivers RF to the dermis via microneedles, reducing epidermal damage while promoting skin remodeling—with a comparatively shorter recovery time.',
          'CO2激光通过剥脱表皮方式效果显著但恢复期较长。英莫德通过微针将RF传递至真皮，减少表皮损伤的同时促进皮肤重塑，恢复期相对较短。',
          'CO2レーザーは表皮を剥離する方式で効果的ですが回復期間が長いです。インモードは微細針で真皮にRFを届けて表皮ダメージを減らしながら肌のリモデリングを促します。回復期間が比較的短いです。',
        ),
        faqItem(
          '다운타임이 얼마나 되나요?', 'How long is the downtime?',
          '恢复期有多长？', 'ダウンタイムはどのくらいですか？',
          '일반적으로 3~7일이며, 시술 강도와 범위에 따라 달라질 수 있습니다.',
          'Generally 3–7 days, which may vary based on treatment intensity and area.',
          '一般为3~7天，根据施术强度和范围可能有所不同。',
          '一般的に3〜7日で、施術の強度と範囲によって異なります。',
        ),
        faqItem(
          '몇 회 받아야 하나요?', 'How many sessions are needed?',
          '需要做几次？', '何回受けるべきですか？',
          '목표와 상태에 따라 다르지만 3~5회를 권장하는 경우가 많습니다. 4~6주 간격으로 진행합니다.',
          'Varies based on goals and condition, but 3–5 sessions spaced 4–6 weeks apart are often recommended.',
          '根据目标和状态而定，多数建议3~5次，每4~6周进行一次。',
          '目標と状態によりますが、4〜6週間ごとに3〜5回をお勧めするケースが多いです。',
        ),
      ],
    },
  },

  // 21. 실펌X
  {
    id: 'treatment-sylfirm',
    data: {
      description: lt(
        '마이크로니들 RF와 혈관 선택적 응고 기술을 결합한 장비입니다. 비정상적인 모세혈관과 색소를 선택적으로 타깃하여 홍조, 모세혈관 확장, 멜라닌 색소 과다를 효과적으로 개선합니다. 기존 장비로 치료가 어려웠던 홍조·혈관성 색소·복합 피부 문제에 특화된 시술입니다.',
        'A device that combines microneedle RF with selective vascular coagulation technology. It selectively targets abnormal capillaries and pigmentation to effectively improve rosacea, vascular dilation, and excess melanin pigmentation. A specialized treatment for redness, vascular pigmentation, and complex skin concerns that were difficult to address with conventional devices.',
        '结合微针RF和血管选择性凝固技术的仪器。选择性靶向异常毛细血管和色素，有效改善红肿、毛细血管扩张和黑色素过多。专为传统仪器难以治疗的红肿、血管性色素和复合皮肤问题而设计。',
        'マイクロニードルRFと血管選択的凝固技術を組み合わせた機器です。異常な毛細血管と色素を選択的にターゲットし、赤み・毛細血管拡張・メラニン色素過多を効果的に改善します。従来の機器では治療が難しかった赤み・血管性色素・複合的な肌の問題に特化した施術です。',
      ),
      features: [
        ls('홍조·모세혈관 확장 개선', 'Improved redness and capillary dilation', '改善红肿和毛细血管扩张', '赤み・毛細血管拡張の改善'),
        ls('혈관성 색소·기미 개선', 'Improved vascular pigmentation and melasma', '改善血管性色素和黄褐斑', '血管性色素・シミの改善'),
        ls('피부 탄력·모공 개선', 'Improved skin elasticity and pores', '改善皮肤弹力和毛孔', '肌の弾力・毛穴の改善'),
        ls('복합 피부 문제 동시 케어', 'Simultaneous care for multiple skin concerns', '同时护理复合皮肤问题', '複合的な肌の問題を同時にケア'),
      ],
      recommendedFor: [
        ls('얼굴 홍조·상시 붉음이 고민인 분', 'Those bothered by facial redness or persistent flushing', '困扰于面部红肿或持续性潮红的人', '顔の赤み・常時の赤みが気になる方'),
        ls('모세혈관 확장·실핏줄이 보이는 분', 'Those with visible capillary dilation or spider veins', '有毛细血管扩张或红血丝的人', '毛細血管拡張・赤い血管が見える方'),
        ls('기미·혈관성 색소 침착이 있는 분', 'Those with melasma or vascular hyperpigmentation', '有黄褐斑或血管性色素沉着的人', 'シミ・血管性色素沈着がある方'),
        ls('여러 피부 문제를 한 번에 케어하고 싶을 때', 'When you want to address multiple skin concerns at once', '希望一次护理多种皮肤问题时', '複数の肌の悩みを一度にケアしたいとき'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 30~40분', 'Cleanse and apply anesthetic cream for 30–40 minutes', '洗脸后涂抹麻醉膏30~40分钟', '洗顔後に麻酔クリームを30〜40分塗布'),
        ls('피부 상태 분석 및 에너지·모드 설정', 'Analyze skin condition and set energy and mode', '分析皮肤状态并设置能量和模式', '肌の状態を分析してエネルギーとモードを設定'),
        ls('마이크로니들 RF 조사 (연속파·펄스파 선택)', 'Microneedle RF irradiation (select continuous or pulsed wave)', '微针RF照射（选择连续波或脉冲波）', 'マイクロニードルRF照射（連続波・パルス波を選択）'),
        ls('혈관·색소 집중 부위 추가 조사', 'Additional focused treatment on vascular and pigmented areas', '对血管和色素集中部位追加照射', '血管・色素の集中部位に追加照射'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 3~5일 붉음증·미세 딱지 가능 (자연 소실)', 'Redness and micro-scabbing may occur for 3–5 days, resolving naturally', '施术后3~5天可能出现红肿和微小结痂（自然消退）', '施術後3〜5日間は赤み・微細な痂が生じる場合があります（自然消失）'),
        ls('자외선 차단 철저히', 'Apply sunscreen diligently', '认真防晒', '日焼け止めをしっかり行ってください'),
        ls('딱지 임의 제거 금지', 'Do not forcibly remove scabs', '禁止随意去除结痂', '痂を無理に除去しないでください'),
        ls('임신 중·피부 감염 활성기 시술 불가', 'Not suitable during pregnancy or when active skin infection is present', '妊娠中或皮肤感染活动期不可施术', '妊娠中・皮膚感染の活動期は施術不可です'),
      ],
      faq: [
        faqItem(
          '홍조 치료에 정말 효과가 있나요?', 'Is it truly effective for redness treatment?',
          '对红肿治疗真的有效吗？', '赤みの治療に本当に効果がありますか？',
          '네, 실펌X는 비정상 모세혈관을 선택적으로 응고하여 홍조와 혈관 확장을 개선하는 데 특화되어 있습니다. 다만 개인차가 있으며 반복 시술이 필요할 수 있습니다.',
          'Yes, Sylfirm X is specialized for selectively coagulating abnormal capillaries to improve redness and vascular dilation. Results vary by individual, and repeated sessions may be needed.',
          '是的，Sylfirm X专门通过选择性凝固异常毛细血管来改善红肿和血管扩张。但存在个体差异，可能需要重复施术。',
          'はい、シルファームXは異常な毛細血管を選択的に凝固して赤みと血管拡張を改善することに特化しています。ただし個人差があり、繰り返しの施術が必要な場合があります。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often is treatment recommended?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるのが良いですか？',
          '4~6주 간격으로 3~5회를 권장하며, 이후 유지 관리는 3~6개월 간격으로 합니다.',
          '3–5 sessions spaced 4–6 weeks apart are recommended; maintenance is then every 3–6 months.',
          '建议每4~6周进行一次，共3~5次；之后每3~6个月进行维护管理。',
          '4〜6週間ごとに3〜5回をお勧めし、その後のメンテナンスは3〜6ヶ月ごとに行います。',
        ),
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '3~5일 정도 붉음증과 가벼운 딱지가 생길 수 있습니다. 회복 후 피부 개선이 나타납니다.',
          'Redness and mild scabbing may occur for approximately 3–5 days. Skin improvement becomes visible after recovery.',
          '约3~5天可能出现红肿和轻微结痂。恢复后皮肤改善显现。',
          '約3〜5日間赤みと軽い痂が生じることがあります。回復後に肌の改善が現れます。',
        ),
      ],
    },
  },

  // 22. 포텐자
  {
    id: 'treatment-potenza',
    data: {
      description: lt(
        '마이크로니들 RF 방식으로 피부 진피 깊이 콜라겐 재생을 유도하는 장비입니다. 절연 니들이 피부 표피 손상을 최소화하면서 진피층에 정밀하게 RF 에너지를 전달합니다. 여드름 흉터, 모공, 피부 질감 개선은 물론 주름·탄력 개선까지 다양한 피부 목표에 적용 가능한 복합 장비입니다.',
        'A microneedle RF device that stimulates collagen regeneration deep in the dermis. Insulated needles precisely deliver RF energy to the dermal layer while minimizing epidermal damage. A multi-purpose device applicable to a wide range of skin goals, including acne scar, pore, and skin texture improvement as well as wrinkle reduction and elasticity improvement.',
        '通过微针RF方式诱导皮肤真皮深层胶原蛋白再生的仪器。绝缘针头在最大化减少表皮损伤的同时，精准向真皮层传递RF能量。除改善痘坑、毛孔和肤质外，还可改善皱纹和弹力，适用于多种皮肤目标的复合仪器。',
        'マイクロニードルRF方式で皮膚の真皮の深部にコラーゲン再生を誘導する機器です。絶縁ニードルが表皮ダメージを最小限に抑えながら真皮層に精密にRFエネルギーを届けます。ニキビ跡・毛穴・肌質改善はもちろん、シワ・弾力改善まで様々な肌の目標に対応できる複合機器です。',
      ),
      features: [
        ls('여드름 흉터·패인 피부 개선', 'Improved acne scars and depressed skin', '改善痘坑和凹陷皮肤', 'ニキビ跡・凹んだ肌の改善'),
        ls('모공 축소 및 피부 질감 개선', 'Reduced pores and improved skin texture', '收缩毛孔、改善肤质', '毛穴縮小と肌質改善'),
        ls('진피 콜라겐 재생으로 탄력 회복', 'Elasticity restoration through dermal collagen regeneration', '真皮胶原蛋白再生恢复弹力', '真皮コラーゲン再生で弾力を回復'),
        ls('표피 손상 최소화로 비교적 짧은 회복 기간', 'Relatively short recovery period with minimized epidermal damage', '最小化表皮损伤，恢复期相对较短', '表皮ダメージを最小化した比較的短い回復期間'),
      ],
      recommendedFor: [
        ls('여드름 흉터·패인 흉터가 있는 분', 'Those with acne scars or depressed scars', '有痘坑或凹陷疤痕的人', 'ニキビ跡・凹み傷跡がある方'),
        ls('모공이 크고 피부 결이 거친 분', 'Those with large pores and rough skin texture', '毛孔粗大、肤质粗糙的人', '毛穴が大きく肌のキメが荒れている方'),
        ls('주름과 탄력 저하를 함께 개선하고 싶을 때', 'When you want to address wrinkles and reduced elasticity simultaneously', '希望同时改善皱纹和弹力下降时', 'シワと弾力低下を同時に改善したいとき'),
        ls('피부 전반 리모델링을 원하는 분', 'Those wanting overall skin remodeling', '希望全面皮肤重塑的人', '肌全体のリモデリングを望む方'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 30~60분', 'Cleanse and apply anesthetic cream for 30–60 minutes', '洗脸后涂抹麻醉膏30~60分钟', '洗顔後に麻酔クリームを30〜60分塗布'),
        ls('시술 부위·니들 깊이·에너지 설정', 'Set treatment area, needle depth, and energy', '设置施术部位、针深度和能量', '施術部位・針の深さ・エネルギーを設定'),
        ls('절연 마이크로니들 RF 조사', 'Insulated microneedle RF application', '绝缘微针RF照射', '絶縁マイクロニードルRF照射'),
        ls('집중 부위 추가 조사', 'Additional focused treatment on targeted areas', '对集中部位追加照射', '集中部位に追加照射'),
        ls('재생 앰플 도포 및 진정 마스크 마무리', 'Apply regenerating ampoule and finish with soothing mask', '涂抹再生安瓶后镇静面膜收尾', '再生アンプル塗布と鎮静マスクでフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 3~7일 붉음증·딱지 가능 (자연 소실)', 'Redness and scabbing may occur for 3–7 days, resolving naturally', '施术后3~7天可能出现红肿和结痂（自然消退）', '施術後3〜7日間は赤み・痂が生じる場合があります（自然消失）'),
        ls('회복 기간 자외선 차단 철저히', 'Apply sunscreen diligently during recovery', '恢复期间认真防晒', '回復期間中は日焼け止めをしっかり行ってください'),
        ls('딱지 임의 제거 금지', 'Do not forcibly remove scabs', '禁止随意去除结痂', '痂を無理に除去しないでください'),
        ls('임신 중·피부 감염 활성기 시술 불가', 'Not suitable during pregnancy or when active skin infection is present', '妊娠中或皮肤感染活动期不可施术', '妊娠中・皮膚感染の活動期は施術不可です'),
      ],
      faq: [
        faqItem(
          '인모드와 어떻게 다른가요?', 'How is it different from InMode?',
          '与英莫德有什么区别？', 'インモードとどう違いますか？',
          '두 장비 모두 마이크로니들 RF 방식이지만, 포텐자는 절연 니들로 표피 손상을 더욱 최소화하는 것이 특징입니다. 적합한 장비는 피부 상태와 목표에 따라 상담 후 결정합니다.',
          'Both devices use microneedle RF, but Potenza features insulated needles that further minimize epidermal damage. The most suitable device is determined through consultation based on skin condition and goals.',
          '两款仪器均采用微针RF方式，但坡腾匝的特点是使用绝缘针头进一步最小化表皮损伤。适合的仪器根据皮肤状态和目标咨询后决定。',
          '両機器ともマイクロニードルRF方式ですが、ポテンザは絶縁ニードルで表皮ダメージをさらに最小化するのが特徴です。最適な機器は肌の状態と目標に応じてカウンセリング後に決定します。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often should I receive treatment?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるべきですか？',
          '4~6주 간격으로 3~5회를 권장하며, 이후 유지 관리는 3~6개월 간격으로 합니다.',
          '3–5 sessions spaced 4–6 weeks apart are recommended; maintenance is then every 3–6 months.',
          '建议每4~6周进行一次，共3~5次；之后每3~6个月进行维护管理。',
          '4〜6週間ごとに3〜5回をお勧めし、その後のメンテナンスは3〜6ヶ月ごとに行います。',
        ),
        faqItem(
          '다운타임이 얼마나 되나요?', 'How long is the downtime?',
          '恢复期有多长？', 'ダウンタイムはどのくらいですか？',
          '3~7일이며, 시술 강도와 개인 피부 상태에 따라 달라질 수 있습니다.',
          '3–7 days, which may vary based on treatment intensity and individual skin condition.',
          '3~7天，根据施术强度和个人皮肤状态可能有所不同。',
          '3〜7日で、施術の強度と個人の肌の状態によって異なります。',
        ),
      ],
    },
  },

  // 23. 올타이트
  {
    id: 'treatment-alltight',
    data: {
      description: lt(
        'RF(고주파) 에너지를 광범위하게 전달하여 얼굴과 바디 전체 피부 탄력을 개선하는 타이트닝 장비입니다. 진피층 균일 가열로 콜라겐 수축과 재생을 유도하며, 얼굴 전체의 리프팅 효과와 바디 피부 탄력 개선에 모두 활용됩니다. 광범위한 부위를 효율적으로 관리할 수 있어 시술 시간이 비교적 짧습니다.',
        'A tightening device that delivers RF (radiofrequency) energy broadly to improve skin elasticity across the face and body. Uniform dermis heating induces collagen contraction and regeneration, and it is used for both full-face lifting and body skin elasticity improvement. Efficiently treating a wide area keeps treatment time relatively short.',
        '广泛传递射频（RF）能量，改善面部和全身皮肤弹力的紧肤仪器。通过均匀加热真皮层诱导胶原蛋白收缩和再生，既可用于全面部提升也可改善身体皮肤弹力。可高效管理大范围区域，施术时间相对较短。',
        'RF（高周波）エネルギーを広範囲に届けて顔と全身の肌の弾力を改善するタイトニング機器です。真皮層の均一加熱でコラーゲンの収縮と再生を誘導し、顔全体のリフティング効果と体の肌の弾力改善の両方に活用されます。広い部位を効率的にケアでき、施術時間が比較的短いです。',
      ),
      features: [
        ls('얼굴·바디 광범위 피부 타이트닝', 'Broad facial and body skin tightening', '面部和身体大范围皮肤紧致', '顔・ボディの広範囲な肌のタイトニング'),
        ls('진피층 균일 가열로 콜라겐 재생', 'Collagen regeneration through uniform dermis heating', '均匀加热真皮层促进胶原蛋白再生', '真皮層の均一加熱によるコラーゲン再生'),
        ls('전체 얼굴 탄력 개선 및 리프팅', 'Overall facial elasticity improvement and lifting', '全面部弹力改善及提升', '顔全体の弾力改善とリフティング'),
        ls('짧은 시술 시간으로 효율적 관리', 'Efficient management with short treatment time', '施术时间短，高效管理', '短い施術時間で効率的なケア'),
      ],
      recommendedFor: [
        ls('얼굴 전체적으로 탄력이 저하된 분', 'Those with overall reduced facial elasticity', '整体面部弹力下降的人', '顔全体的に弾力が低下した方'),
        ls('얼굴·바디 피부 처짐을 개선하고 싶을 때', 'When you want to improve sagging on the face and body', '希望改善面部和身体皮肤松弛时', '顔・ボディの肌のたるみを改善したいとき'),
        ls('짧은 시간 내 넓은 부위를 관리하고 싶을 때', 'When you want to treat a wide area in a short time', '希望在短时间内管理大范围区域时', '短時間で広い部位をケアしたいとき'),
        ls('다운타임 없이 정기적 피부 탄력 관리를 원할 때', 'When you want regular skin elasticity management with no downtime', '希望在无恢复期的情况下定期进行皮肤弹力管理时', 'ダウンタイムなしで定期的な肌の弾力ケアを望む場合'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('핸드피스 선택 및 에너지 설정', 'Select handpiece and set energy parameters', '选择手柄并设置能量', 'ハンドピースを選択してエネルギーを設定'),
        ls('RF 에너지 전체 부위 균일 조사', 'Uniform RF energy application across the entire treatment area', 'RF能量均匀照射全部位', 'RF エネルギーを全部位に均一照射'),
        ls('집중 부위 추가 조사', 'Additional focused treatment on targeted areas', '对集中部位追加照射', '集中部位に追加照射'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 당일 사우나·찜질방 자제', 'Avoid sauna and jjimjilbang on treatment day', '施术当日避免桑拿和汗蒸房', '施術当日はサウナ・チムジルバンを避けてください'),
        ls('시술 직후 홍조·열감은 수 시간 내 소실', 'Redness and warmth after treatment disappear within a few hours', '施术后即时出现的红肿和热感在数小时内消退', '施術直後の赤み・熱感は数時間以内に消えます'),
        ls('금속 삽입물·페이스메이커 보유 시 시술 불가', 'Not suitable for those with metal inserts or pacemakers', '有金属内植物或起搏器时不可施术', '金属挿入物・ペースメーカーがある方は施術不可です'),
        ls('임신 중 시술 불가', 'Not available during pregnancy', '妊娠期间不可施术', '妊娠中は施術不可です'),
      ],
      faq: [
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '거의 없습니다. 시술 직후 홍조·열감이 수 시간 내 사라지며 바로 일상 복귀 가능합니다.',
          'Minimal. Redness and warmth disappear within a few hours, allowing immediate return to daily activities.',
          '几乎没有。施术后即时出现的红肿和热感数小时内消退，可立即恢复日常生活。',
          'ほとんどありません。施術直後の赤み・熱感が数時間以内に消え、すぐに日常生活に復帰できます。',
        ),
        faqItem(
          '얼굴과 바디 모두 가능한가요?', 'Can it be applied to both face and body?',
          '面部和身体都可以做吗？', '顔とボディ両方に使えますか？',
          '네, 얼굴 전체는 물론 목, 복부, 팔뚝 등 바디 부위에도 적용 가능합니다.',
          'Yes, it can be applied to the entire face as well as body areas including the neck, abdomen, and arms.',
          '可以，除全面部外，还可应用于颈部、腹部、手臂等身体部位。',
          'はい、顔全体はもちろん、首・腹部・二の腕などのボディ部位にも対応できます。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often should I receive treatment?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるべきですか？',
          '3~4주 간격으로 3~5회를 권장하며, 이후 2~3개월 간격으로 유지 관리합니다.',
          '3–5 sessions spaced 3–4 weeks apart are recommended; maintenance is then every 2–3 months.',
          '建议每3~4周进行一次，共3~5次；之后每2~3个月进行维护管理。',
          '3〜4週間ごとに3〜5回をお勧めし、その後2〜3ヶ月ごとにメンテナンスを行います。',
        ),
      ],
    },
  },

  // 24. 세르프
  {
    id: 'treatment-serf',
    data: {
      description: lt(
        '선택적 집속 초음파(HIFU) 방식으로 피부 탄력을 개선하는 리프팅 장비입니다. 피부 표면에서 설정한 깊이에 정밀하게 초음파 에너지를 집중시켜 열 응고점을 형성하고 콜라겐 재생을 유도합니다. 얼굴과 목의 처짐 개선 및 윤곽 정돈에 효과적인 비수술 리프팅 시술입니다.',
        'A lifting device that improves skin elasticity using selective focused ultrasound (HIFU). It precisely concentrates ultrasound energy at a preset depth from the skin surface, forming thermal coagulation points and inducing collagen regeneration. An effective non-surgical lifting treatment for improving sagging and refining contours on the face and neck.',
        '通过选择性聚焦超声（HIFU）方式改善皮肤弹力的提升仪器。从皮肤表面精准聚焦超声能量至设定深度，形成热凝固点并诱导胶原蛋白再生。改善面部和颈部松弛及整顿轮廓的有效非手术提升项目。',
        '選択的集束超音波（HIFU）方式で肌の弾力を改善するリフティング機器です。皮膚表面から設定した深さに精密に超音波エネルギーを集中させて熱凝固点を形成し、コラーゲン再生を促します。顔と首のたるみ改善と輪郭整備に効果的な非手術リフティング施術です。',
      ),
      features: [
        ls('선택적 집속 초음파로 정밀 리프팅', 'Precise lifting using selective focused ultrasound', '选择性聚焦超声实现精准提升', '選択的集束超音波による精密なリフティング'),
        ls('콜라겐 재생으로 피부 탄력 개선', 'Improved skin elasticity through collagen regeneration', '胶原蛋白再生改善皮肤弹力', 'コラーゲン再生で肌の弾力を改善'),
        ls('얼굴·목 처짐 및 윤곽 개선', 'Improved sagging and contours on face and neck', '改善面部和颈部松弛及轮廓', '顔・首のたるみと輪郭を改善'),
        ls('비수술 비침습적 시술', 'Non-surgical, non-invasive procedure', '无创非手术施术', '非手術・非侵襲的な施術'),
      ],
      recommendedFor: [
        ls('얼굴·목 처짐이 신경 쓰이는 분', 'Those bothered by sagging on the face or neck', '困扰于面部和颈部松弛的人', '顔・首のたるみが気になる方'),
        ls('비수술로 리프팅 효과를 원할 때', 'When a lifting effect without surgery is desired', '希望无需手术获得提升效果时', '手術なしでリフティング効果を望む場合'),
        ls('이중턱·턱선 윤곽을 개선하고 싶을 때', 'When improvement of double chin or jawline contour is desired', '希望改善双下巴或下颌线轮廓时', '二重あご・フェイスラインの輪郭を改善したいとき'),
        ls('처음 HIFU 리프팅을 시도하는 분', 'Those trying HIFU lifting for the first time', '首次尝试HIFU提升的人', '初めてHIFUリフティングを試みる方'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洗脸及卸妆', '洗顔・メイク落とし'),
        ls('마취 크림 도포 30~40분', 'Anesthetic cream applied for 30–40 minutes', '涂抹麻醉膏30~40分钟', '麻酔クリームを30〜40分塗布'),
        ls('피부 깊이별 에너지 설정', 'Set energy based on skin depth', '根据皮肤深度设置能量', '皮膚の深さごとにエネルギーを設定'),
        ls('부위별 집속 초음파 조사', 'Focused ultrasound application by treatment zone', '按部位照射集束超声', '部位ごとに集束超音波を照射'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '施术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を避けてください'),
        ls('시술 직후 홍반·부종은 수 시간 내 완화', 'Redness and swelling after treatment resolve within a few hours', '施术后即时出现的红斑和浮肿在数小时内缓解', '施術直後の赤み・腫れは数時間以内に落ち着きます'),
        ls('금속 삽입물·임플란트 보유 시 사전 고지', 'Inform staff in advance if you have metal inserts or implants', '有金属内植物或植入物时须提前告知', '金属挿入物・インプラントがある場合は事前申告が必要です'),
        ls('시술 후 자외선 차단 철저히', 'Apply sunscreen diligently after treatment', '施术后认真防晒', '施術後は日焼け止めをしっかり行ってください'),
      ],
      faq: [
        faqItem(
          '효과는 언제 나타나나요?', 'When do results appear?',
          '效果什么时候出现？', '効果はいつ現れますか？',
          '시술 후 1~3개월에 걸쳐 점진적으로 나타나며, 3~6개월에 최대 효과를 확인할 수 있습니다.',
          'Results develop gradually over 1–3 months, with peak effects visible at 3–6 months.',
          '施术后1~3个月逐渐显现，3~6个月时可确认最佳效果。',
          '施術後1〜3ヶ月かけて徐々に現れ、3〜6ヶ月時点で最大の効果を確認できます。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often is treatment recommended?',
          '多久做一次比较好？', 'どのくらいの頻度で受けるのが良いですか？',
          '6개월~1년 간격으로 유지 관리를 권장합니다.',
          'Maintenance every 6 months to 1 year is recommended.',
          '建议每6个月至1年进行一次维护管理。',
          '6ヶ月〜1年ごとのメンテナンスをお勧めします。',
        ),
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '거의 없습니다. 시술 직후 가벼운 홍반·부종이 수 시간 내 완화되며 일상 복귀가 가능합니다.',
          'Minimal. Mild redness and swelling after treatment resolve within a few hours, allowing return to daily activities.',
          '几乎没有。施术后即时出现的轻微红斑和浮肿在数小时内缓解，可恢复日常生活。',
          'ほとんどありません。施術直後の軽い赤み・腫れが数時間以内に落ち着き、日常生活への復帰が可能です。',
        ),
      ],
    },
  },

  // 12. 리투오
  {
    id: 'treatment-retuo',
    data: {
      description: lt(
        'PDRN(폴리데옥시리보뉴클레오티드) 성분을 피부에 직접 주입하는 스킨부스터입니다. 리쥬란과 유사한 DNA 기반 성분이지만 다른 제형으로, 피부 세포 재생을 유도하고 항염 효과로 피부 환경을 개선합니다. 손상된 피부 회복, 수분 공급, 탄력 개선에 효과적이며 레이저 시술 후 회복 촉진에도 활용됩니다.',
        'A skin booster that directly injects PDRN (polydeoxyribonucleotide) into the skin. A DNA-based ingredient similar to Rejuran but in a different formulation, it induces skin cell regeneration and improves the skin environment through anti-inflammatory effects. Effective for damaged skin recovery, hydration, and elasticity improvement—and also used to accelerate recovery after laser treatments.',
        '将PDRN（多聚脱氧核糖核苷酸）成分直接注射至皮肤的水光针项目。与丽珠兰类似的DNA基底成分但制剂不同，诱导皮肤细胞再生，通过抗炎效果改善皮肤环境。对受损皮肤恢复、补水、弹力改善效果显著，也可用于激光施术后加速恢复。',
        '皮膚にPDRN（ポリデオキシリボヌクレオチド）を直接注入するスキンブースターです。リジュランと類似したDNAベースの成分ですが異なる製剤で、皮膚細胞の再生を誘導し、抗炎症効果で肌環境を改善します。ダメージを受けた肌の回復・保湿・弾力改善に効果的で、レーザー施術後の回復促進にも活用されます。',
      ),
      features: [
        ls('피부 세포 재생 촉진 및 손상 회복', 'Stimulated skin cell regeneration and damage recovery', '促进皮肤细胞再生及损伤修复', '肌細胞の再生促進とダメージ回復'),
        ls('항염 효과로 트러블·홍조 완화', 'Reduced breakouts and redness through anti-inflammatory effects', '抗炎效果缓解痘痘和红肿', '抗炎効果でニキビ・赤みを緩和'),
        ls('수분·탄력 개선', 'Improved hydration and elasticity', '改善水分和弹力', '保湿・弾力の改善'),
        ls('레이저 시술 후 회복 촉진', 'Accelerated recovery after laser treatments', '加速激光施术后恢复', 'レーザー施術後の回復を促進'),
      ],
      recommendedFor: [
        ls('피부 재생력이 떨어지고 회복이 느린 분', 'Those with reduced skin regenerative capacity and slow recovery', '皮肤再生能力下降、恢复缓慢的人', '肌の再生力が低下して回復が遅い方'),
        ls('트러블·홍조가 잦고 피부가 예민한 분', 'Those with frequent breakouts, redness, or sensitive skin', '痘痘、红肿频繁、皮肤敏感的人', 'ニキビ・赤みが多く肌が敏感な方'),
        ls('레이저 후 빠른 피부 회복을 원할 때', 'When fast skin recovery after laser treatment is desired', '希望激光后快速恢复皮肤时', 'レーザー後の迅速な肌回復を希望するとき'),
        ls('전반적인 피부 컨디션 개선을 원하는 분', 'Those seeking overall skin condition improvement', '希望全面改善皮肤状态的人', '全体的な肌のコンディション改善を望む方'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 20~30분', 'Cleanse and apply anesthetic cream for 20–30 minutes', '洗脸后涂抹麻醉膏20~30分钟', '洗顔後に麻酔クリームを20〜30分塗布'),
        ls('주입 포인트 설계', 'Map injection points', '设计注射点', '注入ポイントを設計'),
        ls('PDRN 성분 미세 주입', 'Micro-injection of PDRN', '微量注射PDRN成分', 'PDRN成分をマイクロ注入'),
        ls('부위별 균등 분포', 'Even distribution across treatment areas', '各部位均匀分布', '部位ごとに均等に分布'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', '鎮静ケアと保湿でフィニッシュ'),
      ],
      precautions: [
        ls('주사 자국·붉음증은 1~3일 내 자연 소실', 'Injection marks and redness disappear naturally within 1–3 days', '注射痕迹和红肿在1~3天内自然消退', '注射跡・赤みは1〜3日以内に自然消失します'),
        ls('시술 후 1주일 사우나·음주 자제', 'Avoid sauna and alcohol for 1 week', '施术后1周内避免桑拿和饮酒', '施術後1週間はサウナ・飲酒を避けてください'),
        ls('당일 세안은 저자극 제품으로 부드럽게', 'Cleanse gently with a mild product on treatment day', '施术当日用低刺激产品温和洗脸', '施術当日は低刺激製品でやさしく洗顔してください'),
        ls('혈액응고 이상·자가면역 질환 시 사전 고지', 'Inform staff in advance of blood clotting disorders or autoimmune conditions', '有血液凝固异常或自身免疫疾病时须提前告知', '血液凝固異常・自己免疫疾患がある場合は事前申告が必要です'),
      ],
      faq: [
        faqItem(
          '리쥬란과 어떻게 다른가요?', 'How is it different from Rejuran?',
          '与丽珠兰有什么区别？', 'リジュランとどう違いますか？',
          '리쥬란은 PN(폴리뉴클레오티드) 성분이고 리투오는 PDRN(폴리데옥시리보뉴클레오티드) 성분입니다. 둘 다 DNA 유래 성분으로 피부 재생을 유도하지만 분자량과 제형이 다릅니다.',
          'Rejuran contains PN (polynucleotide) while Retuo contains PDRN (polydeoxyribonucleotide). Both are DNA-derived ingredients that stimulate skin regeneration, but they differ in molecular weight and formulation.',
          '丽珠兰是PN（多聚核苷酸）成分，而利图奥是PDRN（多聚脱氧核糖核苷酸）成分。两者都是DNA衍生成分，诱导皮肤再生，但分子量和制剂不同。',
          'リジュランはPN（ポリヌクレオチド）成分で、リトゥオはPDRN（ポリデオキシリボヌクレオチド）成分です。どちらもDNA由来成分で肌の再生を誘導しますが、分子量と製剤が異なります。',
        ),
        faqItem(
          '몇 회 받는 것이 좋나요?', 'How many sessions are recommended?',
          '建议做几次？', '何回受けるのが良いですか？',
          '2~4주 간격으로 3~5회 집중 관리 후 유지 관리를 권장합니다.',
          '3–5 sessions spaced 2–4 weeks apart for intensive care, followed by maintenance sessions.',
          '建议每2~4周进行一次，共3~5次集中管理后进行维护管理。',
          '2〜4週間ごとに3〜5回の集中ケアの後、メンテナンスをお勧めします。',
        ),
        faqItem(
          '시술 후 다운타임이 있나요?', 'Is there any downtime?',
          '施术后有恢复期吗？', '施術後にダウンタイムはありますか？',
          '주사 자국이 당일 생길 수 있으나 1~3일 내 자연 소실됩니다. 일상생활에 지장 없이 바로 복귀 가능합니다.',
          'Injection marks may appear on the day but disappear naturally within 1–3 days. You can return to daily activities immediately.',
          '当天可能出现注射痕迹，但会在1~3天内自然消退。可立即恢复日常生活。',
          '当日に注射跡が生じることがありますが、1〜3日以内に自然消失します。日常生活にすぐ復帰できます。',
        ),
      ],
    },
  },
];

// ──────────────────────────────────────────────
// 실행
// ──────────────────────────────────────────────

async function run() {
  console.log(`데이터셋: ${process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'}`);
  console.log(`총 ${treatments.length}개 시술 패치 시작...\n`);

  const results = { success: [], failed: [] };

  for (const t of treatments) {
    try {
      await client.patch(t.id).set(t.data).commit();
      console.log(`[OK] ${t.id}`);
      results.success.push(t.id);
    } catch (err) {
      console.error(`[FAIL] ${t.id}: ${err.message}`);
      results.failed.push({ id: t.id, error: err.message });
    }
  }

  console.log('\n──────────────────────────────');
  console.log(`성공: ${results.success.length}개`);
  console.log(`실패: ${results.failed.length}개`);
  if (results.failed.length > 0) {
    console.log('실패 목록:');
    results.failed.forEach((f) => console.log(`  - ${f.id}: ${f.error}`));
  }
}

run().catch((err) => {
  console.error('스크립트 오류:', err);
  process.exit(1);
});
