import { useState, useEffect } from 'react';
import { useClient } from 'sanity';

interface VideoDoc {
  _id: string;
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  youtubeId?: string;
  youtubeUrl?: string;
  publishedAt?: string;
  displayLanguages?: string[];
  isVisible?: boolean;
}

const LOCALES: { key: 'ko' | 'en' | 'zh' | 'ja'; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
  { key: 'ja', label: '日本語' },
];

const QUERY = `*[_type == "youtubeVideo" && _id == $id][0] {
  _id, title, youtubeId, youtubeUrl, publishedAt, displayLanguages, isVisible
}`;

export function VideoDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<VideoDoc | null>(null);
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
    client.fetch<VideoDoc>(QUERY, { id }).then(setDoc);
  }, [client, id]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    await client.patch(id).set(fields).commit();
    setDoc((prev) => (prev ? { ...prev, ...fields } : prev));
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('이 영상을 삭제하시겠습니까?')) return;
    await client.delete(id);
    onBack();
  };

  if (!doc) return <div className="mt-loading">불러오는 중...</div>;

  const youtubeId = doc.youtubeId || null;

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
          <div className="mt-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="mt-detail-field">
                <label className="mt-detail-label">{label}</label>
                <input
                  type="text"
                  className="mt-text-input"
                  defaultValue={doc.title?.[key] ?? ''}
                  onBlur={(e) => patch({ [`title.${key}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-detail-section">
        <div className="mt-detail-section-title">YouTube</div>
        <div className="mt-detail-body">
          <div className="mt-detail-field" style={{ marginBottom: 12 }}>
            <label className="mt-detail-label">YouTube ID</label>
            <input
              type="text"
              className="mt-text-input"
              placeholder="예: dQw4w9WgXcQ"
              defaultValue={doc.youtubeId ?? ''}
              onBlur={(e) => patch({ youtubeId: e.target.value })}
            />
          </div>
          <div className="mt-detail-field" style={{ marginBottom: 12 }}>
            <label className="mt-detail-label">
              영상 링크 URL (Shorts/커스텀)
            </label>
            <input
              type="text"
              className="mt-text-input"
              placeholder="예: https://youtube.com/shorts/xxxx"
              defaultValue={doc.youtubeUrl ?? ''}
              onBlur={(e) => patch({ youtubeUrl: e.target.value || null })}
            />
          </div>
          {youtubeId && (
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              width="400"
              height="225"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: 4, display: 'block', marginTop: 8 }}
            />
          )}
        </div>
      </div>

      <div className="mt-detail-section">
        <div className="mt-detail-section-title">게시일 / 노출</div>
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
              <label className="mt-detail-label">노출 여부</label>
              <input
                type="checkbox"
                className="tt-toggle"
                checked={doc.isVisible !== false}
                onChange={(e) => patch({ isVisible: e.target.checked })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-detail-section">
        <div className="mt-detail-section-title">표시 언어</div>
        <div className="mt-detail-body">
          <p className="mt-detail-hint">
            선택한 언어에서만 표시됩니다. 아무것도 선택하지 않으면 모든 언어에서
            표시되지 않습니다.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {LOCALES.map(({ key, label }) => {
              const isOn = doc.displayLanguages?.includes(key) ?? false;
              const toggle = async () => {
                const current = doc.displayLanguages ?? [];
                const next = isOn
                  ? current.filter((l) => l !== key)
                  : [...current, key];
                const value = next.length > 0 ? next : null;
                await client
                  .patch(id)
                  .set({ displayLanguages: value })
                  .commit();
                setDoc((prev) =>
                  prev
                    ? {
                        ...prev,
                        displayLanguages: next.length > 0 ? next : undefined,
                      }
                    : prev,
                );
              };
              return (
                <div
                  key={key}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <span style={{ fontSize: 13, minWidth: 60 }}>{label}</span>
                  <input
                    type="checkbox"
                    className="tt-toggle"
                    checked={isOn}
                    onChange={toggle}
                  />
                </div>
              );
            })}
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
