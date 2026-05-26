import { useState } from 'react';
import { ConsultationDoc, STATUS_OPTIONS, SOURCE_LABELS } from './types';
import {
  StatusBadge,
  formatDate,
  formatTreatments,
  formatTreatmentDetails,
} from './ConsultationTool';

interface Props {
  doc: ConsultationDoc;
  onClose: () => void;
  onPatch: (id: string, fields: Record<string, unknown>) => Promise<void>;
  onHide: (id: string) => Promise<void>;
  onUnhide?: (id: string) => Promise<void>;
  isExample?: boolean;
}

export function DetailModal({
  doc,
  onClose,
  onPatch,
  onHide,
  onUnhide,
  isExample,
}: Props) {
  const [status, setStatus] = useState(doc.status);
  const [consultNote, setConsultNote] = useState(doc.consultNote || '');
  const [saving, setSaving] = useState(false);

  const dirty =
    status !== doc.status || consultNote !== (doc.consultNote || '');

  const handleSave = async () => {
    setSaving(true);
    await onPatch(doc._id, { status, consultNote });
    setSaving(false);
    onClose();
  };

  return (
    <div className="ct-backdrop" onClick={onClose}>
      <div className="ct-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ct-modal-header">
          <div className="ct-modal-header-left">
            <StatusBadge status={status} />
            <span className="ct-modal-title">{doc.name}</span>
          </div>
          <div className="ct-modal-header-right">
            {!isExample && doc.isHidden && onUnhide && (
              <button
                className="ct-delete-btn"
                onClick={() => onUnhide(doc._id)}
                title="숨김 취소"
              >
                숨김 취소
              </button>
            )}
            {!isExample && !doc.isHidden && (
              <button
                className="ct-delete-btn"
                onClick={() => onHide(doc._id)}
                title="숨기기"
              >
                숨기기
              </button>
            )}
            <button className="ct-close-btn" onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="ct-modal-body">
          {/* Meta grid */}
          <div className="ct-meta-grid">
            <MetaItem
              label="문의일시"
              value={formatDate(doc.createdAt || doc._createdAt)}
            />
            <MetaItem label="연락처" value={doc.phone} />
            <MetaItem
              label="희망 예약일"
              value={
                doc.preferredDate
                  ? `${doc.preferredDate}${doc.preferredTime ? ' ' + doc.preferredTime : ''}`
                  : '-'
              }
            />
            <MetaItem label="이메일" value={doc.email || '-'} />
            <MetaItem label="관심 시술" value={formatTreatments(doc)} />
            <MetaItem
              label="출처"
              value={SOURCE_LABELS[doc.source || ''] || '-'}
            />
          </div>

          {/* Treatment details */}
          {formatTreatmentDetails(doc) && (
            <div className="ct-section">
              <div className="ct-section-label">시술 상세</div>
              <div className="ct-readonly-box">
                {formatTreatmentDetails(doc)}
              </div>
            </div>
          )}

          {/* Message (read-only) */}
          <div className="ct-section">
            <div className="ct-section-label">문의 내용</div>
            <div className="ct-readonly-box">{doc.message || '-'}</div>
          </div>

          {/* Status (editable) */}
          <div className="ct-section">
            <div className="ct-section-label">상담 상태</div>
            <div className="ct-status-row">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatus(s.value)}
                  className={`ct-status-btn ${status === s.value ? 'active' : ''}`}
                  style={
                    status === s.value
                      ? {
                          background: `var(--ct-badge-${s.value}-bg)`,
                          color: `var(--ct-badge-${s.value}-fg)`,
                          borderColor: `var(--ct-badge-${s.value}-fg)`,
                        }
                      : undefined
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Consult note (editable) */}
          <div className="ct-section">
            <div className="ct-section-label">상담 메모</div>
            <textarea
              className="ct-textarea"
              value={consultNote}
              onChange={(e) => setConsultNote(e.target.value)}
              placeholder="상담 내용을 기록하세요"
              rows={3}
            />
          </div>

          {/* Save button — always visible, disabled when no changes */}
          {!isExample && (
            <button
              className="ct-save-btn"
              onClick={handleSave}
              disabled={!dirty || saving}
            >
              {saving ? '저장 중...' : '변경사항 저장'}
            </button>
          )}
          {isExample && (
            <div className="ct-example-modal-hint">
              예시 데이터입니다. 실제 상담이 들어오면 이곳에서 수정할 수
              있습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="ct-meta-item">
      <div className="ct-meta-label">{label}</div>
      <div className="ct-meta-val">{value}</div>
    </div>
  );
}
