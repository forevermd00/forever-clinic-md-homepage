/**
 * 인테리어 이미지 업로드 스크립트
 * - 메인/브랜드 히어로 배경 업데이트
 * - 시설 안내(facility) 문서 생성
 *
 * 실행: node scripts/upload-interior.mjs
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

const IMG_DIR =
  '/Users/kay/hyperbasak/clients/forever-clinic/homepage/images/interior';

async function uploadImage(filename) {
  const filepath = path.join(IMG_DIR, filename);
  process.stdout.write(`  업로드: ${filename} ... `);
  const asset = await client.assets.upload('image', createReadStream(filepath), {
    filename,
    contentType: 'image/jpeg',
  });
  console.log(`완료 (${asset._id})`);
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

// ─── 시설 안내 문서 정의 ────────────────────────────────────────────────────
const FACILITIES = [
  {
    _id: 'facility-reception',
    filename: 'forever-clinic-reception-front-01.jpg',
    sortOrder: 1,
    name: { ko: '리셉션', en: 'Reception', zh: '前台', ja: 'レセプション' },
    description: {
      ko: '원형 리셉션 데스크와 시그니처 조명이 맞이하는 첫 인상',
      en: 'A curved reception desk and signature lighting create the first impression',
      zh: '弧形接待台与标志性灯光打造第一印象',
      ja: '円形レセプションデスクとシグネチャー照明が迎える第一印象',
    },
  },
  {
    _id: 'facility-lounge',
    filename: 'forever-clinic-reception-lounge-overview-01.jpg',
    sortOrder: 2,
    name: { ko: '라운지', en: 'Lounge', zh: '休息室', ja: 'ラウンジ' },
    description: {
      ko: '프라이빗하고 조용한 대기 공간',
      en: 'A private and serene waiting area',
      zh: '私密宁静的等候区',
      ja: 'プライベートで静かな待合スペース',
    },
  },
  {
    _id: 'facility-garden',
    filename: 'forever-clinic-garden-staircase-overview-01.jpg',
    sortOrder: 3,
    name: { ko: '가든 & 계단', en: 'Garden & Staircase', zh: '花园与楼梯', ja: 'ガーデン＆階段' },
    description: {
      ko: '계단 아래 자연석 가든과 유리 난간이 어우러진 공간',
      en: 'A natural stone garden beneath the glass staircase',
      zh: '玻璃楼梯下方的天然石花园',
      ja: 'ガラス階段の下に広がる自然石ガーデン',
    },
  },
  {
    _id: 'facility-consultation',
    filename: 'forever-clinic-consultation-rooms-01.jpg',
    sortOrder: 4,
    name: { ko: '1:1 상담실', en: 'Private Consultation', zh: '私人咨询室', ja: '個室カウンセリング' },
    description: {
      ko: '의사가 직접 참여하는 독립된 1:1 상담 공간',
      en: 'Private rooms for doctor-led one-on-one consultations',
      zh: '医生亲自参与的独立一对一咨询空间',
      ja: '医師が直接参加する独立した1対1カウンセリング空間',
    },
  },
  {
    _id: 'facility-art-wall',
    filename: 'forever-clinic-entrance-art-wall-01.jpg',
    sortOrder: 5,
    name: { ko: '시그니처 아트월', en: 'Signature Art Wall', zh: '标志性艺术墙', ja: 'シグネチャーアートウォール' },
    description: {
      ko: '링 조명과 세로 바가 만들어내는 포에버 시그니처 공간',
      en: "Ring lights and vertical bars form Forever's signature centerpiece",
      zh: '环形灯与竖条组成的波弗标志性空间',
      ja: 'リングライトと縦バーが作り出すフォーエバーのシグネチャー空間',
    },
  },
  {
    _id: 'facility-powder-room',
    filename: 'forever-clinic-powder-room-vanity-01.jpg',
    sortOrder: 6,
    name: { ko: '파우더룸', en: 'Powder Room', zh: '化妆室', ja: 'パウダールーム' },
    description: {
      ko: '대리석 세면대와 백라이트 거울이 갖춰진 시술 후 마무리 공간',
      en: 'Marble vanity and backlit mirrors for post-treatment touch-ups',
      zh: '大理石梳妆台与背光镜子构成的护理后整理空间',
      ja: '大理石洗面台とバックライトミラーが整った施術後のフィニッシュ空間',
    },
  },
  {
    _id: 'facility-treatment-corridor',
    filename: 'forever-clinic-treatment-corridor-01.jpg',
    sortOrder: 7,
    name: { ko: '시술실 복도', en: 'Treatment Corridor', zh: '治疗走廊', ja: '施術室廊下' },
    description: {
      ko: '간접 조명과 벤치가 놓인 프라이빗 시술실 복도',
      en: 'A private corridor with ambient lighting and bench seating',
      zh: '设有间接照明和座椅的私密施术走廊',
      ja: '間接照明とベンチが配された完全プライベートな施術室廊下',
    },
  },
  {
    _id: 'facility-treatment-room',
    filename: 'forever-clinic-treatment-room-01.jpg',
    sortOrder: 8,
    name: { ko: '시술실', en: 'Treatment Room', zh: '治疗室', ja: '施術室' },
    description: {
      ko: '독립 공간에서 진행되는 1:1 프라이빗 시술 환경',
      en: 'A completely private one-on-one treatment environment',
      zh: '在独立空间进行的一对一私密护理环境',
      ja: '完全独立した空間での1対1プライベート施術環境',
    },
  },
  {
    _id: 'facility-vip-lounge',
    filename: 'forever-clinic-2f-vip-lounge-01.jpg',
    sortOrder: 9,
    name: { ko: 'VIP 라운지', en: 'VIP Lounge', zh: 'VIP 休息室', ja: 'VIPラウンジ' },
    description: {
      ko: '2층 전용 라운지. 완전한 프라이버시와 편안한 휴식 제공',
      en: 'An exclusive 2F lounge for complete privacy and relaxation',
      zh: '二楼专属休息室，提供完全私密与舒适休闲',
      ja: '2階専用ラウンジ。完全なプライバシーと快適なくつろぎを提供',
    },
  },
  {
    _id: 'facility-facade',
    filename: 'forever-clinic-facade-storefront-01.jpg',
    sortOrder: 10,
    name: { ko: '외관', en: 'Exterior', zh: '外观', ja: 'エクステリア' },
    description: {
      ko: '명동 중심부의 투명 파사드. FOREVER 브랜드가 빛나는 입구',
      en: 'A transparent facade in central Myeongdong, where FOREVER shines',
      zh: '明洞中心区的透明外立面，FOREVER品牌熠熠生辉',
      ja: '明洞中心部のガラスファサード。FOREVERブランドが輝くエントランス',
    },
  },
];

async function main() {
  console.log('\n=== 포에버 클리닉 인테리어 이미지 업로드 ===\n');

  // ─── 1. 히어로 배경 업데이트 ────────────────────────────────────────────
  console.log('[1/2] 히어로 배경 이미지 업데이트...\n');

  const heroImages = {
    'page-hero-main':  'forever-clinic-reception-front-01.jpg',
    'page-hero-brand': 'forever-clinic-facade-storefront-01.jpg',
  };

  const heroCache = {};
  for (const [docId, filename] of Object.entries(heroImages)) {
    if (!heroCache[filename]) {
      heroCache[filename] = await uploadImage(filename);
    }
    await client
      .patch(docId)
      .set({ heroImage: heroCache[filename] })
      .commit();
    console.log(`  히어로 패치: ${docId}\n`);
  }

  // ─── 2. 시설 안내 문서 생성 ─────────────────────────────────────────────
  console.log('[2/2] 시설 안내(facility) 문서 생성...\n');

  const imgCache = {};
  for (const facility of FACILITIES) {
    if (!imgCache[facility.filename]) {
      imgCache[facility.filename] = await uploadImage(facility.filename);
    }
    await client.createOrReplace({
      _type: 'facility',
      _id: facility._id,
      name: facility.name,
      image: imgCache[facility.filename],
      description: facility.description,
      sortOrder: facility.sortOrder,
    });
    console.log(`  문서 생성: ${facility._id} (${facility.name.ko})\n`);
  }

  console.log('=== 완료! ===\n');
}

main().catch((err) => {
  console.error('\n오류:', err.message);
  process.exit(1);
});
