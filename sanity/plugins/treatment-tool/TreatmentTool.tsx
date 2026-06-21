import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useClient } from 'sanity';
import { useRouter, useRouterState } from 'sanity/router';
import {
  TreatmentDoc,
  CATEGORIES,
  CATEGORY_LABEL,
  EDITABLE_CATEGORIES,
} from './types';
import { TreatmentDetail } from './TreatmentDetail';
import {
  downloadPriceSheet,
  readPriceFile,
  buildPriceUpdates,
  type ExportTreatment,
  type TreatmentUpdate,
  type InvalidRow,
  type ImportMode,
  type ParsedSheet,
} from './excel';
import './treatment-tool.css';

// 가격표 내보내기/업로드용 — 옵션 전체(_key·다국어) 포함
const PRICE_EXPORT_QUERY = `
  *[_type == "treatment"] | order(sortOrder asc, _createdAt asc) {
    _id,
    "slug": slug.current,
    "name": coalesce(name.ko, name.en, ""),
    category,
    priceOptions[]{ _key, name, caption, area, price, discountPrice, isEvent }
  }
`;

interface ImportPlan {
  mode: ImportMode;
  updates: TreatmentUpdate[];
  invalid: InvalidRow[];
  optionTotal: number;
  removedTotal: number;
}

interface ImportResult {
  mode: ImportMode;
  updated: number;
  optionTotal: number;
  removedTotal: number;
  failures: { slug: string; name: string; reason: string }[];
  invalid: InvalidRow[];
}

const QUERY = `
  *[_type == "treatment"] | order(sortOrder asc, _createdAt asc) {
    _id, _updatedAt,
    "name": coalesce(name.ko, name.en, ""),
    "slug": coalesce(slug.current, ""),
    category,
    "isEvent": count(priceOptions[isEvent == true]) > 0,
    isSignature,
    isVisible,
    showInMenu,
    sortOrder,
    priceOptions[] { price, discountPrice }
  }
`;

type SortKey = 'sortOrder' | 'name' | 'category';
type SortDir = 'asc' | 'desc';

export function TreatmentTool() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const router = useRouter();
  const routerState = useRouterState() as { selectedId?: string } | null;
  const selectedId = routerState?.selectedId ?? null;

  const [docs, setDocs] = useState<TreatmentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('sortOrder');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // ── 가격표 엑셀 ──
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importSource = useRef<{
    parsed: ParsedSheet;
    existing: ExportTreatment[];
  } | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [importPlan, setImportPlan] = useState<ImportPlan | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // 반영 중에는 실수로 창/탭을 닫지 못하도록 경고
  useEffect(() => {
    if (!importing) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [importing]);

  const refetch = useCallback(() => {
    setLoading(true);
    client.fetch(QUERY).then((data: TreatmentDoc[]) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    client.fetch(QUERY).then((data: TreatmentDoc[]) => {
      if (!cancelled) {
        setDocs(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const filtered = useMemo(() => {
    let result = [...docs];

    if (activeTab === '_event') {
      result = result.filter((d) => d.isEvent);
    } else if (activeTab === '_signature') {
      result = result.filter((d) => d.isSignature);
    } else if (activeTab !== 'all') {
      result = result.filter((d) => d.category === activeTab);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (d) =>
          d.name?.toLowerCase().includes(q) ||
          d.slug?.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      let va: string | number = '';
      let vb: string | number = '';
      if (sortKey === 'sortOrder') {
        va = a.sortOrder ?? 999;
        vb = b.sortOrder ?? 999;
      } else if (sortKey === 'name') {
        va = a.name || '';
        vb = b.name || '';
      } else if (sortKey === 'category') {
        va = CATEGORY_LABEL[a.category] || a.category || '';
        vb = CATEGORY_LABEL[b.category] || b.category || '';
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [docs, activeTab, search, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const patch = useCallback(
    async (id: string, fields: Record<string, unknown>) => {
      setSaving((s) => new Set(s).add(id));
      await client.patch(id).set(fields).commit();
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, ...fields } : d)),
      );
      setSaving((s) => {
        const n = new Set(s);
        n.delete(id);
        return n;
      });
    },
    [client],
  );

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('dragIdx', String(idx));
  };

  const handleDrop = useCallback(
    async (e: React.DragEvent, dropIdx: number) => {
      const from = parseInt(e.dataTransfer.getData('dragIdx'), 10);
      if (isNaN(from) || from === dropIdx) return;

      const reordered = [...filtered];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(dropIdx, 0, moved);

      const updates = reordered.map((doc, i) => ({
        id: doc._id,
        sortOrder: i * 10,
      }));

      setDocs((prev) => {
        const map = new Map(updates.map((u) => [u.id, u.sortOrder]));
        return prev.map((d) =>
          map.has(d._id) ? { ...d, sortOrder: map.get(d._id)! } : d,
        );
      });

      await Promise.all(
        updates.map(({ id, sortOrder }) =>
          client.patch(id).set({ sortOrder }).commit(),
        ),
      );
    },
    [client, filtered],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: docs.length,
      _event: 0,
      _signature: 0,
    };
    docs.forEach((d) => {
      if (d.category) c[d.category] = (c[d.category] || 0) + 1;
      if (d.isEvent) c._event++;
      if (d.isSignature) c._signature++;
    });
    return c;
  }, [docs]);

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (filtered.every((d) => selected.has(d._id))) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((d) => d._id)));
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    await Promise.all(ids.map((id) => client.delete(id)));
    setDocs((prev) => prev.filter((d) => !selected.has(d._id)));
    setSelected(new Set());
    setDeleteConfirm(false);
  };

  const handleAdd = async () => {
    const newDoc = await client.create({
      _type: 'treatment',
      name: { ko: '' },
      isVisible: false,
    });
    router.navigate({ selectedId: newDoc._id });
  };

  const handleDownloadPrices = async () => {
    setDownloading(true);
    try {
      const data: ExportTreatment[] = await client.fetch(PRICE_EXPORT_QUERY);
      downloadPriceSheet(data);
    } catch (e) {
      setImportError(
        '가격표 다운로드 실패: ' + (e instanceof Error ? e.message : String(e)),
      );
    } finally {
      setDownloading(false);
    }
  };

  const triggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // 파싱 결과 + 모드 → 확인 계획 계산 (팝업에서 모드 토글 시 재호출)
  const computePlan = (mode: ImportMode) => {
    const src = importSource.current;
    if (!src) return;
    const { updates, invalid } = buildPriceUpdates(
      src.parsed,
      src.existing,
      mode,
    );
    const optionTotal = updates.reduce((sum, u) => sum + u.optionCount, 0);
    const removedTotal = updates.reduce((sum, u) => sum + u.removed, 0);
    setImportPlan({ mode, updates, invalid, optionTotal, removedTotal });
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    try {
      const parsed = await readPriceFile(file);
      if (parsed.rows.length === 0 && parsed.invalid.length === 0) {
        setImportError(
          '엑셀에서 반영할 가격 행을 찾지 못했습니다. "가격표 다운로드"로 받은 양식인지, 슬러그가 채워졌는지 확인하세요.',
        );
        return;
      }
      const existing: ExportTreatment[] =
        await client.fetch(PRICE_EXPORT_QUERY);
      importSource.current = { parsed, existing };
      computePlan('replace'); // 기본: 이것만 남기기
    } catch (err) {
      setImportError(err instanceof Error ? err.message : String(err));
    }
  };

  const runImport = async () => {
    if (!importPlan) return;
    const total = importPlan.updates.length;
    setImporting(true);
    setImportProgress({ done: 0, total });
    const failures: { slug: string; name: string; reason: string }[] = [];
    let updated = 0;
    let done = 0;

    for (const u of importPlan.updates) {
      try {
        await client.patch(u.id).set({ priceOptions: u.newOptions }).commit();
        updated++;
      } catch (e) {
        failures.push({
          slug: u.slug,
          name: u.name,
          reason: '갱신 실패: ' + (e instanceof Error ? e.message : String(e)),
        });
      }
      done++;
      setImportProgress({ done, total });
    }

    setImporting(false);
    setImportProgress(null);
    setImportPlan(null);
    importSource.current = null;
    setImportResult({
      mode: importPlan.mode,
      updated,
      optionTotal: importPlan.optionTotal,
      removedTotal: importPlan.removedTotal,
      failures,
      invalid: importPlan.invalid,
    });
    refetch();
  };

  if (selectedId) {
    return (
      <TreatmentDetail
        id={selectedId}
        onBack={() => {
          router.navigate({});
          refetch();
        }}
      />
    );
  }

  return (
    <div className="tt-container">
      {/* Category Tabs */}
      <div className="tt-tabs">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            className={`tt-tab ${activeTab === cat.slug ? 'active' : ''}`}
            onClick={() => setActiveTab(cat.slug)}
          >
            {cat.label}
            {counts[cat.slug] !== undefined && (
              <span style={{ marginLeft: 4, opacity: 0.6 }}>
                {counts[cat.slug]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="tt-toolbar">
        <input
          className="tt-search"
          placeholder="시술명 또는 slug 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="tt-add-treatment-btn" onClick={handleAdd}>
          + 추가
        </button>
        {selected.size > 0 && (
          <button
            className="tt-delete-btn"
            onClick={() => setDeleteConfirm(true)}
          >
            선택 {selected.size}개 삭제
          </button>
        )}

        {/* 가격표 엑셀 */}
        <span className="tt-excel-divider" />
        <button
          className="tt-excel-btn"
          onClick={handleDownloadPrices}
          disabled={downloading}
          title="현재 시술의 가격옵션을 엑셀(옵션별 한 행)로 내보냅니다. 편집 후 다시 업로드하세요."
        >
          {downloading ? '내보내는 중…' : '⬇ 가격표 다운로드'}
        </button>
        <button
          className="tt-excel-btn tt-excel-btn-primary"
          onClick={triggerUpload}
          title="가격표 엑셀을 업로드합니다. 업로드 후 반영 방식(이것만 남기기 / 덮어쓰기)을 선택합니다."
        >
          ⬆ 가격표 업로드
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          style={{ display: 'none' }}
          onChange={handleFileSelected}
        />

        <span className="tt-count">{filtered.length}개 시술</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="tt-loading">불러오는 중...</div>
      ) : (
        <div className="tt-table-wrap">
          <table className="tt-table">
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: '32px' }} />
              <col style={{ width: '44px' }} />
              <col style={{ width: '26%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '60px' }} />
              <col style={{ width: '60px' }} />
              <col style={{ width: '60px' }} />
              <col style={{ width: '60px' }} />
              <col />
            </colgroup>
            <thead>
              <tr>
                <th style={{ cursor: 'default' }}>⠿</th>
                <th style={{ cursor: 'default', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="tt-checkbox"
                    checked={
                      filtered.length > 0 &&
                      filtered.every((d) => selected.has(d._id))
                    }
                    onChange={toggleSelectAll}
                  />
                </th>
                <th style={{ cursor: 'default' }}>No.</th>
                <th onClick={() => handleSort('name')}>
                  시술명
                  <span className="tt-sort-icon">{sortIcon('name')}</span>
                </th>
                <th onClick={() => handleSort('category')}>
                  카테고리
                  <span className="tt-sort-icon">{sortIcon('category')}</span>
                </th>
                <th style={{ cursor: 'default' }}>이벤트</th>
                <th style={{ cursor: 'default' }}>시그니처</th>
                <th style={{ cursor: 'default' }}>노출</th>
                <th style={{ cursor: 'default' }}>메뉴</th>
                <th style={{ cursor: 'default' }}>가격</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="tt-empty">
                    시술이 없습니다
                  </td>
                </tr>
              ) : (
                filtered.map((doc, idx) => (
                  <TreatmentRow
                    key={doc._id}
                    doc={doc}
                    rowNum={idx + 1}
                    saving={saving.has(doc._id)}
                    selected={selected.has(doc._id)}
                    onToggleSelect={() => toggleSelect(doc._id)}
                    onPatch={patch}
                    onEdit={() => router.navigate({ selectedId: doc._id })}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, idx)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 가격표 업로드 — 실행 전 확인 */}
      {importPlan && (
        <div className="tt-modal-overlay">
          <div className="tt-modal tt-modal-wide">
            <h3 className="tt-modal-title">가격표 반영 — 방식 선택</h3>

            {/* 반영 방식 선택 */}
            <div className="tt-mode-toggle">
              <button
                className={`tt-mode-btn ${importPlan.mode === 'replace' ? 'active' : ''}`}
                onClick={() => computePlan('replace')}
                disabled={importing}
              >
                이것만 남기기
                <span className="tt-mode-sub">빠진 옵션 삭제</span>
              </button>
              <button
                className={`tt-mode-btn ${importPlan.mode === 'upsert' ? 'active' : ''}`}
                onClick={() => computePlan('upsert')}
                disabled={importing}
              >
                덮어쓰기
                <span className="tt-mode-sub">추가·갱신만</span>
              </button>
            </div>

            <div className="tt-import-summary">
              <div className="tt-import-stat">
                <span className="tt-import-stat-num">
                  {importPlan.updates.length}
                </span>
                <span className="tt-import-stat-label">갱신 시술</span>
              </div>
              <div className="tt-import-stat">
                <span className="tt-import-stat-num">
                  {importPlan.optionTotal}
                </span>
                <span className="tt-import-stat-label">가격옵션</span>
              </div>
              {importPlan.mode === 'replace' && importPlan.removedTotal > 0 && (
                <div className="tt-import-stat tt-import-stat-danger">
                  <span className="tt-import-stat-num">
                    {importPlan.removedTotal}
                  </span>
                  <span className="tt-import-stat-label">삭제 옵션</span>
                </div>
              )}
              {importPlan.invalid.length > 0 && (
                <div className="tt-import-stat tt-import-stat-warn">
                  <span className="tt-import-stat-num">
                    {importPlan.invalid.length}
                  </span>
                  <span className="tt-import-stat-label">오류(제외)</span>
                </div>
              )}
            </div>

            <p className="tt-import-note">
              {importPlan.mode === 'replace' ? (
                <>
                  슬러그 기준으로 각 시술의 가격옵션을 시트 내용으로 교체합니다.
                  <strong> 시트에서 빠진 옵션은 삭제됩니다.</strong>{' '}
                  영어·중국어·일본어 번역은 적용부위·옵션명·용량(한국어
                  기준)으로 매칭해 보존됩니다. 시트에 없는 시술은 변경되지
                  않습니다.
                </>
              ) : (
                <>
                  시트의 옵션을 추가·갱신만 합니다.{' '}
                  <strong>
                    시트에 없는 기존 옵션은 삭제하지 않고 그대로 둡니다.
                  </strong>{' '}
                  번역은 적용부위·옵션명·용량(한국어 기준)으로 매칭해
                  보존됩니다.
                </>
              )}
            </p>

            {importPlan.updates.length > 0 && (
              <div className="tt-import-list">
                <p className="tt-import-list-title">
                  갱신될 시술 — {importPlan.updates.length}개
                </p>
                <ul>
                  {importPlan.updates.map((u) => (
                    <li key={u.id}>
                      {u.name || '(이름없음)'}{' '}
                      <span className="tt-import-slug">{u.slug}</span> · 옵션{' '}
                      {u.optionCount}개
                      {importPlan.mode === 'replace' && u.removed > 0 && (
                        <span className="tt-import-removed">
                          {' '}
                          · 삭제 {u.removed}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {importPlan.invalid.length > 0 && (
              <div className="tt-import-list tt-import-list-warn">
                <p className="tt-import-list-title">
                  반영되지 않는 행 — {importPlan.invalid.length}개
                </p>
                <ul>
                  {importPlan.invalid.map((v, i) => (
                    <li key={i}>
                      {v.rowNum}행 {v.name && `· ${v.name}`}{' '}
                      {v.slug && (
                        <span className="tt-import-slug">{v.slug}</span>
                      )}{' '}
                      — {v.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {importing && importProgress && (
              <div className="tt-import-progress">
                <span className="tt-spinner" />
                <div className="tt-import-progress-body">
                  <div className="tt-import-progress-text">
                    반영 중… {importProgress.done}/{importProgress.total} 시술
                  </div>
                  <div className="tt-progress-bar">
                    <div
                      className="tt-progress-fill"
                      style={{
                        width: `${
                          importProgress.total
                            ? (importProgress.done / importProgress.total) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                  <div className="tt-import-progress-warn">
                    완료될 때까지 이 창과 브라우저 탭을 닫지 마세요. 중간에
                    닫으면 남은 시술은 반영되지 않습니다.
                  </div>
                </div>
              </div>
            )}

            <div className="tt-modal-actions">
              <button
                className="tt-modal-cancel"
                onClick={() => {
                  setImportPlan(null);
                  importSource.current = null;
                }}
                disabled={importing}
              >
                취소
              </button>
              <button
                className="tt-modal-confirm"
                onClick={runImport}
                disabled={importing || importPlan.updates.length === 0}
              >
                {importing
                  ? '반영 중…'
                  : importPlan.mode === 'replace'
                    ? '이것만 남기기 실행'
                    : '덮어쓰기 실행'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 가격표 업로드 — 결과 */}
      {importResult && (
        <div className="tt-modal-overlay">
          <div className="tt-modal tt-modal-wide">
            <h3 className="tt-modal-title">가격표 반영 완료</h3>
            <div className="tt-import-summary">
              <div className="tt-import-stat">
                <span className="tt-import-stat-num">
                  {importResult.updated}
                </span>
                <span className="tt-import-stat-label">갱신 시술</span>
              </div>
              <div className="tt-import-stat">
                <span className="tt-import-stat-num">
                  {importResult.optionTotal}
                </span>
                <span className="tt-import-stat-label">가격옵션</span>
              </div>
              {importResult.mode === 'replace' &&
                importResult.removedTotal > 0 && (
                  <div className="tt-import-stat tt-import-stat-danger">
                    <span className="tt-import-stat-num">
                      {importResult.removedTotal}
                    </span>
                    <span className="tt-import-stat-label">삭제 옵션</span>
                  </div>
                )}
              {(importResult.failures.length > 0 ||
                importResult.invalid.length > 0) && (
                <div className="tt-import-stat tt-import-stat-warn">
                  <span className="tt-import-stat-num">
                    {importResult.failures.length + importResult.invalid.length}
                  </span>
                  <span className="tt-import-stat-label">실패</span>
                </div>
              )}
            </div>

            {(importResult.failures.length > 0 ||
              importResult.invalid.length > 0) && (
              <div className="tt-import-list tt-import-list-warn">
                <p className="tt-import-list-title">
                  반영하지 못한 항목 —{' '}
                  {importResult.failures.length + importResult.invalid.length}개
                </p>
                <ul>
                  {importResult.invalid.map((v, i) => (
                    <li key={`inv-${i}`}>
                      {v.rowNum}행 {v.name && `· ${v.name}`}{' '}
                      {v.slug && (
                        <span className="tt-import-slug">{v.slug}</span>
                      )}{' '}
                      — {v.reason}
                    </li>
                  ))}
                  {importResult.failures.map((f, i) => (
                    <li key={`fail-${i}`}>
                      {f.name || '(이름없음)'}{' '}
                      <span className="tt-import-slug">{f.slug}</span> —{' '}
                      {f.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="tt-modal-actions">
              <button
                className="tt-modal-confirm"
                onClick={() => setImportResult(null)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 엑셀 오류 알림 */}
      {importError && (
        <div className="tt-modal-overlay">
          <div className="tt-modal">
            <h3 className="tt-modal-title">엑셀 처리 오류</h3>
            <p className="tt-modal-body">{importError}</p>
            <div className="tt-modal-actions">
              <button
                className="tt-modal-confirm"
                onClick={() => setImportError(null)}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation popup */}
      {deleteConfirm && (
        <div className="tt-modal-overlay">
          <div className="tt-modal">
            <h3 className="tt-modal-title">시술 삭제</h3>
            <p className="tt-modal-body">
              선택한 {selected.size}개의 시술을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="tt-modal-actions">
              <button
                className="tt-modal-cancel"
                onClick={() => setDeleteConfirm(false)}
              >
                취소
              </button>
              <button className="tt-modal-delete" onClick={handleBulkDelete}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TreatmentRow({
  doc,
  rowNum,
  saving,
  selected,
  onToggleSelect,
  onPatch,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  doc: TreatmentDoc;
  rowNum: number;
  saving: boolean;
  selected: boolean;
  onToggleSelect: () => void;
  onPatch: (id: string, fields: Record<string, unknown>) => Promise<void>;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const isDragging = useRef(false);
  const firstPrice = doc.priceOptions?.[0];
  const price = firstPrice?.price;
  const discountPrice = firstPrice?.discountPrice;

  return (
    <tr
      className="tt-row-clickable"
      style={{
        opacity: saving ? 0.5 : 1,
        background: selected ? 'var(--card-bg2-color)' : undefined,
      }}
      draggable
      onDragStart={(e) => {
        isDragging.current = true;
        onDragStart(e);
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => {
        if (!isDragging.current) onEdit();
      }}
    >
      <td
        className="tt-drag-handle"
        style={{ textAlign: 'center', cursor: 'grab' }}
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </td>

      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="tt-checkbox"
          checked={selected}
          onChange={onToggleSelect}
        />
      </td>

      <td className="tt-row-num">{rowNum}</td>

      <td>
        <span className="tt-name-link">{doc.name || '(미입력)'}</span>
        <div className="tt-name-slug">{doc.slug}</div>
      </td>

      <td onClick={(e) => e.stopPropagation()}>
        <select
          className="tt-category-select"
          value={doc.category || ''}
          onChange={(e) => onPatch(doc._id, { category: e.target.value })}
        >
          <option value="">—</option>
          {EDITABLE_CATEGORIES.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.label}
            </option>
          ))}
        </select>
      </td>

      <td style={{ textAlign: 'center' }}>
        <span
          className={`tt-event-badge${doc.isEvent ? 'tt-event-badge-on' : ''}`}
          title="가격 옵션에 '이벤트' 항목이 있으면 자동으로 표시됩니다"
        >
          {doc.isEvent ? 'EVENT' : '—'}
        </span>
      </td>

      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="tt-toggle tt-toggle-sig"
          checked={!!doc.isSignature}
          onChange={(e) => onPatch(doc._id, { isSignature: e.target.checked })}
        />
      </td>

      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="tt-toggle"
          checked={!!doc.isVisible}
          onChange={(e) => onPatch(doc._id, { isVisible: e.target.checked })}
        />
      </td>

      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="tt-toggle"
          checked={!!doc.showInMenu}
          onChange={(e) => onPatch(doc._id, { showInMenu: e.target.checked })}
        />
      </td>

      <td className="tt-price">
        {price ? (
          discountPrice ? (
            <>
              <div className="tt-price-discount">
                ₩{discountPrice.toLocaleString()}
              </div>
              <div className="tt-price-original">₩{price.toLocaleString()}</div>
            </>
          ) : (
            <div>₩{price.toLocaleString()}</div>
          )
        ) : (
          <span style={{ color: 'var(--card-muted-fg-color)' }}>—</span>
        )}
      </td>
    </tr>
  );
}
