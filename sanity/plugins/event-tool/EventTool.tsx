import { useState, useEffect, useCallback, useRef } from 'react';
import { useClient } from 'sanity';
import { useRouter, useRouterState } from 'sanity/router';
import { EventDetail } from './EventDetail';
import '../bna-tool/bna-tool.css';

type Loc = { ko?: string; en?: string; zh?: string; ja?: string };

interface EventRow {
  _id: string;
  uid?: string;
  title?: Loc;
  oneLineDescription?: Loc;
  startDate?: string;
  endDate?: string;
  showAsPopup?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
}

const QUERY = `*[_type == "eventPopup"] | order(sortOrder asc, _createdAt desc) {
  _id, "uid": uid.current, title, oneLineDescription,
  startDate, endDate, showAsPopup, isVisible, sortOrder
}`;

function issueUid(): string {
  return `evt-${Math.random().toString(36).slice(2, 10)}`;
}

function fmtPeriod(doc: EventRow): string {
  const s = doc.startDate ? doc.startDate.slice(0, 10) : '';
  const e = doc.endDate ? doc.endDate.slice(0, 10) : '';
  if (!s && !e) return '—';
  return `${s} ~ ${e}`;
}

function rowTitle(doc: EventRow): string {
  return doc.title?.ko || doc.title?.en || '(제목 없음)';
}

export function EventTool() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const router = useRouter();
  const routerState = useRouterState() as { selectedId?: string } | null;
  const selectedUid = routerState?.selectedId ?? null;

  const [docs, setDocs] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const load = useCallback(
    async (markLoaded: boolean) => {
      const data = (await client.fetch<EventRow[]>(QUERY)) ?? [];
      // uid 없는 문서는 즉시 발급(엔드포인트 매핑 보장). 사용자에게는 노출하지 않음.
      const missing = data.filter((d) => !d.uid);
      if (missing.length) {
        await Promise.all(
          missing.map((d) => {
            const uid = issueUid();
            d.uid = uid;
            return client
              .patch(d._id)
              .set({ uid: { _type: 'slug', current: uid } })
              .commit();
          }),
        );
      }
      setDocs(data);
      if (markLoaded) setLoading(false);
    },
    [client],
  );

  useEffect(() => {
    let cancelled = false;
    client.fetch<EventRow[]>(QUERY).then(async (data) => {
      if (cancelled) return;
      const rows = data ?? [];
      const missing = rows.filter((d) => !d.uid);
      if (missing.length) {
        await Promise.all(
          missing.map((d) => {
            const uid = issueUid();
            d.uid = uid;
            return client
              .patch(d._id)
              .set({ uid: { _type: 'slug', current: uid } })
              .commit();
          }),
        );
      }
      if (!cancelled) {
        setDocs(rows);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [client]);

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

  const handleAdd = useCallback(async () => {
    const uid = issueUid();
    const sortOrder = docs.length * 10;
    const newDoc = await client.create({
      _type: 'eventPopup',
      title: { ko: '' },
      uid: { _type: 'slug', current: uid },
      isVisible: false,
      showAsPopup: false,
      sortOrder,
    });
    setDocs((prev) => [
      ...prev,
      {
        _id: newDoc._id,
        uid,
        title: { ko: '' },
        isVisible: false,
        showAsPopup: false,
        sortOrder,
      },
    ]);
    router.navigate({ selectedId: uid });
  }, [client, router, docs.length]);

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

      const reordered = [...docs];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(dropIdx, 0, moved);
      const updates = reordered.map((doc, i) => ({
        id: doc._id,
        sortOrder: i * 10,
      }));

      setDocs((prev) => {
        const map = new Map(updates.map((u) => [u.id, u.sortOrder]));
        return [...prev]
          .map((d) =>
            map.has(d._id) ? { ...d, sortOrder: map.get(d._id)! } : d,
          )
          .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      });

      await Promise.all(
        updates.map(({ id, sortOrder }) =>
          client.patch(id).set({ sortOrder }).commit(),
        ),
      );
    },
    [client, docs],
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
    if (selected.size === docs.length) setSelected(new Set());
    else setSelected(new Set(docs.map((d) => d._id)));
  };

  const handleBulkDelete = async () => {
    const ids = [...selected];
    await Promise.all(ids.map((id) => client.delete(id)));
    setDocs((prev) => prev.filter((d) => !selected.has(d._id)));
    setSelected(new Set());
    setDeleteConfirm(false);
  };

  const allSelected = docs.length > 0 && docs.every((d) => selected.has(d._id));

  if (selectedUid) {
    return (
      <EventDetail
        uid={selectedUid}
        onBack={() => {
          router.navigate({});
          load(false);
        }}
      />
    );
  }

  return (
    <div className="bn-container">
      <div className="bn-toolbar">
        <button className="bn-add-btn" onClick={handleAdd}>
          + 이벤트 추가
        </button>
        {selected.size > 0 && (
          <button
            className="bn-delete-btn"
            onClick={() => setDeleteConfirm(true)}
          >
            선택 {selected.size}개 삭제
          </button>
        )}
        <span className="bn-count">{docs.length}개 이벤트</span>
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
              <col />
              <col style={{ width: '180px' }} />
              <col style={{ width: '90px' }} />
              <col style={{ width: '60px' }} />
            </colgroup>
            <thead>
              <tr>
                <th style={{ cursor: 'default' }}>⠿</th>
                <th style={{ cursor: 'default', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="bn-checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th>No.</th>
                <th>제목</th>
                <th>한 줄 설명</th>
                <th>기간</th>
                <th style={{ textAlign: 'center' }}>메인 팝업 노출</th>
                <th style={{ textAlign: 'center' }}>노출</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="bn-empty">
                    등록된 이벤트가 없습니다
                  </td>
                </tr>
              ) : (
                docs.map((doc, idx) => (
                  <EventRowView
                    key={doc._id}
                    doc={doc}
                    rowNum={idx + 1}
                    saving={saving.has(doc._id)}
                    selected={selected.has(doc._id)}
                    onToggleSelect={() => toggleSelect(doc._id)}
                    onPatch={patch}
                    onEdit={() => router.navigate({ selectedId: doc.uid })}
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

      {deleteConfirm && (
        <div className="bn-modal-overlay">
          <div className="bn-modal">
            <h3 className="bn-modal-title">이벤트 삭제</h3>
            <p className="bn-modal-body">
              선택한 {selected.size}개의 이벤트를 삭제하시겠습니까?
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

function EventRowView({
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
  doc: EventRow;
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
  return (
    <tr
      className="bn-row-clickable"
      style={{
        opacity: saving ? 0.5 : 1,
        background: dragOver || selected ? 'var(--card-bg2-color)' : undefined,
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
        <span className="bn-treatment-name">{rowTitle(doc)}</span>
      </td>
      <td>
        <span style={{ fontSize: 12, color: 'var(--card-muted-fg-color)' }}>
          {doc.oneLineDescription?.ko || '—'}
        </span>
      </td>
      <td>
        <span style={{ fontSize: 12, color: 'var(--card-muted-fg-color)' }}>
          {fmtPeriod(doc)}
        </span>
      </td>
      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          className="bn-toggle bn-toggle-main"
          checked={doc.showAsPopup !== false}
          disabled={!doc.isVisible}
          title={
            !doc.isVisible
              ? '이벤트 노출이 꺼져 있어 메인 팝업도 표시되지 않습니다'
              : undefined
          }
          style={
            !doc.isVisible ? { opacity: 0.4, cursor: 'not-allowed' } : undefined
          }
          onChange={(e) => onPatch(doc._id, { showAsPopup: e.target.checked })}
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
