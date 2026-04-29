import { getTranslations } from 'next-intl/server';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';
import type { ClinicInfo } from '@/components/brand/LocationInfo';

function clinicInfoToRows(info: ClinicInfo) {
  return [
    { key: 'locationAddress', value: info.address },
    { key: 'locationSubway', value: info.subway },
    { key: 'locationHours', value: info.hours },
    { key: 'locationPhone', value: info.phone },
  ];
}

interface LocationSectionProps {
  clinicInfo?: ClinicInfo;
}

export async function LocationSection({
  clinicInfo,
}: LocationSectionProps = {}) {
  const t = await getTranslations('home');

  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-12 px-5 py-16 md:flex-row md:px-10 lg:px-12">
        {/* Map placeholder */}
        <ImagePlaceholder
          label={t('mapPlaceholder')}
          variant="neutral"
          className="h-[240px] flex-1 rounded-[12px] lg:h-[360px]"
        />

        {/* Info */}
        <div className="flex h-auto flex-1 flex-col gap-6 md:h-[360px]">
          <h2 className="text-[24px] font-bold">{t('locationTitle')}</h2>

          {clinicInfo &&
            clinicInfoToRows(clinicInfo)
              .filter((row) => row.value)
              .map((row) => (
                <div key={row.key} className="flex gap-3">
                  {/* Icon circle */}
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efe5d9]">
                    <span className="text-[11px] text-[#706263]">
                      {t(row.key).charAt(0)}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[12px] font-medium text-[#d4c8bd]">
                      {t(row.key)}
                    </span>
                    <p className="text-[14px] leading-[1.5] whitespace-pre-line text-[#2b2b2b]">
                      {row.value}
                    </p>
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
