import { useState, useEffect } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';
import { PAGE_HEROES } from '../../../sanity.config';

interface HeroDoc {
  _id?: string;
  pageName?: string;
  badge?: { ko?: string; en?: string; zh?: string; ja?: string };
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  subtitle?: { ko?: string; en?: string; zh?: string; ja?: string };
  heroImage?: { asset?: { _ref: string } };
  heroVideo?: { asset?: { _ref: string }; _type?: string };
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

async function uploadFile(client: SanityClient, file: File) {
  const asset = await client.assets.upload('file', file, {
    filename: file.name,
  });
  return {
    _type: 'file' as const,
    asset: { _type: 'reference' as const, _ref: asset._id },
  };
}

const QUERY = `*[_type == "pageHero" && _id == $docId][0] {
  _id, pageName, badge, title, subtitle,
  heroImage { asset { _ref } },
  heroVideo { asset { _ref } }
}`;

export function HeroDetail({
  heroKey,
  onBack,
}: {
  heroKey: string;
  onBack: () => void;
}) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<HeroDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const pageEntry = PAGE_HEROES.find((p) => p.key === heroKey);
  const pageKey = pageEntry?.key ?? heroKey;
  const docId = `page-hero-${pageKey}`;

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
    async function load() {
      await client.createIfNotExists({
        _id: docId,
        _type: 'pageHero',
        pageName: pageEntry?.title ?? heroKey,
      });
      const result = await client.fetch<HeroDoc>(QUERY, { docId });
      setDoc(result ?? { _id: docId, pageName: heroKey });
    }
    load();
  }, [client, docId, heroKey]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    await client.patch(docId).set(fields).commit();
    setDoc((prev) => (prev ? { ...prev, ...fields } : prev));
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageRef = await uploadImage(client, file);
      await client.patch(docId).set({ heroImage: imageRef }).commit();
      setDoc((prev) => (prev ? { ...prev, heroImage: imageRef } : prev));
    } finally {
      setUploading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const fileRef = await uploadFile(client, file);
      await client.patch(docId).set({ heroVideo: fileRef }).commit();
      setDoc((prev) => (prev ? { ...prev, heroVideo: fileRef } : prev));
    } finally {
      setUploadingVideo(false);
    }
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  const projectId = 'ecoamz42';
  const dataset = 'production';
  const imageRef = doc.heroImage?.asset?._ref;
  const videoRef = doc.heroVideo?.asset?._ref;

  return (
    <div className="ht-detail-container">
      <div className="ht-detail-header">
        <button className="ht-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="ht-detail-title-row">
          <h2 className="ht-detail-title">
            히어로 — {pageEntry?.title ?? heroKey}
          </h2>
          {saving && <span className="ht-saving-indicator">저장 중…</span>}
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">
          배지 문구 (예: Since 2009)
        </div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.badge?.[key] ?? ''}
                  onBlur={(e) => patch({ [`badge.${key}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">제목</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <textarea
                  className="ht-text-input ht-textarea"
                  defaultValue={doc.title?.[key] ?? ''}
                  rows={3}
                  onBlur={(e) => patch({ [`title.${key}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">부제목</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.subtitle?.[key] ?? ''}
                  onBlur={(e) => patch({ [`subtitle.${key}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">배경 이미지</div>
        <div className="ht-detail-body">
          {imageRef && (
            <img
              src={sanityImageUrl(projectId, dataset, imageRef)}
              alt="hero image"
              className="ht-thumb-preview"
            />
          )}
          <label className="ht-upload-btn">
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

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">배경 영상 (mp4)</div>
        <div className="ht-detail-body">
          {videoRef && (
            <p className="ht-detail-label" style={{ marginBottom: 8 }}>
              영상 등록됨: {videoRef.slice(0, 40)}…
            </p>
          )}
          <label className="ht-upload-btn">
            {uploadingVideo ? '업로드 중…' : '영상 선택 (mp4)'}
            <input
              type="file"
              accept="video/mp4"
              style={{ display: 'none' }}
              onChange={handleVideoUpload}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
