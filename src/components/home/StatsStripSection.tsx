const STATS = [
  { value: '15+', label: '전문 의료진' },
  { value: '30,000+', label: '누적 시술 건수' },
  { value: '98%', label: '고객 만족도' },
  { value: '10+', label: '보유 장비' },
];

export function StatsStripSection() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-8 px-5 md:flex-row md:px-10 lg:px-12">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-1 flex-col items-center gap-1"
          >
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
