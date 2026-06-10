import Link from 'next/link';
import type { EventListItem } from '@/lib/data/events';

function fmtDate(d?: string): string {
  if (!d) return '';
  return d.slice(0, 10).replace(/-/g, '.');
}

export function EventCard({
  event,
  locale,
  periodLabel,
}: {
  event: EventListItem;
  locale: string;
  periodLabel: string;
}) {
  const period =
    event.startDate || event.endDate
      ? `${fmtDate(event.startDate)} ~ ${fmtDate(event.endDate)}`
      : '';

  return (
    <Link
      href={`/${locale}/event/${event.uid}`}
      data-ga-id={`event-card.${event.uid}`}
      className="group flex flex-col overflow-hidden rounded-[12px] border border-[#ece3d8] bg-white transition-shadow hover:shadow-[0_8px_28px_rgba(0,0,0,0.08)]"
    >
      <div
        className="relative w-full overflow-hidden bg-[#faf8f5]"
        style={{ aspectRatio: '16/10' }}
      >
        {event.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.thumbnailUrl}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[13px] text-[#bcae9f]">{event.title}</span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        {period && (
          <p className="text-[11px] font-medium tracking-[0.02em] text-[#a83c44]">
            {periodLabel} {period}
          </p>
        )}
        <h3 className="text-[16px] font-bold text-[#2b2b2b]">{event.title}</h3>
        {event.oneLineDescription && (
          <p className="line-clamp-2 text-[13px] leading-[1.6] text-[#706263]">
            {event.oneLineDescription}
          </p>
        )}
      </div>
    </Link>
  );
}
