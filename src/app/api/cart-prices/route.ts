import { NextRequest, NextResponse } from 'next/server';
import { sanityFetch } from '@/lib/sanity/fetch';
import { cartReconcileQuery } from '@/lib/sanity/queries';

/**
 * 장바구니 가격 재대조 — 담긴 시술의 live priceOption을 _key 기준으로 반환.
 * 견적 스냅샷(localStorage) 가격이 변동/종료되었는지 클라이언트가 판정하는 단일 소스.
 *
 * GET /api/cart-prices?locale=ko&slugs=botox,filler
 */

interface RawOption {
  _key?: string;
  name?: string;
  caption?: string;
  area?: string;
  price?: number;
  discountPrice?: number;
  isEvent?: boolean;
}

interface RawTreatment {
  slug?: string;
  name?: string;
  isVisible?: boolean;
  priceOptions?: RawOption[];
}

export interface ReconcileOption {
  key: string | null;
  label: string;
  unitPrice: number;
  isEvent: boolean;
}

export interface ReconcileTreatment {
  name: string;
  isVisible: boolean;
  options: ReconcileOption[];
}

export type ReconcileMap = Record<string, ReconcileTreatment>;

function effective(o: RawOption): number {
  return o.discountPrice && o.discountPrice > 0
    ? o.discountPrice
    : (o.price ?? 0);
}

function buildLabel(o: RawOption): string {
  return [o.area, o.name, o.caption].filter(Boolean).join(' · ');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const locale = searchParams.get('locale') || 'ko';
  const slugsParam = searchParams.get('slugs') || '';
  const slugs = [
    ...new Set(
      slugsParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  ];

  if (slugs.length === 0) {
    return NextResponse.json({ treatments: {} satisfies ReconcileMap });
  }

  const rows =
    (await sanityFetch<RawTreatment[]>(cartReconcileQuery, {
      slugs,
      locale,
    })) ?? [];

  const treatments: ReconcileMap = {};
  for (const t of rows) {
    if (!t.slug) continue;
    treatments[t.slug] = {
      name: t.name ?? '',
      isVisible: t.isVisible !== false,
      options: (t.priceOptions ?? []).map((o) => ({
        key: typeof o._key === 'string' ? o._key : null,
        label: buildLabel(o),
        unitPrice: effective(o),
        isEvent: !!o.isEvent,
      })),
    };
  }

  return NextResponse.json({ treatments });
}
