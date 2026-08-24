'use client';

import React from 'react';
import { Sun, Droplets, Wind, Activity, Layers, Gauge } from 'lucide-react';
import { HeatMetrics } from '@/lib/types';
import { Card } from '@/components/ui/Card';
import { formatTemp } from '@/lib/utils';

interface MetricCardsGridProps {
  metrics: HeatMetrics;
  tempUnit: 'F' | 'C';
}

export function MetricCardsGrid({ metrics, tempUnit }: MetricCardsGridProps) {
  const getUvSeverity = (uv: number) => {
    if (uv <= 2) return { label: 'Low', color: 'text-[#81B29A]' };
    if (uv <= 5) return { label: 'Moderate', color: 'text-[#F2CC8F]' };
    if (uv <= 7) return { label: 'High', color: 'text-[#E07A5F]' };
    if (uv <= 10) return { label: 'Very High', color: 'text-[#D62828]' };
    return { label: 'Extreme', color: 'text-[#B21E1E]' };
  };

  const getAqiSeverity = (aqi: number) => {
    if (aqi <= 50) return { label: 'Good', color: 'text-[#81B29A]' };
    if (aqi <= 100) return { label: 'Moderate', color: 'text-[#F2CC8F]' };
    return { label: 'Unhealthy for Sensitive Groups', color: 'text-[#E07A5F]' };
  };

  const uvInfo = getUvSeverity(metrics.uvIndex);
  const aqiInfo = getAqiSeverity(metrics.airQualityAqi);

  const cards = [
    {
      title: 'Asphalt / Surface Temp',
      value: formatTemp(metrics.surfaceTempF, tempUnit),
      subtext: metrics.surfaceTempF > 130 ? 'Severe burn hazard on contact' : 'Elevated ground thermal radiation',
      icon: Layers,
      highlight: metrics.surfaceTempF > 130,
    },
    {
      title: 'Wet Bulb Globe (WBGT)',
      value: formatTemp(metrics.wbgtF, tempUnit),
      subtext: metrics.wbgtF > 88 ? 'Extreme occupational heat stress' : 'Standard work-rest baseline',
      icon: Gauge,
      highlight: metrics.wbgtF > 88,
    },
    {
      title: 'UV Radiation Index',
      value: `${metrics.uvIndex} / 12`,
      subtext: `${uvInfo.label} – Burn time ~15 mins`,
      icon: Sun,
      highlight: metrics.uvIndex >= 9,
    },
    {
      title: 'Relative Humidity',
      value: `${metrics.humidity}%`,
      subtext: metrics.humidity > 60 ? 'Suppresses body evaporative cooling' : 'Dry thermal conditions',
      icon: Droplets,
      highlight: false,
    },
    {
      title: 'Solar Radiation',
      value: `${metrics.solarRadiation} W/m²`,
      subtext: 'Direct sun energy flux on surfaces',
      icon: Activity,
      highlight: false,
    },
    {
      title: 'Air Quality (AQI)',
      value: `${metrics.airQualityAqi} AQI`,
      subtext: aqiInfo.label,
      icon: Wind,
      highlight: metrics.airQualityAqi > 100,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {cards.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Card
            key={idx}
            className={`p-4 flex flex-col justify-between transition-all ${
              item.highlight
                ? 'border-brand/50 bg-gradient-to-b from-[#E07A5F]/10 to-brand-surface'
                : 'hover:bg-white/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-ink-secondary leading-tight line-clamp-1">
                {item.title}
              </span>
              <Icon className="w-4 h-4 text-brand flex-shrink-0" />
            </div>

            <div className="my-2">
              <span className="text-xl sm:text-2xl font-black text-ink-primary tracking-tight">
                {item.value}
              </span>
            </div>

            <p className="text-[10px] text-ink-secondary leading-snug line-clamp-2">
              {item.subtext}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
