import Link from 'next/link';

interface VideoCardProps {
  href: string;
  thumbnailUrl?: string;
  title: string;
  views: string;
  target?: string;
  rel?: string;
}

function VideoCard({
  href,
  thumbnailUrl,
  title,
  views,
  target,
  rel,
}: VideoCardProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      data-ga-id={`video-card-${href.split('/').pop() ?? 'item'}`}
      className="group block w-[300px]"
    >
      <article className="overflow-hidden rounded-[8px] bg-white shadow-[0px_2px_2px_rgba(43,43,43,0.08)]">
        {/* Thumbnail with play button */}
        <div className="bg-forever-ivory relative h-[220px] w-full overflow-hidden">
          {thumbnailUrl && (
            <img
              src={thumbnailUrl}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-black/40 transition-colors group-hover:bg-black/60">
              <span className="text-[32px] leading-none text-white">
                &#9654;
              </span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="line-clamp-2 text-[14px] font-bold text-[#2b2b2b]">
            {title}
          </h3>
          <p className="mt-1 text-[12px] text-[#808080]">{views}</p>
        </div>
      </article>
    </Link>
  );
}

export { VideoCard, type VideoCardProps };
