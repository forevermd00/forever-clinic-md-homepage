'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';

interface GoogleMapProps {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
}

// POI 및 불필요한 레이블 숨김 스타일
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
  };

  useEffect(() => {
    // 이미 로드된 경우 바로 초기화
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
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initForeverMap&loading=async`}
        strategy="lazyOnload"
      />
      <div
        ref={mapRef}
        className={className}
        style={{ width: '100%', height: '100%' }}
      />
    </>
  );
}
