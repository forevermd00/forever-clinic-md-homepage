import { useState, useEffect, useRef } from 'react';
import { useClient } from 'sanity';
import { EDITABLE_CATEGORIES, CATEGORY_LABEL } from './types';

const FULL_QUERY = `
  *[_type == "treatment" && _id == $id][0] {
    _id, _updatedAt,
    "name": name,
    "tagline": tagline,
    "slug": slug.current,
    category, isEvent, isSignature, isVisible, sortOrder,
    priceOptions[] { price, discountPrice, label },
    eventStartDate, eventEndDate,
    treatmentTime,
    "anesthesia": anesthesia,
    downtime, duration,
    "keywords": keywords,
    "description": description,
    "composition": composition
  }
`;

type LocalizedStr = {
  ko?: string;
  en?: string;
  zh?: string;
  ja?: string;
} | null;

interface FullDoc {
  _id: string;
  name: LocalizedStr;
  tagline: LocalizedStr;
  slug?: string;
  category?: string;
  isEvent?: boolean;
  isSignature?: boolean;
  isVisible?: boolean;
  sortOrder?: number;
  priceOptions?: { price?: number; discountPrice?: number; label?: string }[];
  eventStartDate?: string;
  eventEndDate?: string;
  treatmentTime?: string;
  anesthesia?: LocalizedStr;
  downtime?: string;
  duration?: string;
  keywords?: LocalizedStr;
  description?: LocalizedStr;
  composition?: LocalizedStr;
}

const LOCALES: { key: 'ko' | 'en' | 'zh' | 'ja'; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
  { key: 'ja', label: '日本語' },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="tt-detail-section">
      <h3 className="tt-detail-section-title">{title}</h3>
      {children}
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
    <div className="tt-detail-field">
      <label className="tt-detail-label">{label}</label>
      {children}
    </div>
  );
}

export function TreatmentDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<FullDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const saved = useRef(false);

  useEffect(() => {
    client.fetch(FULL_QUERY, { id }).then((data: FullDoc) => {
      setDoc(data);
    });
  }, [client, id]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    saved.current = true;
    await client.patch(id).set(fields).commit();
    setDoc((prev) =>
      prev
        ? (mergeDeep(
            prev as unknown as Record<string, unknown>,
            fields,
          ) as unknown as FullDoc)
        : prev,
    );
    setSaving(false);
  };

  const patchBool = (field: string, value: boolean) => {
    patch({ [field]: value });
    setDoc((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (!doc) {
    return (
      <div className="tt-container">
        <button className="tt-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="tt-loading">불러오는 중...</div>
      </div>
    );
  }

  const nameKo = doc.name?.ko || '(시술명 없음)';
  const firstPrice = doc.priceOptions?.[0];

  return (
    <div className="tt-container tt-detail-container">
      {/* Header */}
      <div className="tt-detail-header">
        <button className="tt-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="tt-detail-title-row">
          <h2 className="tt-detail-title">{nameKo}</h2>
          {saving && <span className="tt-saving-indicator">저장 중…</span>}
        </div>
      </div>

      {/* ─── 기본 설정 ─── */}
      <Section title="기본 설정">
        <div className="tt-detail-row">
          <Field label="정렬 순서">
            <input
              type="number"
              className="tt-order-input"
              defaultValue={doc.sortOrder ?? 0}
              onBlur={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) patch({ sortOrder: v });
              }}
            />
          </Field>
          <Field label="카테고리">
            <select
              className="tt-category-select tt-category-select-lg"
              value={doc.category || ''}
              onChange={(e) => {
                patch({ category: e.target.value });
                setDoc((prev) =>
                  prev ? { ...prev, category: e.target.value } : prev,
                );
              }}
            >
              <option value="">—</option>
              {EDITABLE_CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="이벤트">
            <input
              type="checkbox"
              className="tt-toggle tt-toggle-event"
              checked={!!doc.isEvent}
              onChange={(e) => patchBool('isEvent', e.target.checked)}
            />
          </Field>
          <Field label="시그니처">
            <input
              type="checkbox"
              className="tt-toggle tt-toggle-sig"
              checked={!!doc.isSignature}
              onChange={(e) => patchBool('isSignature', e.target.checked)}
            />
          </Field>
          <Field label="노출">
            <input
              type="checkbox"
              className="tt-toggle"
              checked={!!doc.isVisible}
              onChange={(e) => patchBool('isVisible', e.target.checked)}
            />
          </Field>
        </div>
      </Section>

      {/* ─── 가격 ─── */}
      <Section title="가격">
        <div className="tt-detail-row">
          <Field label="기본가 (₩)">
            <input
              type="number"
              className="tt-text-input tt-text-input-sm"
              defaultValue={firstPrice?.price ?? ''}
              onBlur={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) patch({ 'priceOptions[0].price': v });
              }}
            />
          </Field>
          <Field label="할인가 (₩)">
            <input
              type="number"
              className="tt-text-input tt-text-input-sm"
              defaultValue={firstPrice?.discountPrice ?? ''}
              placeholder="없으면 비워두세요"
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val === '') {
                  patch({ 'priceOptions[0].discountPrice': null });
                } else {
                  const v = parseInt(val, 10);
                  if (!isNaN(v)) patch({ 'priceOptions[0].discountPrice': v });
                }
              }}
            />
          </Field>
          {doc.isEvent && (
            <>
              <Field label="이벤트 시작일">
                <input
                  type="date"
                  className="tt-text-input tt-text-input-sm"
                  defaultValue={doc.eventStartDate ?? ''}
                  onBlur={(e) =>
                    patch({ eventStartDate: e.target.value || null })
                  }
                />
              </Field>
              <Field label="이벤트 종료일">
                <input
                  type="date"
                  className="tt-text-input tt-text-input-sm"
                  defaultValue={doc.eventEndDate ?? ''}
                  onBlur={(e) =>
                    patch({ eventEndDate: e.target.value || null })
                  }
                />
              </Field>
            </>
          )}
        </div>
      </Section>

      {/* ─── 시술명 ─── */}
      <Section title="시술명">
        <div className="tt-detail-grid4">
          {LOCALES.map(({ key, label }) => (
            <Field key={key} label={label}>
              <input
                type="text"
                className="tt-text-input"
                defaultValue={doc.name?.[key] ?? ''}
                onBlur={(e) => patch({ [`name.${key}`]: e.target.value })}
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ─── 한줄 소개 ─── */}
      <Section title="한줄 소개 (태그라인)">
        <div className="tt-detail-grid4">
          {LOCALES.map(({ key, label }) => (
            <Field key={key} label={label}>
              <input
                type="text"
                className="tt-text-input"
                defaultValue={doc.tagline?.[key] ?? ''}
                onBlur={(e) => patch({ [`tagline.${key}`]: e.target.value })}
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ─── 시술 정보 ─── */}
      <Section title="시술 정보">
        <div className="tt-detail-row tt-detail-row-wrap">
          <Field label="시술시간">
            <input
              type="text"
              className="tt-text-input tt-text-input-sm"
              defaultValue={doc.treatmentTime ?? ''}
              placeholder="예: 약 30분"
              onBlur={(e) => patch({ treatmentTime: e.target.value })}
            />
          </Field>
          <Field label="마취">
            <input
              type="text"
              className="tt-text-input tt-text-input-sm"
              defaultValue={doc.anesthesia?.ko ?? ''}
              placeholder="예: 연고 마취"
              onBlur={(e) => patch({ 'anesthesia.ko': e.target.value })}
            />
          </Field>
          <Field label="다운타임">
            <input
              type="text"
              className="tt-text-input tt-text-input-sm"
              defaultValue={doc.downtime ?? ''}
              placeholder="예: 거의 없음"
              onBlur={(e) => patch({ downtime: e.target.value })}
            />
          </Field>
          <Field label="권장횟수">
            <input
              type="text"
              className="tt-text-input tt-text-input-sm"
              defaultValue={doc.duration ?? ''}
              placeholder="예: 4~6회"
              onBlur={(e) => patch({ duration: e.target.value })}
            />
          </Field>
        </div>
      </Section>

      {/* ─── 상세 설명 ─── */}
      <Section title="상세 설명">
        <div className="tt-detail-grid2">
          {LOCALES.map(({ key, label }) => (
            <Field key={key} label={label}>
              <textarea
                className="tt-text-input tt-textarea"
                defaultValue={doc.description?.[key] ?? ''}
                rows={4}
                onBlur={(e) =>
                  patch({ [`description.${key}`]: e.target.value })
                }
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ─── 키워드 (시그니처) ─── */}
      <Section title="키워드">
        <div className="tt-detail-grid2">
          {(['ko', 'en'] as const).map((key) => (
            <Field key={key} label={key === 'ko' ? '한국어' : 'English'}>
              <input
                type="text"
                className="tt-text-input"
                defaultValue={doc.keywords?.[key] ?? ''}
                placeholder="예: 강한 리프팅 · 턱라인"
                onBlur={(e) => patch({ [`keywords.${key}`]: e.target.value })}
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ─── 구성 시술 (시그니처) ─── */}
      <Section title="구성 시술">
        <div className="tt-detail-grid2">
          {(['ko', 'en'] as const).map((key) => (
            <Field key={key} label={key === 'ko' ? '한국어' : 'English'}>
              <textarea
                className="tt-text-input tt-textarea"
                defaultValue={doc.composition?.[key] ?? ''}
                rows={3}
                onBlur={(e) =>
                  patch({ [`composition.${key}`]: e.target.value })
                }
              />
            </Field>
          ))}
        </div>
      </Section>

      {doc.category && (
        <div className="tt-detail-footer">
          현재 카테고리:{' '}
          <strong>{CATEGORY_LABEL[doc.category] || doc.category}</strong>
        </div>
      )}
    </div>
  );
}

function mergeDeep(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (key.includes('.')) {
      const [top, ...rest] = key.split('.');
      result[top] = mergeDeep((result[top] as Record<string, unknown>) || {}, {
        [rest.join('.')]: source[key],
      });
    } else {
      result[key] = source[key];
    }
  }
  return result;
}
