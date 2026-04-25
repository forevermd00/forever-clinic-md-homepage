import { cn } from '@/lib/utils/cn';

const VALUES = [
  {
    english: 'Honesty',
    korean: '정직',
    description:
      '결제한 용량 그대로, 눈앞에서 확인합니다. 보여주기식이 아닌, 투명한 시술 과정을 약속합니다.',
  },
  {
    english: 'Precision',
    korean: '정교',
    description:
      '예약 시간 그대로 시작하고, 예상 시간 그대로 끝납니다. 모든 시술은 정밀하게 설계됩니다.',
  },
  {
    english: 'Expertise',
    korean: '전문',
    description:
      '의사가 직접 당신의 얼굴을 설계합니다. 15년 이상의 경력을 가진 전문 의료진이 함께합니다.',
  },
  {
    english: 'Dignity',
    korean: '존엄',
    description:
      '1인 전용 공간, 전담 컨시어지. 모든 고객을 존중하는 프라이빗한 경험을 제공합니다.',
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

        const imageBlock = (
          <div className="bg-forever-beige h-[320px] w-full rounded-[8px] md:h-[440px] md:w-[440px] md:shrink-0" />
        );

        const textBlock = (
          <div className="flex flex-col gap-3.5">
            <span className="text-[12px] font-medium tracking-[2px] text-[#706263]">
              {value.english}
            </span>
            <h3 className="text-[36px] font-bold text-[#2b2b2b]">
              {value.korean}
            </h3>
            <p className="text-[15px] text-[#706263]">{value.description}</p>
          </div>
        );

        return (
          <div
            key={value.korean}
            className={cn(
              'flex flex-col items-center justify-center gap-10 px-4 py-12 md:flex-row md:gap-20 md:px-[120px]',
              !imageOnLeft && 'md:flex-row-reverse',
            )}
          >
            {imageOnLeft ? (
              <>
                {imageBlock}
                {textBlock}
              </>
            ) : (
              <>
                {textBlock}
                {imageBlock}
              </>
            )}
          </div>
        );
      })}
    </section>
  );
}
