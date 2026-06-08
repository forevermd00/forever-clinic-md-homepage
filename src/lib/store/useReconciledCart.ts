'use client';

import { useEffect, useMemo, useState } from 'react';
import { useCartStore, type CartItem } from '@/lib/store/cart';
import type {
  ReconcileMap,
  ReconcileOption,
} from '@/app/api/cart-prices/route';

export type ReconcileStatus = 'ok' | 'removed' | 'pending';

export interface ReconciledItem extends CartItem {
  /** 재대조 판정: ok=동일, changed=가격변동, removed=종료/삭제, pending=조회중 */
  status: ReconcileStatus;
  /** live 단가 (찾은 경우). 없으면 null */
  liveUnitPrice: number | null;
  /** live 라벨 (번역 최신화). 없으면 null */
  liveLabel: string | null;
  /** 화면 표시·전송에 쓸 단가 — live가 있으면 live, 없으면 스냅샷 */
  displayUnitPrice: number;
  /** 화면 표시에 쓸 라벨 — live가 있으면 live, 없으면 스냅샷 */
  displayLabel: string;
}

export interface ReconciledCart {
  items: ReconciledItem[];
  loading: boolean;
  /** live 가격을 마지막으로 조회한 시각 (epoch ms). 미조회 시 null */
  viewedAt: number | null;
}

/** id가 `${slug}::${token}` 형태일 때 token 추출 */
function tokenFromId(item: CartItem): string | null {
  const prefix = `${item.treatmentSlug}::`;
  if (item.id.startsWith(prefix)) return item.id.slice(prefix.length);
  return null;
}

/** 장바구니 아이템 ↔ live priceOption 매칭 (안정적 _key 우선, 레거시 폴백 포함) */
function resolveOption(
  item: CartItem,
  options: ReconcileOption[],
): ReconcileOption | null {
  // 1) optionKey(_key) 우선
  const key = item.optionKey ?? tokenFromId(item);
  if (key) {
    const byKey = options.find((o) => o.key === key);
    if (byKey) return byKey;
    // 레거시: token이 순수 숫자면 인덱스로 폴백
    if (/^\d+$/.test(key)) {
      const idx = Number(key);
      if (idx >= 0 && idx < options.length) return options[idx];
    }
    return null;
  }
  // 2) optionKey도 token도 없음(AddToCartButton base price) → 첫 옵션
  return options[0] ?? null;
}

export function useReconciledCart(locale: string): ReconciledCart {
  const items = useCartStore((s) => s.items);
  const [map, setMap] = useState<ReconcileMap | null>(null);
  const [viewedAt, setViewedAt] = useState<number | null>(null);

  const slugs = useMemo(
    () => [...new Set(items.map((i) => i.treatmentSlug))].sort(),
    [items],
  );
  const slugsKey = slugs.join(',');

  useEffect(() => {
    // 담긴 시술이 없으면 조회 불필요 (reconciled 결과도 빈 배열)
    if (slugs.length === 0) return;
    let cancelled = false;
    fetch(
      `/api/cart-prices?locale=${encodeURIComponent(locale)}&slugs=${encodeURIComponent(slugsKey)}`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setMap((data.treatments ?? {}) as ReconcileMap);
        setViewedAt(Date.now());
      })
      .catch(() => {
        if (!cancelled) setMap((prev) => prev ?? {});
      });
    return () => {
      cancelled = true;
    };
  }, [slugsKey, locale, slugs.length]);

  const reconciled = useMemo<ReconciledItem[]>(() => {
    return items.map((item) => {
      if (map === null) {
        return {
          ...item,
          status: 'pending',
          liveUnitPrice: null,
          liveLabel: null,
          displayUnitPrice: item.unitPrice,
          displayLabel: item.packageLabel,
        };
      }
      const treatment = map[item.treatmentSlug];
      const opt = treatment ? resolveOption(item, treatment.options) : null;
      // 시술 자체가 비공개/삭제거나 옵션 매칭 실패 → 종료
      if (!treatment || treatment.isVisible === false || !opt) {
        return {
          ...item,
          status: 'removed',
          liveUnitPrice: null,
          liveLabel: null,
          displayUnitPrice: item.unitPrice,
          displayLabel: item.packageLabel,
        };
      }
      // 가격이 바뀌어도 별도 알림 없이 조용히 현재가로 표시 (가벼운 견적 기능)
      return {
        ...item,
        status: 'ok',
        liveUnitPrice: opt.unitPrice,
        liveLabel: opt.label || item.packageLabel,
        displayUnitPrice: opt.unitPrice,
        displayLabel: opt.label || item.packageLabel,
      };
    });
  }, [items, map]);

  return { items: reconciled, loading: map === null, viewedAt };
}
