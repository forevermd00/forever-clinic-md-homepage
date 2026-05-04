/**
 * Sanity 배너 이미지 업로드 스크립트
 * 실행: node scripts/upload-banners.mjs
 */
import { createClient } from '@sanity/client';
import { createReadStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  apiVersion: '2026-04-25',
  token:
    'sk9Vbbb1TLlbUEALuo70BPZcsIcYhkMmML7wJTHuHyvqROtkqhphtTdQe6lK477WXdPm6MV8Apj7bVU4O7jeQRmKDWPwTXG8Taeceteroa7outuexceWdTYkjwjhFTRNS6TiyY2obolGq8TRHu9B1pV0Y1JyFD4oldAVRrvkgNX3sNYypeTJ',
  useCdn: false,
});

const FLAT_DIR =
  '/Users/kay/hyperbasak/clients/forever-clinic/homepage/desinged-images/_flat';

async function uploadImage(filename) {
  const filepath = path.join(FLAT_DIR, filename);
  const ext = path.extname(filename).toLowerCase().slice(1);
  const mimeType =
    ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';

  process.stdout.write(`  업로드 중: ${filename} ... `);
  const asset = await client.assets.upload('image', createReadStream(filepath), {
    filename,
    contentType: mimeType,
  });
  console.log(`완료 (${asset._id})`);
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

async function main() {
  console.log('\n=== Sanity 배너 이미지 업로드 시작 ===\n');

  // ─── 1. 페이지 히어로 이미지 ───────────────────────────────────────────
  console.log('[1/3] 페이지 히어로 문서 생성 중...');

  const pageHeroMap = {
    'page-hero-main': 'P01_1_히어로배너_히어로배너1.png',
    'page-hero-before-after': 'P02_전후비교_히어로배너.png',
    'page-hero-treatments': 'P05_1_리프팅-배너1.png',
    'page-hero-brand': 'P09_브랜드-스토리_브랜드_히어로이미지.png',
    'page-hero-blog': 'P15_블로그_블로그_배너.png',
    'page-hero-press': 'P13_보도자료_Press_배너.png',
    'page-hero-video': 'P14_영상콘텐츠_유튜브_배너.png',
    'page-hero-contact': 'P12_오시는길_오시는길_배너.png',
    'page-hero-promotions': 'P08_이벤트-배너.png',
    // 시술 카테고리 페이지 배너
    'page-hero-category-lifting': 'P05_1_리프팅-배너1.png',
    'page-hero-category-skincare': 'P05_2_피부케어1.png',
    'page-hero-category-toning': 'P05_3_토닝색소-배너.png',
    'page-hero-category-botox-filler': 'P05_4_보톡스필러-배너.png',
  };

  // 중복 파일 업로드 방지: 파일명 → 업로드된 이미지 ref 캐시
  const uploadCache = {};

  for (const [docId, filename] of Object.entries(pageHeroMap)) {
    if (!uploadCache[filename]) {
      uploadCache[filename] = await uploadImage(filename);
    }
    const heroImage = uploadCache[filename];
    await client.createOrReplace({
      _type: 'pageHero',
      _id: docId,
      heroImage,
    });
    console.log(`  문서 생성: ${docId}`);
  }

  // ─── 2. 시술 허브 카테고리 카드 이미지 ──────────────────────────────────
  console.log('\n[2/3] 시술 카테고리 썸네일 문서 생성 중...');

  const categoryThumbMap = {
    'page-hero-category-thumb-lifting': 'P04_1_리프팅1.png',
    'page-hero-category-thumb-skincare': 'P04_2_피부케어1.png',
    'page-hero-category-thumb-toning': 'P04_3_토닝색소.png',
    'page-hero-category-thumb-botox-filler': 'P04_4_보톡스필러.jpg',
  };

  for (const [docId, filename] of Object.entries(categoryThumbMap)) {
    if (!uploadCache[filename]) {
      uploadCache[filename] = await uploadImage(filename);
    }
    const heroImage = uploadCache[filename];
    await client.createOrReplace({
      _type: 'pageHero',
      _id: docId,
      heroImage,
    });
    console.log(`  문서 생성: ${docId}`);
  }

  // ─── 3. 브랜드 철학 이미지 ───────────────────────────────────────────────
  console.log('\n[3/3] 브랜드 철학 문서 생성 중...');

  const philosophyFileMap = {
    honesty: 'P09_브랜드-스토리_브랜드-철학_1_정직.png',
    precision: 'P09_브랜드-스토리_브랜드-철학_2_정교.png',
    expertise: 'P09_브랜드-스토리_브랜드-철학_3_전문.png',
    dignity: 'P09_브랜드-스토리_브랜드-철학_4_존엄.png',
  };

  const philosophyImages = {};
  for (const [key, filename] of Object.entries(philosophyFileMap)) {
    if (!uploadCache[filename]) {
      uploadCache[filename] = await uploadImage(filename);
    }
    philosophyImages[key] = uploadCache[filename];
  }

  await client.createOrReplace({
    _type: 'brandPhilosophy',
    _id: 'brand-philosophy',
    values: [
      {
        _type: 'object',
        _key: 'honesty',
        titleKo: '정직',
        titleEn: 'Honesty',
        description: { ko: '', en: '', zh: '', ja: '' },
        backgroundImage: philosophyImages.honesty,
      },
      {
        _type: 'object',
        _key: 'precision',
        titleKo: '정교',
        titleEn: 'Precision',
        description: { ko: '', en: '', zh: '', ja: '' },
        backgroundImage: philosophyImages.precision,
      },
      {
        _type: 'object',
        _key: 'expertise',
        titleKo: '전문',
        titleEn: 'Expertise',
        description: { ko: '', en: '', zh: '', ja: '' },
        backgroundImage: philosophyImages.expertise,
      },
      {
        _type: 'object',
        _key: 'dignity',
        titleKo: '존엄',
        titleEn: 'Dignity',
        description: { ko: '', en: '', zh: '', ja: '' },
        backgroundImage: philosophyImages.dignity,
      },
    ],
  });
  console.log('  문서 생성: brand-philosophy');

  console.log('\n=== 완료! 모든 이미지 업로드 및 문서 생성 완료 ===\n');
}

main().catch((err) => {
  console.error('오류 발생:', err);
  process.exit(1);
});
