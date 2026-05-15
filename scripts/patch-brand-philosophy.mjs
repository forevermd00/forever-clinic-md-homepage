import { createClient } from '@sanity/client';
import { createReadStream, statSync } from 'fs';
import path from 'path';

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  apiVersion: '2026-05-14',
  token: 'sk9Vbbb1TLlbUEALuo70BPZcsIcYhkMmML7wJTHuHyvqROtkqhphtTdQe6lK477WXdPm6MV8Apj7bVU4O7jeQRmKDWPwTXG8Taeceteroa7outuexceWdTYkjwjhFTRNS6TiyY2obolGq8TRHu9B1pV0Y1JyFD4oldAVRrvkgNX3sNYypeTJ',
  useCdn: false,
});

const IMAGE_DIR = '/Users/kay/hyperbasak/clients/forever-clinic/homepage/images/desinged-images/P09_브랜드 스토리/브랜드 철학';

const VALUES = [
  {
    imagePath: path.join(IMAGE_DIR, '1_정직.png'),
    title: { ko: '정직', en: 'Honesty', zh: '诚实', ja: '誠実' },
  },
  {
    imagePath: path.join(IMAGE_DIR, '2_정교.png'),
    title: { ko: '정교', en: 'Precision', zh: '精巧', ja: '精巧' },
  },
  {
    imagePath: path.join(IMAGE_DIR, '3_전문.png'),
    title: { ko: '전문', en: 'Expertise', zh: '专业', ja: '専門' },
  },
  {
    imagePath: path.join(IMAGE_DIR, '4_존엄.png'),
    title: { ko: '존엄', en: 'Dignity', zh: '尊严', ja: '尊厳' },
  },
];

const SLOGAN = {
  ko: '시술의 디테일이 결과의 차이를 만듭니다.',
  en: 'Precision. Science. Perfection.',
  zh: '施术细节，决定治疗成效。',
  ja: '施術のディテールが、結果の差を生み出します。',
};

async function uploadImage(filePath) {
  console.log(`  업로드 중: ${path.basename(filePath)}`);
  const stream = createReadStream(filePath);
  const asset = await client.assets.upload('image', stream, {
    filename: path.basename(filePath),
  });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

async function main() {
  // 1. 현재 문서 가져오기
  const doc = await client.fetch(
    `*[_type == "brandPhilosophy" && _id == "forever-myeongdong-brand"][0]{ _id, values[] { _key, title, description } }`,
  );

  if (!doc) {
    console.error('문서를 찾을 수 없습니다: forever-myeongdong-brand');
    process.exit(1);
  }

  console.log(`현재 values 수: ${doc.values?.length ?? 0}`);

  // 2. 이미지 업로드
  console.log('\n이미지 업로드 시작...');
  const imageRefs = [];
  for (const v of VALUES) {
    const ref = await uploadImage(v.imagePath);
    imageRefs.push(ref);
  }

  // 3. values 배열 구성 (기존 _key 유지, description 유지)
  const existingValues = doc.values ?? [];
  const newValues = VALUES.map((v, i) => {
    const existing = existingValues[i] ?? {};
    return {
      _type: 'object',
      _key: existing._key || Math.random().toString(36).slice(2, 10),
      title: { _type: 'localizedString', ...v.title },
      description: existing.description ?? {},
      image: imageRefs[i],
    };
  });

  // 4. 패치
  console.log('\nSanity 패치 중...');
  await client
    .patch('forever-myeongdong-brand')
    .set({
      slogan: { _type: 'localizedString', ...SLOGAN },
      values: newValues,
    })
    .commit();

  console.log('\n완료!');
  console.log('슬로건 설정됨:', SLOGAN.ko);
  console.log('가치 항목 설정됨:');
  newValues.forEach((v, i) => {
    console.log(`  ${i + 1}. ${v.title.ko} / ${v.title.en}`);
  });
}

main().catch(console.error);
