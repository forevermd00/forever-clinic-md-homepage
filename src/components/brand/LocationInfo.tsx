import { getTranslations } from 'next-intl/server';

interface SnsLink {
  platform: string;
  url: string;
  label?: string;
}

interface ClinicInfo {
  address: string;
  subway: string;
  hours: string;
  phone: string;
  email?: string;
  snsLinks?: SnsLink[];
  latitude?: number;
  longitude?: number;
}

interface LocationInfoProps {
  clinicInfo: ClinicInfo;
}

async function LocationInfo({ clinicInfo }: LocationInfoProps) {
  const t = await getTranslations('home');

  const rows = [
    {
      key: 'locationAddress',
      value: clinicInfo.address,
      icon: (
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
      ),
    },
    {
      key: 'locationSubway',
      value: clinicInfo.subway,
      icon: (
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
      ),
    },
    {
      key: 'locationHours',
      value: clinicInfo.hours,
      icon: (
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
      ),
    },
    {
      key: 'locationPhone',
      value: clinicInfo.phone,
      icon: (
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
      ),
    },
  ].filter((row) => row.value);

  return (
    <div className="flex h-auto flex-col gap-6">
      {rows.map((row) => (
        <div key={row.key} className="flex gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#efe5d9]">
            {row.icon}
          </div>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-[12px] font-medium text-[#d4c8bd]">
              {t(row.key)}
            </span>
            <p className="text-[14px] leading-[1.5] text-[#2b2b2b]">
              {row.value.split('\n').map((line, i, arr) => (
                <span key={i}>
                  {line}
                  {i < arr.length - 1 && <br />}
                </span>
              ))}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export { LocationInfo, type LocationInfoProps, type ClinicInfo };
