// BnA 카테고리 마이그레이션: 구버전 슬러그 → 현행 슬러그
// 실행: node scripts/migrate-bna-categories.mjs

import { createClient } from '@sanity/client';

const CATEGORY_MAP = {
  lifting: 'lifting-laser',
  toning: 'skincare',
  'botox-filler': 'petit-lifting',
  skincare: 'skincare', // 슬러그 동일, 그대로 유지
};

const VALID_SLUGS = new Set([
  'lifting-laser',
  'petit-lifting',
  'skincare',
  'skin-booster',
  'hair-removal',
  'anesthesia',
]);

const client = createClient({
  projectId: 'ecoamz42',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2026-05-13',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

async function migrate() {
  const docs = await client.fetch(
    `*[_type == "baCase" && defined(categories)] { _id, categories }`,
  );

  console.log(`총 ${docs.length}개 baCase 문서 확인`);

  let updated = 0;
  for (const doc of docs) {
    const original = doc.categories || [];

    const migrated = [
      ...new Set(
        original
          .map((c) => CATEGORY_MAP[c] ?? c)
          .filter((c) => VALID_SLUGS.has(c)),
      ),
    ];

    const changed =
      JSON.stringify([...original].sort()) !==
      JSON.stringify([...migrated].sort());

    if (changed) {
      console.log(`${doc._id}: ${JSON.stringify(original)} → ${JSON.stringify(migrated)}`);
      await client.patch(doc._id).set({ categories: migrated }).commit();
      updated++;
    }
  }

  console.log(`\n완료: ${updated}개 문서 업데이트`);
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
