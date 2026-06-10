import { permanentRedirect } from 'next/navigation';
import { getSectionVisibility } from '@/lib/data/visibility';
import { getFirstVisibleMediaTab } from '@/lib/data/mediaRedirect';

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function MediaPage({ params }: PageProps) {
  const { locale } = await params;
  const visibility = await getSectionVisibility();
  if (!visibility.nav.media) {
    permanentRedirect(`/${locale}`);
  }
  const firstTab = getFirstVisibleMediaTab(
    visibility.media,
    visibility.mediaOrder,
  );
  permanentRedirect(`/${locale}/media/${firstTab ?? 'press'}`);
}
