'use client';

import React from 'react';
import Link from 'next/link';
import { AlertCircle, Flame, Compass, BookOpen, Clock, TrendingUp, Sparkles, ShieldCheck, Thermometer } from 'lucide-react';
import { HeatReportData } from '@/lib/types';
import { formatTemp, getRiskBadgeClasses, getRiskLabel } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface RiskHeroCardProps {
  report: HeatReportData;
  tempUnit: 'F' | 'C';
  onOpenMap?: () => void;
}

export function RiskHeroCard({ report, tempUnit }: RiskHeroCardProps) {
  const { analysis, metrics, location } = report;
  const badgeStyles = getRiskBadgeClasses(analysis.riskLevel);

  // Gradient background based on risk level
  const getHeroGradient = () => {
    switch (analysis.riskLevel) {
      case 'low':
        return 'from-[#81B29A]/20 via-[#FDF6F0] to-[#81B29A]/10 border-[#81B29A]/50';
      case 'moderate':
        return 'from-[#F2CC8F]/30 via-[#FDF6F0] to-[#F2CC8F]/15 border-[#F2CC8F]/70';
      case 'high':
        return 'from-[#E07A5F]/25 via-[#FDF6F0] to-[#E07A5F]/15 border-[#E07A5F]/60';
      case 'extreme':
        return 'from-[#D62828]/25 via-[#FDF6F0] to-[#D62828]/15 border-[#D62828]/60 shadow-[0_12px_40px_-10px_rgba(214,40,40,0.25)]';
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border-2 bg-gradient-to-br p-6 sm:p-8 md:p-10 transition-all ${getHeroGradient()}`}
    >
      {/* Background Subtle Shimmer Elements */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#F2CC8F]/15 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10">
        {/* Top Meta Line: Location & Timestamp */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-brand-border/80">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-brand animate-ping" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-ink-primary">
              {location.name}
            </span>
            {location.isUserLocation && (
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand/15 text-brand-dark">
                Your GPS Location
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-ink-secondary font-medium">
            <Clock className="w-3.5 h-3.5 text-ink-secondary" />
            <span>Updated: {analysis.lastUpdated}</span>
          </div>
        </div>

        {/* Central Dominant Visual: Risk Badge + Big Temperature + Score */}
        <div className="py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left / Main Column (7 cols): Risk status and big temperature */}
          <div className="lg:col-span-7 space-y-4">
            {/* Visually Dominant Risk Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-sm border shadow-soft">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: badgeStyles.hex }}
              >
                <div className="w-2 h-2 rounded-full bg-white animate-ping" />
              </div>
              <span className="text-sm sm:text-base font-black tracking-wide uppercase" style={{ color: badgeStyles.hex }}>
                {getRiskLabel(analysis.riskLevel)}
              </span>
              <span className="text-xs text-ink-secondary font-semibold pl-2 border-l border-brand-border">
                Risk Score: <strong className="text-ink-primary font-black">{analysis.riskScore}/100</strong>
              </span>
            </div>

            {/* Temperature Display */}
            <div className="flex flex-wrap items-baseline gap-4">
              <div className="flex items-start">
                <span className="text-6xl sm:text-7xl md:text-8xl font-black tracking-tighter text-ink-primary">
                  {formatTemp(metrics.temperatureF, tempUnit)}
                </span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-sm sm:text-base font-bold text-ink-primary">
                  <Flame className="w-4 h-4 text-brand" />
                  <span>Feels like {formatTemp(metrics.feelsLikeF, tempUnit)}</span>
                </div>
                <div className="text-xs text-ink-secondary font-medium">
                  WBGT: <strong className="text-ink-primary">{formatTemp(metrics.wbgtF, tempUnit)}</strong> | Humidity: <strong className="text-ink-primary">{metrics.humidity}%</strong>
                </div>
              </div>
            </div>

            {/* Plain-Language Status Message */}
            <div className="pt-2">
              <h2 className="text-xl sm:text-2xl font-black text-ink-primary tracking-tight">
                {analysis.headline}
              </h2>
              <p className="text-sm sm:text-base text-ink-secondary font-medium mt-1 leading-relaxed max-w-2xl">
                {analysis.statusMessage}
              </p>
            </div>
          </div>

          {/* Right Column (5 cols): Visual Risk Gauge & Quick Actions */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-5 bg-white/75 backdrop-blur-md rounded-3xl p-6 border border-brand-border shadow-card">
            {/* Risk Gauge Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-ink-secondary">Overall Heat Threat Severity</span>
                <span className="text-brand-dark font-black">{analysis.riskScore}%</span>
              </div>
              <div className="w-full h-3.5 bg-[#EADFD8] rounded-full overflow-hidden p-0.5 flex">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out shadow-sm"
                  style={{
                    width: `${analysis.riskScore}%`,
                    backgroundColor: badgeStyles.hex,
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-ink-secondary uppercase tracking-wider">
                <span>Low</span>
                <span>Moderate</span>
                <span>High</span>
                <span>Extreme</span>
              </div>
            </div>

            {/* Key Micro-Insights inside the hero */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-brand-surface border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-ink-secondary block">City Comparison</span>
                <span className="text-xs sm:text-sm font-black text-ink-primary mt-0.5 block">
                  Hotter than {analysis.cityPercentile}%
                </span>
                <span className="text-[10px] text-ink-secondary">of metropolitan zones</span>
              </div>

              <div className="p-3 rounded-xl bg-brand-surface border border-brand-border">
                <span className="text-[10px] uppercase font-bold text-ink-secondary block">Peak Heat Hours</span>
                <span className="text-xs sm:text-sm font-black text-ink-primary mt-0.5 block">
                  {analysis.peakRiskWindow}
                </span>
                <span className="text-[10px] text-ink-secondary">Max solar radiation</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <Link href="/map" className="flex-1">
                <Button variant="primary" size="md" className="w-full">
                  <Compass className="w-4 h-4" />
                  <span>View Heat Map</span>
                </Button>
              </Link>
              <Link href="/recommendations" className="flex-1">
                <Button variant="secondary" size="md" className="w-full">
                  <BookOpen className="w-4 h-4" />
                  <span>Precautions</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
