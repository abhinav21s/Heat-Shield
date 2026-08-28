import { HeatMetrics, RiskLevel, VulnerableGroupRisk, HourlyForecastItem } from './types';

/**
 * Calculates Heat Index using the standard NOAA Rothfusz regression equation
 */
export function calculateHeatIndex(tempF: number, relativeHumidity: number): number {
  if (tempF < 80) {
    return tempF;
  }

  const T = tempF;
  const R = relativeHumidity;

  let HI = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094));

  if (HI >= 80) {
    HI = -42.379 +
      2.04901523 * T +
      10.14333127 * R -
      0.22475541 * T * R -
      0.00683783 * T * T -
      0.05481717 * R * R +
      0.00122874 * T * T * R +
      0.00085282 * T * R * R -
      0.00000199 * T * T * R * R;

    if (R < 13 && T >= 80 && T <= 112) {
      const adjustment = ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95.0)) / 17);
      HI -= adjustment;
    } else if (R > 85 && T >= 80 && T <= 87) {
      const adjustment = ((R - 85) / 10) * ((87 - T) / 5);
      HI += adjustment;
    }
  }

  return Math.round(HI * 10) / 10;
}

/**
 * Estimates Wet Bulb Globe Temperature (WBGT) in °F for outdoor occupational heat stress
 */
export function calculateWBGT(tempF: number, humidity: number, solarRadWm2: number = 750): number {
  const tempC = (tempF - 32) * (5 / 9);
  // Simplified Stull formula for wet bulb temp in Celsius
  const TwC = tempC * Math.atan(0.151977 * Math.pow(humidity + 8.313659, 0.5)) +
    Math.atan(tempC + humidity) -
    Math.atan(humidity - 1.676331) +
    0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) -
    4.686035;

  // Globe temp approximation in sun
  const TgC = tempC + (solarRadWm2 / 100);
  const WbgtC = 0.7 * TwC + 0.2 * TgC + 0.1 * tempC;
  const WbgtF = (WbgtC * 9) / 5 + 32;

  return Math.round(WbgtF * 10) / 10;
}

/**
 * Calculates a 0-100 Risk Score based on Temperature, Feels-like, WBGT, and UV Index
 */
export function calculateRiskScore(metrics: Pick<HeatMetrics, 'temperatureF' | 'feelsLikeF' | 'wbgtF' | 'uvIndex'>): number {
  const { feelsLikeF, wbgtF, uvIndex } = metrics;

  // Base score from feels-like
  let score = 0;
  if (feelsLikeF < 75) {
    score = Math.max(5, (feelsLikeF - 60) * 1.3);
  } else if (feelsLikeF < 85) {
    score = 25 + (feelsLikeF - 75) * 2.0; // 25 - 45
  } else if (feelsLikeF < 95) {
    score = 45 + (feelsLikeF - 85) * 2.5; // 45 - 70
  } else if (feelsLikeF < 105) {
    score = 70 + (feelsLikeF - 95) * 1.8; // 70 - 88
  } else {
    score = 88 + Math.min(12, (feelsLikeF - 105) * 1.2); // 88 - 100
  }

  // Factor in severe WBGT or extreme UV
  if (wbgtF > 88) score += 4;
  if (uvIndex >= 10) score += 3;

  return Math.min(100, Math.max(5, Math.round(score)));
}

/**
 * Determine Risk Level based on Risk Score
 */
export function getRiskLevelFromScore(score: number): RiskLevel {
  if (score < 40) return 'low';
  if (score < 65) return 'moderate';
  if (score < 85) return 'high';
  return 'extreme';
}

/**
 * Generate headline & plain language status message
 */
export function getStatusText(riskLevel: RiskLevel, tempF: number, feelsLikeF: number): { headline: string; statusMessage: string } {
  switch (riskLevel) {
    case 'low':
      return {
        headline: 'Mild & Safe Thermal Conditions',
        statusMessage: `Current heat index is ${Math.round(feelsLikeF)}°F. Outdoor activities are safe with standard hydration.`,
      };
    case 'moderate':
      return {
        headline: 'Moderate Heat Exposure – Caution Advised',
        statusMessage: `Feels like ${Math.round(feelsLikeF)}°F. Fatigue is possible with prolonged exposure. Seek periodic shade.`,
      };
    case 'high':
      return {
        headline: 'High Urban Heat Hazard – Limit Direct Sun',
        statusMessage: `Feels like ${Math.round(feelsLikeF)}°F. Heat cramps and heat exhaustion are likely with physical exertion.`,
      };
    case 'extreme':
      return {
        headline: 'Extreme Heat Danger – Life-Threatening Exposure',
        statusMessage: `Severe heat index of ${Math.round(feelsLikeF)}°F. Heat stroke is imminent with prolonged outdoor presence. Stay indoors in air conditioning.`,
      };
  }
}

/**
 * Generate actionable immediate precautions
 */
export function getImmediatePrecautions(riskLevel: RiskLevel): string[] {
  switch (riskLevel) {
    case 'low':
      return [
        'Drink at least 8-10 oz of water every 90 minutes when outdoors.',
        'Apply SPF 30+ sunscreen if out during peak daylight hours.',
        'Wear breathable, light-colored clothing.',
        'Check vehicle backseats before locking — interior temps rise quickly.',
      ];
    case 'moderate':
      return [
        'Drink 16 oz of cool water or electrolyte fluid every hour.',
        'Limit continuous unshaded strenuous activity to under 45 minutes.',
        'Check pavement temperature before walking pets (the 7-second hand test).',
        'Ensure elderly relatives and neighbors have operating AC or fans.',
        'Reschedule intense workouts to before 9:00 AM or after 7:30 PM.',
      ];
    case 'high':
      return [
        'Mandatory hydration: Drink 1 cup (8 oz) of water every 15-20 minutes.',
        'Avoid direct sun between 11:00 AM and 5:30 PM.',
        'Outdoor workers: Enforce a 15-minute rest/shade break every 45 minutes.',
        'Do not leave children or pets in cars for even 30 seconds.',
        'Locate your nearest designated municipal cooling shelter.',
        'Watch for heat exhaustion symptoms: dizziness, heavy sweating, nausea.',
      ];
    case 'extreme':
      return [
        'STAY INDOORS with air conditioning; fans alone are insufficient above 95°F.',
        'Cancel non-essential outdoor labor, athletic events, and direct exposure.',
        'Outdoor workers: 30-minute mandatory rest in shade/AC for every 30 minutes of work.',
        'Asphalt burns skin in seconds (surface temp exceeds 145°F) — keep pets on grass.',
        'If experiencing confusion, cessation of sweating, or vomiting: CALL 911 immediately.',
        'Utilize public cooling centers if your home AC is inadequate.',
      ];
  }
}

/**
 * Generate vulnerable population risks
 */
export function getVulnerableGroupRisks(riskLevel: RiskLevel): VulnerableGroupRisk[] {
  const isExtreme = riskLevel === 'extreme';
  const isHigh = riskLevel === 'high';

  return [
    {
      id: 'seniors',
      group: 'Older Adults (65+)',
      iconName: 'UserCheck',
      riskSeverity: isExtreme ? 'critical' : isHigh ? 'high' : 'moderate',
      impactSummary: 'Reduced sweating efficiency and cardiovascular strain make seniors vulnerable to rapid core overheating.',
      recommendedAction: 'Stay in climate-controlled environments (<78°F). Keep in phone contact twice daily.',
    },
    {
      id: 'workers',
      group: 'Outdoor & Construction Workers',
      iconName: 'HardHat',
      riskSeverity: isExtreme ? 'critical' : isHigh ? 'high' : 'moderate',
      impactSummary: 'Metabolic heat generation compounded by intense solar radiation and asphalt reflection.',
      recommendedAction: 'OSHA work-rest cycles, chilled electrolyte replenishment, and mandatory buddy monitoring.',
    },
    {
      id: 'children',
      group: 'Infants & Young Children',
      iconName: 'Baby',
      riskSeverity: isExtreme ? 'critical' : isHigh ? 'high' : 'low',
      impactSummary: 'Children absorb environmental heat faster and have a lower sweating capacity per body mass.',
      recommendedAction: 'Never leave unattended in vehicles. Limit playground equipment contact due to metal burns.',
    },
    {
      id: 'pets',
      group: 'Pets & Working Animals',
      iconName: 'Dog',
      riskSeverity: isExtreme ? 'critical' : isHigh ? 'high' : 'moderate',
      impactSummary: 'Dogs only sweat through paw pads and panting; hot asphalt causes 2nd-degree paw burns.',
      recommendedAction: 'Walk only on grass during early morning. Provide endless fresh cool water in shade.',
    },
  ];
}

/**
 * Generate 8-hour trend forecast starting from the current hour
 */
export function generateHourlyTrend(baseTempF: number, baseHumidity: number, currentHourOffset: number = 0): HourlyForecastItem[] {
  // Start from actual current hour, clamped so we always show a meaningful daytime window
  const now = new Date();
  const currentHour = now.getHours(); // 0-23
  // Show next 10 hours from now, but no later than 11 PM
  const startHour = Math.min(Math.max(currentHour, 6), 14); // always show at least 6 AM start
  const tempDeltas = [0, 2, 4.5, 6, 7.2, 6.5, 5, 3, 1, -1.5];

  const formatHour = (h: number) => {
    if (h === 0 || h === 24) return '12 AM';
    if (h === 12) return '12 PM';
    return h < 12 ? `${h} AM` : `${h - 12} PM`;
  };

  // Find the peak hour index (index of max delta = index 4 → startHour + 4)
  const peakHour = startHour + 4;
  const peakFormatted = formatHour(Math.min(peakHour, 23));

  return tempDeltas.map((delta, idx) => {
    const hour = startHour + idx;
    const tempF = Math.round((baseTempF + delta) * 10) / 10;
    const tempC = Math.round(((tempF - 32) * 5) / 9 * 10) / 10;
    const humidity = Math.max(15, Math.min(85, baseHumidity - delta * 1.2));
    const feelsLikeF = calculateHeatIndex(tempF, humidity);
    const feelsLikeC = Math.round(((feelsLikeF - 32) * 5) / 9 * 10) / 10;
    const wbgtF = calculateWBGT(tempF, humidity);
    // UV peaks at solar noon (~idx 2-4), fades at ends
    const uvIndex = Math.max(1, Math.min(12, Math.round(11 - Math.abs(idx - 3) * 1.5)));
    const riskScore = calculateRiskScore({ temperatureF: tempF, feelsLikeF, wbgtF, uvIndex });
    const riskLevel = getRiskLevelFromScore(riskScore);

    return {
      hour: `${hour}:00`,
      timeFormatted: formatHour(hour),
      tempF,
      tempC,
      feelsLikeF,
      feelsLikeC,
      riskScore,
      riskLevel,
      uvIndex,
      _peakLabel: peakFormatted, // internal use for chart header
    };
  });
}
