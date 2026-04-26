import { getTranslations } from 'next-intl/server';

interface ClinicInfo {
  address: string;
  subway: string;
  hours: string;
  phone: string;
}

interface LocationInfoProps {
  clinicInfo: ClinicInfo;
}

async function LocationInfo({ clinicInfo }: LocationInfoProps) {
  const t = await getTranslations('home');

  return (
    <div className="flex flex-col gap-5">
      <InfoItem label={t('locationAddress')} value={clinicInfo.address} />
      <InfoItem label={t('locationSubway')} value={clinicInfo.subway} />
      <InfoItem label={t('locationHours')} value={clinicInfo.hours} />
      <InfoItem label={t('locationPhone')} value={clinicInfo.phone} />
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      {/* Icon placeholder */}
      <div className="size-8 shrink-0 rounded-full bg-[#efe5d9]" />
      <div>
        <p className="text-[13px] font-medium text-[#2b2b2b]">{label}</p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-[#706263]">
          {value}
        </p>
      </div>
    </div>
  );
}

export { LocationInfo, type LocationInfoProps, type ClinicInfo };
