// 메신저 아이콘 SVG를 Sanity에 업로드하고 messengerLinks logo에 연결
// 실행: node scripts/upload-messenger-icons.mjs

import { createClient } from '@sanity/client';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const TOKEN = process.env.SANITY_API_TOKEN;
const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';

const client = createClient({
  projectId: 'ecoamz42',
  dataset: DATASET,
  apiVersion: '2026-05-13',
  token: TOKEN,
  useCdn: false,
});

const ICONS = [
  { key: 'messenger-kakao',    platform: 'kakaotalk', file: 'kakaotalk.svg' },
  { key: 'messenger-line',     platform: 'line',       file: 'line.svg'      },
  { key: 'messenger-wechat',   platform: 'wechat',     file: 'wechat.svg'    },
  { key: 'messenger-whatsapp', platform: 'whatsapp',   file: 'whatsapp.svg'  },
];

async function run() {
  const iconDir = resolve(__dirname, '../public/images/icons');

  // 1. 기존 messengerLinks 조회
  const info = await client.fetch(
    `*[_type == "clinicInfo"][0]{ _id, messengerLinks[] { _key, platform, url, label, isVisible, sortKo, sortEn, sortZh, sortJa } }`
  );
  if (!info) throw new Error('clinicInfo 문서를 찾을 수 없습니다');

  const existing = info.messengerLinks ?? [];

  // 2. 아이콘별로 Sanity에 업로드 → asset ref 획득
  const updated = await Promise.all(
    existing.map(async (link) => {
      const icon = ICONS.find((i) => i.key === link._key || i.platform === link.platform);
      if (!icon) return link;

      const filePath = resolve(iconDir, icon.file);
      const buffer = readFileSync(filePath);

      console.log(`Uploading ${icon.file}...`);
      const asset = await client.assets.upload('image', buffer, {
        filename: icon.file,
        contentType: 'image/svg+xml',
      });

      console.log(`  → asset._id: ${asset._id}`);
      return {
        ...link,
        logo: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        },
      };
    })
  );

  // 3. clinicInfo patch
  await client
    .patch(info._id)
    .set({ messengerLinks: updated })
    .commit();

  console.log('\n완료: messengerLinks logo 연결됨');
}

run().catch((e) => { console.error(e); process.exit(1); });
