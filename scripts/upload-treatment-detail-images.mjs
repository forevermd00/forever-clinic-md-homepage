/**
 * 시술 상세페이지 '이미지 모드' 시안 업로드 (명동, 한국어 ko)
 * - 11개 PNG를 각 시술의 detailImagesLocalized.ko 에 주입
 * - 해당 시술의 detailDisplayMode = 'image' 로 전환
 * - 영어/중국어/일본어는 추후 Sanity Studio에서 언어별 탭에 추가
 *
 * 실행: node scripts/upload-treatment-detail-images.mjs
 */
import { createClient } from '@sanity/client';
import { createReadStream, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// .env.local 에서 write 토큰 로드
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envText = readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
const tokenLine = envText
  .split('\n')
  .find((l) => l.startsWith('SANITY_API_TOKEN='));
const token = tokenLine?.slice('SANITY_API_TOKEN='.length).trim().replace(/^["']|["']$/g, '');

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  apiVersion: '2026-04-25',
  token,
  useCdn: false,
});

const DIR = '/Users/kay/Downloads/20260525_명동포에버의원_11페이지_시안 2';

// 파일명 → 시술 문서 _id
const MAP = [
  ['20260525_명동포에버의원_LDM.png', 'treatment-ldm'],
  ['20260525_명동포에버의원_고우리.png', 'treatment-gouri'],
  ['20260525_명동포에버의원_리쥬란.png', 'treatment-rejuran'],
  ['20260525_명동포에버의원_수면마취.png', 'treatment-sedation'],
  ['20260525_명동포에버의원_실리프팅.png', 'treatment-sili-lifting'],
  ['20260525_명동포에버의원_써마지FLX.png', 'treatment-thermage'],
  ['20260525_명동포에버의원_온다 ONDA.png', 'treatment-onda'],
  ['20260525_명동포에버의원_울쎄라피프라임.png', 'treatment-ulthera'],
  ['20260525_명동포에버의원_젠틀맥스프로플러스.png', 'treatment-gentlemax-pro-plus'],
  ['20260525_명동포에버의원_티타늄 리프팅.png', 'treatment-titan'],
  ['20260525_명동포에버의원_필러.png', 'treatment-filler'],
];

async function uploadImage(filename) {
  const filepath = path.join(DIR, filename);
  process.stdout.write(`  업로드: ${filename} ... `);
  const asset = await client.assets.upload(
    'image',
    createReadStream(filepath),
    { filename, contentType: 'image/png' },
  );
  console.log(`완료 (${asset._id})`);
  return {
    _type: 'image',
    _key: 'ko-0',
    asset: { _type: 'reference', _ref: asset._id },
  };
}

async function main() {
  console.log('\n=== 시술 상세 이미지(ko) 업로드 + 이미지 모드 전환 ===\n');

  for (const [filename, docId] of MAP) {
    // 문서 존재 확인
    const doc = await client.getDocument(docId);
    if (!doc) {
      console.log(`  ⚠ 문서 없음: ${docId} — 건너뜀\n`);
      continue;
    }
    const imageRef = await uploadImage(filename);
    await client
      .patch(docId)
      .setIfMissing({ detailImagesLocalized: {} })
      .set({
        'detailImagesLocalized.ko': [imageRef],
        detailDisplayMode: 'image',
      })
      .commit();
    console.log(`  패치 완료: ${docId} (${doc.name?.ko ?? ''}) → image 모드\n`);
  }

  console.log('=== 완료! ===\n');
}

main().catch((err) => {
  console.error('\n오류:', err.message);
  process.exit(1);
});
