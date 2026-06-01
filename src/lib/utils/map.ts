/**
 * /api/map-image 프록시 URL 생성 (Static Maps API — POI 숨김)
 */
export function buildStaticMapUrl(
  lat: number,
  lng: number,
  opts?: { zoom?: number; w?: number; h?: number; language?: string },
): string {
  const { zoom = 15, w = 800, h = 500, language } = opts ?? {};
  const lang = language ? `&language=${language}` : '';
  return `/api/map-image?lat=${lat}&lng=${lng}&zoom=${zoom}&w=${w}&h=${h}&scale=2${lang}`;
}

/**
 * Google Maps 링크 (지도에서 열기)
 */
export function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://maps.google.com/maps?q=${lat},${lng}`;
}

/**
 * 고덕(高德, Amap) 지도 링크 — 중국어 사용자용 (Google Maps는 중국에서 차단됨)
 * position 파라미터는 경도,위도 순서
 */
export function buildAmapUrl(lat: number, lng: number): string {
  return `https://uri.amap.com/marker?position=${lng},${lat}`;
}

/**
 * 주소 기반 Google Maps 링크
 */
export function buildGoogleMapsUrlFromAddress(address: string): string {
  return `https://maps.google.com/maps?q=${encodeURIComponent(address)}`;
}

/**
 * 주소 기반 Google Maps Embed API URL (좌표 없을 때 폴백)
 */
export function buildMapEmbedUrl(address: string): string {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
  return `https://www.google.com/maps/embed/v1/place?key=${key}&q=${encodeURIComponent(address)}&zoom=17`;
}
