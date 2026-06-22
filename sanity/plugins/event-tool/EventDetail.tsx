import { useState, useEffect } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';
import '../bna-tool/bna-tool.css';

type Loc = { ko?: string; en?: string; zh?: string; ja?: string };
type ImgRef = { asset?: { _ref: string } };
type LocalizedImg = { ko?: ImgRef; en?: ImgRef; zh?: ImgRef; ja?: ImgRef };
type LocaleKey = 'ko' | 'en' | 'zh' | 'ja';
const LOCALE_KEYS: LocaleKey[] = ['ko', 'en', 'zh', 'ja'];

interface LinkedTreatment {
  _key?: string;
  treatmentId: string;
  optionKeys: string[];
}

interface PriceOpt {
  _key: string;
  name?: string;
  caption?: string;
  price?: number;
  discountPrice?: number;
  isEvent?: boolean;
}

interface EventDoc {
  _id: string;
  uid?: string;
  title?: Loc;
  oneLineDescription?: Loc;
  pcImage?: LocalizedImg;
  mobileImage?: LocalizedImg;
  detailImage?: LocalizedImg;
  startDate?: string;
  endDate?: string;
  showAsPopup?: boolean;
  isVisible?: boolean;
  linkedTreatments?: LinkedTreatment[];
}

interface TreatmentOption {
  _id: string;
  name?: string;
  category?: string;
  priceOptions?: PriceOpt[];
}

const DOC_QUERY = `*[_type == "eventPopup" && uid.current == $uid][0] {
  _id, "uid": uid.current, title, oneLineDescription,
  pcImage{ ko{asset{_ref}}, en{asset{_ref}}, zh{asset{_ref}}, ja{asset{_ref}} },
  mobileImage{ ko{asset{_ref}}, en{asset{_ref}}, zh{asset{_ref}}, ja{asset{_ref}} },
  detailImage{ ko{asset{_ref}}, en{asset{_ref}}, zh{asset{_ref}}, ja{asset{_ref}} },
  startDate, endDate, showAsPopup, isVisible,
  linkedTreatments[]{ _key, "treatmentId": treatment._ref, optionKeys }
}`;

const TREATMENTS_QUERY = `*[_type == "treatment"] | order(category asc, sortOrder asc) {
  _id, "name": name.ko, category,
  priceOptions[]{ _key, "name": name.ko, "caption": caption.ko, price, discountPrice, isEvent }
}`;

const LOCALE_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
  ja: '日本語',
};

const CATEGORY_LABELS: Record<string, string> = {
  signature: '시그니처',
  'lifting-laser': '리프팅·레이저',
  'petit-lifting': '쁘띠·실리프팅',
  skincare: '피부 관리',
  'skin-booster': '스킨부스터',
  'hair-removal': '제모',
  anesthesia: '마취',
};

function sanityImageUrl(ref: string): string {
  const id = ref.replace('image-', '').replace(/-(\w+)$/, '.$1');
  return `https://cdn.sanity.io/images/ecoamz42/production/${id}`;
}

function newKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function fmtPrice(o: { price?: number; discountPrice?: number }): string {
  const p = o.discountPrice && o.discountPrice > 0 ? o.discountPrice : o.price;
  return p ? `${p.toLocaleString()}원` : '';
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bn-detail-section">
      <h3 className="bn-detail-section-title">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bn-detail-field">
      <label className="bn-detail-label">{label}</label>
      {children}
    </div>
  );
}

type ImgField = 'pcImage' | 'mobileImage' | 'detailImage';

export function EventDetail({
  uid,
  onBack,
}: {
  uid: string;
  onBack: () => void;
}) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<EventDoc | null>(null);
  const [treatments, setTreatments] = useState<TreatmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      client.fetch<EventDoc | null>(DOC_QUERY, { uid }),
      client.fetch<TreatmentOption[]>(TREATMENTS_QUERY),
    ]).then(([d, trs]) => {
      if (cancelled) return;
      setDoc(d);
      setTreatments(trs ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [client, uid]);

  const patch = async (fields: Record<string, unknown>) => {
    if (!doc) return;
    setSaving(true);
    await client.patch(doc._id).set(fields).commit();
    setDoc((prev) => (prev ? { ...prev, ...fields } : prev));
    setSaving(false);
  };

  const handleImageUpload = async (
    field: ImgField,
    locale: LocaleKey,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !doc) return;
    const slot = `${field}:${locale}`;
    setUploading(slot);
    try {
      const imageRef = await uploadImage(client, file);
      await client
        .patch(doc._id)
        .set({ [`${field}.${locale}`]: imageRef })
        .commit();
      setDoc((prev) =>
        prev
          ? {
              ...prev,
              [field]: {
                ...(prev[field] ?? {}),
                [locale]: { asset: { _ref: imageRef.asset._ref } },
              },
            }
          : prev,
      );
    } finally {
      setUploading(null);
    }
  };

  const handleImageDelete = async (field: ImgField, locale: LocaleKey) => {
    if (!doc) return;
    if (!confirm('이미지를 삭제할까요?')) return;
    setSaving(true);
    await client
      .patch(doc._id)
      .unset([`${field}.${locale}`])
      .commit();
    setDoc((prev) => {
      if (!prev) return prev;
      const next = { ...(prev[field] ?? {}) } as LocalizedImg;
      delete next[locale];
      return { ...prev, [field]: next };
    });
    setSaving(false);
  };

  const persistLinks = async (links: LinkedTreatment[]) => {
    if (!doc) return;
    const arr = links.map((l) => ({
      _type: 'eventTreatmentLink',
      _key: l._key ?? newKey(),
      treatment: { _type: 'reference', _ref: l.treatmentId },
      optionKeys: l.optionKeys,
    }));
    await client.patch(doc._id).set({ linkedTreatments: arr }).commit();
    setDoc((prev) => (prev ? { ...prev, linkedTreatments: links } : prev));
  };

  const addTreatment = async (treatmentId: string) => {
    if (!treatmentId || !doc) return;
    const existing = doc.linkedTreatments ?? [];
    if (existing.some((l) => l.treatmentId === treatmentId)) return;
    const tr = treatments.find((t) => t._id === treatmentId);
    // 추가 시 기본적으로 모든 옵션 선택 (불필요한 옵션은 체크 해제)
    const allKeys = (tr?.priceOptions ?? []).map((o) => o._key);
    await persistLinks([
      ...existing,
      { _key: newKey(), treatmentId, optionKeys: allKeys },
    ]);
  };

  const removeTreatment = async (treatmentId: string) => {
    if (!doc) return;
    await persistLinks(
      (doc.linkedTreatments ?? []).filter((l) => l.treatmentId !== treatmentId),
    );
  };

  const toggleOption = async (treatmentId: string, optKey: string) => {
    if (!doc) return;
    await persistLinks(
      (doc.linkedTreatments ?? []).map((l) => {
        if (l.treatmentId !== treatmentId) return l;
        const has = l.optionKeys.includes(optKey);
        return {
          ...l,
          optionKeys: has
            ? l.optionKeys.filter((k) => k !== optKey)
            : [...l.optionKeys, optKey],
        };
      }),
    );
  };

  const handleDelete = async () => {
    if (!doc) return;
    await client.delete(doc._id);
    onBack();
  };

  if (loading) {
    return (
      <div className="bn-container">
        <button className="bn-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="bn-loading">불러오는 중...</div>
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="bn-container">
        <button className="bn-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="bn-empty">이벤트를 찾을 수 없습니다</div>
      </div>
    );
  }

  const linked = doc.linkedTreatments ?? [];
  const treatmentById = new Map(treatments.map((t) => [t._id, t]));
  const available = treatments.filter(
    (t) => !linked.some((l) => l.treatmentId === t._id),
  );
  const titleDisplay = doc.title?.ko || doc.title?.en || '(제목 없음)';

  return (
    <div className="bn-container bn-detail-container">
      <div className="bn-detail-header">
        <button className="bn-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="bn-detail-title-row">
          <h2 className="bn-detail-title">{titleDisplay}</h2>
          {saving && <span className="bn-saving-indicator">저장 중…</span>}
          <button
            className="bn-detail-delete-btn"
            onClick={() => setDeleteConfirm(true)}
          >
            삭제
          </button>
        </div>
      </div>

      {/* ─── 제목 ─── */}
      <Section title="제목">
        <div className="bn-detail-grid4">
          {(['ko', 'en', 'zh', 'ja'] as const).map((locale) => (
            <Field key={locale} label={LOCALE_LABELS[locale]}>
              <input
                type="text"
                className="bn-text-input"
                defaultValue={doc.title?.[locale] ?? ''}
                onBlur={(e) => patch({ [`title.${locale}`]: e.target.value })}
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ─── 노출 설정 ─── */}
      <Section title="노출 설정">
        <div className="bn-detail-row">
          <Field label="메인 팝업 노출">
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
                !doc.isVisible
                  ? { opacity: 0.4, cursor: 'not-allowed' }
                  : undefined
              }
              onChange={(e) => patch({ showAsPopup: e.target.checked })}
            />
          </Field>
          <Field label="노출">
            <input
              type="checkbox"
              className="bn-toggle"
              checked={!!doc.isVisible}
              onChange={(e) => patch({ isVisible: e.target.checked })}
            />
          </Field>
        </div>
      </Section>

      {/* ─── 팝업 이미지 (PC/모바일 × 4개국어) ─── */}
      <Section title="팝업 이미지">
        {(['pcImage', 'mobileImage'] as ImgField[]).map((field) => {
          const isPc = field === 'pcImage';
          return (
            <div key={field} style={{ marginBottom: 16 }}>
              <div
                className="bn-detail-label"
                style={{ fontWeight: 600, marginBottom: 8 }}
              >
                {isPc ? 'PC 이미지 (가로형)' : '모바일 이미지 (세로형)'}
              </div>
              <div className="bn-detail-grid4">
                {LOCALE_KEYS.map((locale) => {
                  const ref = doc[field]?.[locale]?.asset?._ref;
                  const slot = `${field}:${locale}`;
                  return (
                    <div key={locale} className="bn-detail-field">
                      <label className="bn-detail-label">
                        {LOCALE_LABELS[locale]}
                      </label>
                      {ref && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={sanityImageUrl(ref)}
                          alt={slot}
                          className="bn-thumb-preview"
                        />
                      )}
                      <label className="bn-upload-btn">
                        {uploading === slot ? '업로드 중…' : '이미지 선택'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          disabled={uploading === slot}
                          onChange={(e) => handleImageUpload(field, locale, e)}
                        />
                      </label>
                      {ref && (
                        <button
                          type="button"
                          className="bn-img-delete-btn"
                          onClick={() => handleImageDelete(field, locale)}
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </Section>

      {/* ─── 이벤트 기간 ─── */}
      <Section title="이벤트 기간">
        <div className="bn-detail-row">
          <Field label="시작일">
            <input
              type="date"
              className="bn-text-input"
              defaultValue={doc.startDate ? doc.startDate.slice(0, 10) : ''}
              onBlur={(e) => patch({ startDate: e.target.value || null })}
            />
          </Field>
          <Field label="종료일">
            <input
              type="date"
              className="bn-text-input"
              defaultValue={doc.endDate ? doc.endDate.slice(0, 10) : ''}
              onBlur={(e) => patch({ endDate: e.target.value || null })}
            />
          </Field>
        </div>
      </Section>

      {/* ─── 한 줄 설명 ─── */}
      <Section title="한 줄 설명">
        <div className="bn-detail-grid4">
          {(['ko', 'en', 'zh', 'ja'] as const).map((locale) => (
            <Field key={locale} label={LOCALE_LABELS[locale]}>
              <input
                type="text"
                className="bn-text-input"
                defaultValue={doc.oneLineDescription?.[locale] ?? ''}
                onBlur={(e) =>
                  patch({ [`oneLineDescription.${locale}`]: e.target.value })
                }
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ─── 상세 이미지 (언어별) ─── */}
      <Section title="상세 이미지 (언어별)">
        <p
          style={{
            fontSize: 12,
            color: 'var(--card-muted-fg-color)',
            marginBottom: 10,
          }}
        >
          상세페이지에서 이벤트 기간 바로 아래(연결 시술 위)에 노출됩니다.
          언어별 1장, 미등록 시 한국어 폴백. (비워두면 표시되지 않음)
        </p>
        <div className="bn-detail-grid4">
          {LOCALE_KEYS.map((locale) => {
            const ref = doc.detailImage?.[locale]?.asset?._ref;
            const slot = `detailImage:${locale}`;
            return (
              <div key={locale} className="bn-detail-field">
                <label className="bn-detail-label">
                  {LOCALE_LABELS[locale]}
                </label>
                {ref && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sanityImageUrl(ref)}
                    alt={slot}
                    className="bn-thumb-preview"
                  />
                )}
                <label className="bn-upload-btn">
                  {uploading === slot ? '업로드 중…' : '이미지 선택'}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={uploading === slot}
                    onChange={(e) =>
                      handleImageUpload('detailImage', locale, e)
                    }
                  />
                </label>
                {ref && (
                  <button
                    type="button"
                    className="bn-img-delete-btn"
                    onClick={() => handleImageDelete('detailImage', locale)}
                  >
                    삭제
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </Section>

      {/* ─── 연결 이벤트 시술 (시술 → 옵션 선택) ─── */}
      <Section title="연결 이벤트 시술">
        <p
          style={{
            fontSize: 12,
            color: 'var(--card-muted-fg-color)',
            marginBottom: 10,
          }}
        >
          시술을 추가한 뒤, 노출할 가격 옵션을 체크하세요. 체크된 옵션만
          상세페이지 시술 선택 창에 표시됩니다.
        </p>

        {linked.length === 0 && (
          <p
            style={{
              fontSize: 12,
              color: 'var(--card-muted-fg-color)',
              marginBottom: 10,
            }}
          >
            연결된 시술 없음 (없으면 상세페이지에 이미지·정보만 노출)
          </p>
        )}

        {linked.map((l) => {
          const tr = treatmentById.get(l.treatmentId);
          const opts = tr?.priceOptions ?? [];
          return (
            <div
              key={l.treatmentId}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: 8,
                padding: 12,
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 8,
                }}
              >
                <strong style={{ fontSize: 13 }}>
                  {tr
                    ? `${CATEGORY_LABELS[tr.category ?? ''] || tr.category} · ${tr.name}`
                    : l.treatmentId}
                </strong>
                <button
                  onClick={() => removeTreatment(l.treatmentId)}
                  style={{
                    border: '1px solid #e5a5ab',
                    background: 'transparent',
                    color: '#a83c44',
                    borderRadius: 4,
                    padding: '2px 8px',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  시술 제거
                </button>
              </div>
              {opts.length === 0 ? (
                <span
                  style={{ fontSize: 12, color: 'var(--card-muted-fg-color)' }}
                >
                  가격 옵션 없음
                </span>
              ) : (
                <div
                  style={{ display: 'flex', flexDirection: 'column', gap: 4 }}
                >
                  {opts.map((o) => {
                    const checked = l.optionKeys.includes(o._key);
                    return (
                      <label
                        key={o._key}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          fontSize: 12,
                          cursor: 'pointer',
                          padding: '2px 0',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleOption(l.treatmentId, o._key)}
                        />
                        <span style={{ flex: 1 }}>
                          {o.name}
                          {o.caption ? ` · ${o.caption}` : ''}
                          {o.isEvent ? ' · [EVENT]' : ''}
                        </span>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          {o.discountPrice &&
                          o.discountPrice > 0 &&
                          o.price &&
                          o.discountPrice < o.price ? (
                            <>
                              <span
                                style={{
                                  textDecoration: 'line-through',
                                  color: 'var(--card-muted-fg-color)',
                                  marginRight: 6,
                                }}
                              >
                                {o.price.toLocaleString()}원
                              </span>
                              <span
                                style={{ color: '#a83c44', fontWeight: 600 }}
                              >
                                {o.discountPrice.toLocaleString()}원
                              </span>
                            </>
                          ) : (
                            <span
                              style={{ color: 'var(--card-muted-fg-color)' }}
                            >
                              {fmtPrice(o)}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <select
          className="bn-text-input"
          value=""
          onChange={(e) => {
            addTreatment(e.target.value);
            e.currentTarget.value = '';
          }}
          style={{ maxWidth: 360 }}
        >
          <option value="">+ 시술 추가…</option>
          {available.map((t) => (
            <option key={t._id} value={t._id}>
              {CATEGORY_LABELS[t.category ?? ''] || t.category} ·{' '}
              {t.name || '(이름 없음)'}
            </option>
          ))}
        </select>
      </Section>

      {deleteConfirm && (
        <div className="bn-modal-overlay">
          <div className="bn-modal">
            <h3 className="bn-modal-title">이벤트 삭제</h3>
            <p className="bn-modal-body">
              이 이벤트를 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="bn-modal-actions">
              <button
                className="bn-modal-cancel"
                onClick={() => setDeleteConfirm(false)}
              >
                취소
              </button>
              <button className="bn-modal-delete" onClick={handleDelete}>
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
