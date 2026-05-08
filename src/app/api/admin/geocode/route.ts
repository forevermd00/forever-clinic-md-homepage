import { NextRequest, NextResponse } from 'next/server';

// Google Geocoding API — 서버사이드 호출 (키 노출 방지)
// 환경변수: GOOGLE_MAPS_API_KEY
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get('address');
  if (!address) {
    return NextResponse.json({ error: 'address required' }, { status: 400 });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'GOOGLE_MAPS_API_KEY not configured' },
      { status: 500 },
    );
  }

  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}&language=ko`;
  const res = await fetch(url);
  const data = (await res.json()) as {
    status: string;
    results: { geometry: { location: { lat: number; lng: number } } }[];
  };

  if (data.status !== 'OK' || !data.results[0]) {
    return NextResponse.json(
      { error: `Geocoding error: ${data.status}` },
      { status: 422 },
    );
  }

  const { lat, lng } = data.results[0].geometry.location;
  return NextResponse.json({ lat, lng });
}
