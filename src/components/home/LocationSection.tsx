import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import type { ClinicInfo } from '@/components/brand/LocationInfo';
import { buildGoogleMapsUrl } from '@/lib/utils/map';
import { GoogleMap } from '@/components/common/GoogleMap';

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
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-5 py-16 md:px-10 lg:flex-row lg:gap-12 lg:px-12">
        {/* Map */}
        <div className="relative h-[240px] flex-1 overflow-hidden rounded-[12px] bg-[#efe5d9] lg:h-[360px]">
          {clinicInfo?.latitude && clinicInfo?.longitude ? (
            <>
              <GoogleMap
                lat={clinicInfo.latitude}
                lng={clinicInfo.longitude}
                className="h-full w-full"
              />
              <Link
                href={buildGoogleMapsUrl(
                  clinicInfo.latitude,
                  clinicInfo.longitude,
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 left-3 flex items-center gap-1.5 rounded-[6px] bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#2b2b2b] shadow-sm backdrop-blur-sm hover:bg-white"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                지도에서 열기
              </Link>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-[14px] text-[#d4c8bd]">
              {t('mapPlaceholder')}
            </div>
          )}
        </div>

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
                    {row.key === 'locationAddress' && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#706263"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    )}
                    {row.key === 'locationSubway' && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#706263"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="4" y="3" width="16" height="16" rx="4" />
                        <path d="M4 11h16" />
                        <path d="M8 19l-2 2" />
                        <path d="M16 19l2 2" />
                        <path d="M9 7h1" />
                        <path d="M14 7h1" />
                      </svg>
                    )}
                    {row.key === 'locationHours' && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#706263"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    )}
                    {row.key === 'locationPhone' && (
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#706263"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.51 2 2 0 0 1 3.6 1.32h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.96a16 16 0 0 0 6 6l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
                      </svg>
                    )}
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
