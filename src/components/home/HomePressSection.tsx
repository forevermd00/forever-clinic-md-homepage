import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { urlFor } from '@/lib/sanity/image';
import { ContentCard } from '@/components/media/ContentCard';

interface PressItem {
  _id: string;
  title?: string;
  excerpt?: string;
  publisher?: string;
  publishedAt?: string;
  thumbnail?: unknown;
}

interface HomePressProps {
  locale: string;
  items: PressItem[];
}

function formatDate(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export function HomePressSection({ locale, items }: HomePressProps) {
  const t = useTranslations('home');
  const tm = useTranslations('media');

  if (!items || items.length === 0) return null;

  return (
    <section className="bg-[#faf8f5]">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col items-center gap-8 px-5 py-12 md:px-10 lg:px-12">
        <div className="flex w-full flex-col items-center gap-1">
          <p className="text-[12px] font-semibold tracking-widest text-[#a83c44] uppercase">
            {tm('press')}
          </p>
          <h2 className="text-[28px] font-bold text-[#2b2b2b]">
            {t('pressTitle')}
          </h2>
        </div>

        <div
          className="grid w-full max-w-[1272px] justify-center gap-6"
          style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}
        >
          {items.map((item) => (
            <ContentCard
              key={item._id}
              href={`/${locale}/media/press/${item._id}`}
              imageUrl={
                item.thumbnail
                  ? (urlFor(item.thumbnail)?.width(600).height(400).url() ??
                    undefined)
                  : undefined
              }
              date={formatDate(item.publishedAt)}
              title={item.title || ''}
              description={item.excerpt || item.publisher || ''}
            />
          ))}
        </div>

        <Link
          href={`/${locale}/media/press`}
          className="rounded-[4px] border border-[#efe5d9] px-6 py-3 text-[14px] font-medium text-[#2b2b2b] transition-colors hover:bg-[#2b2b2b]/5"
        >
          {t('pressViewMore')} &rarr;
        </Link>
      </div>
    </section>
  );
}
