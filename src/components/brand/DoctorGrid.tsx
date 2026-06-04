'use client';

import { useState } from 'react';
import { DoctorCard, type Doctor } from './DoctorCard';
import { DoctorModal } from './DoctorModal';

interface DoctorGridProps {
  doctors: Doctor[];
}

export function DoctorGrid({ doctors }: DoctorGridProps) {
  const [selected, setSelected] = useState<Doctor | null>(null);

  return (
    <>
      <div className="flex flex-wrap justify-center gap-6">
        {doctors.map((doctor) => (
          <button
            key={doctor.name}
            onClick={() => setSelected(doctor)}
            data-ga-id={`doctor-card-${doctor.name.replace(/\s+/g, '-').toLowerCase()}`}
            className="cursor-pointer text-left transition-transform hover:scale-[1.02]"
          >
            <DoctorCard doctor={doctor} />
          </button>
        ))}
      </div>

      {selected && (
        <DoctorModal doctor={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}
