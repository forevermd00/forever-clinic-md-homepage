import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from './src/lib/i18n/config';

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!api|studio|_next|.*\\..*).*)'],
};
