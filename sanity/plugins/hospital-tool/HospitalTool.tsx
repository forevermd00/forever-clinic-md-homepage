import { useState, useEffect, useRef } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';
import { useRouter, useRouterState } from 'sanity/router';
import { DoctorDetail } from './DoctorDetail';
import { HeroDetail } from './HeroDetail';
import { QuickCardDetail } from './QuickCardDetail';
import { PAGE_HEROES } from '../../../sanity.config';
import './hospital-tool.css';

// ─── Types ────────────────────────────────────────────────

interface DoctorRow {
  _id: string;
  name?: string;
  position?: string;
  isVisible?: boolean;
  sortOrder?: number;
}

interface HeroRow {
  _id: string;
  pageName: string;
  titleKo?: string;
  hasImage?: boolean;
}

interface ClinicInfoDoc {
  address?: { ko?: string; en?: string };
  phone?: string;
  email?: string;
  closedDayNotice?: { ko?: string; en?: string };
  walkingGuide?: { ko?: string };
}

interface BrandValue {
  _key: string;
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  description?: { ko?: string; en?: string; zh?: string; ja?: string };
  image?: { asset?: { _ref: string } };
}

interface BrandDoc {
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  subtitle?: { ko?: string; en?: string; zh?: string; ja?: string };
  slogan?: { ko?: string; en?: string; zh?: string; ja?: string };
  content?: { ko?: string; en?: string; zh?: string; ja?: string };
  backgroundImage?: { asset?: { _ref: string } };
  values?: BrandValue[];
}

interface StatsItem {
  _key: string;
  label?: { ko?: string };
  number?: number;
  unit?: string;
}

interface StatsDoc {
  stats?: StatsItem[];
}

interface EventPopupDoc {
  _id: string;
  title?: { ko?: string };
  linkUrl?: string;
  startDate?: string;
  endDate?: string;
  isVisible?: boolean;
}

interface QuickTabDoc {
  _id: string;
  key?: string;
  label?: { ko?: string };
  isVisible?: boolean;
}

interface QuickCardDoc {
  _id: string;
  title?: { ko?: string };
  slug?: { current?: string };
  tab?: { label?: { ko?: string } };
  isVisible?: boolean;
  sortOrder?: number;
}

interface SectionVisibilityDoc {
  nav?: {
    bnA?: boolean;
    treatments?: boolean;
    brand?: boolean;
    media?: boolean;
  };
  home?: {
    hero?: boolean;
    quickEntry?: boolean;
    signature?: boolean;
    promo?: boolean;
    bnA?: boolean;
    stats?: boolean;
    doctors?: boolean;
    location?: boolean;
    contact?: boolean;
  };
  brand?: {
    philosophy?: boolean;
    doctors?: boolean;
    facilities?: boolean;
    equipment?: boolean;
    location?: boolean;
  };
  media?: {
    press?: boolean;
    video?: boolean;
    blog?: boolean;
    notice?: boolean;
  };
  treatments?: { detail?: boolean };
  contact?: { showPreferredDatetime?: boolean };
}

// ─── Queries ─────────────────────────────────────────────

const DOCTORS_QUERY = `*[_type == "doctor"] | order(sortOrder asc) {
  _id,
  "name": name.ko,
  "position": position.ko,
  isVisible, sortOrder
}`;

const HEROES_QUERY = `*[_type == "pageHero"] {
  _id, pageName,
  "titleKo": title.ko,
  "hasImage": defined(heroImage)
}`;

const CLINIC_INFO_QUERY = `*[_type == "clinicInfo" && _id == "forever-myeongdong-clinic-info"][0] {
  address, phone, email, closedDayNotice, walkingGuide
}`;

const BRAND_QUERY = `*[_type == "brandPhilosophy" && _id == "forever-myeongdong-brand"][0] {
  title, subtitle, slogan, content,
  backgroundImage { asset { _ref } },
  values[] { _key, title, description, image { asset { _ref } } }
}`;

const STATS_QUERY = `*[_type == "statsStrip" && _id == "forever-myeongdong-stats"][0] {
  stats[] { _key, label, number, unit }
}`;

const POPUPS_QUERY = `*[_type == "eventPopup"] | order(_createdAt desc) {
  _id, title, linkUrl, startDate, endDate, isVisible
}`;

const QTABS_QUERY = `*[_type == "quickEntryTab"] | order(sortOrder asc) {
  _id, key, label, isVisible
}`;

const QCARDS_QUERY = `*[_type == "quickEntryCard"] | order(sortOrder asc) {
  _id, title, slug, "tab": tab->{ label }, isVisible, sortOrder
}`;

const SV_QUERY = `*[_type == "sectionVisibility" && _id == "sectionVisibility"][0]`;

// ─── Helpers ──────────────────────────────────────────────

function newKey(): string {
  return Math.random().toString(36).slice(2, 10);
}

function sanityImageUrl(
  projectId: string,
  dataset: string,
  ref: string,
): string {
  const id = ref.replace('image-', '').replace(/-(\w+)$/, '.$1');
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}`;
}

// ─── Sub-tabs ─────────────────────────────────────────────

type MainTab = 'doctors' | 'clinicInfo' | 'hero' | 'siteSettings' | 'sections';

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'doctors', label: '의료진' },
  { key: 'clinicInfo', label: '병원 정보' },
  { key: 'hero', label: '히어로 배너' },
  { key: 'siteSettings', label: '사이트 설정' },
  { key: 'sections', label: '섹션 노출' },
];

// ─── 의료진 패널 ──────────────────────────────────────────

function DoctorsPanel({ onEdit }: { onEdit: (id: string) => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<DoctorRow[]>(DOCTORS_QUERY).then((data) => {
      setDocs(data);
      setLoading(false);
    });
  }, [client]);

  const handleAdd = async () => {
    const newDoc = await client.create({ _type: 'doctor' });
    onEdit(newDoc._id);
  };

  const toggleVisible = async (id: string, val: boolean) => {
    await client.patch(id).set({ isVisible: val }).commit();
    setDocs((prev) =>
      prev.map((d) => (d._id === id ? { ...d, isVisible: val } : d)),
    );
  };

  if (loading) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div>
      <div className="ht-toolbar">
        <button className="ht-add-btn" onClick={handleAdd}>
          + 의사 추가
        </button>
      </div>
      <div className="ht-table-wrap">
        <table className="ht-table">
          <colgroup>
            <col style={{ width: '44px' }} />
            <col />
            <col style={{ width: '140px' }} />
            <col style={{ width: '70px' }} />
          </colgroup>
          <thead>
            <tr>
              <th>No.</th>
              <th>이름 (ko)</th>
              <th>직위 (ko)</th>
              <th style={{ textAlign: 'center' }}>노출</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={4} className="ht-empty">
                  의료진이 없습니다
                </td>
              </tr>
            ) : (
              docs.map((doc, idx) => (
                <tr
                  key={doc._id}
                  className="ht-row-clickable"
                  onClick={() => onEdit(doc._id)}
                >
                  <td className="ht-row-num">{idx + 1}</td>
                  <td>
                    <span className="ht-row-name">
                      {doc.name || '(이름 없음)'}
                    </span>
                  </td>
                  <td className="ht-row-meta">{doc.position || '—'}</td>
                  <td
                    style={{ textAlign: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="tt-toggle"
                      checked={!!doc.isVisible}
                      onChange={(e) => toggleVisible(doc._id, e.target.checked)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 병원 정보 패널 ───────────────────────────────────────

function ClinicInfoPanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<ClinicInfoDoc | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.fetch<ClinicInfoDoc>(CLINIC_INFO_QUERY).then((data) => {
      setDoc(data ?? {});
    });
  }, [client]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    await client.patch('forever-myeongdong-clinic-info').set(fields).commit();
    setSaving(false);
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-panel-section">
      {saving && <span className="ht-saving-indicator">저장 중…</span>}

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">주소</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid2">
            {(['ko', 'en'] as const).map((key) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">
                  {key === 'ko' ? '한국어' : 'English'}
                </label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.address?.[key] ?? ''}
                  onBlur={(e) => patch({ [`address.${key}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">연락처</div>
        <div className="ht-detail-body">
          <div className="ht-detail-row">
            <div className="ht-detail-field">
              <label className="ht-detail-label">전화번호</label>
              <input
                type="text"
                className="ht-text-input"
                defaultValue={doc.phone ?? ''}
                onBlur={(e) => patch({ phone: e.target.value })}
              />
            </div>
            <div className="ht-detail-field">
              <label className="ht-detail-label">이메일</label>
              <input
                type="text"
                className="ht-text-input"
                defaultValue={doc.email ?? ''}
                onBlur={(e) => patch({ email: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">휴진일 안내</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid2">
            {(['ko', 'en'] as const).map((key) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">
                  {key === 'ko' ? '한국어' : 'English'}
                </label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.closedDayNotice?.[key] ?? ''}
                  onBlur={(e) =>
                    patch({ [`closedDayNotice.${key}`]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">도보 안내 (한국어)</div>
        <div className="ht-detail-body">
          <div className="ht-detail-field">
            <textarea
              className="ht-text-input ht-textarea"
              defaultValue={doc.walkingGuide?.ko ?? ''}
              rows={4}
              onBlur={(e) => patch({ 'walkingGuide.ko': e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="ht-detail-section">
        <div className="ht-detail-section-title">
          복합 필드 (외부 편집기 사용)
        </div>
        <div className="ht-detail-body">
          <p className="ht-readonly-notice">
            진료시간, 위치 좌표, SNS 링크, 메신저 링크는 Sanity Studio 기본
            편집기에서 관리됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 히어로 배너 패널 ─────────────────────────────────────

function HeroBannerPanel({ onEdit }: { onEdit: (heroKey: string) => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [heroDocs, setHeroDocs] = useState<HeroRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch<HeroRow[]>(HEROES_QUERY).then((data) => {
      setHeroDocs(data ?? []);
      setLoading(false);
    });
  }, [client]);

  if (loading) return <div className="ht-loading">불러오는 중...</div>;

  const heroMap = new Map(heroDocs.map((h) => [h.pageName, h]));

  return (
    <div className="ht-table-wrap">
      <table className="ht-table">
        <colgroup>
          <col style={{ width: '44px' }} />
          <col />
          <col />
          <col style={{ width: '80px' }} />
        </colgroup>
        <thead>
          <tr>
            <th>No.</th>
            <th>페이지</th>
            <th>제목 (ko)</th>
            <th style={{ textAlign: 'center' }}>이미지</th>
          </tr>
        </thead>
        <tbody>
          {PAGE_HEROES.map((page, idx) => {
            const heroDoc = heroMap.get(page.title);
            return (
              <tr
                key={page.key}
                className="ht-row-clickable"
                onClick={() => onEdit(page.title)}
              >
                <td className="ht-row-num">{idx + 1}</td>
                <td>
                  <span className="ht-row-name">{page.title}</span>
                </td>
                <td className="ht-row-meta">{heroDoc?.titleKo || '—'}</td>
                <td style={{ textAlign: 'center' }}>
                  {heroDoc?.hasImage ? (
                    <span className="ht-badge-yes">O</span>
                  ) : (
                    <span className="ht-row-meta">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── 사이트 설정 패널 ─────────────────────────────────────

type SiteSettingsTab = 'brand' | 'stats' | 'popups' | 'quickNav';

const BRAND_LOCALE_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
  ja: '日本語',
};

async function uploadImageAsset(client: SanityClient, file: File) {
  const asset = await client.assets.upload('image', file, {
    filename: file.name,
  });
  return {
    _type: 'image' as const,
    asset: { _type: 'reference' as const, _ref: asset._id },
  };
}

function BrandSection() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<BrandDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [values, setValues] = useState<BrandValue[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    client.fetch<BrandDoc>(BRAND_QUERY).then((data) => {
      setDoc(data ?? {});
      if (!initialized.current) {
        setValues(data?.values ?? []);
        initialized.current = true;
      }
    });
  }, [client]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    await client.patch('forever-myeongdong-brand').set(fields).commit();
    setSaving(false);
  };

  const saveValues = async (newValues: BrandValue[]) => {
    setSaving(true);
    await client
      .patch('forever-myeongdong-brand')
      .set({ values: newValues })
      .commit();
    setSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const imageRef = await uploadImageAsset(client, file);
      await client
        .patch('forever-myeongdong-brand')
        .set({ backgroundImage: imageRef })
        .commit();
      setDoc((prev) => (prev ? { ...prev, backgroundImage: imageRef } : prev));
    } finally {
      setUploading(false);
    }
  };

  const handleValueImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    idx: number,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const imageRef = await uploadImageAsset(client, file);
    setValues((prev) => {
      const updated = prev.map((v, i) =>
        i === idx ? { ...v, image: imageRef } : v,
      );
      saveValues(updated);
      return updated;
    });
  };

  const addValue = () => {
    setValues((prev) => {
      const updated = [...prev, { _key: newKey(), title: {}, description: {} }];
      saveValues(updated);
      return updated;
    });
  };

  const removeValue = (idx: number) => {
    setValues((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      saveValues(updated);
      return updated;
    });
  };

  const updateValueLocale = (
    idx: number,
    field: 'title' | 'description',
    locale: string,
    val: string,
  ) => {
    setValues((prev) =>
      prev.map((v, i) =>
        i === idx ? { ...v, [field]: { ...v[field], [locale]: val } } : v,
      ),
    );
  };

  const saveValueBlur = (
    idx: number,
    field: 'title' | 'description',
    locale: string,
    val: string,
  ) => {
    setValues((prev) => {
      const updated = prev.map((v, i) =>
        i === idx ? { ...v, [field]: { ...v[field], [locale]: val } } : v,
      );
      saveValues(updated);
      return updated;
    });
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  const imageRef = doc.backgroundImage?.asset?._ref;

  return (
    <div className="ht-subsection">
      <div className="ht-subsection-title">
        브랜드 철학
        {saving && <span className="ht-saving-indicator">저장 중…</span>}
      </div>
      <div className="ht-detail-section" style={{ marginTop: 12 }}>
        <div className="ht-detail-section-title">제목</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {(['ko', 'en', 'zh', 'ja'] as const).map((key) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">
                  {BRAND_LOCALE_LABELS[key]}
                </label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.title?.[key] ?? ''}
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
            {(['ko', 'en', 'zh', 'ja'] as const).map((key) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">
                  {BRAND_LOCALE_LABELS[key]}
                </label>
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
        <div className="ht-detail-section-title">슬로건</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {(['ko', 'en', 'zh', 'ja'] as const).map((key) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">
                  {BRAND_LOCALE_LABELS[key]}
                </label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.slogan?.[key] ?? ''}
                  onBlur={(e) => patch({ [`slogan.${key}`]: e.target.value })}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">본문</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {(['ko', 'en', 'zh', 'ja'] as const).map((key) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">
                  {BRAND_LOCALE_LABELS[key]}
                </label>
                <textarea
                  className="ht-text-input ht-textarea"
                  rows={5}
                  defaultValue={doc.content?.[key] ?? ''}
                  onBlur={(e) => patch({ [`content.${key}`]: e.target.value })}
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
              src={sanityImageUrl('ecoamz42', 'develop', imageRef)}
              alt="bg"
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

      {/* ─── 브랜드 가치 목록 ─── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">브랜드 가치 목록</div>
        <div className="ht-detail-body">
          <div className="ht-array-editor">
            {values.map((val, idx) => {
              const valImageRef = val.image?.asset?._ref;
              return (
                <div key={val._key} className="ht-array-item">
                  <div className="ht-array-item-header">
                    <span className="ht-array-num">{idx + 1}</span>
                    <button
                      className="ht-remove-btn"
                      onClick={() => removeValue(idx)}
                    >
                      ✕
                    </button>
                  </div>
                  <div
                    className="ht-detail-section"
                    style={{ marginBottom: 10 }}
                  >
                    <div className="ht-detail-section-title">제목</div>
                    <div className="ht-detail-body">
                      <div className="ht-detail-grid4">
                        {(['ko', 'en', 'zh', 'ja'] as const).map((locale) => (
                          <div key={locale} className="ht-detail-field">
                            <label className="ht-detail-label">
                              {BRAND_LOCALE_LABELS[locale]}
                            </label>
                            <input
                              type="text"
                              className="ht-text-input"
                              value={val.title?.[locale] ?? ''}
                              onChange={(e) =>
                                updateValueLocale(
                                  idx,
                                  'title',
                                  locale,
                                  e.target.value,
                                )
                              }
                              onBlur={(e) =>
                                saveValueBlur(
                                  idx,
                                  'title',
                                  locale,
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div
                    className="ht-detail-section"
                    style={{ marginBottom: 10 }}
                  >
                    <div className="ht-detail-section-title">설명</div>
                    <div className="ht-detail-body">
                      <div className="ht-detail-grid4">
                        {(['ko', 'en', 'zh', 'ja'] as const).map((locale) => (
                          <div key={locale} className="ht-detail-field">
                            <label className="ht-detail-label">
                              {BRAND_LOCALE_LABELS[locale]}
                            </label>
                            <textarea
                              className="ht-text-input ht-textarea"
                              rows={3}
                              value={val.description?.[locale] ?? ''}
                              onChange={(e) =>
                                updateValueLocale(
                                  idx,
                                  'description',
                                  locale,
                                  e.target.value,
                                )
                              }
                              onBlur={(e) =>
                                saveValueBlur(
                                  idx,
                                  'description',
                                  locale,
                                  e.target.value,
                                )
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">이미지</label>
                    {valImageRef && (
                      <img
                        src={sanityImageUrl('ecoamz42', 'develop', valImageRef)}
                        alt="value"
                        className="ht-thumb-preview"
                      />
                    )}
                    <label className="ht-upload-btn">
                      이미지 선택
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={(e) => handleValueImageUpload(e, idx)}
                      />
                    </label>
                  </div>
                </div>
              );
            })}
            <button className="ht-add-btn" onClick={addValue}>
              + 가치 항목 추가
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsSection() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<StatsDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const initialized = useRef(false);
  const [items, setItems] = useState<StatsItem[]>([]);

  useEffect(() => {
    client.fetch<StatsDoc>(STATS_QUERY).then((data) => {
      setDoc(data ?? {});
      if (!initialized.current) {
        setItems(data?.stats ?? []);
        initialized.current = true;
      }
    });
  }, [client]);

  const save = async (newItems: StatsItem[]) => {
    setSaving(true);
    await client
      .patch('forever-myeongdong-stats')
      .set({ stats: newItems })
      .commit();
    setSaving(false);
  };

  const update = (
    i: number,
    field: 'label.ko' | 'number' | 'unit',
    val: string | number,
  ) => {
    setItems((prev) => {
      const updated = prev.map((it, idx) => {
        if (idx !== i) return it;
        if (field === 'label.ko') {
          return { ...it, label: { ...it.label, ko: val as string } };
        }
        return { ...it, [field]: val };
      });
      return updated;
    });
  };

  const saveBlur = (
    i: number,
    field: 'label.ko' | 'number' | 'unit',
    val: string | number,
  ) => {
    setItems((prev) => {
      const updated = prev.map((it, idx) => {
        if (idx !== i) return it;
        if (field === 'label.ko') {
          return { ...it, label: { ...it.label, ko: val as string } };
        }
        return { ...it, [field]: val };
      });
      save(updated);
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => {
      const updated = [
        ...prev,
        { _key: newKey(), label: { ko: '' }, number: 0, unit: '' },
      ];
      save(updated);
      return updated;
    });
  };

  const removeItem = (i: number) => {
    setItems((prev) => {
      const updated = prev.filter((_, idx) => idx !== i);
      save(updated);
      return updated;
    });
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-subsection">
      <div className="ht-subsection-title">
        통계 수치{' '}
        {saving && <span className="ht-saving-indicator">저장 중…</span>}
      </div>
      <div className="ht-array-editor" style={{ marginTop: 12 }}>
        {items.map((item, i) => (
          <div key={item._key} className="ht-array-item">
            <div className="ht-array-item-header">
              <span className="ht-array-num">{i + 1}</span>
              <button className="ht-remove-btn" onClick={() => removeItem(i)}>
                ✕
              </button>
            </div>
            <div className="ht-detail-row">
              <div className="ht-detail-field">
                <label className="ht-detail-label">항목명 (ko)</label>
                <input
                  type="text"
                  className="ht-text-input"
                  value={item.label?.ko ?? ''}
                  onChange={(e) => update(i, 'label.ko', e.target.value)}
                  onBlur={(e) => saveBlur(i, 'label.ko', e.target.value)}
                />
              </div>
              <div className="ht-detail-field">
                <label className="ht-detail-label">숫자</label>
                <input
                  type="number"
                  className="ht-text-input ht-order-input"
                  value={item.number ?? 0}
                  onChange={(e) => update(i, 'number', Number(e.target.value))}
                  onBlur={(e) => saveBlur(i, 'number', Number(e.target.value))}
                />
              </div>
              <div className="ht-detail-field">
                <label className="ht-detail-label">단위</label>
                <input
                  type="text"
                  className="ht-text-input"
                  style={{ width: 80 }}
                  value={item.unit ?? ''}
                  onChange={(e) => update(i, 'unit', e.target.value)}
                  onBlur={(e) => saveBlur(i, 'unit', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <button className="ht-add-btn" onClick={addItem}>
          + 항목 추가
        </button>
      </div>
    </div>
  );
}

function PopupsSection() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<EventPopupDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    client.fetch<EventPopupDoc[]>(POPUPS_QUERY).then((data) => {
      setDocs(data ?? []);
      setLoading(false);
    });
  }, [client]);

  const patch = async (id: string, fields: Record<string, unknown>) => {
    await client.patch(id).set(fields).commit();
    setDocs((prev) =>
      prev.map((d) => (d._id === id ? { ...d, ...fields } : d)),
    );
  };

  const handleAdd = async () => {
    const newDoc = await client.create({
      _type: 'eventPopup',
      title: { ko: '' },
    });
    setDocs((prev) => [
      { _id: newDoc._id, title: { ko: '' }, isVisible: true },
      ...prev,
    ]);
    setExpandedId(newDoc._id);
  };

  if (loading) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-subsection">
      <div className="ht-subsection-title">이벤트 팝업</div>
      <div className="ht-toolbar" style={{ marginTop: 8 }}>
        <button className="ht-add-btn" onClick={handleAdd}>
          + 팝업 추가
        </button>
      </div>
      <div className="ht-popup-list">
        {docs.map((doc) => (
          <div key={doc._id} className="ht-popup-item">
            <div
              className="ht-popup-header"
              onClick={() =>
                setExpandedId((prev) => (prev === doc._id ? null : doc._id))
              }
            >
              <span className="ht-popup-title">
                {doc.title?.ko || '(제목 없음)'}
              </span>
              <span className="ht-popup-meta">
                {doc.startDate ? doc.startDate.slice(0, 10) : ''}
                {doc.endDate ? ` ~ ${doc.endDate.slice(0, 10)}` : ''}
              </span>
              <input
                type="checkbox"
                className="tt-toggle"
                checked={!!doc.isVisible}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) =>
                  patch(doc._id, { isVisible: e.target.checked })
                }
              />
              <span className="ht-popup-chevron">
                {expandedId === doc._id ? '▲' : '▼'}
              </span>
            </div>
            {expandedId === doc._id && (
              <div className="ht-popup-body">
                <div className="ht-detail-field" style={{ marginBottom: 10 }}>
                  <label className="ht-detail-label">제목 (ko)</label>
                  <input
                    type="text"
                    className="ht-text-input"
                    defaultValue={doc.title?.ko ?? ''}
                    onBlur={(e) =>
                      patch(doc._id, { 'title.ko': e.target.value })
                    }
                  />
                </div>
                <div className="ht-detail-field" style={{ marginBottom: 10 }}>
                  <label className="ht-detail-label">링크 URL</label>
                  <input
                    type="text"
                    className="ht-text-input"
                    defaultValue={doc.linkUrl ?? ''}
                    onBlur={(e) => patch(doc._id, { linkUrl: e.target.value })}
                  />
                </div>
                <div className="ht-detail-row">
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">시작일</label>
                    <input
                      type="datetime-local"
                      className="ht-text-input"
                      defaultValue={
                        doc.startDate ? doc.startDate.slice(0, 16) : ''
                      }
                      onBlur={(e) =>
                        patch(doc._id, {
                          startDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        })
                      }
                    />
                  </div>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">종료일</label>
                    <input
                      type="datetime-local"
                      className="ht-text-input"
                      defaultValue={doc.endDate ? doc.endDate.slice(0, 16) : ''}
                      onBlur={(e) =>
                        patch(doc._id, {
                          endDate: e.target.value
                            ? new Date(e.target.value).toISOString()
                            : null,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {docs.length === 0 && <p className="ht-empty">팝업이 없습니다</p>}
      </div>
    </div>
  );
}

function QuickNavSection({ onEditCard }: { onEditCard: (id: string) => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [tabs, setTabs] = useState<QuickTabDoc[]>([]);
  const [cards, setCards] = useState<QuickCardDoc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.fetch<QuickTabDoc[]>(QTABS_QUERY),
      client.fetch<QuickCardDoc[]>(QCARDS_QUERY),
    ]).then(([tabData, cardData]) => {
      setTabs(tabData ?? []);
      setCards(cardData ?? []);
      setLoading(false);
    });
  }, [client]);

  const toggleTab = async (id: string, val: boolean) => {
    await client.patch(id).set({ isVisible: val }).commit();
    setTabs((prev) =>
      prev.map((t) => (t._id === id ? { ...t, isVisible: val } : t)),
    );
  };

  const toggleCard = async (id: string, val: boolean) => {
    await client.patch(id).set({ isVisible: val }).commit();
    setCards((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isVisible: val } : c)),
    );
  };

  const handleAddCard = async () => {
    const newDoc = await client.create({ _type: 'quickEntryCard' });
    onEditCard(newDoc._id);
  };

  if (loading) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-subsection">
      <div className="ht-subsection-title">빠른 탐색</div>

      <div className="ht-detail-section" style={{ marginTop: 12 }}>
        <div className="ht-detail-section-title">탭 목록</div>
        <div className="ht-detail-body">
          <table className="ht-table">
            <thead>
              <tr>
                <th>이름 (ko)</th>
                <th>key</th>
                <th style={{ textAlign: 'center' }}>노출</th>
              </tr>
            </thead>
            <tbody>
              {tabs.map((tab) => (
                <tr key={tab._id}>
                  <td>{tab.label?.ko || '—'}</td>
                  <td className="ht-row-meta">{tab.key || '—'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <input
                      type="checkbox"
                      className="tt-toggle"
                      checked={!!tab.isVisible}
                      onChange={(e) => toggleTab(tab._id, e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
              {tabs.length === 0 && (
                <tr>
                  <td colSpan={3} className="ht-empty">
                    탭이 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="ht-detail-section" style={{ marginTop: 16 }}>
        <div className="ht-detail-section-title">카드 목록</div>
        <div className="ht-detail-body">
          <div className="ht-toolbar" style={{ marginBottom: 10 }}>
            <button className="ht-add-btn" onClick={handleAddCard}>
              + 카드 추가
            </button>
          </div>
          <table className="ht-table">
            <colgroup>
              <col style={{ width: '44px' }} />
              <col />
              <col style={{ width: '140px' }} />
              <col style={{ width: '120px' }} />
              <col style={{ width: '70px' }} />
            </colgroup>
            <thead>
              <tr>
                <th>No.</th>
                <th>제목 (ko)</th>
                <th>slug</th>
                <th>탭</th>
                <th style={{ textAlign: 'center' }}>노출</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card, idx) => (
                <tr
                  key={card._id}
                  className="ht-row-clickable"
                  onClick={() => onEditCard(card._id)}
                >
                  <td className="ht-row-num">{idx + 1}</td>
                  <td>
                    <span className="ht-row-name">{card.title?.ko || '—'}</span>
                  </td>
                  <td className="ht-row-meta">{card.slug?.current || '—'}</td>
                  <td className="ht-row-meta">{card.tab?.label?.ko || '—'}</td>
                  <td
                    style={{ textAlign: 'center' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      className="tt-toggle"
                      checked={!!card.isVisible}
                      onChange={(e) => toggleCard(card._id, e.target.checked)}
                    />
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td colSpan={5} className="ht-empty">
                    카드가 없습니다
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SiteSettingsPanel({
  onEditCard,
}: {
  onEditCard: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<SiteSettingsTab>('brand');

  const tabs: { key: SiteSettingsTab; label: string }[] = [
    { key: 'brand', label: '브랜드 철학' },
    { key: 'stats', label: '통계 수치' },
    { key: 'popups', label: '이벤트 팝업' },
    { key: 'quickNav', label: '빠른 탐색' },
  ];

  return (
    <div>
      <div className="ht-sub-tabs">
        {tabs.map((t) => (
          <button
            key={t.key}
            className={`ht-sub-tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'brand' && <BrandSection />}
      {activeTab === 'stats' && <StatsSection />}
      {activeTab === 'popups' && <PopupsSection />}
      {activeTab === 'quickNav' && <QuickNavSection onEditCard={onEditCard} />}
    </div>
  );
}

// ─── ToggleRow (module-level) ─────────────────────────────

function ToggleRow({
  label,
  path,
  value,
  onToggle,
}: {
  label: string;
  path: string;
  value: boolean | undefined;
  onToggle: (path: string, value: boolean) => void;
}) {
  return (
    <div className="ht-sv-row">
      <span className="ht-sv-label">{label}</span>
      <input
        type="checkbox"
        className="tt-toggle"
        checked={!!value}
        onChange={(e) => onToggle(path, e.target.checked)}
      />
    </div>
  );
}

// ─── 섹션 노출 패널 ───────────────────────────────────────

function SectionsPanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<SectionVisibilityDoc | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    client.fetch<SectionVisibilityDoc>(SV_QUERY).then((data) => {
      setDoc(data ?? {});
    });
  }, [client]);

  const toggle = async (path: string, value: boolean) => {
    setSaving(true);
    await client
      .patch('sectionVisibility')
      .set({ [path]: value })
      .commit();
    setSaving(false);
    // Optimistic update for nested path
    setDoc((prev) => {
      if (!prev) return prev;
      const parts = path.split('.');
      if (parts.length === 2) {
        const [group, field] = parts;
        const g = group as keyof SectionVisibilityDoc;
        return {
          ...prev,
          [g]: {
            ...(prev[g] as Record<string, unknown>),
            [field]: value,
          },
        };
      }
      return prev;
    });
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-panel-section">
      {saving && <span className="ht-saving-indicator">저장 중…</span>}

      <div className="ht-sv-group">
        <div className="ht-sv-group-title">메뉴 노출</div>
        <ToggleRow
          label="B&A"
          path="nav.bnA"
          value={doc.nav?.bnA}
          onToggle={toggle}
        />
        <ToggleRow
          label="시술"
          path="nav.treatments"
          value={doc.nav?.treatments}
          onToggle={toggle}
        />
        <ToggleRow
          label="브랜드"
          path="nav.brand"
          value={doc.nav?.brand}
          onToggle={toggle}
        />
        <ToggleRow
          label="미디어"
          path="nav.media"
          value={doc.nav?.media}
          onToggle={toggle}
        />
      </div>

      <div className="ht-sv-group">
        <div className="ht-sv-group-title">메인 홈 섹션</div>
        <ToggleRow
          label="히어로"
          path="home.hero"
          value={doc.home?.hero}
          onToggle={toggle}
        />
        <ToggleRow
          label="퀵엔트리"
          path="home.quickEntry"
          value={doc.home?.quickEntry}
          onToggle={toggle}
        />
        <ToggleRow
          label="시그니처"
          path="home.signature"
          value={doc.home?.signature}
          onToggle={toggle}
        />
        <ToggleRow
          label="프로모션"
          path="home.promo"
          value={doc.home?.promo}
          onToggle={toggle}
        />
        <ToggleRow
          label="B&A"
          path="home.bnA"
          value={doc.home?.bnA}
          onToggle={toggle}
        />
        <ToggleRow
          label="통계"
          path="home.stats"
          value={doc.home?.stats}
          onToggle={toggle}
        />
        <ToggleRow
          label="의료진"
          path="home.doctors"
          value={doc.home?.doctors}
          onToggle={toggle}
        />
        <ToggleRow
          label="위치"
          path="home.location"
          value={doc.home?.location}
          onToggle={toggle}
        />
        <ToggleRow
          label="문의"
          path="home.contact"
          value={doc.home?.contact}
          onToggle={toggle}
        />
      </div>

      <div className="ht-sv-group">
        <div className="ht-sv-group-title">브랜드 페이지</div>
        <ToggleRow
          label="철학"
          path="brand.philosophy"
          value={doc.brand?.philosophy}
          onToggle={toggle}
        />
        <ToggleRow
          label="의료진"
          path="brand.doctors"
          value={doc.brand?.doctors}
          onToggle={toggle}
        />
        <ToggleRow
          label="시설"
          path="brand.facilities"
          value={doc.brand?.facilities}
          onToggle={toggle}
        />
        <ToggleRow
          label="장비"
          path="brand.equipment"
          value={doc.brand?.equipment}
          onToggle={toggle}
        />
        <ToggleRow
          label="위치"
          path="brand.location"
          value={doc.brand?.location}
          onToggle={toggle}
        />
      </div>

      <div className="ht-sv-group">
        <div className="ht-sv-group-title">미디어 탭</div>
        <ToggleRow
          label="보도자료"
          path="media.press"
          value={doc.media?.press}
          onToggle={toggle}
        />
        <ToggleRow
          label="영상"
          path="media.video"
          value={doc.media?.video}
          onToggle={toggle}
        />
        <ToggleRow
          label="블로그"
          path="media.blog"
          value={doc.media?.blog}
          onToggle={toggle}
        />
        <ToggleRow
          label="공지사항"
          path="media.notice"
          value={doc.media?.notice}
          onToggle={toggle}
        />
      </div>

      <div className="ht-sv-group">
        <div className="ht-sv-group-title">기타</div>
        <ToggleRow
          label="상담폼 (희망예약일시)"
          path="contact.showPreferredDatetime"
          value={doc.contact?.showPreferredDatetime}
          onToggle={toggle}
        />
        <ToggleRow
          label="시술 상세 페이지"
          path="treatments.detail"
          value={doc.treatments?.detail}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

export function HospitalTool() {
  const router = useRouter();
  const routerState = useRouterState() as {
    selectedId?: string;
    heroKey?: string;
    qcardId?: string;
  } | null;
  const selectedId = routerState?.selectedId;
  const heroKey = routerState?.heroKey;
  const qcardId = routerState?.qcardId;

  const [activeTab, setActiveTab] = useState<MainTab>('doctors');

  if (selectedId) {
    return <DoctorDetail id={selectedId} onBack={() => router.navigate({})} />;
  }

  if (heroKey) {
    return <HeroDetail heroKey={heroKey} onBack={() => router.navigate({})} />;
  }

  if (qcardId) {
    return <QuickCardDetail id={qcardId} onBack={() => router.navigate({})} />;
  }

  return (
    <div className="ht-container">
      <div className="ht-tabs">
        {MAIN_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`ht-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'doctors' && (
        <DoctorsPanel onEdit={(id) => router.navigate({ selectedId: id })} />
      )}
      {activeTab === 'clinicInfo' && <ClinicInfoPanel />}
      {activeTab === 'hero' && (
        <HeroBannerPanel onEdit={(key) => router.navigate({ heroKey: key })} />
      )}
      {activeTab === 'siteSettings' && (
        <SiteSettingsPanel
          onEditCard={(id) => router.navigate({ qcardId: id })}
        />
      )}
      {activeTab === 'sections' && <SectionsPanel />}
    </div>
  );
}
