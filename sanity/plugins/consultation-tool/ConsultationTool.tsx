import { useEffect, useState, useCallback, useMemo } from 'react';
import { useClient } from 'sanity';
import { ConsultationDoc, STATUS_OPTIONS, SOURCE_LABELS } from './types';
import { DetailModal } from './DetailModal';
import './consultation-tool.css';

const QUERY = `*[_type == "contactInquiry"] | order(createdAt desc) {
  _id, _createdAt, name, phone, email, message, source,
  status, consultNote, createdAt, preferredDate, preferredTime,
  isHidden,
  "treatments": selectedTreatments[]{ name, packageLabel, quantity }
}`;

type SortKey =
  | 'status'
  | 'createdAt'
  | 'name'
  | 'phone'
  | 'treatments'
  | 'message'
  | 'source'
  | 'consultNote'
  | 'preferredDate';
type SortDir = 'asc' | 'desc';

type Column = { key: SortKey; label: string; width: string };

const DEFAULT_COLUMNS: Column[] = [
  { key: 'status', label: '상태', width: '7%' },
  { key: 'createdAt', label: '문의일시', width: '10%' },
  { key: 'name', label: '이름', width: '7%' },
  { key: 'phone', label: '연락처', width: '10%' },
  { key: 'source', label: '출처', width: '6%' },
  { key: 'preferredDate', label: '희망 예약일', width: '10%' },
  { key: 'treatments', label: '관심 시술', width: '13%' },
  { key: 'message', label: '문의 내용', width: '17%' },
  { key: 'consultNote', label: '상담 메모', width: '20%' },
];

const STORAGE_KEY = 'ct-column-order';

function loadColumnOrder(): Column[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return DEFAULT_COLUMNS;
    const keys = JSON.parse(saved) as SortKey[];
    const byKey = new Map(DEFAULT_COLUMNS.map((c) => [c.key, c]));
    const ordered = keys.map((k) => byKey.get(k)).filter(Boolean) as Column[];
    // 저장된 순서에 없는 새 컬럼 추가
    DEFAULT_COLUMNS.forEach((c) => {
      if (!ordered.find((o) => o.key === c.key)) ordered.push(c);
    });
    return ordered;
  } catch {
    return DEFAULT_COLUMNS;
  }
}

function saveColumnOrder(columns: Column[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(columns.map((c) => c.key)));
}

function getSortValue(doc: ConsultationDoc, key: SortKey): string {
  switch (key) {
    case 'createdAt':
      return doc.createdAt || doc._createdAt || '';
    case 'treatments':
      return formatTreatments(doc);
    case 'source':
      return SOURCE_LABELS[doc.source || ''] || doc.source || '';
    case 'preferredDate':
      return doc.preferredDate
        ? `${doc.preferredDate}${doc.preferredTime ? ' ' + doc.preferredTime : ''}`
        : '';
    default:
      return String((doc as unknown as Record<string, unknown>)[key] || '');
  }
}

export function ConsultationTool() {
  const client = useClient({ apiVersion: '2026-04-25' });
  const [docs, setDocs] = useState<ConsultationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expanded, setExpanded] = useState(false);
  const [editingMemo, setEditingMemo] = useState<string | null>(null);
  const [editingMemoValue, setEditingMemoValue] = useState('');
  const [columns, setColumns] = useState<Column[]>(loadColumnOrder);
  const [dragCol, setDragCol] = useState<number | null>(null);
  const [showHidden, setShowHidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    client.fetch(QUERY).then((data) => {
      if (!cancelled) {
        setDocs(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const allDocs = docs;

  const filtered = useMemo(() => {
    const pool = showHidden
      ? allDocs.filter((d) => d.isHidden === true)
      : allDocs.filter((d) => d.isHidden !== true);

    if (showHidden) return pool;

    const result = pool.filter((d) => {
      if (statusFilters.size > 0 && !statusFilters.has(d.status)) return false;
      if (search) {
        const q = search.toLowerCase();
        const treatments =
          d.treatments?.map((t) => t.name || '').join(' ') || '';
        return (
          d.name?.toLowerCase().includes(q) ||
          d.phone?.includes(q) ||
          treatments.toLowerCase().includes(q)
        );
      }
      return true;
    });

    result.sort((a, b) => {
      const va = getSortValue(a, sortKey).toLowerCase();
      const vb = getSortValue(b, sortKey).toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [allDocs, statusFilters, search, sortKey, sortDir, showHidden]);

  const stats = useMemo(() => {
    const counts: Record<string, number> = { all: allDocs.length };
    STATUS_OPTIONS.forEach((s) => (counts[s.value] = 0));
    allDocs.forEach((d) => {
      if (counts[d.status] !== undefined) counts[d.status]++;
    });
    return counts;
  }, [allDocs]);

  const handleColumnDrop = useCallback(
    (dropIdx: number) => {
      if (dragCol === null || dragCol === dropIdx) return;
      setColumns((prev) => {
        const next = [...prev];
        const [moved] = next.splice(dragCol, 1);
        next.splice(dropIdx, 0, moved);
        saveColumnOrder(next);
        return next;
      });
      setDragCol(null);
    },
    [dragCol],
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const toggleStatusFilter = (value: string) => {
    setStatusFilters((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  const handlePatch = useCallback(
    async (id: string, fields: Record<string, unknown>) => {
      await client.patch(id).set(fields).commit();
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, ...fields } : d)),
      );
    },
    [client],
  );

  const handleHide = useCallback(
    async (id: string) => {
      if (
        !window.confirm(
          '이 상담을 숨기겠습니까?\n(숨김 목록에서 복원 가능합니다)',
        )
      )
        return;
      await client.patch(id).set({ isHidden: true }).commit();
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isHidden: true } : d)),
      );
      setSelectedId(null);
    },
    [client],
  );

  const handleUnhide = useCallback(
    async (id: string) => {
      await client.patch(id).set({ isHidden: false }).commit();
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, isHidden: false } : d)),
      );
    },
    [client],
  );

  const handleMemoBlur = useCallback(
    async (id: string) => {
      const doc = docs.find((d) => d._id === id);
      if (!doc || doc.consultNote === editingMemoValue) {
        setEditingMemo(null);
        return;
      }
      await handlePatch(id, { consultNote: editingMemoValue });
      setEditingMemo(null);
    },
    [docs, editingMemoValue, handlePatch],
  );

  const handleExportCsv = useCallback(() => {
    const headers = [
      '상태',
      '문의일시',
      '이름',
      '연락처',
      '이메일',
      '관심 시술',
      '문의 내용',
      '출처',
      '상담 메모',
    ];
    const rows = filtered.map((d) => [
      STATUS_OPTIONS.find((s) => s.value === d.status)?.label || d.status,
      formatDate(d.createdAt || d._createdAt),
      d.name,
      d.phone,
      d.email || '',
      formatTreatments(d),
      (d.message || '').replace(/\n/g, ' '),
      SOURCE_LABELS[d.source || ''] || d.source || '',
      (d.consultNote || '').replace(/\n/g, ' '),
    ]);
    const bom = '\uFEFF';
    const csv =
      bom +
      [headers, ...rows]
        .map((r) => r.map((c) => `"${c}"`).join(','))
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `consultations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [filtered]);

  const selectedDoc = allDocs.find((d) => d._id === selectedId) || null;

  return (
    <div className="ct-container">
      {/* Stats */}
      <div className="ct-stats">
        <div className="ct-stat-card">
          <div className="ct-stat-label">전체</div>
          <div className="ct-stat-val">{stats.all}</div>
        </div>
        {STATUS_OPTIONS.map((s) => (
          <div className="ct-stat-card" key={s.value}>
            <div className="ct-stat-label">{s.label}</div>
            <div className={`ct-stat-val ct-stat-val-${s.value}`}>
              {stats[s.value] || 0}
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="ct-toolbar">
        {!showHidden && (
          <>
            <div className="ct-status-filters">
              {STATUS_OPTIONS.map((s) => (
                <label key={s.value} className="ct-checkbox-label">
                  <input
                    type="checkbox"
                    checked={statusFilters.has(s.value)}
                    onChange={() => toggleStatusFilter(s.value)}
                  />
                  <StatusBadge status={s.value} />
                </label>
              ))}
            </div>
            <input
              className="ct-search"
              placeholder="이름, 연락처, 시술명 검색"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button
              className={`ct-btn ct-btn-expand ${expanded ? 'active' : ''}`}
              onClick={() => setExpanded((v) => !v)}
              title={expanded ? '한 줄로 보기' : '늘려서 보기'}
            >
              {expanded ? '한 줄' : '펼침'}
            </button>
            <button className="ct-btn ct-btn-export" onClick={handleExportCsv}>
              CSV 내보내기
            </button>
          </>
        )}
        <button
          className="ct-btn ct-btn-hidden"
          onClick={() => setShowHidden((v) => !v)}
        >
          {showHidden ? '← 돌아가기' : '숨김 목록'}
        </button>
      </div>

      {/* Table */}
      {showHidden && <div className="ct-hidden-header">숨김 목록</div>}
      {loading ? (
        <div className="ct-loading">불러오는 중...</div>
      ) : (
        <div className="ct-table-wrap">
          <table className="ct-table">
            <thead>
              <tr>
                {!showHidden ? (
                  columns.map((col, idx) => (
                    <th
                      key={col.key}
                      style={{ width: col.width }}
                      className={`ct-th-sortable ${dragCol !== null ? 'ct-th-dragging' : ''}`}
                      draggable
                      onDragStart={() => setDragCol(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleColumnDrop(idx)}
                      onDragEnd={() => setDragCol(null)}
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <span className="ct-sort-icon">
                        {sortKey === col.key
                          ? sortDir === 'asc'
                            ? ' ↑'
                            : ' ↓'
                          : ''}
                      </span>
                    </th>
                  ))
                ) : (
                  <>
                    <th style={{ width: '10%' }} className="ct-th-sortable">
                      문의일시
                    </th>
                    <th style={{ width: '8%' }} className="ct-th-sortable">
                      이름
                    </th>
                    <th style={{ width: '11%' }} className="ct-th-sortable">
                      연락처
                    </th>
                    <th style={{ width: '8%' }} className="ct-th-sortable">
                      상태
                    </th>
                    <th style={{ width: '20%' }} className="ct-th-sortable">
                      문의 내용
                    </th>
                    <th style={{ width: '8%' }} className="ct-th-sortable"></th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={showHidden ? 6 : columns.length}
                    className="ct-empty"
                  >
                    {showHidden
                      ? '숨김 처리된 상담이 없습니다'
                      : '상담 내역이 없습니다'}
                  </td>
                </tr>
              ) : showHidden ? (
                filtered.map((doc) => (
                  <tr key={doc._id}>
                    <td>{formatDate(doc.createdAt || doc._createdAt)}</td>
                    <td className="ct-td-bold">{doc.name}</td>
                    <td>{doc.phone}</td>
                    <td>
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="ct-ellipsis ct-td-muted">
                      {doc.message || '-'}
                    </td>
                    <td>
                      <button
                        className="ct-btn ct-btn-unhide"
                        onClick={() => handleUnhide(doc._id)}
                      >
                        숨김 취소
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                filtered.map((doc) => (
                  <tr
                    key={doc._id}
                    className={expanded ? 'ct-row-expanded' : ''}
                  >
                    {columns.map((col) => (
                      <CellRenderer
                        key={col.key}
                        col={col}
                        doc={doc}
                        expanded={expanded}
                        editingMemo={editingMemo}
                        editingMemoValue={editingMemoValue}
                        onSelect={() => setSelectedId(doc._id)}
                        onMemoEdit={() => {
                          setEditingMemo(doc._id);
                          setEditingMemoValue(doc.consultNote || '');
                        }}
                        onMemoChange={setEditingMemoValue}
                        onMemoBlur={() => handleMemoBlur(doc._id)}
                        onMemoCancel={() => setEditingMemo(null)}
                      />
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="ct-hint">
        {filtered.length}건
        {statusFilters.size > 0 || search ? ' (필터 적용됨)' : ''}
        {' · 행을 클릭하면 상세, 메모 셀을 클릭하면 바로 수정'}
      </div>

      {/* Detail Modal */}
      {selectedDoc && (
        <DetailModal
          doc={selectedDoc}
          onClose={() => setSelectedId(null)}
          onPatch={handlePatch}
          onHide={handleHide}
          isExample={false}
        />
      )}
    </div>
  );
}

function CellRenderer({
  col,
  doc,
  expanded,
  editingMemo,
  editingMemoValue,
  onSelect,
  onMemoEdit,
  onMemoChange,
  onMemoBlur,
  onMemoCancel,
}: {
  col: Column;
  doc: ConsultationDoc;
  expanded: boolean;
  editingMemo: string | null;
  editingMemoValue: string;
  onSelect: () => void;
  onMemoEdit: () => void;
  onMemoChange: (v: string) => void;
  onMemoBlur: () => void;
  onMemoCancel: () => void;
}) {
  switch (col.key) {
    case 'status':
      return (
        <td onClick={onSelect}>
          <StatusBadge status={doc.status} />
        </td>
      );
    case 'createdAt':
      return (
        <td onClick={onSelect}>
          {formatDate(doc.createdAt || doc._createdAt)}
        </td>
      );
    case 'name':
      return (
        <td className="ct-td-bold" onClick={onSelect}>
          {doc.name}
        </td>
      );
    case 'phone':
      return <td onClick={onSelect}>{doc.phone}</td>;
    case 'source':
      return (
        <td onClick={onSelect}>{SOURCE_LABELS[doc.source || ''] || '-'}</td>
      );
    case 'preferredDate':
      return (
        <td
          onClick={onSelect}
          className={doc.preferredDate ? 'ct-td-bold' : 'ct-td-muted'}
        >
          {doc.preferredDate
            ? `${doc.preferredDate}${doc.preferredTime ? ' ' + doc.preferredTime : ''}`
            : '-'}
        </td>
      );
    case 'treatments':
      return (
        <td
          className={expanded ? 'ct-td-wrap' : 'ct-ellipsis'}
          onClick={onSelect}
        >
          {formatTreatments(doc)}
        </td>
      );
    case 'message':
      return (
        <td
          className={`ct-td-muted ${expanded ? 'ct-td-wrap' : 'ct-ellipsis'}`}
          onClick={onSelect}
        >
          {doc.message || '-'}
        </td>
      );
    case 'consultNote':
      return (
        <td
          className={`ct-td-memo ${expanded ? 'ct-td-wrap' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onMemoEdit();
          }}
        >
          {editingMemo === doc._id ? (
            <textarea
              className="ct-memo-inline"
              value={editingMemoValue}
              onChange={(e) => onMemoChange(e.target.value)}
              onBlur={onMemoBlur}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onMemoCancel();
              }}
              autoFocus
              rows={2}
            />
          ) : (
            <span
              className={`ct-memo-text ${expanded ? '' : 'ct-ellipsis-inline'}`}
            >
              {doc.consultNote || (
                <span className="ct-td-muted">메모 추가...</span>
              )}
            </span>
          )}
        </td>
      );
    default:
      return <td onClick={onSelect}>-</td>;
  }
}

export function StatusBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find((s) => s.value === status);
  if (!opt) return <span>{status}</span>;
  return <span className={`ct-badge ct-badge-${status}`}>{opt.label}</span>;
}

export function formatDate(dateStr: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatTreatments(doc: ConsultationDoc) {
  if (!doc.treatments?.length) return '-';
  return doc.treatments.map((t) => t.name || '?').join(', ');
}

export function formatTreatmentDetails(doc: ConsultationDoc) {
  if (!doc.treatments?.length) return '';
  return doc.treatments
    .map((t) => {
      const parts = [t.name || '?'];
      if (t.packageLabel) parts.push(t.packageLabel);
      if (t.quantity && t.quantity > 1) parts.push(`×${t.quantity}`);
      return parts.join(' ');
    })
    .join('\n');
}
