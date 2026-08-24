'use client';

import React from 'react';
import { Clock, Sun, Flame } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { HourlyForecastItem } from '@/lib/types';
import { formatTemp, getRiskBadgeClasses } from '@/lib/utils';

interface HourlyTrendChartProps {
  forecast: HourlyForecastItem[];
  tempUnit: 'F' | 'C';
}

export function HourlyTrendChart({ forecast, tempUnit }: HourlyTrendChartProps) {
  const maxTemp = Math.max(...forecast.map((f) => f.tempF));
  const minTemp = Math.min(...forecast.map((f) => f.tempF));
  const tempRange = Math.max(1, maxTemp - minTemp + 5);

  return (
    <Card className="bg-gradient-to-b from-[#F8EDE6] to-white/95">
      <CardHeader className="pb-3 border-b border-brand-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Today’s Heat Risk Trajectory</CardTitle>
            <p className="text-xs text-ink-secondary">Hourly ambient temperature, heat index, and threat level</p>
          </div>
        </div>
        <span className="text-xs font-bold text-brand-dark px-2.5 py-1 rounded-full bg-brand/10">
          Peak at 3:00 PM
        </span>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="overflow-x-auto pb-2 scrollbar-none">
          <div className="flex items-end gap-3 min-w-[620px] pt-8">
            {forecast.map((item, idx) => {
              const heightPercent = Math.max(20, Math.min(100, ((item.tempF - (minTemp - 4)) / tempRange) * 100));
              const badgeStyle = getRiskBadgeClasses(item.riskLevel);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group">
                  {/* Floating Temp Tooltip on Top */}
                  <span className="text-xs font-black text-ink-primary mb-2 group-hover:scale-110 transition-transform">
                    {formatTemp(item.tempF, tempUnit)}
                  </span>

                  {/* Visual Heat Column */}
                  <div className="w-full max-w-[48px] h-36 bg-[#EADFD8]/60 rounded-2xl p-1 flex flex-col justify-end">
                    <div
                      className="w-full rounded-xl transition-all duration-500 shadow-sm group-hover:opacity-90 flex flex-col items-center justify-start pt-1.5"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: badgeStyle.hex,
                      }}
                    >
                      <span className="text-[10px] font-black text-white drop-shadow-sm">
                        {item.riskScore}
                      </span>
                    </div>
                  </div>

                  {/* Hourly Label */}
                  <span className="text-xs font-bold text-ink-primary mt-2">{item.timeFormatted}</span>

                  {/* UV Indicator */}
                  <span className="text-[10px] font-semibold text-ink-secondary mt-0.5 flex items-center gap-0.5">
                    <Sun className="w-2.5 h-2.5 text-brand" /> UV {item.uvIndex}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 pt-3 border-t border-brand-border/60 flex flex-wrap items-center justify-between gap-3 text-[11px] text-ink-secondary font-semibold">
          <span>Numbers inside bars indicate localized Risk Score (0-100)</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#81B29A]" /> Low (&lt;40)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F2CC8F]" /> Moderate (40-65)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E07A5F]" /> High (65-85)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D62828]" /> Extreme (85+)
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
