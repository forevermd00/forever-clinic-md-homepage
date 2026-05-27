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
        className="relative flex max-h-[90vh] w-full max-w-[600px] flex-col overflow-hidden rounded-[12px] bg-white shadow-2xl sm:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button — top-right corner of card */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-sm bg-[#2b2b2b] text-white transition-colors hover:bg-[#444]"
        >
          <svg
            width="13"
            height="13"
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

        {/* Left — photo inset with padding */}
        <div className="flex shrink-0 items-center justify-center bg-white p-6 sm:w-[220px] sm:items-start">
          {doctor.photo ? (
            <img
              src={doctor.photo.src}
              alt={doctor.photo.alt}
              className="w-full max-w-[180px] rounded-[8px] object-cover sm:max-w-none"
            />
          ) : (
            <div className="h-[260px] w-full rounded-[8px] bg-[#efe5d9]" />
          )}
        </div>

        {/* Right — info */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Name block */}
          <div className="px-6 pt-8 pr-12 pb-5">
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
          <div className="mx-6 border-t border-[#e8e1db]" />

          {/* Career list */}
          {doctor.careers && doctor.careers.length > 0 && (
            <ul className="flex flex-col gap-2 px-6 py-5">
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
