import * as XLSX from 'xlsx-js-style';

/* ──────────────────────────────────────────────────────────────
 * 시술 가격표 엑셀 — 다운로드 / 업로드 파싱 / 갱신 빌드
 *
 * 개념은 병원 수가표와 동일: "한 행 = 한 가격옵션".
 * 한 시술(slug)이 여러 옵션 행을 가질 수 있고, 같은 slug의 행들이
 * 그 시술의 가격옵션 배열을 통째로 재구성한다.
 *
 * - 매칭 기준: slug(시술) + (적용부위 + 옵션명 한국어)(옵션).
 *   같은 시술 안에서 부위·옵션명이 같으면 기존 옵션을 갱신하고,
 *   내부ID(_key)를 보존한다. 부위·옵션명이 바뀌면 새 옵션으로 생성.
 * - 옵션명·용량횟수는 한·영·중·일 4개 언어 컬럼으로 직접 입력/번역.
 *   빈 언어 칸은 기존 번역을 유지(덮어쓰지 않음).
 * - 빈 가격 칸은 "변경 안 함"으로 기존 값을 유지.
 * - 유효 옵션 행이 하나도 없는 시술은 건드리지 않음.
 * ────────────────────────────────────────────────────────────── */

const CATEGORY_VALUE_TO_LABEL: Record<string, string> = {
  signature: '시그니처',
  'lifting-laser': '리프팅·레이저',
  'petit-lifting': '쁘띠·실리프팅',
  skincare: '스킨케어',
  'skin-booster': '스킨부스터',
  'hair-removal': '제모',
  anesthesia: '마취',
};

const LANGS = [
  { k: 'ko', l: '한국어' },
  { k: 'en', l: '영문' },
  { k: 'zh', l: '중문' },
  { k: 'ja', l: '일문' },
] as const;

// ── 헤더 ──
const H_SLUG = '슬러그';
const H_TNAME = '시술명(참고)';
const H_CATEGORY = '카테고리(참고)';
const H_AREA = '적용부위';
const H_PRICE = '정상가';
const H_DISCOUNT = '할인가';
const H_RATE = '할인율(참고·자동)';
const H_EVENT = '이벤트';

const optNameHeader = (l: string) => `옵션명(${l})`;
const capHeader = (l: string) => `용량·횟수(${l})`;

const HEADERS = [
  H_SLUG,
  H_TNAME,
  H_CATEGORY,
  H_AREA,
  ...LANGS.map((x) => optNameHeader(x.l)),
  ...LANGS.map((x) => capHeader(x.l)),
  H_PRICE,
  H_DISCOUNT,
  H_RATE,
  H_EVENT,
];

// 참고(반영 안 됨) 컬럼
const REF_HEADERS = new Set([H_TNAME, H_CATEGORY, H_RATE]);
// 숫자(천단위 콤마) 컬럼
const NUM_HEADERS = new Set([H_PRICE, H_DISCOUNT]);
// 번역(보조 언어) 컬럼 — 연한 색으로 구분
const TRANSLATION_HEADERS = new Set([
  ...LANGS.filter((x) => x.k !== 'ko').map((x) => optNameHeader(x.l)),
  ...LANGS.filter((x) => x.k !== 'ko').map((x) => capHeader(x.l)),
]);

const EVENT_TRUE = 'O'; // 이벤트 체크 표시 (빈 칸 = 일반)

/* ── 타입 ── */
type Localized = { ko?: string; en?: string; zh?: string; ja?: string };

export interface ExportOption {
  _key: string;
  name?: Localized;
  caption?: Localized;
  area?: string;
  price?: number;
  discountPrice?: number;
  isEvent?: boolean;
}

export interface ExportTreatment {
  _id: string;
  slug?: string;
  name?: string; // ko 표시용
  category?: string;
  priceOptions?: ExportOption[];
}

export interface InvalidRow {
  rowNum: number;
  slug: string;
  name: string;
  reason: string;
}

interface ParsedOptRow {
  rowNum: number;
  slug: string;
  area?: string;
  name: Localized;
  caption: Localized;
  price?: number; // 셀에 값이 있을 때만
  discount?: number;
  isEvent: boolean;
}

export interface TreatmentUpdate {
  id: string;
  slug: string;
  name: string;
  newOptions: Record<string, unknown>[];
  optionCount: number;
  removed: number; // 이것만 남기기 모드에서 제거되는 기존 옵션 수
}

export interface BuildResult {
  updates: TreatmentUpdate[];
  invalid: InvalidRow[];
}

// 'replace' = 이것만 남기기(시트에 없는 옵션 제거), 'upsert' = 덮어쓰기(추가·갱신만)
export type ImportMode = 'replace' | 'upsert';

/* ── 유틸 ── */
function newKey() {
  return Math.random().toString(36).slice(2, 10);
}

function cellStr(v: unknown): string {
  if (v === null || v === undefined) return '';
  return String(v).trim();
}

function parseIntCell(v: unknown): number | undefined {
  const s = cellStr(v).replace(/[,\s₩원]/g, '');
  if (!s) return undefined;
  const n = parseInt(s, 10);
  return isNaN(n) ? undefined : n;
}

// 이벤트 컬럼: 체크 방식. O/V/✓/이벤트 등 = 이벤트, 빈 칸·그 외 = 일반(false)
function parseEventCell(v: unknown): boolean {
  const s = cellStr(v).toLowerCase();
  if (!s) return false;
  return [
    'o',
    'v',
    '✓',
    'y',
    'yes',
    '예',
    'true',
    '1',
    '이벤트',
    'event',
    'on',
  ].includes(s);
}

function normSlug(v: unknown): string {
  return cellStr(v).toLowerCase();
}

// 옵션 매칭용 자연키 (적용부위 + 옵션명 + 용량·횟수, 모두 한국어 기준)
function optMatchKey(
  area?: string,
  nameKo?: string,
  captionKo?: string,
): string {
  const n = (s?: string) => (s ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
  return [n(area), n(nameKo), n(captionKo)].join('');
}

// 비어있지 않은 언어만 남김
function compact(loc: Localized): Localized {
  const out: Localized = {};
  for (const { k } of LANGS) if (loc[k]) out[k] = loc[k];
  return out;
}

function discountRate(price?: number, discount?: number): string {
  if (!price || !discount || discount >= price) return '';
  return Math.round((1 - discount / price) * 100) + '%';
}

/* ── 셀 스타일 ── */
const BORDER = {
  top: { style: 'thin', color: { rgb: 'E3DCD3' } },
  bottom: { style: 'thin', color: { rgb: 'E3DCD3' } },
  left: { style: 'thin', color: { rgb: 'E3DCD3' } },
  right: { style: 'thin', color: { rgb: 'E3DCD3' } },
};

function headerStyle(header: string) {
  let fill = 'A83C44'; // 입력 컬럼 — 브랜드 마룬
  let fontColor = 'FFFFFF';
  if (header === H_SLUG) {
    fill = '2B2B2B'; // 키 컬럼 — 진한 회색
  } else if (REF_HEADERS.has(header)) {
    fill = 'EDE7DF'; // 참고 컬럼 — 연한 베이지
    fontColor = '8A8A8A';
  } else if (TRANSLATION_HEADERS.has(header)) {
    fill = 'CC8A91'; // 번역(보조) 컬럼 — 연한 마룬
  }
  return {
    fill: { patternType: 'solid', fgColor: { rgb: fill } },
    font: { bold: true, sz: 11, color: { rgb: fontColor } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: BORDER,
  };
}

function dataStyle(header: string, rowIdx: number) {
  const isRef = REF_HEADERS.has(header);
  const zebra = rowIdx % 2 === 1;
  return {
    fill: zebra
      ? { patternType: 'solid', fgColor: { rgb: 'FAF8F5' } }
      : undefined,
    font: { sz: 11, color: { rgb: isRef ? 'A8A8A8' : '2B2B2B' } },
    alignment: {
      horizontal: NUM_HEADERS.has(header) ? 'right' : 'left',
      vertical: 'center',
    },
    border: BORDER,
  };
}

function styleSheet(ws: XLSX.WorkSheet, rowCount: number) {
  for (let c = 0; c < HEADERS.length; c++) {
    const header = HEADERS[c];
    const hAddr = XLSX.utils.encode_cell({ r: 0, c });
    if (!ws[hAddr]) ws[hAddr] = { t: 's', v: header };
    ws[hAddr].s = headerStyle(header);

    for (let r = 1; r <= rowCount; r++) {
      const addr = XLSX.utils.encode_cell({ r, c });
      if (!ws[addr]) ws[addr] = { t: 's', v: '' };
      const cell = ws[addr];
      cell.s = dataStyle(header, r);
      if (NUM_HEADERS.has(header) && typeof cell.v === 'number')
        cell.z = '#,##0';
    }
  }
  ws['!rows'] = [{ hpt: 28 }];
  ws['!freeze'] = { xSplit: 1, ySplit: 1, topLeftCell: 'B2' };
}

/* ──────────────────────────────────────────────────────────────
 * 가격표 다운로드 (현재 데이터 — 옵션별 한 행)
 * ────────────────────────────────────────────────────────────── */
export function downloadPriceSheet(treatments: ExportTreatment[]): void {
  const rows: Record<string, unknown>[] = [];

  const optRow = (
    t: ExportTreatment,
    catLabel: string,
    opt?: ExportOption,
  ): Record<string, unknown> => {
    const row: Record<string, unknown> = {
      [H_SLUG]: t.slug ?? '',
      [H_TNAME]: t.name ?? '',
      [H_CATEGORY]: catLabel,
    };
    if (!opt) return row;
    row[H_AREA] = opt.area ?? '';
    for (const { k, l } of LANGS) row[optNameHeader(l)] = opt.name?.[k] ?? '';
    for (const { k, l } of LANGS) row[capHeader(l)] = opt.caption?.[k] ?? '';
    row[H_PRICE] = opt.price ?? '';
    row[H_DISCOUNT] = opt.discountPrice ?? '';
    row[H_RATE] = discountRate(opt.price, opt.discountPrice);
    row[H_EVENT] = opt.isEvent ? EVENT_TRUE : '';
    return row;
  };

  for (const t of treatments) {
    const catLabel = t.category
      ? (CATEGORY_VALUE_TO_LABEL[t.category] ?? t.category)
      : '';
    const opts = t.priceOptions ?? [];
    if (opts.length === 0) rows.push(optRow(t, catLabel));
    else for (const opt of opts) rows.push(optRow(t, catLabel, opt));
  }

  if (rows.length === 0) {
    const sample: Record<string, unknown> = {
      [H_SLUG]: 'example-slug',
      [H_TNAME]: '예시 시술',
      [H_CATEGORY]: '리프팅·레이저',
      [H_AREA]: '얼굴',
      [optNameHeader('한국어')]: '울쎄라 300샷',
      [optNameHeader('영문')]: 'Ulthera 300 shots',
      [capHeader('한국어')]: '300샷 / 1회',
      [H_PRICE]: 1800000,
      [H_DISCOUNT]: 1090000,
      [H_EVENT]: '',
    };
    rows.push(sample);
  }

  const ws = XLSX.utils.json_to_sheet(rows, { header: HEADERS });
  ws['!cols'] = HEADERS.map((h) => {
    if (h === H_SLUG || h === H_TNAME) return { wch: 20 };
    if (h.startsWith('옵션명')) return { wch: 18 };
    if (h.startsWith('용량')) return { wch: 14 };
    if (h === H_RATE) return { wch: 14 };
    return { wch: 11 };
  });
  styleSheet(ws, rows.length);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, '가격표');

  const guide: string[][] = [
    ['시술 가격표 — 작성 가이드'],
    [''],
    ['● 한 행 = 한 가격옵션입니다. 한 시술에 옵션이 여러 개면 행도 여러 개.'],
    ['● "슬러그"는 시술을 식별하는 기준입니다. (홈페이지 상세 주소)'],
    ['   - 같은 슬러그의 행들이 그 시술의 가격옵션을 구성합니다.'],
    ['   - 슬러그가 없거나 존재하지 않으면 그 행은 반영되지 않습니다.'],
    ['   - 새 시술은 먼저 관리자 화면에서 추가하세요.'],
    [''],
    [
      '● 입력 컬럼(마룬): 적용부위 / 옵션명 / 용량·횟수 / 정상가 / 할인가 / 이벤트',
    ],
    ['● 번역 컬럼(연한 마룬): 옵션명·용량횟수의 영문/중문/일문'],
    ['   - 비워두면 기존 번역을 그대로 유지합니다(덮어쓰지 않음).'],
    ['   - 채우면 해당 언어가 갱신됩니다.'],
    ['● 참고 컬럼(회색, 반영 안 됨): 시술명, 카테고리, 할인율'],
    [''],
    [
      '● 옵션 매칭은 "적용부위 + 옵션명 + 용량·횟수"로 자동 처리됩니다(한국어 기준).',
    ],
    [
      '   - 부위·옵션명·용량을 그대로 두고 가격만 고치면 → 그 옵션이 갱신됩니다.',
    ],
    ['     (영어·중국어·일본어 번역과 옵션 순서는 그대로 보존)'],
    [
      '   - 부위·옵션명·용량(한국어) 중 하나라도 바꾸면 → 새 옵션으로 생성됩니다.',
    ],
    ['   - 행을 지우면 그 옵션이 삭제됩니다(같은 시술의 다른 행은 유지).'],
    [''],
    ['● 가격은 숫자만 입력(콤마·원 기호 무방). 부가세 별도 기준.'],
    ['● 할인가는 할인 시에만 입력. 비우면 정상가로 노출.'],
    ['● 빈 가격 칸은 "변경 안 함"으로 기존 값을 유지합니다.'],
    ['● 이벤트 컬럼: 이벤트면 O(또는 V)로 체크, 일반이면 빈 칸으로 둡니다.'],
    [''],
    ['※ 한 시술의 옵션은 가능한 모두 포함해서 올리세요.'],
    ['   시트에서 빠진 옵션 행은 그 시술에서 삭제된 것으로 처리됩니다.'],
  ];
  const gws = XLSX.utils.aoa_to_sheet(guide);
  gws['!cols'] = [{ wch: 82 }];
  if (gws['A1'])
    gws['A1'].s = { font: { bold: true, sz: 13, color: { rgb: 'A83C44' } } };
  XLSX.utils.book_append_sheet(wb, gws, '작성 가이드');

  XLSX.writeFile(wb, '시술_가격표.xlsx');
}

/* ──────────────────────────────────────────────────────────────
 * 업로드 파일 파싱 → 옵션 행 추출
 * ────────────────────────────────────────────────────────────── */
function parseRows(file: ArrayBuffer): {
  rows: ParsedOptRow[];
  invalid: InvalidRow[];
} {
  const wb = XLSX.read(file, { type: 'array' });
  const sheetName =
    wb.SheetNames.find((n) => n === '가격표') ?? wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error('시트를 찾을 수 없습니다.');

  const norm = (s: string) => s.replace(/\s+/g, '').trim();

  // ── 양식 검증: 필수 헤더 존재 확인 ──
  const headerRow = (XLSX.utils.sheet_to_json(ws, { header: 1 })[0] ??
    []) as unknown[];
  const present = new Set(headerRow.map((h) => norm(String(h ?? ''))));
  const required = [H_SLUG, optNameHeader('한국어')];
  const missing = required.filter((h) => !present.has(norm(h)));
  if (missing.length) {
    throw new Error(
      `양식이 맞지 않습니다. "가격표 다운로드"로 받은 양식을 사용하세요. (필수 컬럼 없음: ${missing.join(', ')})`,
    );
  }

  const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
    defval: '',
    raw: false,
  });

  const get = (row: Record<string, unknown>, canonical: string): unknown => {
    for (const k of Object.keys(row)) {
      if (norm(k) === norm(canonical)) return row[k];
    }
    return '';
  };

  const rows: ParsedOptRow[] = [];
  const invalid: InvalidRow[] = [];

  raw.forEach((r, idx) => {
    const rowNum = idx + 2; // 헤더 1행
    const slug = normSlug(get(r, H_SLUG));
    const area = cellStr(get(r, H_AREA));
    const tname = cellStr(get(r, H_TNAME));

    const name: Localized = {};
    for (const { k, l } of LANGS) {
      const v = cellStr(get(r, optNameHeader(l)));
      if (v) name[k] = v;
    }
    const caption: Localized = {};
    for (const { k, l } of LANGS) {
      const v = cellStr(get(r, capHeader(l)));
      if (v) caption[k] = v;
    }
    const rawPrice = cellStr(get(r, H_PRICE));
    const rawDiscount = cellStr(get(r, H_DISCOUNT));

    const hasContent =
      !!area ||
      Object.keys(name).length > 0 ||
      Object.keys(caption).length > 0 ||
      !!rawPrice ||
      !!rawDiscount;

    if (!slug && !hasContent) return; // 완전 빈 행
    if (slug && !hasContent) return; // 옵션 없는 시술 placeholder

    const dispName = name.ko || name.en || tname;
    if (!slug) {
      invalid.push({
        rowNum,
        slug: '',
        name: dispName,
        reason: '슬러그가 비어 있습니다.',
      });
      return;
    }

    const price = parseIntCell(rawPrice);
    if (rawPrice && price === undefined) {
      invalid.push({
        rowNum,
        slug,
        name: dispName,
        reason: `정상가가 숫자가 아닙니다: "${rawPrice}"`,
      });
      return;
    }
    const discount = parseIntCell(rawDiscount);
    if (rawDiscount && discount === undefined) {
      invalid.push({
        rowNum,
        slug,
        name: dispName,
        reason: `할인가가 숫자가 아닙니다: "${rawDiscount}"`,
      });
      return;
    }

    rows.push({
      rowNum,
      slug,
      area: area || undefined,
      name,
      caption,
      price,
      discount,
      isEvent: parseEventCell(get(r, H_EVENT)),
    });
  });

  return { rows, invalid };
}

// 기존 옵션(base) + 시트 행(row)을 합쳐 priceOption 배열 항목 생성.
// row가 없으면 기존 옵션을 그대로 유지(덮어쓰기 모드의 미변경 옵션).
function buildOption(
  base: ExportOption | undefined,
  row: ParsedOptRow | undefined,
): Record<string, unknown> {
  const opt: Record<string, unknown> = {
    _key: base?._key ?? newKey(),
    _type: 'priceOption',
  };
  const name = compact({ ...(base?.name ?? {}), ...(row?.name ?? {}) });
  if (Object.keys(name).length) opt.name = name;
  const caption = compact({
    ...(base?.caption ?? {}),
    ...(row?.caption ?? {}),
  });
  if (Object.keys(caption).length) opt.caption = caption;
  const area = row?.area ?? base?.area;
  if (area) opt.area = area;
  const price = row?.price ?? base?.price;
  if (price !== undefined) opt.price = price;
  const discount = row?.discount ?? base?.discountPrice;
  if (discount !== undefined) opt.discountPrice = discount;
  // 이벤트: row가 있으면 시트가 기준(체크), 없으면 기존 유지. true일 때만 기록.
  const isEvent = row ? row.isEvent : base?.isEvent;
  if (isEvent) opt.isEvent = true;
  return opt;
}

/* ──────────────────────────────────────────────────────────────
 * 1단계: 업로드 파일 읽기(파싱) — 모드와 무관. 양식 오류는 여기서 throw.
 * ────────────────────────────────────────────────────────────── */
export interface ParsedSheet {
  rows: ParsedOptRow[];
  invalid: InvalidRow[];
}

export async function readPriceFile(file: File): Promise<ParsedSheet> {
  const buf = await file.arrayBuffer();
  return parseRows(buf);
}

/* ──────────────────────────────────────────────────────────────
 * 2단계: 파싱 결과 + 현재 데이터 + 모드 → 시술별 가격옵션 갱신안
 * (모드 토글 시 재호출 — parsed.invalid는 복사해서 사용, 원본 불변)
 * ────────────────────────────────────────────────────────────── */
export function buildPriceUpdates(
  parsed: ParsedSheet,
  existing: ExportTreatment[],
  mode: ImportMode,
): BuildResult {
  const { rows } = parsed;
  const invalid: InvalidRow[] = [...parsed.invalid];

  const bySlug = new Map<string, ExportTreatment>();
  existing.forEach((t) => {
    if (t.slug) bySlug.set(t.slug.toLowerCase(), t);
  });

  const order: string[] = [];
  const groups = new Map<string, ParsedOptRow[]>();
  for (const row of rows) {
    if (!groups.has(row.slug)) {
      groups.set(row.slug, []);
      order.push(row.slug);
    }
    groups.get(row.slug)!.push(row);
  }

  const updates: TreatmentUpdate[] = [];

  for (const slug of order) {
    const groupRows = groups.get(slug)!;
    const t = bySlug.get(slug);
    if (!t) {
      groupRows.forEach((row) =>
        invalid.push({
          rowNum: row.rowNum,
          slug,
          name: row.name.ko || row.name.en || '',
          reason: '해당 슬러그의 시술이 없습니다.',
        }),
      );
      continue;
    }

    const existingOpts = t.priceOptions ?? [];
    let newOptions: Record<string, unknown>[];
    let removed = 0;

    if (mode === 'replace') {
      // 이것만 남기기: 시트 행만 남김(매칭 안 된 기존 옵션 제거)
      const pool = existingOpts.map((o) => ({
        opt: o,
        key: optMatchKey(o.area, o.name?.ko, o.caption?.ko),
        used: false,
      }));
      newOptions = groupRows.map((row) => {
        const key = optMatchKey(row.area, row.name.ko, row.caption.ko);
        const match = pool.find((p) => !p.used && p.key === key);
        if (match) match.used = true;
        return buildOption(match?.opt, row);
      });
      removed = pool.filter((p) => !p.used).length;
    } else {
      // 덮어쓰기: 기존 옵션 모두 유지 + 매칭되면 갱신 + 새 옵션은 추가
      const working = existingOpts.map((o) => ({
        opt: o,
        key: optMatchKey(o.area, o.name?.ko, o.caption?.ko),
        used: false,
        row: undefined as ParsedOptRow | undefined,
      }));
      const appended: ParsedOptRow[] = [];
      for (const row of groupRows) {
        const key = optMatchKey(row.area, row.name.ko, row.caption.ko);
        const w = working.find((x) => !x.used && x.key === key);
        if (w) {
          w.used = true;
          w.row = row;
        } else appended.push(row);
      }
      newOptions = [
        ...working.map((w) => buildOption(w.opt, w.row)),
        ...appended.map((r) => buildOption(undefined, r)),
      ];
    }

    if (newOptions.length === 0) continue;

    updates.push({
      id: t._id,
      slug,
      name: t.name ?? '',
      newOptions,
      optionCount: newOptions.length,
      removed,
    });
  }

  return { updates, invalid };
}
