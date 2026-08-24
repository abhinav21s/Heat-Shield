'use client';

import React from 'react';
import { Layers, ArrowUpRight, ArrowDownRight, Trees, Building } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { HeatZone } from '@/lib/types';
import { formatTemp, getRiskBadgeClasses } from '@/lib/utils';
import { RiskBadge } from '@/components/ui/Badge';

interface MicroclimateRankingProps {
  zones: HeatZone[];
  tempUnit: 'F' | 'C';
  onSelectZone?: (zoneId: string) => void;
}

export function MicroclimateRanking({ zones, tempUnit, onSelectZone }: MicroclimateRankingProps) {
  // Sort from hottest to coolest
  const sortedZones = [...zones].sort((a, b) => b.tempF - a.tempF);
  const avgTemp = zones.reduce((acc, z) => acc + z.tempF, 0) / (zones.length || 1);

  return (
    <Card className="bg-gradient-to-b from-[#F8EDE6] to-white/95 shadow-card">
      <CardHeader className="pb-3 border-b border-brand-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Microclimate Heat Disparity Rankings</CardTitle>
              <p className="text-xs text-ink-secondary">Real-time thermal differential across urban zones</p>
            </div>
          </div>
          <span className="text-xs font-bold text-ink-secondary">
            City Average: <strong className="text-ink-primary">{formatTemp(avgTemp, tempUnit)}</strong>
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="space-y-3">
          {sortedZones.map((zone, idx) => {
            const diffFromAvg = Math.round((zone.tempF - avgTemp) * 10) / 10;
            const isHotter = diffFromAvg >= 0;

            return (
              <div
                key={zone.id}
                onClick={() => onSelectZone?.(zone.id)}
                className="p-4 rounded-2xl bg-white border border-brand-border hover:border-brand/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer shadow-sm group"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-brand-surface text-ink-secondary font-black text-xs flex items-center justify-center flex-shrink-0">
                    #{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-ink-primary group-hover:text-brand transition-colors">
                        {zone.name}
                      </h4>
                      <RiskBadge level={zone.riskLevel} size="sm" />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-ink-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <Trees className="w-3.5 h-3.5 text-[#81B29A]" /> {zone.treeCanopyCoverage}% Canopy
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-brand" /> {zone.imperviousSurface}% Paved
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-brand-border/60">
                  <div className="text-left sm:text-right">
                    <span className="text-lg font-black text-ink-primary block">
                      {formatTemp(zone.tempF, tempUnit)}
                    </span>
                    <span className="text-[10px] text-ink-secondary">
                      Surface: {formatTemp(zone.surfaceTempF, tempUnit)}
                    </span>
                  </div>

                  <div className={`flex items-center gap-0.5 text-xs font-black px-2.5 py-1 rounded-xl ${
                    isHotter ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                  }`}>
                    {isHotter ? (
                      <>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>+{diffFromAvg}°</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>{diffFromAvg}°</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
