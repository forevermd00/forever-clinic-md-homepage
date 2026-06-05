import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { SignatureProgram } from '@/lib/data/signaturePrograms';

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
  const tc = await getTranslations('common');
  const inquireText = tc('inquire');
  const viewMoreText = tc('viewMore');

  if (!programs || programs.length === 0) return null;

  return (
    <section className="bg-[#1a1a1a]" data-ga-section="home-signature">
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

        {/* 카드 목록 — 고정 너비, vw에 따라 자동 줄바꿈 */}
        <div className="mx-auto w-full max-w-[1272px]">
          <div
            className="grid justify-center gap-4"
            style={{ gridTemplateColumns: 'repeat(auto-fill, 280px)' }}
          >
            {programs.map((program) => (
              <ProgramCard
                key={program._id}
                program={program}
                locale={locale}
                showPrice={showPrice}
                inquireText={inquireText}
                viewMoreText={viewMoreText}
              />
            ))}
          </div>
        </div>

        {/* 전체 CTA */}
        <Link
          href={`/${locale}/contact`}
          data-ga-id="home-signature.cta-all"
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
  inquireText,
  viewMoreText,
}: {
  program: SignatureProgram;
  locale: string;
  showPrice?: boolean;
  inquireText: string;
  viewMoreText: string;
}) {
  function formatPrice(won: number | null | undefined): string {
    if (won == null) return inquireText;
    const n = won.toLocaleString('ko-KR');
    return locale === 'ko' ? `${n}원` : `₩${n}`;
  }

  const category = program.category || 'signature';
  const href = program.slug
    ? `/${locale}/treatments/${category}/${program.slug}`
    : `/${locale}/contact`;

  const hasDiscount =
    (program.discountRate ?? 0) > 0 &&
    program.discountedPrice > 0 &&
    program.discountedPrice < program.originalPrice;

  return (
    <Link
      href={href}
      data-ga-id={`home-signature.card-${program.slug ?? program._id}`}
      className="group flex flex-col gap-3 rounded-[10px] border border-white/10 bg-white/5 p-5 transition-all duration-200 hover:scale-[1.02] hover:border-white/30 hover:bg-white/10"
    >
      {/* 할인 뱃지 (할인 적용 시에만) */}
      {hasDiscount && (
        <span className="w-fit rounded-[4px] bg-[#a83c44] px-2 py-1 text-[11px] font-bold text-white">
          {program.discountRate}% OFF
        </span>
      )}

      {/* 프로그램명 */}
      <h3 className="text-[15px] leading-snug font-bold text-white">
        {program.name}
      </h3>

      {/* 포지션 설명 */}
      <p className="text-[12px] text-white/60">{program.position}</p>

      {/* 가격 */}
      {showPrice && (
        <div className="mt-auto flex flex-col gap-0.5 pt-2">
          {hasDiscount && (
            <span className="text-[12px] text-white/30 line-through">
              {formatPrice(program.originalPrice)}
            </span>
          )}
          <span className="text-[16px] font-bold text-[#a83c44]">
            {formatPrice(
              hasDiscount ? program.discountedPrice : program.originalPrice,
            )}
          </span>
        </div>
      )}

      <p className="mt-1 text-[12px] font-medium text-white/30 transition-colors group-hover:text-white/60">
        {viewMoreText} &rarr;
      </p>
    </Link>
  );
}
