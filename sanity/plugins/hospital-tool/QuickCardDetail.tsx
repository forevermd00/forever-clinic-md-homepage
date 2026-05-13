import { useState, useEffect, useRef } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';

interface CardDoc {
  _id: string;
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  description?: { ko?: string; en?: string; zh?: string; ja?: string };
  slug?: string;
  linkUrl?: string;
  sortOrder?: number;
  isVisible?: boolean;
  icon?: { asset?: { _ref: string } };
  tab?: { _id: string; label?: string };
  linkedTreatments?: { _id: string; name: string; slug?: string }[];
}

interface TabOption {
  _id: string;
  label?: string;
}

interface TreatmentResult {
  _id: string;
  name: string;
  slug?: string;
}

const LOCALE_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
  ja: '日本語',
};

const CARD_QUERY = `*[_type == "quickEntryCard" && _id == $id][0] {
  _id,
  title,
  description,
  "slug": slug.current,
  linkUrl,
  sortOrder,
  isVisible,
  icon { asset { _ref } },
  "tab": tab->{ _id, "label": label.ko },
  "linkedTreatments": linkedTreatments[]->{ _id, "name": coalesce(name.ko, name.en, "(이름없음)"), "slug": slug.current }
}`;

const TABS_QUERY = `*[_type == "quickEntryTab"] | order(sortOrder asc) { _id, "label": label.ko }`;

const ALL_TREATMENTS_QUERY = `*[_type == "treatment"] | order(sortOrder asc) {
  _id,
  "name": coalesce(name.ko, name.en, "(이름없음)"),
  "slug": slug.current
}`;

function sanityImageUrl(ref: string): string {
  const id = ref.replace('image-', '').replace(/-(\w+)$/, '.$1');
  return `https://cdn.sanity.io/images/ecoamz42/production/${id}`;
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

export function QuickCardDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<CardDoc | null>(null);
  const [tabs, setTabs] = useState<TabOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);

  const [treatments, setTreatments] = useState<TreatmentResult[]>([]);
  const [allTreatments, setAllTreatments] = useState<TreatmentResult[]>([]);
  const [filterQuery, setFilterQuery] = useState('');

  const initialized = useRef(false);

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
    Promise.all([
      client.fetch<CardDoc>(CARD_QUERY, { id }),
      client.fetch<TabOption[]>(TABS_QUERY),
      client.fetch<TreatmentResult[]>(ALL_TREATMENTS_QUERY),
    ]).then(([cardData, tabData, treatmentData]) => {
      setDoc(cardData);
      setTabs(tabData ?? []);
      setAllTreatments(treatmentData ?? []);
      if (!initialized.current) {
        setTreatments(cardData?.linkedTreatments ?? []);
        initialized.current = true;
      }
    });
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

  const handleSlugBlur = async (val: string) => {
    setSlugError(null);
    const trimmed = val.trim();
    if (!trimmed) return;
    const count = await client.fetch<number>(
      `count(*[_type == "quickEntryCard" && slug.current == $slug && _id != $id])`,
      { slug: trimmed, id },
    );
    if (count > 0) {
      setSlugError('이미 사용 중인 slug입니다.');
      return;
    }
    await patch({ slug: { _type: 'slug', current: trimmed } });
    setDoc((prev) => (prev ? { ...prev, slug: trimmed } : prev));
  };

  const saveTreatments = async (newList: TreatmentResult[]) => {
    await client
      .patch(id)
      .set({
        linkedTreatments: newList.map((t) => ({
          _type: 'reference',
          _ref: t._id,
        })),
      })
      .commit();
  };

  const addTreatment = (t: TreatmentResult) => {
    if (treatments.some((x) => x._id === t._id)) return;
    const updated = [...treatments, t];
    setTreatments(updated);
    saveTreatments(updated);
  };

  const removeTreatment = (tid: string) => {
    const updated = treatments.filter((t) => t._id !== tid);
    setTreatments(updated);
    saveTreatments(updated);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageRef = await uploadImage(client, file);
      await client.patch(id).set({ icon: imageRef }).commit();
      setDoc((prev) => (prev ? { ...prev, icon: imageRef } : prev));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('이 카드를 삭제하시겠습니까?')) return;
    await client.delete(id);
    onBack();
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  const iconRef = doc.icon?.asset?._ref;

  return (
    <div className="ht-detail-container">
      <div className="ht-detail-header">
        <button className="ht-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="ht-detail-title-row">
          <h2 className="ht-detail-title">{doc.title?.ko || '(제목 없음)'}</h2>
          {saving && <span className="ht-saving-indicator">저장 중…</span>}
        </div>
      </div>

      {/* ─── 제목 ─── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">제목</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {(['ko', 'en', 'zh', 'ja'] as const).map((locale) => (
              <div key={locale} className="ht-detail-field">
                <label className="ht-detail-label">
                  {LOCALE_LABELS[locale]}
                </label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.title?.[locale] ?? ''}
                  onBlur={(e) => patch({ [`title.${locale}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 설명 ─── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">설명</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {(['ko', 'en', 'zh', 'ja'] as const).map((locale) => (
              <div key={locale} className="ht-detail-field">
                <label className="ht-detail-label">
                  {LOCALE_LABELS[locale]}
                </label>
                <textarea
                  className="ht-text-input ht-textarea"
                  defaultValue={doc.description?.[locale] ?? ''}
                  rows={3}
                  onBlur={(e) =>
                    patch({ [`description.${locale}`]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── 기본 정보 ─── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">기본 정보</div>
        <div className="ht-detail-body">
          <div className="ht-detail-row">
            <div className="ht-detail-field" style={{ flex: 1, minWidth: 160 }}>
              <label className="ht-detail-label">Slug</label>
              <input
                type="text"
                className="ht-text-input"
                defaultValue={doc.slug ?? ''}
                onBlur={(e) => handleSlugBlur(e.target.value)}
              />
              {slugError && (
                <span style={{ color: '#a83c44', fontSize: 11 }}>
                  {slugError}
                </span>
              )}
            </div>
            <div className="ht-detail-field" style={{ flex: 2, minWidth: 200 }}>
              <label className="ht-detail-label">링크 URL</label>
              <input
                type="text"
                className="ht-text-input"
                defaultValue={doc.linkUrl ?? ''}
                placeholder={`/treatments?cat=${doc.slug ?? '{slug}'}`}
                onBlur={(e) => patch({ linkUrl: e.target.value })}
              />
            </div>
            <div className="ht-detail-field">
              <label className="ht-detail-label">정렬 순서</label>
              <input
                type="number"
                className="ht-text-input ht-order-input"
                defaultValue={doc.sortOrder ?? 0}
                onBlur={(e) => {
                  const v = parseInt(e.target.value, 10);
                  if (!isNaN(v)) patch({ sortOrder: v });
                }}
              />
            </div>
            <div className="ht-detail-field">
              <label className="ht-detail-label">노출</label>
              <input
                type="checkbox"
                className="tt-toggle"
                checked={!!doc.isVisible}
                onChange={(e) => patchBool('isVisible', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── 탭 분류 ─── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">탭 분류</div>
        <div className="ht-detail-body">
          <div className="ht-detail-field">
            <label className="ht-detail-label">탭 선택</label>
            <select
              className="ht-text-input"
              value={doc.tab?._id ?? ''}
              onChange={(e) => {
                const tabId = e.target.value;
                const selectedTab = tabs.find((t) => t._id === tabId);
                patch({ tab: { _type: 'reference', _ref: tabId } });
                setDoc((prev) =>
                  prev
                    ? {
                        ...prev,
                        tab: { _id: tabId, label: selectedTab?.label },
                      }
                    : prev,
                );
              }}
              style={{ maxWidth: 300 }}
            >
              <option value="">— 탭 없음 —</option>
              {tabs.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.label || t._id}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ─── 연결 시술 ─── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">
          연결 시술
          <span className="ht-row-meta" style={{ fontWeight: 400 }}>
            ({treatments.length}개 선택됨)
          </span>
        </div>
        <div className="ht-detail-body">
          <div
            className="ht-detail-field"
            style={{ maxWidth: 360, marginBottom: 10 }}
          >
            <input
              type="text"
              className="ht-text-input"
              value={filterQuery}
              placeholder="시술명 필터..."
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
          <div className="ht-treatment-list">
            {allTreatments
              .filter(
                (t) =>
                  !filterQuery.trim() ||
                  t.name.toLowerCase().includes(filterQuery.toLowerCase()),
              )
              .map((t) => {
                const checked = treatments.some((x) => x._id === t._id);
                return (
                  <label
                    key={t._id}
                    className={`ht-treatment-item${checked ? 'selected' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (checked) {
                          removeTreatment(t._id);
                        } else {
                          addTreatment(t);
                        }
                      }}
                    />
                    <span className="ht-treatment-name">{t.name}</span>
                  </label>
                );
              })}
            {allTreatments.length === 0 && (
              <p className="ht-row-meta">시술이 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── 썸네일 이미지 ─── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">썸네일 이미지</div>
        <div className="ht-detail-body">
          {iconRef && (
            <img
              src={sanityImageUrl(iconRef)}
              alt="icon"
              className="ht-thumb-preview"
            />
          )}
          <label className="ht-upload-btn">
            {uploading ? '업로드 중…' : '이미지 선택'}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleIconUpload}
            />
          </label>
        </div>
      </div>

      <div className="ht-detail-delete-area">
        <button className="ht-delete-btn" onClick={handleDelete}>
          이 카드 삭제
        </button>
      </div>
    </div>
  );
}
