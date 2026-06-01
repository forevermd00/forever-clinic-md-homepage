import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useClient } from 'sanity';
import { useRouter, useRouterState } from 'sanity/router';
import type { BnaDoc } from './types';
import { BnaDetail } from './BnaDetail';
import './bna-tool.css';

const QUERY = `
  *[_type == "baCase"] | order(sortOrder asc, _createdAt asc) {
    _id, _updatedAt,
    "title": title,
    categories,
    sessions, showOnMain, isVisible, sortOrder
  }
`;

const BNA_CATEGORIES: { slug: string; label: string }[] = [
  { slug: 'all', label: '전체' },
  { slug: 'lifting-laser', label: '리프팅·레이저' },
  { slug: 'petit-lifting', label: '쁘띠·실리프팅' },
  { slug: 'skincare', label: '스킨케어' },
  { slug: 'skin-booster', label: '스킨부스터' },
  { slug: 'hair-removal', label: '제모' },
  { slug: 'anesthesia', label: '마취' },
];

function docTitle(doc: BnaDoc): string {
  return doc.title?.ko || doc.title?.en || '(제목 없음)';
}

export function BnaTool() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const router = useRouter();
  const routerState = useRouterState() as { selectedId?: string } | null;
  const selectedId = routerState?.selectedId ?? null;

  const [docs, setDocs] = useState<BnaDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const refetch = useCallback(() => {
    client.fetch<BnaDoc[]>(QUERY).then((data) => {
      setDocs(data);
    });
  }, [client]);

  useEffect(() => {
    let cancelled = false;
    client.fetch<BnaDoc[]>(QUERY).then((data) => {
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
    if (activeTab !== 'all') {
      result = result.filter((d) => d.categories?.includes(activeTab));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((d) => docTitle(d).toLowerCase().includes(q));
    }
    return result;
  }, [docs, activeTab, search]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: docs.length };
    docs.forEach((d) => {
      d.categories?.forEach((cat) => {
        c[cat] = (c[cat] || 0) + 1;
      });
    });
    return c;
  }, [docs]);

  const handleAdd = useCallback(async () => {
    const newDoc = await client.create({ _type: 'baCase', isVisible: true });
    router.navigate({ selectedId: newDoc._id });
  }, [client, router]);

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

  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, idx: number) => {
    e.dataTransfer.setData('text/plain', String(idx));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => setDragOverIdx(null);

  const handleDrop = useCallback(
    async (e: React.DragEvent, dropIdx: number) => {
      e.preventDefault();
      setDragOverIdx(null);
      const from = parseInt(e.dataTransfer.getData('text/plain'), 10);
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

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
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

  if (selectedId) {
    return (
      <BnaDetail
        id={selectedId}
        onBack={() => {
          router.navigate({});
          refetch();
        }}
      />
    );
  }

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((d) => selected.has(d._id));

  return (
    <div className="bn-container">
      {/* Category Tabs */}
      <div className="bn-tabs">
        {BNA_CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            className={`bn-tab ${activeTab === cat.slug ? 'active' : ''}`}
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
      <div className="bn-toolbar">
        <input
          className="bn-search"
          placeholder="제목 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bn-add-btn" onClick={handleAdd}>
          + 추가
        </button>
        {selected.size > 0 && (
          <button
            className="bn-delete-btn"
            onClick={() => setDeleteConfirm(true)}
          >
            선택 {selected.size}개 삭제
          </button>
        )}
        <span className="bn-count">{filtered.length}개 케이스</span>
      </div>

      {loading ? (
        <div className="bn-loading">불러오는 중...</div>
      ) : (
        <div className="bn-table-wrap">
          <table className="bn-table">
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: '32px' }} />
              <col style={{ width: '44px' }} />
              <col />
              <col style={{ width: '120px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '60px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ cursor: 'default' }}>⠿</th>
                <th style={{ cursor: 'default', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="bn-checkbox"
                    checked={allFilteredSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>No.</th>
                <th>제목</th>
                <th>카테고리</th>
                <th style={{ textAlign: 'center' }}>횟수</th>
                <th style={{ textAlign: 'center' }}>메인노출</th>
                <th style={{ textAlign: 'center' }}>노출</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="bn-empty">
                    BnA 케이스가 없습니다
                  </td>
                </tr>
              ) : (
                filtered.map((doc, idx) => (
                  <BnaRow
                    key={doc._id}
                    doc={doc}
                    rowNum={idx + 1}
                    saving={saving.has(doc._id)}
                    selected={selected.has(doc._id)}
                    onToggleSelect={() => toggleSelect(doc._id)}
                    onPatch={patch}
                    onEdit={() => router.navigate({ selectedId: doc._id })}
                    dragOver={dragOverIdx === idx}
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragEnter={() => setDragOverIdx(idx)}
                    onDragLeave={() =>
                      setDragOverIdx((prev) => (prev === idx ? null : prev))
                    }
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                    }}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, idx)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation popup */}
      {deleteConfirm && (
        <div className="bn-modal-overlay">
          <div className="bn-modal">
            <h3 className="bn-modal-title">케이스 삭제</h3>
            <p className="bn-modal-body">
              선택한 {selected.size}개의 케이스를 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="bn-modal-actions">
              <button
                className="bn-modal-cancel"
                onClick={() => setDeleteConfirm(false)}
              >
                취소
              </button>
              <button className="bn-modal-delete" onClick={handleBulkDelete}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BnaRow({
  doc,
  rowNum,
  saving,
  selected,
  dragOver,
  onToggleSelect,
  onPatch,
  onEdit,
  onDragStart,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDragEnd,
  onDrop,
}: {
  doc: BnaDoc;
  rowNum: number;
  saving: boolean;
  selected: boolean;
  dragOver: boolean;
  onToggleSelect: () => void;
  onPatch: (id: string, fields: Record<string, unknown>) => Promise<void>;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const isDragging = useRef(false);

  const CATEGORY_LABEL: Record<string, string> = {
    'lifting-laser': '리프팅·레이저',
    'petit-lifting': '쁘띠·실리프팅',
    skincare: '스킨케어',
    'skin-booster': '스킨부스터',
    'hair-removal': '제모',
    anesthesia: '마취',
  };

  return (
    <tr
      className="bn-row-clickable"
      style={{
        opacity: saving ? 0.5 : 1,
        background: dragOver
          ? 'var(--card-bg2-color)'
          : selected
            ? 'var(--card-bg2-color)'
            : undefined,
        outline: dragOver ? '2px solid var(--card-fg-color)' : undefined,
        outlineOffset: '-1px',
      }}
      draggable
      onDragStart={(e) => {
        isDragging.current = true;
        onDragStart(e);
      }}
      onDragEnd={() => {
        onDragEnd();
        setTimeout(() => {
          isDragging.current = false;
        }, 50);
      }}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={() => {
        if (!isDragging.current) onEdit();
      }}
    >
      <td
        className="bn-drag-handle"
        style={{ textAlign: 'center', cursor: 'grab' }}
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </td>

      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="bn-checkbox"
          checked={selected}
          onChange={onToggleSelect}
        />
      </td>

      <td className="bn-row-num">{rowNum}</td>

      <td>
        <span className="bn-treatment-name">{docTitle(doc)}</span>
      </td>

      <td>
        <span style={{ fontSize: 11, color: 'var(--card-muted-fg-color)' }}>
          {doc.categories?.map((c) => CATEGORY_LABEL[c] || c).join(', ') || '—'}
        </span>
      </td>

      <td style={{ textAlign: 'center' }}>
        <span style={{ color: 'var(--card-muted-fg-color)' }}>
          {doc.sessions != null ? `${doc.sessions}회` : '—'}
        </span>
      </td>

      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="bn-toggle bn-toggle-main"
          checked={!!doc.showOnMain}
          onChange={(e) => onPatch(doc._id, { showOnMain: e.target.checked })}
        />
      </td>

      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="bn-toggle"
          checked={!!doc.isVisible}
          onChange={(e) => onPatch(doc._id, { isVisible: e.target.checked })}
        />
      </td>
    </tr>
  );
}
