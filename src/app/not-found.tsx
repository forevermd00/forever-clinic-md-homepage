import Link from 'next/link';

const LOCALE_LINKS = [
  { locale: 'ko', label: '한국어' },
  { locale: 'en', label: 'English' },
  { locale: 'zh', label: '中文' },
  { locale: 'ja', label: '日本語' },
];

export default function RootNotFound() {
  return (
    <html lang="ko">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#faf8f5] px-5 py-24 text-center">
          <p className="text-[120px] leading-none font-bold text-[#efe5d9] select-none">
            404
          </p>
          <h1 className="mt-4 text-[24px] font-bold text-[#2b2b2b]">
            페이지를 찾을 수 없습니다
          </h1>
          <p className="mt-2 text-[14px] text-[#808080]">
            요청하신 페이지가 존재하지 않거나 이동되었습니다.
          </p>
          <Link
            href="/ko"
            data-ga-id="error-notfound.home"
            className="mt-8 inline-flex items-center justify-center rounded-[4px] bg-[#a83c44] px-8 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#8f3039]"
          >
            메인으로 돌아가기
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {LOCALE_LINKS.map(({ locale, label }) => (
              <Link
                key={locale}
                href={`/${locale}`}
                data-ga-id={`error-notfound.locale-${locale}`}
                className="text-[14px] text-[#a83c44] underline underline-offset-2 transition-colors hover:text-[#8f3039]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </body>
    </html>
  );
}
