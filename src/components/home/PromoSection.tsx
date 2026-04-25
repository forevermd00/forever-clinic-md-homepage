import Link from 'next/link';

export function PromoSection() {
  const PROMOS = [
    {
      id: 1,
      badge: 'EVENT',
      title: '울쎄라 리프팅 3회 패키지',
      description: '봄맞이 탄력 케어 특별 프로모션',
      date: '2026.04.01 – 04.30',
      originalPrice: '₩500,000',
      salePrice: '₩350,000',
    },
    {
      id: 2,
      badge: 'EVENT',
      title: '피코토닝 10회 패키지',
      description: '색소·잡티 집중 개선 이벤트',
      date: '2026.04.01 – 04.30',
      originalPrice: '₩500,000',
      salePrice: '₩350,000',
    },
    {
      id: 3,
      badge: 'EVENT',
      title: '리쥬란 힐러 + 아쿠아필',
      description: '수분·재생 복합 케어 할인',
      date: '2026.04.01 – 04.30',
      originalPrice: '₩500,000',
      salePrice: '₩350,000',
    },
  ];

  return (
    <section className="flex flex-col items-start gap-8 bg-[#faf8f5] px-4 py-16 md:px-[120px]">
      <h2 className="w-full text-center text-[28px] font-bold">
        이벤트 · 프로모션
      </h2>

      {/* Cards */}
      <div className="flex w-full flex-wrap justify-center gap-6">
        {PROMOS.map((promo) => (
          <div
            key={promo.id}
            className="w-[384px] overflow-hidden rounded-[8px] bg-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.08)]"
          >
            {/* Image area */}
            <div className="bg-forever-beige relative h-[198px] overflow-hidden">
              <span className="absolute top-3 left-3 rounded-[4px] bg-[#a83c44] px-2 py-1 text-[11px] font-bold text-white">
                {promo.badge}
              </span>
            </div>
            {/* Info area */}
            <div className="flex flex-col gap-1 px-4 pt-2 pb-4">
              <h3 className="text-[15px] font-bold text-[#2b2b2b]">
                {promo.title}
              </h3>
              <p className="text-[12px] text-[#706263]">{promo.description}</p>
              <p className="text-[11px] text-[#999]">{promo.date}</p>
              <div className="flex gap-2">
                <span className="text-[13px] text-[#999] line-through">
                  {promo.originalPrice}
                </span>
                <span className="text-[14px] font-bold text-[#a83c44]">
                  {promo.salePrice}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA button */}
      <div className="flex w-full justify-center">
        <Link
          href="/ko/promotions"
          className="rounded-[24px] border border-[#2b2b2b] px-8 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b] hover:text-white"
        >
          프로모션 전체보기
        </Link>
      </div>
    </section>
  );
}
