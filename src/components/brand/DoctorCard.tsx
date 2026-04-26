import { cn } from '@/lib/utils/cn';

interface Doctor {
  name: string;
  specialty: string;
  bio: string;
  photo?: { src: string; alt: string };
}

interface DoctorCardProps {
  doctor: Doctor;
  className?: string;
}

function DoctorCard({ doctor, className }: DoctorCardProps) {
  return (
    <div
      className={cn(
        'max-w-[282px] overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-card)]',
        className,
      )}
    >
      {/* Photo */}
      <div className="h-[220px] overflow-hidden">
        {doctor.photo ? (
          <img
            src={doctor.photo.src}
            alt={doctor.photo.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[#efe5d9]" />
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-[18px] font-bold text-[#2b2b2b]">{doctor.name}</h3>
        <p className="mt-1 text-[13px] text-[#d4c8bd]">{doctor.specialty}</p>
        <p className="mt-2 text-[13px] leading-relaxed text-[#808080]">
          {doctor.bio}
        </p>
      </div>
    </div>
  );
}

export { DoctorCard, type DoctorCardProps, type Doctor };
