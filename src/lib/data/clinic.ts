import { sanityFetch } from '@/lib/sanity/fetch';
import {
  clinicInfoQuery,
  contactSectionConfigQuery,
  facilitiesQuery,
  equipmentQuery,
} from '@/lib/sanity/queries';
import { urlFor } from '@/lib/sanity/image';
import type { ClinicInfo } from '@/components/brand/LocationInfo';

/* ─── Sanity raw shapes ─── */

interface SanityClinicInfo {
  address?: string;
  phone?: string;
  email?: string;
  businessHours?: {
    dayOfWeek?: string[];
    day?: string;
    open?: string;
    close?: string;
    note?: string;
  }[];
  closedDayNotice?: string;
  walkingGuide?: string;
  locationCoordinates?: {
    latitude?: number;
    longitude?: number;
    searchAddress?: string;
  };
  snsLinks?: unknown;
  messengerLinks?: unknown;
}

interface SanityFacility {
  _id: string;
  name?: string;
  image?: unknown;
  description?: string;
}

interface SanityEquipment {
  _id: string;
  name?: string;
  image?: unknown;
  description?: string;
  manufacturer?: string;
}

/* ─── Types ─── */

export type GalleryItem = {
  id: string;
  name?: string;
  image?: { src: string; alt: string };
};

export type EquipmentItem = {
  id: string;
  name: string;
  description: string;
  treatments: string;
  image?: { src: string; alt: string };
};

/* ─── Mapping Functions ─── */

function mapBusinessHours(raw: SanityClinicInfo): BusinessHoursEntry[] {
  if (!raw.businessHours || raw.businessHours.length === 0)
    return FALLBACK_BUSINESS_HOURS;

  const entries: BusinessHoursEntry[] = [];
  for (const h of raw.businessHours) {
    if (!h.open || !h.close) continue;
    const dayOfWeek = (h.dayOfWeek ?? []).map(Number).filter((n) => !isNaN(n));
    if (dayOfWeek.length === 0) continue;
    entries.push({ dayOfWeek, open: h.open, close: h.close });
  }
  return entries.length > 0 ? entries : FALLBACK_BUSINESS_HOURS;
}

function normalizeHoursText(text: string): string {
  return text.replace(/[~〜]/g, '-').replace(/[·・]/g, '-');
}

function mapClinicInfo(raw: SanityClinicInfo): ClinicInfo {
  const hours =
    raw.businessHours
      ?.map((h) => {
        const day = normalizeHoursText(h.day || '');
        const time = h.open && h.close ? `${h.open}-${h.close}` : '';
        const note = h.note ? ` (${normalizeHoursText(h.note)})` : '';
        return `${day} ${time}${note}`.trim();
      })
      .join('\n') || '';

  const hoursWithNotice = raw.closedDayNotice
    ? `${hours}\n${normalizeHoursText(raw.closedDayNotice)}`.trim()
    : hours;

  return {
    address: raw.address || '',
    subway: raw.walkingGuide || '',
    hours: hoursWithNotice,
    phone: raw.phone || '',
    latitude: raw.locationCoordinates?.latitude,
    longitude: raw.locationCoordinates?.longitude,
  };
}

function mapFacilities(raw: SanityFacility[]): GalleryItem[] {
  return raw.map((f) => ({
    id: f._id,
    name: f.name || undefined,
    image: f.image
      ? {
          src: urlFor(f.image)?.width(600).height(400).url() || '',
          alt: f.name || '',
        }
      : undefined,
  }));
}

function mapEquipment(raw: SanityEquipment[]): EquipmentItem[] {
  return raw.map((e) => ({
    id: e._id,
    name: e.name || '',
    description: e.description || '',
    treatments: '', // Sanity equipment schema doesn't include treatments field directly
    image: e.image
      ? {
          src: urlFor(e.image)?.width(800).fit('max').url() || '',
          alt: e.name || '',
        }
      : undefined,
  }));
}

/* ─── Fetch Functions ─── */

/* ─── Static Fallback (Sanity 데이터 없을 때 사용) ─── */

const FALLBACK_CLINIC_INFO: Record<string, ClinicInfo> = {
  ko: {
    address: '서울 중구 남대문로 78 타임워크빌딩 1-2층',
    phone: '02-000-0000 [임시]',
    hours:
      '월-금 10:00-20:30 (접수마감 19:30)\n토-일 10:00-18:30 (접수마감 17:30)\n연중무휴 (중요 명절 1일 휴무) / 점심시간 없음',
    subway:
      '을지로입구역 2호선 6번출구 도보 2-4분\n명동역 4호선 6번출구 도보 6분',
  },
  en: {
    address: '78 Namdaemun-ro, Jung-gu, Seoul, 1-2F Timework Building',
    phone: '02-000-0000 [Temporary]',
    hours:
      'Mon-Fri 10:00-20:30 (Last reception 19:30)\nSat-Sun 10:00-18:30 (Last reception 17:30)\nOpen year-round (closed 1 day for major holidays) / No lunch break',
    subway:
      '2 min walk from Euljiro 1-ga Station (Line 2, Exit 6)\n6 min walk from Myeongdong Station (Line 4, Exit 6)',
  },
  zh: {
    address: '首尔中区南大门路78号 Timework大厦 1-2楼',
    phone: '02-000-0000 [临时]',
    hours:
      '周一至周五 10:00-20:30（最后受理 19:30）\n周六-周日 10:00-18:30（最后受理 17:30）\n全年无休（重要节假日休1天）/ 无午休',
    subway: '乙支路入口站2号线6号出口步行2-4分钟\n明洞站4号线6号出口步行6分钟',
  },
  ja: {
    address: 'ソウル市中区南大門路78番地 タイムワークビル1-2階',
    phone: '02-000-0000 [仮]',
    hours:
      '月-金 10:00-20:30（最終受付 19:30）\n土-日 10:00-18:30（最終受付 17:30）\n年中無休（主要祝日1日休診）/ 昼休みなし',
    subway: '乙支路入口駅2号線6番出口 徒歩2-4分\n明洞駅4号線6番出口 徒歩6分',
  },
};

export async function getClinicInfo(locale: string): Promise<ClinicInfo> {
  const data = await sanityFetch<SanityClinicInfo>(clinicInfoQuery, { locale });

  if (!data) return FALLBACK_CLINIC_INFO[locale] ?? FALLBACK_CLINIC_INFO.ko;

  return mapClinicInfo(data);
}

export async function getBusinessHours(): Promise<BusinessHoursEntry[]> {
  const data = await sanityFetch<SanityClinicInfo>(clinicInfoQuery, {
    locale: 'ko',
  });
  if (!data) return FALLBACK_BUSINESS_HOURS;
  return mapBusinessHours(data);
}

/* 예약 폼에서 사용하는 구조화된 영업시간 */
export type BusinessHoursEntry = {
  dayOfWeek: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  open: string; // "10:00"
  close: string; // "19:30"
};

/* 폴백: 평일 10:00~19:30, 주말 10:00~17:30 */
export const FALLBACK_BUSINESS_HOURS: BusinessHoursEntry[] = [
  { dayOfWeek: [1, 2, 3, 4, 5], open: '10:00', close: '19:30' },
  { dayOfWeek: [0, 6], open: '10:00', close: '17:30' },
];

export type ContactSectionConfig = {
  title: string;
  subtitle: string;
  showPreferredDatetime: boolean;
};

const FALLBACK_CONTACT_CONFIG: Record<string, ContactSectionConfig> = {
  ko: {
    title: '상담 문의',
    subtitle: '궁금하신 점이 있으시면 편하게 문의해 주세요',
    showPreferredDatetime: true,
  },
  en: {
    title: 'Consultation',
    subtitle: 'Feel free to reach out with any questions.',
    showPreferredDatetime: true,
  },
  zh: {
    title: '咨询预约',
    subtitle: '如有任何疑问，请随时联系我们。',
    showPreferredDatetime: true,
  },
  ja: {
    title: 'ご相談・予約',
    subtitle: 'お気軽にお問い合わせください。',
    showPreferredDatetime: true,
  },
};

export async function getContactSectionConfig(
  locale: string,
): Promise<ContactSectionConfig> {
  const data = await sanityFetch<{
    title?: string;
    subtitle?: string;
    showPreferredDatetime?: boolean | null;
  }>(contactSectionConfigQuery, { locale });
  const fallback =
    FALLBACK_CONTACT_CONFIG[locale] ?? FALLBACK_CONTACT_CONFIG.ko;
  if (!data) return fallback;
  return {
    title: data.title || fallback.title,
    subtitle: data.subtitle || fallback.subtitle,
    showPreferredDatetime: data.showPreferredDatetime ?? true,
  };
}

export async function getFacilities(locale: string): Promise<GalleryItem[]> {
  const data = await sanityFetch<SanityFacility[]>(facilitiesQuery, { locale });

  if (!data || data.length === 0) return [];

  return mapFacilities(data);
}

export async function getEquipment(locale: string): Promise<EquipmentItem[]> {
  const data = await sanityFetch<SanityEquipment[]>(equipmentQuery, { locale });

  if (!data || data.length === 0) return [];

  return mapEquipment(data);
}
