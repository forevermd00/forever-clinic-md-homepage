import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils/cn';

const navLinks = [
  { key: 'treatments', href: '/treatments' },
  { key: 'brand', href: '/brand' },
  { key: 'beforeAfter', href: '/before-after' },
  { key: 'media', href: '/media' },
] as const;

const messengerIcons = [
  { label: 'KakaoTalk', initial: 'K' },
  { label: 'LINE', initial: 'L' },
  { label: 'WeChat', initial: 'W' },
  { label: 'WhatsApp', initial: 'W' },
] as const;

const snsIcons = [
  { label: 'Instagram', initial: 'I' },
  { label: 'YouTube', initial: 'Y' },
  { label: 'Blog', initial: 'B' },
] as const;

const languages = [
  { code: 'ko', label: 'KR' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: 'CN' },
  { code: 'ja', label: 'JP' },
] as const;

function IconCircle({ initial, label }: { initial: string; label: string }) {
  return (
    <span
      title={label}
      className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-neutral-700 text-[16px] font-bold text-white transition-colors hover:bg-neutral-600"
    >
      {initial}
    </span>
  );
}

interface FooterProps {
  locale?: string;
  className?: string;
}

export function Footer({ locale = 'ko', className }: FooterProps) {
  const t = useTranslations('header');
  const tFooter = useTranslations('footer');

  return (
    <footer className={cn('bg-forever-charcoal text-white', className)}>
      <div className="mx-auto max-w-[var(--container-max)] px-6 pt-12 pb-8 lg:px-[120px]">
        {/* Top Row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <span className="text-[18px] font-bold">Forever Clinic</span>

          <nav className="flex flex-wrap gap-6">
            {navLinks.map(({ key, href }) => (
              <a
                key={key}
                href={`/${locale}${href}`}
                className="text-[14px] text-neutral-400 transition-colors hover:text-white"
              >
                {t(key)}
              </a>
            ))}
          </nav>

          <div className="flex gap-3">
            {languages.map(({ code, label }) => (
              <a
                key={code}
                href={`/${code}`}
                className={cn(
                  'text-[13px] font-semibold transition-colors',
                  code === locale
                    ? 'text-white'
                    : 'text-neutral-500 hover:text-white',
                )}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="my-6 h-px bg-neutral-700" />

        {/* Icon Row */}
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-4">
            {messengerIcons.map(({ label, initial }) => (
              <IconCircle key={label} initial={initial} label={label} />
            ))}
          </div>
          <div className="flex gap-4">
            {snsIcons.map(({ label, initial }) => (
              <IconCircle key={label} initial={initial} label={label} />
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="mt-6 space-y-1.5 text-[12px] text-neutral-500">
          <p>포에버 의원 명동점 | 대표: OOO | 사업자등록번호: XXX-XX-XXXXX</p>
          <p>{tFooter('copyright')}</p>
          <div className="flex gap-4 pt-2">
            <a href={`/${locale}/privacy`} className="hover:text-white">
              {tFooter('privacy')}
            </a>
            <a href={`/${locale}/terms`} className="hover:text-white">
              {tFooter('terms')}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
