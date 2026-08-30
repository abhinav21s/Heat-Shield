import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startLat = searchParams.get('startLat');
  const startLng = searchParams.get('startLng');
  const endLat = searchParams.get('endLat');
  const endLng = searchParams.get('endLng');
  const waypointLat = searchParams.get('waypointLat');
  const waypointLng = searchParams.get('waypointLng');

  if (!startLat || !startLng || !endLat || !endLng) {
    return NextResponse.json(
      { success: false, error: 'Missing required start/end coordinates' },
      { status: 400 }
    );
  }

  const tomtomKey = process.env.TOMTOM_API_KEY || process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

  if (!tomtomKey) {
    return NextResponse.json(
      { success: false, error: 'TomTom API key not configured on server' },
      { status: 503 }
    );
  }

  try {
    // 1. Fetch standard pedestrian route
    const stdUrl = `https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLng}:${endLat},${endLng}/json?key=${tomtomKey}&travelMode=pedestrian&routeType=fastest`;
    const stdPromise = fetch(stdUrl, { next: { revalidate: 300 } });

    // 2. Fetch cool route with waypoint if provided
    let coolPromise: Promise<Response> | null = null;
    if (waypointLat && waypointLng) {
      const coolUrl = `https://api.tomtom.com/routing/1/calculateRoute/${startLat},${startLng}:${waypointLat},${waypointLng}:${endLat},${endLng}/json?key=${tomtomKey}&travelMode=pedestrian&routeType=fastest`;
      coolPromise = fetch(coolUrl, { next: { revalidate: 300 } });
    }

    const [stdRes, coolRes] = await Promise.all([
      stdPromise,
      coolPromise ? coolPromise : Promise.resolve(null),
    ]);

    let stdPoints: [number, number][] = [];
    if (stdRes.ok) {
      const stdJson = await stdRes.json();
      stdPoints =
        stdJson?.routes?.[0]?.legs?.[0]?.points?.map((p: any) => [
          p.latitude,
          p.longitude,
        ]) || [];
    }

    let coolPoints: [number, number][] = [];
    if (coolRes && coolRes.ok) {
      const coolJson = await coolRes.json();
      coolPoints =
        coolJson?.routes?.[0]?.legs?.flatMap((leg: any) =>
          leg.points.map((p: any) => [p.latitude, p.longitude])
        ) || [];
    }

    return NextResponse.json({
      success: true,
      stdPoints,
      coolPoints,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to calculate routing' },
      { status: 500 }
    );
  }
}
