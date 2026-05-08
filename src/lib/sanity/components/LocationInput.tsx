/* =========================================================
   LocationInput — Sanity Studio 커스텀 컴포넌트
   주소 검색(Kakao Postcode) → Google Geocoding → 지도 미리보기
   ========================================================= */
'use client';

import { useState, useCallback } from 'react';
import { set, ObjectInputProps } from 'sanity';

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: KakaoPostcodeResult) => void;
      }) => { open: () => void };
    };
  }
}

interface KakaoPostcodeResult {
  roadAddress: string;
  jibunAddress: string;
}

interface LocationValue {
  searchAddress?: string;
  latitude?: number;
  longitude?: number;
}

export function LocationInput(props: ObjectInputProps) {
  const { value, onChange } = props;
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const loadKakaoScript = (): Promise<void> =>
    new Promise((resolve) => {
      if (window.daum?.Postcode) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src =
        '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
      script.onload = () => resolve();
      document.head.appendChild(script);
    });

  const handleSearch = useCallback(async () => {
    await loadKakaoScript();
    new window.daum!.Postcode({
      oncomplete: async (data) => {
        const address = data.roadAddress || data.jibunAddress;
        setStatus('loading');
        try {
          const res = await fetch(
            `/api/admin/geocode?address=${encodeURIComponent(address)}`,
          );
          if (!res.ok) throw new Error();
          const { lat, lng } = (await res.json()) as {
            lat: number;
            lng: number;
          };
          onChange([
            set(address, ['searchAddress']),
            set(lat, ['latitude']),
            set(lng, ['longitude']),
          ]);
          setStatus('idle');
        } catch {
          setStatus('error');
        }
      },
    }).open();
  }, [onChange]);

  const loc = value as LocationValue | undefined;
  const hasCoords = loc?.latitude != null && loc?.longitude != null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* 검색 버튼 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          type="button"
          onClick={handleSearch}
          disabled={status === 'loading'}
          style={{
            padding: '8px 16px',
            background: '#1a1a1a',
            color: '#fff',
            border: 'none',
            borderRadius: 4,
            cursor: status === 'loading' ? 'wait' : 'pointer',
            fontSize: 13,
          }}
        >
          {status === 'loading' ? '좌표 가져오는 중…' : '🔍 주소 검색'}
        </button>
        {loc?.searchAddress && (
          <span style={{ fontSize: 13, color: '#555' }}>
            📍 {loc.searchAddress}
          </span>
        )}
        {status === 'error' && (
          <span style={{ fontSize: 12, color: '#c62828' }}>
            ✗ Geocoding 실패 — API 키 확인
          </span>
        )}
      </div>

      {/* Google Maps 미리보기 */}
      {hasCoords && (
        <iframe
          src={`https://maps.google.com/maps?q=${loc!.latitude},${loc!.longitude}&t=&z=17&ie=UTF8&iwloc=&output=embed`}
          width="100%"
          height="280"
          style={{ border: 0, borderRadius: 6 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}

      {/* 수동 입력 (fallback) */}
      <details style={{ fontSize: 12, color: '#888' }}>
        <summary style={{ cursor: 'pointer' }}>수동 입력</summary>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input
            type="number"
            placeholder="위도 (latitude)"
            value={loc?.latitude ?? ''}
            onChange={(e) =>
              onChange(set(parseFloat(e.target.value), ['latitude']))
            }
            step="0.000001"
            style={{
              flex: 1,
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 12,
            }}
          />
          <input
            type="number"
            placeholder="경도 (longitude)"
            value={loc?.longitude ?? ''}
            onChange={(e) =>
              onChange(set(parseFloat(e.target.value), ['longitude']))
            }
            step="0.000001"
            style={{
              flex: 1,
              padding: '4px 8px',
              border: '1px solid #ddd',
              borderRadius: 4,
              fontSize: 12,
            }}
          />
        </div>
      </details>
    </div>
  );
}
