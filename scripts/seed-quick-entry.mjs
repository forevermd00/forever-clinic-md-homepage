/**
 * Quick Entry Card Sanity 시드 스크립트
 * 실행: node scripts/seed-quick-entry.mjs
 */

import { createClient } from '@sanity/client';
import { createReadStream } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const client = createClient({
  projectId: 'ecoamz42',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: 'sk9Vbbb1TLlbUEALuo70BPZcsIcYhkMmML7wJTHuHyvqROtkqhphtTdQe6lK477WXdPm6MV8Apj7bVU4O7jeQRmKDWPwTXG8Taeceteroa7outuexceWdTYkjwjhFTRNS6TiyY2obolGq8TRHu9B1pV0Y1JyFD4oldAVRrvkgNX3sNYypeTJ',
  useCdn: false,
});

async function uploadImage(relPath) {
  const absPath = resolve(ROOT, 'public', relPath.replace(/^\//, ''));
  const stream = createReadStream(absPath);
  const ext = absPath.split('.').pop();
  const asset = await client.assets.upload('image', stream, {
    filename: absPath.split('/').pop(),
    contentType: ext === 'jpg' ? 'image/jpeg' : 'image/png',
  });
  return { _type: 'image', asset: { _type: 'reference', _ref: asset._id } };
}

const CARDS = [
  // ── 시술로 찾기 ──────────────────────────────────────────
  {
    _id: 'quick-entry-lifting',
    tab: 'treatment',
    title: { ko: '리프팅·레이저', en: 'Lifting & Laser', zh: '提升·激光', ja: 'リフティング·レーザー' },
    description: { ko: '울쎄라·써마지·HIFU 탄력 리프팅', en: 'Ultherapy · Thermage · HIFU lifting', zh: '超声波·热玛吉·HIFU提升', ja: '超音波·サーマージ·HIFUリフト' },
    localImage: '/images/home/qe-lifting.png',
    linkUrl: '/treatments?cat=lifting-laser',
    sortOrder: 1,
  },
  {
    _id: 'quick-entry-petit',
    tab: 'treatment',
    title: { ko: '쁘띠 & 실리프팅', en: 'Petit & Thread Lift', zh: '微整形·线提升', ja: 'プチ·スレッドリフト' },
    description: { ko: '보톡스·필러·실 리프팅', en: 'Botox · Filler · Thread lifting', zh: '肉毒素·玻尿酸·线提升', ja: 'ボトックス·フィラー·糸リフト' },
    localImage: '/images/home/qe-botox.jpg',
    linkUrl: '/treatments?cat=petit-lifting',
    sortOrder: 2,
  },
  {
    _id: 'quick-entry-skincare',
    tab: 'treatment',
    title: { ko: '스킨케어', en: 'Skincare', zh: '皮肤管理', ja: 'スキンケア' },
    description: { ko: '하이드로페이셜·아쿠아필 피부 관리', en: 'HydraFacial · Aquapeel skincare', zh: '水光针·水氧焕肤护理', ja: 'ハイドロフェイシャル·ケア' },
    localImage: '/images/home/qe-skincare.png',
    linkUrl: '/treatments?cat=skincare',
    sortOrder: 3,
  },
  {
    _id: 'quick-entry-booster',
    tab: 'treatment',
    title: { ko: '스킨부스터', en: 'Skin Booster', zh: '皮肤补水针', ja: 'スキンブースター' },
    description: { ko: '고우리·스컬트라 콜라겐 부스터', en: 'GOURI · Sculptra collagen booster', zh: 'GOURI·塑然雅胶原蛋白针', ja: 'GOURI·スカルプトラコラーゲン' },
    localImage: '/images/home/qe-toning.png',
    linkUrl: '/treatments?cat=skin-booster',
    sortOrder: 4,
  },

  // ── 고민으로 찾기 ─────────────────────────────────────────
  {
    _id: 'quick-entry-wrinkle',
    tab: 'concern',
    title: { ko: '주름·탄력', en: 'Wrinkle & Firmness', zh: '皱纹·弹力', ja: 'シワ·弾力' },
    description: { ko: '피부 처짐, 주름 개선', en: 'Sagging skin and wrinkle improvement', zh: '皮肤松弛、皱纹改善', ja: '肌のたるみ·シワ改善' },
    localImage: '/images/home/qe-concern-wrinkle.png',
    linkUrl: '/treatments?cat=lifting-laser',
    sortOrder: 1,
  },
  {
    _id: 'quick-entry-pigment',
    tab: 'concern',
    title: { ko: '색소·기미', en: 'Pigment & Melasma', zh: '色素·黄褐斑', ja: '色素·シミ' },
    description: { ko: '기미, 색소침착, 피부톤 개선', en: 'Melasma, hyperpigmentation, skin tone', zh: '黄褐斑、色素沉着、肤色均匀', ja: 'シミ·色素沈着·肌トーン改善' },
    localImage: '/images/home/qe-concern-pigment.png',
    linkUrl: '/treatments?cat=lifting-laser',
    sortOrder: 2,
  },
  {
    _id: 'quick-entry-pore',
    tab: 'concern',
    title: { ko: '모공·피부결', en: 'Pore & Texture', zh: '毛孔·肤质', ja: '毛穴·肌質' },
    description: { ko: '모공 축소, 피부결 개선', en: 'Pore minimizing and texture refinement', zh: '毛孔收缩、肤质改善', ja: '毛穴縮小·肌質改善' },
    localImage: '/images/home/qe-concern-pore.png',
    linkUrl: '/treatments?cat=skincare',
    sortOrder: 3,
  },
  {
    _id: 'quick-entry-volume',
    tab: 'concern',
    title: { ko: '볼륨·윤곽', en: 'Volume & Contour', zh: '丰盈·轮廓', ja: 'ボリューム·輪郭' },
    description: { ko: '볼륨감, 얼굴 윤곽 개선', en: 'Facial volume and contour enhancement', zh: '面部丰盈、轮廓改善', ja: '顔のボリューム·輪郭改善' },
    localImage: '/images/home/qe-concern-volume.png',
    linkUrl: '/treatments?cat=petit-lifting',
    sortOrder: 4,
  },

  // ── 상황으로 찾기 ─────────────────────────────────────────
  {
    _id: 'quick-entry-first',
    tab: 'situation',
    title: { ko: '처음 방문', en: 'First Visit', zh: '初次到访', ja: '初めての方' },
    description: { ko: '첫 방문 추천 시술', en: 'Recommended treatments for first-time visitors', zh: '初次到访推荐项目', ja: '初回おすすめ施術' },
    localImage: '/images/home/qe-situation-first.png',
    linkUrl: '/treatments',
    sortOrder: 1,
  },
  {
    _id: 'quick-entry-quick',
    tab: 'situation',
    title: { ko: '빠른 시술', en: 'Quick Treatment', zh: '快速治疗', ja: '短時間施術' },
    description: { ko: '1시간 이내 완료 가능한 시술', en: 'Treatments completable within 1 hour', zh: '1小时内完成的治疗项目', ja: '1時間以内に完了できる施術' },
    localImage: '/images/home/qe-situation-quick.png',
    linkUrl: '/treatments',
    sortOrder: 2,
  },
  {
    _id: 'quick-entry-regular',
    tab: 'situation',
    title: { ko: '정기 관리', en: 'Regular Care', zh: '定期护理', ja: '定期ケア' },
    description: { ko: '꾸준한 피부 관리 플랜', en: 'Ongoing skin maintenance plan', zh: '持续皮肤管理方案', ja: '継続的なスキンケアプラン' },
    localImage: '/images/home/qe-situation-regular.png',
    linkUrl: '/treatments',
    sortOrder: 3,
  },
  {
    _id: 'quick-entry-special',
    tab: 'situation',
    title: { ko: '특별한 날', en: 'Special Occasion', zh: '特殊场合', ja: '特別な日のために' },
    description: { ko: '행사·여행 전 집중 관리', en: 'Intensive care before events or travel', zh: '活动·旅行前集中护理', ja: 'イベント·旅行前の集中ケア' },
    localImage: '/images/home/qe-situation-special.png',
    linkUrl: '/treatments',
    sortOrder: 4,
  },
];

async function seed() {
  console.log(`총 ${CARDS.length}개 카드 업로드 시작...\n`);

  for (const card of CARDS) {
    process.stdout.write(`[${card._id}] 이미지 업로드 중...`);
    let icon;
    try {
      icon = await uploadImage(card.localImage);
      process.stdout.write(' ✓\n');
    } catch (e) {
      process.stdout.write(` ✗ (이미지 생략: ${e.message})\n`);
    }

    const doc = {
      _id: card._id,
      _type: 'quickEntryCard',
      tab: card.tab,
      title: card.title,
      description: card.description,
      linkUrl: card.linkUrl,
      sortOrder: card.sortOrder,
      ...(icon ? { icon } : {}),
    };

    await client.createOrReplace(doc);
    console.log(`  → 문서 저장 완료: ${card.title.ko}`);
  }

  console.log('\n✅ Quick Entry 카드 시드 완료');
}

seed().catch((err) => {
  console.error('❌ 시드 실패:', err);
  process.exit(1);
});
