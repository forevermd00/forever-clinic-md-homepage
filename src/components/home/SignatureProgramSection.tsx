import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { SignatureProgram } from '@/lib/data/signaturePrograms';

function formatPrice(won: number | null | undefined): string {
  if (won == null) return '문의';
  return won.toLocaleString('ko-KR') + '원';
}

interface SignatureProgramSectionProps {
  locale?: string;
  programs: SignatureProgram[];
  showPrice?: boolean;
}

export async function SignatureProgramSection({
  locale = 'ko',
  programs,
  showPrice = true,
}: SignatureProgramSectionProps) {
  const t = await getTranslations('home');

  if (!programs || programs.length === 0) return null;

  return (
    <section className="bg-[#1a1a1a]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-10 px-5 py-16 md:px-10 lg:px-12">
        {/* 섹션 헤더 */}
        <div className="flex flex-col items-center gap-2 text-center">
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#a83c44] uppercase">
            {t('signatureLabel')}
          </span>
          <h2 className="text-[26px] leading-tight font-bold text-white md:text-[32px]">
            {t('signatureTitle')}
          </h2>
        </div>

        {/* 카드 목록 — 모바일: 가로 스크롤, 데스크탑: 그리드 */}
        <div className="w-full">
          {/* 모바일 가로 스크롤 */}
          <div className="flex gap-4 overflow-x-auto pb-2 md:hidden">
            {programs.map((program) => (
              <ProgramCard
                key={program._id}
                program={program}
                locale={locale}
                showPrice={showPrice}
              />
            ))}
          </div>

          {/* 데스크탑 3+2 그리드 */}
          <div className="hidden md:flex md:flex-col md:gap-4">
            <div className="grid grid-cols-3 gap-4">
              {programs.slice(0, 3).map((program) => (
                <ProgramCard
                  key={program._id}
                  program={program}
                  locale={locale}
                  showPrice={showPrice}
                />
              ))}
            </div>
            {programs.length > 3 && (
              <div className="grid grid-cols-2 gap-4 md:mx-auto md:w-2/3">
                {programs.slice(3).map((program) => (
                  <ProgramCard
                    key={program._id}
                    program={program}
                    locale={locale}
                    showPrice={showPrice}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 전체 CTA */}
        <Link
          href={`/${locale}/contact`}
          className="rounded-[24px] bg-[#a83c44] px-8 py-3 text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t('signatureCtaAll')}
        </Link>
      </div>
    </section>
  );
}

function ProgramCard({
  program,
  locale,
  showPrice = true,
}: {
  program: SignatureProgram;
  locale: string;
  showPrice?: boolean;
}) {
  const category = program.category ?? 'signature';
  const href = program.slug
    ? `/${locale}/treatments/${category}/${program.slug}`
    : `/${locale}/contact`;

  return (
    <Link
      href={href}
      className="group flex min-w-[260px] flex-shrink-0 flex-col gap-3 rounded-[10px] border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:scale-[1.02] hover:border-white/30 hover:bg-white/10 md:min-w-0 md:flex-shrink"
    >
      {/* 할인 뱃지 */}
      <span className="w-fit rounded-[4px] bg-[#a83c44] px-2 py-1 text-[11px] font-bold text-white">
        {program.discountRate}% OFF
      </span>

      {/* 프로그램명 */}
      <h3 className="text-[15px] leading-snug font-bold text-white">
        {program.name}
      </h3>

      {/* 포지션 설명 */}
      <p className="text-[12px] text-white/60">{program.position}</p>

      {/* 타깃 키워드 */}
      <p className="text-[12px] leading-relaxed text-white/40">
        {program.keywords}
      </p>

      {/* 가격 */}
      {showPrice && (
        <div className="mt-auto flex flex-col gap-0.5 pt-2">
          <span className="text-[12px] text-white/30 line-through">
            {formatPrice(program.originalPrice)}
          </span>
          <span className="text-[16px] font-bold text-[#a83c44]">
            {formatPrice(program.discountedPrice)}
          </span>
        </div>
      )}

      {/* 자세히 보기 */}
      <p className="mt-1 text-[12px] font-medium text-white/30 transition-colors group-hover:text-white/60">
        자세히 보기 &rarr;
      </p>
    </Link>
  );
}
