import { sanityFetch } from '@/lib/sanity/fetch';
import { statsStripQuery } from '@/lib/sanity/queries';

/* ─── Types ─── */

export type StatItem = {
  label: string;
  value: string;
  description?: string;
};

/* ─── Sanity raw shape ─── */

interface SanityStatsStrip {
  stats?: {
    label?: Record<string, string> | string;
    number?: number;
    unit?: string;
    description?: string;
  }[];
}

/* ─── Fetch Function ─── */

export async function getStats(locale: string): Promise<StatItem[]> {
  const data = await sanityFetch<SanityStatsStrip>(statsStripQuery, { locale });

  if (!data?.stats || data.stats.length === 0) return [];

  return data.stats.map((s) => {
    const label =
      typeof s.label === 'string'
        ? s.label
        : s.label?.[locale] || s.label?.ko || '';
    return {
      label,
      value: `${s.number?.toLocaleString() ?? ''}${s.unit || ''}`,
      description: s.description || undefined,
    };
  });
}
