import { useState, useEffect, useRef } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';

interface LocalizedStr {
  ko?: string;
  en?: string;
  zh?: string;
  ja?: string;
}

interface LocalizedItem {
  _key: string;
  _type?: string;
  ko?: string;
  en?: string;
  zh?: string;
  ja?: string;
}

const LOCALES: { key: 'ko' | 'en' | 'zh' | 'ja'; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
  { key: 'ja', label: '日本語' },
];

interface DoctorDoc {
  _id: string;
  name?: LocalizedStr;
  position?: LocalizedStr;
  profileImage?: { asset?: { _ref: string } };
  philosophy?: LocalizedStr;
  specialties?: LocalizedItem[];
  careers?: LocalizedItem[];
  licenseNumber?: string;
  isVisible?: boolean;
  sortOrder?: number;
}

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

function newKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

const QUERY = `*[_type == "doctor" && _id == $id][0] {
  _id, name, position, profileImage { asset { _ref } },
  philosophy, specialties[] { _key, _type, ko, en, zh, ja },
  careers[] { _key, _type, ko, en, zh, ja },
  licenseNumber, isVisible, sortOrder
}`;

function LocalizedArrayEditor({
  initialItems,
  onSave,
}: {
  initialItems: LocalizedItem[] | undefined;
  onSave: (items: LocalizedItem[]) => void;
}) {
  const [items, setItems] = useState<LocalizedItem[]>([]);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
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

  const handleDragStart = (i: number) => {
    setDraggingIdx(i);
  };

  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOverIdx(i);
  };

  const handleDrop = (
    e: React.DragEvent,
    toIdx: number,
    fromIdx: number | null,
  ) => {
    e.preventDefault();
    if (fromIdx === null || fromIdx === toIdx) {
      setDraggingIdx(null);
      setDragOverIdx(null);
      return;
    }
    setItems((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      onSave(updated);
      return updated;
    });
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  const handleDragEnd = () => {
    setDraggingIdx(null);
    setDragOverIdx(null);
  };

  return (
    <div className="ht-array-editor">
      {items.map((item, i) => (
        <div
          key={item._key}
          className={[
            'ht-array-item',
            draggingIdx === i ? 'dragging' : '',
            dragOverIdx === i && draggingIdx !== i ? 'drag-over' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          draggable
          onDragStart={() => handleDragStart(i)}
          onDragOver={(e) => handleDragOver(e, i)}
          onDrop={(e) => handleDrop(e, i, draggingIdx)}
          onDragEnd={handleDragEnd}
        >
          <div className="ht-array-item-header">
            <div className="ht-array-item-header-left">
              <span className="ht-drag-handle" title="드래그하여 순서 변경">
                ⠿
              </span>
              <span className="ht-array-num">{i + 1}</span>
            </div>
            <button className="ht-remove-btn" onClick={() => remove(i)}>
              ✕
            </button>
          </div>
          <div className="ht-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <input
                  type="text"
                  className="ht-text-input"
                  value={item[key] ?? ''}
                  onChange={(e) => updateLocale(i, key, e.target.value)}
                  onBlur={(e) => saveBlur(i, key, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      ))}
      <button className="ht-add-btn" onClick={add}>
        + 항목 추가
      </button>
    </div>
  );
}

export function DoctorDetail({
  id,
  onBack,
}: {
  id: string;
  onBack: () => void;
}) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<DoctorDoc | null>(null);
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
    client.fetch<DoctorDoc>(QUERY, { id }).then(setDoc);
  }, [client, id]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    await client.patch(id).set(fields).commit();
    setDoc((prev) => (prev ? { ...prev, ...fields } : prev));
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

  const handleDelete = async () => {
    if (!confirm('이 의료진 정보를 삭제하시겠습니까?')) return;
    await client.delete(id);
    onBack();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageRef = await uploadImage(client, file);
      await client.patch(id).set({ profileImage: imageRef }).commit();
      setDoc((prev) => (prev ? { ...prev, profileImage: imageRef } : prev));
    } finally {
      setUploading(false);
    }
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  const projectId = 'ecoamz42';
  const dataset = 'production';
  const imageRef = doc.profileImage?.asset?._ref;

  return (
    <div className="ht-detail-container">
      <div className="ht-detail-header">
        <button className="ht-back-btn" onClick={onBack}>
          ← 목록으로
        </button>
        <div className="ht-detail-title-row">
          <h2 className="ht-detail-title">{doc.name?.ko || '(이름 없음)'}</h2>
          {saving && <span className="ht-saving-indicator">저장 중…</span>}
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">이름</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.name?.[key] ?? ''}
                  onBlur={(e) => patch({ [`name.${key}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">직위</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.position?.[key] ?? ''}
                  onBlur={(e) => patch({ [`position.${key}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">진료 철학</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <textarea
                  className="ht-text-input ht-textarea"
                  defaultValue={doc.philosophy?.[key] ?? ''}
                  rows={3}
                  onBlur={(e) =>
                    patch({ [`philosophy.${key}`]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">전문 분야</div>
        <div className="ht-detail-body">
          <LocalizedArrayEditor
            initialItems={doc.specialties}
            onSave={(items) => patchArray('specialties', items)}
          />
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">약력</div>
        <div className="ht-detail-body">
          <LocalizedArrayEditor
            initialItems={doc.careers}
            onSave={(items) => patchArray('careers', items)}
          />
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">기본 설정</div>
        <div className="ht-detail-body">
          <div className="ht-detail-row">
            <div className="ht-detail-field">
              <label className="ht-detail-label">면허번호</label>
              <input
                type="text"
                className="ht-text-input"
                defaultValue={doc.licenseNumber ?? ''}
                onBlur={(e) => patch({ licenseNumber: e.target.value })}
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
              <label className="ht-detail-label">노출 여부</label>
              <input
                type="checkbox"
                className="tt-toggle"
                checked={doc.isVisible !== false}
                onChange={(e) => patchBool('isVisible', e.target.checked)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">프로필 이미지</div>
        <div className="ht-detail-body">
          {imageRef && (
            <img
              src={sanityImageUrl(projectId, dataset, imageRef)}
              alt="profile"
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

      <div className="ht-detail-delete-area">
        <button className="ht-delete-btn" onClick={handleDelete}>
          이 문서 삭제
        </button>
      </div>
    </div>
  );
}
