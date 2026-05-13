import { createClient } from '@sanity/client';
import { createReadStream } from 'fs';

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'sk9Vbbb1TLlbUEALuo70BPZcsIcYhkMmML7wJTHuHyvqROtkqhphtTdQe6lK477WXdPm6MV8Apj7bVU4O7jeQRmKDWPwTXG8Taeceteroa7outuexceWdTYkjwjhFTRNS6TiyY2obolGq8TRHu9B1pV0Y1JyFD4oldAVRrvkgNX3sNYypeTJ',
  useCdn: false,
});

const PUBLIC = '/Users/kay/workspace/forever-clinic-web/public/images/home';

const MAPPING = [
  { docId: 'quick-entry-wrinkle',  file: 'qe-concern-wrinkle.png' },
  { docId: 'quick-entry-pigment',  file: 'qe-concern-pigment.png' },
  { docId: 'quick-entry-pore',     file: 'qe-concern-pore.png' },
  { docId: 'quick-entry-volume',   file: 'qe-concern-volume.png' },
  { docId: 'quick-entry-first',    file: 'qe-situation-first.png' },
  { docId: 'quick-entry-quick',    file: 'qe-situation-quick.png' },
  { docId: 'quick-entry-regular',  file: 'qe-situation-regular.png' },
  { docId: 'quick-entry-special',  file: 'qe-situation-special.png' },
];

async function run() {
  for (const { docId, file } of MAPPING) {
    const filePath = `${PUBLIC}/${file}`;
    process.stdout.write(`[${docId}] 업로드 중...`);
    const asset = await client.assets.upload('image', createReadStream(filePath), {
      filename: file,
      contentType: 'image/png',
    });
    const icon = { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
    await client.patch(docId).set({ icon }).commit();
    console.log(` ✓`);
  }
  console.log('\n✅ 완료');
}

run().catch(e => { console.error('❌', e.message); process.exit(1); });
