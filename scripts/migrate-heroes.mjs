// heroContent → pageHero 마이그레이션
// 실행: node scripts/migrate-heroes.mjs

const TOKEN = process.env.SANITY_API_TOKEN;
const PROJECT = 'ecoamz42';
const DATASET = 'production';
const API = `https://${PROJECT}.api.sanity.io/v2026-04-25`;

if (!TOKEN) {
  console.error('SANITY_API_TOKEN 환경변수 필요');
  process.exit(1);
}

const PAGE_NAMES = {
  main: '메인',
  'before-after': 'Before & After',
  treatments: '시술 안내',
  brand: '브랜드',
  promotions: '프로모션',
  press: '보도자료',
  video: '영상 콘텐츠',
  blog: '블로그',
  notice: '공지사항',
  estimate: '견적',
  contact: '예약/상담',
};

async function query(groq) {
  const res = await fetch(`${API}/data/query/${DATASET}?query=${encodeURIComponent(groq)}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  const data = await res.json();
  return data.result;
}

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
  const hero = await query('*[_type == "heroContent" && _id == "forever-myeongdong-hero"][0]');
  if (!hero) {
    console.log('heroContent not found, skipping');
    return;
  }

  const mutations = [];

  // 1. Main hero
  mutations.push({
    createOrReplace: {
      _id: 'page-hero-main',
      _type: 'pageHero',
      pageName: '메인',
      title: hero.mainTitle
        ? { _type: 'localizedText', ...hero.mainTitle }
        : undefined,
      subtitle: hero.mainSubtitle,
    },
  });
  console.log('✓ page-hero-main');

  // 2. Page heroes
  if (hero.pageHeroes) {
    for (const ph of hero.pageHeroes) {
      const key = ph.pageKey;
      if (!key) continue;
      const doc = {
        _id: `page-hero-${key}`,
        _type: 'pageHero',
        pageName: PAGE_NAMES[key] || key,
        title: ph.title
          ? { _type: 'localizedText', ...ph.title }
          : undefined,
        subtitle: ph.subtitle,
      };
      if (ph.heroImage) doc.heroImage = ph.heroImage;
      mutations.push({ createOrReplace: doc });
      console.log(`✓ page-hero-${key}`);
    }
  }

  // 3. Delete old heroContent
  mutations.push({ delete: { id: 'forever-myeongdong-hero' } });
  // Also delete draft
  mutations.push({ delete: { id: 'drafts.forever-myeongdong-hero' } });
  console.log('✗ forever-myeongdong-hero (삭제)');

  await mutate(mutations);
  console.log('\n마이그레이션 완료!');
}

run().catch(console.error);
