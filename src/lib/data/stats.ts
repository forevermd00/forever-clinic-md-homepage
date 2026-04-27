import { sanityFetch } from '@/lib/sanity/fetch';
import { statsStripQuery } from '@/lib/sanity/queries';

/* ─── Types ─── */

export type StatItem = {
  label: string;
  value: string;
};

/* ─── Sanity raw shape ─── */

interface SanityStatsStrip {
  stats?: {
    label?: Record<string, string> | string;
    number?: number;
    unit?: string;
  }[];
}

/* ─── Fallback Data ─── */

const FALLBACK_STATS: StatItem[] = [
  { value: '15+', label: 'statsExperts' },
  { value: '30,000+', label: 'statsCases' },
  { value: '98%', label: 'statsSatisfaction' },
  { value: '10+', label: 'statsEquipment' },
];

/* ─── Fetch Function ─── */

export async function getStats(locale: string): Promise<StatItem[]> {
  const data = await sanityFetch<SanityStatsStrip>(statsStripQuery, { locale });

  if (!data?.stats || data.stats.length === 0) return FALLBACK_STATS;

  return data.stats.map((s) => {
    const label =
      typeof s.label === 'string'
        ? s.label
        : s.label?.[locale] || s.label?.ko || '';
    return {
      label,
      value: `${s.number?.toLocaleString() ?? ''}${s.unit || ''}`,
    };
  });
}
