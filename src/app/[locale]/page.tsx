import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('common');

  return (
    <main className="bg-forever-ivory flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-forever-charcoal text-4xl font-bold">
        Forever Clinic Myeongdong
      </h1>
      <p className="mt-4 text-neutral-600">{t('loading')}</p>
    </main>
  );
}
