import { useState, useEffect, useRef } from 'react';
import { useClient } from 'sanity';
import type { BnaFullDoc } from './types';

const FULL_QUERY = `
  *[_type == "baCase" && _id == $id][0] {
    _id, _updatedAt,
    "treatmentName": coalesce(treatment->name.ko, treatment->name.en, "(미연결)"),
    "treatmentRef": treatment,
    sessions,
    "elapsed": elapsed,
    "description": description,
    showOnMain, isVisible, sortOrder
  }
`;

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

export function BnaDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<BnaFullDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const saved = useRef(false);

  // ESC key and swipe-right to go back
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
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

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onBack]);

  useEffect(() => {
    client.fetch<BnaFullDoc>(FULL_QUERY, { id }).then((data) => {
      setDoc(data);
    });
  }, [client, id]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    saved.current = true;
    await client.patch(id).set(fields).commit();
    setDoc((prev) => (prev ? { ...prev, ...fields } : prev));
    setSaving(false);
  };

  const patchBool = (field: string, value: boolean) => {
    patch({ [field]: value });
    setDoc((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  if (!doc) {
    return (
      <div className="bn-container">
        <button className="bn-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="bn-loading">불러오는 중...</div>
      </div>
    );
  }

  return (
    <div className="bn-container bn-detail-container">
      {/* Header */}
      <div className="bn-detail-header">
        <button className="bn-back-btn" onClick={onBack}>
          ← 목록으로
          <span className="bn-back-hint">ESC</span>
        </button>
        <div className="bn-detail-title-row">
          <h2 className="bn-detail-title">{doc.treatmentName}</h2>
          {saving && <span className="bn-saving-indicator">저장 중…</span>}
        </div>
      </div>

      {/* ─── 기본 설정 ─── */}
      <Section title="기본 설정">
        <div className="bn-detail-row">
          <Field label="정렬 순서">
            <input
              type="number"
              className="bn-order-input"
              defaultValue={doc.sortOrder ?? 0}
              onBlur={(e) => {
                const v = parseInt(e.target.value, 10);
                if (!isNaN(v)) patch({ sortOrder: v });
              }}
            />
          </Field>
          <Field label="메인노출">
            <input
              type="checkbox"
              className="bn-toggle bn-toggle-main"
              checked={!!doc.showOnMain}
              onChange={(e) => patchBool('showOnMain', e.target.checked)}
            />
          </Field>
          <Field label="노출">
            <input
              type="checkbox"
              className="bn-toggle"
              checked={!!doc.isVisible}
              onChange={(e) => patchBool('isVisible', e.target.checked)}
            />
          </Field>
        </div>
      </Section>

      {/* ─── 시술 연결 ─── */}
      <Section title="시술 연결">
        <div className="bn-detail-row">
          <Field label="연결된 시술">
            <div className="bn-ref-readonly">{doc.treatmentName}</div>
            <div className="bn-ref-hint">
              시술 연결 변경은 콘텐츠 탭에서 직접 편집하세요.
            </div>
          </Field>
        </div>
      </Section>

      {/* ─── 시술 정보 ─── */}
      <Section title="시술 정보">
        <div className="bn-detail-row">
          <Field label="시술 횟수">
            <input
              type="number"
              className="bn-text-input bn-text-input-sm"
              defaultValue={doc.sessions ?? ''}
              placeholder="예: 3"
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (val === '') {
                  patch({ sessions: null });
                } else {
                  const v = parseInt(val, 10);
                  if (!isNaN(v)) patch({ sessions: v });
                }
              }}
            />
          </Field>
          <Field label="경과 기간 (한국어)">
            <input
              type="text"
              className="bn-text-input"
              defaultValue={doc.elapsed?.ko ?? ''}
              placeholder="예: 3회 시술 후 1개월"
              onBlur={(e) => patch({ 'elapsed.ko': e.target.value })}
            />
          </Field>
        </div>
      </Section>

      {/* ─── 설명 ─── */}
      <Section title="설명">
        <div className="bn-detail-grid2">
          <Field label="한국어">
            <textarea
              className="bn-textarea"
              defaultValue={doc.description?.ko ?? ''}
              rows={4}
              onBlur={(e) => patch({ 'description.ko': e.target.value })}
            />
          </Field>
          <Field label="English">
            <textarea
              className="bn-textarea"
              defaultValue={doc.description?.en ?? ''}
              rows={4}
              onBlur={(e) => patch({ 'description.en': e.target.value })}
            />
          </Field>
        </div>
      </Section>
    </div>
  );
}
