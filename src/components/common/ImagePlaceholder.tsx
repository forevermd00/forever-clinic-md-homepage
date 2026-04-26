import { cn } from '@/lib/utils/cn';

interface ImagePlaceholderProps {
  label?: string;
  variant?: 'warm' | 'cool' | 'neutral';
  className?: string;
}

function ImagePlaceholder({
  label,
  variant = 'warm',
  className,
}: ImagePlaceholderProps) {
  const gradients = {
    warm: 'bg-gradient-to-br from-[#efe5d9] via-[#e8ddd0] to-[#d4c7bd]',
    cool: 'bg-gradient-to-br from-[#e8ddd0] via-[#d5cabe] to-[#c4b7a9]',
    neutral: 'bg-gradient-to-br from-[#f3eee6] via-[#efe5d9] to-[#e0d2b6]',
  };

  return (
    <div
      className={cn(
        'flex items-center justify-center overflow-hidden',
        gradients[variant],
        className,
      )}
    >
      {label && (
        <span className="text-center text-[13px] font-medium whitespace-pre-line text-[#b3a89c] select-none">
          {label}
        </span>
      )}
    </div>
  );
}

export { ImagePlaceholder, type ImagePlaceholderProps };
