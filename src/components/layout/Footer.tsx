import { cn } from '@/lib/utils/cn';

const treatmentLinks = [
  { label: '리프팅', href: '/treatments/lifting' },
  { label: '피부케어', href: '/treatments/skincare' },
  { label: '토닝·색소', href: '/treatments/toning' },
  { label: '보톡스·필러', href: '/treatments/botox' },
];

const brandLinks = [
  { label: '브랜드 스토리', href: '/brand' },
  { label: '의료진 소개', href: '/brand#doctors' },
  { label: '시설 안내', href: '/brand#facilities' },
  { label: '오시는 길', href: '/brand#location' },
];

const mediaLinks = [
  { label: '공지사항', href: '/media/notice' },
  { label: '이벤트', href: '/media/events' },
  { label: '예약 상담', href: '/contact' },
  { label: '개인정보처리방침', href: '/privacy' },
];

const snsIcons = [
  { label: 'Instagram', initial: 'IG' },
  { label: 'YouTube', initial: 'YT' },
  { label: 'WeChat', initial: 'WC' },
  { label: 'Blog', initial: 'B' },
];

interface FooterProps {
  locale?: string;
  className?: string;
}

export function Footer({ locale = 'ko', className }: FooterProps) {
  return (
    <footer className={cn('bg-[#2b2b2b]', className)}>
      <div className="px-6 pt-16 pb-8 lg:px-12">
        {/* 4-column grid */}
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Clinic Info */}
          <div className="flex flex-col gap-4">
            <span className="text-[16px] font-bold tracking-[1.5px] text-white">
              FOREVER CLINIC
              <br />
              MYEONGDONG
            </span>
            <div className="flex flex-col gap-1 text-[13px] text-[#706263]">
              <p>서울특별시 중구 명동길 74 5층</p>
              <p>TEL 02-XXX-XXXX</p>
              <p>info@foreverclinic.co.kr</p>
            </div>
          </div>

          {/* Column 2: 시술 */}
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-bold text-white">시술</span>
            <div className="flex flex-col gap-2">
              {treatmentLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={`/${locale}${href}`}
                  className="text-[13px] text-[#706263] transition-colors hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 3: 브랜드 */}
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-bold text-white">브랜드</span>
            <div className="flex flex-col gap-2">
              {brandLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={`/${locale}${href}`}
                  className="text-[13px] text-[#706263] transition-colors hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Column 4: 미디어 */}
          <div className="flex flex-col gap-3">
            <span className="text-[14px] font-bold text-white">미디어</span>
            <div className="flex flex-col gap-2">
              {mediaLinks.map(({ label, href }) => (
                <a
                  key={href}
                  href={`/${locale}${href}`}
                  className="text-[13px] text-[#706263] transition-colors hover:text-white"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="my-8 h-px bg-[rgba(112,98,99,0.3)]" />

        {/* Copyright row */}
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[12px] text-[#706263]">
            © 2026 Forever Clinic. All rights reserved.
          </p>
          <div className="flex gap-3">
            {snsIcons.map(({ label, initial }) => (
              <span
                key={label}
                title={label}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-[11px] text-white/60 transition-colors hover:text-white"
              >
                {initial}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
