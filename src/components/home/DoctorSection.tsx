import { SectionLayout } from '@/components/common/SectionLayout';
import { CardGrid } from '@/components/common/CardGrid';
import { Avatar } from '@/components/ui/Avatar';

interface DoctorSectionProps {
  locale?: string;
}

const DOCTORS = [
  {
    name: 'Dr. 김민수',
    position: '원장 / 피부과 전문의',
    philosophy: '환자와의 신뢰 위에 정교한 시술을 설계합니다.',
    initial: '김',
  },
  {
    name: 'Dr. 이수진',
    position: '부원장 / 피부과 전문의',
    philosophy: '자연스러운 아름다움을 추구합니다.',
    initial: '이',
  },
  {
    name: 'Dr. 박지훈',
    position: '전문의 / 피부과 전문의',
    philosophy: '정확한 진단과 섬세한 시술',
    initial: '박',
  },
  {
    name: 'Dr. 최예린',
    position: '전문의 / 피부과 전문의',
    philosophy: '개인 맞춤 솔루션',
    initial: '최',
  },
];

function DoctorSection({ locale: _locale }: DoctorSectionProps) {
  return (
    <SectionLayout title="의료진 소개" background="ivory">
      <CardGrid columns={{ mobile: 1, tablet: 2, desktop: 4 }} gap="md">
        {DOCTORS.map((doctor) => (
          <div
            key={doctor.name}
            className="flex flex-col items-center rounded-[var(--radius-card)] bg-white p-6 text-center shadow-[var(--shadow-card)]"
          >
            <Avatar size="xl" shape="circle" initial={doctor.initial} />
            <h3 className="text-forever-charcoal mt-4 text-[18px] font-bold">
              {doctor.name}
            </h3>
            <p className="text-[14px] text-neutral-500">{doctor.position}</p>
            <p className="mt-3 text-[14px] text-neutral-600 italic">
              &ldquo;{doctor.philosophy}&rdquo;
            </p>
          </div>
        ))}
      </CardGrid>
    </SectionLayout>
  );
}

export { DoctorSection, type DoctorSectionProps };
