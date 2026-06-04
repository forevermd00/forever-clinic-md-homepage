'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

const NOT_FOUND_MESSAGES: Record<
  string,
  {
    title: string;
    desc: string;
    cta: string;
    treatments: string;
    contact: string;
  }
> = {
  ko: {
    title: '페이지를 찾을 수 없습니다',
    desc: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
    cta: '메인으로 돌아가기',
    treatments: '시술 안내',
    contact: '상담 문의',
  },
  en: {
    title: 'Page Not Found',
    desc: 'The page you requested does not exist or has been moved.',
    cta: 'Back to Home',
    treatments: 'Treatments',
    contact: 'Contact Us',
  },
  zh: {
    title: '页面未找到',
    desc: '您请求的页面不存在或已移动。',
    cta: '返回主页',
    treatments: '治疗项目',
    contact: '咨询联系',
  },
  ja: {
    title: 'ページが見つかりません',
    desc: 'リクエストされたページは存在しないか、移動されました。',
    cta: 'メインへ戻る',
    treatments: '施術案内',
    contact: 'お問い合わせ',
  },
};

const VALID_LOCALES = ['ko', 'en', 'zh', 'ja'];

export default function LocaleNotFound() {
  const params = useParams();
  const rawLocale = typeof params?.locale === 'string' ? params.locale : 'ko';
  const locale = VALID_LOCALES.includes(rawLocale) ? rawLocale : 'ko';
  const msg = NOT_FOUND_MESSAGES[locale];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-[#faf8f5] px-5 py-24 text-center">
      <p className="text-[120px] leading-none font-bold text-[#efe5d9] select-none">
        404
      </p>
      <h1 className="mt-4 text-[24px] font-bold text-[#2b2b2b]">{msg.title}</h1>
      <p className="mt-2 text-[14px] text-[#808080]">{msg.desc}</p>
      <Link
        href={`/${locale}`}
        data-ga-id="notfound-home"
        className="mt-8 inline-flex items-center justify-center rounded-[4px] bg-[#a83c44] px-8 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#8f3039]"
      >
        {msg.cta}
      </Link>
      <div className="mt-6 flex gap-6">
        <Link
          href={`/${locale}/treatments`}
          data-ga-id="notfound-treatments"
          className="text-[14px] text-[#a83c44] underline underline-offset-2 transition-colors hover:text-[#8f3039]"
        >
          {msg.treatments}
        </Link>
        <Link
          href={`/${locale}/contact`}
          data-ga-id="notfound-contact"
          className="text-[14px] text-[#a83c44] underline underline-offset-2 transition-colors hover:text-[#8f3039]"
        >
          {msg.contact}
        </Link>
      </div>
    </div>
  );
}
