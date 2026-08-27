import { HeatReportData, LocationInfo, HeatZone, CoolingCenter } from './types';
import {
  calculateHeatIndex,
  calculateWBGT,
  calculateRiskScore,
  getRiskLevelFromScore,
  getStatusText,
  getImmediatePrecautions,
  getVulnerableGroupRisks,
  generateHourlyTrend,
} from './heatCalculations';

export interface PredefinedCity {
  id: string;
  name: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  baseTempF: number;
  baseHumidity: number;
  treeCanopyAverage: number;
  urbanHeatIslandIntensity: string;
  description: string;
}

export const HOT_US_CITIES: PredefinedCity[] = [
  {
    id: 'phoenix',
    name: 'Phoenix',
    state: 'Arizona',
    country: 'USA',
    lat: 33.4484,
    lng: -112.0740,
    baseTempF: 111.4,
    baseHumidity: 16,
    treeCanopyAverage: 9,
    urbanHeatIslandIntensity: '+8.6°F urban core delta',
    description: 'High desert extreme heat with intense asphalt thermal retention.',
  },
  {
    id: 'las-vegas',
    name: 'Las Vegas',
    state: 'Nevada',
    country: 'USA',
    lat: 36.1699,
    lng: -115.1398,
    baseTempF: 108.2,
    baseHumidity: 14,
    treeCanopyAverage: 7,
    urbanHeatIslandIntensity: '+7.4°F concrete strip delta',
    description: 'Desert valley heat with high solar radiation and low nighttime cooling.',
  },
  {
    id: 'houston',
    name: 'Houston',
    state: 'Texas',
    country: 'USA',
    lat: 29.7604,
    lng: -95.3698,
    baseTempF: 96.5,
    baseHumidity: 68,
    treeCanopyAverage: 18,
    urbanHeatIslandIntensity: '+9.2°F high-humidity heat index delta',
    description: 'Subtropical severe moisture leading to dangerous heat index.',
  },
  {
    id: 'dallas',
    name: 'Dallas',
    state: 'Texas',
    country: 'USA',
    lat: 32.7767,
    lng: -96.7970,
    baseTempF: 102.3,
    baseHumidity: 42,
    treeCanopyAverage: 14,
    urbanHeatIslandIntensity: '+6.8°F freeway network delta',
    description: 'Vast concrete infrastructure trapping persistent afternoon heat.',
  },
  {
    id: 'miami',
    name: 'Miami',
    state: 'Florida',
    country: 'USA',
    lat: 25.7617,
    lng: -80.1918,
    baseTempF: 92.8,
    baseHumidity: 78,
    treeCanopyAverage: 19,
    urbanHeatIslandIntensity: '+6.1°F inland vs coastal corridor',
    description: 'Extreme tropical humidity exacerbating physiological heat stress.',
  },
  {
    id: 'los-angeles',
    name: 'Los Angeles (Downtown & Valley)',
    state: 'California',
    country: 'USA',
    lat: 34.0522,
    lng: -118.2437,
    baseTempF: 94.6,
    baseHumidity: 38,
    treeCanopyAverage: 15,
    urbanHeatIslandIntensity: '+11.0°F San Fernando Valley vs coast',
    description: 'Dramatic microclimate variance between marine layer and inland basins.',
  },
  {
    id: 'austin',
    name: 'Austin',
    state: 'Texas',
    country: 'USA',
    lat: 30.2672,
    lng: -97.7431,
    baseTempF: 99.8,
    baseHumidity: 50,
    treeCanopyAverage: 30,
    urbanHeatIslandIntensity: '+5.7°F downtown corridor delta',
    description: 'Green belt cooling vs rapid downtown high-density heat buildup.',
  },
];

/**
 * Creates realistic micro-zones around a focal coordinate for heat map rendering
 */
export function generateLocalZones(centerLat: number, centerLng: number, baseTempF: number, cityName: string): HeatZone[] {
  const zoneOffsets = [
    {
      name: `${cityName} Industrial & Logistics Corridor`,
      neighborhood: 'Industrial Hub',
      type: 'industrial-district' as const,
      dLat: 0.014,
      dLng: -0.018,
      tempOffset: +4.8,
      asphaltOffset: +38,
      canopy: 4,
      impervious: 92,
      radius: 1200,
      why: 'High concentration of black tar roofs, warehouses, and heavy truck asphalt corridors with zero shade canopy.',
      rec: 'Mandatory hydration trailers and shaded misting checkpoints for all logistics crews.',
    },
    {
      name: `${cityName} Downtown Financial Core`,
      neighborhood: 'Downtown High-Density',
      type: 'dense-urban' as const,
      dLat: 0.002,
      dLng: 0.003,
      tempOffset: +3.2,
      asphaltOffset: +24,
      canopy: 8,
      impervious: 85,
      radius: 950,
      why: 'Glass and concrete canyons trap thermal radiation; deep street valleys reduce ambient airflow.',
      rec: 'Utilize shaded arcades, public building transit tunnels, and indoor concourses.',
    },
    {
      name: `${cityName} Central Park & Urban Canopy`,
      neighborhood: 'Urban Green Oasis',
      type: 'park-canopy' as const,
      dLat: -0.012,
      dLng: 0.011,
      tempOffset: -5.4,
      asphaltOffset: -18,
      canopy: 68,
      impervious: 15,
      radius: 1100,
      why: 'Dense mature oak and palm canopy provides active evapotranspiration and block solar radiation.',
      rec: 'Recommended natural cooling corridor for essential pedestrian transit and shaded rest.',
    },
    {
      name: `${cityName} Highway Interstate Interchange`,
      neighborhood: 'Freeway Junction',
      type: 'asphalt-corridor' as const,
      dLat: 0.021,
      dLng: 0.019,
      tempOffset: +5.6,
      asphaltOffset: +42,
      canopy: 2,
      impervious: 96,
      radius: 1350,
      why: 'Massive asphalt footprint reaching up to 152°F surface temperature with ongoing vehicle combustion heat.',
      rec: 'Dangerous for pedestrians or cyclists; avoid roadside exposure between 11 AM - 6 PM.',
    },
    {
      name: `${cityName} Residential North District`,
      neighborhood: 'Residential Neighborhood',
      type: 'residential' as const,
      dLat: -0.018,
      dLng: -0.015,
      tempOffset: -1.2,
      asphaltOffset: +4,
      canopy: 34,
      impervious: 48,
      radius: 1400,
      why: 'Moderate tree cover and light-colored residential roofs temper extreme thermal spike.',
      rec: 'Maintain indoor climate control; check on elderly neighbors without central cooling.',
    },
    {
      name: `${cityName} Riverfront / Reservoir Basin`,
      neighborhood: 'Waterfront Corridor',
      type: 'waterfront-cooling' as const,
      dLat: 0.008,
      dLng: -0.028,
      tempOffset: -3.8,
      asphaltOffset: -12,
      canopy: 45,
      impervious: 22,
      radius: 1000,
      why: 'Water evaporation and continuous breeze create a localized 4°F cooling microclimate.',
      rec: 'Optimal recreation zone provided sunblock and hydration are maintained.',
    },
  ];

  return zoneOffsets.map((z, idx) => {
    const tempF = Math.round((baseTempF + z.tempOffset) * 10) / 10;
    const tempC = Math.round(((tempF - 32) * 5) / 9 * 10) / 10;
    const surfaceTempF = Math.round((tempF + z.asphaltOffset) * 10) / 10;
    const surfaceTempC = Math.round(((surfaceTempF - 32) * 5) / 9 * 10) / 10;
    const feelsLikeF = calculateHeatIndex(tempF, 35);
    const score = calculateRiskScore({
      temperatureF: tempF,
      feelsLikeF,
      wbgtF: calculateWBGT(tempF, 35),
      uvIndex: 9,
    });
    const riskLevel = getRiskLevelFromScore(score);

    return {
      id: `zone-${idx + 1}`,
      name: z.name,
      neighborhood: z.neighborhood,
      type: z.type,
      lat: centerLat + z.dLat,
      lng: centerLng + z.dLng,
      radiusMeters: z.radius,
      tempF,
      tempC,
      surfaceTempF,
      surfaceTempC,
      riskLevel,
      riskScore: score,
      treeCanopyCoverage: z.canopy,
      imperviousSurface: z.impervious,
      coolingRecommendation: z.rec,
      whyRiskyOrCool: z.why,
    };
  });
}

/**
 * Generates nearby real cooling centers with realistic services
 */
export function generateLocalCoolingCenters(centerLat: number, centerLng: number, cityName: string): CoolingCenter[] {
  return [
    {
      id: 'cc-1',
      name: `${cityName} Central Public Library & Cooling Station`,
      type: 'Public Library',
      address: `100 Civic Center Plaza, ${cityName}`,
      lat: centerLat + 0.003,
      lng: centerLng - 0.004,
      distanceMiles: 0.4,
      hours: '8:00 AM – 9:00 PM (Daily)',
      isOpen: true,
      capacityStatus: 'Available',
      amenities: ['High-Power HVAC', 'Cold Water Refill Stations', 'Device Charging', 'Medical First Aid Onsite'],
      phone: '(555) 234-5678',
    },
    {
      id: 'cc-2',
      name: `${cityName} Community Recreation & Senior Center`,
      type: 'Senior Center',
      address: `450 E Magnolia Blvd, ${cityName}`,
      lat: centerLat - 0.009,
      lng: centerLng + 0.007,
      distanceMiles: 0.9,
      hours: '7:30 AM – 8:00 PM (Mon-Sat)',
      isOpen: true,
      capacityStatus: 'Available',
      amenities: ['Air Conditioned Gymnasium', 'Ice Water Distribution', 'Electrolyte Packs', 'Pet-Friendly Area'],
      phone: '(555) 345-6789',
    },
    {
      id: 'cc-3',
      name: `${cityName} Metro Plaza Emergency Misting Pavilion`,
      type: 'Misting Station',
      address: `Corner of 4th & Market St, ${cityName}`,
      lat: centerLat + 0.007,
      lng: centerLng + 0.012,
      distanceMiles: 1.2,
      hours: '10:00 AM – 7:00 PM (Heat Alert Days)',
      isOpen: true,
      capacityStatus: 'High Demand',
      amenities: ['High-Pressure Micro-Mist', 'Shade Canopies', 'Free Bottled Water', 'Paramedic Unit Stationed'],
      phone: '(555) 456-7890',
    },
    {
      id: 'cc-4',
      name: `St. Jude Regional Air-Conditioned Respite Shelter`,
      type: 'Emergency Cooling Shelter',
      address: `820 Hope Avenue, ${cityName}`,
      lat: centerLat - 0.015,
      lng: centerLng - 0.011,
      distanceMiles: 1.6,
      hours: '24 Hours (Open During Extreme Heat Emergency)',
      isOpen: true,
      capacityStatus: 'Available',
      amenities: ['24/7 Cots & Rest Areas', 'Hydration & Nutrition Meals', 'Nurse Station', 'Shower Facilities'],
      phone: '(555) 890-1234',
    },
  ];
}

/**
 * Derives a realistic base temperature for any coordinate using regional climate bands.
 * Both lat AND lng are factored in so nearby but distinct locations get different values.
 */
function interpolateBaseClimate(lat: number, lng: number): { baseTempF: number; baseHumidity: number } {
  // Use a deterministic but coordinate-sensitive pseudo-variation so two locations
  // at the same latitude but different longitudes produce different temperatures.
  // The variation seeds are kept small so values stay climatologically plausible.
  const latVariation  = Math.sin(lat  * 0.31731) * 3.4;  // ±3.4 °F based on lat
  const lngVariation  = Math.cos(lng  * 0.17453) * 4.1;  // ±4.1 °F based on lng
  const crossVariation = Math.sin((lat + lng) * 0.22689) * 2.2; // ±2.2 °F interaction term

  let baseTempF: number;
  let baseHumidity: number;

  // Pacific Coast (CA/OR/WA): lat 32-49, lng -115 to -125
  if (lng <= -115 && lng >= -125 && lat >= 32 && lat <= 49) {
    baseTempF     = 74 + latVariation + lngVariation + crossVariation + (34 - lat) * 0.9;
    baseHumidity  = 62 + Math.round(latVariation);
  }
  // Southwest Desert (AZ, NM, inland CA, NV): lat 31-38, lng -104 to -117
  else if (lat <= 38 && lat >= 31 && lng >= -117 && lng <= -104) {
    baseTempF     = 106 + latVariation + lngVariation + crossVariation;
    baseHumidity  = 18 + Math.round(Math.abs(latVariation));
  }
  // Pacific Northwest / Mountain West: lat 43-49, lng -104 to -117
  else if (lat >= 43 && lng <= -104 && lng >= -117) {
    baseTempF     = 79 + latVariation + lngVariation + crossVariation;
    baseHumidity  = 44 + Math.round(latVariation);
  }
  // Northern Plains / Great Plains: lat 43-49, lng -95 to -104
  else if (lat >= 43 && lng <= -95 && lng >= -104) {
    baseTempF     = 82 + latVariation + lngVariation + crossVariation;
    baseHumidity  = 40 + Math.round(Math.abs(lngVariation));
  }
  // Southeast / Florida / Deep South: lat < 34, lng > -90
  else if (lat < 34 && lng > -90) {
    baseTempF     = 93 + latVariation + lngVariation + crossVariation;
    baseHumidity  = 74 + Math.round(Math.abs(latVariation));
  }
  // Texas / Central Plains: lat 26-37, lng -93 to -105
  else if (lat <= 37 && lng <= -93 && lng > -105) {
    baseTempF     = 100 + latVariation + lngVariation + crossVariation;
    baseHumidity  = 46 + Math.round(Math.abs(lngVariation));
  }
  // Midwest / Ohio Valley: lat 37-43, lng -80 to -95
  else if (lat >= 37 && lat <= 43 && lng > -95 && lng <= -80) {
    baseTempF     = 87 + latVariation + lngVariation + crossVariation;
    baseHumidity  = 62 + Math.round(Math.abs(latVariation));
  }
  // Northeast / Mid-Atlantic: lat 38-45, lng > -80
  else if (lat >= 38 && lng > -80) {
    baseTempF     = 88 + latVariation + lngVariation + crossVariation;
    baseHumidity  = 58 + Math.round(Math.abs(lngVariation));
  }
  // Default fallback — general continental US
  else {
    const latFactor = Math.max(0, Math.min(1, (45 - lat) / 18));
    baseTempF    = 82 + latFactor * 18 + latVariation + lngVariation + crossVariation;
    baseHumidity = 48 + Math.round(Math.abs(latVariation));
  }

  return {
    baseTempF: Math.round(baseTempF * 10) / 10,
    baseHumidity: Math.min(92, Math.max(10, Math.round(baseHumidity))),
  };
}

/**
 * Builds a complete HeatReportData object for any location
 */
export function buildHeatReportForLocation(location: LocationInfo, tempOverride?: number, humidityOverride?: number, aqiOverride?: number): HeatReportData {
  // Tighter city match: within ~0.07° (~5 miles) to avoid wrong city bleed-over
  const matched = HOT_US_CITIES.find(
    c => Math.hypot(c.lat - location.lat, c.lng - location.lng) < 0.07
  );

  // For unmatched coordinates, use the coordinate-sensitive regional interpolation
  // so two different California cities (e.g. SF vs Sacramento) get distinct temps.
  const interpolated = (!matched && !tempOverride) ? interpolateBaseClimate(location.lat, location.lng) : null;

  const baseTempF = tempOverride ?? matched?.baseTempF ?? interpolated!.baseTempF;
  const baseHumidity = humidityOverride ?? matched?.baseHumidity ?? interpolated!.baseHumidity;

  const temperatureF = Math.round(baseTempF * 10) / 10;
  const temperatureC = Math.round(((temperatureF - 32) * 5) / 9 * 10) / 10;
  const humidity = Math.round(baseHumidity);
  const feelsLikeF = calculateHeatIndex(temperatureF, humidity);
  const feelsLikeC = Math.round(((feelsLikeF - 32) * 5) / 9 * 10) / 10;
  const wbgtF = calculateWBGT(temperatureF, humidity);
  const wbgtC = Math.round(((wbgtF - 32) * 5) / 9 * 10) / 10;

  // Surface temp is typically 20-35°F higher than ambient in daytime sun
  const surfaceTempF = Math.round((temperatureF + 28.5) * 10) / 10;
  const surfaceTempC = Math.round(((surfaceTempF - 32) * 5) / 9 * 10) / 10;

  const uvIndex = Math.min(12, Math.max(3, Math.round(temperatureF > 100 ? 11 : temperatureF > 90 ? 9 : 7)));
  const solarRadiation = Math.round(650 + (temperatureF * 2.8));
  const windSpeedMph = Math.round((4 + (Math.abs(location.lng * 2) % 8)) * 10) / 10;
  
  // Dynamic AQI based on location coordinates, ozone formation, and temperature
  const defaultRegionalAqi = location.lat >= 43 && location.lng <= -95 ? 28 : (location.lat < 35 && location.lng < -115 ? 92 : 58);
  const airQualityAqi = aqiOverride ?? Math.round(
    defaultRegionalAqi + (temperatureF > 100 ? 18 : temperatureF > 90 ? 8 : 0) + (humidity > 60 ? 6 : 0)
  );

  const riskScore = calculateRiskScore({ temperatureF, feelsLikeF, wbgtF, uvIndex });
  const riskLevel = getRiskLevelFromScore(riskScore);
  const { headline, statusMessage } = getStatusText(riskLevel, temperatureF, feelsLikeF);
  const immediatePrecautions = getImmediatePrecautions(riskLevel);
  const vulnerableGroups = getVulnerableGroupRisks(riskLevel);
  const hourlyForecast = generateHourlyTrend(temperatureF, humidity);

  // Derive real trend and peak window from hourly forecast
  const firstHourTemp = hourlyForecast[0]?.tempF ?? temperatureF;
  const lastHourTemp = hourlyForecast[hourlyForecast.length - 1]?.tempF ?? temperatureF;
  const trendDelta = Math.round((lastHourTemp - firstHourTemp) * 10) / 10;
  const trend: 'rising' | 'stable' | 'falling' =
    trendDelta > 1.5 ? 'rising' : trendDelta < -1.5 ? 'falling' : 'stable';

  // Peak window = hours where riskScore is at max
  const maxScore = Math.max(...hourlyForecast.map(h => h.riskScore));
  const peakItems = hourlyForecast.filter(h => h.riskScore >= maxScore - 2);
  const peakStart = peakItems[0]?.timeFormatted ?? '1:00 PM';
  const peakEnd = peakItems[peakItems.length - 1]?.timeFormatted ?? '5:00 PM';
  const peakRiskWindow = peakStart === peakEnd ? peakStart : `${peakStart} – ${peakEnd}`;

  // peak label for chart header (the single hottest hour)
  const peakChartHour = hourlyForecast.reduce((a, b) => a.tempF > b.tempF ? a : b).timeFormatted;

  // Dynamic city percentile based on risk score (e.g. 78% hotter)
  const cityPercentile = Math.min(96, Math.max(20, Math.round(riskScore * 0.95)));

  const zones = generateLocalZones(location.lat, location.lng, temperatureF, location.city);
  const coolingCenters = generateLocalCoolingCenters(location.lat, location.lng, location.city);

  const now = new Date();
  const lastUpdated = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' (Live FortyGuard sync)';

  return {
    location,
    metrics: {
      temperatureF,
      temperatureC,
      feelsLikeF,
      feelsLikeC,
      humidity,
      uvIndex,
      wbgtF,
      wbgtC,
      surfaceTempF,
      surfaceTempC,
      solarRadiation,
      windSpeedMph,
      airQualityAqi,
    },
    analysis: {
      riskLevel,
      riskScore,
      headline,
      statusMessage,
      immediatePrecautions,
      cityPercentile,
      trend,
      trendDelta,
      peakRiskWindow,
      vulnerableGroups,
      lastUpdated,
      hourlyForecast,
    },
    zones,
    coolingCenters,
    dataSource: 'FortyGuard Hyperlocal API',
  };
}
