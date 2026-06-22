// 블로그 category(string)·thumbnail(단일 image)을 다국어(localizedString·localizedImage)로 변환
// 기존 값은 한국어(ko)로 승계. 실행: node scripts/migrate-blog-localized-fields.mjs

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ecoamz42',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-05-13',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function needsCategoryMigration(category) {
  return typeof category === 'string';
}

// 구버전 단일 이미지: { _type:'image', asset:{...} } (ko/en/zh/ja 키 없음)
function needsThumbnailMigration(thumbnail) {
  if (!thumbnail || typeof thumbnail !== 'object') return false;
  const hasLocale = ['ko', 'en', 'zh', 'ja'].some((k) => thumbnail[k]);
  return !hasLocale && !!thumbnail.asset;
}

async function migrate() {
  const docs = await client.fetch(
    `*[_type == "blogPost"]{ _id, category, thumbnail }`,
  );
  console.log(`총 ${docs.length}개 blogPost 확인`);

  let updated = 0;
  for (const doc of docs) {
    const set = {};
    const unset = [];

    if (needsCategoryMigration(doc.category)) {
      set.category = { ko: doc.category };
    }
    if (needsThumbnailMigration(doc.thumbnail)) {
      set.thumbnail = {
        ko: { _type: 'image', asset: doc.thumbnail.asset },
      };
    }

    if (Object.keys(set).length === 0) continue;

    await client.patch(doc._id).set(set).commit();
    if (unset.length) await client.patch(doc._id).unset(unset).commit();
    updated++;
    console.log(`✓ ${doc._id} 변환:`, Object.keys(set).join(', '));
  }

  console.log(`\n완료: ${updated}개 문서 변환`);
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
