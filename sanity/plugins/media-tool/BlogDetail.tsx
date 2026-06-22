import { useState, useEffect } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';
import { BlogEditor } from './BlogEditor';

type Locale = 'ko' | 'en' | 'zh' | 'ja';
type LocalizedString = Partial<Record<Locale, string>>;
type ImageRef = { asset?: { _ref: string } };
type LocalizedImage = Partial<Record<Locale, ImageRef>>;

interface BlogDoc {
  _id: string;
  title?: LocalizedString;
  slug?: { current?: string };
  category?: LocalizedString;
  markdownContent?: LocalizedString;
  publishedAt?: string;
  thumbnail?: LocalizedImage;
  isVisible?: boolean;
}

const LOCALES: { key: Locale; label: string }[] = [
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

// category(구버전 string) / thumbnail(구버전 단일 image) 원본을 그대로 받아 JS에서 정규화
const QUERY = `*[_type == "blogPost" && _id == $id][0] {
  _id, title, slug, category,
  "publishedAt": coalesce(publishedAt, publishDate),
  markdownContent { ko, en, zh, ja },
  thumbnail {
    ko { asset { _ref } }, en { asset { _ref } },
    zh { asset { _ref } }, ja { asset { _ref } },
    asset { _ref }
  },
  isVisible
}`;

// 구버전(string category, 단일 image thumbnail)을 다국어 형태로 정규화
function normalizeDoc(raw: BlogDoc & { category?: unknown }): BlogDoc {
  const rawCategory = raw.category as unknown;
  const category: LocalizedString =
    typeof rawCategory === 'string'
      ? { ko: rawCategory }
      : (rawCategory as LocalizedString) || {};

  const rawThumb = (raw.thumbnail || {}) as LocalizedImage & ImageRef;
  const hasLocaleThumb = LOCALES.some((l) => rawThumb[l.key]?.asset?._ref);
  const thumbnail: LocalizedImage =
    !hasLocaleThumb && rawThumb.asset?._ref
      ? { ko: { asset: rawThumb.asset } } // 구버전 단일 썸네일 → 한국어로 승계
      : {
          ko: rawThumb.ko,
          en: rawThumb.en,
          zh: rawThumb.zh,
          ja: rawThumb.ja,
        };

  return { ...raw, category, thumbnail };
}

export function BlogDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<BlogDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<Locale>('ko');
  const [thumbUploading, setThumbUploading] = useState<Locale | null>(null);

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
    client
      .fetch<BlogDoc & { category?: unknown }>(QUERY, { id })
      .then((raw) => setDoc(raw ? normalizeDoc(raw) : null));
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

  // 카테고리(언어별) 수정: 구버전 string과의 충돌을 피하려 객체 전체를 set
  const patchCategory = (key: Locale, value: string) => {
    const next: LocalizedString = { ...(doc?.category || {}), [key]: value };
    patch({ category: next });
  };

  // 파일 1개를 해당 언어 썸네일로 업로드: 객체 전체를 set 하여 구버전 단일 이미지 형태를 덮어씀
  const applyThumb = async (key: Locale, file: File) => {
    setThumbUploading(key);
    try {
      const imageRef = await uploadImage(client, file);
      const next: LocalizedImage = {
        ...(doc?.thumbnail || {}),
        [key]: imageRef,
      };
      await client.patch(id).set({ thumbnail: next }).commit();
      setDoc((prev) => (prev ? { ...prev, thumbnail: next } : prev));
    } finally {
      setThumbUploading(null);
    }
  };

  const handleThumbUpload = async (
    key: Locale,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await applyThumb(key, file);
    } finally {
      e.target.value = '';
    }
  };

  // 클립보드 이미지를 해당 언어 썸네일로 붙여넣기
  const handleThumbPaste = async (key: Locale) => {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const type = item.types.find((t) => t.startsWith('image/'));
        if (type) {
          const blob = await item.getType(type);
          const ext = type.split('/')[1] || 'png';
          const file = new File([blob], `pasted-thumb-${key}.${ext}`, { type });
          await applyThumb(key, file);
          return;
        }
      }
      alert('클립보드에 이미지가 없습니다. 이미지를 먼저 복사하세요.');
    } catch {
      alert(
        '클립보드를 읽지 못했습니다. 브라우저의 클립보드 권한을 허용해 주세요.',
      );
    }
  };

  // 썸네일(언어별) 제거
  const handleThumbRemove = async (key: Locale) => {
    const next: LocalizedImage = { ...(doc?.thumbnail || {}) };
    delete next[key];
    await client.patch(id).set({ thumbnail: next }).commit();
    setDoc((prev) => (prev ? { ...prev, thumbnail: next } : prev));
  };

  if (!doc) return <div className="mt-loading">불러오는 중...</div>;

  const projectId = 'ecoamz42';
  const dataset = 'production';

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
          <div className="mt-detail-grid4" style={{ marginTop: 12 }}>
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="mt-detail-field">
                <label className="mt-detail-label">카테고리 ({label})</label>
                <input
                  type="text"
                  className="mt-text-input"
                  defaultValue={doc.category?.[key] ?? ''}
                  onBlur={(e) => patchCategory(key, e.target.value)}
                />
              </div>
            ))}
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
        <div className="mt-detail-section-title">썸네일 (언어별 · 선택)</div>
        <div className="mt-detail-body">
          <div className="mt-detail-grid4">
            {LOCALES.map(({ key, label }) => {
              const ref = doc.thumbnail?.[key]?.asset?._ref;
              return (
                <div key={key} className="mt-detail-field">
                  <label className="mt-detail-label">{label}</label>
                  {ref && (
                    <img
                      src={sanityImageUrl(projectId, dataset, ref)}
                      alt={`thumbnail-${key}`}
                      className="mt-thumb-preview"
                    />
                  )}
                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      alignItems: 'center',
                      flexWrap: 'wrap',
                    }}
                  >
                    <label className="mt-upload-btn">
                      {thumbUploading === key
                        ? '업로드 중…'
                        : ref
                          ? '이미지 교체'
                          : '이미지 선택'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleThumbUpload(key, e)}
                      />
                    </label>
                    <button
                      type="button"
                      className="mt-upload-btn"
                      onClick={() => handleThumbPaste(key)}
                      disabled={thumbUploading === key}
                    >
                      📋 붙여넣기
                    </button>
                    {ref && (
                      <button
                        type="button"
                        className="mt-back-btn"
                        onClick={() => handleThumbRemove(key)}
                      >
                        제거
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p
            style={{
              fontSize: 12,
              color: '#6b7280',
              marginTop: 8,
            }}
          >
            썸네일을 지정하지 않으면 해당 언어 본문의 <b>첫 번째 이미지</b>가
            자동으로 썸네일이 됩니다. 직접 지정하면 그 이미지가 우선합니다.
            언어별 썸네일이 모두 없으면 한국어 → 영어 → 중국어 → 일본어 순으로
            대체됩니다.
          </p>
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
