import { cn } from '@/lib/utils/cn';

interface StatsStripSectionProps {
  locale?: string;
}

const STATS = [
  { value: '15,000+', label: '누적 시술' },
  { value: '98%', label: '고객 만족도' },
  { value: '12년', label: '의료 경력' },
  { value: '100%', label: '정품 사용' },
];

function StatsStripSection({ locale: _locale }: StatsStripSectionProps) {
  return (
    <section className="bg-forever-beige py-16">
      <div
        className={cn(
          'mx-auto grid max-w-[var(--container-max)] grid-cols-2 gap-8 px-4 text-center',
          'lg:flex lg:flex-row lg:justify-center lg:gap-20',
        )}
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center gap-1">
            <span className="text-forever-red text-[36px] font-bold">
              {stat.value}
            </span>
            <span className="text-[14px] text-neutral-600">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export { StatsStripSection, type StatsStripSectionProps };
