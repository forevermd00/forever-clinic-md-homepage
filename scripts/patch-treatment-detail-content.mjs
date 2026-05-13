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
  return `dpc-${++keyCounter}`;
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
// 11개 시술 데이터 정의
// ──────────────────────────────────────────────

const treatments = [
  // 1. 울쎄라피 프라임
  {
    id: 'treatment-ulthera',
    data: {
      description: lt(
        '초음파 에너지로 피부 가장 깊은 근막층(SMAS)까지 직접 도달하는 프리미엄 리프팅입니다. 절개도, 주사도 없이 피부 속 깊은 층부터 탄력을 끌어올립니다. DeepSEE™ 실시간 초음파 영상으로 내 피부 구조를 직접 눈으로 확인하며 시술하기 때문에 개개인의 피부에 맞는 정밀한 에너지 전달이 가능합니다.',
        'A premium lifting treatment that delivers ultrasound energy directly to the deepest fascial layer (SMAS). No incisions, no injections—just deep lifting from within. With DeepSEE™ real-time imaging, energy is precisely delivered to each individual\'s unique skin structure.',
        '超声波能量直达皮肤最深筋膜层（SMAS）的高端提拉治疗。无需切开、无需注射，从皮肤深层唤醒弹力。DeepSEE™实时超声影像可直接观察皮肤结构，实现针对每个人肤质的精准能量传导。',
        '超音波エネルギーが皮膚の最深部にある筋膜層（SMAS）まで直接届くプレミアムリフティングです。切開も注射も不要で、皮膚の深層からハリを引き上げます。DeepSEE™リアルタイム超音波映像で皮膚構造を確認しながら施術するため、お一人おひとりの肌に合わせた精密なエネルギー照射が可能です。',
      ),
      features: [
        ls('처진 볼살·이중턱·턱선 윤곽 개선', 'Improved sagging cheeks, double chin, and jawline', '改善面颊松弛、双下巴及下颌轮廓', 'たるんだ頬・二重あご・フェイスラインの改善'),
        ls('콜라겐·엘라스틴 재생으로 탄력 회복', 'Collagen and elastin regeneration for restored firmness', '促进胶原蛋白与弹性蛋白再生，恢复皮肤弹力', 'コラーゲン・エラスチンの再生によるハリの回復'),
        ls('팔자주름·눈가 처짐 완화', 'Reduced nasolabial folds and under-eye sagging', '改善法令纹及眼周松弛', '法令線・目元のたるみの緩和'),
      ],
      recommendedFor: [
        ls('얼굴 윤곽이 흐릿해지고 처짐이 느껴질 때', 'When facial contours look blurred or skin feels sagging', '感觉面部轮廓模糊、皮肤下垂时', '顔のラインがぼやけ、たるみを感じるとき'),
        ls('이중턱이 생기고 턱선이 무너질 때', 'When a double chin appears and jawline definition is lost', '出现双下巴、下颌线条不清晰时', '二重あごが気になり、フェイスラインが崩れてきたとき'),
        ls('팔자주름·눈가 처짐이 깊어질 때', 'When nasolabial folds deepen or eye area droops', '法令纹加深或眼周松弛时', '法令線が深くなったり、目元のたるみが気になるとき'),
        ls('수술 없이 확실한 리프팅 효과를 원할 때', 'When you want a definitive lifting effect without surgery', '不想手术但希望获得明显提拉效果时', '手術なしで確かなリフティング効果を求めるとき'),
        ls('1년에 한 번 프리미엄으로 관리하고 싶을 때', 'When you want once-a-year premium skin management', '每年一次进行高端肌肤护理时', '年に一度プレミアムなケアをしたいとき'),
      ],
      procedure: [
        ls('세안 및 메이크업 제거', 'Cleansing and makeup removal', '洁面及卸妆', '洗顔・メイク除去'),
        ls('마취 크림 도포 30~40분', 'Anesthetic cream applied for 30–40 minutes', '涂抹麻醉霜30～40分钟', '麻酔クリーム塗布30〜40分'),
        ls('DeepSEE™ 초음파 영상으로 피부층 실시간 확인', 'Real-time skin layer imaging with DeepSEE™ ultrasound', '通过DeepSEE™超声影像实时确认皮肤层次', 'DeepSEE™超音波映像で皮膚層をリアルタイム確認'),
        ls('부위별 맞춤 에너지 설계 및 조사', 'Customized energy delivery by treatment zone', '按部位定制能量方案并进行照射', '部位ごとにカスタマイズしたエネルギーを照射'),
        ls('진정 케어 및 보습 마무리', 'Soothing care and moisturizing finish', '镇静护理及保湿收尾', 'クールダウンケアと保湿仕上げ'),
      ],
      precautions: [
        ls('시술 후 1주일 사우나·찜질방·음주·격렬한 운동 자제', 'Avoid sauna, jjimjilbang, alcohol, and strenuous exercise for 1 week', '术后1周内避免桑拿、汗蒸房、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を控えてください'),
        ls('시술 직후 홍반·부종·따끔함 발생 가능, 수 시간 내 완화', 'Redness, swelling, or tingling may occur immediately after, resolving within a few hours', '术后可能出现红斑、肿胀及刺痛感，数小时内可自行缓解', '施術直後に赤み・むくみ・ヒリヒリ感が出る場合がありますが、数時間以内に落ち着きます'),
        ls('광대 등 뼈 돌출 부위는 에너지 조절 사전 상담 필요', 'Consult in advance for energy adjustment near bony prominences such as cheekbones', '颧骨等骨骼突出部位需提前咨询能量调整事宜', '頬骨などの骨が突出している部位は事前にエネルギー調整の相談が必要です'),
        ls('임플란트 보유 시 반드시 사전 고지', 'Inform staff in advance if you have dental implants', '如有植入物，请务必提前告知', 'インプラントがある場合は必ず事前にお伝えください'),
      ],
      faq: [
        faqItem(
          '효과는 언제부터 느껴지나요?', 'When will I start seeing results?',
          '效果什么时候开始显现？', '効果はいつから実感できますか？',
          '시술 후 1~3개월에 걸쳐 점진적으로 나타나며, 최대 효과는 3~6개월 시점에 확인할 수 있습니다.',
          'Results develop gradually over 1–3 months after treatment, with peak results visible around 3–6 months.',
          '效果会在术后1～3个月内逐渐显现，最佳效果可在3～6个月时确认。',
          '施術後1〜3ヶ月かけて徐々に現れ、最大の効果は3〜6ヶ月頃に実感できます。',
        ),
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '시술 직후 홍반·부종이 발생할 수 있으나 수 시간 내 완화됩니다. 별도의 회복 기간 없이 일상생활이 가능합니다.',
          'Redness and swelling may occur immediately after but resolve within a few hours. You can resume daily activities right away.',
          '术后可能出现红斑和肿胀，但数小时内会缓解。无需特别恢复期，可正常进行日常活动。',
          '施術直後に赤みやむくみが出る場合がありますが、数時間以内に落ち着きます。特別な回復期間なく日常生活が送れます。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often should I get this treatment?',
          '需要多久做一次？', 'どのくらいの頻度で受ければよいですか？',
          '보통 6개월~1년 간격으로 받는 것을 권장합니다. 개인 피부 상태에 따라 달라질 수 있으니 상담을 통해 결정하시길 권장합니다.',
          'Generally recommended every 6 months to 1 year. Frequency may vary based on individual skin condition.',
          '通常建议每6个月至1年进行一次。因个人肤质而异，建议通过咨询来决定。',
          '通常6ヶ月〜1年の間隔での施術をお勧めします。個人の肌状態によって異なりますので、カウンセリングでご相談ください。',
        ),
        faqItem(
          '마취는 어떻게 하나요?', 'How is anesthesia administered?',
          '如何进行麻醉？', '麻酔はどのように行いますか？',
          '마취 크림을 30~40분 도포 후 진행합니다. 통증이 걱정되시는 경우 수면마취 선택도 가능합니다.',
          'Anesthetic cream is applied for 30–40 minutes before treatment. IV sedation is also available for those concerned about pain.',
          '涂抹麻醉霜30～40分钟后进行施术。如担心疼痛，也可选择静脉镇静麻醉。',
          '麻酔クリームを30〜40分塗布してから施術を行います。痛みが心配な方は静脈麻酔のご利用も可能です。',
        ),
        faqItem(
          '임플란트가 있어도 받을 수 있나요?', 'Can I receive this treatment if I have implants?',
          '有植入物也可以做吗？', 'インプラントがあっても受けられますか？',
          '임플란트나 금속 삽입물을 보유하고 있다면 반드시 사전에 고지해 주세요. 상담을 통해 시술 가능 여부를 확인할 수 있습니다.',
          'Please inform staff in advance if you have implants or metal inserts. Eligibility will be confirmed during consultation.',
          '如有植入物或金属填充物，请务必提前告知。可通过咨询确认是否适合施术。',
          'インプラントや金属挿入物をお持ちの方は必ず事前にお知らせください。カウンセリングで施術可否を確認できます。',
        ),
      ],
    },
  },

  // 2. 써마지 FLX
  {
    id: 'treatment-thermage',
    data: {
      description: lt(
        '4세대 RF(고주파) 에너지를 진피층 깊숙이 전달하여 콜라겐 재생을 유도하는 비수술 리프팅입니다. AccuREP™ 기술이 매 순간 내 피부 상태를 읽어 에너지를 자동으로 조절하며, 진동과 쿨링 시스템으로 통증 부담을 크게 낮췄습니다.',
        'A non-surgical lifting treatment that delivers 4th-generation RF energy deep into the dermis to stimulate collagen regeneration. AccuREP™ technology reads your skin\'s condition in real time and auto-adjusts energy output, while vibration and cooling systems significantly reduce discomfort.',
        '将第四代RF（射频）能量深入传导至真皮层，促进胶原蛋白再生的非手术提拉治疗。AccuREP™技术实时感知皮肤状态自动调节能量，配合振动和冷却系统大幅减轻不适感。',
        '真皮層の深部まで第4世代RF（高周波）エネルギーを届け、コラーゲン再生を促す非手術リフティングです。AccuREP™技術がリアルタイムで肌状態を読み取りエネルギーを自動調整し、振動・クーリングシステムで不快感を大幅に軽減します。',
      ),
      features: [
        ls('진피층 콜라겐 재생으로 피부 탄력 개선', 'Improved skin elasticity through dermal collagen regeneration', '促进真皮层胶原蛋白再生，改善皮肤弹力', '真皮層のコラーゲン再生による肌のハリ改善'),
        ls('피부 처짐·주름 완화 및 윤곽 리프팅', 'Reduced sagging, wrinkles, and improved facial contour', '改善皮肤松弛、皱纹及面部轮廓提升', '肌のたるみ・シワの緩和とフェイスラインのリフトアップ'),
        ls('눈가·입가·목 주름 개선', 'Improved wrinkles around eyes, mouth, and neck', '改善眼周、嘴角及颈部皱纹', '目元・口元・首のシワ改善'),
      ],
      recommendedFor: [
        ls('피부 전체적으로 탄력이 떨어진 느낌이 들 때', 'When overall skin elasticity feels reduced', '整体肤质感觉弹力下降时', '全体的に肌のハリが低下していると感じるとき'),
        ls('잔주름이 늘어나고 피부가 푸석할 때', 'When fine lines increase and skin looks dull', '细纹增多、皮肤暗沉粗糙时', '小じわが増え、肌がくすんでいるとき'),
        ls('눈가·입가·목 주름이 신경 쓰일 때', 'When wrinkles around the eyes, mouth, or neck become noticeable', '眼周、嘴角或颈部皱纹明显时', '目元・口元・首のシワが気になるとき'),
        ls('통증이 걱정되어 리프팅을 망설였을 때', 'When you\'ve hesitated about lifting due to concerns about pain', '因担心疼痛而对提拉治疗犹豫不决时', '痛みが心配でリフティングをためらっていたとき'),
      ],
      procedure: [
        ls('세안·클렌징 후 시술 부위 확인', 'Cleansing and treatment area assessment', '洁面后确认施术部位', '洗顔・クレンジング後に施術部位を確認'),
        ls('마취 크림 도포 약 30~40분', 'Anesthetic cream applied for approximately 30–40 minutes', '涂抹麻醉霜约30～40分钟', '麻酔クリームを約30〜40分塗布'),
        ls('4.0 토탈팁 정품 개봉 확인 후 AccuREP™ 자동 튜닝', 'Verification of authentic 4.0 Total Tip opening, then AccuREP™ auto-tuning', '当场开封确认4.0正品Total Tip后进行AccuREP™自动调节', '正規品4.0トータルチップの開封確認後、AccuREP™自動チューニング'),
        ls('부위별 RF 에너지 조사 (진동·쿨링 병행)', 'RF energy application by zone (with simultaneous vibration and cooling)', '按部位照射RF能量（同步振动与冷却）', '部位ごとにRFエネルギーを照射（振動・クーリング同時実施）'),
        ls('진정 케어·보습·자외선 차단 마무리', 'Soothing, moisturizing, and SPF finish', '镇静护理、保湿及防晒收尾', 'クールダウンケア・保湿・紫外線ケアで仕上げ'),
      ],
      precautions: [
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week after treatment', '术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を控えてください'),
        ls('시술 직후 수포 발생 시 즉시 내원', 'Visit immediately if blisters develop after treatment', '术后如出现水疱，请立即就诊', '施術直後に水疱が生じた場合はすぐにご来院ください'),
        ls('정품팁 사용 여부를 반드시 직접 확인하세요', 'Always verify that an authentic tip is used before treatment', '请务必亲自确认是否使用正品tip', '正規品チップの使用を必ずご自身で確認してください'),
      ],
      faq: [
        faqItem(
          '정품팁 사용은 어떻게 확인하나요?', 'How can I verify an authentic tip is used?',
          '如何确认使用的是正品tip？', '正規品チップの使用はどう確認できますか？',
          '1회용 4.0 토탈팁을 환자 앞에서 직접 개봉하여 진행합니다. 시술 전 직접 확인하실 수 있습니다.',
          'The single-use 4.0 Total Tip is opened in front of the patient. You can verify this before treatment begins.',
          '一次性4.0 Total Tip会在患者面前当场开封。您可在施术前亲自确认。',
          '使い捨て4.0トータルチップを患者様の前で開封して使用します。施術前にご自身で確認いただけます。',
        ),
        faqItem(
          '효과는 언제부터 나타나나요?', 'When do results appear?',
          '效果什么时候开始显现？', '効果はいつから現れますか？',
          '시술 후 1~2개월부터 나타나기 시작하며, 약 6개월 시점에 최대 효과를 확인할 수 있습니다.',
          'Results begin appearing 1–2 months after treatment, with peak effects visible around the 6-month mark.',
          '效果从术后1～2个月开始显现，约6个月时可确认最佳效果。',
          '施術後1〜2ヶ月から効果が現れ始め、約6ヶ月時点で最大の効果を実感できます。',
        ),
        faqItem(
          '통증이 많이 있나요?', 'Is it painful?',
          '疼痛感强吗？', '痛みは強いですか？',
          'AccuREP™ 기술로 피부 상태에 맞게 에너지가 자동 조절되며, 전방향 진동 기능과 쿨링 시스템으로 통증 부담을 크게 낮췄습니다. 통증에 민감하신 경우 수면마취 선택도 가능합니다.',
          'AccuREP™ auto-adjusts energy to your skin, and built-in vibration and cooling significantly reduce discomfort. IV sedation is available for those sensitive to pain.',
          'AccuREP™技术根据皮肤状态自动调节能量，配合全方向振动功能和冷却系统大幅降低不适感。如对疼痛敏感，也可选择静脉镇静麻醉。',
          'AccuREP™が肌状態に合わせて自動でエネルギーを調整し、全方向振動機能とクーリングシステムで不快感を大幅に軽減します。痛みに敏感な方は静脈麻酔のご利用も可能です。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often is treatment recommended?',
          '需要多久做一次？', 'どのくらいの頻度で受けるべきですか？',
          '보통 6개월~1년 간격으로 받는 것을 권장합니다.',
          'Generally recommended every 6 months to 1 year.',
          '通常建议每6个月至1年进行一次。',
          '通常6ヶ月〜1年の間隔での施術をお勧めします。',
        ),
        faqItem(
          '눈가에도 시술이 가능한가요?', 'Can it be applied around the eyes?',
          '眼周也可以施术吗？', '目元にも施術できますか？',
          '네, 눈가 전용 아이팁을 사용하여 섬세한 시술이 가능합니다.',
          'Yes, a specialized Eye Tip is used for delicate treatment around the eye area.',
          '是的，可使用眼周专用Eye Tip进行精细施术。',
          'はい、目元専用のアイチップを使用して繊細な施術が可能です。',
        ),
      ],
    },
  },

  // 3. 온다리프팅
  {
    id: 'treatment-onda',
    data: {
      description: lt(
        '이탈리아 DEKA사의 특허 기술 Coolwaves™ 마이크로파 에너지가 지방세포와 진피층에 동시에 작용합니다. 지방세포 감소와 피부 탄력 개선을 하나의 시술로 해결하며, 표피를 차갑게 식히는 쿨링 시스템 덕분에 마취 없이도 편안하게 받을 수 있습니다.',
        "DEKA's patented Coolwaves™ microwave energy acts simultaneously on fat cells and the dermal layer. Fat cell reduction and skin elasticity improvement are addressed in one session, and the Coolwaves™ cooling system keeps the epidermis cool so you can receive it comfortably without anesthesia.",
        '意大利DEKA公司专利技术Coolwaves™微波能量同时作用于脂肪细胞和真皮层。一次施术即可解决脂肪减少和皮肤弹力改善，表皮冷却系统让您无需麻醉也能舒适完成治疗。',
        'イタリアDEKA社の特許技術Coolwaves™マイクロ波エネルギーが脂肪細胞と真皮層に同時に作用します。脂肪細胞の減少と肌のハリ改善を一度の施術で実現し、表皮を冷却するクーリングシステムのおかげで麻酔なしでも快適に受けられます。',
      ),
      features: [
        ls('이중턱·볼살 감소로 얼굴 라인 정리', 'Reduced double chin and cheek fat for a refined facial line', '减少双下巴和面颊脂肪，塑造清晰面部线条', '二重あご・頬肉を減らしてすっきりとしたフェイスラインを実現'),
        ls('진피층 콜라겐 재생으로 탄력 개선', 'Improved skin elasticity through dermal collagen regeneration', '促进真皮层胶原蛋白再生，改善皮肤弹力', '真皮層のコラーゲン再生によるハリ改善'),
        ls('얼굴·바디 라인 동시 개선 가능', 'Simultaneous improvement of facial and body contours', '可同时改善面部及身体轮廓', '顔・ボディラインの同時改善が可能'),
      ],
      recommendedFor: [
        ls('이중턱·볼살이 고민일 때', 'When troubled by a double chin or chubby cheeks', '为双下巴和面颊脂肪烦恼时', '二重あごや頬の脂肪が気になるとき'),
        ls('마취 없이 편안하게 시술받고 싶을 때', 'When you want a comfortable treatment without anesthesia', '希望无需麻醉舒适接受施术时', '麻酔なしで快適に施術を受けたいとき'),
        ls('지방 감소와 탄력 개선을 동시에 원할 때', 'When you want fat reduction and skin tightening at the same time', '希望同时实现脂肪减少和弹力改善时', '脂肪減少と弾力改善を同時に望むとき'),
        ls('시술 당일 바로 일상생활이 필요할 때', 'When you need to resume daily activities immediately after treatment', '施术当天需要立即恢复日常活动时', '施術当日すぐに日常生活に戻る必要があるとき'),
      ],
      procedure: [
        ls('세안 후 젤 도포', 'Cleanse skin and apply gel', '洁面后涂抹凝胶', '洗顔後にジェルを塗布'),
        ls('부위별 핸드피스 선택 (3mm·7mm)', 'Select handpiece by zone (3mm or 7mm)', '按部位选择手具（3mm·7mm）', '部位に応じてハンドピースを選択（3mm・7mm）'),
        ls('Coolwaves™ 마이크로파 에너지 조사', 'Apply Coolwaves™ microwave energy', '照射Coolwaves™微波能量', 'Coolwaves™マイクロ波エネルギーを照射'),
        ls('전체 부위 균등 조사', 'Uniform application across treatment area', '对全部施术部位均匀照射', '全施術部位に均一に照射'),
        ls('잔여 젤 제거 및 보습 마무리', 'Remove residual gel and apply moisturizer', '去除残余凝胶并以保湿收尾', '残留ジェルを除去し保湿で仕上げ'),
      ],
      precautions: [
        ls('시술 후 2~3일 과도한 열 자극(찜질방·뜨거운 샤워) 자제', 'Avoid excessive heat (sauna, hot showers) for 2–3 days after treatment', '术后2～3天内避免过度热刺激（汗蒸房·热水浴）', '施術後2〜3日は過度な熱刺激（サウナ・熱いシャワー）を控えてください'),
        ls('시술 후 1주일 음주·사우나 자제', 'Avoid alcohol and sauna for 1 week after treatment', '术后1周内避免饮酒和桑拿', '施術後1週間は飲酒・サウナを控えてください'),
        ls('시술 직후 홍반·따끔함은 수 시간 내 자연스럽게 가라앉습니다', 'Redness and tingling immediately after treatment will subside naturally within a few hours', '施术后立即出现的红斑和刺痛感会在数小时内自然消退', '施術直後の赤みやヒリヒリ感は数時間以内に自然に治まります'),
      ],
      faq: [
        faqItem(
          '지방 흡입처럼 즉각적인 효과가 나타나나요?', 'Will results appear immediately like liposuction?',
          '会像吸脂一样立即见效吗？', '脂肪吸引のように即座に効果が出ますか？',
          '시술 후 1~2개월에 걸쳐 점진적으로 나타납니다. 횟수를 거듭할수록 효과가 누적됩니다.',
          'Results appear gradually over 1–2 months and accumulate with repeated sessions.',
          '效果会在术后1～2个月内逐渐显现，随着施术次数增加效果不断累积。',
          '施術後1〜2ヶ月かけて徐々に効果が現れます。回数を重ねるごとに効果が蓄積されます。',
        ),
        faqItem(
          '얼굴과 바디 모두 가능한가요?', 'Can it be done on both the face and body?',
          '面部和身体都可以施术吗？', '顔とボディどちらも施術できますか？',
          '네, 얼굴(턱선·볼·이중턱)은 물론 복부·허벅지·팔뚝 등 바디 부위에도 적용 가능합니다.',
          'Yes, it can be applied to the face (jawline, cheeks, double chin) as well as the body (abdomen, thighs, arms).',
          '是的，不仅可以用于面部（下颌线、面颊、双下巴），还可以用于腹部、大腿、手臂等身体部位。',
          'はい、顔（フェイスライン・頬・二重あご）はもちろん、腹部・太もも・二の腕などのボディにも対応しています。',
        ),
        faqItem(
          '마취가 필요한가요?', 'Is anesthesia needed?',
          '需要麻醉吗？', '麻酔は必要ですか？',
          'Coolwaves™ 쿨링 시스템으로 통증이 매우 낮아 별도 마취 없이 편안하게 받을 수 있습니다.',
          'The Coolwaves™ cooling system minimizes discomfort, making anesthesia unnecessary for most patients.',
          'Coolwaves™冷却系统使疼痛感极低，无需额外麻醉即可舒适接受施术。',
          'Coolwaves™クーリングシステムにより不快感が非常に少なく、麻酔なしで快適に受けられます。',
        ),
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '거의 없습니다. 시술 직후 홍반·따끔함이 발생할 수 있으나 수 시간 내 소실됩니다.',
          'Minimal downtime. Redness and tingling may occur right after but disappear within a few hours.',
          '几乎没有。施术后可能出现红斑和刺痛感，但会在数小时内消退。',
          'ほとんどありません。施術直後に赤みやヒリヒリ感が出る場合がありますが、数時間以内に消えます。',
        ),
      ],
    },
  },

  // 4. 티타늄 리프팅
  {
    id: 'treatment-titan',
    data: {
      description: lt(
        '세계 최초로 특허받은 3가지 레이저 파장(755nm·810nm·1064nm)이 동시에 조사되어 피부 얕은 층부터 깊은 층까지 골고루 에너지가 전달됩니다. 울쎄라(HIFU)·써마지(RF)와 에너지원 자체가 다른 다이오드 레이저 방식으로, 리프팅·탄력·피부톤 개선을 하나의 시술로 동시에 기대할 수 있습니다.',
        'The world\'s first patented triple-wavelength laser (755nm·810nm·1064nm) delivers energy uniformly from the superficial to deep skin layers. As a diode laser—fundamentally different from HIFU or RF—it simultaneously addresses lifting, firmness, and skin tone improvement in a single session.',
        '世界首个专利三波长激光（755nm·810nm·1064nm）同时照射，从皮肤浅层到深层均匀传导能量。作为与HIFU·RF完全不同能量源的二极管激光，一次施术即可同时实现提拉、弹力及肤色改善。',
        '世界初の特許取得済み3波長レーザー（755nm・810nm・1064nm）が同時照射され、皮膚の浅層から深層まで均一にエネルギーを届けます。HIFU・RFとは根本的に異なるダイオードレーザー方式で、リフティング・弾力・肌トーン改善を一度の施術で同時に期待できます。',
      ),
      features: [
        ls('처진 볼살·이중턱·턱선 윤곽 개선', 'Improved sagging cheeks, double chin, and jawline contour', '改善面颊松弛、双下巴及下颌轮廓', 'たるんだ頬・二重あご・フェイスラインの改善'),
        ls('콜라겐 재생으로 피부 탄력 회복', 'Restored skin elasticity through collagen regeneration', '促进胶原蛋白再生，恢复皮肤弹力', 'コラーゲン再生による肌のハリ回復'),
        ls('피부톤 밝아짐·모공 축소', 'Brighter skin tone and reduced pore size', '肤色提亮·毛孔收缩', '肌トーンのアップ・毛穴の縮小'),
      ],
      recommendedFor: [
        ls('리프팅과 함께 피부톤도 밝아지길 원할 때', 'When you want both lifting and a brighter skin tone', '希望在提拉的同时改善肤色时', 'リフティングと同時に肌トーンも明るくしたいとき'),
        ls('볼 꺼짐이 걱정돼 HIFU 리프팅을 망설였을 때', "When you've hesitated about HIFU due to concerns about cheek hollowing", '因担心HIFU导致面颊凹陷而犹豫时', 'HIFUによる頬のくぼみが心配でリフティングをためらっていたとき'),
        ls('얼굴이 얇거나 지방이 적어 리프팅이 부담스러웠을 때', 'When lifting treatments felt risky due to a thin face or low facial fat', '因面部较薄或脂肪较少而对提拉治疗感到顾虑时', '顔が薄めで脂肪が少なくリフティングに不安があったとき'),
        ls('마취 없이 바로 일상 복귀가 필요할 때', 'When you need to return to daily activities immediately without anesthesia', '需要无需麻醉立即恢复日常生活时', '麻酔なしですぐに日常に戻る必要があるとき'),
      ],
      procedure: [
        ls('세안 후 시술 부위 확인', 'Cleanse and assess treatment areas', '洁面后确认施术部位', '洗顔後に施術部位を確認'),
        ls('피부 상태·목적에 따라 SHR·STACK 모드 선택', 'Select SHR or STACK mode based on skin condition and goals', '根据皮肤状态和目标选择SHR·STACK模式', '肌状態・目的に応じてSHR・STACKモードを選択'),
        ls('3파장 레이저 에너지 전체 조사 (아이스컨텍 쿨링 병행)', 'Full-area triple-wavelength laser application (with IceContact cooling)', '三波长激光能量全区域照射（同步IceContact冷却）', '3波長レーザーエネルギーを全体照射（IceContactクーリング同時実施）'),
        ls('리프팅·윤곽 집중 부위 추가 조사', 'Focused additional treatment on lifting and contouring zones', '对提拉·轮廓重点部位追加照射', 'リフティング・輪郭集中部位に追加照射'),
        ls('보습 및 자외선 차단 마무리', 'Moisturizing and SPF application to finish', '保湿及防晒收尾', '保湿と紫外線ケアで仕上げ'),
      ],
      precautions: [
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を控えてください'),
        ls('시술 직후 홍반·열감·가벼운 붓기 발생 가능, 2~3일 내 자연 완화', 'Redness, warmth, and mild swelling may occur, resolving naturally within 2–3 days', '施术后可能出现红斑、热感及轻微肿胀，2～3天内自然消退', '施術直後に赤み・熱感・軽いむくみが出る場合がありますが、2〜3日以内に自然に落ち着きます'),
        ls('외출 시 자외선 차단제 꼼꼼히 발라주세요', 'Apply sunscreen thoroughly before going outdoors', '外出时请认真涂抹防晒霜', '外出時は日焼け止めをしっかり塗ってください'),
        ls('자외선 관리 소홀 시 색소 변화 가능성 있으므로 주의', 'Neglecting sun protection may increase the risk of pigmentation changes', '若忽视防晒，可能出现色素变化，请注意', '紫外線ケアを怠ると色素変化が生じる可能性があるのでご注意ください'),
      ],
      faq: [
        faqItem(
          '볼 꺼짐 부작용이 걱정돼요', "I'm worried about cheek hollowing",
          '我担心面颊凹陷的副作用', '頬のくぼみの副作用が心配です',
          '티타늄은 다이오드 레이저 방식으로 HIFU에서 드물게 나타나는 볼 패임 없이 리프팅 효과를 기대할 수 있습니다. 지방이 적은 분께도 적합합니다.',
          'Titanium uses a diode laser method, so the rare cheek hollowing seen with HIFU is not a concern. It\'s suitable even for those with low facial fat.',
          '钛激光采用二极管激光方式，无需担心HIFU偶尔出现的面颊凹陷问题，同样适合面部脂肪较少的人群。',
          'チタニウムはダイオードレーザー方式のため、HIFUでまれに見られる頬のくぼみの心配がなくリフティング効果が期待できます。脂肪が少ない方にも適しています。',
        ),
        faqItem(
          '효과가 언제 나타나나요?', 'When do results appear?',
          '效果什么时候出现？', '効果はいつ現れますか？',
          '시술 직후 즉각적인 타이트닝 효과를 느끼실 수 있으며, 이후 2주~3개월에 걸쳐 점진적으로 개선됩니다.',
          'An immediate tightening effect is felt right after treatment, with gradual improvements over 2 weeks to 3 months.',
          '施术后即刻可感受到紧致效果，此后2周～3个月内逐渐改善。',
          '施術直後に即時の引き締め効果を感じることができ、その後2週間〜3ヶ月かけて徐々に改善されます。',
        ),
        faqItem(
          '몇 회 받아야 효과적인가요?', 'How many sessions are recommended?',
          '需要做几次才有效？', '何回受けると効果的ですか？',
          '3~4주 간격으로 3회를 권장합니다.',
          '3 sessions spaced 3–4 weeks apart are recommended.',
          '建议每3～4周进行一次，共3次。',
          '3〜4週間隔で3回の施術をお勧めします。',
        ),
        faqItem(
          '마취가 필요한가요?', 'Is anesthesia needed?',
          '需要麻醉吗？', '麻酔は必要ですか？',
          '아이스컨텍 쿨링 시스템으로 통증이 매우 낮아 별도 마취 없이 진행 가능합니다.',
          'The IceContact cooling system minimizes discomfort, making anesthesia unnecessary.',
          'IceContact冷却系统使疼痛感极低，无需额外麻醉即可进行施术。',
          'IceContactクーリングシステムにより不快感が非常に少なく、麻酔なしで施術が可能です。',
        ),
      ],
    },
  },

  // 5. 고우리
  {
    id: 'treatment-gouri',
    data: {
      description: lt(
        '세계 최초 액상형 PCL(폴리카프로락톤) 주사입니다. 기존 필러가 특정 부위에 볼륨을 채우는 방식이라면, 고우리는 액상 PCL이 얼굴 전체 진피층에 고르게 퍼지며 피부가 스스로 콜라겐을 만들도록 유도합니다. 외부에서 채워 넣는 것이 아니라 내 피부가 안쪽부터 회복되는 방식이라 \'맞은 티\' 없이 자연스러운 것이 특징입니다.',
        "The world's first liquid PCL (polycaprolactone) injection. Unlike conventional fillers that add volume to specific areas, GOURI's liquid PCL spreads evenly across the entire facial dermis, stimulating your skin to naturally produce collagen from within—giving results that look entirely your own.",
        '世界首款液态PCL（聚己内酯）注射剂。与传统填充剂局部注射不同，高乌莉液态PCL均匀扩散至整个面部真皮层，促进肌肤自主生成胶原蛋白，从内部焕活肌肤，效果自然无痕。',
        '世界初の液状PCL（ポリカプロラクトン）注射です。従来のフィラーが特定の部位にボリュームを補填するのに対し、GOURIの液状PCLは顔全体の真皮層に均一に広がり、肌が自らコラーゲンを生成するよう促します。内側から肌が回復する方式のため、施術した痕が出ず自然な仕上がりが特徴です。',
      ),
      features: [
        ls('얼굴 전체가 자연스럽게 차오르는 볼륨감·탄력감', 'Natural volume and firmness that fills the entire face evenly', '面部整体自然饱满的紧致感与弹力', '顔全体が自然にふっくらするボリューム感・ハリ感'),
        ls('피부 밀도와 탄탄함 개선', 'Improved skin density and firmness', '改善皮肤密度与紧致度', '肌の密度と弾力の改善'),
        ls('피부결이 고르고 매끄러워짐', 'Smoother, more even skin texture', '肤质均匀细腻', '肌のキメが整いなめらかに'),
      ],
      recommendedFor: [
        ls('얼굴이 꺼져 보이고 피곤해 보인다는 말을 들을 때', "When you're told you look tired or hollow-cheeked", '被说面部凹陷、看起来疲惫时', '顔がこけて疲れて見えると言われるとき'),
        ls('자연스러운 결과를 원하는데 필러는 부자연스러울 것 같을 때', 'When you want natural results but worry fillers look artificial', '想要自然效果但又担心填充剂不自然时', '自然な結果を求めているがフィラーは不自然に見えそうなとき'),
        ls('맞은 티 없이 은근하게 가꾸고 싶을 때', 'When you want subtle improvement without it being obvious', '希望低调自然地改善肌肤时', '施術した痕を出さずにさりげなくケアしたいとき'),
        ls('콜라겐 재생으로 장기적으로 피부를 개선하고 싶을 때', 'When you want long-term skin improvement through collagen regeneration', '希望通过胶原蛋白再生长期改善肌肤时', 'コラーゲン再生で長期的に肌を改善したいとき'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 (20~30분)', 'Cleanse and apply anesthetic cream (20–30 minutes)', '洁面后涂抹麻醉霜（20～30分钟）', '洗顔後に麻酔クリームを塗布（20〜30分）'),
        ls('주입 위치 설계', 'Map injection sites', '设计注射位置', '注入部位のデザイン'),
        ls('고우리 PCL 액상 주입', 'Inject liquid GOURI PCL', '注射高乌莉PCL液态制剂', 'GOURI PCL液状注入'),
        ls('마사지로 전체에 고르게 확산', 'Distribute evenly with massage', '通过按摩使其均匀扩散', 'マッサージで全体に均一に広げる'),
        ls('진정 케어 후 마무리', 'Soothing care and finish', '镇静护理后收尾', 'クールダウンケアで仕上げ'),
      ],
      precautions: [
        ls('시술 후 1주일은 사우나·음주·강한 필링·스크럽 제품 사용 자제', 'Avoid sauna, alcohol, strong peels, and exfoliants for 1 week', '术后1周内避免桑拿、饮酒、强效去角质及磨砂产品', '施術後1週間はサウナ・飲酒・強いピーリング・スクラブ製品を控えてください'),
        ls('시술 후 1주일은 격렬한 운동 자제', 'Avoid strenuous exercise for 1 week', '术后1周内避免剧烈运动', '施術後1週間は激しい運動を控えてください'),
        ls('시술 후 2~3일은 얼굴을 세게 마사지하거나 강하게 누르는 행위 자제', 'Avoid massaging or pressing the face firmly for 2–3 days', '术后2～3天内避免用力按摩或按压面部', '施術後2〜3日は顔を強くマッサージしたり押したりするのを控えてください'),
        ls('외출 시 자외선 차단제 꼭 발라주세요', 'Apply sunscreen when going outdoors', '外出时请务必涂抹防晒霜', '外出時は必ず日焼け止めを塗ってください'),
      ],
      faq: [
        faqItem(
          '일반 필러와 어떻게 다른가요?', 'How is it different from regular filler?',
          '与普通填充剂有什么区别？', '通常のフィラーとどう違いますか？',
          '일반 필러는 특정 부위에 볼륨을 채우는 방식이지만, 고우리는 액상 PCL이 얼굴 전체로 고르게 퍼져 내 피부가 스스로 콜라겐을 만들도록 유도합니다. 훨씬 자연스러운 결과를 기대할 수 있습니다.',
          "Regular fillers add volume to specific spots, while GOURI's liquid PCL spreads evenly across the face, stimulating your skin's natural collagen production. Results look far more natural.",
          '普通填充剂是针对特定部位注射填充，而高乌莉的液态PCL均匀扩散至整个面部，促进肌肤自主生成胶原蛋白，效果更加自然。',
          '通常のフィラーは特定の部位にボリュームを補填しますが、GOURIの液状PCLは顔全体に均一に広がり肌自身がコラーゲンを生成するよう促します。より自然な結果が期待できます。',
        ),
        faqItem(
          '효과가 얼마나 유지되나요?', 'How long do results last?',
          '效果能维持多久？', '効果はどのくらい持続しますか？',
          '시술 횟수 및 개인 피부 상태에 따라 다릅니다. 지속적인 콜라겐 생성으로 장기간 유지됩니다.',
          'Duration varies by number of sessions and individual skin condition. Ongoing collagen stimulation helps results last long-term.',
          '因施术次数和个人肤质而异，持续的胶原蛋白生成有助于长期维持效果。',
          '施術回数や個人の肌状態によって異なります。継続的なコラーゲン生成により長期間持続します。',
        ),
        faqItem(
          '붓기나 멍이 생기나요?', 'Will there be swelling or bruising?',
          '会出现浮肿或瘀青吗？', 'むくみや内出血は出ますか？',
          '1~3일 내 발생할 수 있습니다. 드물게 1~2주 후 일시적으로 나타날 수 있으나, 이는 콜라겐이 만들어지는 과정의 자연스러운 반응입니다.',
          'Mild swelling or bruising may appear within 1–3 days. Rarely, it may appear temporarily around 1–2 weeks later as part of the natural collagen-forming process.',
          '可能在1～3天内出现。偶尔在1～2周后短暂出现，这是胶原蛋白生成过程中的自然反应。',
          '1〜3日以内に現れることがあります。まれに1〜2週間後に一時的に現れることがありますが、これはコラーゲンが生成される過程での自然な反応です。',
        ),
        faqItem(
          '몇 회 시술하는 것이 좋나요?', 'How many sessions are recommended?',
          '建议做几次？', '何回受けるのがよいですか？',
          '1~3회 (4~8주 간격)를 권장하며, 개인 피부 상태에 따라 조절 가능합니다.',
          '1–3 sessions spaced 4–8 weeks apart are recommended, adjustable based on individual skin condition.',
          '建议进行1～3次（间隔4～8周），可根据个人肤质调整。',
          '1〜3回（4〜8週間隔）をお勧めします。個人の肌状態に応じて調整可能です。',
        ),
      ],
    },
  },

  // 6. 젠틀맥스프로플러스
  {
    id: 'treatment-gentlemax-pro-plus',
    data: {
      description: lt(
        '미국 캔델라(Candela)社의 755nm 알렉산드라이트와 1064nm Nd:YAG 두 가지 파장을 탑재한 듀얼 레이저 제모 장비입니다. 밝은 피부의 가는 털부터 어두운 피부의 굵은 털까지 모든 피부 타입에 맞춤 시술이 가능합니다. 특허받은 DCD™ 냉각 시스템으로 통증을 줄이고 피부 표면을 보호합니다.',
        'A dual-wavelength laser hair removal device by Candela (USA), featuring 755nm Alexandrite and 1064nm Nd:YAG. It accommodates all skin types, from fine hair on fair skin to coarse hair on darker skin. The patented DCD™ Dynamic Cooling Device reduces discomfort and protects the skin surface.',
        '美国科医人（Candela）公司搭载755nm翠绿宝石和1064nm Nd:YAG双波长的激光脱毛设备。从浅肤色细毛到深肤色粗毛，适合所有肤质。专利DCD™冷却系统减轻不适感，同时保护皮肤表面。',
        '米国キャンデラ（Candela）社の755nmアレキサンドライトと1064nm Nd:YAG、2つの波長を搭載したデュアルレーザー脱毛機器です。明るい肌の細い毛から暗い肌の太い毛まで、すべての肌タイプに対応可能です。特許取得済みのDCD™冷却システムで不快感を軽減し、肌表面を保護します。',
      ),
      features: [
        ls('반복 시술로 모발 밀도·굵기 지속 감소', 'Gradual reduction in hair density and thickness with repeated sessions', '多次施术持续减少毛发密度和粗细', '繰り返し施術で毛の密度・太さが継続的に減少'),
        ls('DCD™ 냉각 시스템으로 피부 자극 최소화', 'Minimized skin irritation with the DCD™ cooling system', 'DCD™冷却系统最大限度减少皮肤刺激', 'DCD™冷却システムで肌への刺激を最小化'),
        ls('가는 털·굵은 털 모든 타입 맞춤 대응', 'Customized treatment for all hair types, from fine to coarse', '细毛至粗毛所有类型均可定制施术', '細い毛から太い毛まであらゆるタイプに対応'),
      ],
      recommendedFor: [
        ls('제모 관리가 번거롭고 피부 자극이 걱정될 때', 'When regular hair removal is inconvenient and skin irritation is a concern', '除毛护理繁琐且担心皮肤刺激时', '脱毛ケアが面倒で肌への刺激が心配なとき'),
        ls('왁싱·제모크림 부작용 경험이 있을 때', "When you've experienced adverse reactions to waxing or depilatory creams", '曾经历过蜡脱或脱毛膏副作用时', 'ワックス・除毛クリームで副作用を経験したことがあるとき'),
        ls('전신 제모를 빠르고 효율적으로 받고 싶을 때', 'When you want full-body hair removal quickly and efficiently', '希望快速高效完成全身脱毛时', '全身脱毛を素早く効率よく行いたいとき'),
        ls('털 고민을 장기적으로 해결하고 싶을 때', 'When you want a long-term solution to unwanted hair', '希望长期解决多余毛发问题时', '毛の悩みを長期的に解決したいとき'),
      ],
      procedure: [
        ls('시술 부위 면도 및 클렌징', 'Shave and cleanse treatment area', '刮除施术部位毛发并清洁', '施術部位のシェービングとクレンジング'),
        ls('피부 타입·모발색 확인 후 파장 설정 (755nm / 1064nm)', 'Assess skin type and hair color, then set wavelength (755nm or 1064nm)', '确认肤质和毛发颜色后设置波长（755nm / 1064nm）', '肌タイプ・毛の色を確認後、波長を設定（755nm / 1064nm）'),
        ls('DCD™ 냉각 분사 + 레이저 동시 조사', 'Simultaneous DCD™ cooling spray and laser application', 'DCD™冷却喷射与激光同步照射', 'DCD™冷却スプレーとレーザーを同時照射'),
        ls('26mm 대구경 스팟으로 전체 균등 조사', 'Uniform treatment across the area using a 26mm large-spot tip', '使用26mm大口径光斑对全部区域均匀照射', '26mm大口径スポットで全体に均一照射'),
        ls('진정 젤·보습 도포 후 마무리', 'Apply soothing gel and moisturizer to finish', '涂抹镇静凝胶和保湿产品后收尾', 'クールダウンジェルと保湿剤を塗布して仕上げ'),
      ],
      precautions: [
        ls('시술 전 왁싱·제모크림 2~4주 금지 (면도만 가능)', 'No waxing or depilatory creams 2–4 weeks before treatment (shaving is fine)', '施术前2～4周禁止蜡脱和脱毛膏（剃刀除毛可以）', '施術前2〜4週間はワックス・除毛クリーム禁止（シェービングは可）'),
        ls('시술 후 1주일 자외선·사우나·열탕 자제', 'Avoid sun exposure, sauna, and hot baths for 1 week after treatment', '术后1周内避免紫外线照射、桑拿及热浴', '施術後1週間は紫外線・サウナ・熱いお風呂を控えてください'),
        ls('시술 부위 48시간 내 강한 자극 금지', 'No strong stimulation to the treated area for 48 hours', '施术部位48小时内禁止强烈刺激', '施術部位は48時間以内に強い刺激を与えないでください'),
        ls('임신 중 시술 불가', 'Treatment is not available during pregnancy', '妊娠期间不可施术', '妊娠中は施術できません'),
        ls('시술 전 태닝 시 부작용 위험 증가, 사전 상담 필수', 'Tanning before treatment increases risk of adverse reactions; consultation required', '施术前晒黑会增加副作用风险，须提前咨询', '施術前の日焼けは副作用リスクが高まるため、事前相談が必須です'),
      ],
      faq: [
        faqItem(
          '시술 전 제모를 해야 하나요?', 'Do I need to shave before treatment?',
          '施术前需要除毛吗？', '施術前に脱毛が必要ですか？',
          '시술 전 면도는 필요하지만 왁싱이나 제모크림은 2~4주 이전에 중단해야 합니다.',
          'Shaving before treatment is necessary, but waxing and depilatory creams must be stopped 2–4 weeks in advance.',
          '施术前需要剃毛，但蜡脱和脱毛膏须在2～4周前停止使用。',
          '施術前のシェービングは必要ですが、ワックスや除毛クリームは2〜4週間前から中止する必要があります。',
        ),
        faqItem(
          '총 몇 회 받아야 하나요?', 'How many total sessions are needed?',
          '总共需要做几次？', '合計何回受ければよいですか？',
          '모발 성장 주기에 따라 4~6주 간격 4~6회를 권장합니다.',
          '4–6 sessions spaced 4–6 weeks apart are recommended, based on the hair growth cycle.',
          '根据毛发生长周期，建议每4～6周进行一次，共4～6次。',
          '毛の成長サイクルに合わせて4〜6週間隔で4〜6回の施術をお勧めします。',
        ),
        faqItem(
          '통증이 심한가요?', 'Is it painful?',
          '疼痛感强吗？', '痛みは強いですか？',
          'DCD™ 냉각 시스템으로 통증이 크게 완화됩니다. 민감한 부위는 마취 크림 사용도 가능합니다.',
          'The DCD™ cooling system significantly reduces discomfort. Anesthetic cream is available for sensitive areas.',
          'DCD™冷却系统大幅减轻疼痛感。敏感部位可使用麻醉霜。',
          'DCD™冷却システムで不快感が大幅に軽減されます。敏感な部位には麻酔クリームのご利用も可能です。',
        ),
        faqItem(
          '피부색이 어두운 경우에도 가능한가요?', 'Can it be used on darker skin tones?',
          '皮肤颜色较深也可以做吗？', '肌の色が濃い場合でも可能ですか？',
          '1064nm Nd:YAG 파장으로 어두운 피부 타입에도 안전하게 시술 가능합니다.',
          'The 1064nm Nd:YAG wavelength safely accommodates darker skin types.',
          '1064nm Nd:YAG波长可安全适用于较深肤色类型。',
          '1064nm Nd:YAG波長により、濃い肌タイプにも安全に施術が可能です。',
        ),
      ],
    },
  },

  // 7. 리쥬란
  {
    id: 'treatment-rejuran',
    data: {
      description: lt(
        '연어 DNA에서 추출·정제한 PN(폴리뉴클레오티드) 성분을 피부에 직접 주입하는 스킨부스터입니다. PN은 수분을 단순히 채워 넣는 것이 아니라 피부 세포가 스스로 재생하도록 돕는 고분자 DNA 성분입니다. 진피 속 섬유아세포를 자극해 콜라겐 생성을 촉진하고, 항염 효과로 피부 환경 자체를 개선합니다.',
        'A skin booster that directly injects PN (polynucleotide) derived and purified from salmon DNA. Rather than simply filling the skin with moisture, PN is a high-molecular DNA component that stimulates skin cells to regenerate on their own, promoting collagen production and improving the overall skin environment through anti-inflammatory effects.',
        '将从三文鱼DNA中提取精制的PN（多聚核苷酸）成分直接注射至皮肤的护肤促进剂。PN并非单纯填充水分，而是帮助皮肤细胞自主再生的高分子DNA成分，刺激真皮成纤维细胞促进胶原蛋白生成，并通过消炎效果从根本改善肌肤环境。',
        'サーモンDNAから抽出・精製したPN（ポリヌクレオチド）成分を皮膚に直接注入するスキンブースターです。PNは単に水分を補填するのではなく、皮膚細胞が自ら再生するのを助ける高分子DNA成分です。真皮内の線維芽細胞を刺激してコラーゲン生成を促し、抗炎症効果で肌環境そのものを改善します。',
      ),
      features: [
        ls('피부 자가재생력 유도 및 회복 속도 향상', 'Stimulated natural skin regeneration and faster recovery', '促进皮肤自主再生，加速恢复', '肌の自己再生力を促進し回復スピードをアップ'),
        ls('보습·탄력 개선', 'Improved hydration and elasticity', '改善保湿与弹力', '保湿・弾力の改善'),
        ls('잔주름 완화', 'Reduced fine lines and wrinkles', '细纹淡化', '小じわの緩和'),
        ls('피부톤·결 개선 및 피부 장벽 강화', 'Improved skin tone, texture, and a stronger skin barrier', '改善肤色与肤质，强化皮肤屏障', '肌トーン・キメ改善と肌バリア強化'),
      ],
      recommendedFor: [
        ls('피부 재생력이 떨어져 회복이 느릴 때', "When skin's regenerative capacity has slowed", '皮肤再生力下降、恢复缓慢时', '肌の再生力が低下し回復が遅いと感じるとき'),
        ls('피부가 건조하고 수분이 부족할 때', 'When skin is dry and lacks moisture', '皮肤干燥、水分不足时', '肌が乾燥して潤い不足を感じるとき'),
        ls('눈가 잔주름이 신경 쓰일 때', 'When fine lines around the eyes become noticeable', '眼周细纹明显时', '目元の小じわが気になるとき'),
        ls('장기적으로 피부 컨디션 자체를 개선하고 싶을 때', 'When you want to fundamentally improve skin condition over time', '希望长期从根本改善肌肤状态时', '長期的に肌のコンディション自体を改善したいとき'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 20~30분', 'Cleanse and apply anesthetic cream for 20–30 minutes', '洁面后涂抹麻醉霜20～30分钟', '洗顔後に麻酔クリームを20〜30分塗布'),
        ls('주입 포인트 설계', 'Map injection points', '设计注射点位', '注入ポイントのデザイン'),
        ls('PN 성분 미세 주입', 'Micro-inject PN components', '微量注射PN成分', 'PN成分の微細注入'),
        ls('부위별 균등 분포', 'Distribute evenly across treatment areas', '按部位均匀分布', '部位ごとに均一に分布'),
        ls('진정 케어 후 마무리', 'Soothing care and finish', '镇静护理后收尾', 'クールダウンケアで仕上げ'),
      ],
      precautions: [
        ls('주입 자국 붉음증 1~3일 내 자연 소실', 'Injection marks and redness will disappear naturally within 1–3 days', '注射痕迹和红斑会在1～3天内自然消退', '注入跡の赤みは1〜3日以内に自然に消えます'),
        ls('당일 세안은 저자극 제품으로 부드럽게 가능', 'On the day of treatment, cleanse gently with a mild product', '当天可使用低刺激产品轻柔洁面', '当日の洗顔は低刺激製品でやさしく行えます'),
        ls('당일 메이크업은 자제 또는 저자극 제품만 사용 권장', 'Avoid makeup on treatment day, or use only mild products', '当天建议避免化妆，或仅使用低刺激产品', '当日のメイクは控えるか、低刺激製品のみ使用を推奨します'),
        ls('시술 후 1주일 사우나·음주·격렬한 운동 자제', 'Avoid sauna, alcohol, and strenuous exercise for 1 week', '术后1周内避免桑拿、饮酒及剧烈运动', '施術後1週間はサウナ・飲酒・激しい運動を控えてください'),
      ],
      faq: [
        faqItem(
          '일반 HA 필러와 다른가요?', 'How is it different from regular HA filler?',
          '与普通HA填充剂有什么区别？', '通常のHAフィラーとどう違いますか？',
          'HA 필러가 수분을 직접 채워 넣는 방식이라면 리쥬란은 PN 성분이 피부 세포 스스로 재생하도록 유도합니다. 즉각적인 볼륨보다 피부 자체의 건강함이 개선되는 것을 목표로 합니다.',
          "While HA filler directly fills the skin with moisture, Rejuran's PN stimulates skin cells to regenerate on their own. The goal is fundamental skin health, not immediate volume.",
          'HA填充剂是直接填充水分，而丽珠兰的PN成分则引导皮肤细胞自主再生，目标是改善皮肤本身的健康状态，而非即时增加体积。',
          'HAフィラーが水分を直接補填するのに対し、リジュランのPN成分は皮膚細胞が自ら再生するよう促します。即時のボリュームよりも肌そのものの健康改善を目指します。',
        ),
        faqItem(
          '몇 회 받는 것이 좋나요?', 'How many sessions are recommended?',
          '建议做几次？', '何回受けるのがよいですか？',
          '초기 집중 관리로 2주 간격 3~5회, 이후 유지 관리로 4~8주 간격을 권장합니다.',
          '3–5 sessions spaced 2 weeks apart for initial intensive care, then every 4–8 weeks for maintenance.',
          '初期集中护理建议每2周进行一次，共3～5次，此后维护护理建议每4～8周进行一次。',
          '初期集中ケアとして2週間隔で3〜5回、その後は4〜8週間隔でのメンテナンスをお勧めします。',
        ),
        faqItem(
          '시술 후 바로 메이크업이 가능한가요?', 'Can I wear makeup right after treatment?',
          '施术后可以立即化妆吗？', '施術後すぐにメイクできますか？',
          '당일은 자제하거나 저자극 제품만 사용을 권장합니다. 주입 자국이 1~3일 내 소실된 후 정상적인 메이크업이 가능합니다.',
          'On treatment day, avoid makeup or use only mild products. Normal makeup can resume after injection marks disappear within 1–3 days.',
          '当天建议避免化妆或仅使用低刺激产品。注射痕迹在1～3天内消退后可正常化妆。',
          '当日はメイクを控えるか低刺激製品のみ使用を推奨します。注入跡が1〜3日以内に消えた後、通常のメイクが可能です。',
        ),
        faqItem(
          '눈가에도 가능한가요?', 'Can it be done around the eyes?',
          '眼周也可以施术吗？', '目元にも施術できますか？',
          '네, 아이리쥬란 전용 저점도 제형으로 눈가 정밀 시술이 가능합니다.',
          'Yes, the dedicated low-viscosity Rejuran I formulation allows precise treatment around the delicate eye area.',
          '是的，可使用专为眼周设计的低黏度Rejuran I制剂进行精细施术。',
          'はい、専用の低粘度製剤Rejuran Iで目元への精密な施術が可能です。',
        ),
      ],
    },
  },

  // 8. 실리프팅
  {
    id: 'treatment-sili-lifting',
    data: {
      description: lt(
        '체내에서 서서히 녹는 의료용 실(PDO·PLLA·PCL)을 피부 아래에 삽입하여 처진 피부를 물리적으로 끌어올리는 리프팅입니다. 실 삽입 직후 즉각적인 리프팅 효과가 나타나며, 실이 서서히 분해되는 과정에서 콜라겐 생성이 유도되어 실이 완전히 녹은 후에도 탄력 개선 효과가 이어집니다.',
        'A lifting treatment that physically lifts sagging skin by inserting biodegradable medical threads (PDO, PLLA, or PCL) beneath the skin. An immediate lifting effect is visible right after thread insertion, and as the threads gradually dissolve, collagen production is stimulated—maintaining elasticity improvements even after the threads are fully absorbed.',
        '将在体内缓慢溶解的医用线（PDO·PLLA·PCL）埋入皮肤下方，物理性上提松弛皮肤的提拉治疗。埋线后即刻产生提拉效果，线材缓慢分解的过程中诱导胶原蛋白生成，即使线材完全溶解后弹力改善效果仍持续。',
        '体内でゆっくりと溶ける医療用スレッド（PDO・PLLA・PCL）を皮膚の下に挿入してたるんだ肌を物理的に引き上げるリフティングです。挿入直後から即時リフティング効果が現れ、スレッドが徐々に分解される過程でコラーゲン生成が促進され、完全に溶けた後も弾力改善効果が続きます。',
      ),
      features: [
        ls('즉각적 물리 리프팅으로 당일 라인 변화 확인', 'Immediate physical lifting—visible contour change on the day of treatment', '即时物理提拉，当天即可看到轮廓变化', '即時の物理リフティングで当日からラインの変化を実感'),
        ls('콜라겐 생성 유도로 장기적 탄력 개선', 'Long-term elasticity improvement through stimulated collagen production', '诱导胶原蛋白生成，长期改善弹力', 'コラーゲン生成促進による長期的な弾力改善'),
        ls('턱선·볼·V라인 정리', 'Defined jawline, cheeks, and V-line', '收紧下颌线、面颊与V脸线条', 'フェイスライン・頬・Vラインの引き締め'),
      ],
      recommendedFor: [
        ls('즉각적인 리프팅 효과를 원할 때', 'When you want an immediate lifting effect', '希望立即见到提拉效果时', '即時のリフティング効果を求めるとき'),
        ls('수술 없이 확실한 처짐 개선을 원할 때', 'When you want definitive sagging correction without surgery', '不想手术但希望明显改善松弛时', '手術なしで確かなたるみ改善を求めるとき'),
        ls('턱선·볼 처짐이 신경 쓰일 때', 'When sagging along the jawline or cheeks is a concern', '下颌线和面颊松弛令人烦恼时', 'フェイスラインや頬のたるみが気になるとき'),
        ls('리프팅과 콜라겐 재생을 동시에 원할 때', 'When you want lifting and collagen regeneration together', '希望同时实现提拉和胶原蛋白再生时', 'リフティングとコラーゲン再生を同時に望むとき'),
      ],
      procedure: [
        ls('세안 후 국소마취', 'Cleanse and administer local anesthesia', '洁面后进行局部麻醉', '洗顔後に局所麻酔を実施'),
        ls('실 종류·삽입 방향 설계', 'Design thread type and insertion direction', '设计线材种类和插入方向', 'スレッドの種類・挿入方向のデザイン'),
        ls('캐뉼라로 실 삽입', 'Insert threads using a cannula', '使用套管针插入线材', 'カニューレでスレッドを挿入'),
        ls('리프팅 위치 미세 조정', 'Fine-tune the lifting position', '微调提拉位置', 'リフティング位置の微調整'),
        ls('진정 케어 후 마무리', 'Soothing care and finish', '镇静护理后收尾', 'クールダウンケアで仕上げ'),
      ],
      precautions: [
        ls('시술 후 3~7일 부기·멍 발생 가능 (자연 완화)', 'Swelling and bruising may occur for 3–7 days, resolving naturally', '术后3～7天可能出现浮肿和瘀青（自然消退）', '施術後3〜7日はむくみ・内出血が出る場合があります（自然に落ち着きます）'),
        ls('1~2주 과도한 표정·씹는 행위 자제', 'Avoid exaggerated facial expressions and chewing for 1–2 weeks', '1～2周内避免过度做表情或咀嚼', '1〜2週間は大げさな表情や咀嚼を控えてください'),
        ls('2~4주 사우나·안면 마사지 자제', 'Avoid sauna and facial massage for 2–4 weeks', '2～4周内避免桑拿和面部按摩', '2〜4週間はサウナ・顔のマッサージを控えてください'),
        ls('시술 부위 임의로 만지거나 누르는 행위 자제', 'Do not press or manipulate the treated area', '避免随意触摸或按压施术部位', '施術部位を勝手に触ったり押したりしないでください'),
      ],
      faq: [
        faqItem(
          '어떤 소재를 선택하면 좋나요?', 'Which material should I choose?',
          '应该选择哪种材质？', 'どの素材を選べばよいですか？',
          '소재에 따라 유지 기간이 다릅니다. PDO는 약 6~8개월, PLLA는 약 12~18개월, PCL은 약 18~24개월입니다. 원하는 유지 기간과 상황에 따라 상담 후 결정할 수 있습니다.',
          'Durability varies by material: PDO lasts approximately 6–8 months, PLLA 12–18 months, and PCL 18–24 months. The best choice can be determined through consultation based on your goals and circumstances.',
          '不同材质维持时间不同：PDO约6～8个月，PLLA约12～18个月，PCL约18～24个月。可根据期望的维持时间和实际情况通过咨询后决定。',
          '素材によって持続期間が異なります。PDOは約6〜8ヶ月、PLLAは約12〜18ヶ月、PCLは約18〜24ヶ月です。希望の持続期間や状況に合わせてカウンセリングで決定できます。',
        ),
        faqItem(
          '시술 후 바로 일상생활이 가능한가요?', 'Can I resume daily activities right after?',
          '施术后可以立即恢复日常生活吗？', '施術後すぐに日常生活に戻れますか？',
          '시술 후 3~7일은 부기·멍이 발생할 수 있습니다. 일상생활은 가능하나 격렬한 활동이나 안면 마사지는 피해주세요.',
          'Swelling and bruising may occur for 3–7 days. Daily activities are possible, but avoid strenuous activity and facial massage.',
          '术后3～7天可能出现浮肿和瘀青。日常活动可以进行，但请避免剧烈活动和面部按摩。',
          '施術後3〜7日はむくみ・内出血が出る場合があります。日常生活は可能ですが、激しい運動や顔のマッサージは避けてください。',
        ),
        faqItem(
          '실이 녹으면 효과가 사라지나요?', 'Will results disappear when the threads dissolve?',
          '线材溶解后效果会消失吗？', 'スレッドが溶けると効果はなくなりますか？',
          '실이 분해되는 과정에서 콜라겐 생성이 유도되어, 실이 완전히 녹은 후에도 탄력 개선 효과가 지속됩니다.',
          'Collagen production is stimulated as the threads dissolve, so elasticity improvements continue even after the threads are fully absorbed.',
          '线材分解过程中会诱导胶原蛋白生成，即使线材完全溶解后，弹力改善效果仍会持续。',
          'スレッドが分解される過程でコラーゲン生成が促されるため、完全に溶けた後も弾力改善効果が持続します。',
        ),
        faqItem(
          '통증이 심한가요?', 'Is it painful?',
          '疼痛感强吗？', '痛みは強いですか？',
          '국소마취 후 진행하므로 시술 중 통증이 크게 완화됩니다.',
          'Local anesthesia is administered before treatment, significantly reducing discomfort during the procedure.',
          '局部麻醉后进行施术，施术过程中疼痛感大幅减轻。',
          '局所麻酔後に施術を行うため、施術中の痛みは大幅に軽減されます。',
        ),
      ],
    },
  },

  // 9. 필러
  {
    id: 'treatment-filler',
    data: {
      description: lt(
        '히알루론산(HA) 성분의 필러를 피부 아래에 주입하여 꺼진 볼륨을 채우고 윤곽을 개선하는 시술입니다. 벨로테로(독일 멀츠)는 피부 조직과 자연스럽게 섞이는 CPM® 기술로 잔주름·눈밑처럼 섬세한 부위에 적합하며, 쥬비덤(미국 앨러간)은 높은 볼륨감과 유지력으로 볼·턱·코 윤곽 개선에 적합합니다.',
        'A treatment that injects hyaluronic acid (HA) filler beneath the skin to restore lost volume and refine contours. Belotero (German Merz) uses CPM® technology to blend naturally with skin tissue, ideal for delicate areas like fine lines and under-eyes. Juvederm (US Allergan) provides high-volume and long-lasting results, ideal for cheeks, chin, and nose contouring.',
        '将透明质酸（HA）填充剂注射至皮肤下方，填补流失的体积并改善轮廓。贝洛特罗（德国默兹）采用CPM®技术与皮肤组织自然融合，适合细纹、眼下等精细部位；乔雅登（美国艾尔健）以高饱满感和持久性，适合改善面颊、下颌、鼻部等轮廓。',
        'ヒアルロン酸（HA）フィラーを皮膚の下に注入し、失われたボリュームを補填して輪郭を整える施術です。ベロテロ（ドイツMerz）はCPM®技術で皮膚組織と自然に馴染み、小じわや目元などデリケートな部位に最適。ジュビダーム（米国アラガン）は高いボリューム感と持続力で頬・顎・鼻の輪郭改善に適しています。',
      ),
      features: [
        ls('볼륨 보충 및 윤곽 개선', 'Restored volume and improved facial contours', '补充体积，改善轮廓', 'ボリューム補填と輪郭改善'),
        ls('팔자주름·법령선 완화', 'Reduced nasolabial folds and marionette lines', '淡化法令纹及木偶纹', '法令線・マリオネットラインの緩和'),
        ls('코·턱 라인 보정', 'Refined nose and chin line', '修饰鼻部和下颌线条', '鼻・顎のラインを整える'),
      ],
      recommendedFor: [
        ls('볼·관자놀이 볼륨이 꺼져 피곤해 보일 때', 'When hollow cheeks or temples make you look tired', '面颊或太阳穴凹陷显得疲惫时', '頬やこめかみがこけて疲れて見えるとき'),
        ls('팔자주름·법령선이 깊어질 때', 'When nasolabial folds or marionette lines deepen', '法令纹或木偶纹加深时', '法令線やマリオネットラインが深くなるとき'),
        ls('코·턱 윤곽을 자연스럽게 보정하고 싶을 때', 'When you want natural nose or chin contouring', '希望自然修饰鼻部和下颌轮廓时', '鼻や顎のラインを自然に整えたいとき'),
        ls('즉각적인 볼륨 변화가 필요할 때', 'When you need an immediate visible change in volume', '需要立即看到体积变化时', '即時のボリューム変化が必要なとき'),
      ],
      procedure: [
        ls('세안 후 마취 크림 도포 또는 신경차단 마취', 'Cleanse and apply anesthetic cream or nerve block anesthesia', '洁面后涂抹麻醉霜或进行神经阻滞麻醉', '洗顔後に麻酔クリームを塗布または神経ブロック麻酔を実施'),
        ls('부위별 주입 포인트 설계', 'Design injection points by zone', '按部位设计注射点位', '部位ごとに注入ポイントをデザイン'),
        ls('HA 필러 정밀 주입', 'Precise HA filler injection', '精准注射HA填充剂', 'HAフィラーを精密注入'),
        ls('형태 미세 조정', 'Fine-tune the shape', '微调形态', '形状を微調整'),
        ls('진정 케어 후 마무리', 'Soothing care and finish', '镇静护理后收尾', 'クールダウンケアで仕上げ'),
      ],
      precautions: [
        ls('시술 후 1~3일 붓기·멍 발생 가능 (자연 완화)', 'Swelling and bruising may occur for 1–3 days, resolving naturally', '术后1～3天可能出现浮肿和瘀青（自然消退）', '施術後1〜3日はむくみ・内出血が出る場合があります（自然に落ち着きます）'),
        ls('시술 부위 마사지·압박 금지', 'Do not massage or apply pressure to the treated area', '禁止按摩或按压施术部位', '施術部位のマッサージ・圧迫は禁止です'),
        ls('1주일 사우나·음주 자제', 'Avoid sauna and alcohol for 1 week', '1周内避免桑拿和饮酒', '1週間はサウナ・飲酒を控えてください'),
        ls('시술 직후 극심한 통증·피부 변색 발생 시 즉시 내원', 'Seek immediate care if severe pain or skin discoloration occurs after treatment', '施术后若出现剧烈疼痛或皮肤变色，请立即就诊', '施術直後に激しい痛みや皮膚の変色が生じた場合はすぐにご来院ください'),
      ],
      faq: [
        faqItem(
          '효과가 얼마나 유지되나요?', 'How long do results last?',
          '效果能维持多久？', '効果はどのくらい持続しますか？',
          '제형·부위·개인 피부 상태에 따라 다릅니다. 상담을 통해 적합한 제형을 선택할 수 있습니다.',
          'Duration varies by formulation, treatment area, and individual skin condition. The most suitable product can be selected through consultation.',
          '因制剂、部位和个人肤质而异。可通过咨询选择合适的制剂。',
          '製剤・部位・個人の肌状態によって異なります。カウンセリングで最適な製剤を選択できます。',
        ),
        faqItem(
          '어떤 부위에 어떤 필러가 맞나요?', 'Which filler suits which area?',
          '哪个部位适合哪种填充剂？', 'どの部位にどのフィラーが合いますか？',
          '벨로테로는 잔주름·눈밑·입술 등 섬세한 부위에, 쥬비덤은 볼·관자놀이·턱·코 등 볼륨이 필요한 부위에 적합합니다.',
          "Belotero is ideal for delicate areas like fine lines, under-eyes, and lips; Juvederm is better for volumizing areas like cheeks, temples, chin, and nose.",
          '贝洛特罗适合细纹、眼下、唇部等精细部位，乔雅登适合需要增加体积的面颊、太阳穴、下颌、鼻部等部位。',
          'ベロテロは小じわ・目元・唇などデリケートな部位に、ジュビダームは頬・こめかみ・顎・鼻などボリュームが必要な部位に適しています。',
        ),
        faqItem(
          '시술 직후 일상생활이 가능한가요?', 'Can I go about my day right after treatment?',
          '施术后可以立即正常生活吗？', '施術直後に日常生活は送れますか？',
          '1~3일 붓기·멍이 발생할 수 있지만 일상생활은 가능합니다. 중요한 일정이 있다면 여유 시간을 두고 시술하시길 권장합니다.',
          'Swelling and bruising may last 1–3 days, but daily activities are possible. If you have important events, we recommend scheduling treatment with ample time to spare.',
          '可能出现1～3天的浮肿和瘀青，但日常生活不受影响。如有重要安排，建议提前留出充足时间进行施术。',
          '1〜3日のむくみ・内出血が出る場合がありますが、日常生活は送れます。重要な予定がある場合は余裕をもって施術することをお勧めします。',
        ),
        faqItem(
          '정품 필러 사용 여부를 확인할 수 있나요?', 'Can I verify that authentic filler is used?',
          '可以确认使用的是正品填充剂吗？', '正規品フィラーの使用は確認できますか？',
          '네, 시술 전 정품 인증 여부를 직접 확인하실 수 있습니다.',
          'Yes, you can verify the authenticity of the filler product before treatment.',
          '是的，您可以在施术前亲自确认是否使用正品。',
          'はい、施術前に正規品認証を直接ご確認いただけます。',
        ),
      ],
    },
  },

  // 10. LDM
  {
    id: 'treatment-ldm',
    data: {
      description: lt(
        '독일 웰코멧(Wellcomet)社의 LDM은 3MHz·10MHz를 포함한 듀얼 주파수 초음파를 초당 최대 500회 교차 전환하여 피부에 미세 진동을 전달하는 초음파 관리입니다. 열을 사용하지 않는 비열 방식으로 피부 손상 없이 진정·재생·보습 효과를 제공합니다. 단독 관리로도 효과적이며, 레이저·RF 시술 후 회복을 빠르게 촉진하는 마무리 케어로 특히 유용합니다.',
        'LDM by Wellcomet (Germany) is an ultrasound care treatment that alternates dual-frequency ultrasound (including 3MHz and 10MHz) up to 500 times per second, delivering micro-vibrations to the skin. Its non-thermal method soothes, regenerates, and hydrates without damaging skin tissue. Effective as a standalone treatment and especially valuable as a recovery accelerator after laser or RF procedures.',
        '德国Wellcomet公司的LDM将包含3MHz·10MHz在内的双频超声波每秒最多交替转换500次，向皮肤传递微振动的超声波护理。采用不使用热能的非热方式，在不损伤皮肤的情况下提供镇静、再生和保湿效果。单独使用也很有效，尤其适合作为激光·RF施术后加速恢复的收尾护理。',
        'ドイツWellcomet社のLDMは3MHz・10MHzを含むデュアル周波数超音波を毎秒最大500回交互切換えし、皮膚に微細振動を届ける超音波ケアです。熱を使わない非熱方式で皮膚を傷めることなく鎮静・再生・保湿効果を提供します。単独ケアとしても効果的で、レーザー・RF施術後の回復を促進するアフターケアとして特に有用です。',
      ),
      features: [
        ls('피부 진정 및 염증 완화', 'Skin soothing and inflammation reduction', '镇静肌肤，缓解炎症', '肌の鎮静と炎症緩和'),
        ls('수분·영양 흡수율 향상', 'Enhanced moisture and nutrient absorption', '提升水分与营养吸收率', '水分・栄養の吸収率アップ'),
        ls('피부 재생 촉진 및 탄력 보조', 'Accelerated skin regeneration and improved firmness', '促进皮肤再生并辅助改善弹力', '肌の再生促進と弾力サポート'),
        ls('레이저·RF 시술 후 회복 가속화', 'Faster recovery after laser or RF treatments', '加速激光·RF施术后的恢复', 'レーザー・RF施術後の回復加速'),
      ],
      recommendedFor: [
        ls('피부가 예민하고 자극이 걱정될 때', "When skin is sensitive and you're concerned about irritation", '皮肤敏感、担心受到刺激时', '肌が敏感で刺激が心配なとき'),
        ls('레이저·리프팅 시술 후 빠른 회복을 원할 때', 'When you want faster recovery after laser or lifting treatments', '希望在激光·提拉施术后快速恢复时', 'レーザー・リフティング施術後の早期回復を望むとき'),
        ls('수분·탄력 관리를 꾸준히 하고 싶을 때', 'When you want consistent moisture and elasticity maintenance', '希望持续进行水分和弹力管理时', '保湿・弾力ケアを定期的に続けたいとき'),
        ls('다운타임 없이 바로 일상 복귀가 필요할 때', 'When you need to return to daily activities immediately with no downtime', '需要无恢复期立即回归日常时', 'ダウンタイムなしですぐに日常に戻る必要があるとき'),
      ],
      procedure: [
        ls('세안', 'Cleanse skin', '洁面', '洗顔'),
        ls('피부 상태에 따라 주파수 설정 (3MHz·10MHz 등)', 'Set frequency based on skin condition (3MHz, 10MHz, etc.)', '根据皮肤状态设置频率（3MHz·10MHz等）', '肌状態に応じて周波数を設定（3MHz・10MHzなど）'),
        ls('핸드피스로 부위별 마이크로마사지 진행', 'Perform micro-massage by zone using handpiece', '使用手具按部位进行微按摩', 'ハンドピースで部位ごとにマイクロマッサージを実施'),
        ls('재생·진정 집중 부위 추가 조사', 'Additional focused treatment on regeneration and soothing zones', '对再生·镇静重点部位追加照射', '再生・鎮静の集中部位に追加照射'),
        ls('수분 앰플 도포 후 마무리', 'Apply hydrating ampoule and finish', '涂抹水分安瓿后收尾', '水分アンプルを塗布して仕上げ'),
      ],
      precautions: [
        ls('시술 당일 사우나·과음·격렬한 운동 자제 권장', 'Avoid sauna, excessive alcohol, and strenuous exercise on treatment day', '建议施术当天避免桑拿、过量饮酒及剧烈运动', '施術当日はサウナ・過度な飲酒・激しい運動を控えることをお勧めします'),
        ls('시술 후 세안 및 메이크업 바로 가능', 'Cleansing and makeup are fine immediately after treatment', '施术后可立即洁面和化妆', '施術後すぐに洗顔・メイクが可能です'),
      ],
      faq: [
        faqItem(
          '다운타임이 있나요?', 'Is there any downtime?',
          '有恢复期吗？', 'ダウンタイムはありますか？',
          '없습니다. 시술 직후 바로 세안·메이크업이 가능하며 일상생활에 지장이 없습니다.',
          'None. You can cleanse and wear makeup immediately after and go about your day as normal.',
          '没有。施术后可立即洁面和化妆，不影响日常生活。',
          'ありません。施術直後から洗顔・メイクが可能で、日常生活に支障はありません。',
        ),
        faqItem(
          '다른 시술 후에도 받을 수 있나요?', 'Can I get this after other treatments?',
          '其他施术后也可以接受吗？', '他の施術後にも受けられますか？',
          '네, 레이저·리프팅 등 시술 당일 또는 다음날 병행하면 회복 속도가 빨라집니다.',
          'Yes, receiving LDM on the same day or the day after laser or lifting treatments accelerates recovery.',
          '是的，在激光·提拉等施术当天或次日配合进行，可加快恢复速度。',
          'はい、レーザー・リフティングなどの施術当日または翌日に組み合わせると回復が早まります。',
        ),
        faqItem(
          '얼마나 자주 받아야 하나요?', 'How often should I come in?',
          '需要多久做一次？', 'どのくらいの頻度で来院すればよいですか？',
          '주 1~2회(5~7일 간격) 정기 관리 시 효과가 누적됩니다.',
          'Regular treatment 1–2 times per week (every 5–7 days) allows effects to accumulate.',
          '每周1～2次（间隔5～7天）定期护理，效果会不断累积。',
          '週1〜2回（5〜7日間隔）の定期ケアで効果が蓄積されます。',
        ),
        faqItem(
          '민감성 피부도 가능한가요?', 'Is it suitable for sensitive skin?',
          '敏感肌也可以做吗？', '敏感肌でも受けられますか？',
          '네, 비열 방식으로 열 자극이 없어 예민한 피부 타입에도 안전하게 받을 수 있습니다.',
          'Yes, the non-thermal method means no heat stimulation, making it safe for even the most sensitive skin types.',
          '是的，非热方式无热刺激，即使是敏感肌肤类型也可以安全接受。',
          'はい、非熱方式で熱刺激がないため、敏感な肌タイプでも安全に受けられます。',
        ),
      ],
    },
  },

  // 11. 수면마취
  {
    id: 'treatment-sedation',
    data: {
      description: lt(
        '프로포폴을 정맥으로 투여하여 의식을 일시적으로 저하시키는 마취 방법입니다. 전신마취와 달리 자발 호흡을 유지하면서 의식만 저하시키는 MAC(Monitored Anesthesia Care) 방식으로, 혈압·맥박·산소포화도·심전도를 실시간 모니터링하며 진행합니다.',
        'A sedation method using intravenous propofol to temporarily reduce consciousness. Unlike general anesthesia, it uses MAC (Monitored Anesthesia Care) to lower consciousness while preserving spontaneous breathing, with continuous real-time monitoring of blood pressure, pulse, oxygen saturation, and ECG.',
        '通过静脉注射丙泊酚使意识暂时降低的麻醉方法。与全身麻醉不同，采用MAC（监测麻醉护理）方式在保持自主呼吸的同时仅降低意识，实时监测血压、脉搏、血氧饱和度及心电图。',
        '静脈にプロポフォールを投与して意識を一時的に低下させる麻酔方法です。全身麻酔とは異なり、自発呼吸を維持しながら意識のみを低下させるMAC（モニタリング麻酔管理）方式で、血圧・脈拍・酸素飽和度・心電図をリアルタイムでモニタリングしながら施術を行います。',
      ),
      features: [
        ls('시술 중 통증·불안 최소화', 'Minimized pain and anxiety during treatment', '最大限度减少施术中的疼痛和不安', '施術中の痛み・不安を最小化'),
        ls('실시간 활력징후 모니터링으로 안전 관리', 'Safety managed through real-time vital sign monitoring', '通过实时生命体征监测确保安全', 'リアルタイムバイタルサインモニタリングによる安全管理'),
        ls('움직임 최소화로 시술 정밀도 향상', 'Improved treatment precision with minimized movement', '减少移动，提高施术精准度', '動きを最小化して施術精度を向上'),
      ],
      recommendedFor: [
        ls('통증에 민감하여 시술이 두려운 분', 'Those who are sensitive to pain and fearful of treatments', '对疼痛敏感、对施术感到恐惧的人', '痛みに敏感で施術が怖い方'),
        ls('시술에 대한 불안·공포가 있는 분', 'Those who experience anxiety or apprehension about medical procedures', '对施术感到不安和恐惧的人', '施術に対して不安や恐怖がある方'),
        ls('여러 시술을 한 번에 받고 싶은 분', 'Those who want to receive multiple treatments in one visit', '希望一次完成多项施术的人', '複数の施術を一度に受けたい方'),
      ],
      procedure: [
        ls('시술 전 8시간 금식 확인', 'Confirm 8-hour fasting before treatment', '确认施术前8小时禁食', '施術前8時間の絶食を確認'),
        ls('의료진 상담 및 컨디션 체크', 'Consultation and health check with medical staff', '与医护人员进行咨询和状态检查', '医療スタッフとの相談・コンディションチェック'),
        ls('프로포폴 정맥 투여', 'Intravenous propofol administration', '静脉注射丙泊酚', 'プロポフォールの静脈投与'),
        ls('시술 진행 (무통 상태)', 'Treatment performed (pain-free state)', '进行施术（无痛状态）', '施術実施（無痛状態）'),
        ls('회복실 30~60분 안정 후 귀가', '30–60 minutes rest in recovery room before discharge', '在恢复室休息30～60分钟后离院', '回復室で30〜60分安静にした後に帰宅'),
      ],
      precautions: [
        ls('시술 전 8시간 금식 필수', '8-hour fasting required before treatment', '施术前必须禁食8小时', '施術前8時間の絶食が必須です'),
        ls('당일 운전 불가', 'Driving on the day of treatment is not allowed', '当天不可驾车', '当日の運転はできません'),
        ls('보호자 동반 권장', 'A companion is recommended', '建议携带陪同人员', '付き添いの方の同行をお勧めします'),
        ls('임신·중증 질환·약물 알레르기 사전 고지 필수', 'Must inform staff in advance of pregnancy, serious illness, or drug allergies', '妊娠、重症疾病、药物过敏须提前告知', '妊娠・重篤な疾患・薬物アレルギーは必ず事前にお知らせください'),
        ls('수면마취 전 의료진과 충분한 상담 진행', 'Have a thorough consultation with medical staff before sedation', '静脉镇静前需与医护人员进行充分咨询', '静脈麻酔前に医療スタッフと十分な相談を行ってください'),
      ],
      faq: [
        faqItem(
          '수면마취 후 의식 회복에 얼마나 걸리나요?', 'How long does it take to regain consciousness after sedation?',
          '静脉镇静后意识恢复需要多长时间？', '静脈麻酔後、意識が回復するまでどのくらいかかりますか？',
          '시술 종료 후 약 10~15분 내 의식이 회복됩니다. 이후 회복실에서 30~60분 안정 후 귀가하실 수 있습니다.',
          'Consciousness typically returns within approximately 10–15 minutes after treatment. You can then rest in the recovery room for 30–60 minutes before leaving.',
          '施术结束后约10～15分钟内意识恢复。此后在恢复室休息30～60分钟后即可离院。',
          '施術終了後、約10〜15分以内に意識が回復します。その後は回復室で30〜60分安静にしてから帰宅できます。',
        ),
        faqItem(
          '금식은 왜 필요한가요?', 'Why is fasting required?',
          '为什么需要禁食？', '絶食はなぜ必要ですか？',
          '수면마취 중 구역감 및 흡인 위험을 예방하기 위해 시술 전 8시간 금식이 필수입니다.',
          '8-hour fasting before treatment is mandatory to prevent nausea and aspiration risk during sedation.',
          '为预防静脉镇静过程中的恶心和误吸风险，施术前8小时禁食是必须的。',
          '静脈麻酔中の吐き気や誤嚥リスクを予防するために、施術前8時間の絶食が必須です。',
        ),
        faqItem(
          '당일 혼자 내원해도 되나요?', 'Can I come alone on the day of treatment?',
          '当天可以独自就诊吗？', '当日一人で来院してもよいですか？',
          '당일 운전이 불가하고 회복 중 안전을 위해 보호자 동반을 권장합니다.',
          'Driving is not permitted on treatment day, and a companion is recommended for safety during recovery.',
          '当天不可驾车，为确保恢复过程中的安全，建议携带陪同人员。',
          '当日の運転はできず、回復中の安全のため付き添いの方の同行をお勧めします。',
        ),
        faqItem(
          '어떤 시술에 수면마취를 적용할 수 있나요?', 'Which treatments can be combined with sedation?',
          '哪些施术可以配合静脉镇静进行？', 'どの施術に静脈麻酔を組み合わせられますか？',
          '울쎄라피 프라임, 써마지 FLX, 실리프팅 등 통증이 큰 시술에 병행 가능합니다. 자세한 내용은 사전 상담을 통해 확인해 주세요.',
          'It can be combined with treatments involving significant discomfort, such as Ultherapy Prime, Thermage FLX, and Thread Lifting. Please confirm availability through a prior consultation.',
          '可与超声刀、热玛吉FLX、埋线提拉等疼痛感较强的施术配合进行。详情请通过事前咨询确认。',
          'ウルセラピープライム、サーマジFLX、スレッドリフティングなど痛みを伴う施術に組み合わせることができます。詳細は事前カウンセリングでご確認ください。',
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
