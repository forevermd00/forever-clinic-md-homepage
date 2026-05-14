import { cn } from '@/lib/utils/cn';

interface Doctor {
  name: string;
  specialty: string;
  bio: string;
  careers?: string[];
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
      <div className="overflow-hidden">
        {doctor.photo ? (
          <img
            src={doctor.photo.src}
            alt={doctor.photo.alt}
            className="w-full object-contain"
          />
        ) : (
          <div className="h-[220px] w-full bg-[#efe5d9]" />
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-[18px] font-bold text-[#2b2b2b]">{doctor.name}</h3>
        <p className="mt-1 text-[13px] text-[#d4c8bd]">{doctor.specialty}</p>
        {doctor.careers && doctor.careers.length > 0 && (
          <ul className="mt-1 flex flex-col gap-0.5">
            {doctor.careers.slice(0, 3).map((c, i) => (
              <li
                key={i}
                className="text-[12px] leading-relaxed text-[#808080]"
              >
                {c}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export { DoctorCard, type DoctorCardProps, type Doctor };
