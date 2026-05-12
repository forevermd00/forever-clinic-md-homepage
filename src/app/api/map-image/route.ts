import { NextRequest, NextResponse } from 'next/server';

/**
 * Google Maps Static API 프록시
 * - API 키 클라이언트 노출 방지
 * - POI / 대중교통 / 업체 라벨 숨김 → 클리닉 핀만 표시
 *
 * GET /api/map-image?lat=37.xxx&lng=126.xxx&zoom=17&w=800&h=500&scale=2
 */
export async function GET(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return new NextResponse('GOOGLE_MAPS_API_KEY not configured', {
      status: 500,
    });
  }

  const { searchParams } = req.nextUrl;
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  if (!lat || !lng) {
    return new NextResponse('lat and lng are required', { status: 400 });
  }

  const zoom = searchParams.get('zoom') ?? '17';
  const w = searchParams.get('w') ?? '800';
  const h = searchParams.get('h') ?? '500';
  const scale = searchParams.get('scale') ?? '2';

  // 불필요한 POI 숨김 스타일
  const styles = [
    'feature:poi%7Cvisibility:off',
    'feature:transit%7Cvisibility:off',
    'feature:poi.business%7Cvisibility:off',
  ]
    .map((s) => `&style=${s}`)
    .join('');

  const markerColor = '0xa83c44'; // 브랜드 레드
  const marker = `color:${markerColor}%7C${lat},${lng}`;

  const url =
    `https://maps.googleapis.com/maps/api/staticmap` +
    `?center=${lat},${lng}` +
    `&zoom=${zoom}` +
    `&size=${w}x${h}` +
    `&scale=${scale}` +
    `&markers=${marker}` +
    `${styles}` +
    `&key=${apiKey}`;

  const res = await fetch(url, { next: { revalidate: 86400 } }); // 1일 캐시
  if (!res.ok) {
    return new NextResponse('Failed to fetch map image', { status: 502 });
  }

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
