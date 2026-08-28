'use client';

import React from 'react';
import { X, Flame, Trees, Building, ShieldCheck, MapPin, Phone, Clock, ExternalLink, Navigation, Sparkles } from 'lucide-react';
import { HeatZone, CoolingCenter, RiskLevel } from '@/lib/types';
import { formatTemp, getRiskBadgeClasses, getRiskLabel } from '@/lib/utils';
import { Badge, RiskBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useLocation } from '@/context/LocationContext';

interface ZoneDetailSheetProps {
  zone: HeatZone | null;
  nearestCoolingCenter: CoolingCenter | null;
  tempUnit: 'F' | 'C';
  onClose: () => void;
}

export function ZoneDetailSheet({ zone, nearestCoolingCenter, tempUnit, onClose }: ZoneDetailSheetProps) {
  const { activeRouteCcId, setActiveRouteCcId, isLoading, selectedZoneId } = useLocation();

  const isPinnedSyncing = selectedZoneId === 'pinned-location' && isLoading;

  if (!zone && !isPinnedSyncing) return null;

  // Custom border left-accents based on risk level for clean SaaS styling
  const borderAccentMap: Record<RiskLevel, string> = {
    low: 'border-l-4 border-l-[#81B29A]',
    moderate: 'border-l-4 border-l-[#F2CC8F]',
    high: 'border-l-4 border-l-[#E07A5F]',
    extreme: 'border-l-4 border-l-[#D62828]',
  };
  const borderAccent = zone ? borderAccentMap[zone.riskLevel] : 'border-l-4 border-l-brand';

  return (
    <div className={`absolute bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 sm:bottom-auto sm:w-[420px] bg-white/98 backdrop-blur-lg rounded-3xl border border-brand-border shadow-2xl p-5 sm:p-6 z-30 transition-all animate-in slide-in-from-bottom-5 duration-200 max-h-[82vh] flex flex-col ${borderAccent}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-brand-border flex-shrink-0">
        <div>
          <div className="flex items-center gap-2">
            {zone && <RiskBadge level={zone.riskLevel} size="sm" />}
            <span className="text-[10px] font-black text-ink-secondary uppercase tracking-widest">
              {zone ? zone.neighborhood : 'Street Search'}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-ink-primary mt-1 leading-snug">
            {zone ? zone.name : 'Detecting Microclimate...'}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-brand-surface text-ink-secondary hover:text-ink-primary transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {isPinnedSyncing ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4 flex-1 text-center">
          <div className="w-9 h-9 rounded-full border-4 border-brand border-t-transparent animate-spin"></div>
          <div>
            <p className="text-xs font-bold text-brand-dark animate-pulse">Syncing street-level sensors...</p>
            <p className="text-[10px] text-ink-secondary mt-1">Querying FortyGuard Apparent Temperature Model</p>
          </div>
        </div>
      ) : zone && (
        <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1 scrollbar-thin">
          {/* Core Temperature Dashboard */}
          <div className="p-4 rounded-2xl bg-neutral-50/70 border border-neutral-100 flex items-center justify-between">
            <div className="flex-1 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-ink-secondary tracking-widest block">Air Temp</span>
              <span className="text-3xl font-extrabold text-ink-primary tracking-tight">
                {formatTemp(zone.tempF, tempUnit)}
              </span>
            </div>
            
            <div className="h-10 w-[1px] bg-neutral-200/80 mx-4 flex-shrink-0" />
            
            <div className="flex-1 space-y-0.5">
              <span className="text-[9px] font-black uppercase text-ink-secondary tracking-widest block">Ground Temp</span>
              <span className="text-3xl font-extrabold text-brand-dark tracking-tight">
                {formatTemp(zone.surfaceTempF, tempUnit)}
              </span>
            </div>
          </div>

          {/* Microclimate Profile */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-black uppercase tracking-wider text-ink-secondary">
              Microclimate Factors
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white rounded-xl border border-neutral-100/80 flex items-center gap-2">
                <Trees className="w-4 h-4 text-[#81B29A]" />
                <div className="flex-1">
                  <span className="text-[9px] text-ink-secondary font-semibold block uppercase">Tree Canopy</span>
                  <span className="font-extrabold text-ink-primary text-sm">{zone.treeCanopyCoverage}% cover</span>
                </div>
              </div>

              <div className="p-3 bg-white rounded-xl border border-neutral-100/80 flex items-center gap-2">
                <Building className="w-4 h-4 text-[#E07A5F]" />
                <div className="flex-1">
                  <span className="text-[9px] text-ink-secondary font-semibold block uppercase">Impervious Paved</span>
                  <span className="font-extrabold text-ink-primary text-sm">{zone.imperviousSurface}% paved</span>
                </div>
              </div>
            </div>
          </div>

          {/* Thermal Diagnosis & Advisory */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-brand-surface border-l-4 border-l-brand/75 space-y-1">
              <span className="text-[9px] uppercase font-bold text-brand-dark tracking-widest block">Diagnostics</span>
              <p className="text-xs text-ink-primary font-medium leading-relaxed">
                {zone.whyRiskyOrCool}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#E07A5F]/5 border-l-4 border-l-[#E07A5F]/75 space-y-1">
              <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-[#E07A5F]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Safety Advisory Directive</span>
              </div>
              <p className="text-xs text-ink-secondary font-medium leading-relaxed">
                {zone.coolingRecommendation}
              </p>
            </div>
          </div>

          {/* FortyGuard Atmospheric Telemetry */}
          {(zone.co2Ppm !== undefined || zone.methanePpb !== undefined || zone.elevationMeters !== undefined) && (
            <div className="p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100/85 space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-neutral-100">
                <span className="text-[9px] font-black uppercase text-[#E07A5F] tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-brand" /> FortyGuard Insights
                </span>
                <span className="text-[8px] bg-neutral-200/60 text-ink-secondary font-bold px-1.5 py-0.5 rounded-md">
                  Real-time
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                {zone.co2Ppm !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[9px] text-ink-secondary font-semibold uppercase">Carbon Dioxide</span>
                    <span className="font-extrabold text-ink-primary mt-0.5">{zone.co2Ppm} <span className="text-[8px] font-normal text-ink-secondary">ppm</span></span>
                  </div>
                )}
                {zone.methanePpb !== undefined && (
                  <div className="flex flex-col">
                    <span className="text-[9px] text-ink-secondary font-semibold uppercase">Methane</span>
                    <span className="font-extrabold text-ink-primary mt-0.5">{zone.methanePpb} <span className="text-[8px] font-normal text-ink-secondary">ppb</span></span>
                  </div>
                )}
                {zone.elevationMeters !== undefined && (
                  <div className="col-span-2 border-t border-neutral-100/70 pt-2 flex justify-between items-center">
                    <span className="text-[9px] text-ink-secondary font-semibold uppercase">Altitude / Elevation</span>
                    <span className="font-bold text-ink-primary text-xs">{zone.elevationMeters} m</span>
                  </div>
                )}
                {zone.cloudCoverOctas !== undefined && (
                  <div className="col-span-2 border-t border-neutral-100/70 pt-2 flex justify-between items-center">
                    <span className="text-[9px] text-ink-secondary font-semibold uppercase">Solar Cloud Cover</span>
                    <span className="font-bold text-ink-primary text-xs">{zone.cloudCoverOctas}/8 octas</span>
                  </div>
                )}
              </div>

              {/* Air Pollutants */}
              {(zone.pm25Index !== undefined || zone.pm10Index !== undefined || zone.no2Index !== undefined) && (
                <div className="pt-2 border-t border-neutral-100 grid grid-cols-3 gap-2 text-center text-[10px]">
                  {zone.pm25Index !== undefined && (
                    <div className="p-1 rounded-xl bg-white/60 border border-neutral-100">
                      <span className="text-[8px] text-ink-secondary font-semibold block uppercase">PM2.5</span>
                      <strong className="text-xs font-black text-ink-primary">{zone.pm25Index}</strong>
                    </div>
                  )}
                  {zone.pm10Index !== undefined && (
                    <div className="p-1 rounded-xl bg-white/60 border border-neutral-100">
                      <span className="text-[8px] text-ink-secondary font-semibold block uppercase">PM10</span>
                      <strong className="text-xs font-black text-ink-primary">{zone.pm10Index}</strong>
                    </div>
                  )}
                  {zone.no2Index !== undefined && (
                    <div className="p-1 rounded-xl bg-white/60 border border-neutral-100">
                      <span className="text-[8px] text-ink-secondary font-semibold block uppercase">NO₂</span>
                      <strong className="text-xs font-black text-ink-primary">{zone.no2Index}</strong>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Nearest Cooling Center Card */}
          {nearestCoolingCenter && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#81B29A]/10 to-[#F8EDE6]/30 border border-[#81B29A]/30 space-y-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-black text-[#2C5242] tracking-widest flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#81B29A]" /> Nearest Shelter
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#81B29A]/20 text-[#2C5242]">
                  {nearestCoolingCenter.distanceMiles} mi away
                </span>
              </div>

              <div>
                <h5 className="text-xs font-bold text-ink-primary">{nearestCoolingCenter.name}</h5>
                <p className="text-[11px] text-ink-secondary mt-0.5">{nearestCoolingCenter.address}</p>
              </div>

              <div className="flex items-center gap-3 text-[10px] font-medium text-ink-secondary">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#81B29A]" /> {nearestCoolingCenter.hours}
                </span>
              </div>

              <div className="pt-1">
                <Button
                  variant={activeRouteCcId === nearestCoolingCenter.id ? 'secondary' : 'primary'}
                  size="sm"
                  className="w-full text-xs font-bold py-2 flex items-center justify-center gap-2 shadow-sm rounded-xl"
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
      )}
    </div>
  );
}
