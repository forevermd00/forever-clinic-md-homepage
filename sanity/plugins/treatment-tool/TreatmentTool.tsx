import { useState, useEffect, useCallback, useMemo } from 'react';
import { useClient } from 'sanity';
import {
  TreatmentDoc,
  CATEGORIES,
  CATEGORY_LABEL,
  EDITABLE_CATEGORIES,
} from './types';
import { TreatmentDetail } from './TreatmentDetail';
import './treatment-tool.css';

const QUERY = `
  *[_type == "treatment"] | order(sortOrder asc, _createdAt asc) {
    _id, _updatedAt,
    "name": coalesce(name.ko, name.en, ""),
    "slug": coalesce(slug.current, ""),
    category,
    isEvent,
    isSignature,
    isVisible,
    sortOrder,
    priceOptions[] { price, discountPrice },
    eventStartDate, eventEndDate
  }
`;

type SortKey = 'sortOrder' | 'name' | 'category';
type SortDir = 'asc' | 'desc';

export function TreatmentTool() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<TreatmentDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('sortOrder');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);

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
    const c: Record<string, number> = { all: docs.length, _event: 0 };
    docs.forEach((d) => {
      if (d.category) c[d.category] = (c[d.category] || 0) + 1;
      if (d.isEvent) c._event++;
    });
    return c;
  }, [docs]);

  const sortIcon = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  if (selectedId) {
    return (
      <TreatmentDetail id={selectedId} onBack={() => setSelectedId(null)} />
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
        <span className="tt-count">{filtered.length}개 시술</span>
      </div>

      {/* Table */}
      {loading ? (
        <div className="tt-loading">불러오는 중...</div>
      ) : (
        <div className="tt-table-wrap">
          <table className="tt-table">
            <colgroup>
              <col style={{ width: '36px' }} />
              <col style={{ width: '52px' }} />
              <col style={{ width: '26%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '60px' }} />
              <col style={{ width: '60px' }} />
              <col style={{ width: '60px' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '80px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>⠿</th>
                <th onClick={() => handleSort('sortOrder')}>
                  순서
                  <span className="tt-sort-icon">{sortIcon('sortOrder')}</span>
                </th>
                <th onClick={() => handleSort('name')}>
                  시술명
                  <span className="tt-sort-icon">{sortIcon('name')}</span>
                </th>
                <th onClick={() => handleSort('category')}>
                  카테고리
                  <span className="tt-sort-icon">{sortIcon('category')}</span>
                </th>
                <th>이벤트</th>
                <th>시그니처</th>
                <th>노출</th>
                <th>가격</th>
                <th>편집</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="tt-empty">
                    시술이 없습니다
                  </td>
                </tr>
              ) : (
                filtered.map((doc, idx) => (
                  <TreatmentRow
                    key={doc._id}
                    doc={doc}
                    saving={saving.has(doc._id)}
                    onPatch={patch}
                    onEdit={() => setSelectedId(doc._id)}
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
    </div>
  );
}

function TreatmentRow({
  doc,
  saving,
  onPatch,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  doc: TreatmentDoc;
  saving: boolean;
  onPatch: (id: string, fields: Record<string, unknown>) => Promise<void>;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const firstPrice = doc.priceOptions?.[0];
  const price = firstPrice?.price;
  const discountPrice = firstPrice?.discountPrice;

  return (
    <tr
      style={{ opacity: saving ? 0.5 : 1 }}
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <td
        className="tt-drag-handle"
        style={{ textAlign: 'center', cursor: 'grab' }}
      >
        ⠿
      </td>

      <td>
        <input
          className="tt-order-input"
          type="number"
          defaultValue={doc.sortOrder ?? 0}
          onBlur={(e) => {
            const v = parseInt(e.target.value, 10);
            if (!isNaN(v) && v !== doc.sortOrder) {
              onPatch(doc._id, { sortOrder: v });
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      </td>

      <td>
        <span className="tt-name-link">{doc.name || '(미입력)'}</span>
        <div className="tt-name-slug">{doc.slug}</div>
      </td>

      <td>
        <select
          className="tt-category-select"
          value={doc.category || ''}
          onChange={(e) => onPatch(doc._id, { category: e.target.value })}
          onClick={(e) => e.stopPropagation()}
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
        <input
          type="checkbox"
          className="tt-toggle tt-toggle-event"
          checked={!!doc.isEvent}
          onChange={(e) => onPatch(doc._id, { isEvent: e.target.checked })}
        />
      </td>

      <td style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          className="tt-toggle tt-toggle-sig"
          checked={!!doc.isSignature}
          onChange={(e) => onPatch(doc._id, { isSignature: e.target.checked })}
        />
      </td>

      <td style={{ textAlign: 'center' }}>
        <input
          type="checkbox"
          className="tt-toggle"
          checked={!!doc.isVisible}
          onChange={(e) => onPatch(doc._id, { isVisible: e.target.checked })}
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

      <td>
        <button className="tt-edit-btn" onClick={onEdit}>
          편집
        </button>
      </td>
    </tr>
  );
}
