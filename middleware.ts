import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ko', 'en', 'zh', 'ja'],
  defaultLocale: 'ko',
  localeDetection: true,
});

export const config = {
  matcher: ['/((?!api|studio|_next|.*\\..*).*)'],
};
