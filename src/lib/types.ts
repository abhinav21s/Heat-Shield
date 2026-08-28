export type RiskLevel = 'low' | 'moderate' | 'high' | 'extreme';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationInfo {
  name: string;
  district?: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  isUserLocation?: boolean;
}

export interface HeatMetrics {
  temperatureF: number;
  temperatureC: number;
  feelsLikeF: number;
  feelsLikeC: number;
  humidity: number; // percentage
  uvIndex: number;
  wbgtF: number; // Wet Bulb Globe Temperature
  wbgtC: number;
  surfaceTempF: number; // ground surface / asphalt temp
  surfaceTempC: number;
  solarRadiation: number; // W/m²
  windSpeedMph: number;
  airQualityAqi: number;
  elevationMeters?: number;
  co2Ppm?: number;
  methanePpb?: number;
  cloudCoverOctas?: number;
  pm25Index?: number;
  pm10Index?: number;
  no2Index?: number;
}

export interface VulnerableGroupRisk {
  id: string;
  group: string;
  iconName: string;
  riskSeverity: 'low' | 'moderate' | 'high' | 'critical';
  impactSummary: string;
  recommendedAction: string;
}

export interface HourlyForecastItem {
  hour: string;
  timeFormatted: string;
  tempF: number;
  tempC: number;
  feelsLikeF: number;
  feelsLikeC: number;
  riskScore: number;
  riskLevel: RiskLevel;
  uvIndex: number;
}

export interface HeatRiskAnalysis {
  riskLevel: RiskLevel;
  riskScore: number; // 0 to 100
  headline: string;
  statusMessage: string;
  immediatePrecautions: string[];
  cityPercentile: number; // e.g. 78 means hotter than 78% of the city
  trend: 'rising' | 'stable' | 'falling';
  trendDelta: number; // e.g. +2.5 °F
  peakRiskWindow: string; // e.g. "1:30 PM – 5:00 PM"
  vulnerableGroups: VulnerableGroupRisk[];
  lastUpdated: string;
  hourlyForecast: HourlyForecastItem[];
}

export interface CoolingCenter {
  id: string;
  name: string;
  type: 'Public Library' | 'Community Center' | 'Emergency Cooling Shelter' | 'Misting Station' | 'Splash Pad' | 'Senior Center' | 'Park or Garden' | 'Shopping Mall';
  address: string;
  lat: number;
  lng: number;
  distanceMiles: number;
  hours: string;
  isOpen: boolean;
  capacityStatus: 'Available' | 'High Demand' | 'Near Capacity';
  amenities: string[];
  phone: string;
}

export interface HeatZone {
  id: string;
  name: string;
  neighborhood: string;
  type: 'asphalt-corridor' | 'dense-urban' | 'park-canopy' | 'residential' | 'industrial-district' | 'waterfront-cooling';
  lat: number;
  lng: number;
  radiusMeters: number;
  tempF: number;
  tempC: number;
  surfaceTempF: number;
  surfaceTempC: number;
  riskLevel: RiskLevel;
  riskScore: number;
  treeCanopyCoverage: number; // %
  imperviousSurface: number; // %
  coolingRecommendation: string;
  whyRiskyOrCool: string;
  elevationMeters?: number;
  co2Ppm?: number;
  methanePpb?: number;
  cloudCoverOctas?: number;
  pm25Index?: number;
  pm10Index?: number;
  no2Index?: number;
}

export interface HeatReportData {
  location: LocationInfo;
  metrics: HeatMetrics;
  analysis: HeatRiskAnalysis;
  zones: HeatZone[];
  coolingCenters: CoolingCenter[];
  dataSource: 'FortyGuard Hyperlocal API' | 'Simulated FortyGuard Real-Time Engine';
}
