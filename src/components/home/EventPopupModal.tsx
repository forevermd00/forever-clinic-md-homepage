'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export interface PopupItem {
  _id: string;
  uid?: string;
  title?: string;
  /** PC 팝업 이미지 URL (pc → legacy → mobile 폴백) */
  pcImageUrl?: string;
  /** 모바일 팝업 이미지 URL (mobile → legacy → pc 폴백) */
  mobileImageUrl?: string;
  /** uid가 없는 레거시 팝업의 직접 링크 (폴백) */
  linkUrl?: string;
}

interface EventPopupModalProps {
  popups: PopupItem[];
  locale: string;
}

function getTodayKey(): string {
  return `forever-popup-dismissed-${new Date().toISOString().split('T')[0]}`;
}

export function EventPopupModal({ popups, locale }: EventPopupModalProps) {
  const t = useTranslations('common');
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!popups.length) return;
    if (typeof window === 'undefined') return;

    // "하루 동안 보지 않기"를 체크하고 닫은 경우(localStorage 당일 키)에만 숨김.
    // 그 외에는 메인 진입/새로고침마다 항상 표시한다.
    const todayKey = getTodayKey();
    if (localStorage.getItem(todayKey) === '1') return;

    const timer = setTimeout(() => setVisible(true), 0);
    return () => clearTimeout(timer);
  }, [popups.length]);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  // "하루 동안 보지 않기": 누르면 즉시 닫히고 당일 다시 안 뜸
  const handleDismissToday = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(getTodayKey(), '1');
    }
    setVisible(false);
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + popups.length) % popups.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % popups.length);
  };

  // uid가 있으면 상세페이지, 없으면 레거시 linkUrl 폴백
  const slideHref = (p: PopupItem) =>
    p.uid ? `/${locale}/event/${p.uid}` : p.linkUrl || '';

  // 드래그/스와이프 슬라이드 (웹·모바일 공통, Pointer 이벤트)
  const viewportRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const [dragging, setDragging] = useState(false);
  const [dragPx, setDragPx] = useState(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (popups.length <= 1) return;
    startXRef.current = e.clientX;
    movedRef.current = false;
    draggingRef.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - startXRef.current;
    if (Math.abs(dx) > 8) movedRef.current = true;
    setDragPx(dx);
  };
  const endDrag = () => {
    if (!draggingRef.current) return;
    const w = viewportRef.current?.offsetWidth ?? 1;
    const dx = dragPx;
    const moved = movedRef.current;
    draggingRef.current = false;
    setDragging(false);
    setDragPx(0);
    if (Math.abs(dx) > Math.min(60, w * 0.15)) {
      if (dx < 0) handleNext();
      else handlePrev();
      return;
    }
    // 탭(드래그 아님): 슬라이드(다중 팝업)에서는 포인터 캡처가 click을 가로채
    // <Link> 이동이 막히므로, 여기서 직접 라우팅한다.
    if (!moved) {
      const href = slideHref(popups[currentIndex]);
      if (href) {
        handleClose();
        router.push(href);
      }
    }
  };

  // 3초마다 자동 슬라이드 (드래그 중 일시정지, 인덱스 변경 시 타이머 재설정)
  useEffect(() => {
    if (!visible || popups.length <= 1 || dragging) return;
    const id = setTimeout(
      () => setCurrentIndex((p) => (p + 1) % popups.length),
      3000,
    );
    return () => clearTimeout(id);
  }, [visible, currentIndex, dragging, popups.length]);

  if (!visible || popups.length === 0) return null;

  const showTabs = popups.length > 1;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      data-ga-section="home-event-popup"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-[380px] overflow-hidden rounded-[8px] bg-white md:max-w-[760px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          data-ga-id="home-event-popup.close"
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

        <div
          ref={viewportRef}
          className="relative overflow-hidden"
          style={{ touchAction: 'pan-y' }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* 슬라이드 트랙 — translateX 이동 + 전환 애니메이션 */}
          <div
            className="flex"
            style={{
              transform: `translateX(calc(${-currentIndex * 100}% + ${dragPx}px))`,
              transition: dragging ? 'none' : 'transform 450ms ease-out',
            }}
          >
            {popups.map((p) => {
              const href = slideHref(p);
              const pcUrl = p.pcImageUrl || p.mobileImageUrl || '';
              const mobileUrl = p.mobileImageUrl || p.pcImageUrl || '';
              const slide = (
                <>
                  {/* PC 이미지 (가로형) */}
                  <div className="hidden md:block">
                    {pcUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={pcUrl}
                        alt={p.title ?? ''}
                        draggable={false}
                        className="block w-full select-none"
                      />
                    ) : (
                      <div className="flex h-[400px] w-full items-center justify-center bg-[#efe5d9]">
                        <span className="text-[13px] text-[#9c8e87]">
                          {p.title}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* 모바일 이미지 (세로형) */}
                  <div className="block md:hidden">
                    {mobileUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mobileUrl}
                        alt={p.title ?? ''}
                        draggable={false}
                        className="block w-full select-none"
                      />
                    ) : (
                      <div
                        className="flex w-full items-center justify-center bg-[#efe5d9]"
                        style={{ aspectRatio: '3/4' }}
                      >
                        <span className="text-[13px] text-[#9c8e87]">
                          {p.title}
                        </span>
                      </div>
                    )}
                  </div>
                </>
              );
              return (
                <div key={p._id} className="w-full shrink-0 grow-0 basis-full">
                  {href ? (
                    <Link
                      href={href}
                      data-ga-id={`home-event-popup.image-${p._id}`}
                      draggable={false}
                      onClick={(e) => {
                        // 드래그로 넘긴 경우 이동 방지
                        if (movedRef.current) {
                          e.preventDefault();
                          return;
                        }
                        handleClose();
                      }}
                      className="block"
                    >
                      {slide}
                    </Link>
                  ) : (
                    slide
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 타이틀 그리드 (여러 이벤트일 때) — 자동 줄바꿈, 현재 항목 하이라이트 */}
        {showTabs && (
          <div
            className="grid border-t border-l border-[#ece3d8]"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              maxHeight: 168,
              overflowY: 'auto',
            }}
          >
            {popups.map((p, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={p._id}
                  onClick={() => setCurrentIndex(idx)}
                  data-ga-id={`home-event-popup.tab-${idx}`}
                  title={p.title}
                  className={`truncate border-r border-b px-3 py-2.5 text-center text-[12px] transition-colors ${
                    isActive
                      ? 'border-[#a83c44] bg-[#a83c44] font-bold text-white'
                      : 'border-[#ece3d8] bg-white text-[#706263] hover:bg-[#faf8f5]'
                  }`}
                >
                  {p.title || `이벤트 ${idx + 1}`}
                </button>
              );
            })}
          </div>
        )}

        {/* 하단 바: 하루 동안 보지 않기 / 닫기 — 각각 누르면 즉시 닫힘 */}
        <div className="flex items-center justify-between border-t border-[#ece3d8] px-4 py-3">
          <button
            onClick={handleDismissToday}
            data-ga-id="home-event-popup.dismiss-today"
            className="text-[12px] text-[#706263] transition-colors hover:text-[#2b2b2b]"
          >
            {t('dismissToday')}
          </button>

          <button
            onClick={handleClose}
            data-ga-id="home-event-popup.close-text"
            className="text-[12px] text-[#706263] transition-colors hover:text-[#2b2b2b]"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
}
