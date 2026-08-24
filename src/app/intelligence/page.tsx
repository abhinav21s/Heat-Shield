'use client';

import React from 'react';
import { useLocation } from '@/context/LocationContext';
import { MicroclimateRanking } from '@/components/intelligence/MicroclimateRanking';
import { HeatIslandExplainer } from '@/components/intelligence/HeatIslandExplainer';
import { CoolingCentersList } from '@/components/intelligence/CoolingCentersList';
import { BarChart3, Building2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function IntelligencePage() {
  const { report, tempUnit, setSelectedZoneId, openLocationModal } = useLocation();
  const router = useRouter();

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
    router.push('/map');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-brand/10 text-brand">
              <BarChart3 className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-brand-dark">
              Urban Thermal Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight mt-1">
            Microclimates & Heat Island Disparities
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Compare thermal variations across neighborhoods and locate designated cooling infrastructure in {report?.location.name || 'the city'}.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={openLocationModal}>
          <MapPin className="w-4 h-4 text-brand" />
          <span>Change City</span>
        </Button>
      </div>

      {/* 1. Microclimate Heat Disparity Rankings */}
      {report && (
        <section>
          <MicroclimateRanking
            zones={report.zones}
            tempUnit={tempUnit}
            onSelectZone={handleSelectZone}
          />
        </section>
      )}

      {/* 2. Urban Heat Island Explainer */}
      <section>
        <HeatIslandExplainer />
      </section>

      {/* 3. Municipal Cooling Centers Directory */}
      {report && (
        <section>
          <CoolingCentersList coolingCenters={report.coolingCenters} />
        </section>
      )}
    </div>
  );
}
