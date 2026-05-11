import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function TreatmentCategoryPage({
  params,
}: {
  params: Promise<{ locale: string; category: string }>;
}) {
  const { locale, category } = await params;
  redirect(`/${locale}/treatments?cat=${category}`);
}
