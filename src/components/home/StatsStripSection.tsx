import { getTranslations } from 'next-intl/server';
import type { StatItem } from '@/lib/data/stats';

const FALLBACK_STATS = [
  { value: '15+', key: 'statsExperts' },
  { value: '30,000+', key: 'statsCases' },
  { value: '98%', key: 'statsSatisfaction' },
  { value: '10+', key: 'statsEquipment' },
] as const;

interface StatsStripSectionProps {
  stats?: StatItem[];
}

export async function StatsStripSection({
  stats,
}: StatsStripSectionProps = {}) {
  const t = await getTranslations('home');

  /* When CMS stats are provided, label is the display text directly.
     When using fallback, key is a translation key. */
  const items = stats
    ? stats.map((s) => ({ value: s.value, label: s.label }))
    : FALLBACK_STATS.map((s) => ({ value: s.value, label: t(s.key) }));

  return (
    <section className="bg-white py-10">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-8 px-5 md:flex-row md:px-10 lg:px-12">
        {items.map((stat, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[32px] font-bold text-[#a83c44]">
              {stat.value}
            </span>
            <span className="text-[14px] text-[#808080]">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
