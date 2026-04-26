import { getTranslations } from 'next-intl/server';

const STATS = [
  { value: '15+', key: 'statsExperts' },
  { value: '30,000+', key: 'statsCases' },
  { value: '98%', key: 'statsSatisfaction' },
  { value: '10+', key: 'statsEquipment' },
] as const;

export async function StatsStripSection() {
  const t = await getTranslations('home');

  return (
    <section className="bg-white py-10">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-8 px-5 md:flex-row md:px-10 lg:px-12">
        {STATS.map((stat) => (
          <div
            key={stat.key}
            className="flex flex-1 flex-col items-center gap-1"
          >
            <span className="text-[32px] font-bold text-[#a83c44]">
              {stat.value}
            </span>
            <span className="text-[14px] text-[#808080]">{t(stat.key)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
