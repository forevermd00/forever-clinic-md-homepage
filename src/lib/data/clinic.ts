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

export async function getClinicInfo(locale: string): Promise<ClinicInfo> {
  const data = await sanityFetch<SanityClinicInfo>(clinicInfoQuery, { locale });

  if (!data) return { address: '', subway: '', hours: '', phone: '' };

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
