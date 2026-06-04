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
      {/* Card — fixed height on desktop so career list can scroll within it */}
      <div
        className="relative flex w-full max-w-[600px] flex-col overflow-hidden rounded-[12px] bg-white shadow-2xl sm:h-[440px] sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="닫기"
          data-ga-id="doctor-modal-close"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center text-[#888] transition-colors hover:text-[#222]"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Left — photo inset, vertically centered */}
        <div className="flex h-[240px] w-full shrink-0 items-center justify-center p-5 sm:h-full sm:w-[250px]">
          {doctor.photo ? (
            <img
              src={doctor.photo.src}
              alt={doctor.photo.alt}
              className="h-full w-full rounded-[8px] object-cover object-top"
            />
          ) : (
            <div className="h-full w-full rounded-[8px] bg-[#efe5d9]" />
          )}
        </div>

        {/* Right — fixed height column, career scrolls inside */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden sm:h-full sm:pb-5">
          {/* Name block */}
          <div className="shrink-0 px-6 pt-8 pr-12 pb-5">
            {doctor.specialty && (
              <span className="mb-1 block text-[11px] font-medium tracking-[1.5px] text-[#d4c8bd]">
                {doctor.specialty}
              </span>
            )}
            <h3 className="text-[22px] leading-tight font-bold text-[#2b2b2b]">
              {doctor.name}
            </h3>
          </div>

          {/* Divider */}
          <div className="mx-6 shrink-0 border-t border-[#e8e1db]" />

          {/* Career list — fills remaining height, scrolls */}
          {doctor.careers && doctor.careers.length > 0 && (
            <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-4 pb-4">
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
