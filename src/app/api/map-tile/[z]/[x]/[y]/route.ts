import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { z: string; x: string; y: string } }
) {
  const { z, x, y } = params;
  const tomtomKey = process.env.TOMTOM_API_KEY || process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

  if (!tomtomKey) {
    // Fallback to OSM tile if TomTom key is not configured
    try {
      const osmRes = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {
        headers: { 'User-Agent': 'HeatShield-Map/1.0' },
      });
      const osmBuffer = await osmRes.arrayBuffer();
      return new NextResponse(osmBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=86400',
        },
      });
    } catch {
      return new NextResponse('Tile not found', { status: 404 });
    }
  }

  try {
    const tomtomUrl = `https://api.tomtom.com/map/1/tile/basic/main/${z}/${x}/${y}.png?key=${tomtomKey}&view=Unified`;
    const res = await fetch(tomtomUrl, {
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      // Graceful fallback to OSM tile if TomTom rate limit / network error occurs
      const osmRes = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {
        headers: { 'User-Agent': 'HeatShield-Map/1.0' },
      });
      const osmBuffer = await osmRes.arrayBuffer();
      return new NextResponse(osmBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    const imageBuffer = await res.arrayBuffer();
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/png',
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800',
      },
    });
  } catch {
    try {
      const osmRes = await fetch(`https://tile.openstreetmap.org/${z}/${x}/${y}.png`, {
        headers: { 'User-Agent': 'HeatShield-Map/1.0' },
      });
      const osmBuffer = await osmRes.arrayBuffer();
      return new NextResponse(osmBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    } catch {
      return new NextResponse('Failed to load tile', { status: 500 });
    }
  }
}
