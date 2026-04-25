import Link from 'next/link';

const treatmentLinks = [
  { label: '리프팅', href: '/treatments/lifting' },
  { label: '피부케어', href: '/treatments/skincare' },
  { label: '토닝·색소', href: '/treatments/toning' },
  { label: '보톡스·필러', href: '/treatments/botox-filler' },
];

const brandLinks = [
  { label: '브랜드 스토리', href: '/brand' },
  { label: '의료진 소개', href: '/brand#doctors' },
  { label: '시설 안내', href: '/brand#facilities' },
  { label: '오시는 길', href: '/brand#location' },
];

const mediaLinks = [
  { label: '공지사항', href: '/media/notice' },
  { label: '이벤트', href: '/promotions' },
  { label: '예약 상담', href: '/contact' },
  { label: '개인정보처리방침', href: '/privacy' },
];

const snsIcons = [
  { label: 'IG', title: 'Instagram' },
  { label: 'YT', title: 'YouTube' },
  { label: 'WC', title: 'WeChat' },
  { label: 'B', title: 'Blog' },
];

interface FooterProps {
  locale?: string;
}

export function Footer({ locale = 'ko' }: FooterProps) {
  return (
    <footer className="bg-[#2b2b2b]">
      <div className="mx-auto max-w-[1440px] px-6 pt-16 pb-8 md:px-12">
        {/* 4-column flex layout matching Figma */}
        <div className="flex flex-col gap-10 md:flex-row md:gap-12">
          {/* Column 1: Clinic Info */}
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            <div className="text-[16px] leading-normal font-bold tracking-[1.5px] text-white">
              <p>FOREVER CLINIC</p>
              <p>MYEONGDONG</p>
            </div>
            <div className="flex flex-col gap-0.5 text-[13px] leading-[22px] text-[#706263]">
              <p>서울시 중구 명동길 00</p>
              <p>02-0000-0000</p>
              <p>contact@forever-clinic.kr</p>
            </div>
          </div>

          {/* Column 2: 시술 */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-[14px] font-bold text-white">시술</span>
            {treatmentLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-[13px] text-[#706263] transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Column 3: 브랜드 */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-[14px] font-bold text-white">브랜드</span>
            {brandLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-[13px] text-[#706263] transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Column 4: 미디어 */}
          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <span className="text-[14px] font-bold text-white">미디어</span>
            {mediaLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={`/${locale}${href}`}
                className="text-[13px] text-[#706263] transition-colors hover:text-white"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-10 h-px w-full bg-[rgba(112,98,99,0.3)]" />

        {/* Copyright row */}
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <p className="text-[12px] text-[#706263]">
            © 2026 Forever Clinic. All rights reserved.
          </p>
          <div className="flex gap-2.5">
            {snsIcons.map(({ label, title }) => (
              <span
                key={label}
                title={title}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/20 text-[11px] font-medium tracking-[0.5px] text-white/60 transition-colors hover:border-white/40 hover:text-white"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
