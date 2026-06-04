'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export interface PopupItem {
  _id: string;
  title?: string;
  image?: unknown;
  linkUrl?: string;
}

interface EventPopupModalProps {
  popups: PopupItem[];
  imageUrls: string[];
}

function getTodayKey(): string {
  return `forever-popup-dismissed-${new Date().toISOString().split('T')[0]}`;
}

const SESSION_KEY = 'forever-popup-seen';

export function EventPopupModal({ popups, imageUrls }: EventPopupModalProps) {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissToday, setDismissToday] = useState(false);

  useEffect(() => {
    if (!popups.length) return;
    if (typeof window === 'undefined') return;

    const todayKey = getTodayKey();
    if (localStorage.getItem(todayKey) === '1') return;
    if (sessionStorage.getItem(SESSION_KEY) === '1') return;

    sessionStorage.setItem(SESSION_KEY, '1');
    const timer = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(timer);
  }, [popups.length]);

  const handleClose = useCallback(() => {
    if (dismissToday) {
      localStorage.setItem(getTodayKey(), '1');
    }
    setVisible(false);
  }, [dismissToday]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + popups.length) % popups.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % popups.length);
  };

  if (!visible || popups.length === 0) return null;

  const current = popups[currentIndex];
  const imageUrl = imageUrls[currentIndex] ?? '';
  const showArrows = popups.length > 1;

  const imageContent = (
    <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={current.title ?? ''}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[#efe5d9]">
          <span className="text-[13px] text-[#9c8e87]">{current.title}</span>
        </div>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      data-ga-section="event-popup"
      onClick={handleClose}
    >
      <div
        className="relative w-full overflow-hidden rounded-[8px] bg-white"
        style={{ maxWidth: 480 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          data-ga-id="event-popup-close"
          className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/40 text-white transition-colors hover:bg-black/60"
          aria-label={t('close')}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* 이미지 (링크 여부에 따라 분기) */}
        {current.linkUrl ? (
          <Link
            href={current.linkUrl}
            data-ga-id={`event-popup-image-link-${current._id}`}
            onClick={handleClose}
          >
            {imageContent}
          </Link>
        ) : (
          imageContent
        )}

        {/* 이전/다음 버튼 */}
        {showArrows && (
          <>
            <button
              onClick={handlePrev}
              data-ga-id="event-popup-prev"
              className="absolute top-1/2 left-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
              aria-label={t('previous')}
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
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              data-ga-id="event-popup-next"
              className="absolute top-1/2 right-2 z-10 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50"
              aria-label={t('next')}
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
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </>
        )}

        {/* 하단: dots + 오늘 다시 열지 않음 */}
        <div className="flex items-center justify-between px-4 py-3">
          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {popups.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                data-ga-id={`event-popup-dot-${idx}`}
                className="rounded-full transition-all"
                style={{
                  width: idx === currentIndex ? 20 : 8,
                  height: 8,
                  backgroundColor: idx === currentIndex ? '#2b2b2b' : '#d4c8bd',
                }}
                aria-label={t('popupSlide', { n: idx + 1 })}
              />
            ))}
          </div>

          {/* 오늘 다시 열지 않음 */}
          <label className="flex cursor-pointer items-center gap-1.5">
            <input
              type="checkbox"
              checked={dismissToday}
              onChange={(e) => setDismissToday(e.target.checked)}
              className="sr-only"
            />
            <span
              className="flex size-[16px] shrink-0 items-center justify-center rounded-[3px] border transition-colors"
              style={
                dismissToday
                  ? { backgroundColor: '#2b2b2b', borderColor: '#2b2b2b' }
                  : { borderColor: '#d4c8bd', backgroundColor: 'white' }
              }
            >
              {dismissToday && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path
                    d="M2 5L4.2 7.5L8 3"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <span className="text-[12px] text-[#706263]">
              {t('dismissToday')}
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
