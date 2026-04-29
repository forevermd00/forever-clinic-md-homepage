// blogPost.content: localizedText → localizedBlockContent 마이그레이션
// 실행: SANITY_API_TOKEN=... node scripts/migrate-blog-content.mjs

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2026-04-25',
  useCdn: false,
});

function textToBlocks(text) {
  if (!text) return [];
  return text.split('\n').filter(Boolean).map((line) => ({
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).slice(2, 10),
        text: line,
        marks: [],
      },
    ],
  }));
}

async function main() {
  const posts = await client.fetch('*[_type == "blogPost"]{_id, content}');
  console.log(`블로그 ${posts.length}건 마이그레이션 시작`);

  for (const post of posts) {
    const content = post.content;
    if (!content) continue;

    // 이미 배열이면 스킵 (이미 block content)
    if (Array.isArray(content.ko)) {
      console.log(`  ${post._id}: 이미 변환됨, 스킵`);
      continue;
    }

    const patch = {
      content: {
        _type: 'localizedBlockContent',
        ko: textToBlocks(content.ko),
        en: textToBlocks(content.en),
        zh: textToBlocks(content.zh),
        ja: textToBlocks(content.ja),
      },
    };

    await client.patch(post._id).set(patch).commit();
    console.log(`  ${post._id}: 변환 완료`);
  }

  console.log('마이그레이션 완료');
}

main().catch(console.error);
