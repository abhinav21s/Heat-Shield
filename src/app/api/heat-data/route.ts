import { NextRequest, NextResponse } from 'next/server';
import { buildHeatReportForLocation, HOT_US_CITIES } from '@/lib/mockHeatData';
import { fetchFortyGuardData } from '@/lib/fortyguard';
import { LocationInfo } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const cityParam = searchParams.get('city');
  const labelParam = searchParams.get('label') || searchParams.get('name');

  const tomtomKey = process.env.TOMTOM_API_KEY || process.env.NEXT_PUBLIC_TOMTOM_API_KEY;
  let location: LocationInfo;

  if (cityParam) {
    const matchedCity = HOT_US_CITIES.find(
      c => c.name.toLowerCase() === cityParam.toLowerCase() || c.id === cityParam.toLowerCase()
    );
    if (matchedCity) {
      location = {
        name: labelParam || `${matchedCity.name}, ${matchedCity.state}`,
        city: matchedCity.name,
        state: matchedCity.state,
        country: matchedCity.country,
        lat: matchedCity.lat,
        lng: matchedCity.lng,
      };
    } else {
      location = {
        name: labelParam || cityParam,
        city: cityParam,
        state: 'US',
        country: 'USA',
        lat: 39.5,
        lng: -98.35,
      };
    }
  } else if (latParam && lngParam) {
    const lat = parseFloat(latParam);
    const lng = parseFloat(lngParam);

    if (labelParam && labelParam.trim().length > 0) {
      const parts = labelParam.split(',').map(s => s.trim());
      const cityName = parts[0] || 'Selected Location';
      const stateName = parts[1] || 'US';

      location = {
        name: labelParam,
        district: cityName,
        city: cityName,
        state: stateName,
        country: parts[2] || 'USA',
        lat,
        lng,
        isUserLocation: true,
      };
    } else {
      let closestCity = HOT_US_CITIES[0];
      let minDistance = 999999;
      for (const city of HOT_US_CITIES) {
        const dist = Math.hypot(city.lat - lat, city.lng - lng);
        if (dist < minDistance) {
          minDistance = dist;
          closestCity = city;
        }
      }

      const isClose = minDistance < 0.6;

      let streetAddress = '';
      let neighborhood = '';
      let cityName = '';
      let stateName = '';
      let geocodedOk = false;

      // Prioritize TomTom reverse geocoding
      if (tomtomKey) {
        try {
          const tomtomGeocodeUrl = `https://api.tomtom.com/search/2/reverseGeocode/${lat},${lng}.json?key=${tomtomKey}`;
          const res = await fetch(tomtomGeocodeUrl, { signal: AbortSignal.timeout(1200) });
          if (res.ok) {
            const json = await res.json();
            const addr = json.addresses?.[0]?.address;
            if (addr) {
              cityName = addr.municipality || closestCity.name;
              stateName = addr.countrySubdivision || closestCity.state;
              streetAddress = addr.freeformAddress || '';
              neighborhood = addr.neighbourhood || addr.suburb || 'Selected Coordinates';
              geocodedOk = true;
            }
          }
        } catch (e) {
          console.warn('TomTom reverse geocoding failed, falling back to OSM Nominatim:', e);
        }
      }

      // Nominatim Fallback
      if (!geocodedOk) {
        try {
          const osmUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`;
          const res = await fetch(osmUrl, {
            headers: {
              'User-Agent': 'HeatShield-App/1.0',
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(1500),
          });

          if (res.ok) {
            const json = await res.json();
            if (json && json.address) {
              const addr = json.address;
              cityName = addr.city || addr.town || addr.village || addr.suburb || closestCity.name;
              stateName = addr.state || closestCity.state;
              neighborhood = addr.neighbourhood || addr.suburb || addr.quarter || 'Selected Coordinates';
              
              const parts = [];
              if (addr.house_number) parts.push(addr.house_number);
              if (addr.road) parts.push(addr.road);
              if (addr.neighbourhood || addr.suburb) parts.push(addr.neighbourhood || addr.suburb);
              
              streetAddress = parts.join(', ') || json.display_name.split(',').slice(0, 3).join(', ');
            }
          }
        } catch (e) {
          console.warn('Nominatim reverse geocoding failed:', e);
        }
      }

      location = {
        name: streetAddress || (isClose ? `${closestCity.name} Metro Area` : `${closestCity.name} Region (${lat.toFixed(2)}, ${lng.toFixed(2)})`),
        district: neighborhood || (isClose ? `${closestCity.name} Central` : 'Selected Coordinates'),
        city: cityName || closestCity.name,
        state: stateName || closestCity.state,
        country: 'USA',
        lat,
        lng,
        isUserLocation: true,
      };
    }
  } else {
    const defaultCity = HOT_US_CITIES[0];
    location = {
      name: `${defaultCity.name}, ${defaultCity.state}`,
      city: defaultCity.name,
      state: defaultCity.state,
      country: defaultCity.country,
      lat: defaultCity.lat,
      lng: defaultCity.lng,
    };
  }

  // Fetch real cooling centers from TomTom POI Search
  let coolingCenters: any[] = [];
  if (tomtomKey) {
    try {
      const searchTerms = [
        { term: 'shopping center', type: 'Shopping Mall' },
        { term: 'park', type: 'Park or Garden' },
        { term: 'garden', type: 'Park or Garden' },
        { term: 'public library', type: 'Public Library' },
        { term: 'community center', type: 'Community Center' }
      ];

      const promises = searchTerms.map(async (st) => {
        try {
          const res = await fetch(
            `https://api.tomtom.com/search/2/poiSearch/${encodeURIComponent(st.term)}.json?key=${tomtomKey}&lat=${location.lat}&lon=${location.lng}&radius=8000&limit=3`,
            { signal: AbortSignal.timeout(1200) }
          );
          if (res.ok) {
            const json = await res.json();
            return (json.results || []).map((item: any) => ({
              ...item,
              customType: st.type
            }));
          }
        } catch (e) {
          // ignore individual timeout/error
        }
        return [];
      });

      const allResultsArrays = await Promise.all(promises);
      const rawResults = allResultsArrays.flat();

      const seen = new Set<string>();
      const uniqueResults = rawResults.filter(item => {
        if (!item.poi?.name) return false;
        const name = item.poi.name.toLowerCase().trim();
        
        // 1. Exclude schools, colleges, and training institutes
        const forbiddenWords = ['school', 'college', 'university', 'academy', 'institute', 'elementary', 'kindergarten'];
        if (forbiddenWords.some(word => name.includes(word))) {
          return false;
        }

        // 2. Filter duplicates
        if (seen.has(name)) return false;
        seen.add(name);
        return true;
      });

      uniqueResults.sort((a, b) => (a.dist || 0) - (b.dist || 0));
      const topResults = uniqueResults.slice(0, 4);

      coolingCenters = topResults.map((item, idx) => {
        const type = item.customType;
        const distanceMiles = Math.round((item.dist / 1609.34) * 10) / 10;
        
        let amenities = ['High-Power HVAC Respite', 'Cold Water Station', 'Device Charging Outlets'];
        if (type === 'Shopping Mall') {
          amenities.push('Air Conditioned Walking', 'Retail & Food Court Respite');
        } else if (type === 'Park or Garden') {
          amenities = ['Shade Tree Canopy', 'Fresh Water Access', 'Open Green Spaces'];
        } else if (type === 'Public Library') {
          amenities.push('Free Wi-Fi & Reading Tables', 'Quiet Rest Areas');
        } else if (type === 'Community Center') {
          amenities.push('Indoor Seating & Recreation', 'Local Community Support');
        }

        return {
          id: `cc-real-${idx}-${Date.now()}`,
          name: item.poi?.name || type,
          type,
          address: item.address?.freeformAddress || 'Local Address',
          lat: item.position.lat,
          lng: item.position.lon,
          distanceMiles,
          hours: type === 'Park or Garden' ? '6:00 AM – 10:00 PM (Daily)' : '9:00 AM – 8:00 PM (Mon-Sat)',
          isOpen: true,
          capacityStatus: distanceMiles < 1.0 ? 'High Demand' : 'Available',
          amenities,
          phone: item.poi?.phone || '(555) 019-9900',
        };
      });
    } catch (err) {
      console.warn("Failed to fetch real cooling centers from TomTom POI Search:", err);
    }
  }

  // Fetch FortyGuard temperature & microclimate thermal data
  const fgResponse = await fetchFortyGuardData(location.lat, location.lng);
  
  const report = buildHeatReportForLocation(location, {
    temperatureF: fgResponse.data.ambientTemperatureF,
    feelsLikeF: fgResponse.data.heatIndexF,
    humidity: fgResponse.data.relativeHumidity,
    surfaceTempF: fgResponse.data.surfaceTemperatureF,
    solarRadiation: fgResponse.data.solarRadiationWm2,
    airQualityAqi: fgResponse.data.airQualityAqi,
    canopyCoveragePct: fgResponse.data.canopyCoveragePct,
    imperviousSurfacePct: fgResponse.data.imperviousSurfacePct,
    elevationMeters: fgResponse.data.elevationMeters,
    co2Ppm: fgResponse.data.co2Ppm,
    methanePpb: fgResponse.data.methanePpb,
    cloudCoverOctas: fgResponse.data.cloudCoverOctas,
    pm25Index: fgResponse.data.pm25Index,
    pm10Index: fgResponse.data.pm10Index,
    no2Index: fgResponse.data.no2Index,
    coolingCenters,
  });

  report.dataSource = fgResponse.status === 'success' 
    ? 'FortyGuard Hyperlocal API' 
    : 'Simulated FortyGuard Real-Time Engine';

  return NextResponse.json({
    success: true,
    data: report,
    fortyguard: fgResponse,
  });
}
