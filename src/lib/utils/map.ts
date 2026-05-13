/**
 * /api/map-image 프록시 URL 생성 (Static Maps API — POI 숨김)
 */
export function buildStaticMapUrl(
  lat: number,
  lng: number,
  opts?: { zoom?: number; w?: number; h?: number },
): string {
  const { zoom = 17, w = 800, h = 500 } = opts ?? {};
  return `/api/map-image?lat=${lat}&lng=${lng}&zoom=${zoom}&w=${w}&h=${h}&scale=2`;
}

/**
 * Google Maps 링크 (지도에서 열기)
 */
export function buildGoogleMapsUrl(lat: number, lng: number): string {
  return `https://maps.google.com/maps?q=${lat},${lng}`;
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
