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
