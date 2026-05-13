/**
 * 장비 이미지 업로드 스크립트
 * - equipment 문서 생성 (소프라노티타늄, 루카스토닝, 악센토N)
 * - treatment 문서 이미지 주입 (루카스토닝, 악센토)
 *
 * 실행: node scripts/upload-machines.mjs
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

const MACHINES_DIR =
  '/Users/kay/hyperbasak/clients/forever-clinic/homepage/images/machines';

const cache = {};

async function uploadImage(folder, filename) {
  const key = `${folder}/${filename}`;
  if (cache[key]) return cache[key];

  const filepath = path.join(MACHINES_DIR, folder, filename);
  const ext = path.extname(filename).toLowerCase();
  const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

  process.stdout.write(`  업로드: ${filename} ... `);
  const asset = await client.assets.upload('image', createReadStream(filepath), {
    filename,
    contentType,
  });
  console.log(`완료 (${asset._id})`);

  const ref = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
  cache[key] = ref;
  return ref;
}

function arrayMember(imageRef, idx) {
  return { ...imageRef, _key: `img-${idx}` };
}

// ─── 장비 정의 ────────────────────────────────────────────────────────────────
const EQUIPMENT = [
  {
    _id: 'equipment-soprano-titanium',
    folder: 'soprano-titanium',
    thumbnailFile: 'soprano-titanium_banner-device.png',
    sortOrder: 10,
    name: {
      ko: '소프라노 티타늄',
      en: 'Soprano Titanium',
      zh: '索普拉诺钛激光',
      ja: 'ソプラノ チタニウム',
    },
    manufacturer: 'Alma Lasers',
  },
  {
    _id: 'equipment-lucas-toning',
    folder: 'lucas-toning',
    thumbnailFile: 'lucas-toning_01.jpg',
    sortOrder: 11,
    name: {
      ko: '루카스 토닝',
      en: 'Lucas Toning',
      zh: '卢卡斯调Q',
      ja: 'ルーカス トーニング',
    },
    manufacturer: 'Lutronic',
  },
  {
    _id: 'equipment-accento-n',
    folder: 'accento-n',
    thumbnailFile: 'accento-n_product-01.jpg',
    sortOrder: 12,
    name: {
      ko: '악센토 N',
      en: 'Accento N',
      zh: 'Accento N',
      ja: 'アクセント N',
    },
    manufacturer: 'DEKA',
  },
];

// ─── treatment-lucas-toning 상세 이미지 ───────────────────────────────────────
const LUCAS_DETAIL_IMAGES = [
  'lucas-toning_01.jpg',
  'lucas-toning_02.jpg',
  'lucas-toning_03.jpg',
  'lucas-toning_04.jpg',
  'lucas-toning_05.jpg',
  'lucas-toning_06.jpg',
  'lucas-toning_07.jpg',
  'lucas-toning_08.jpg',
  'lucas-toning_09.jpg',
  'lucas-toning_10.jpg',
  'lucas-toning_mla-01.jpg',
  'lucas-toning_mla-02.jpg',
  'lucas-toning_promo-01.png',
  'lucas-toning_promo-02.png',
  'lucas-toning_promo-03.png',
  'lucas-toning_promo-04.png',
  'lucas-toning_promo-05.png',
  'lucas-toning_promo-06.png',
];

// ─── treatment-accento 상세 이미지 ────────────────────────────────────────────
const ACCENTO_DETAIL_IMAGES = [
  'accento-n_product-01.jpg',
  'accento-n_product-02.jpg',
  'accento-n_product-03.jpg',
  'accento-n_front-clean.png',
  'accento-n_front-perspective.png',
  'accento-n_front-left.png',
  'accento-n_front-left-angle.png',
  'accento-n_right-angle.jpg',
  'accento-n_side-right.png',
  'accento-n_side-left.png',
  'accento-n_handpiece.png',
  'accento-n_intro-cutout.png',
];

async function main() {
  console.log('\n=== 포에버 클리닉 장비 이미지 업로드 ===\n');

  // ─── 1. equipment 문서 생성 ─────────────────────────────────────────────────
  console.log('[1/3] equipment 문서 생성...\n');

  for (const eq of EQUIPMENT) {
    const imageRef = await uploadImage(eq.folder, eq.thumbnailFile);
    await client.createOrReplace({
      _type: 'equipment',
      _id: eq._id,
      name: eq.name,
      image: imageRef,
      manufacturer: eq.manufacturer,
      sortOrder: eq.sortOrder,
    });
    console.log(`  문서 생성: ${eq._id} (${eq.name.ko})\n`);
  }

  // ─── 2. treatment-lucas-toning 이미지 주입 ──────────────────────────────────
  console.log('[2/3] treatment-lucas-toning 이미지 주입...\n');

  const lucasThumbnail = await uploadImage('lucas-toning', 'lucas-toning_01.jpg');
  const lucasDetailRefs = [];
  for (let i = 0; i < LUCAS_DETAIL_IMAGES.length; i++) {
    const ref = await uploadImage('lucas-toning', LUCAS_DETAIL_IMAGES[i]);
    lucasDetailRefs.push(arrayMember(ref, i));
  }

  await client
    .patch('treatment-lucas-toning')
    .set({ thumbnail: lucasThumbnail, detailImages: lucasDetailRefs })
    .commit();
  console.log('  treatment-lucas-toning 패치 완료\n');

  // ─── 3. treatment-accento 이미지 주입 ───────────────────────────────────────
  console.log('[3/3] treatment-accento 이미지 주입...\n');

  const accentoThumbnail = await uploadImage('accento-n', 'accento-n_product-01.jpg');
  const accentoDetailRefs = [];
  for (let i = 0; i < ACCENTO_DETAIL_IMAGES.length; i++) {
    const ref = await uploadImage('accento-n', ACCENTO_DETAIL_IMAGES[i]);
    accentoDetailRefs.push(arrayMember(ref, i));
  }

  await client
    .patch('treatment-accento')
    .set({ thumbnail: accentoThumbnail, detailImages: accentoDetailRefs })
    .commit();
  console.log('  treatment-accento 패치 완료\n');

  console.log('=== 완료! ===\n');
}

main().catch((err) => {
  console.error('\n오류:', err.message);
  process.exit(1);
});
