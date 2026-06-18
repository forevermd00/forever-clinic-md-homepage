import { useState, useEffect } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';
import { BlogEditor } from './BlogEditor';

interface BlogDoc {
  _id: string;
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  slug?: { current?: string };
  category?: string;
  markdownContent?: {
    ko?: string;
    en?: string;
    zh?: string;
    ja?: string;
  };
  publishedAt?: string;
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

const QUERY = `*[_type == "blogPost" && _id == $id][0] {
  _id, title, slug, category, "publishedAt": coalesce(publishedAt, publishDate),
  markdownContent { ko, en, zh, ja },
  thumbnail { asset { _ref } }
}`;

export function BlogDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<BlogDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeLang, setActiveLang] = useState<'ko' | 'en' | 'zh' | 'ja'>('ko');

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
    client.fetch<BlogDoc>(QUERY, { id }).then(setDoc);
  }, [client, id]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    await client.patch(id).set(fields).commit();
    setDoc((prev) => (prev ? { ...prev, ...fields } : prev));
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm('이 블로그 포스트를 삭제하시겠습니까?')) return;
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
        <div className="mt-detail-section-title">기본 정보</div>
        <div className="mt-detail-body">
          <div className="mt-detail-row">
            <div className="mt-detail-field">
              <label className="mt-detail-label">Slug</label>
              <input
                type="text"
                className="mt-text-input"
                defaultValue={doc.slug?.current ?? ''}
                onBlur={(e) =>
                  patch({ slug: { _type: 'slug', current: e.target.value } })
                }
              />
            </div>
            <div className="mt-detail-field">
              <label className="mt-detail-label">카테고리</label>
              <input
                type="text"
                className="mt-text-input"
                defaultValue={doc.category ?? ''}
                onBlur={(e) => patch({ category: e.target.value })}
              />
            </div>
            <div className="mt-detail-field">
              <label className="mt-detail-label">게시일</label>
              <input
                type="date"
                className="mt-text-input"
                defaultValue={doc.publishedAt ?? ''}
                onBlur={(e) => patch({ publishedAt: e.target.value || null })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-detail-section">
        <div
          className="mt-detail-section-title"
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          본문
          <div style={{ display: 'flex', gap: 4, marginLeft: 8 }}>
            {LOCALES.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setActiveLang(key)}
                style={{
                  padding: '2px 8px',
                  fontSize: 11,
                  border: `1px solid ${activeLang === key ? '#6b7280' : '#d1d5db'}`,
                  borderRadius: 4,
                  background: activeLang === key ? '#f3f4f6' : 'white',
                  cursor: 'pointer',
                  fontWeight: activeLang === key ? 700 : 400,
                  color: activeLang === key ? '#111827' : '#6b7280',
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-detail-body">
          <BlogEditor
            key={`${id}-${activeLang}`}
            client={client}
            docId={id}
            lang={activeLang}
            value={doc.markdownContent?.[activeLang] ?? ''}
            onChange={(md) => patch({ [`markdownContent.${activeLang}`]: md })}
          />
        </div>
      </div>

      <div className="mt-detail-section">
        <div className="mt-detail-section-title">썸네일</div>
        <div className="mt-detail-body">
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
