import { useState, useEffect } from 'react';
import { useClient } from 'sanity';

interface NoticeDoc {
  _id: string;
  title?: { ko?: string; en?: string };
  body?: { ko?: string; en?: string };
  publishedAt?: string;
  isPinned?: boolean;
}

const QUERY = `*[_type == "notice" && _id == $id][0] {
  _id, title, body, publishedAt, isPinned
}`;

export function NoticeDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<NoticeDoc | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaX > 80 && Math.abs(e.deltaY) < 30) onBack();
    };
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = Math.abs(e.changedTouches[0].clientY - touchStartY);
      if (dx > 60 && dy < 40) onBack();
    };
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onBack]);

  useEffect(() => {
    client.fetch<NoticeDoc>(QUERY, { id }).then(setDoc);
  }, [client, id]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    await client.patch(id).set(fields).commit();
    setDoc((prev) => (prev ? { ...prev, ...fields } : prev));
    setSaving(false);
  };

  const patchBool = (field: string, value: boolean) => {
    patch({ [field]: value });
    setDoc((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const handleDelete = async () => {
    if (!confirm('이 공지사항을 삭제하시겠습니까?')) return;
    await client.delete(id);
    onBack();
  };

  if (!doc) return <div className="mt-loading">불러오는 중...</div>;

  return (
    <div className="mt-detail-container">
      <div className="mt-detail-header">
        <button className="mt-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="mt-detail-title-row">
          <h2 className="mt-detail-title">{doc.title?.ko || '(제목 없음)'}</h2>
          {saving && <span className="mt-saving-indicator">저장 중…</span>}
        </div>
      </div>

      <div className="mt-detail-section">
        <div className="mt-detail-section-title">제목</div>
        <div className="mt-detail-body">
          <div className="mt-detail-grid2">
            <div className="mt-detail-field">
              <label className="mt-detail-label">한국어</label>
              <input
                type="text"
                className="mt-text-input"
                defaultValue={doc.title?.ko ?? ''}
                onBlur={(e) => patch({ 'title.ko': e.target.value })}
              />
            </div>
            <div className="mt-detail-field">
              <label className="mt-detail-label">English</label>
              <input
                type="text"
                className="mt-text-input"
                defaultValue={doc.title?.en ?? ''}
                onBlur={(e) => patch({ 'title.en': e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-detail-section">
        <div className="mt-detail-section-title">본문</div>
        <div className="mt-detail-body">
          <div className="mt-detail-grid2">
            <div className="mt-detail-field">
              <label className="mt-detail-label">한국어</label>
              <textarea
                className="mt-text-input mt-textarea mt-textarea-lg"
                defaultValue={doc.body?.ko ?? ''}
                rows={6}
                onBlur={(e) => patch({ 'body.ko': e.target.value })}
              />
            </div>
            <div className="mt-detail-field">
              <label className="mt-detail-label">English</label>
              <textarea
                className="mt-text-input mt-textarea mt-textarea-lg"
                defaultValue={doc.body?.en ?? ''}
                rows={6}
                onBlur={(e) => patch({ 'body.en': e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-detail-section">
        <div className="mt-detail-section-title">설정</div>
        <div className="mt-detail-body">
          <div className="mt-detail-row">
            <div className="mt-detail-field">
              <label className="mt-detail-label">게시일</label>
              <input
                type="date"
                className="mt-text-input"
                defaultValue={doc.publishedAt ?? ''}
                onBlur={(e) => patch({ publishedAt: e.target.value || null })}
              />
            </div>
            <div className="mt-detail-field">
              <label className="mt-detail-label">상단 고정</label>
              <input
                type="checkbox"
                className="tt-toggle"
                checked={!!doc.isPinned}
                onChange={(e) => patchBool('isPinned', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-detail-delete-area">
        <button className="mt-delete-btn" onClick={handleDelete}>
          이 문서 삭제
        </button>
      </div>
    </div>
  );
}
