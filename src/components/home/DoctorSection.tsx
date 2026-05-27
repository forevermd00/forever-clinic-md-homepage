import { getTranslations } from 'next-intl/server';
import type { Doctor } from '@/components/brand/DoctorCard';
import { DoctorGrid } from '@/components/brand/DoctorGrid';

interface DoctorSectionProps {
  doctors?: Doctor[];
}

export async function DoctorSection({ doctors }: DoctorSectionProps = {}) {
  if (!doctors || doctors.length === 0) return null;

  const t = await getTranslations('home');

  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-8 px-5 py-16 md:px-10 lg:px-12">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[12px] font-medium tracking-[1.8px] text-[#d4c8bd]">
            OUR DOCTORS
          </span>
          <h2 className="text-[28px] font-bold">{t('doctorsTitle')}</h2>
        </div>

        <DoctorGrid doctors={doctors} />
      </div>
    </section>
  );
}
