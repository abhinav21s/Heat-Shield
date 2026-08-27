'use client';

import React from 'react';
import { X, Flame, Trees, Building, ShieldCheck, MapPin, Phone, Clock, ExternalLink, Navigation } from 'lucide-react';
import { HeatZone, CoolingCenter } from '@/lib/types';
import { formatTemp, getRiskBadgeClasses, getRiskLabel } from '@/lib/utils';
import { Badge, RiskBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLocation } from '@/context/LocationContext';

interface ZoneDetailSheetProps {
  zone: HeatZone | null;
  nearestCoolingCenter?: CoolingCenter;
  tempUnit: 'F' | 'C';
  onClose: () => void;
}

export function ZoneDetailSheet({ zone, nearestCoolingCenter, tempUnit, onClose }: ZoneDetailSheetProps) {
  const { activeRouteCcId, setActiveRouteCcId } = useLocation();
  if (!zone) return null;

  const badgeStyles = getRiskBadgeClasses(zone.riskLevel);

  return (
    <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 sm:bottom-auto sm:w-[420px] bg-white/95 backdrop-blur-md rounded-3xl border border-brand-border shadow-2xl p-5 sm:p-6 z-30 transition-all animate-in slide-in-from-bottom-5 duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-brand-border">
        <div>
          <div className="flex items-center gap-2">
            <RiskBadge level={zone.riskLevel} size="sm" />
            <span className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider">
              {zone.neighborhood}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-ink-primary mt-1 leading-snug">
            {zone.name}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-brand-border/60 text-ink-secondary hover:text-ink-primary transition-colors"
          aria-label="Close details"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="py-4 space-y-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto pr-1">
        {/* Core Metrics Row */}
        <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-brand-surface border border-brand-border">
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-secondary block">Air Temperature</span>
            <span className="text-2xl font-black text-ink-primary">
              {formatTemp(zone.tempF, tempUnit)}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-ink-secondary block">Asphalt / Surface</span>
            <span className="text-2xl font-black text-brand-dark">
              {formatTemp(zone.surfaceTempF, tempUnit)}
            </span>
          </div>
        </div>

        {/* Microclimate Factors */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2">
            Urban Microclimate Profile
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-white border border-brand-border flex items-center gap-2">
              <Trees className="w-4 h-4 text-[#81B29A]" />
              <div>
                <span className="text-[10px] text-ink-secondary block">Tree Canopy</span>
                <span className="font-bold text-ink-primary">{zone.treeCanopyCoverage}% cover</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white border border-brand-border flex items-center gap-2">
              <Building className="w-4 h-4 text-brand" />
              <div>
                <span className="text-[10px] text-ink-secondary block">Impervious Area</span>
                <span className="font-bold text-ink-primary">{zone.imperviousSurface}% paved</span>
              </div>
            </div>
          </div>
        </div>

        {/* Why this zone is risky or cool */}
        <div className="p-3 rounded-xl bg-brand-surface/60 border border-brand-border space-y-1">
          <span className="text-[10px] uppercase font-bold text-ink-secondary block">Thermal Diagnosis</span>
          <p className="text-xs text-ink-primary font-medium leading-relaxed">
            {zone.whyRiskyOrCool}
          </p>
        </div>

        {/* Specific Zone Recommendation */}
        <div className="p-3 rounded-xl bg-white border border-brand/30 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-dark">
            <ShieldCheck className="w-4 h-4 text-brand" />
            <span>Zone Protection Directive</span>
          </div>
          <p className="text-xs text-ink-secondary font-medium leading-relaxed">
            {zone.coolingRecommendation}
          </p>
        </div>

        {/* Nearest Cooling Center Card */}
        {nearestCoolingCenter && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#81B29A]/15 to-[#F8EDE6] border border-[#81B29A]/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-black text-[#2C5242] tracking-wider flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#81B29A]" /> Nearest Cooling Shelter
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#2C5242] border border-[#81B29A]/30">
                {nearestCoolingCenter.distanceMiles} mi away
              </span>
            </div>

            <h5 className="text-xs font-bold text-ink-primary">{nearestCoolingCenter.name}</h5>
            <p className="text-[11px] text-ink-secondary">{nearestCoolingCenter.address}</p>

            <div className="flex items-center gap-3 text-[10px] font-medium text-ink-secondary pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand" /> {nearestCoolingCenter.hours}
              </span>
            </div>

            <div className="pt-2">
              <Button
                variant={activeRouteCcId === nearestCoolingCenter.id ? 'secondary' : 'primary'}
                size="sm"
                className="w-full text-xs font-bold py-1.5 flex items-center justify-center gap-2"
                onClick={() => {
                  if (activeRouteCcId === nearestCoolingCenter.id) {
                    setActiveRouteCcId(null);
                  } else {
                    setActiveRouteCcId(nearestCoolingCenter.id);
                  }
                }}
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>
                  {activeRouteCcId === nearestCoolingCenter.id ? 'Cancel Routing' : 'Plan Cool Route'}
                </span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
