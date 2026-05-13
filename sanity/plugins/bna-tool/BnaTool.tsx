import { useState, useEffect, useCallback, useRef } from 'react';
import { useClient } from 'sanity';
import { useRouter, useRouterState } from 'sanity/router';
import type { BnaDoc } from './types';
import { BnaDetail } from './BnaDetail';
import './bna-tool.css';

const QUERY = `
  *[_type == "baCase"] | order(sortOrder asc, _createdAt asc) {
    _id, _updatedAt,
    "treatmentName": coalesce(treatment->name.ko, treatment->name.en, "(미연결)"),
    sessions, showOnMain, isVisible, sortOrder
  }
`;

export function BnaTool() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const router = useRouter();
  const routerState = useRouterState() as { selectedId?: string } | null;
  const selectedId = routerState?.selectedId ?? null;

  const [docs, setDocs] = useState<BnaDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Set<string>>(new Set());

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

      const reordered = [...docs];
      const [moved] = reordered.splice(from, 1);
      reordered.splice(dropIdx, 0, moved);

      const updates = reordered.map((doc, i) => ({
        id: doc._id,
        sortOrder: i * 10,
      }));

      setDocs(reordered.map((doc, i) => ({ ...doc, sortOrder: i * 10 })));

      await Promise.all(
        updates.map(({ id, sortOrder }) =>
          client.patch(id).set({ sortOrder }).commit(),
        ),
      );
    },
    [client, docs],
  );

  if (selectedId) {
    return <BnaDetail id={selectedId} onBack={() => router.navigate({})} />;
  }

  return (
    <div className="bn-container">
      {loading ? (
        <div className="bn-loading">불러오는 중...</div>
      ) : (
        <div className="bn-table-wrap">
          <table className="bn-table">
            <colgroup>
              <col style={{ width: '32px' }} />
              <col style={{ width: '44px' }} />
              <col />
              <col style={{ width: '70px' }} />
              <col style={{ width: '70px' }} />
              <col style={{ width: '60px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>⠿</th>
                <th>No.</th>
                <th>시술명</th>
                <th style={{ textAlign: 'center' }}>횟수</th>
                <th style={{ textAlign: 'center' }}>메인노출</th>
                <th style={{ textAlign: 'center' }}>노출</th>
              </tr>
            </thead>
            <tbody>
              {docs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="bn-empty">
                    BnA 케이스가 없습니다
                  </td>
                </tr>
              ) : (
                docs.map((doc, idx) => (
                  <BnaRow
                    key={doc._id}
                    doc={doc}
                    rowNum={idx + 1}
                    saving={saving.has(doc._id)}
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
    </div>
  );
}

function BnaRow({
  doc,
  rowNum,
  saving,
  onPatch,
  onEdit,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  doc: BnaDoc;
  rowNum: number;
  saving: boolean;
  onPatch: (id: string, fields: Record<string, unknown>) => Promise<void>;
  onEdit: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  const isDragging = useRef(false);

  return (
    <tr
      className="bn-row-clickable"
      style={{ opacity: saving ? 0.5 : 1 }}
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
        className="bn-drag-handle"
        style={{ textAlign: 'center', cursor: 'grab' }}
        onClick={(e) => e.stopPropagation()}
      >
        ⠿
      </td>

      <td className="bn-row-num">{rowNum}</td>

      <td>
        <span className="bn-treatment-name">
          {doc.treatmentName || '(미연결)'}
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
