import { useState, useEffect, useRef } from 'react';
import { useClient } from 'sanity';
import type { SanityClient } from 'sanity';
import { useRouter, useRouterState } from 'sanity/router';
import type { PortableTextBlock } from '@sanity/types';
import { DoctorDetail } from './DoctorDetail';
import { HeroDetail } from './HeroDetail';
import { QuickCardDetail } from './QuickCardDetail';
import { LegalEditor } from './LegalEditor';
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

interface BusinessHoursItem {
  _key: string;
  dayOfWeek?: string[];
  day?: { ko?: string; en?: string; zh?: string; ja?: string };
  open?: string;
  close?: string;
  note?: { ko?: string; en?: string; zh?: string; ja?: string };
}

interface SnsLinkItem {
  _key: string;
  platform?: string;
  url?: string;
  label?: string;
}

interface ClinicInfoDoc {
  address?: { ko?: string; en?: string; zh?: string; ja?: string };
  locationCoordinates?: {
    searchAddress?: string;
    latitude?: number;
    longitude?: number;
  };
  phone?: string;
  email?: string;
  businessHours?: BusinessHoursItem[];
  closedDayNotice?: { ko?: string; en?: string; zh?: string; ja?: string };
  walkingGuide?: { ko?: string; en?: string; zh?: string; ja?: string };
  snsLinks?: SnsLinkItem[];
  messengerLinks?: SnsLinkItem[];
}

interface BrandValue {
  _key: string;
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  description?: { ko?: string; en?: string; zh?: string; ja?: string };
  image?: { asset?: { _ref: string } };
}

interface BrandDoc {
  slogan?: { ko?: string; en?: string; zh?: string; ja?: string };
  subtitle?: { ko?: string; en?: string; zh?: string; ja?: string };
  values?: BrandValue[];
}

interface StatsItem {
  _key: string;
  label?: { ko?: string; en?: string; zh?: string; ja?: string };
  number?: number;
  unit?: string;
  description?: { ko?: string; en?: string; zh?: string; ja?: string };
}

interface StatsDoc {
  stats?: StatsItem[];
}

interface EventPopupDoc {
  _id: string;
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  image?: { asset?: { _ref: string } };
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
    catLiftingLaser?: boolean;
    catPetitLifting?: boolean;
    catSkincare?: boolean;
    catSkinBooster?: boolean;
    catHairRemoval?: boolean;
    catAnesthesia?: boolean;
  };
  home?: {
    hero?: boolean;
    quickEntry?: boolean;
    signature?: boolean;
    promo?: boolean;
    bnA?: boolean;
    stats?: boolean;
    brandPhilosophy?: boolean;
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
  treatments?: { detail?: boolean; showPrice?: boolean };
  contact?: { showPreferredDatetime?: boolean };
}

// ─── Queries ─────────────────────────────────────────────

const DOCTORS_QUERY = `*[_type == "doctor"] | order(sortOrder asc) {
  _id, "name": name.ko, "position": position.ko, isVisible, sortOrder
}`;

const HEROES_QUERY = `*[_type == "pageHero"] {
  _id, pageName, "titleKo": title.ko, "hasImage": defined(heroImage)
}`;

const CLINIC_INFO_QUERY = `*[_type == "clinicInfo" && _id == "forever-myeongdong-clinic-info"][0] {
  address, locationCoordinates, phone, email,
  businessHours[] { _key, dayOfWeek, day, open, close, note },
  closedDayNotice, walkingGuide,
  snsLinks[] { _key, platform, url, label },
  messengerLinks[] { _key, platform, url, label }
}`;

const BRAND_QUERY = `*[_type == "brandPhilosophy" && _id == "brand-philosophy"][0] {
  slogan, subtitle,
  values[] { _key, title, description, image { asset { _ref } } }
}`;

const STATS_QUERY = `*[_type == "statsStrip" && _id == "forever-myeongdong-stats"][0] {
  stats[] { _key, label, number, unit, description }
}`;

const POPUPS_QUERY = `*[_type == "eventPopup"] | order(_createdAt desc) {
  _id, title, image { asset { _ref } }, linkUrl, startDate, endDate, isVisible
}`;

const QTABS_QUERY = `*[_type == "quickEntryTab"] | order(sortOrder asc) {
  _id, key, label, isVisible
}`;

const QCARDS_QUERY = `*[_type == "quickEntryCard"] | order(sortOrder asc) {
  _id, title, slug, "tab": tab->{ label }, isVisible, sortOrder
}`;

const SV_QUERY = `*[_type == "sectionVisibility" && _id == "sectionVisibility"][0]`;

// ─── Helpers ──────────────────────────────────────────────

const CLINIC_LOCALES: { key: 'ko' | 'en' | 'zh' | 'ja'; label: string }[] = [
  { key: 'ko', label: '한국어' },
  { key: 'en', label: 'English' },
  { key: 'zh', label: '中文' },
  { key: 'ja', label: '日本語' },
];

const BRAND_LOCALE_LABELS: Record<string, string> = {
  ko: '한국어',
  en: 'English',
  zh: '中文',
  ja: '日本語',
};

const SNS_PLATFORMS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'blog', label: 'Blog' },
  { value: 'wechat', label: 'WeChat' },
  { value: 'weibo', label: 'Weibo' },
  { value: 'xiaohongshu', label: 'Xiaohongshu' },
  { value: 'line', label: 'LINE' },
  { value: 'kakao', label: 'KakaoTalk' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

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

async function uploadImageAsset(client: SanityClient, file: File) {
  const asset = await client.assets.upload('image', file, {
    filename: file.name,
  });
  return {
    _type: 'image' as const,
    asset: { _type: 'reference' as const, _ref: asset._id },
  };
}

// ─── Main Tabs ────────────────────────────────────────────

type MainTab =
  | 'doctors'
  | 'clinicInfo'
  | 'hero'
  | 'brand'
  | 'stats'
  | 'popups'
  | 'quickNav'
  | 'sections'
  | 'legal';

const MAIN_TABS: { key: MainTab; label: string }[] = [
  { key: 'doctors', label: '의료진' },
  { key: 'clinicInfo', label: '병원 정보' },
  { key: 'hero', label: '히어로 배너' },
  { key: 'brand', label: '브랜드 철학' },
  { key: 'stats', label: '통계 수치' },
  { key: 'popups', label: '이벤트 팝업' },
  { key: 'quickNav', label: '빠른 탐색' },
  { key: 'sections', label: '섹션 노출' },
  { key: 'legal', label: '약관 관리' },
];

// ─── 의료진 패널 (드래그 정렬) ────────────────────────────

function DoctorsPanel({ onEdit }: { onEdit: (id: string) => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

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

  const handleDragStart = (i: number) => {
    dragIndexRef.current = i;
  };
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOver(i);
  };
  const handleDragEnd = () => {
    setDragOver(null);
  };

  const handleDrop = async (toIndex: number) => {
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === toIndex) {
      dragIndexRef.current = null;
      setDragOver(null);
      return;
    }
    dragIndexRef.current = null;
    setDragOver(null);

    const newDocs = [...docs];
    const [moved] = newDocs.splice(fromIndex, 1);
    newDocs.splice(toIndex, 0, moved);
    setDocs(newDocs);

    setSaving(true);
    const tx = client.transaction();
    newDocs.forEach((doc, idx) => {
      tx.patch(doc._id, { set: { sortOrder: idx } });
    });
    await tx.commit();
    setSaving(false);
  };

  if (loading) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div>
      <div className="ht-toolbar">
        <button className="ht-add-btn" onClick={handleAdd}>
          + 의사 추가
        </button>
        {saving && <span className="ht-saving-indicator">저장 중…</span>}
      </div>
      <div className="ht-table-wrap">
        <table className="ht-table">
          <colgroup>
            <col style={{ width: '32px' }} />
            <col style={{ width: '44px' }} />
            <col />
            <col style={{ width: '140px' }} />
            <col style={{ width: '70px' }} />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>No.</th>
              <th>이름 (ko)</th>
              <th>직위 (ko)</th>
              <th style={{ textAlign: 'center' }}>노출</th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td colSpan={5} className="ht-empty">
                  의료진이 없습니다
                </td>
              </tr>
            ) : (
              docs.map((doc, idx) => (
                <tr
                  key={doc._id}
                  className={`ht-row-clickable${dragOver === idx ? 'ht-drag-over' : ''}`}
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onDrop={() => handleDrop(idx)}
                  onClick={() => onEdit(doc._id)}
                >
                  <td
                    className="ht-drag-handle"
                    onClick={(e) => e.stopPropagation()}
                  >
                    ⋮⋮
                  </td>
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

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: {
          roadAddress: string;
          jibunAddress: string;
        }) => void;
      }) => { open: () => void };
    };
  }
}

function ClinicInfoPanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<ClinicInfoDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [hours, setHours] = useState<BusinessHoursItem[]>([]);
  const [sns, setSns] = useState<SnsLinkItem[]>([]);
  const [messenger, setMessenger] = useState<SnsLinkItem[]>([]);
  const initialized = useRef(false);

  useEffect(() => {
    client.fetch<ClinicInfoDoc>(CLINIC_INFO_QUERY).then((data) => {
      setDoc(data ?? {});
      if (!initialized.current) {
        setHours(data?.businessHours ?? []);
        setSns(data?.snsLinks ?? []);
        setMessenger(data?.messengerLinks ?? []);
        initialized.current = true;
      }
    });
  }, [client]);

  const patch = async (fields: Record<string, unknown>) => {
    setSaving(true);
    await client.patch('forever-myeongdong-clinic-info').set(fields).commit();
    setSaving(false);
  };

  const handleAddressSearch = async () => {
    await new Promise<void>((resolve) => {
      if (window.daum?.Postcode) {
        resolve();
        return;
      }
      const s = document.createElement('script');
      s.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      s.onload = () => resolve();
      document.head.appendChild(s);
    });
    new window.daum!.Postcode({
      oncomplete: async (data) => {
        const address = data.roadAddress || data.jibunAddress;
        setGeocoding(true);
        try {
          const res = await fetch(
            `/api/admin/geocode?address=${encodeURIComponent(address)}`,
          );
          if (!res.ok) throw new Error();
          const { lat, lng } = (await res.json()) as {
            lat: number;
            lng: number;
          };
          await patch({
            'locationCoordinates.searchAddress': address,
            'locationCoordinates.latitude': lat,
            'locationCoordinates.longitude': lng,
          });
          setDoc((prev) =>
            prev
              ? {
                  ...prev,
                  locationCoordinates: {
                    searchAddress: address,
                    latitude: lat,
                    longitude: lng,
                  },
                }
              : prev,
          );
        } catch {
          alert('좌표 변환 실패 — 수동 입력해주세요');
        } finally {
          setGeocoding(false);
        }
      },
    }).open();
  };

  const saveHours = async (newHours: BusinessHoursItem[]) => {
    setSaving(true);
    await client
      .patch('forever-myeongdong-clinic-info')
      .set({ businessHours: newHours })
      .commit();
    setSaving(false);
  };

  const saveSns = async (newSns: SnsLinkItem[]) => {
    setSaving(true);
    await client
      .patch('forever-myeongdong-clinic-info')
      .set({ snsLinks: newSns })
      .commit();
    setSaving(false);
  };

  const saveMessenger = async (newMsg: SnsLinkItem[]) => {
    setSaving(true);
    await client
      .patch('forever-myeongdong-clinic-info')
      .set({ messengerLinks: newMsg })
      .commit();
    setSaving(false);
  };

  const updateHour = (
    i: number,
    field: keyof BusinessHoursItem,
    val: unknown,
  ) => {
    setHours((prev) =>
      prev.map((h, idx) => (idx === i ? { ...h, [field]: val } : h)),
    );
  };

  const saveHourBlur = (
    i: number,
    field: keyof BusinessHoursItem,
    val: unknown,
  ) => {
    setHours((prev) => {
      const updated = prev.map((h, idx) =>
        idx === i ? { ...h, [field]: val } : h,
      );
      saveHours(updated);
      return updated;
    });
  };

  const saveHourLocaleBlur = (
    i: number,
    field: 'day' | 'note',
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setHours((prev) => {
      const updated = prev.map((h, idx) =>
        idx === i ? { ...h, [field]: { ...h[field], [locale]: val } } : h,
      );
      saveHours(updated);
      return updated;
    });
  };

  const updateSns = (
    list: SnsLinkItem[],
    setList: typeof setSns,
    i: number,
    field: keyof SnsLinkItem,
    val: string,
  ) => {
    setList(list.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  const saveSnsBlur = (
    list: SnsLinkItem[],
    saveList: (l: SnsLinkItem[]) => Promise<void>,
    setList: typeof setSns,
    i: number,
    field: keyof SnsLinkItem,
    val: string,
  ) => {
    const updated = list.map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s,
    );
    setList(updated);
    saveList(updated);
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  const coords = doc.locationCoordinates;
  const hasCoords = coords?.latitude != null && coords?.longitude != null;

  return (
    <div className="ht-panel-section">
      {saving && <span className="ht-saving-indicator">저장 중…</span>}

      {/* ── 주소 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">주소</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {CLINIC_LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
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

      {/* ── 위치 좌표 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">위치 좌표</div>
        <div className="ht-detail-body">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 10,
              flexWrap: 'wrap',
            }}
          >
            <button
              className="ht-add-btn"
              onClick={handleAddressSearch}
              disabled={geocoding}
            >
              {geocoding ? '좌표 변환 중…' : '🔍 주소 검색'}
            </button>
            {coords?.searchAddress && (
              <span className="ht-row-meta">📍 {coords.searchAddress}</span>
            )}
          </div>
          <details style={{ marginBottom: 10 }}>
            <summary
              style={{
                fontSize: 12,
                color: 'var(--card-muted-fg-color)',
                cursor: 'pointer',
              }}
            >
              수동 입력
            </summary>
            <div
              className="ht-detail-row"
              style={{ marginTop: 8, maxWidth: 360 }}
            >
              <div className="ht-detail-field">
                <label className="ht-detail-label">위도</label>
                <input
                  type="number"
                  className="ht-text-input"
                  step="0.000001"
                  defaultValue={coords?.latitude ?? ''}
                  onBlur={(e) =>
                    patch({
                      'locationCoordinates.latitude': parseFloat(
                        e.target.value,
                      ),
                    })
                  }
                />
              </div>
              <div className="ht-detail-field">
                <label className="ht-detail-label">경도</label>
                <input
                  type="number"
                  className="ht-text-input"
                  step="0.000001"
                  defaultValue={coords?.longitude ?? ''}
                  onBlur={(e) =>
                    patch({
                      'locationCoordinates.longitude': parseFloat(
                        e.target.value,
                      ),
                    })
                  }
                />
              </div>
            </div>
          </details>
          {hasCoords && (
            <iframe
              src={`https://maps.google.com/maps?q=${coords!.latitude},${coords!.longitude}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
              width="100%"
              height="260"
              style={{ border: 0, borderRadius: 6, maxWidth: 600 }}
              loading="lazy"
            />
          )}
        </div>
      </div>

      {/* ── 길안내 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">길안내</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {CLINIC_LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <textarea
                  className="ht-text-input ht-textarea"
                  defaultValue={doc.walkingGuide?.[key] ?? ''}
                  rows={4}
                  onBlur={(e) =>
                    patch({ [`walkingGuide.${key}`]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 진료시간 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">진료시간</div>
        <div className="ht-detail-body">
          <div className="ht-array-editor">
            {hours.map((h, i) => (
              <div key={h._key} className="ht-array-item">
                <div className="ht-array-item-header">
                  <span className="ht-array-num">{i + 1}</span>
                  <button
                    className="ht-remove-btn"
                    onClick={() => {
                      const updated = hours.filter((_, idx) => idx !== i);
                      setHours(updated);
                      saveHours(updated);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="ht-detail-grid4" style={{ marginBottom: 8 }}>
                  {CLINIC_LOCALES.map(({ key, label }) => (
                    <div key={key} className="ht-detail-field">
                      <label className="ht-detail-label">
                        요일명 ({label})
                      </label>
                      <input
                        type="text"
                        className="ht-text-input"
                        value={h.day?.[key] ?? ''}
                        onChange={(e) =>
                          updateHour(i, 'day', {
                            ...h.day,
                            [key]: e.target.value,
                          })
                        }
                        onBlur={(e) =>
                          saveHourLocaleBlur(i, 'day', key, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
                <div className="ht-detail-row" style={{ marginBottom: 8 }}>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">오픈</label>
                    <input
                      type="text"
                      className="ht-text-input"
                      style={{ width: 100 }}
                      placeholder="10:00"
                      value={h.open ?? ''}
                      onChange={(e) => updateHour(i, 'open', e.target.value)}
                      onBlur={(e) => saveHourBlur(i, 'open', e.target.value)}
                    />
                  </div>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">마감</label>
                    <input
                      type="text"
                      className="ht-text-input"
                      style={{ width: 100 }}
                      placeholder="19:30"
                      value={h.close ?? ''}
                      onChange={(e) => updateHour(i, 'close', e.target.value)}
                      onBlur={(e) => saveHourBlur(i, 'close', e.target.value)}
                    />
                  </div>
                </div>
                <div className="ht-detail-grid4">
                  {CLINIC_LOCALES.map(({ key, label }) => (
                    <div key={key} className="ht-detail-field">
                      <label className="ht-detail-label">비고 ({label})</label>
                      <input
                        type="text"
                        className="ht-text-input"
                        value={h.note?.[key] ?? ''}
                        onChange={(e) =>
                          updateHour(i, 'note', {
                            ...h.note,
                            [key]: e.target.value,
                          })
                        }
                        onBlur={(e) =>
                          saveHourLocaleBlur(i, 'note', key, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              className="ht-add-btn"
              onClick={() => {
                const updated = [
                  ...hours,
                  { _key: newKey(), day: {}, open: '', close: '', note: {} },
                ];
                setHours(updated);
                saveHours(updated);
              }}
            >
              + 진료시간 추가
            </button>
          </div>
        </div>
      </div>

      {/* ── 휴진일 안내 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">휴진일 안내</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {CLINIC_LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
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

      {/* ── SNS 링크 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">SNS 링크</div>
        <div className="ht-detail-body">
          <div className="ht-array-editor">
            {sns.map((s, i) => (
              <div key={s._key} className="ht-array-item">
                <div className="ht-array-item-header">
                  <span className="ht-array-num">{i + 1}</span>
                  <button
                    className="ht-remove-btn"
                    onClick={() => {
                      const updated = sns.filter((_, idx) => idx !== i);
                      setSns(updated);
                      saveSns(updated);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="ht-detail-row">
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">플랫폼</label>
                    <select
                      className="ht-text-input"
                      value={s.platform ?? ''}
                      onChange={(e) => {
                        const updated = sns.map((x, idx) =>
                          idx === i ? { ...x, platform: e.target.value } : x,
                        );
                        setSns(updated);
                        saveSns(updated);
                      }}
                    >
                      <option value="">— 선택 —</option>
                      {SNS_PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="ht-detail-field" style={{ flex: 2 }}>
                    <label className="ht-detail-label">URL</label>
                    <input
                      type="text"
                      className="ht-text-input"
                      value={s.url ?? ''}
                      onChange={(e) =>
                        updateSns(sns, setSns, i, 'url', e.target.value)
                      }
                      onBlur={(e) =>
                        saveSnsBlur(
                          sns,
                          saveSns,
                          setSns,
                          i,
                          'url',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">표시명</label>
                    <input
                      type="text"
                      className="ht-text-input"
                      value={s.label ?? ''}
                      onChange={(e) =>
                        updateSns(sns, setSns, i, 'label', e.target.value)
                      }
                      onBlur={(e) =>
                        saveSnsBlur(
                          sns,
                          saveSns,
                          setSns,
                          i,
                          'label',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              className="ht-add-btn"
              onClick={() => {
                const updated = [
                  ...sns,
                  { _key: newKey(), platform: '', url: '', label: '' },
                ];
                setSns(updated);
                saveSns(updated);
              }}
            >
              + SNS 추가
            </button>
          </div>
        </div>
      </div>

      {/* ── 메신저 링크 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">메신저 링크</div>
        <div className="ht-detail-body">
          <div className="ht-array-editor">
            {messenger.map((s, i) => (
              <div key={s._key} className="ht-array-item">
                <div className="ht-array-item-header">
                  <span className="ht-array-num">{i + 1}</span>
                  <button
                    className="ht-remove-btn"
                    onClick={() => {
                      const updated = messenger.filter((_, idx) => idx !== i);
                      setMessenger(updated);
                      saveMessenger(updated);
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div className="ht-detail-row">
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">플랫폼</label>
                    <select
                      className="ht-text-input"
                      value={s.platform ?? ''}
                      onChange={(e) => {
                        const updated = messenger.map((x, idx) =>
                          idx === i ? { ...x, platform: e.target.value } : x,
                        );
                        setMessenger(updated);
                        saveMessenger(updated);
                      }}
                    >
                      <option value="">— 선택 —</option>
                      {SNS_PLATFORMS.map((p) => (
                        <option key={p.value} value={p.value}>
                          {p.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="ht-detail-field" style={{ flex: 2 }}>
                    <label className="ht-detail-label">URL / ID</label>
                    <input
                      type="text"
                      className="ht-text-input"
                      value={s.url ?? ''}
                      onChange={(e) =>
                        updateSns(
                          messenger,
                          setMessenger,
                          i,
                          'url',
                          e.target.value,
                        )
                      }
                      onBlur={(e) =>
                        saveSnsBlur(
                          messenger,
                          saveMessenger,
                          setMessenger,
                          i,
                          'url',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">표시명</label>
                    <input
                      type="text"
                      className="ht-text-input"
                      value={s.label ?? ''}
                      onChange={(e) =>
                        updateSns(
                          messenger,
                          setMessenger,
                          i,
                          'label',
                          e.target.value,
                        )
                      }
                      onBlur={(e) =>
                        saveSnsBlur(
                          messenger,
                          saveMessenger,
                          setMessenger,
                          i,
                          'label',
                          e.target.value,
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              className="ht-add-btn"
              onClick={() => {
                const updated = [
                  ...messenger,
                  { _key: newKey(), platform: '', url: '', label: '' },
                ];
                setMessenger(updated);
                saveMessenger(updated);
              }}
            >
              + 메신저 추가
            </button>
          </div>
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
            const heroDoc = heroMap.get(page.title) ?? heroMap.get(page.key);
            return (
              <tr
                key={page.key}
                className="ht-row-clickable"
                onClick={() => onEdit(page.key)}
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

// ─── 브랜드 철학 패널 ─────────────────────────────────────

function BrandSection() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<BrandDoc | null>(null);
  const [saving, setSaving] = useState(false);
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
    await client.patch('brand-philosophy').set(fields).commit();
    setSaving(false);
  };

  const saveValues = async (newValues: BrandValue[]) => {
    setSaving(true);
    await client.patch('brand-philosophy').set({ values: newValues }).commit();
    setSaving(false);
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

  return (
    <div className="ht-panel-section">
      {saving && <span className="ht-saving-indicator">저장 중…</span>}

      {/* ── 메인 슬로건 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">메인 슬로건 (h2)</div>
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

      {/* ── 서브 슬로건 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">서브 슬로건</div>
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

      {/* ── 브랜드 가치 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">브랜드 가치</div>
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
                    <div className="ht-detail-section-title">가치명</div>
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
                        src={sanityImageUrl(
                          'ecoamz42',
                          'production',
                          valImageRef,
                        )}
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

// ─── 통계 수치 패널 ───────────────────────────────────────

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

  const updateLabel = (
    i: number,
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === i ? { ...it, label: { ...it.label, [locale]: val } } : it,
      ),
    );
  };

  const saveLabelBlur = (
    i: number,
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setItems((prev) => {
      const updated = prev.map((it, idx) =>
        idx === i ? { ...it, label: { ...it.label, [locale]: val } } : it,
      );
      save(updated);
      return updated;
    });
  };

  const updateDescription = (
    i: number,
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setItems((prev) =>
      prev.map((it, idx) =>
        idx === i
          ? { ...it, description: { ...it.description, [locale]: val } }
          : it,
      ),
    );
  };

  const saveDescriptionBlur = (
    i: number,
    locale: 'ko' | 'en' | 'zh' | 'ja',
    val: string,
  ) => {
    setItems((prev) => {
      const updated = prev.map((it, idx) =>
        idx === i
          ? { ...it, description: { ...it.description, [locale]: val } }
          : it,
      );
      save(updated);
      return updated;
    });
  };

  const update = (
    i: number,
    field: 'number' | 'unit',
    val: string | number,
  ) => {
    setItems((prev) =>
      prev.map((it, idx) => (idx === i ? { ...it, [field]: val } : it)),
    );
  };

  const saveBlur = (
    i: number,
    field: 'number' | 'unit',
    val: string | number,
  ) => {
    setItems((prev) => {
      const updated = prev.map((it, idx) =>
        idx === i ? { ...it, [field]: val } : it,
      );
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
    <div className="ht-panel-section">
      {saving && <span className="ht-saving-indicator">저장 중…</span>}
      <div className="ht-array-editor" style={{ marginTop: 12 }}>
        {items.map((item, i) => (
          <div key={item._key} className="ht-array-item">
            <div className="ht-array-item-header">
              <span className="ht-array-num">{i + 1}</span>
              <button className="ht-remove-btn" onClick={() => removeItem(i)}>
                ✕
              </button>
            </div>
            <div className="ht-detail-grid4" style={{ marginBottom: 8 }}>
              {CLINIC_LOCALES.map(({ key, label }) => (
                <div key={key} className="ht-detail-field">
                  <label className="ht-detail-label">항목명 ({label})</label>
                  <input
                    type="text"
                    className="ht-text-input"
                    value={item.label?.[key] ?? ''}
                    onChange={(e) => updateLabel(i, key, e.target.value)}
                    onBlur={(e) => saveLabelBlur(i, key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <div className="ht-detail-row">
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
            <div className="ht-detail-grid4" style={{ marginTop: 8 }}>
              {CLINIC_LOCALES.map(({ key, label }) => (
                <div key={key} className="ht-detail-field">
                  <label className="ht-detail-label">설명 ({label})</label>
                  <input
                    type="text"
                    className="ht-text-input"
                    value={item.description?.[key] ?? ''}
                    onChange={(e) => updateDescription(i, key, e.target.value)}
                    onBlur={(e) => saveDescriptionBlur(i, key, e.target.value)}
                  />
                </div>
              ))}
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

// ─── 이벤트 팝업 패널 ─────────────────────────────────────

function PopupsSection() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<EventPopupDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

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

  const handleImageUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingId(id);
    try {
      const imageRef = await uploadImageAsset(client, file);
      await client.patch(id).set({ image: imageRef }).commit();
      setDocs((prev) =>
        prev.map((d) =>
          d._id === id
            ? { ...d, image: { asset: { _ref: imageRef.asset._ref } } }
            : d,
        ),
      );
    } finally {
      setUploadingId(null);
    }
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
    <div className="ht-panel-section">
      <div className="ht-toolbar" style={{ marginBottom: 12 }}>
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
                {/* ─── 팝업 이미지 ─── */}
                <div className="ht-detail-section" style={{ marginBottom: 12 }}>
                  <div className="ht-detail-section-title">팝업 이미지</div>
                  <div
                    className="ht-detail-body"
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    {doc.image?.asset?._ref ? (
                      <img
                        src={sanityImageUrl(
                          'ecoamz42',
                          'production',
                          doc.image.asset._ref,
                        )}
                        alt="팝업 미리보기"
                        style={{
                          width: 100,
                          height: 133,
                          objectFit: 'cover',
                          borderRadius: 4,
                          border: '1px solid #e5e7eb',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 100,
                          height: 133,
                          borderRadius: 4,
                          border: '1px dashed #d1d5db',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 12,
                          color: '#9ca3af',
                          flexShrink: 0,
                        }}
                      >
                        이미지 없음
                      </div>
                    )}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                      }}
                    >
                      <label
                        className="ht-add-btn"
                        style={{ cursor: 'pointer', display: 'inline-block' }}
                      >
                        {uploadingId === doc._id
                          ? '업로드 중…'
                          : '이미지 업로드'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          disabled={uploadingId === doc._id}
                          onChange={(e) => handleImageUpload(doc._id, e)}
                        />
                      </label>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        권장 비율: 3:4 (세로형)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ht-detail-grid4" style={{ marginBottom: 10 }}>
                  {CLINIC_LOCALES.map(({ key, label }) => (
                    <div key={key} className="ht-detail-field">
                      <label className="ht-detail-label">제목 ({label})</label>
                      <input
                        type="text"
                        className="ht-text-input"
                        defaultValue={doc.title?.[key] ?? ''}
                        onBlur={(e) =>
                          patch(doc._id, { [`title.${key}`]: e.target.value })
                        }
                      />
                    </div>
                  ))}
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

// ─── 빠른 탐색 패널 (드래그 정렬) ────────────────────────

function QuickNavSection({ onEditCard }: { onEditCard: (id: string) => void }) {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [tabs, setTabs] = useState<QuickTabDoc[]>([]);
  const [cards, setCards] = useState<QuickCardDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

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

  const handleDragStart = (i: number) => {
    dragIndexRef.current = i;
  };
  const handleDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOver(i);
  };
  const handleDragEnd = () => {
    setDragOver(null);
  };

  const handleDrop = async (toIndex: number) => {
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === toIndex) {
      dragIndexRef.current = null;
      setDragOver(null);
      return;
    }
    dragIndexRef.current = null;
    setDragOver(null);

    const newCards = [...cards];
    const [moved] = newCards.splice(fromIndex, 1);
    newCards.splice(toIndex, 0, moved);
    setCards(newCards);

    setSaving(true);
    const tx = client.transaction();
    newCards.forEach((card, idx) => {
      tx.patch(card._id, { set: { sortOrder: idx } });
    });
    await tx.commit();
    setSaving(false);
  };

  if (loading) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-panel-section">
      {saving && <span className="ht-saving-indicator">저장 중…</span>}

      <div className="ht-detail-section">
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
          <div className="ht-table-wrap">
            <table className="ht-table">
              <colgroup>
                <col style={{ width: '32px' }} />
                <col style={{ width: '44px' }} />
                <col />
                <col style={{ width: '120px' }} />
                <col style={{ width: '120px' }} />
                <col style={{ width: '70px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th></th>
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
                    className={`ht-row-clickable${dragOver === idx ? 'ht-drag-over' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    onDrop={() => handleDrop(idx)}
                    onClick={() => onEditCard(card._id)}
                  >
                    <td
                      className="ht-drag-handle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ⋮⋮
                    </td>
                    <td className="ht-row-num">{idx + 1}</td>
                    <td>
                      <span className="ht-row-name">
                        {card.title?.ko || '—'}
                      </span>
                    </td>
                    <td className="ht-row-meta">{card.slug?.current || '—'}</td>
                    <td className="ht-row-meta">
                      {card.tab?.label?.ko || '—'}
                    </td>
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
                    <td colSpan={6} className="ht-empty">
                      카드가 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ToggleRow ────────────────────────────────────────────

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
    setDoc((prev) => {
      if (!prev) return prev;
      const parts = path.split('.');
      if (parts.length === 2) {
        const [group, field] = parts;
        const g = group as keyof SectionVisibilityDoc;
        return {
          ...prev,
          [g]: { ...(prev[g] as Record<string, unknown>), [field]: value },
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
        <div className="ht-sv-group-title">메가메뉴 시술 카테고리</div>
        <ToggleRow
          label="리프팅·레이저"
          path="nav.catLiftingLaser"
          value={doc.nav?.catLiftingLaser}
          onToggle={toggle}
        />
        <ToggleRow
          label="쁘띠 & 실리프팅"
          path="nav.catPetitLifting"
          value={doc.nav?.catPetitLifting}
          onToggle={toggle}
        />
        <ToggleRow
          label="스킨케어"
          path="nav.catSkincare"
          value={doc.nav?.catSkincare}
          onToggle={toggle}
        />
        <ToggleRow
          label="스킨부스터"
          path="nav.catSkinBooster"
          value={doc.nav?.catSkinBooster}
          onToggle={toggle}
        />
        <ToggleRow
          label="제모클리닉"
          path="nav.catHairRemoval"
          value={doc.nav?.catHairRemoval}
          onToggle={toggle}
        />
        <ToggleRow
          label="마취클리닉"
          path="nav.catAnesthesia"
          value={doc.nav?.catAnesthesia}
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
          label="브랜드 철학"
          path="home.brandPhilosophy"
          value={doc.home?.brandPhilosophy}
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
        <ToggleRow
          label="가격 표시"
          path="treatments.showPrice"
          value={doc.treatments?.showPrice}
          onToggle={toggle}
        />
      </div>
    </div>
  );
}

// ─── 약관 관리 패널 ───────────────────────────────────────

type LegalDocType = 'privacy-policy' | 'terms-of-service';

interface LegalDocRow {
  _id: string;
  title?: { ko?: string; en?: string; zh?: string; ja?: string };
  effectiveDate?: string;
  publicationDate?: string;
  contentKo?: PortableTextBlock[];
  contentEn?: PortableTextBlock[];
  contentZh?: PortableTextBlock[];
  contentJa?: PortableTextBlock[];
}

const LEGAL_DOC_ID: Record<LegalDocType, string> = {
  'privacy-policy': 'legal-privacy-policy',
  'terms-of-service': 'legal-terms-of-service',
};

const LEGAL_LABELS: Record<LegalDocType, string> = {
  'privacy-policy': '개인정보 처리방침',
  'terms-of-service': '이용약관',
};

function LegalDocPanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [activeDoc, setActiveDoc] = useState<LegalDocType>('privacy-policy');
  const [activeLang, setActiveLang] = useState<'ko' | 'en' | 'zh' | 'ja'>('ko');
  const [docs, setDocs] = useState<Record<LegalDocType, LegalDocRow | null>>({
    'privacy-policy': null,
    'terms-of-service': null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const query = `{
      "privacy": *[_type == "legalDocument" && documentType == "privacy-policy"][0]{ _id, title, effectiveDate, publicationDate, contentKo, contentEn, contentZh, contentJa },
      "terms": *[_type == "legalDocument" && documentType == "terms-of-service"][0]{ _id, title, effectiveDate, publicationDate, contentKo, contentEn, contentZh, contentJa }
    }`;
    client
      .fetch<{ privacy: LegalDocRow | null; terms: LegalDocRow | null }>(query)
      .then(({ privacy, terms }) => {
        setDocs({
          'privacy-policy': privacy ?? null,
          'terms-of-service': terms ?? null,
        });
        setLoading(false);
      });
  }, [client]);

  const getOrCreate = async (type: LegalDocType): Promise<LegalDocRow> => {
    const existing = docs[type];
    if (existing) return existing;
    const id = LEGAL_DOC_ID[type];
    const created = await client.createIfNotExists({
      _id: id,
      _type: 'legalDocument',
      documentType: type,
    });
    const newDoc: LegalDocRow = { _id: created._id };
    setDocs((prev) => ({ ...prev, [type]: newDoc }));
    return newDoc;
  };

  const patchDoc = async (
    type: LegalDocType,
    fields: Record<string, unknown>,
  ) => {
    setSaving(true);
    const d = await getOrCreate(type);
    await client.patch(d._id).set(fields).commit();
    setDocs((prev) => ({
      ...prev,
      [type]: prev[type] ? { ...prev[type]!, ...fields } : prev[type],
    }));
    setSaving(false);
  };

  const LANG_FIELD: Record<'ko' | 'en' | 'zh' | 'ja', string> = {
    ko: 'contentKo',
    en: 'contentEn',
    zh: 'contentZh',
    ja: 'contentJa',
  };

  const handleContentChange = (
    type: LegalDocType,
    lang: 'ko' | 'en' | 'zh' | 'ja',
    blocks: PortableTextBlock[],
  ) => {
    patchDoc(type, { [LANG_FIELD[lang]]: blocks });
  };

  const doc = docs[activeDoc];

  if (loading) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-panel-section">
      {saving && <span className="ht-saving-indicator">저장 중…</span>}

      {/* 문서 선택 서브탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['privacy-policy', 'terms-of-service'] as LegalDocType[]).map(
          (type) => (
            <button
              key={type}
              className={`ht-tab${activeDoc === type ? 'active' : ''}`}
              style={{ fontSize: 13 }}
              onClick={() => setActiveDoc(type)}
            >
              {LEGAL_LABELS[type]}
            </button>
          ),
        )}
      </div>

      {/* 날짜 */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">시행일 / 공고일</div>
        <div className="ht-detail-body">
          <div className="ht-detail-row">
            <div className="ht-detail-field">
              <label className="ht-detail-label">시행일</label>
              <input
                key={`${activeDoc}-eff`}
                type="date"
                className="ht-text-input"
                style={{ width: 160 }}
                defaultValue={doc?.effectiveDate ?? ''}
                onBlur={(e) =>
                  patchDoc(activeDoc, { effectiveDate: e.target.value || null })
                }
              />
            </div>
            <div className="ht-detail-field">
              <label className="ht-detail-label">공고일</label>
              <input
                key={`${activeDoc}-pub`}
                type="date"
                className="ht-text-input"
                style={{ width: 160 }}
                defaultValue={doc?.publicationDate ?? ''}
                onBlur={(e) =>
                  patchDoc(activeDoc, {
                    publicationDate: e.target.value || null,
                  })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* 제목 */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">제목 (언어별)</div>
        <div className="ht-detail-body">
          {(
            [
              { key: 'ko', label: '한국어' },
              { key: 'en', label: 'English' },
              { key: 'zh', label: '中文' },
              { key: 'ja', label: '日本語' },
            ] as { key: 'ko' | 'en' | 'zh' | 'ja'; label: string }[]
          ).map(({ key, label }) => (
            <div
              key={key}
              className="ht-detail-row"
              style={{ marginBottom: 8 }}
            >
              <div className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <input
                  key={`${activeDoc}-title-${key}`}
                  type="text"
                  className="ht-text-input"
                  style={{ width: 320 }}
                  defaultValue={doc?.title?.[key] ?? ''}
                  onBlur={(e) =>
                    patchDoc(activeDoc, {
                      title: { ...doc?.title, [key]: e.target.value || null },
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 언어 선택 */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        {(
          [
            { key: 'ko', label: '한국어' },
            { key: 'en', label: 'English' },
            { key: 'zh', label: '中文' },
            { key: 'ja', label: '日本語' },
          ] as { key: 'ko' | 'en' | 'zh' | 'ja'; label: string }[]
        ).map(({ key, label }) => (
          <button
            key={key}
            className={`ht-tab${activeLang === key ? 'active' : ''}`}
            style={{ fontSize: 12 }}
            onClick={() => setActiveLang(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 본문 에디터 */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">
          본문 (
          {
            { ko: '한국어', en: 'English', zh: '中文', ja: '日本語' }[
              activeLang
            ]
          }
          )
        </div>
        <div className="ht-detail-body" style={{ padding: 0 }}>
          <LegalEditor
            key={`${activeDoc}-${activeLang}`}
            value={
              activeLang === 'ko'
                ? (doc?.contentKo ?? [])
                : activeLang === 'en'
                  ? (doc?.contentEn ?? [])
                  : activeLang === 'zh'
                    ? (doc?.contentZh ?? [])
                    : (doc?.contentJa ?? [])
            }
            onChange={(blocks) =>
              handleContentChange(activeDoc, activeLang, blocks)
            }
            placeholder={
              activeLang === 'ko'
                ? '한국어 내용을 입력하세요…'
                : activeLang === 'en'
                  ? 'Enter English content…'
                  : activeLang === 'zh'
                    ? '请输入中文内容…'
                    : '日本語のコンテンツを入力してください…'
            }
          />
        </div>
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
    tab?: MainTab;
  } | null;
  const selectedId = routerState?.selectedId;
  const heroKey = routerState?.heroKey;
  const qcardId = routerState?.qcardId;
  const activeTab: MainTab = routerState?.tab ?? 'doctors';

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
            onClick={() => router.navigate({ tab: tab.key })}
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
      {activeTab === 'brand' && <BrandSection />}
      {activeTab === 'stats' && <StatsSection />}
      {activeTab === 'popups' && <PopupsSection />}
      {activeTab === 'quickNav' && (
        <QuickNavSection
          onEditCard={(id) => router.navigate({ qcardId: id })}
        />
      )}
      {activeTab === 'sections' && <SectionsPanel />}
      {activeTab === 'legal' && <LegalDocPanel />}
    </div>
  );
}
