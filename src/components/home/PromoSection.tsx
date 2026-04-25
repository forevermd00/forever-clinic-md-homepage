import Link from 'next/link';
import { SectionLayout } from '@/components/common/SectionLayout';
import { CardGrid } from '@/components/common/CardGrid';
import { BaseCard } from '@/components/common/BaseCard';
import { Badge } from '@/components/ui/Badge';

interface PromoSectionProps {
  locale?: string;
}

const PROMOS = [
  {
    id: 1,
    title: '프로모션 시술 1',
    description: '이벤트가 ₩000,000\n2026.04.01 ~ 04.30',
    badge: 'EVENT',
  },
  {
    id: 2,
    title: '프로모션 시술 2',
    description: '이벤트가 ₩000,000\n2026.04.01 ~ 04.30',
    badge: 'HOT',
  },
  {
    id: 3,
    title: '프로모션 시술 3',
    description: '이벤트가 ₩000,000\n2026.04.01 ~ 04.30',
    badge: 'NEW',
  },
];

function PromoSection({ locale: _locale }: PromoSectionProps) {
  return (
    <SectionLayout title="이달의 프로모션" background="ivory">
      <CardGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} gap="md">
        {PROMOS.map((promo) => (
          <BaseCard
            key={promo.id}
            variant="treatment"
            title={promo.title}
            description={promo.description}
            badge={<Badge variant="red">{promo.badge}</Badge>}
          />
        ))}
      </CardGrid>
      <div className="mt-8">
        <Link
          href="/ko/promotions"
          className="text-forever-red text-[15px] font-medium hover:underline"
        >
          프로모션 전체 보기 →
        </Link>
      </div>
    </SectionLayout>
  );
}

export { PromoSection, type PromoSectionProps };
