import { NextRequest, NextResponse } from 'next/server';
import { buildHeatReportForLocation, HOT_US_CITIES } from '@/lib/mockHeatData';
import { fetchFortyGuardData } from '@/lib/fortyguard';
import { LocationInfo } from '@/lib/types';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latParam = searchParams.get('lat');
  const lngParam = searchParams.get('lng');
  const cityParam = searchParams.get('city');
  const labelParam = searchParams.get('label') || searchParams.get('name');

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
      // Unknown city string — use coordinates (0,0) as sentinel; fortyguard fallback will handle it
      // The label is preserved so the report shows the user's typed city name
      location = {
        name: labelParam || cityParam,
        city: cityParam,
        state: 'US',
        country: 'USA',
        lat: 39.5, // geographic center of contiguous US
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
      // Try to find closest known city name
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

      location = {
        name: isClose ? `${closestCity.name} Metro Area` : `${closestCity.name} Region (${lat.toFixed(2)}, ${lng.toFixed(2)})`,
        district: isClose ? `${closestCity.name} Central` : 'Selected Coordinates',
        city: isClose ? closestCity.name : 'Selected Location',
        state: isClose ? closestCity.state : 'US',
        country: 'USA',
        lat,
        lng,
        isUserLocation: true,
      };
    }
  } else {
    // Default fallback to Phoenix
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

  // Fetch FortyGuard temperature & microclimate thermal data
  const fgResponse = await fetchFortyGuardData(location.lat, location.lng);
  const report = buildHeatReportForLocation(
    location,
    fgResponse.data.ambientTemperatureF,
    fgResponse.data.relativeHumidity,
    fgResponse.data.airQualityAqi
  );
  report.dataSource = fgResponse.status === 'success' 
    ? 'FortyGuard Hyperlocal API' 
    : 'Simulated FortyGuard Real-Time Engine';

  return NextResponse.json({
    success: true,
    data: report,
    fortyguard: fgResponse,
  });
}
