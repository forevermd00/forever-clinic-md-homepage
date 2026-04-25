import { HeroBanner } from '@/components/common/HeroBanner';

interface HeroSectionProps {
  locale?: string;
}

function HeroSection({ locale: _locale }: HeroSectionProps) {
  return (
    <HeroBanner
      variant="fullscreen"
      title="보여주기식 럭셔리가 아니라, 정교하게 설계된 신뢰의 프리미엄"
      subtitle="Smart-Boutique Aesthetic Clinic in Myeongdong"
      ctaText="무료 상담 예약"
      ctaHref="#contact"
      className="bg-forever-beige"
    />
  );
}

export { HeroSection, type HeroSectionProps };
