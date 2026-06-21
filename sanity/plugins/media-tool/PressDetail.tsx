import { useState, useEffect, useRef, useCallback } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';

interface LocalizedString {
  ko?: string;
  en?: string;
  zh?: string;
  ja?: string;
}

interface PressDoc {
  _id: string;
  title?: LocalizedString;
  excerpt?: LocalizedString;
  publisher?: string;
  url?: string;
  publishedAt?: string;
  thumbnail?: { asset?: { _ref: string } };
  isVisible?: boolean;
}

const LOCALES: { key: keyof LocalizedString; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
  { key: 'ja', label: '日本語' },
];

function sanityImageUrl(
  projectId: string,
  dataset: string,
  ref: string,
): string {
  const id = ref.replace('image-', '').replace(/-(\w+)$/, '.$1');
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}`;
}

async function uploadImage(client: SanityClient, file: File) {
  const asset = await client.assets.upload('image', file, {
    filename: file.name,
  });
  return {
    _type: 'image' as const,
    asset: { _type: 'reference' as const, _ref: asset._id },
  };
}

const QUERY = `*[_type == "pressArticle" && _id == $id][0] {
  _id, title, excerpt,
  "publisher": coalesce(publisher, source),
  url,
  "publishedAt": coalesce(publishedAt, publishDate),
  thumbnail { asset { _ref } },
  isVisible
}`;

export function PressDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<PressDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const thumbAreaRef = useRef<HTMLDivElement>(null);

  // 스와이프 뒤로가기
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (e.deltaX > 80 && Math.abs(e.deltaY) < 30) onBack();
    };
    let tx = 0,
      ty = 0;
    const onTouchStart = (e: TouchEvent) => {
      tx = e.touches[0].clientX;
      ty = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (
        e.changedTouches[0].clientX - tx > 60 &&
        Math.abs(e.changedTouches[0].clientY - ty) < 40
      )
        onBack();
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
    client.fetch<PressDoc>(QUERY, { id }).then(setDoc);
  }, [client, id]);

  // 클립보드 붙여넣기 (이미지)
  useEffect(() => {
    const handler = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (!file) continue;
          e.preventDefault();
          setUploading(true);
          try {
            const imageRef = await uploadImage(client, file);
            await client.patch(id).set({ thumbnail: imageRef }).commit();
            setDoc((prev) => (prev ? { ...prev, thumbnail: imageRef } : prev));
          } finally {
            setUploading(false);
          }
          break;
        }
      }
    };
    window.addEventListener('paste', handler);
    return () => window.removeEventListener('paste', handler);
  }, [client, id]);

  const patch = useCallback(
    async (fields: Record<string, unknown>) => {
      setSaving(true);
      await client.patch(id).set(fields).commit();
      setDoc((prev) => (prev ? { ...prev, ...fields } : prev));
      setSaving(false);
    },
    [client, id],
  );

  const handleImageFile = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const imageRef = await uploadImage(client, file);
        await client.patch(id).set({ thumbnail: imageRef }).commit();
        setDoc((prev) => (prev ? { ...prev, thumbnail: imageRef } : prev));
      } finally {
        setUploading(false);
      }
    },
    [client, id],
  );

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) handleImageFile(file);
  };

  const handleDelete = async () => {
    if (!confirm('이 보도자료를 삭제하시겠습니까?')) return;
    await client.delete(id);
    onBack();
  };

  if (!doc) return <div className="mt-loading">불러오는 중...</div>;

  const projectId = 'ecoamz42';
  const dataset = 'production';
  const imageRef = doc.thumbnail?.asset?._ref;

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

      {/* 제목 */}
      <div className="mt-detail-section">
        <div className="mt-detail-section-title">제목</div>
        <div className="mt-detail-body">
          <div className="mt-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="mt-detail-field">
                <label className="mt-detail-label">{label}</label>
                <input
                  key={`title-${key}-${doc.title?.[key]}`}
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

      {/* 요약 */}
      <div className="mt-detail-section">
        <div className="mt-detail-section-title">요약</div>
        <div className="mt-detail-body">
          <div className="mt-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="mt-detail-field">
                <label className="mt-detail-label">{label}</label>
                <textarea
                  key={`excerpt-${key}-${doc.excerpt?.[key]}`}
                  className="mt-text-input mt-textarea"
                  defaultValue={doc.excerpt?.[key] ?? ''}
                  rows={3}
                  onBlur={(e) => patch({ [`excerpt.${key}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="mt-detail-section">
        <div className="mt-detail-section-title">기본 정보</div>
        <div className="mt-detail-body">
          <div className="mt-detail-row">
            <div className="mt-detail-field">
              <label className="mt-detail-label">언론사</label>
              <input
                type="text"
                className="mt-text-input"
                defaultValue={doc.publisher ?? ''}
                onBlur={(e) =>
                  patch({ publisher: e.target.value, source: null })
                }
              />
            </div>
            <div className="mt-detail-field">
              <label className="mt-detail-label">기사 URL</label>
              <input
                type="text"
                className="mt-text-input mt-text-input-wide"
                defaultValue={doc.url ?? ''}
                onBlur={(e) => patch({ url: e.target.value })}
              />
            </div>
            <div className="mt-detail-field">
              <label className="mt-detail-label">게시일</label>
              <input
                type="date"
                className="mt-text-input"
                defaultValue={doc.publishedAt ?? ''}
                onBlur={(e) =>
                  patch({
                    publishedAt: e.target.value || null,
                    publishDate: null,
                  })
                }
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

      {/* 썸네일 */}
      <div className="mt-detail-section">
        <div className="mt-detail-section-title">썸네일</div>
        <div className="mt-detail-body">
          <div
            ref={thumbAreaRef}
            className={`mt-thumb-dropzone ${uploading ? 'uploading' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            {imageRef ? (
              <img
                src={sanityImageUrl(projectId, dataset, imageRef)}
                alt="thumbnail"
                className="mt-thumb-preview"
              />
            ) : (
              <div className="mt-thumb-empty">
                {uploading
                  ? '업로드 중…'
                  : '이미지를 드래그하거나 Ctrl+V 로 붙여넣기'}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <label className="mt-upload-btn">
              {uploading ? '업로드 중…' : '파일 선택'}
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
            </label>
            {imageRef && (
              <button
                className="mt-upload-btn"
                onClick={async () => {
                  await client.patch(id).unset(['thumbnail']).commit();
                  setDoc((prev) =>
                    prev ? { ...prev, thumbnail: undefined } : prev,
                  );
                }}
              >
                제거
              </button>
            )}
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
