'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
}

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

declare global {
  interface Window {
    initForeverMap?: () => void;
    google?: typeof google;
  }
}

export function GoogleMap({ lat, lng, zoom = 17, className }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [ready, setReady] = useState(false);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = new window.google!.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom,
      styles: MAP_STYLES,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
    });

    const pinSvg = encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">` +
        `<path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 28 16 28S32 27 32 16C32 7.163 24.837 0 16 0z" fill="#a83c44"/>` +
        `<circle cx="16" cy="16" r="6" fill="white"/>` +
        `</svg>`,
    );

    new window.google!.maps.Marker({
      position: { lat, lng },
      map,
      icon: {
        url: `data:image/svg+xml;charset=UTF-8,${pinSvg}`,
        scaledSize: new window.google!.maps.Size(32, 44),
        anchor: new window.google!.maps.Point(16, 44),
      },
    });

    mapInstanceRef.current = map;
    setReady(true);
  };

  useEffect(() => {
    if (window.google?.maps) {
      initMap();
    } else {
      window.initForeverMap = initMap;
    }

    return () => {
      mapInstanceRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  return (
    <div className="relative h-full w-full">
      {/* 지도 로딩 전 beige 배경 유지 — 로드 완료 시 페이드아웃 */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center bg-[#efe5d9] transition-opacity duration-500"
        style={{
          opacity: ready ? 0 : 1,
          pointerEvents: ready ? 'none' : 'auto',
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#c4b5a8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initForeverMap&loading=async`}
        strategy="lazyOnload"
      />
      <div
        ref={mapRef}
        className={className}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
