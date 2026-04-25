import { HeroSection } from '@/components/home/HeroSection';
import { QuickEntrySection } from '@/components/home/QuickEntrySection';
import { PromoSection } from '@/components/home/PromoSection';
import { BAPreviewSection } from '@/components/home/BAPreviewSection';
import { BrandPhilosophySection } from '@/components/home/BrandPhilosophySection';
import { StatsStripSection } from '@/components/home/StatsStripSection';
import { DoctorSection } from '@/components/home/DoctorSection';
import { LocationSection } from '@/components/home/LocationSection';
import { ContactFormSection } from '@/components/home/ContactFormSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <QuickEntrySection />
      <PromoSection />
      <BAPreviewSection />
      <BrandPhilosophySection />
      <StatsStripSection />
      <DoctorSection />
      <LocationSection />
      <ContactFormSection />
    </>
  );
}
