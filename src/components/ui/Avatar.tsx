import { cn } from '@/lib/utils/cn';

type AvatarShape = 'circle' | 'square';
type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  shape?: AvatarShape;
  size?: AvatarSize;
  initial?: string;
  src?: string;
  alt?: string;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  sm: 'size-8',
  md: 'size-12',
  lg: 'size-16',
  xl: 'size-24',
};

const initialSizes: Record<AvatarSize, string> = {
  sm: 'text-[11px]',
  md: 'text-[17px]',
  lg: 'text-[22px]',
  xl: 'text-[34px]',
};

function Avatar({
  shape = 'circle',
  size = 'md',
  initial,
  src,
  alt = '',
  className,
}: AvatarProps) {
  const shapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-lg';

  return (
    <div
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden',
        'bg-forever-beige border border-neutral-200',
        sizeStyles[size],
        shapeClass,
        className,
      )}
    >
      {src ? (
        <img src={src} alt={alt} className="size-full object-cover" />
      ) : (
        <span
          className={cn(
            'font-semibold text-neutral-500 select-none',
            initialSizes[size],
          )}
        >
          {initial}
        </span>
      )}
    </div>
  );
}

export { Avatar, type AvatarProps, type AvatarShape, type AvatarSize };
