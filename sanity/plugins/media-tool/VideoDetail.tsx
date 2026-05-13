import { useState, useEffect } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';

interface VideoDoc {
  _id: string;
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  youtubeId?: string;
  description?: { ko?: string; en?: string; zh?: string; ja?: string };
  publishDate?: string;
  thumbnail?: { asset?: { _ref: string } };
}

const LOCALES: { key: 'ko' | 'en' | 'zh' | 'ja'; label: string }[] = [
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

const QUERY = `*[_type == "youtubeVideo" && _id == $id][0] {
  _id, title, youtubeId, description, publishDate,
  thumbnail { asset { _ref } }
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
  const [uploading, setUploading] = useState(false);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageRef = await uploadImage(client, file);
      await client.patch(id).set({ thumbnail: imageRef }).commit();
      setDoc((prev) => (prev ? { ...prev, thumbnail: imageRef } : prev));
    } finally {
      setUploading(false);
    }
  };

  if (!doc) return <div className="mt-loading">불러오는 중...</div>;

  const projectId = 'ecoamz42';
  const dataset = 'develop';
  const imageRef = doc.thumbnail?.asset?._ref;
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
        <div className="mt-detail-section-title">설명</div>
        <div className="mt-detail-body">
          <div className="mt-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="mt-detail-field">
                <label className="mt-detail-label">{label}</label>
                <textarea
                  className="mt-text-input mt-textarea"
                  defaultValue={doc.description?.[key] ?? ''}
                  rows={3}
                  onBlur={(e) =>
                    patch({ [`description.${key}`]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-detail-section">
        <div className="mt-detail-section-title">게시일 / 썸네일</div>
        <div className="mt-detail-body">
          <div className="mt-detail-row" style={{ marginBottom: 12 }}>
            <div className="mt-detail-field">
              <label className="mt-detail-label">게시일</label>
              <input
                type="date"
                className="mt-text-input"
                defaultValue={doc.publishDate ?? ''}
                onBlur={(e) => patch({ publishDate: e.target.value || null })}
              />
            </div>
          </div>
          {imageRef && (
            <img
              src={sanityImageUrl(projectId, dataset, imageRef)}
              alt="thumbnail"
              className="mt-thumb-preview"
            />
          )}
          <label className="mt-upload-btn">
            {uploading ? '업로드 중…' : '이미지 선택'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageUpload}
            />
          </label>
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
