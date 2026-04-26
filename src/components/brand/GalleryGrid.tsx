import { cn } from '@/lib/utils/cn';

interface GalleryItem {
  id: string;
  name?: string;
  image?: { src: string; alt: string };
}

interface GalleryGridProps {
  items: GalleryItem[];
  className?: string;
}

function GalleryGrid({ items, className }: GalleryGridProps) {
  return (
    <div
      className={cn(
        'scrollbar-hide flex gap-4 overflow-x-auto pb-4',
        className,
      )}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="h-[225px] w-[300px] shrink-0 overflow-hidden rounded-[8px]"
        >
          {item.image ? (
            <img
              src={item.image.src}
              alt={item.image.alt}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#efe5d9]">
              {item.name && (
                <span className="text-[13px] text-[#808080]">{item.name}</span>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export { GalleryGrid, type GalleryGridProps, type GalleryItem };
