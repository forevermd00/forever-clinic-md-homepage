/**
 * Quick Entry 현황 조회 + 패치 스크립트
 * 실행: node scripts/setup-quick-entry.mjs
 *
 * Step 1: 현황 조회 (quickEntryCard, treatment)
 * Step 2: linkedTreatments 연결
 * Step 3: icon 확인
 * Step 4: linkUrl 보정
 */

import { createClient } from '@sanity/client';
import * as dotenv from 'dotenv';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production';
const TOKEN = process.env.SANITY_API_TOKEN;

if (!TOKEN) {
  console.error('SANITY_API_TOKEN not found in .env.local');
  process.exit(1);
}

const client = createClient({
  projectId: 'ecoamz42',
  dataset: DATASET,
  apiVersion: '2024-01-01',
  token: TOKEN,
  useCdn: false,
});

console.log(`\nDataset: ${DATASET}\n`);

// ────────────────────────────────────────────────
// Step 1: 현황 조회
// ────────────────────────────────────────────────

async function queryCurrentState() {
  console.log('═══════════════════════════════════════');
  console.log('Step 1: 현황 조회');
  console.log('═══════════════════════════════════════\n');

  // 1-a. quickEntryCard
  const cards = await client.fetch(`
    *[_type == "quickEntryCard"] | order(sortOrder asc) {
      _id,
      tab,
      "titleKo": title.ko,
      linkUrl,
      sortOrder,
      "hasIcon": defined(icon.asset),
      "iconRef": icon.asset._ref,
      "linkedCount": count(linkedTreatments)
    }
  `);

  console.log(`[quickEntryCard] ${cards.length}개\n`);
  for (const c of cards) {
    const iconMark = c.hasIcon ? '✓' : '✗';
    const linked = c.linkedCount ?? 0;
    console.log(
      `  ${c._id}\n` +
      `    tab: ${c.tab} | title: ${c.titleKo ?? '(없음)'}\n` +
      `    linkUrl: ${c.linkUrl ?? '(없음)'}\n` +
      `    icon: ${iconMark} | linkedTreatments: ${linked}개\n`
    );
  }

  // 1-b. treatment (first 60 by sortOrder)
  const treatments = await client.fetch(`
    *[_type == "treatment"] | order(sortOrder asc) [0...60] {
      _id,
      "nameKo": name.ko,
      "slug": slug.current,
      category,
      sortOrder
    }
  `);

  console.log(`[treatment] ${treatments.length}개\n`);
  for (const t of treatments) {
    console.log(`  [${t.category ?? '없음'}] ${t.nameKo ?? '?'} — ${t.slug ?? '(슬러그 없음)'} (${t._id})`);
  }

  return { cards, treatments };
}

// ────────────────────────────────────────────────
// Step 2: linkedTreatments 매핑 로직
// ────────────────────────────────────────────────

/**
 * 카드 _id → 매핑할 카테고리 목록
 * 시술탭(treatment): 카테고리로 직접 매핑
 * 고민탭(concern): 관련 카테고리 조합
 * 상황탭(situation): 광범위 매핑
 */
const CARD_CATEGORY_MAP = {
  // 시술로 찾기
  'quick-entry-lifting':  ['lifting-laser'],
  'quick-entry-petit':    ['petit-lifting'],
  'quick-entry-skincare': ['skincare'],
  'quick-entry-booster':  ['skin-booster'],

  // 고민으로 찾기
  'quick-entry-wrinkle':  ['lifting-laser', 'petit-lifting'],
  'quick-entry-pigment':  ['lifting-laser', 'skincare'],
  'quick-entry-pore':     ['skincare', 'lifting-laser'],
  'quick-entry-volume':   ['petit-lifting', 'skin-booster'],

  // 상황으로 찾기
  'quick-entry-first':    ['signature', 'skincare', 'skin-booster'],
  'quick-entry-quick':    ['petit-lifting', 'skincare'],
  'quick-entry-regular':  ['skincare', 'skin-booster'],
  'quick-entry-special':  ['lifting-laser', 'petit-lifting', 'skin-booster'],
};

/**
 * linkUrl 기준 매핑
 * 스키마에 slug 필드 없음 — linkUrl만 사용
 */
const CARD_LINK_MAP = {
  'quick-entry-lifting':  '/treatments?cat=lifting-laser',
  'quick-entry-petit':    '/treatments?cat=petit-lifting',
  'quick-entry-skincare': '/treatments?cat=skincare',
  'quick-entry-booster':  '/treatments?cat=skin-booster',
  'quick-entry-wrinkle':  '/treatments?concern=wrinkle',
  'quick-entry-pigment':  '/treatments?concern=pigment',
  'quick-entry-pore':     '/treatments?concern=pore',
  'quick-entry-volume':   '/treatments?concern=volume',
  'quick-entry-first':    '/treatments?situation=first',
  'quick-entry-quick':    '/treatments?situation=quick',
  'quick-entry-regular':  '/treatments?situation=regular',
  'quick-entry-special':  '/treatments?situation=special',
};

// ────────────────────────────────────────────────
// Step 3: 패치 실행
// ────────────────────────────────────────────────

async function patchCards(cards, treatments) {
  console.log('\n═══════════════════════════════════════');
  console.log('Step 2-4: 패치 실행');
  console.log('═══════════════════════════════════════\n');

  // treatment를 카테고리별로 그룹화
  const byCategory = {};
  for (const t of treatments) {
    if (!t.category) continue;
    if (!byCategory[t.category]) byCategory[t.category] = [];
    byCategory[t.category].push(t);
  }

  let patchCount = 0;
  let skipCount = 0;

  for (const card of cards) {
    const cats = CARD_CATEGORY_MAP[card._id];
    const desiredLink = CARD_LINK_MAP[card._id];

    if (!cats && !desiredLink) {
      console.log(`[SKIP] ${card._id} — 매핑 정의 없음`);
      skipCount++;
      continue;
    }

    const patch = client.patch(card._id);
    const patchOps = {};
    const notes = [];

    // linkedTreatments 연결 (비어있거나 0개인 경우에만 설정)
    if (cats && (card.linkedCount === 0 || card.linkedCount === null)) {
      const refs = [];
      for (const cat of cats) {
        const items = byCategory[cat] ?? [];
        for (const t of items) {
          refs.push({ _type: 'reference', _ref: t._id, _key: t._id });
        }
      }
      if (refs.length > 0) {
        patchOps.linkedTreatments = refs;
        notes.push(`linkedTreatments: ${refs.length}개 연결`);
      } else {
        notes.push(`linkedTreatments: 해당 카테고리 시술 없음 (${cats.join(', ')})`);
      }
    } else if (cats && card.linkedCount > 0) {
      notes.push(`linkedTreatments: 이미 ${card.linkedCount}개 연결됨 — 유지`);
    }

    // linkUrl 설정 (없는 경우만)
    if (desiredLink && !card.linkUrl) {
      patchOps.linkUrl = desiredLink;
      notes.push(`linkUrl 설정: ${desiredLink}`);
    } else if (desiredLink && card.linkUrl) {
      notes.push(`linkUrl: 기존값 유지 (${card.linkUrl})`);
    }

    if (Object.keys(patchOps).length > 0) {
      try {
        await patch.set(patchOps).commit();
        console.log(`[PATCH] ${card._id}`);
        notes.forEach(n => console.log(`        ${n}`));
        patchCount++;
      } catch (err) {
        console.error(`[ERROR] ${card._id}: ${err.message}`);
      }
    } else {
      console.log(`[OK]    ${card._id}`);
      notes.forEach(n => console.log(`        ${n}`));
      skipCount++;
    }
  }

  console.log(`\n패치 완료: ${patchCount}개 수정, ${skipCount}개 유지`);
}

// ────────────────────────────────────────────────
// Step 4: 아이콘 상태 재확인
// ────────────────────────────────────────────────

async function verifyIcons() {
  console.log('\n═══════════════════════════════════════');
  console.log('Step 3: 아이콘 상태 확인');
  console.log('═══════════════════════════════════════\n');

  const cards = await client.fetch(`
    *[_type == "quickEntryCard"] | order(sortOrder asc) {
      _id,
      tab,
      "titleKo": title.ko,
      "hasIcon": defined(icon.asset),
      "iconRef": icon.asset._ref
    }
  `);

  const missing = [];
  for (const c of cards) {
    const mark = c.hasIcon ? '✓' : '✗ MISSING';
    console.log(`  [${c.tab}] ${c.titleKo ?? c._id} — icon: ${mark}`);
    if (!c.hasIcon) missing.push(c._id);
  }

  if (missing.length > 0) {
    console.log(`\n아이콘 누락 카드 (${missing.length}개):`);
    missing.forEach(id => console.log(`  - ${id}`));
    console.log('\n  → patch-qe-concern-situation.mjs 또는 patch-qe-images.mjs 실행 필요');
  } else {
    console.log('\n모든 카드에 아이콘 설정됨');
  }
}

// ────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────

async function main() {
  const { cards, treatments } = await queryCurrentState();
  await patchCards(cards, treatments);
  await verifyIcons();

  console.log('\n═══════════════════════════════════════');
  console.log('완료');
  console.log('═══════════════════════════════════════\n');
}

main().catch(err => {
  console.error('\n실패:', err.message);
  process.exit(1);
});
