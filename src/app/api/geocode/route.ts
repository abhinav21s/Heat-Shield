import { NextRequest, NextResponse } from 'next/server';

export interface GeocodedLocation {
  id: string;
  name: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  formattedAddress: string;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ success: true, results: [] });
  }

  const trimmedQuery = query.trim();
  const tomtomKey = process.env.TOMTOM_API_KEY || process.env.NEXT_PUBLIC_TOMTOM_API_KEY;

  // 1. Try TomTom Fuzzy Search API if key is available
  if (tomtomKey) {
    try {
      const tomtomUrl = `https://api.tomtom.com/search/2/search/${encodeURIComponent(trimmedQuery)}.json?key=${tomtomKey}&typeahead=true&limit=6&countrySet=US`;
      const res = await fetch(tomtomUrl, { next: { revalidate: 3600 } });
      if (res.ok) {
        const json = await res.json();
        if (json.results && json.results.length > 0) {
          const results: GeocodedLocation[] = json.results.map((item: any, idx: number) => {
            const addr = item.address || {};
            const cityName = addr.municipality || addr.localName || addr.municipalitySubdivision || addr.freeformAddress?.split(',')[0] || trimmedQuery;
            const stateName = addr.countrySubdivisionName || addr.countrySubdivision || 'US';
            const fullAddress = addr.freeformAddress || `${cityName}, ${stateName}`;

            return {
              id: item.id || `tt-${idx}-${item.position.lat}`,
              name: fullAddress,
              city: cityName,
              state: stateName,
              country: addr.countryCodeISO3 || 'USA',
              lat: item.position.lat,
              lng: item.position.lon,
              formattedAddress: fullAddress,
            };
          });

          return NextResponse.json({ success: true, results, source: 'tomtom' });
        }
      }
    } catch (e) {
      console.warn('TomTom Geocoding error, falling back to OSM Nominatim:', e);
    }
  }

  // 2. High-reliability fallback using OpenStreetMap Nominatim
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(trimmedQuery)}&format=json&countrycodes=us&limit=6&addressdetails=1`;
    const res = await fetch(osmUrl, {
      headers: {
        'User-Agent': 'HeatShield-Urban-Heat-App/1.0',
        'Accept': 'application/json',
      },
      next: { revalidate: 3600 },
    });

    if (res.ok) {
      const json = await res.json();
      const results: GeocodedLocation[] = json.map((item: any) => {
        const addr = item.address || {};
        const cityName = addr.city || addr.town || addr.village || addr.suburb || addr.neighbourhood || addr.county || trimmedQuery;
        const stateName = addr.state || 'US';
        const fullAddress = item.display_name.split(',').slice(0, 3).join(', ');

        return {
          id: `osm-${item.place_id}`,
          name: fullAddress,
          city: cityName,
          state: stateName,
          country: 'USA',
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          formattedAddress: fullAddress,
        };
      });

      return NextResponse.json({ success: true, results, source: 'osm' });
    }
  } catch (e) {
    console.error('Geocoding fallback error:', e);
  }

  return NextResponse.json({ success: true, results: [] });
}
