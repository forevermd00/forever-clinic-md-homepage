// pageHero 문서 title/subtitle/pageKey 일괄 패치
// 실행: SANITY_API_TOKEN=... node scripts/patch-hero-data.mjs

const TOKEN = process.env.SANITY_API_TOKEN;
const PROJECT = 'ecoamz42';
const DATASET = 'production';
const API = `https://${PROJECT}.api.sanity.io/v2026-04-25`;

if (!TOKEN) {
  console.error('SANITY_API_TOKEN 환경변수 필요');
  process.exit(1);
}

function ls(ko, en, zh, ja) {
  return { _type: 'localizedString', ko, en, zh, ja };
}

const heroData = [
  {
    _id: 'page-hero-main',
    pageKey: 'main',
    title: ls(
      '당신의 아름다움이 영원하도록',
      'Your Beauty, Forever',
      '让您的美丽永恒',
      'あなたの美しさが永遠に'
    ),
    subtitle: ls(
      '포에버 의원 명동점',
      'Forever Clinic Myeongdong',
      'Forever Clinic 明洞院',
      'フォーエバークリニック 明洞院'
    ),
  },
  {
    _id: 'page-hero-before-after',
    pageKey: 'before-after',
    title: ls(
      'Before & After',
      'Before & After',
      '治疗前后对比',
      'ビフォー & アフター'
    ),
    subtitle: ls(
      '실제 시술 전후 비교 사진',
      'Real treatment before & after photos',
      '真实治疗前后对比照片',
      '実際の施術前後の比較写真'
    ),
  },
  {
    _id: 'page-hero-brand',
    pageKey: 'brand',
    title: ls(
      '브랜드 스토리',
      'Our Story',
      '品牌故事',
      'ブランドストーリー'
    ),
    subtitle: ls(
      '포에버 클리닉이 추구하는 네 가지 가치',
      'The four values Forever Clinic stands for',
      'Forever Clinic坚守的四项价值观',
      'フォーエバークリニックが掲げる4つの価値'
    ),
  },
  {
    _id: 'page-hero-promotions',
    pageKey: 'promotions',
    title: ls(
      '이벤트 & 프로모션',
      'Events & Promotions',
      '活动 & 优惠',
      'イベント & プロモーション'
    ),
    subtitle: ls(
      '지금 진행 중인 특별 혜택을 확인하세요',
      'Check out our current special offers',
      '立即查看正在进行的特别优惠',
      '現在開催中の特別特典をご確認ください'
    ),
  },
  {
    _id: 'page-hero-press',
    pageKey: 'press',
    title: ls(
      '보도자료',
      'Press',
      '媒体报道',
      'プレスリリース'
    ),
    subtitle: ls(
      '미디어에 소개된 포에버 클리닉',
      'Forever Clinic in the media',
      '媒体报道中的Forever Clinic',
      'メディアで紹介されたフォーエバークリニック'
    ),
  },
  {
    _id: 'page-hero-video',
    pageKey: 'video',
    title: ls(
      '영상 콘텐츠',
      'Videos',
      '视频内容',
      '動画コンテンツ'
    ),
    subtitle: ls(
      '시술 영상과 전문의 인터뷰',
      'Treatment videos and specialist interviews',
      '治疗视频和专家访谈',
      '施術動画と専門医インタビュー'
    ),
  },
  {
    _id: 'page-hero-blog',
    pageKey: 'blog',
    title: ls(
      '블로그',
      'Blog',
      '博客',
      'ブログ'
    ),
    subtitle: ls(
      '피부 건강을 위한 전문 정보',
      'Expert tips for healthy skin',
      '关于皮肤健康的专业信息',
      '肌の健康のための専門情報'
    ),
  },
  {
    _id: 'page-hero-contact',
    pageKey: 'contact',
    title: ls(
      '예약 & 상담',
      'Contact Us',
      '预约 & 咨询',
      'ご予約 & ご相談'
    ),
    subtitle: ls(
      '편하게 문의해 주세요',
      'Feel free to reach out',
      '欢迎随时咨询我们',
      'お気軽にお問い合わせください'
    ),
  },
  // 시술 카테고리 히어로
  {
    _id: 'page-hero-category-lifting',
    pageKey: 'category-lifting',
    title: ls(
      '리프팅 · 레이저',
      'Lifting & Laser',
      '提拉紧致 & 激光',
      'リフティング & レーザー'
    ),
    subtitle: ls(
      '탄력과 윤곽을 되돌리는 프리미엄 리프팅',
      'Premium lifting to restore firmness and contour',
      '恢复紧致与轮廓的优质提拉疗程',
      '弾力と輪郭を取り戻すプレミアムリフティング'
    ),
  },
  {
    _id: 'page-hero-category-skincare',
    pageKey: 'category-skincare',
    title: ls(
      '피부케어',
      'Skin Care',
      '皮肤护理',
      'スキンケア'
    ),
    subtitle: ls(
      '피부 본연의 건강함을 되찾는 맞춤 케어',
      'Customized care to restore your skin\'s natural health',
      '恢复肌肤天然健康的定制护理',
      '肌本来の健康を取り戻すカスタムケア'
    ),
  },
  {
    _id: 'page-hero-category-toning',
    pageKey: 'category-toning',
    title: ls(
      '토닝 · 색소',
      'Toning & Pigmentation',
      '调色 & 色素改善',
      'トーニング & 色素'
    ),
    subtitle: ls(
      '잡티와 색소 고민, 선명하게 해결합니다',
      'Clearly address pigmentation and uneven skin tone',
      '清晰解决色斑和色素问题',
      'くすみや色素沈着の悩みをスッキリ解決'
    ),
  },
  {
    _id: 'page-hero-category-botox-filler',
    pageKey: 'category-botox-filler',
    title: ls(
      '보톡스 · 필러',
      'Botox & Filler',
      '肉毒素 & 填充',
      'ボトックス & フィラー'
    ),
    subtitle: ls(
      '정확한 양과 기술로 자연스러운 볼륨을 완성합니다',
      'Natural volume achieved with precise dosage and technique',
      '以精准剂量和技术打造自然饱满的效果',
      '正確な量と技術で自然なボリュームを実現'
    ),
  },
  // 카테고리 썸네일용 (소제목 없이 제목만)
  {
    _id: 'page-hero-category-thumb-lifting',
    pageKey: 'category-thumb-lifting',
    title: ls('리프팅 · 레이저', 'Lifting & Laser', '提拉 & 激光', 'リフティング & レーザー'),
    subtitle: ls('탄력 · 윤곽 · 피부결', 'Firming · Contouring · Texture', '紧致 · 轮廓 · 肤质', '弾力 · 輪郭 · 肌質'),
  },
  {
    _id: 'page-hero-category-thumb-skincare',
    pageKey: 'category-thumb-skincare',
    title: ls('피부케어', 'Skin Care', '皮肤护理', 'スキンケア'),
    subtitle: ls('보습 · 진정 · 재생', 'Hydration · Soothing · Regeneration', '保湿 · 镇静 · 再生', 'うるおい · 鎮静 · 再生'),
  },
  {
    _id: 'page-hero-category-thumb-toning',
    pageKey: 'category-thumb-toning',
    title: ls('토닝 · 색소', 'Toning & Pigmentation', '调色 & 色素', 'トーニング & 色素'),
    subtitle: ls('잡티 · 미백 · 균일한 피부톤', 'Spots · Brightening · Even tone', '色斑 · 美白 · 均匀肤色', 'シミ · 美白 · 均一な肌トーン'),
  },
  {
    _id: 'page-hero-category-thumb-botox-filler',
    pageKey: 'category-thumb-botox-filler',
    title: ls('보톡스 · 필러', 'Botox & Filler', '肉毒素 & 填充', 'ボトックス & フィラー'),
    subtitle: ls('주름 · 볼륨 · 윤곽', 'Wrinkles · Volume · Contour', '皱纹 · 饱满 · 轮廓', 'しわ · ボリューム · 輪郭'),
  },
];

async function mutate(mutations) {
  const res = await fetch(`${API}/data/mutate/${DATASET}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ mutations }),
  });
  const data = await res.json();
  if (data.error) throw new Error(JSON.stringify(data.error));
  return data;
}

async function run() {
  const mutations = heroData.map(({ _id, pageKey, title, subtitle }) => ({
    patch: {
      id: _id,
      set: { pageKey, title, subtitle },
    },
  }));

  console.log(`총 ${mutations.length}개 문서 패치 중...`);
  const result = await mutate(mutations);
  console.log('완료:', JSON.stringify(result, null, 2));
}

run().catch(console.error);
