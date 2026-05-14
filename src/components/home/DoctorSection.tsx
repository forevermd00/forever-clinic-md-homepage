import { getTranslations } from 'next-intl/server';
import type { Doctor } from '@/components/brand/DoctorCard';

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

        {/* Doctor cards - fixed width, wrap */}
        <div className="flex flex-wrap justify-center gap-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.name}
              className="w-[270px] overflow-hidden rounded-[8px] bg-white"
            >
              {doctor.photo ? (
                <img
                  src={doctor.photo.src}
                  alt={doctor.photo.alt}
                  className="w-full object-contain"
                />
              ) : (
                <div className="h-[220px] w-full bg-[#efe5d9]" />
              )}
              <div className="flex flex-col gap-2 p-5">
                <h3 className="text-[18px] font-bold">{doctor.name}</h3>
                <span className="text-[13px] font-medium text-[#d4c8bd]">
                  {doctor.specialty}
                </span>
                {doctor.careers && doctor.careers.length > 0 && (
                  <ul className="mt-1 flex flex-col gap-0.5">
                    {doctor.careers.map((c, i) => (
                      <li
                        key={i}
                        className="text-[12px] leading-relaxed text-[#808080]"
                      >
                        {c}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
