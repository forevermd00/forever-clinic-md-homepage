import Link from 'next/link';

interface ContentCardProps {
  href: string;
  imageUrl?: string;
  date: string;
  title: string;
  description: string;
}

function ContentCard({
  href,
  imageUrl,
  date,
  title,
  description,
}: ContentCardProps) {
  return (
    <Link href={href} className="group block w-[300px]">
      <article className="overflow-hidden rounded-[8px] bg-white shadow-[0px_2px_2px_rgba(43,43,43,0.08)]">
        {/* Image placeholder */}
        <div className="bg-forever-ivory h-[200px] w-full overflow-hidden rounded-[8px]">
          {imageUrl && (
            <img
              src={imageUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
        </div>
      </article>
    </Link>
  );
}

export { ContentCard, type ContentCardProps };
