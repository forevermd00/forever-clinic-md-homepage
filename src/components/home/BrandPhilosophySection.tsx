import { cn } from '@/lib/utils/cn';

interface BrandPhilosophySectionProps {
  locale?: string;
}

const VALUES = [
  {
    name: '정직',
    description: '결제한 용량 그대로, 눈앞에서 확인합니다.',
    english: 'Safety Ritual',
  },
  {
    name: '정교',
    description: '예약 시간 그대로 시작하고, 예상 시간 그대로 끝납니다.',
    english: 'Zero Error Protocol',
  },
  {
    name: '전문',
    description: '의사가 직접 당신의 얼굴을 설계합니다.',
    english: 'Doctor-designed',
  },
  {
    name: '존엄',
    description: '1인 전용 공간. 전담 컨시어지.',
    english: 'Private & Exclusive',
  },
];

function BrandPhilosophySection({
  locale: _locale,
}: BrandPhilosophySectionProps) {
  return (
    <section className="bg-forever-ivory px-4 pt-20 pb-12 md:px-6 lg:px-12">
      <div className="mx-auto max-w-[var(--container-max)]">
        <div className="mb-10">
          <h2 className="text-forever-charcoal text-[32px] font-bold">
            Smart-Boutique, 신뢰의 프리미엄
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {VALUES.map((value) => (
            <div
              key={value.name}
              className={cn(
                'relative h-[200px] overflow-hidden rounded-[var(--radius-card)] lg:h-[340px]',
              )}
            >
              {/* Background placeholder */}
              <div className="absolute inset-0 bg-neutral-400" />

              {/* Dark overlay */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 z-10 p-6">
                <h3 className="text-[40px] leading-tight font-bold text-white">
                  {value.name}
                </h3>
                <p className="mt-1 text-[18px] text-white">
                  {value.description}
                </p>
                <span className="mt-1 block text-[14px] text-[#d9d9d9]">
                  {value.english}
                </span>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-[16px] text-neutral-600">
          보여주기식 럭셔리가 아니라, 정교하게 설계된 신뢰의 프리미엄
        </p>
      </div>
    </section>
  );
}

export { BrandPhilosophySection, type BrandPhilosophySectionProps };
