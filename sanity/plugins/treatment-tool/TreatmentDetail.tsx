import { useState, useEffect, useRef } from 'react';
import { useClient } from 'sanity';
import { EDITABLE_CATEGORIES, CATEGORY_LABEL } from './types';

const FULL_QUERY = `
  *[_type == "treatment" && _id == $id][0] {
    _id, _updatedAt,
    "name": name,
    "tagline": tagline,
    "slug": slug.current,
    category, "isEvent": count(priceOptions[isEvent == true]) > 0, isSignature, isVisible, showInMenu, sortOrder,
    priceOptions[] {
      _key, name, caption, area, price, discountPrice, isEvent
    },
    treatmentTime,
    "anesthesia": anesthesia,
    downtime, duration,
    "keywords": keywords,
    "description": description,
    "composition": composition,
    "features": features[],
    "recommendedFor": recommendedFor[],
    "procedure": procedure[],
    "precautions": precautions[],
    "faq": faq[]
  }
`;

type LocalizedStr = {
  ko?: string;
  en?: string;
  zh?: string;
  ja?: string;
} | null;

interface LocalizedItem {
  _key: string;
  _type?: string;
  ko?: string;
  en?: string;
  zh?: string;
  ja?: string;
}

interface FaqItem {
  _key: string;
  _type?: string;
  question?: { ko?: string; en?: string; zh?: string; ja?: string };
  answer?: { ko?: string; en?: string; zh?: string; ja?: string };
}

interface PriceOptionItem {
  _key: string;
  _type?: string;
  name?: { ko?: string; en?: string; zh?: string; ja?: string };
  caption?: { ko?: string; en?: string; zh?: string; ja?: string };
  area?: string;
  price?: number;
  discountPrice?: number;
  isEvent?: boolean;
}

interface FullDoc {
  _id: string;
  name: LocalizedStr;
  tagline: LocalizedStr;
  slug?: string;
  category?: string;
  isEvent?: boolean;
  isSignature?: boolean;
  isVisible?: boolean;
  showInMenu?: boolean;
  sortOrder?: number;
  priceOptions?: PriceOptionItem[];
  treatmentTime?: LocalizedStr;
  anesthesia?: LocalizedStr;
  downtime?: LocalizedStr;
  duration?: LocalizedStr;
  keywords?: LocalizedStr;
  description?: LocalizedStr;
  composition?: LocalizedStr;
  features?: LocalizedItem[];
  recommendedFor?: LocalizedItem[];
  procedure?: LocalizedItem[];
  precautions?: LocalizedItem[];
  faq?: FaqItem[];
}

const LOCALES: { key: 'ko' | 'en' | 'zh' | 'ja'; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
  { key: 'ja', label: '日本語' },
];

function newKey() {
  return Math.random().toString(36).slice(2, 10);
}

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

function LocalizedArrayEditor({
  initialItems,
  onSave,
}: {
  initialItems: LocalizedItem[] | undefined;
  onSave: (items: LocalizedItem[]) => void;
}) {
  const [items, setItems] = useState<LocalizedItem[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && Array.isArray(initialItems)) {
      setItems(initialItems);
      initialized.current = true;
    }
  }, [initialItems]);

  const updateLocale = (
    i: number,
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [locale]: val } : it)),
    );
  };

  const saveBlur = (
    i: number,
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setItems((prev) => {
      const updated = prev.map((it, idx) =>
        idx === i ? { ...it, [locale]: val } : it,
      );
      onSave(updated);
      return updated;
    });
  };

  const remove = (i: number) => {
    setItems((prev) => {
      const updated = prev.filter((_, idx) => idx !== i);
      onSave(updated);
      return updated;
    });
  };

  const add = () => {
    setItems((prev) => {
      const updated = [
        ...prev,
        {
          _key: newKey(),
          _type: 'localizedString',
          ko: '',
          en: '',
          zh: '',
          ja: '',
        },
      ];
      onSave(updated);
      return updated;
    });
  };

  return (
    <div className="tt-array-editor">
      {items.map((item, i) => (
        <div key={item._key} className="tt-array-item">
          <div className="tt-array-item-header">
            <span className="tt-array-num">{i + 1}</span>
            <button className="tt-remove-btn" onClick={() => remove(i)}>
              ✕
            </button>
          </div>
          <div className="tt-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="tt-detail-field">
                <label className="tt-detail-label">{label}</label>
                <input
                  type="text"
                  className="tt-text-input"
                  value={item[key] ?? ''}
                  onChange={(e) => updateLocale(i, key, e.target.value)}
                  onBlur={(e) => saveBlur(i, key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="tt-add-btn" onClick={add}>
        + 항목 추가
      </button>
    </div>
  );
}

function FaqEditor({
  initialItems,
  onSave,
}: {
  initialItems: FaqItem[] | undefined;
  onSave: (items: FaqItem[]) => void;
}) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && Array.isArray(initialItems)) {
      setItems(initialItems);
      initialized.current = true;
    }
  }, [initialItems]);

  const updateField = (
    i: number,
    field: 'question' | 'answer',
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === i ? { ...it, [field]: { ...it[field], [locale]: val } } : it,
      ),
    );
  };

  const saveBlur = (
    i: number,
    field: 'question' | 'answer',
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setItems((prev) => {
      const updated = prev.map((it, idx) =>
        idx === i ? { ...it, [field]: { ...it[field], [locale]: val } } : it,
      );
      onSave(updated);
      return updated;
    });
  };

  const remove = (i: number) => {
    setItems((prev) => {
      const updated = prev.filter((_, idx) => idx !== i);
      onSave(updated);
      return updated;
    });
  };

  const add = () => {
    setItems((prev) => {
      const updated = [
        ...prev,
        {
          _key: newKey(),
          _type: 'faqItem',
          question: { ko: '', en: '', zh: '', ja: '' },
          answer: { ko: '', en: '', zh: '', ja: '' },
        },
      ];
      onSave(updated);
      return updated;
    });
  };

  return (
    <div className="tt-array-editor">
      {items.map((item, i) => (
        <div key={item._key} className="tt-array-item tt-faq-item">
          <div className="tt-array-item-header">
            <span className="tt-array-num">Q{i + 1}</span>
            <button className="tt-remove-btn" onClick={() => remove(i)}>
              ✕
            </button>
          </div>
          <div className="tt-faq-group">
            <p className="tt-faq-group-label">질문</p>
            <div className="tt-detail-grid4">
              {LOCALES.map(({ key, label }) => (
                <div key={key} className="tt-detail-field">
                  <label className="tt-detail-label">{label}</label>
                  <input
                    type="text"
                    className="tt-text-input"
                    value={item.question?.[key] ?? ''}
                    onChange={(e) =>
                      updateField(i, 'question', key, e.target.value)
                    }
                    onBlur={(e) => saveBlur(i, 'question', key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="tt-faq-group">
            <p className="tt-faq-group-label">답변</p>
            <div className="tt-detail-grid4">
              {LOCALES.map(({ key, label }) => (
                <div key={key} className="tt-detail-field">
                  <label className="tt-detail-label">{label}</label>
                  <textarea
                    className="tt-text-input tt-textarea"
                    value={item.answer?.[key] ?? ''}
                    onChange={(e) =>
                      updateField(i, 'answer', key, e.target.value)
                    }
                    onBlur={(e) => saveBlur(i, 'answer', key, e.target.value)}
                    rows={3}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
      <button className="tt-add-btn" onClick={add}>
        + FAQ 추가
      </button>
    </div>
  );
}

function PriceOptionsEditor({
  initialItems,
  onSave,
}: {
  initialItems: PriceOptionItem[] | undefined;
  onSave: (items: PriceOptionItem[]) => void;
}) {
  const [items, setItems] = useState<PriceOptionItem[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current && Array.isArray(initialItems)) {
      setItems(initialItems);
      initialized.current = true;
    }
  }, [initialItems]);

  const commit = (updated: PriceOptionItem[]) => {
    setItems(updated);
    onSave(updated);
  };

  const updateName = (
    i: number,
    field: 'name' | 'caption',
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === i ? { ...it, [field]: { ...it[field], [locale]: val } } : it,
      ),
    );
  };

  const saveNameBlur = (
    i: number,
    field: 'name' | 'caption',
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    const updated = items.map((it, idx) =>
      idx === i ? { ...it, [field]: { ...it[field], [locale]: val } } : it,
    );
    commit(updated);
  };

  const remove = (i: number) => commit(items.filter((_, idx) => idx !== i));

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  };

  const add = () =>
    commit([
      ...items,
      {
        _key: newKey(),
        _type: 'priceOption',
        name: { ko: '', en: '', zh: '', ja: '' },
        caption: { ko: '', en: '', zh: '', ja: '' },
        area: '',
        isEvent: false,
      },
    ]);

  return (
    <div className="tt-array-editor">
      {items.map((item, i) => (
        <div key={item._key} className="tt-array-item">
          <div className="tt-array-item-header">
            <span className="tt-array-num">{i + 1}</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className="tt-remove-btn"
                title="위로"
                onClick={() => move(i, -1)}
                disabled={i === 0}
              >
                ↑
              </button>
              <button
                className="tt-remove-btn"
                title="아래로"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
              >
                ↓
              </button>
              <button className="tt-remove-btn" onClick={() => remove(i)}>
                ✕
              </button>
            </div>
          </div>

          {/* 메타 행: 부위 / 가격 / 할인가 / 이벤트 */}
          <div className="tt-detail-row tt-detail-row-wrap">
            <Field label="부위 그룹 (선택)">
              <input
                type="text"
                className="tt-text-input tt-text-input-sm"
                defaultValue={item.area ?? ''}
                placeholder="얼굴 / 눈가 / 바디…"
                onBlur={(e) =>
                  commit(
                    items.map((it, idx) =>
                      idx === i ? { ...it, area: e.target.value } : it,
                    ),
                  )
                }
              />
            </Field>
            <Field label="가격 (₩, 부가세 별도)">
              <input
                type="number"
                className="tt-text-input tt-text-input-sm"
                defaultValue={item.price ?? ''}
                onBlur={(e) => {
                  const v = parseInt(e.target.value, 10);
                  commit(
                    items.map((it, idx) =>
                      idx === i
                        ? { ...it, price: isNaN(v) ? undefined : v }
                        : it,
                    ),
                  );
                }}
              />
            </Field>
            <Field label="할인가 (₩)">
              <input
                type="number"
                className="tt-text-input tt-text-input-sm"
                defaultValue={item.discountPrice ?? ''}
                placeholder="없으면 비움"
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  const v = parseInt(val, 10);
                  commit(
                    items.map((it, idx) =>
                      idx === i
                        ? {
                            ...it,
                            discountPrice:
                              val === '' || isNaN(v) ? undefined : v,
                          }
                        : it,
                    ),
                  );
                }}
              />
            </Field>
            <Field label="이벤트">
              <input
                type="checkbox"
                className="tt-toggle tt-toggle-event"
                checked={!!item.isEvent}
                onChange={(e) =>
                  commit(
                    items.map((it, idx) =>
                      idx === i ? { ...it, isEvent: e.target.checked } : it,
                    ),
                  )
                }
              />
            </Field>
          </div>

          {/* 옵션명 (4개 언어) */}
          <p className="tt-faq-group-label">옵션명</p>
          <div className="tt-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="tt-detail-field">
                <label className="tt-detail-label">{label}</label>
                <input
                  type="text"
                  className="tt-text-input"
                  value={item.name?.[key] ?? ''}
                  onChange={(e) => updateName(i, 'name', key, e.target.value)}
                  onBlur={(e) => saveNameBlur(i, 'name', key, e.target.value)}
                />
              </div>
            ))}
          </div>

          {/* 보조 설명 (용량/횟수) — 4개 언어 */}
          <p className="tt-faq-group-label" style={{ marginTop: 8 }}>
            보조 설명 (예: 300샷 / 1회)
          </p>
          <div className="tt-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="tt-detail-field">
                <label className="tt-detail-label">{label}</label>
                <input
                  type="text"
                  className="tt-text-input"
                  value={item.caption?.[key] ?? ''}
                  onChange={(e) =>
                    updateName(i, 'caption', key, e.target.value)
                  }
                  onBlur={(e) =>
                    saveNameBlur(i, 'caption', key, e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="tt-add-btn" onClick={add}>
        + 옵션 추가
      </button>
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
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [slugLocked, setSlugLocked] = useState(true);
  const saved = useRef(false);

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
    client.fetch(FULL_QUERY, { id }).then((data: FullDoc) => {
      setDoc(data);
      setSlugLocked(true);
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

  const patchArray = async (field: string, newArray: unknown[]) => {
    setSaving(true);
    await client
      .patch(id)
      .set({ [field]: newArray })
      .commit();
    setDoc((prev) => (prev ? { ...prev, [field]: newArray } : prev));
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
          <button
            className="tt-detail-delete-btn"
            onClick={() => setDeleteConfirm(true)}
          >
            삭제
          </button>
        </div>
        {doc.tagline?.ko && (
          <p className="tt-detail-tagline">{doc.tagline.ko}</p>
        )}
      </div>

      {/* ─── 기본 설정 ─── */}
      <Section title="기본 설정">
        <div className="tt-detail-row">
          <Field label="정렬 순서">
            <span className="tt-order-display">{doc.sortOrder ?? 0}</span>
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
            <span
              className={`tt-event-badge${doc.isEvent ? 'tt-event-badge-on' : ''}`}
              title="가격 옵션에 '이벤트' 항목이 있으면 자동으로 켜집니다"
            >
              {doc.isEvent ? 'EVENT' : '—'}
            </span>
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
          <Field label="메뉴 노출">
            <input
              type="checkbox"
              className="tt-toggle"
              checked={!!doc.showInMenu}
              onChange={(e) => patchBool('showInMenu', e.target.checked)}
            />
          </Field>
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

      {/* ─── URL 슬러그 ─── */}
      <Section title="URL 슬러그">
        <p className="tt-detail-hint">
          상세 페이지 주소로 사용됩니다. 영문 소문자·숫자·하이픈만 권장. 변경 시
          기존 링크가 깨질 수 있으니 주의하세요.
        </p>
        <Field label="슬러그">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              className="tt-text-input"
              defaultValue={doc.slug ?? ''}
              placeholder="예: rejuran-healer"
              disabled={slugLocked}
              style={
                slugLocked
                  ? { opacity: 0.6, cursor: 'not-allowed', flex: 1 }
                  : { flex: 1 }
              }
              onBlur={(e) => {
                const v = e.target.value
                  .trim()
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9가-힣-]/g, '')
                  .replace(/-+/g, '-')
                  .replace(/^-+|-+$/g, '');
                e.target.value = v;
                if (!v || v === (doc.slug ?? '')) return;
                setSaving(true);
                saved.current = true;
                client
                  .patch(id)
                  .set({ slug: { _type: 'slug', current: v } })
                  .commit()
                  .then(() => {
                    setDoc((prev) => (prev ? { ...prev, slug: v } : prev));
                    setSaving(false);
                  });
              }}
            />
            <button
              type="button"
              className="tt-back-btn"
              style={{ whiteSpace: 'nowrap' }}
              onClick={() => setSlugLocked((v) => !v)}
            >
              {slugLocked ? '🔒 잠금 해제' : '🔓 잠금'}
            </button>
          </div>
        </Field>
      </Section>

      {/* ─── 가격 옵션 ─── */}
      <Section title="가격 옵션">
        <p className="tt-detail-hint">
          부위·용량별 옵션을 추가하세요. 고객은 상세 페이지에서 옵션을 선택·수량
          조절하여 예상금액을 확인합니다. 가격은 모두 부가세 별도 기준입니다.
        </p>
        <PriceOptionsEditor
          initialItems={doc.priceOptions}
          onSave={(items) => patchArray('priceOptions', items)}
        />
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

      {/* ─── 키워드 (태그) ─── */}
      <Section title="키워드 (태그)">
        <p className="tt-detail-hint">
          시그니처 카드에 표시되는 태그입니다. 항목은 가운데점(·)으로
          구분합니다. 예: 꺼진 볼 · 눈밑·눈물고랑 · 비대칭
        </p>
        <div className="tt-detail-grid4">
          {LOCALES.map(({ key, label }) => (
            <Field key={key} label={label}>
              <input
                type="text"
                className="tt-text-input"
                defaultValue={doc.keywords?.[key] ?? ''}
                onBlur={(e) => patch({ [`keywords.${key}`]: e.target.value })}
              />
            </Field>
          ))}
        </div>
      </Section>

      {/* ─── 시술 정보 ─── */}
      <TreatmentInfoSection doc={doc} patch={patch} />

      {/* ─── 시술 소개 ─── */}
      <Section title="시술 소개">
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

      {/* ─── 이런 고민이 있다면 ─── */}
      <Section title="이런 고민이 있다면">
        <LocalizedArrayEditor
          initialItems={doc.recommendedFor}
          onSave={(items) => patchArray('recommendedFor', items)}
        />
      </Section>

      {/* ─── 이런 변화를 기대할 수 있어요 ─── */}
      <Section title="이런 변화를 기대할 수 있어요">
        <LocalizedArrayEditor
          initialItems={doc.features}
          onSave={(items) => patchArray('features', items)}
        />
      </Section>

      {/* ─── 시술 과정 ─── */}
      <Section title="시술 과정">
        <LocalizedArrayEditor
          initialItems={doc.procedure}
          onSave={(items) => patchArray('procedure', items)}
        />
      </Section>

      {/* ─── 자주 묻는 질문 ─── */}
      <Section title="자주 묻는 질문 (FAQ)">
        <FaqEditor
          initialItems={doc.faq}
          onSave={(items) => patchArray('faq', items)}
        />
      </Section>

      {/* ─── 주의사항 ─── */}
      <Section title="주의사항">
        <LocalizedArrayEditor
          initialItems={doc.precautions}
          onSave={(items) => patchArray('precautions', items)}
        />
      </Section>

      {doc.category && (
        <div className="tt-detail-footer">
          현재 카테고리:{' '}
          <strong>{CATEGORY_LABEL[doc.category] || doc.category}</strong>
        </div>
      )}

      {/* Delete confirmation popup */}
      {deleteConfirm && (
        <div className="tt-modal-overlay">
          <div className="tt-modal">
            <h3 className="tt-modal-title">시술 삭제</h3>
            <p className="tt-modal-body">
              이 시술을 삭제하시겠습니까?
              <br />이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="tt-modal-actions">
              <button
                className="tt-modal-cancel"
                onClick={() => setDeleteConfirm(false)}
              >
                취소
              </button>
              <button
                className="tt-modal-delete"
                onClick={async () => {
                  await client.delete(id);
                  onBack();
                }}
              >
                삭제하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TreatmentInfoSection({
  doc,
  patch,
}: {
  doc: FullDoc;
  patch: (fields: Record<string, unknown>) => Promise<void>;
}) {
  const INFO_FIELDS: {
    key: 'treatmentTime' | 'anesthesia' | 'downtime' | 'duration';
    label: string;
    placeholder: string;
  }[] = [
    { key: 'treatmentTime', label: '시술시간', placeholder: '예: 약 30분' },
    { key: 'anesthesia', label: '마취', placeholder: '예: 연고 마취' },
    { key: 'downtime', label: '다운타임', placeholder: '예: 거의 없음' },
    { key: 'duration', label: '권장횟수', placeholder: '예: 4~6회' },
  ];

  return (
    <div className="tt-detail-section">
      <div className="tt-detail-section-title">
        <span>시술 정보</span>
      </div>
      <div
        style={{
          padding: 14,
          display: 'flex',
          flexDirection: 'column',
          gap: 18,
        }}
      >
        {INFO_FIELDS.map((f) => (
          <div key={f.key}>
            <div
              className="tt-detail-label"
              style={{ marginBottom: 6, fontWeight: 600 }}
            >
              {f.label}
            </div>
            <div className="tt-detail-grid4">
              {LOCALES.map(({ key, label }) => (
                <Field key={key} label={label}>
                  <input
                    type="text"
                    className="tt-text-input"
                    defaultValue={doc[f.key]?.[key] ?? ''}
                    placeholder={key === 'ko' ? f.placeholder : ''}
                    onBlur={(e) =>
                      patch({ [`${f.key}.${key}`]: e.target.value })
                    }
                  />
                </Field>
              ))}
            </div>
          </div>
        ))}
      </div>
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
