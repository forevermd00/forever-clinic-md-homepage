import { cn } from '@/lib/utils/cn';

const VALUES = [
  {
    english: 'Honesty',
    korean: '정직',
    description: '투명한 시술 과정과 가격, 정량까지 공개하는 신뢰',
    image: '/images/home/brand-honesty.png',
  },
  {
    english: 'Precision',
    korean: '정교',
    description: '시간 엄수, 오차 없는 시술, 체계적 사전·사후 안내',
    image: '/images/home/brand-precision.png',
  },
  {
    english: 'Expertise',
    korean: '전문',
    description: '의사 직접 참여 1:1 페이셜 디자인 컨설팅',
    image: '/images/home/brand-expertise.png',
  },
  {
    english: 'Dignity',
    korean: '존엄',
    description: '완전한 프라이빗 공간, 전담 컨시어지 서비스',
    image: '/images/home/brand-dignity.png',
  },
];

export function BrandPhilosophySection() {
  return (
    <section className="flex flex-col bg-white">
      {/* Header */}
      <div className="flex flex-col items-center gap-3 px-4 pt-20 pb-10 text-center">
        <span className="text-[12px] font-medium tracking-[3px] text-[#706263]">
          BRAND PHILOSOPHY
        </span>
        <h2 className="text-[28px] font-bold text-[#2b2b2b]">
          Smart-Boutique 철학
        </h2>
        <p className="text-[14px] text-[#706263]">
          보여주기식 럭셔리가 아닌, 정교하게 설계된 신뢰의 프리미엄
        </p>
      </div>

      {/* Value rows — alternating layout */}
      {VALUES.map((value, index) => {
        const imageOnLeft = index % 2 === 0;

        return (
          <div
            key={value.korean}
            className={cn(
              'flex flex-col items-center gap-10 px-4 py-12',
              'md:flex-row md:items-center md:justify-center md:gap-20 md:px-[120px]',
              !imageOnLeft && 'md:flex-row-reverse',
            )}
          >
            {/* Image — fluid, aspect-square on desktop */}
            <div className="bg-forever-beige w-full overflow-hidden rounded-[8px] md:aspect-square md:w-auto md:max-w-[440px] md:flex-1">
              <img
                src={value.image}
                alt={value.korean}
                className="h-full w-full object-cover"
              />
            </div>

            {/* Text — flex-1, vertically centered */}
            <div className="flex w-full flex-col gap-3.5 md:max-w-[440px] md:flex-1">
              <span className="text-[12px] font-medium tracking-[2px] text-[#706263]">
                {value.english}
              </span>
              <h3 className="text-[36px] font-bold text-[#2b2b2b]">
                {value.korean}
              </h3>
              <p className="text-[15px] leading-relaxed text-[#706263]">
                {value.description}
              </p>
            </div>
          </div>
        );
      })}
    </section>
  );
}
