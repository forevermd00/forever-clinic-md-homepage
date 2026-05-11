import { redirect } from 'next/navigation';

export default async function SignatureLegacyRedirect({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  redirect(`/${locale}/treatments/signature/${slug}`);
}
