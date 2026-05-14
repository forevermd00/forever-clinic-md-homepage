import { type NextRequest, NextResponse } from 'next/server';

const locales = ['ko', 'en', 'zh', 'ja'] as const;
type Locale = (typeof locales)[number];

export function GET(request: NextRequest) {
  const acceptLang = request.headers.get('accept-language') ?? '';
  const langs = acceptLang
    .split(',')
    .map((l) => l.split(';')[0].trim().split('-')[0].toLowerCase());
  const locale = (langs.find((l) => locales.includes(l as Locale)) ??
    'en') as Locale;

  const response = NextResponse.redirect(
    new URL(`/${locale}`, request.url),
    307,
  );
  response.headers.set('Vary', 'Accept-Language');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
