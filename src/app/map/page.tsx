'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useLocation } from '@/context/LocationContext';
import { Compass, Sparkles, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Dynamic import for Leaflet map to ensure 100% SSR safety in Next.js
const HeatMap = dynamic(() => import('@/components/map/HeatMap').then(mod => mod.HeatMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[650px] rounded-3xl bg-brand-surface border border-brand-border flex flex-col items-center justify-center space-y-3">
      <div className="w-10 h-10 rounded-2xl bg-brand text-white flex items-center justify-center animate-pulse">
        <Compass className="w-5 h-5" />
      </div>
      <p className="text-xs font-bold text-ink-secondary">Loading interactive urban heat map...</p>
    </div>
  ),
});

export default function MapPage() {
  const { report, openLocationModal } = useLocation();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-brand/10 text-brand">
              <Compass className="w-4 h-4" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-brand-dark">
              Interactive Heat Map
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight mt-1">
            Urban Heat Risk & Cooling Network
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
            Explore thermal micro-zones, asphalt hotspots, and air-conditioned cooling stations across {report?.location.name || 'the city'}.
          </p>
        </div>

        <Button variant="secondary" size="sm" onClick={openLocationModal}>
          <MapPin className="w-4 h-4 text-brand" />
          <span>Switch City</span>
        </Button>
      </div>

      {/* Map Container */}
      <div className="w-full h-[72vh] min-h-[580px]">
        <HeatMap />
      </div>
    </div>
  );
}
