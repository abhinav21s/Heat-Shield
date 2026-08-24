'use client';

import React from 'react';
import { TrendingUp, AlertOctagon, Flame, PawPrint, Building2, Trees, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { HeatReportData } from '@/lib/types';

interface SmartInsightsGridProps {
  report: HeatReportData;
}

export function SmartInsightsGrid({ report }: SmartInsightsGridProps) {
  const { analysis, metrics, location } = report;

  const isAsphaltExtreme = metrics.surfaceTempF >= 135;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-black text-ink-primary tracking-tight flex items-center gap-2">
          <Flame className="w-5 h-5 text-brand" />
          <span>Smart Thermal Insights</span>
        </h3>
        <span className="text-xs font-semibold text-ink-secondary">
          Hyperlocal Microclimate Analysis
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Insight 1: Urban Heat Island Comparison */}
        <Card className="bg-gradient-to-br from-white to-[#F8EDE6] border-brand-border/90 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-brand/10 text-brand">
                <Building2 className="w-5 h-5" />
              </span>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-brand/15 text-brand-dark">
                Top {100 - analysis.cityPercentile}% Hottest
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-primary">Urban Heat Island Disparity</h4>
              <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                Your location is currently <strong className="text-brand-dark">hotter than {analysis.cityPercentile}%</strong> of the metropolitan area due to asphalt density and lack of tree canopy shade.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-[11px] font-semibold text-ink-secondary">
            <span>Metropolitan Baseline</span>
            <span className="text-ink-primary font-bold">{Math.round(metrics.temperatureF - 5.5)}°F Avg</span>
          </div>
        </Card>

        {/* Insight 2: Short-Term Temperature Trend */}
        <Card className="bg-gradient-to-br from-white to-[#F8EDE6] border-brand-border/90 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="p-2 rounded-xl bg-[#D62828]/10 text-[#D62828]">
                <TrendingUp className="w-5 h-5" />
              </span>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-[#D62828]/15 text-[#B21E1E]">
                {analysis.trend.toUpperCase()} (+{analysis.trendDelta}°F)
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-primary">Afternoon Peak Trajectory</h4>
              <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                Thermal load will peak between <strong className="text-ink-primary">{analysis.peakRiskWindow}</strong>. Atmospheric convection will trap ambient heat until 7:30 PM.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-[11px] font-semibold text-ink-secondary">
            <span>Peak Heat Index Forecast</span>
            <span className="text-[#D62828] font-bold">{Math.round(metrics.feelsLikeF + 4)}°F</span>
          </div>
        </Card>

        {/* Insight 3: Pavement & Pet Safety Alert */}
        <Card className="bg-gradient-to-br from-white to-[#F8EDE6] border-brand-border/90 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={`p-2 rounded-xl ${isAsphaltExtreme ? 'bg-[#D62828]/15 text-[#D62828]' : 'bg-[#F2CC8F]/25 text-[#946A1B]'}`}>
                <PawPrint className="w-5 h-5" />
              </span>
              <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${isAsphaltExtreme ? 'bg-[#D62828]/15 text-[#B21E1E]' : 'bg-[#F2CC8F]/30 text-[#8C6014]'}`}>
                {isAsphaltExtreme ? 'Severe Burn Hazard' : 'Pavement Caution'}
              </span>
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink-primary">Asphalt & Ground Surface Contact</h4>
              <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                Asphalt is at <strong className="text-ink-primary">{Math.round(metrics.surfaceTempF)}°F</strong>. Contact exceeding 5 seconds causes 2nd-degree burns to bare human skin and pet paw pads.
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-[11px] font-semibold text-ink-secondary">
            <span>Pet Walk Safety Rule</span>
            <span className="text-brand-dark font-bold">Stick to Grass Only</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
