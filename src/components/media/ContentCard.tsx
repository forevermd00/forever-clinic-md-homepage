import Link from 'next/link';

interface ContentCardProps {
  href: string;
  imageUrl?: string;
  date: string;
  title: string;
  description: string;
  views?: number;
  /** 'cover'(기본·꽉 채워 크롭) | 'contain'(이미지 전체가 다 보이게) */
  imageFit?: 'cover' | 'contain';
}

function ContentCard({
  href,
  imageUrl,
  date,
  title,
  description,
  views,
  imageFit = 'cover',
}: ContentCardProps) {
  return (
    <Link
      href={href}
      data-ga-id={`media-card.link-${href.split('/').pop() ?? 'item'}`}
      className="group block w-[300px]"
    >
      <article className="overflow-hidden rounded-[8px] bg-white shadow-[0px_2px_2px_rgba(43,43,43,0.08)]">
        {/* Image placeholder */}
        <div className="bg-forever-ivory h-[200px] w-full overflow-hidden rounded-[8px]">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className={`h-full w-full transition-transform duration-300 group-hover:scale-105 ${
                imageFit === 'contain' ? 'object-contain' : 'object-cover'
              }`}
            />
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="line-clamp-2 text-[15px] font-bold text-[#2b2b2b]">
            {title}
          </h3>
          <time className="mt-1.5 block text-[11px] text-[#808080]">
            {date}
          </time>
          <p className="mt-1.5 line-clamp-2 text-[13px] text-[#808080]">
            {description}
          </p>
          {views !== undefined && (
            <div className="mt-2 text-[11px] text-[#b0b0b0]">
              {views.toLocaleString()} views
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

export { ContentCard, type ContentCardProps };
