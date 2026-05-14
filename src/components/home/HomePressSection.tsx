import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { urlFor } from '@/lib/sanity/image';

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

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const thumbUrl = item.thumbnail
              ? urlFor(item.thumbnail)?.width(600).height(400).url()
              : null;
            return (
              <Link
                key={item._id}
                href={`/${locale}/media/press/${item._id}`}
                className="group flex flex-col overflow-hidden rounded-[8px] border border-[#efe5d9] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-md"
              >
                {thumbUrl ? (
                  <div className="h-[200px] overflow-hidden">
                    <img
                      src={thumbUrl}
                      alt={item.title || ''}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="h-[200px] bg-[#f3eee6]" />
                )}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <div className="flex items-center gap-2 text-[11px] text-[#a08080]">
                    {item.publisher && <span>{item.publisher}</span>}
                    {item.publisher && item.publishedAt && <span>·</span>}
                    {item.publishedAt && (
                      <span>{formatDate(item.publishedAt)}</span>
                    )}
                  </div>
                  <p className="line-clamp-2 text-[15px] leading-snug font-semibold text-[#2b2b2b]">
                    {item.title || ''}
                  </p>
                  {item.excerpt && (
                    <p className="line-clamp-2 text-[13px] leading-relaxed text-[#706263]">
                      {item.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
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
