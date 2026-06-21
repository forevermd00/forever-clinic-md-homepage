import { sanityFetch } from '@/lib/sanity/fetch';
import { urlFor } from '@/lib/sanity/image';
import {
  eventListQuery,
  eventByUidQuery,
  type EventOptionRaw,
} from '@/lib/sanity/queries';

/* ─── Types ─── */

export interface EventListItem {
  id: string;
  uid: string;
  title: string;
  oneLineDescription: string;
  /** 카드 썸네일 — pcImage 우선, 없으면 mobile/legacy */
  thumbnailUrl: string;
  startDate?: string;
  endDate?: string;
}

export interface EventDetailOption {
  key?: string;
  name: string;
  caption?: string;
  area?: string;
  price: number;
  discountPrice?: number;
  isEvent?: boolean;
}

export interface EventDetailTreatment {
  id: string;
  slug: string;
  name: string;
  category: string;
  options: EventDetailOption[];
}

export interface EventDetail {
  id: string;
  uid: string;
  title: string;
  oneLineDescription: string;
  description: string;
  pcImageUrl: string;
  mobileImageUrl: string;
  /** 상세페이지 본문 상단(연결 시술 위) 노출 이미지 — 현재 언어, 없으면 빈 문자열 */
  detailImageUrl: string;
  startDate?: string;
  endDate?: string;
  treatments: EventDetailTreatment[];
}

/* ─── Raw Sanity shapes ─── */

interface RawEventList {
  _id: string;
  uid?: string;
  title?: string;
  oneLineDescription?: string;
  pcImage?: unknown;
  mobileImage?: unknown;
  image?: unknown;
  startDate?: string;
  endDate?: string;
}

interface RawEventDetail extends RawEventList {
  description?: string;
  detailImage?: unknown;
  linkedTreatments?: {
    optionKeys?: string[];
    treatment?: {
      _id: string;
      slug?: string;
      name?: string;
      category?: string;
      priceOptions?: EventOptionRaw[];
    };
  }[];
}

/* ─── Helpers ─── */

function imgUrl(image: unknown, w: number): string {
  if (!image) return '';
  return urlFor(image)?.width(w).url() ?? '';
}

/** pc → mobile → legacy 순으로 첫 유효 이미지 URL */
function firstImageUrl(raw: RawEventList, w: number): string {
  return (
    imgUrl(raw.pcImage, w) || imgUrl(raw.mobileImage, w) || imgUrl(raw.image, w)
  );
}

/* ─── Fetch ─── */

export async function getEvents(locale: string): Promise<EventListItem[]> {
  const rows = await sanityFetch<RawEventList[]>(eventListQuery, { locale });
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r) => !!r.uid)
    .map((r) => ({
      id: r._id,
      uid: r.uid as string,
      title: r.title ?? '',
      oneLineDescription: r.oneLineDescription ?? '',
      thumbnailUrl: firstImageUrl(r, 800),
      startDate: r.startDate,
      endDate: r.endDate,
    }));
}

export async function getEventByUid(
  uid: string,
  locale: string,
): Promise<EventDetail | null> {
  const raw = await sanityFetch<RawEventDetail | null>(eventByUidQuery, {
    uid,
    locale,
  });
  if (!raw || !raw.uid) return null;

  const pcImageUrl =
    imgUrl(raw.pcImage, 1400) ||
    imgUrl(raw.image, 1400) ||
    imgUrl(raw.mobileImage, 1400);
  const mobileImageUrl =
    imgUrl(raw.mobileImage, 900) ||
    imgUrl(raw.image, 900) ||
    imgUrl(raw.pcImage, 900);

  const treatments: EventDetailTreatment[] = (raw.linkedTreatments ?? [])
    .map((link): EventDetailTreatment | null => {
      const t = link.treatment;
      if (!t || !t.slug) return null;
      // optionKeys에 명시된 옵션만 노출 (선택 = 노출). 비어 있으면 노출 없음.
      const keys = link.optionKeys ?? [];
      const options: EventDetailOption[] = (t.priceOptions ?? [])
        .filter((o) => !!o._key && keys.includes(o._key))
        .map((o) => ({
          key: typeof o._key === 'string' ? o._key : undefined,
          name: o.name ?? '',
          caption: o.caption || undefined,
          area: typeof o.area === 'string' ? o.area : undefined,
          price: typeof o.price === 'number' ? o.price : 0,
          discountPrice:
            typeof o.discountPrice === 'number' ? o.discountPrice : undefined,
          isEvent: !!o.isEvent,
        }))
        .filter((o) => o.price > 0 || !!o.discountPrice);
      return {
        id: t._id,
        slug: t.slug,
        name: t.name ?? '',
        category: t.category ?? '',
        options,
      };
    })
    .filter(
      (t): t is EventDetailTreatment => t !== null && t.options.length > 0,
    );

  return {
    id: raw._id,
    uid: raw.uid,
    title: raw.title ?? '',
    oneLineDescription: raw.oneLineDescription ?? '',
    description: raw.description ?? '',
    pcImageUrl,
    mobileImageUrl,
    detailImageUrl: imgUrl(raw.detailImage, 1400),
    startDate: raw.startDate,
    endDate: raw.endDate,
    treatments,
  };
}
