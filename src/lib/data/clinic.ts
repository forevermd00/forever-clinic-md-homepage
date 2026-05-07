import { sanityFetch } from '@/lib/sanity/fetch';
import {
  clinicInfoQuery,
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
    day?: string;
    open?: string;
    close?: string;
    note?: string;
  }[];
  closedDayNotice?: string;
  walkingGuide?: string;
  googleMapsEmbedUrl?: string;
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

function mapClinicInfo(raw: SanityClinicInfo): ClinicInfo {
  const hours =
    raw.businessHours
      ?.map((h) => {
        const day = h.day || '';
        const time = h.open && h.close ? `${h.open}-${h.close}` : '';
        const note = h.note ? ` (${h.note})` : '';
        return `${day} ${time}${note}`.trim();
      })
      .join(' / ') || '';

  return {
    address: raw.address || '',
    subway: raw.walkingGuide || '',
    hours:
      hours ||
      (raw.closedDayNotice ? `${hours} ${raw.closedDayNotice}`.trim() : ''),
    phone: raw.phone || '',
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
          src: urlFor(e.image)?.width(600).height(400).url() || '',
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
      '월~금 10:00~20:30 (접수마감 19:30)\n토·일 10:00~18:30 (접수마감 17:30)\n연중무휴 (중요 명절 1일 휴무) / 점심시간 없음',
    subway:
      '을지로입구역 2호선 6번출구 도보 2~4분\n명동역 4호선 6번출구 도보 6분',
  },
  en: {
    address: '78 Namdaemun-ro, Jung-gu, Seoul, 1-2F Timework Building',
    phone: '02-000-0000 [Temporary]',
    hours:
      'Mon–Fri 10:00–20:30 (Last reception 19:30)\nSat–Sun 10:00–18:30 (Last reception 17:30)\nOpen year-round (closed 1 day for major holidays) / No lunch break',
    subway:
      '2 min walk from Euljiro 1-ga Station (Line 2, Exit 6)\n6 min walk from Myeongdong Station (Line 4, Exit 6)',
  },
  zh: {
    address: '首尔中区南大门路78号 Timework大厦 1-2楼',
    phone: '02-000-0000 [临时]',
    hours:
      '周一至周五 10:00-20:30（最后受理 19:30）\n周六/周日 10:00-18:30（最后受理 17:30）\n全年无休（重要节假日休1天）/ 无午休',
    subway: '乙支路入口站2号线6号出口步行2-4分钟\n明洞站4号线6号出口步行6分钟',
  },
  ja: {
    address: 'ソウル市中区南大門路78番地 タイムワークビル1-2階',
    phone: '02-000-0000 [仮]',
    hours:
      '月〜金 10:00〜20:30（最終受付 19:30）\n土・日 10:00〜18:30（最終受付 17:30）\n年中無休（主要祝日1日休診）/ 昼休みなし',
    subway: '乙支路入口駅2号線6番出口 徒歩2〜4分\n明洞駅4号線6番出口 徒歩6分',
  },
};

export async function getClinicInfo(locale: string): Promise<ClinicInfo> {
  const data = await sanityFetch<SanityClinicInfo>(clinicInfoQuery, { locale });

  if (!data) return FALLBACK_CLINIC_INFO[locale] ?? FALLBACK_CLINIC_INFO.ko;

  return mapClinicInfo(data);
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
