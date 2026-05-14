import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

const locales = ['ko', 'en', 'zh', 'ja'] as const;
type Locale = (typeof locales)[number];

export default async function RootPage() {
  const headersList = await headers();
  const acceptLang = headersList.get('accept-language') ?? '';

  const langs = acceptLang
    .split(',')
    .map((l) => l.split(';')[0].trim().split('-')[0].toLowerCase());

  const locale = (langs.find((l) => locales.includes(l as Locale)) ??
    'en') as Locale;

  redirect(`/${locale}`);
}
