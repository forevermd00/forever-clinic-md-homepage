import { HeroSection } from '@/components/home/HeroSection';
import { QuickEntrySection } from '@/components/home/QuickEntrySection';
import { PromoSection } from '@/components/home/PromoSection';
import { BrandPhilosophySection } from '@/components/home/BrandPhilosophySection';
import { BAPreviewSection } from '@/components/home/BAPreviewSection';
import { StatsStripSection } from '@/components/home/StatsStripSection';
import { DoctorSection } from '@/components/home/DoctorSection';
import { GallerySection } from '@/components/home/GallerySection';
import { LocationSection } from '@/components/home/LocationSection';

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <QuickEntrySection />
      <PromoSection />
      <BrandPhilosophySection />
      <BAPreviewSection />
      <StatsStripSection />
      <DoctorSection />
      <GallerySection />
      <LocationSection />
    </>
  );
}
