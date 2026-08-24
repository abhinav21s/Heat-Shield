'use client';

import React from 'react';
import { useLocation } from '@/context/LocationContext';
import { WelcomeScreen } from '@/components/dashboard/WelcomeScreen';
import { RiskHeroCard } from '@/components/dashboard/RiskHeroCard';
import { MetricCardsGrid } from '@/components/dashboard/MetricCardsGrid';
import { ImmediatePrecautions } from '@/components/dashboard/ImmediatePrecautions';
import { SmartInsightsGrid } from '@/components/dashboard/SmartInsightsGrid';
import { HourlyTrendChart } from '@/components/dashboard/HourlyTrendChart';
import { WhoIsAtRiskCard } from '@/components/dashboard/WhoIsAtRiskCard';
import { Button } from '@/components/ui/Button';
import { Compass, BookOpen, BarChart3, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const { report, isLoading, hasStarted, tempUnit } = useLocation();

  if (!hasStarted) {
    return <WelcomeScreen />;
  }

  if (isLoading && !report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-brand text-white flex items-center justify-center animate-bounce shadow-glow">
          <Sparkles className="w-6 h-6" />
        </div>
        <p className="text-sm font-bold text-ink-secondary">Computing hyperlocal thermal risk profile...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <p className="text-sm font-bold text-ink-secondary">No heat report found. Please choose a location.</p>
        <Link href="/">
          <Button>Select Location</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Visually Dominant Hero Risk Card */}
      <section>
        <RiskHeroCard report={report} tempUnit={tempUnit} />
      </section>

      {/* 2. Hyperlocal Thermal Metrics Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-ink-primary tracking-tight">
            Microclimate Diagnostics
          </h3>
          <span className="text-xs font-semibold text-ink-secondary">
            Live FortyGuard Sensor Grid
          </span>
        </div>
        <MetricCardsGrid metrics={report.metrics} tempUnit={tempUnit} />
      </section>

      {/* 3. Immediate Action Precautions */}
      <section>
        <ImmediatePrecautions
          precautions={report.analysis.immediatePrecautions}
          riskLevel={report.analysis.riskLevel}
        />
      </section>

      {/* 4. Smart Insights Grid */}
      <section>
        <SmartInsightsGrid report={report} />
      </section>

      {/* 5. Today's Hourly Heat Trajectory */}
      <section>
        <HourlyTrendChart forecast={report.analysis.hourlyForecast} tempUnit={tempUnit} />
      </section>

      {/* 6. Who is Most at Risk Demographic Breakdown */}
      <section>
        <WhoIsAtRiskCard groups={report.analysis.vulnerableGroups} />
      </section>

      {/* 7. Bottom Navigation Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <Link href="/map" className="group">
          <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand/50 transition-all shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-primary">Interactive Heat Map</h4>
                <p className="text-xs text-ink-secondary">Inspect micro-zones & cooling centers</p>
              </div>
            </div>
            <span className="text-brand font-bold text-sm">→</span>
          </div>
        </Link>

        <Link href="/recommendations" className="group">
          <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand/50 transition-all shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F2CC8F] text-[#8C6014] flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-primary">Action Checklist & Tools</h4>
                <p className="text-xs text-ink-secondary">Hydration planner & OSHA rules</p>
              </div>
            </div>
            <span className="text-brand font-bold text-sm">→</span>
          </div>
        </Link>

        <Link href="/intelligence" className="group">
          <div className="p-5 rounded-2xl bg-brand-surface border border-brand-border hover:border-brand/50 transition-all shadow-soft flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#81B29A] text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-primary">Area Intelligence</h4>
                <p className="text-xs text-ink-secondary">Microclimate rankings & shelters</p>
              </div>
            </div>
            <span className="text-brand font-bold text-sm">→</span>
          </div>
        </Link>
      </section>
    </div>
  );
}
