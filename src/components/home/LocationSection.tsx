import { getTranslations } from 'next-intl/server';
import { ImagePlaceholder } from '@/components/common/ImagePlaceholder';

/* Clinic info values are CMS content — not translated */
const INFO_ROWS = [
  {
    key: 'locationAddress',
    value: '서울특별시 중구 명동길 74 5층',
  },
  {
    key: 'locationSubway',
    value:
      '4호선 명동역 6번 출구 도보 2분\n2호선 을지로입구역 5번 출구 도보 5분',
  },
  {
    key: 'locationHours',
    value: '월–금 10:00 – 19:00\n토요일 10:00 – 16:00\n일·공휴일 휴진',
  },
  {
    key: 'locationPhone',
    value: '02-XXX-XXXX',
  },
] as const;

export async function LocationSection() {
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

          {INFO_ROWS.map((row) => (
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
