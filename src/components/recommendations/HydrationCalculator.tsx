'use client';

import React, { useState } from 'react';
import { Droplet, Sparkles, Activity, Clock, ShieldCheck, CupSoda } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function HydrationCalculator() {
  const [weightLbs, setWeightLbs] = useState<number>(160);
  const [durationHours, setDurationHours] = useState<number>(3);
  const [activityType, setActivityType] = useState<'light' | 'moderate' | 'strenuous'>('moderate');

  // Multiplier oz per hour based on intensity
  const activityRates = {
    light: 12, // oz/hr
    moderate: 20, // oz/hr
    strenuous: 32, // oz/hr
  };

  const baseRate = activityRates[activityType];
  const weightFactor = weightLbs / 150;
  const totalWaterOz = Math.round(baseRate * durationHours * weightFactor);
  const waterLiters = (totalWaterOz * 0.0295735).toFixed(1);
  const electrolytePacks = activityType === 'strenuous' ? Math.ceil(durationHours * 0.75) : activityType === 'moderate' ? Math.ceil(durationHours * 0.4) : 1;

  return (
    <Card className="bg-gradient-to-br from-white to-[#F8EDE6] border-brand-border shadow-card">
      <CardHeader className="pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <Droplet className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Dynamic Hydration & Electrolyte Planner</CardTitle>
            <p className="text-xs text-ink-secondary">Calculate exact fluid and mineral replacement needs for heat conditions</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5 space-y-6">
        {/* Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Weight */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary block">
              Body Weight ({weightLbs} lbs / {Math.round(weightLbs * 0.453592)} kg)
            </label>
            <input
              type="range"
              min="90"
              max="280"
              step="5"
              value={weightLbs}
              onChange={(e) => setWeightLbs(parseInt(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary block">
              Outdoor Exposure ({durationHours} hours)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="0.5"
              value={durationHours}
              onChange={(e) => setDurationHours(parseFloat(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
          </div>

          {/* Activity Intensity */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-ink-secondary block">
              Activity Level
            </label>
            <div className="grid grid-cols-3 gap-1">
              {(['light', 'moderate', 'strenuous'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setActivityType(level)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-all ${
                    activityType === level
                      ? 'bg-brand text-white shadow-sm'
                      : 'bg-white border border-brand-border text-ink-secondary hover:text-ink-primary'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculated Results Banner */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-brand/15 via-[#F2CC8F]/20 to-brand-surface border border-brand/40 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center sm:text-left">
          <div className="sm:border-r border-brand-border/80 pr-3">
            <span className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block">
              Total Recommended Water
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-1.5 mt-1">
              <span className="text-3xl font-black text-brand-dark">{totalWaterOz}</span>
              <span className="text-xs font-bold text-ink-secondary">oz ({waterLiters} Liters)</span>
            </div>
            <p className="text-[10px] text-ink-secondary mt-1">Drink ~{Math.round(totalWaterOz / (durationHours * 3))} oz every 20 mins</p>
          </div>

          <div className="sm:border-r border-brand-border/80 pr-3">
            <span className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block">
              Electrolyte Packets
            </span>
            <div className="flex items-baseline justify-center sm:justify-start gap-1.5 mt-1">
              <span className="text-3xl font-black text-[#946A1B]">{electrolytePacks}</span>
              <span className="text-xs font-bold text-ink-secondary">Servings</span>
            </div>
            <p className="text-[10px] text-ink-secondary mt-1">Sodium + Potassium + Magnesium</p>
          </div>

          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-bold text-ink-secondary uppercase tracking-wider block">
              Pre-Hydration Protocol
            </span>
            <p className="text-xs font-semibold text-ink-primary mt-1 leading-snug">
              Drink 16 oz of chilled water 45 minutes prior to outdoor departure.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
