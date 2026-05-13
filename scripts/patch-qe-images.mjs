/**
 * quickEntryCard icon 이미지 업데이트
 * 채도 조정된 시술 카테고리 이미지를 Sanity에 반영
 */
import { createClient } from '@sanity/client';
import { createReadStream } from 'fs';

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'sk9Vbbb1TLlbUEALuo70BPZcsIcYhkMmML7wJTHuHyvqROtkqhphtTdQe6lK477WXdPm6MV8Apj7bVU4O7jeQRmKDWPwTXG8Taeceteroa7outuexceWdTYkjwjhFTRNS6TiyY2obolGq8TRHu9B1pV0Y1JyFD4oldAVRrvkgNX3sNYypeTJ',
  useCdn: false,
});

const IMG_DIR = '/Users/kay/Downloads/2_시술 카테고리 - 채도down베이지';

const MAPPING = [
  { docId: 'quick-entry-lifting',  file: '1_1. 리프팅_레이저.png' },
  { docId: 'quick-entry-petit',    file: '2-1. 쁘띠_실리프팅.png' },
  { docId: 'quick-entry-skincare', file: '3_1.스킨케어.png' },
  { docId: 'quick-entry-booster',  file: '4.1_스킨부스터.png' },
];

async function uploadImage(filePath) {
  const stream = createReadStream(filePath);
  const filename = filePath.split('/').pop();
  const asset = await client.assets.upload('image', stream, {
    filename,
    contentType: 'image/png',
  });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

async function run() {
  for (const { docId, file } of MAPPING) {
    const filePath = `${IMG_DIR}/${file}`;
    process.stdout.write(`[${docId}] 업로드 중...`);
    const icon = await uploadImage(filePath);
    await client.patch(docId).set({ icon }).commit();
    console.log(` ✓  (${asset_id(icon)})`);
  }
  console.log('\n✅ 완료');
}

function asset_id(icon) {
  return icon.asset._ref.replace('image-', '').slice(0, 16) + '...';
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
