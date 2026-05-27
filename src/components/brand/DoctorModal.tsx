'use client';

import { useEffect } from 'react';
import type { Doctor } from './DoctorCard';

interface DoctorModalProps {
  doctor: Doctor;
  onClose: () => void;
}

export function DoctorModal({ doctor, onClose }: DoctorModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[640px] flex-col overflow-hidden rounded-[12px] bg-white shadow-xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/10 transition-colors hover:bg-black/20"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Photo */}
        <div className="h-[220px] w-full shrink-0 sm:h-auto sm:w-[220px]">
          {doctor.photo ? (
            <img
              src={doctor.photo.src}
              alt={doctor.photo.alt}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="h-full w-full bg-[#efe5d9]" />
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4 overflow-y-auto p-6 sm:p-8">
          <div className="flex flex-col gap-1">
            {doctor.specialty && (
              <span className="text-[11px] font-medium tracking-[1.5px] text-[#d4c8bd]">
                {doctor.specialty}
              </span>
            )}
            <h3 className="text-[22px] leading-tight font-bold text-[#2b2b2b]">
              {doctor.name}
            </h3>
          </div>

          {doctor.careers && doctor.careers.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {doctor.careers.map((c, i) => (
                <li
                  key={i}
                  className="text-[13px] leading-relaxed text-[#3d3d3d]"
                >
                  {c}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
