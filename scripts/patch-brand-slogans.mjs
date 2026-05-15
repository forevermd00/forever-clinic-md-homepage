import { createClient } from '@sanity/client';

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  apiVersion: '2026-05-14',
  token: 'sk9Vbbb1TLlbUEALuo70BPZcsIcYhkMmML7wJTHuHyvqROtkqhphtTdQe6lK477WXdPm6MV8Apj7bVU4O7jeQRmKDWPwTXG8Taeceteroa7outuexceWdTYkjwjhFTRNS6TiyY2obolGq8TRHu9B1pV0Y1JyFD4oldAVRrvkgNX3sNYypeTJ',
  useCdn: false,
});

// 메인 슬로건 (h2 텍스트)
const SLOGAN = {
  _type: 'localizedString',
  ko: '시술의 디테일이 결과의 차이를 만듭니다.',
  en: 'The Detail in Treatment Makes All the Difference.',
  zh: '施术细节，成就卓越效果。',
  ja: '施術の細部が、結果の差を生み出します。',
};

// 서브 슬로건 (h2 아래 텍스트)
const SUBTITLE = {
  _type: 'localizedString',
  ko: 'Precision. Science. Perfection.',
  en: 'Precision. Science. Perfection.',
  zh: 'Precision. Science. Perfection.',
  ja: 'Precision. Science. Perfection.',
};

async function main() {
  console.log('패치 중...');
  await client
    .patch('forever-myeongdong-brand')
    .set({ slogan: SLOGAN, subtitle: SUBTITLE })
    .commit();

  console.log('\n완료!');
  console.log('메인 슬로건:');
  Object.entries(SLOGAN).filter(([k]) => k !== '_type').forEach(([k, v]) => console.log(`  ${k}: ${v}`));
  console.log('서브 슬로건:');
  Object.entries(SUBTITLE).filter(([k]) => k !== '_type').forEach(([k, v]) => console.log(`  ${k}: ${v}`));
}

main().catch(console.error);
