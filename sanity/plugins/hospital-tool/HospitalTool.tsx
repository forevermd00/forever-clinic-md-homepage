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
  logoRef?: string;
  qrRef?: string;
  isVisible?: boolean;
  sortKo?: number;
  sortEn?: number;
  sortZh?: number;
  sortJa?: number;
}

interface ClinicInfoDoc {
  clinicName?: { ko?: string; en?: string; zh?: string; ja?: string };
  logoRef?: string;
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
  badge?: string;
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
  tab?: { _id?: string; label?: { ko?: string } };
  isVisible?: boolean;
  sortOrder?: number;
}

interface EquipmentRow {
  _id: string;
  name?: { ko?: string; en?: string; zh?: string; ja?: string };
  description?: { ko?: string; en?: string; zh?: string; ja?: string };
  image?: { asset?: { _ref?: string } };
  sortOrder?: number;
}

interface FacilityRow {
  _id: string;
  name?: { ko?: string; en?: string; zh?: string; ja?: string };
  description?: { ko?: string; en?: string; zh?: string; ja?: string };
  image?: { asset?: { _ref?: string } };
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
    press?: boolean;
    location?: boolean;
    contact?: boolean;
  };
  brand?: {
    philosophy?: boolean;
    doctors?: boolean;
    facilities?: boolean;
    equipment?: boolean;
    location?: boolean;
    stats?: boolean;
  };
  media?: {
    press?: boolean;
    video?: boolean;
    blog?: boolean;
    notice?: boolean;
  };
  treatments?: { detail?: boolean; showPrice?: boolean };
}

// ─── Queries ─────────────────────────────────────────────

const DOCTORS_QUERY = `*[_type == "doctor"] | order(sortOrder asc) {
  _id, "name": name.ko, "position": position.ko, isVisible, sortOrder
}`;

const CLINIC_INFO_QUERY = `*[_type == "clinicInfo" && _id == "forever-myeongdong-clinic-info"][0] {
  clinicName, "logoRef": logo.asset._ref,
  address, locationCoordinates, phone, email,
  businessHours[] { _key, dayOfWeek, day, open, close, note },
  closedDayNotice, walkingGuide,
  snsLinks[] { _key, platform, url, label },
  messengerLinks[] { _key, platform, url, label, "logoRef": logo.asset._ref, "qrRef": qrCode.asset._ref, isVisible, sortKo, sortEn, sortZh, sortJa }
}`;

const BRAND_QUERY = `*[_type == "brandPhilosophy" && _id == "brand-philosophy"][0] {
  slogan, subtitle, badge,
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
  _id, title, slug, "tab": tab->{ _id, label }, isVisible, sortOrder
}`;

const SV_QUERY = `*[_type == "sectionVisibility" && _id == "sectionVisibility"][0]`;

const EQUIPMENT_QUERY = `*[_type == "equipment"] | order(sortOrder asc) {
  _id, name, description, image { asset { _ref } }, sortOrder
}`;

const FACILITY_QUERY = `*[_type == "facility"] | order(sortOrder asc) {
  _id, name, description, image { asset { _ref } }, sortOrder
}`;

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

// ─── Tabs ─────────────────────────────────────────────────

type BrandTab =
  | 'doctors'
  | 'brand'
  | 'stats'
  | 'facility'
  | 'equipment'
  | 'clinicInfo';

type SettingsTab =
  | 'hero'
  | 'popups'
  | 'quickNav'
  | 'sections'
  | 'legal'
  | 'crm'
  | 'utm';

const BRAND_TABS: { key: BrandTab; label: string }[] = [
  { key: 'doctors', label: '의료진' },
  { key: 'brand', label: '브랜드 철학' },
  { key: 'stats', label: '통계 수치' },
  { key: 'facility', label: '시설 갤러리' },
  { key: 'equipment', label: '보유 장비' },
  { key: 'clinicInfo', label: '병원 정보' },
];

const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: 'hero', label: '히어로 배너' },
  { key: 'popups', label: '이벤트 팝업' },
  { key: 'quickNav', label: '빠른 탐색' },
  { key: 'sections', label: '섹션 노출' },
  { key: 'legal', label: '약관 관리' },
  { key: 'crm', label: 'CRM 연동' },
  { key: 'utm', label: 'UTM 링크' },
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
  const [messenger, setMessenger] = useState<SnsLinkItem[]>([]);
  const [messengerUploading, setMessengerUploading] = useState<string | null>(
    null,
  );
  const [messengerQrUploading, setMessengerQrUploading] = useState<
    string | null
  >(null);
  const [logoUploading, setLogoUploading] = useState(false);

  useEffect(() => {
    client.fetch<ClinicInfoDoc>(CLINIC_INFO_QUERY).then((data) => {
      setDoc(data ?? {});
      setHours(data?.businessHours ?? []);
      setMessenger(data?.messengerLinks ?? []);
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

  const saveMessenger = async (newMsg: SnsLinkItem[]) => {
    setSaving(true);
    await client
      .patch('forever-myeongdong-clinic-info')
      .set({
        messengerLinks: newMsg.map((m) => ({
          _key: m._key,
          _type: 'snsLink',
          platform: m.platform,
          url: m.url,
          label: m.label,
          logo: m.logoRef
            ? { _type: 'image', asset: { _type: 'reference', _ref: m.logoRef } }
            : undefined,
          qrCode: m.qrRef
            ? { _type: 'image', asset: { _type: 'reference', _ref: m.qrRef } }
            : undefined,
          isVisible: m.isVisible,
          sortKo: m.sortKo,
          sortEn: m.sortEn,
          sortZh: m.sortZh,
          sortJa: m.sortJa,
        })),
      })
      .commit();
    setSaving(false);
  };

  const uploadLogo = async (file: File) => {
    setLogoUploading(true);
    try {
      const asset = await client.assets.upload('image', file, {
        filename: file.name,
      });
      await patch({
        logo: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
        },
      });
      setDoc((prev) => (prev ? { ...prev, logoRef: asset._id } : prev));
    } finally {
      setLogoUploading(false);
    }
  };

  const removeLogo = async () => {
    await patch({ logo: undefined });
    setDoc((prev) => (prev ? { ...prev, logoRef: undefined } : prev));
  };

  const uploadMessengerLogo = async (key: string, file: File) => {
    setMessengerUploading(key);
    try {
      const asset = await client.assets.upload('image', file, {
        filename: file.name,
      });
      const updated = messenger.map((m) =>
        m._key === key ? { ...m, logoRef: asset._id } : m,
      );
      setMessenger(updated);
      saveMessenger(updated);
    } finally {
      setMessengerUploading(null);
    }
  };

  const uploadMessengerQr = async (key: string, file: File) => {
    setMessengerQrUploading(key);
    try {
      const asset = await client.assets.upload('image', file, {
        filename: file.name,
      });
      const updated = messenger.map((m) =>
        m._key === key ? { ...m, qrRef: asset._id } : m,
      );
      setMessenger(updated);
      saveMessenger(updated);
    } finally {
      setMessengerQrUploading(null);
    }
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
    setList: (items: SnsLinkItem[]) => void,
    i: number,
    field: keyof SnsLinkItem,
    val: string,
  ) => {
    setList(list.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
  };

  const saveSnsBlur = (
    list: SnsLinkItem[],
    saveList: (l: SnsLinkItem[]) => Promise<void>,
    setList: (items: SnsLinkItem[]) => void,
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

      {/* ── 병원명 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">병원명</div>
        <div className="ht-detail-body">
          <div className="ht-detail-grid4">
            {CLINIC_LOCALES.map(({ key, label }) => (
              <div key={key} className="ht-detail-field">
                <label className="ht-detail-label">{label}</label>
                <input
                  type="text"
                  className="ht-text-input"
                  defaultValue={doc.clinicName?.[key] ?? ''}
                  onBlur={(e) =>
                    patch({ [`clinicName.${key}`]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: 11,
              color: 'var(--card-muted-fg-color)',
              marginTop: 6,
            }}
          >
            header 로고 대체 텍스트 · footer 병원명에 사용 · 줄바꿈은 Enter
          </p>
        </div>
      </div>

      {/* ── 로고 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">로고</div>
        <div className="ht-detail-body">
          <div className="ht-detail-field">
            <label className="ht-detail-label">
              header 로고 이미지
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--card-muted-fg-color)',
                  marginLeft: 4,
                }}
              >
                (미설정 시 기본 로고)
              </span>
            </label>
            {doc.logoRef && (
              <img
                src={`https://cdn.sanity.io/images/ecoamz42/production/${doc.logoRef.replace('image-', '').replace(/-(\w+)$/, '.$1')}`}
                alt="logo"
                style={{
                  height: 40,
                  width: 'auto',
                  objectFit: 'contain',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  padding: 4,
                  marginBottom: 6,
                  background: '#fff',
                }}
              />
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              <label
                className="ht-upload-btn"
                style={{ fontSize: 11, padding: '2px 8px' }}
              >
                {logoUploading
                  ? '업로드 중…'
                  : doc.logoRef
                    ? '로고 변경'
                    : '로고 선택'}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  disabled={logoUploading}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadLogo(file);
                  }}
                />
              </label>
              {doc.logoRef && (
                <button
                  type="button"
                  className="ht-upload-btn"
                  style={{ fontSize: 11, padding: '2px 8px' }}
                  onClick={removeLogo}
                >
                  로고 삭제
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
                <div
                  className="ht-detail-row"
                  style={{ flexWrap: 'wrap', gap: 8 }}
                >
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">플랫폼</label>
                    <input
                      type="text"
                      className="ht-text-input"
                      value={s.platform ?? ''}
                      placeholder="예: 카카오톡, WeChat, LINE"
                      onChange={(e) => {
                        const updated = messenger.map((x, idx) =>
                          idx === i ? { ...x, platform: e.target.value } : x,
                        );
                        setMessenger(updated);
                      }}
                      onBlur={(e) => {
                        const updated = messenger.map((x, idx) =>
                          idx === i ? { ...x, platform: e.target.value } : x,
                        );
                        setMessenger(updated);
                        saveMessenger(updated);
                      }}
                    />
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
                <div className="ht-detail-row" style={{ marginTop: 8 }}>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">로고 이미지</label>
                    {s.logoRef && (
                      <img
                        src={`https://cdn.sanity.io/images/ecoamz42/production/${s.logoRef.replace('image-', '').replace(/-(\w+)$/, '.$1')}`}
                        alt="logo"
                        style={{
                          width: 36,
                          height: 36,
                          objectFit: 'cover',
                          borderRadius: '50%',
                          border: '1px solid #e5e7eb',
                          marginBottom: 4,
                        }}
                      />
                    )}
                    <label
                      className="ht-upload-btn"
                      style={{ fontSize: 11, padding: '2px 8px' }}
                    >
                      {messengerUploading === s._key
                        ? '업로드 중…'
                        : '로고 선택'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={messengerUploading === s._key}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadMessengerLogo(s._key, file);
                        }}
                      />
                    </label>
                  </div>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">
                      QR 이미지
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--card-muted-fg-color)',
                          marginLeft: 4,
                        }}
                      >
                        (마우스 오버 시 노출 · 선택)
                      </span>
                    </label>
                    {s.qrRef && (
                      <img
                        src={`https://cdn.sanity.io/images/ecoamz42/production/${s.qrRef.replace('image-', '').replace(/-(\w+)$/, '.$1')}`}
                        alt="qr"
                        style={{
                          width: 48,
                          height: 48,
                          objectFit: 'contain',
                          borderRadius: 6,
                          border: '1px solid #e5e7eb',
                          marginBottom: 4,
                        }}
                      />
                    )}
                    <div style={{ display: 'flex', gap: 6 }}>
                      <label
                        className="ht-upload-btn"
                        style={{ fontSize: 11, padding: '2px 8px' }}
                      >
                        {messengerQrUploading === s._key
                          ? '업로드 중…'
                          : s.qrRef
                            ? 'QR 변경'
                            : 'QR 선택'}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          disabled={messengerQrUploading === s._key}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) uploadMessengerQr(s._key, file);
                          }}
                        />
                      </label>
                      {s.qrRef && (
                        <button
                          type="button"
                          className="ht-upload-btn"
                          style={{ fontSize: 11, padding: '2px 8px' }}
                          onClick={() => {
                            const updated = messenger.map((m) =>
                              m._key === s._key
                                ? { ...m, qrRef: undefined }
                                : m,
                            );
                            setMessenger(updated);
                            saveMessenger(updated);
                          }}
                        >
                          QR 삭제
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">노출</label>
                    <input
                      type="checkbox"
                      className="tt-toggle"
                      checked={s.isVisible !== false}
                      onChange={(e) => {
                        const updated = messenger.map((m) =>
                          m._key === s._key
                            ? { ...m, isVisible: e.target.checked }
                            : m,
                        );
                        setMessenger(updated);
                        saveMessenger(updated);
                      }}
                    />
                  </div>
                  <div className="ht-detail-field">
                    <label className="ht-detail-label">언어별 정렬 순서</label>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {(
                        [
                          ['ko', '한'],
                          ['en', '영'],
                          ['zh', '중'],
                          ['ja', '일'],
                        ] as const
                      ).map(([locale, lbl]) => {
                        const field =
                          `sort${locale.charAt(0).toUpperCase()}${locale.slice(1)}` as
                            | 'sortKo'
                            | 'sortEn'
                            | 'sortZh'
                            | 'sortJa';
                        return (
                          <div
                            key={locale}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 2,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 10,
                                color: 'var(--card-muted-fg-color)',
                              }}
                            >
                              {lbl}
                            </span>
                            <input
                              type="number"
                              className="ht-text-input ht-order-input"
                              style={{ width: 52 }}
                              defaultValue={s[field] ?? 0}
                              onBlur={(e) => {
                                const updated = messenger.map((m) =>
                                  m._key === s._key
                                    ? { ...m, [field]: Number(e.target.value) }
                                    : m,
                                );
                                setMessenger(updated);
                                saveMessenger(updated);
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>
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

      {/* ── 전화번호 / 이메일 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">전화번호 · 이메일</div>
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
          <p
            style={{
              fontSize: 11,
              color: 'var(--card-muted-fg-color)',
              marginTop: 6,
            }}
          >
            footer · 예약/상담 · 브랜드 · 메인 오시는길에 공통 사용
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── 히어로 배너 패널 ─────────────────────────────────────

function HeroBannerPanel({ onEdit }: { onEdit: (heroKey: string) => void }) {
  return (
    <div className="ht-table-wrap">
      <table className="ht-table">
        <colgroup>
          <col style={{ width: '44px' }} />
          <col />
        </colgroup>
        <thead>
          <tr>
            <th>No.</th>
            <th>페이지</th>
          </tr>
        </thead>
        <tbody>
          {PAGE_HEROES.map((page, idx) => {
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
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

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

  const handleValueDragStart = (i: number) => {
    dragIndexRef.current = i;
  };
  const handleValueDragOver = (e: React.DragEvent, i: number) => {
    e.preventDefault();
    setDragOver(i);
  };
  const handleValueDragEnd = () => {
    setDragOver(null);
  };
  const handleValueDrop = (toIndex: number) => {
    const fromIndex = dragIndexRef.current;
    if (fromIndex === null || fromIndex === toIndex) {
      dragIndexRef.current = null;
      setDragOver(null);
      return;
    }
    dragIndexRef.current = null;
    setDragOver(null);
    const newValues = [...values];
    const [moved] = newValues.splice(fromIndex, 1);
    newValues.splice(toIndex, 0, moved);
    setValues(newValues);
    saveValues(newValues);
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

      {/* ── 배지 텍스트 ── */}
      <div className="ht-detail-section">
        <div className="ht-detail-section-title">배지 텍스트</div>
        <div className="ht-detail-body">
          <input
            type="text"
            className="ht-text-input"
            style={{ maxWidth: 240 }}
            defaultValue={doc.badge ?? 'BRAND PHILOSOPHY · Since 2008'}
            placeholder="BRAND PHILOSOPHY · Since 2008"
            onBlur={(e) => patch({ badge: e.target.value })}
          />
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
            홈페이지 브랜드 섹션 및 브랜드 페이지에 표시됩니다
          </p>
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
                <div
                  key={val._key}
                  className={`ht-array-item${dragOver === idx ? 'ht-drag-over' : ''}`}
                  draggable
                  onDragStart={() => handleValueDragStart(idx)}
                  onDragOver={(e) => handleValueDragOver(e, idx)}
                  onDragEnd={handleValueDragEnd}
                  onDrop={() => handleValueDrop(idx)}
                >
                  <div className="ht-array-item-header">
                    <div className="ht-drag-handle">⋮⋮</div>
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
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

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
    const newItems = [...items];
    const [moved] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, moved);
    setItems(newItems);
    save(newItems);
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-panel-section">
      {saving && <span className="ht-saving-indicator">저장 중…</span>}
      <div className="ht-array-editor" style={{ marginTop: 12 }}>
        <div className="ht-toolbar" style={{ marginBottom: 8 }}>
          <button className="ht-add-btn" onClick={addItem}>
            + 항목 추가
          </button>
        </div>
        {items.map((item, i) => (
          <div
            key={item._key}
            className={`ht-array-item${dragOver === i ? 'ht-drag-over' : ''}`}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(i)}
          >
            <div className="ht-array-item-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div className="ht-drag-handle" style={{ marginBottom: 0 }}>
                  ⋮⋮
                </div>
                <span className="ht-array-num">{i + 1}</span>
              </div>
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
  const tabDragFrom = useRef<{ tab: string; idx: number } | null>(null);
  const [tabDragOver, setTabDragOver] = useState<{
    tab: string;
    idx: number;
  } | null>(null);

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

  const handleTabDrop = async (tabId: string, toIndex: number) => {
    const from = tabDragFrom.current;
    if (!from || from.tab !== tabId || from.idx === toIndex) {
      tabDragFrom.current = null;
      setTabDragOver(null);
      return;
    }
    tabDragFrom.current = null;
    setTabDragOver(null);
    const tabCards = cards.filter((c) => c.tab?._id === tabId);
    const otherCards = cards.filter((c) => c.tab?._id !== tabId);
    const newTabCards = [...tabCards];
    const [moved] = newTabCards.splice(from.idx, 1);
    newTabCards.splice(toIndex, 0, moved);
    const newCards = [...otherCards, ...newTabCards];
    setCards(newCards);
    setSaving(true);
    const tx = client.transaction();
    newTabCards.forEach((card, idx) => {
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
          {/* Unassigned cards */}
          {(() => {
            const unassigned = cards.filter((c) => !c.tab?._id);
            if (unassigned.length === 0) return null;
            return (
              <div
                className="ht-detail-section"
                style={{
                  marginTop: 16,
                  borderColor: 'var(--card-border-color)',
                }}
              >
                <div
                  className="ht-detail-section-title"
                  style={{ color: '#9ca3af' }}
                >
                  탭 없음 (미연결)
                </div>
                <div className="ht-detail-body">
                  <table className="ht-table">
                    <colgroup>
                      <col style={{ width: 56 }} />
                      <col />
                      <col style={{ width: '30%' }} />
                      <col style={{ width: 60 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>제목</th>
                        <th>slug</th>
                        <th style={{ textAlign: 'center' }}>노출</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unassigned.map((card, idx) => (
                        <tr
                          key={card._id}
                          className="ht-row-clickable"
                          onClick={() => onEditCard(card._id)}
                        >
                          <td className="ht-row-num">{idx + 1}</td>
                          <td>
                            <span className="ht-row-name">
                              {card.title?.ko || '—'}
                            </span>
                          </td>
                          <td className="ht-row-meta">
                            {card.slug?.current || '—'}
                          </td>
                          <td
                            style={{ textAlign: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              className="tt-toggle"
                              checked={!!card.isVisible}
                              onChange={(e) =>
                                toggleCard(card._id, e.target.checked)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
          {/* Tab-grouped cards */}
          {tabs.map((tab) => {
            const tabCards = cards.filter((c) => c.tab?._id === tab._id);
            return (
              <div
                key={tab._id}
                className="ht-detail-section"
                style={{ marginTop: 16 }}
              >
                <div className="ht-detail-section-title">
                  {tab.label?.ko || tab.key || '—'}
                </div>
                <div className="ht-detail-body">
                  <table className="ht-table">
                    <colgroup>
                      <col style={{ width: 56 }} />
                      <col />
                      <col style={{ width: '30%' }} />
                      <col style={{ width: 60 }} />
                    </colgroup>
                    <thead>
                      <tr>
                        <th>⠿ No.</th>
                        <th>제목</th>
                        <th>slug</th>
                        <th style={{ textAlign: 'center' }}>노출</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tabCards.map((card, idx) => (
                        <tr
                          key={card._id}
                          className={`ht-row-clickable${tabDragOver?.tab === tab._id && tabDragOver?.idx === idx ? 'ht-drag-over' : ''}`}
                          draggable
                          onDragStart={() => {
                            tabDragFrom.current = { tab: tab._id, idx };
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            setTabDragOver({ tab: tab._id, idx });
                          }}
                          onDragEnd={() => setTabDragOver(null)}
                          onDrop={() => handleTabDrop(tab._id, idx)}
                          onClick={() => onEditCard(card._id)}
                        >
                          <td
                            className="ht-drag-handle"
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>⋮⋮</span>
                            <span className="ht-row-num" style={{ margin: 0 }}>
                              {idx + 1}
                            </span>
                          </td>
                          <td>
                            <span className="ht-row-name">
                              {card.title?.ko || '—'}
                            </span>
                          </td>
                          <td className="ht-row-meta">
                            {card.slug?.current || '—'}
                          </td>
                          <td
                            style={{ textAlign: 'center' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              className="tt-toggle"
                              checked={!!card.isVisible}
                              onChange={(e) =>
                                toggleCard(card._id, e.target.checked)
                              }
                            />
                          </td>
                        </tr>
                      ))}
                      {tabCards.length === 0 && (
                        <tr>
                          <td colSpan={5} className="ht-empty">
                            카드 없음
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
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

const NAV_ITEMS = [
  { key: 'bnA', label: 'B&A' },
  { key: 'treatments', label: '시술' },
  { key: 'brand', label: '브랜드' },
  { key: 'media', label: '미디어' },
];
const MEGAMENU_ITEMS = [
  { key: 'catLiftingLaser', label: '리프팅·레이저' },
  { key: 'catPetitLifting', label: '쁘띠·실리프팅' },
  { key: 'catSkincare', label: '스킨케어' },
  { key: 'catSkinBooster', label: '스킨부스터' },
  { key: 'catHairRemoval', label: '제모클리닉' },
  { key: 'catAnesthesia', label: '마취클리닉' },
];
const HOME_ITEMS = [
  { key: 'hero', label: '히어로' },
  { key: 'quickEntry', label: '퀵엔트리' },
  { key: 'signature', label: '시그니처' },
  { key: 'promo', label: '프로모션' },
  { key: 'bnA', label: 'B&A' },
  { key: 'press', label: '언론보도' },
  { key: 'stats', label: '지표' },
  { key: 'brandPhilosophy', label: '브랜드 철학' },
  { key: 'doctors', label: '의료진' },
  { key: 'location', label: '위치' },
  { key: 'contact', label: '문의' },
];
const BRAND_ITEMS = [
  { key: 'philosophy', label: '철학' },
  { key: 'doctors', label: '의료진' },
  { key: 'facilities', label: '시설' },
  { key: 'equipment', label: '장비' },
  { key: 'location', label: '위치' },
  { key: 'stats', label: '지표' },
];
const MEDIA_ITEMS = [
  { key: 'press', label: '보도자료' },
  { key: 'video', label: '영상' },
  { key: 'blog', label: '블로그' },
  { key: 'notice', label: '공지사항' },
];

function DraggableGroup({
  title,
  items,
  order,
  setOrder,
  doc,
  onToggle,
  togglePath,
  saveOrder,
}: {
  title: string;
  items: { key: string; label: string }[];
  order: string[];
  setOrder: (o: string[]) => void;
  doc: SectionVisibilityDoc | null;
  onToggle: (path: string, value: boolean) => void;
  togglePath: string;
  saveOrder: (o: string[]) => void;
}) {
  const dragFrom = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  const orderedItems: { key: string; label: string }[] = order
    .map((k) => items.find((i) => i.key === k))
    .filter((i): i is { key: string; label: string } => i !== undefined);
  items.forEach((i) => {
    if (!orderedItems.find((o) => o.key === i.key)) orderedItems.push(i);
  });

  const handleDrop = (toIdx: number) => {
    const fromIdx = dragFrom.current;
    if (fromIdx === null || fromIdx === toIdx) {
      dragFrom.current = null;
      setDragOver(null);
      return;
    }
    dragFrom.current = null;
    setDragOver(null);
    const newOrder = orderedItems.map((i) => i.key);
    const [moved] = newOrder.splice(fromIdx, 1);
    newOrder.splice(toIdx, 0, moved);
    setOrder(newOrder);
    saveOrder(newOrder);
  };

  const getVal = (key: string): boolean | undefined => {
    const d = doc as unknown as Record<string, Record<string, boolean>>;
    return d?.[togglePath]?.[key];
  };

  return (
    <div className="ht-sv-group">
      <div className="ht-sv-group-title">{title}</div>
      {orderedItems.map((item, idx) => (
        <div
          key={item.key}
          draggable
          className={`ht-sv-drag-row${dragOver === idx ? 'ht-sv-drag-over' : ''}`}
          onDragStart={() => {
            dragFrom.current = idx;
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(idx);
          }}
          onDragEnd={() => setDragOver(null)}
          onDrop={() => handleDrop(idx)}
        >
          <span
            className="ht-drag-handle"
            style={{
              cursor: 'grab',
              color: 'var(--card-muted-fg-color)',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            ⋮⋮
          </span>
          <span
            style={{ flex: 1, fontSize: 12, color: 'var(--card-fg-color)' }}
          >
            {item.label}
          </span>
          <input
            type="checkbox"
            className="tt-toggle"
            checked={!!getVal(item.key)}
            onChange={(e) =>
              onToggle(`${togglePath}.${item.key}`, e.target.checked)
            }
          />
        </div>
      ))}
    </div>
  );
}

function SectionsPanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<SectionVisibilityDoc | null>(null);
  const [saving, setSaving] = useState(false);
  const [navOrder, setNavOrder] = useState<string[]>([]);
  const [megaMenuOrder, setMegaMenuOrder] = useState<string[]>([]);
  const [homeOrder, setHomeOrder] = useState<string[]>([]);
  const [brandOrder, setBrandOrder] = useState<string[]>([]);
  const [mediaOrder, setMediaOrder] = useState<string[]>([]);

  useEffect(() => {
    client
      .fetch<
        SectionVisibilityDoc & {
          navOrder?: string[];
          megaMenuOrder?: string[];
          homeOrder?: string[];
          brandOrder?: string[];
          mediaOrder?: string[];
        }
      >(SV_QUERY)
      .then((data) => {
        setDoc(data ?? {});
        setNavOrder(
          data?.navOrder?.length ? data.navOrder : NAV_ITEMS.map((i) => i.key),
        );
        setMegaMenuOrder(
          data?.megaMenuOrder?.length
            ? data.megaMenuOrder
            : MEGAMENU_ITEMS.map((i) => i.key),
        );
        setHomeOrder(
          data?.homeOrder?.length
            ? data.homeOrder
            : HOME_ITEMS.map((i) => i.key),
        );
        setBrandOrder(
          data?.brandOrder?.length
            ? data.brandOrder
            : BRAND_ITEMS.map((i) => i.key),
        );
        setMediaOrder(
          data?.mediaOrder?.length
            ? data.mediaOrder
            : MEDIA_ITEMS.map((i) => i.key),
        );
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

  const saveOrderField = async (field: string, order: string[]) => {
    setSaving(true);
    await client
      .patch('sectionVisibility')
      .set({ [field]: order })
      .commit();
    setSaving(false);
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-panel-section">
      {saving && <span className="ht-saving-indicator">저장 중…</span>}

      <DraggableGroup
        title="메뉴 노출"
        items={NAV_ITEMS}
        order={navOrder}
        setOrder={setNavOrder}
        doc={doc}
        onToggle={toggle}
        togglePath="nav"
        saveOrder={(o) => saveOrderField('navOrder', o)}
      />

      <DraggableGroup
        title="시술 카테고리"
        items={MEGAMENU_ITEMS}
        order={megaMenuOrder}
        setOrder={setMegaMenuOrder}
        doc={doc}
        onToggle={toggle}
        togglePath="nav"
        saveOrder={(o) => saveOrderField('megaMenuOrder', o)}
      />

      <DraggableGroup
        title="메인 홈 섹션"
        items={HOME_ITEMS}
        order={homeOrder}
        setOrder={setHomeOrder}
        doc={doc}
        onToggle={toggle}
        togglePath="home"
        saveOrder={(o) => saveOrderField('homeOrder', o)}
      />

      <DraggableGroup
        title="브랜드 페이지"
        items={BRAND_ITEMS}
        order={brandOrder}
        setOrder={setBrandOrder}
        doc={doc}
        onToggle={toggle}
        togglePath="brand"
        saveOrder={(o) => saveOrderField('brandOrder', o)}
      />

      <DraggableGroup
        title="미디어 탭"
        items={MEDIA_ITEMS}
        order={mediaOrder}
        setOrder={setMediaOrder}
        doc={doc}
        onToggle={toggle}
        togglePath="media"
        saveOrder={(o) => saveOrderField('mediaOrder', o)}
      />

      <div className="ht-sv-group">
        <div className="ht-sv-group-title">기타</div>
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

// ─── 보유 장비 패널 ───────────────────────────────────────

function EquipmentSection() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<EquipmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    client.fetch<EquipmentRow[]>(EQUIPMENT_QUERY).then((data) => {
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
      _type: 'equipment',
      name: { ko: '' },
      sortOrder: docs.length,
    });
    setDocs((prev) => [
      ...prev,
      { _id: newDoc._id, name: { ko: '' }, sortOrder: prev.length },
    ]);
    setExpandedId(newDoc._id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('장비를 삭제하시겠습니까?')) return;
    await client.delete(id);
    setDocs((prev) => prev.filter((d) => d._id !== id));
    if (expandedId === id) setExpandedId(null);
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
    <div className="ht-panel-section">
      <div className="ht-toolbar" style={{ marginBottom: 12 }}>
        <button className="ht-add-btn" onClick={handleAdd}>
          + 장비 추가
        </button>
        {saving && <span className="ht-saving-indicator">저장 중…</span>}
      </div>
      <div className="ht-popup-list">
        {docs.map((doc, idx) => (
          <div
            key={doc._id}
            className={`ht-popup-item${dragOver === idx ? 'ht-drag-over' : ''}`}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(idx)}
          >
            <div
              className="ht-popup-header"
              onClick={() =>
                setExpandedId((prev) => (prev === doc._id ? null : doc._id))
              }
            >
              <span
                className="ht-drag-handle"
                style={{ marginRight: 8, cursor: 'grab' }}
                onClick={(e) => e.stopPropagation()}
              >
                ⋮⋮
              </span>
              <span className="ht-popup-title">
                {doc.name?.ko || '(이름 없음)'}
              </span>
              <button
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '0 8px',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(doc._id);
                }}
              >
                삭제
              </button>
              <span className="ht-popup-chevron">
                {expandedId === doc._id ? '▲' : '▼'}
              </span>
            </div>
            {expandedId === doc._id && (
              <div className="ht-popup-body">
                <div className="ht-detail-section" style={{ marginBottom: 12 }}>
                  <div className="ht-detail-section-title">장비 이미지</div>
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
                        alt="장비 미리보기"
                        style={{
                          width: 80,
                          height: 100,
                          objectFit: 'contain',
                          borderRadius: 4,
                          border: '1px solid #e5e7eb',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 80,
                          height: 100,
                          borderRadius: 4,
                          border: '1px dashed #d1d5db',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          color: '#9ca3af',
                          flexShrink: 0,
                        }}
                      >
                        이미지 없음
                      </div>
                    )}
                    <label
                      className="ht-add-btn"
                      style={{
                        cursor: 'pointer',
                        display: 'inline-block',
                        alignSelf: 'flex-end',
                      }}
                    >
                      {uploadingId === doc._id ? '업로드 중…' : '이미지 업로드'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploadingId === doc._id}
                        onChange={(e) => handleImageUpload(doc._id, e)}
                      />
                    </label>
                  </div>
                </div>
                <div className="ht-detail-section" style={{ marginBottom: 12 }}>
                  <div className="ht-detail-section-title">장비명</div>
                  <div className="ht-detail-body">
                    <div className="ht-detail-grid4">
                      {CLINIC_LOCALES.map(({ key, label }) => (
                        <div key={key} className="ht-detail-field">
                          <label className="ht-detail-label">{label}</label>
                          <input
                            type="text"
                            className="ht-text-input"
                            defaultValue={doc.name?.[key] ?? ''}
                            onBlur={(e) =>
                              patch(doc._id, {
                                [`name.${key}`]: e.target.value,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ht-detail-section">
                  <div className="ht-detail-section-title">용도 설명</div>
                  <div className="ht-detail-body">
                    <div className="ht-detail-grid4">
                      {CLINIC_LOCALES.map(({ key, label }) => (
                        <div key={key} className="ht-detail-field">
                          <label className="ht-detail-label">{label}</label>
                          <textarea
                            className="ht-text-input"
                            style={{ minHeight: 80, resize: 'vertical' }}
                            defaultValue={doc.description?.[key] ?? ''}
                            onBlur={(e) =>
                              patch(doc._id, {
                                [`description.${key}`]: e.target.value,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {docs.length === 0 && (
          <p className="ht-empty">등록된 장비가 없습니다</p>
        )}
      </div>
    </div>
  );
}

// ─── 시설 갤러리 패널 ─────────────────────────────────────

function FacilitySection() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [docs, setDocs] = useState<FacilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const dragIndexRef = useRef<number | null>(null);
  const [dragOver, setDragOver] = useState<number | null>(null);

  useEffect(() => {
    client.fetch<FacilityRow[]>(FACILITY_QUERY).then((data) => {
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
      _type: 'facility',
      name: { ko: '' },
      sortOrder: docs.length,
    });
    setDocs((prev) => [
      ...prev,
      { _id: newDoc._id, name: { ko: '' }, sortOrder: prev.length },
    ]);
    setExpandedId(newDoc._id);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('시설 항목을 삭제하시겠습니까?')) return;
    await client.delete(id);
    setDocs((prev) => prev.filter((d) => d._id !== id));
    if (expandedId === id) setExpandedId(null);
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
    <div className="ht-panel-section">
      <div className="ht-toolbar" style={{ marginBottom: 12 }}>
        <button className="ht-add-btn" onClick={handleAdd}>
          + 시설 추가
        </button>
        {saving && <span className="ht-saving-indicator">저장 중…</span>}
      </div>
      <div className="ht-popup-list">
        {docs.map((doc, idx) => (
          <div
            key={doc._id}
            className={`ht-popup-item${dragOver === idx ? 'ht-drag-over' : ''}`}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(idx)}
          >
            <div
              className="ht-popup-header"
              onClick={() =>
                setExpandedId((prev) => (prev === doc._id ? null : doc._id))
              }
            >
              <span
                className="ht-drag-handle"
                style={{ marginRight: 8, cursor: 'grab' }}
                onClick={(e) => e.stopPropagation()}
              >
                ⋮⋮
              </span>
              <span className="ht-popup-title">
                {doc.name?.ko || '(이름 없음)'}
              </span>
              <button
                style={{
                  marginLeft: 'auto',
                  background: 'none',
                  border: 'none',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: 13,
                  padding: '0 8px',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(doc._id);
                }}
              >
                삭제
              </button>
              <span className="ht-popup-chevron">
                {expandedId === doc._id ? '▲' : '▼'}
              </span>
            </div>
            {expandedId === doc._id && (
              <div className="ht-popup-body">
                <div className="ht-detail-section" style={{ marginBottom: 12 }}>
                  <div className="ht-detail-section-title">시설 이미지</div>
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
                        alt="시설 미리보기"
                        style={{
                          width: 120,
                          height: 80,
                          objectFit: 'cover',
                          borderRadius: 4,
                          border: '1px solid #e5e7eb',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 120,
                          height: 80,
                          borderRadius: 4,
                          border: '1px dashed #d1d5db',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          color: '#9ca3af',
                          flexShrink: 0,
                        }}
                      >
                        이미지 없음
                      </div>
                    )}
                    <label
                      className="ht-add-btn"
                      style={{
                        cursor: 'pointer',
                        display: 'inline-block',
                        alignSelf: 'flex-end',
                      }}
                    >
                      {uploadingId === doc._id ? '업로드 중…' : '이미지 업로드'}
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        disabled={uploadingId === doc._id}
                        onChange={(e) => handleImageUpload(doc._id, e)}
                      />
                    </label>
                  </div>
                </div>
                <div className="ht-detail-section" style={{ marginBottom: 12 }}>
                  <div className="ht-detail-section-title">공간명</div>
                  <div className="ht-detail-body">
                    <div className="ht-detail-grid4">
                      {CLINIC_LOCALES.map(({ key, label }) => (
                        <div key={key} className="ht-detail-field">
                          <label className="ht-detail-label">{label}</label>
                          <input
                            type="text"
                            className="ht-text-input"
                            defaultValue={doc.name?.[key] ?? ''}
                            onBlur={(e) =>
                              patch(doc._id, {
                                [`name.${key}`]: e.target.value,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="ht-detail-section">
                  <div className="ht-detail-section-title">설명</div>
                  <div className="ht-detail-body">
                    <div className="ht-detail-grid4">
                      {CLINIC_LOCALES.map(({ key, label }) => (
                        <div key={key} className="ht-detail-field">
                          <label className="ht-detail-label">{label}</label>
                          <textarea
                            className="ht-text-input"
                            style={{ minHeight: 80, resize: 'vertical' }}
                            defaultValue={doc.description?.[key] ?? ''}
                            onBlur={(e) =>
                              patch(doc._id, {
                                [`description.${key}`]: e.target.value,
                              })
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {docs.length === 0 && (
          <p className="ht-empty">등록된 시설이 없습니다</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────

export function BrandTool() {
  const router = useRouter();
  const routerState = useRouterState() as {
    selectedId?: string;
    tab?: BrandTab;
  } | null;
  const selectedId = routerState?.selectedId;
  const activeTab: BrandTab = routerState?.tab ?? BRAND_TABS[0].key;

  useEffect(() => {
    if (!routerState?.tab && !selectedId) {
      router.navigate({ tab: BRAND_TABS[0].key });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (selectedId) {
    return (
      <DoctorDetail
        id={selectedId}
        onBack={() => router.navigate({ tab: 'doctors' })}
      />
    );
  }

  return (
    <div className="ht-container">
      <div className="ht-tabs">
        {BRAND_TABS.map((tab) => (
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
      {activeTab === 'brand' && <BrandSection />}
      {activeTab === 'stats' && <StatsSection />}
      {activeTab === 'facility' && <FacilitySection />}
      {activeTab === 'equipment' && <EquipmentSection />}
      {activeTab === 'clinicInfo' && <ClinicInfoPanel />}
    </div>
  );
}

// ─── CRM 연동 설정 패널 ─────────────────────────────────────
interface CrmTargetUser {
  id: string;
  name: string;
}
interface CrmTargetDept {
  code: string;
  name: string;
  subjectCode: string;
  subjectName: string;
  userDTOs: CrmTargetUser[];
}
interface CrmSettingsDoc {
  subjectCode?: string | null;
  subjectName?: string | null;
  departmentCode?: string | null;
  departmentName?: string | null;
  chargeDoctorId?: string | null;
  chargeDoctorName?: string | null;
  reservationDurationMin?: number;
}

const crmInput: React.CSSProperties = {
  padding: '8px 10px',
  fontSize: 14,
  border: '1px solid #d1d5db',
  borderRadius: 6,
  background: '#fff',
  minWidth: 260,
};
const crmLabel: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#6b7280',
  marginBottom: 6,
};

function CrmConnectionPanel() {
  const client = useClient({ apiVersion: '2026-05-13' });
  const [doc, setDoc] = useState<CrmSettingsDoc | null>(null);
  const [depts, setDepts] = useState<CrmTargetDept[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [targetsError, setTargetsError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [durationMin, setDurationMin] = useState(30);

  const loadTargets = () => {
    setLoadingTargets(true);
    setTargetsError(null);
    fetch('/api/admin/crm/targets')
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        return d;
      })
      .then((d) => setDepts(d.departments ?? []))
      .catch((e) => setTargetsError(e.message))
      .finally(() => setLoadingTargets(false));
  };

  // 진입 시 저장값 + CRM 목록 자동 로드
  useEffect(() => {
    client
      .fetch<CrmSettingsDoc | null>(
        `*[_type == "crmSettings"][0]{subjectCode,subjectName,departmentCode,departmentName,chargeDoctorId,chargeDoctorName,reservationDurationMin}`,
      )
      .then((d) => {
        setDoc(d ?? {});
        setDurationMin(d?.reservationDurationMin ?? 30);
      })
      .catch(() => setDoc({}));
    // 동기 setState 회피 위해 다음 틱에 목록 로드
    const t = setTimeout(loadTargets, 0);
    return () => clearTimeout(t);
  }, [client]);

  // 진료과목·부서·담당의를 각각 독립 선택 — 전체 목록에서 중복 제거
  const subjects = Array.from(
    new Map(
      depts.map((d) => [
        d.subjectCode,
        { code: d.subjectCode, name: d.subjectName },
      ]),
    ).values(),
  );
  const doctors = Array.from(
    new Map(depts.flatMap((d) => d.userDTOs).map((u) => [u.id, u])).values(),
  );

  // 선택 즉시 자동 저장 (다른 설정 탭과 동일)
  const persist = async (patch: Partial<CrmSettingsDoc>) => {
    const next = { ...(doc ?? {}), ...patch };
    setDoc(next);
    setSaving(true);
    try {
      await client.createOrReplace({
        _id: 'crmSettings',
        _type: 'crmSettings',
        subjectCode: next.subjectCode ?? null,
        subjectName: next.subjectName ?? null,
        departmentCode: next.departmentCode ?? null,
        departmentName: next.departmentName ?? null,
        chargeDoctorId: next.chargeDoctorId ?? null,
        chargeDoctorName: next.chargeDoctorName ?? null,
        reservationDurationMin: next.reservationDurationMin ?? 30,
      });
    } finally {
      setSaving(false);
    }
  };

  if (!doc) return <div className="ht-loading">불러오는 중...</div>;

  return (
    <div className="ht-panel-section" style={{ maxWidth: 760 }}>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
        홈페이지에서 접수된 예약을 전능 CRM에 등록할 때 사용할 기본
        진료과목·부서·담당의를 지정합니다. 선택하면 자동 저장됩니다. 슬롯당 예약
        한도는 전능 CRM의 부서 설정값을 자동으로 따릅니다.
      </p>

      {saving && <span className="ht-saving-indicator">저장 중…</span>}

      {targetsError && (
        <p
          style={{
            fontSize: 13,
            color: '#b91c1c',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            padding: '8px 12px',
            marginBottom: 16,
          }}
        >
          ⚠️ CRM 목록 조회 실패: {targetsError}{' '}
          <button
            type="button"
            onClick={loadTargets}
            style={{
              marginLeft: 8,
              textDecoration: 'underline',
              background: 'none',
              border: 'none',
              color: '#b91c1c',
              cursor: 'pointer',
            }}
          >
            다시 시도
          </button>
        </p>
      )}

      <div style={{ marginBottom: 14 }}>
        <button
          type="button"
          style={{
            padding: '8px 14px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            border: '1px solid #111',
            background: '#fff',
            color: '#111',
            cursor: 'pointer',
          }}
          onClick={loadTargets}
          disabled={loadingTargets}
        >
          {loadingTargets
            ? '불러오는 중…'
            : '↻ CRM에서 진료과목·부서·담당의 불러오기'}
        </button>
        <span style={{ marginLeft: 10, fontSize: 12, color: '#9ca3af' }}>
          전능 CRM의 최신 목록을 가져옵니다 (탭 진입 시 자동 조회됨)
        </span>
      </div>

      <div
        style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}
      >
        <div>
          <label style={crmLabel}>
            진료과목 {loadingTargets && <span>(불러오는 중…)</span>}
          </label>
          <select
            style={crmInput}
            value={doc.subjectCode ?? ''}
            onChange={(e) => {
              const s = subjects.find((x) => x.code === e.target.value);
              persist({
                subjectCode: e.target.value || null,
                subjectName: s?.name ?? null,
              });
            }}
          >
            <option value="">— 선택 —</option>
            {subjects.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={crmLabel}>부서</label>
          <select
            style={crmInput}
            value={doc.departmentCode ?? ''}
            onChange={(e) => {
              const d = depts.find((x) => x.code === e.target.value);
              persist({
                departmentCode: e.target.value || null,
                departmentName: d?.name ?? null,
              });
            }}
          >
            <option value="">— 선택 —</option>
            {depts.map((d) => (
              <option key={d.code} value={d.code}>
                {d.name} ({d.code})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={crmLabel}>담당의</label>
          <select
            style={crmInput}
            value={doc.chargeDoctorId ?? ''}
            onChange={(e) => {
              const u = doctors.find((x) => x.id === e.target.value);
              persist({
                chargeDoctorId: e.target.value || null,
                chargeDoctorName: u?.name ?? null,
              });
            }}
          >
            <option value="">— 선택 —</option>
            {doctors.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <label style={crmLabel}>예약 소요 시간(분)</label>
        <input
          type="number"
          min={5}
          step={5}
          style={{ ...crmInput, minWidth: 160 }}
          value={durationMin}
          onChange={(e) => setDurationMin(Number(e.target.value))}
          onBlur={() => persist({ reservationDurationMin: durationMin })}
        />
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #e5e7eb',
          margin: '8px 0 20px',
        }}
      />

      <CrmSlotViewer departmentName={doc.departmentName ?? null} />
    </div>
  );
}

// ─── 예약 가능 슬롯(시간대별 예약 수) 조회 ──────────────────
function CrmSlotViewer({ departmentName }: { departmentName: string | null }) {
  const [date, setDate] = useState('');
  const [data, setData] = useState<{
    limit: number;
    rows: { time: string; count: number }[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const query = () => {
    if (!date) return;
    setLoading(true);
    setErr(null);
    setData(null);
    fetch(`/api/admin/crm/slots?date=${date}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
        return d;
      })
      .then((d) => setData({ limit: d.limit ?? 0, rows: d.rows ?? [] }))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>
        예약 가능 슬롯 조회
      </h3>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 12px' }}>
        선택한 날짜의 {departmentName ? `「${departmentName}」 ` : ''}부서
        시간대별 예약 수를 조회합니다.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 10,
          alignItems: 'flex-end',
          marginBottom: 14,
        }}
      >
        <div>
          <label style={crmLabel}>날짜</label>
          <input
            type="date"
            style={{ ...crmInput, minWidth: 180 }}
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <button
          type="button"
          style={{
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            border: '1px solid #111',
            background: '#111',
            color: '#fff',
            cursor: 'pointer',
          }}
          onClick={query}
          disabled={loading || !date}
        >
          {loading ? '조회 중…' : '조회'}
        </button>
      </div>

      {err && <p style={{ fontSize: 13, color: '#b91c1c' }}>⚠️ {err}</p>}

      {data && (
        <div>
          <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 8px' }}>
            슬롯당 한도: <b>{data.limit > 0 ? `${data.limit}건` : '무제한'}</b>
          </p>
          {data.rows.length === 0 ? (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>
              해당 날짜에 예약이 없습니다.
            </p>
          ) : (
            <table
              style={{
                borderCollapse: 'collapse',
                fontSize: 13,
                minWidth: 320,
              }}
            >
              <thead>
                <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                  <th style={{ padding: '6px 16px 6px 0' }}>시간</th>
                  <th style={{ padding: '6px 16px 6px 0' }}>예약 수</th>
                  <th style={{ padding: '6px 0' }}>상태</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((r) => {
                  const full = data.limit > 0 && r.count >= data.limit;
                  return (
                    <tr key={r.time} style={{ borderTop: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '6px 16px 6px 0' }}>{r.time}</td>
                      <td style={{ padding: '6px 16px 6px 0' }}>
                        {r.count}
                        {data.limit > 0 ? ` / ${data.limit}` : ''}
                      </td>
                      <td
                        style={{
                          padding: '6px 0',
                          color: full ? '#dc2626' : '#059669',
                          fontWeight: 600,
                        }}
                      >
                        {full ? '마감' : '가능'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

// ─── UTM 링크 빌더 ──────────────────────────────────────────
const UTM_BASE_URL = 'https://md.foreverclinic.co.kr';

// 선택 + 직접 입력 모두 가능하도록 datalist 프리셋 제공
const UTM_SOURCE_PRESETS = [
  'naver',
  'google',
  'instagram',
  'facebook',
  'kakao',
  'youtube',
  'blog',
  'daangn',
  'sms',
  'email',
  'newsletter',
];
const UTM_MEDIUM_PRESETS = [
  'cpc',
  'display',
  'social',
  'banner',
  'post',
  'dm',
  'email',
  'sms',
  'organic',
  'referral',
  'qr',
];

// 사이트 i18n 로케일 (src/lib/i18n/config.ts와 동일) — localePrefix: 'always'
const UTM_LOCALES: { value: string; label: string }[] = [
  { value: 'ko', label: '한국어 (ko)' },
  { value: 'en', label: 'English (en)' },
  { value: 'zh', label: '中文 (zh)' },
  { value: 'ja', label: '日本語 (ja)' },
];
const UTM_LOCALE_CODES = UTM_LOCALES.map((l) => l.value);

type UtmFields = {
  base: string;
  lang: string;
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
};

// 선택한 언어를 경로의 로케일 세그먼트에 반영 (없으면 추가, 있으면 교체)
function applyLocale(base: string, lang: string): string {
  if (!lang) return base;
  try {
    const u = new URL(base);
    const segs = u.pathname.split('/').filter(Boolean);
    if (segs.length > 0 && UTM_LOCALE_CODES.includes(segs[0])) {
      segs[0] = lang;
    } else {
      segs.unshift(lang);
    }
    u.pathname = '/' + segs.join('/');
    return u.toString();
  } catch {
    // 절대 URL이 아니면 원본 유지
    return base;
  }
}

function buildUtmUrl(f: UtmFields): string {
  const base = applyLocale(f.base.trim(), f.lang);
  if (!base) return '';
  const params: [string, string][] = [];
  const push = (key: string, val: string) => {
    const v = val.trim();
    if (v) params.push([key, v]);
  };
  push('utm_source', f.source);
  push('utm_medium', f.medium);
  push('utm_campaign', f.campaign);
  push('utm_term', f.term);
  push('utm_content', f.content);
  if (params.length === 0) return base;

  // 기존 쿼리스트링 보존하며 병합
  const [path, existingQuery] = base.split('?');
  const search = new URLSearchParams(existingQuery ?? '');
  for (const [k, v] of params) search.set(k, v);
  const hashIdx = path.indexOf('#');
  const cleanPath = hashIdx >= 0 ? path.slice(0, hashIdx) : path;
  const hash = hashIdx >= 0 ? path.slice(hashIdx) : '';
  return `${cleanPath}?${search.toString()}${hash}`;
}

function UtmTextField({
  label,
  value,
  onChange,
  placeholder,
  required,
  listId,
  presets,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  listId?: string;
  presets?: string[];
}) {
  return (
    <div style={{ flex: '1 1 240px', minWidth: 220 }}>
      <label style={crmLabel}>
        {label}
        {required && <span style={{ color: '#dc2626' }}> *</span>}
      </label>
      <input
        type="text"
        style={{ ...crmInput, minWidth: 0, width: '100%' }}
        value={value}
        list={listId}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {presets && listId && (
        <datalist id={listId}>
          {presets.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
      )}
    </div>
  );
}

function UtmLinkPanel() {
  const [fields, setFields] = useState<UtmFields>({
    base: UTM_BASE_URL,
    lang: '',
    source: '',
    medium: '',
    campaign: '',
    term: '',
    content: '',
  });
  const [copied, setCopied] = useState(false);

  const set = (patch: Partial<UtmFields>) => {
    setFields((prev) => ({ ...prev, ...patch }));
    setCopied(false);
  };

  const url = buildUtmUrl(fields);
  const ready =
    fields.base.trim() !== '' &&
    fields.source.trim() !== '' &&
    fields.medium.trim() !== '';

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // clipboard API 미지원 환경 폴백
      const ta = document.createElement('textarea');
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () =>
    setFields({
      base: UTM_BASE_URL,
      lang: '',
      source: '',
      medium: '',
      campaign: '',
      term: '',
      content: '',
    });

  return (
    <div className="ht-panel-section" style={{ maxWidth: 760 }}>
      <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 16px' }}>
        캠페인·채널별 유입을 GA4에서 구분하기 위한 UTM 추적 링크를 만듭니다.{' '}
        <b>소스·매체</b>만 필수이며(GA4 채널 분류 기준), 나머지는 비워두면
        링크에서 제외됩니다. 각 항목은 프리셋을 선택하거나 직접 입력할 수
        있습니다. 완성된 링크를 복사해 광고·SNS·메시지에 사용하세요.
      </p>

      <div
        style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}
      >
        <UtmTextField
          label="도착 URL (랜딩 페이지)"
          value={fields.base}
          onChange={(v) => set({ base: v })}
          placeholder={UTM_BASE_URL}
          required
        />
        <div style={{ flex: '0 1 200px', minWidth: 180 }}>
          <label style={crmLabel}>언어</label>
          <select
            style={{ ...crmInput, minWidth: 0, width: '100%' }}
            value={fields.lang}
            onChange={(e) => set({ lang: e.target.value })}
          >
            <option value="">선택 안 함 (자동/현재 경로)</option>
            {UTM_LOCALES.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div
        style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}
      >
        <UtmTextField
          label="소스 (utm_source)"
          value={fields.source}
          onChange={(v) => set({ source: v })}
          placeholder="예: naver, instagram"
          required
          listId="utm-source-list"
          presets={UTM_SOURCE_PRESETS}
        />
        <UtmTextField
          label="매체 (utm_medium)"
          value={fields.medium}
          onChange={(v) => set({ medium: v })}
          placeholder="예: cpc, social"
          required
          listId="utm-medium-list"
          presets={UTM_MEDIUM_PRESETS}
        />
      </div>

      <div style={{ marginBottom: 14 }}>
        <UtmTextField
          label="캠페인 (utm_campaign, 선택)"
          value={fields.campaign}
          onChange={(v) => set({ campaign: v })}
          placeholder="예: 2026_summer_lifting"
        />
      </div>

      <div
        style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}
      >
        <UtmTextField
          label="키워드 (utm_term, 선택)"
          value={fields.term}
          onChange={(v) => set({ term: v })}
          placeholder="유료 검색 키워드"
        />
        <UtmTextField
          label="콘텐츠 (utm_content, 선택)"
          value={fields.content}
          onChange={(v) => set({ content: v })}
          placeholder="소재·버전 구분 (예: banner_a)"
        />
      </div>

      <hr
        style={{
          border: 'none',
          borderTop: '1px solid #e5e7eb',
          margin: '8px 0 16px',
        }}
      />

      <label style={crmLabel}>생성된 추적 링크</label>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'stretch',
          marginBottom: 12,
        }}
      >
        <textarea
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          placeholder="필수 항목(소스·매체·캠페인)을 입력하면 링크가 생성됩니다."
          style={{
            flex: 1,
            minHeight: 64,
            padding: '10px 12px',
            fontSize: 13,
            fontFamily: 'monospace',
            lineHeight: 1.5,
            border: '1px solid #d1d5db',
            borderRadius: 6,
            background: '#f9fafb',
            color: '#111',
            resize: 'vertical',
            wordBreak: 'break-all',
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <button
          type="button"
          onClick={copy}
          disabled={!url}
          style={{
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            border: '1px solid #111',
            background: url ? '#111' : '#9ca3af',
            color: '#fff',
            cursor: url ? 'pointer' : 'not-allowed',
          }}
        >
          {copied ? '✓ 복사됨' : '링크 복사'}
        </button>
        <button
          type="button"
          onClick={reset}
          style={{
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 600,
            borderRadius: 6,
            border: '1px solid #d1d5db',
            background: '#fff',
            color: '#374151',
            cursor: 'pointer',
          }}
        >
          초기화
        </button>
        {!ready && url && (
          <span style={{ fontSize: 12, color: '#9ca3af' }}>
            * 필수 항목(소스·매체)을 채우면 GA4에서 정상 분류됩니다.
          </span>
        )}
      </div>
    </div>
  );
}

export function SettingsTool() {
  const router = useRouter();
  const routerState = useRouterState() as {
    qcardId?: string;
    heroKey?: string;
    tab?: SettingsTab;
  } | null;
  const qcardId = routerState?.qcardId;
  const heroKey = routerState?.heroKey;
  const activeTab: SettingsTab = routerState?.tab ?? SETTINGS_TABS[0].key;

  useEffect(() => {
    if (!routerState?.tab && !qcardId && !heroKey) {
      router.navigate({ tab: SETTINGS_TABS[0].key });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (qcardId) {
    return (
      <QuickCardDetail
        id={qcardId}
        onBack={() => router.navigate({ tab: 'quickNav' })}
      />
    );
  }

  if (heroKey) {
    return (
      <HeroDetail
        heroKey={heroKey}
        onBack={() => router.navigate({ tab: 'hero' })}
      />
    );
  }

  return (
    <div className="ht-container">
      <div className="ht-tabs">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.key}
            className={`ht-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => router.navigate({ tab: tab.key })}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'hero' && (
        <HeroBannerPanel onEdit={(key) => router.navigate({ heroKey: key })} />
      )}
      {activeTab === 'popups' && <PopupsSection />}
      {activeTab === 'quickNav' && (
        <QuickNavSection
          onEditCard={(id) => router.navigate({ qcardId: id })}
        />
      )}
      {activeTab === 'sections' && <SectionsPanel />}
      {activeTab === 'legal' && <LegalDocPanel />}
      {activeTab === 'crm' && <CrmConnectionPanel />}
      {activeTab === 'utm' && <UtmLinkPanel />}
    </div>
  );
}
