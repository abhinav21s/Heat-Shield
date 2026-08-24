'use client';

import React from 'react';
import { Sun, Trees, Building, Wind, Flame, HelpCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function HeatIslandExplainer() {
  const drivers = [
    {
      title: 'Low Surface Albedo (Dark Asphalt)',
      description: 'Dark asphalt, black tar roofs, and parking lots absorb up to 90% of solar radiation, re-radiating heat into ambient air throughout the night.',
      icon: Sun,
      stat: 'Reaches up to 150°F',
    },
    {
      title: 'Tree Canopy Deficit',
      description: 'Neighborhoods lacking mature trees miss out on natural evaporative cooling and direct solar shading, creating localized heat traps.',
      icon: Trees,
      stat: 'Up to 9°F cooler in shade',
    },
    {
      title: 'Building Geometry & Heat Trapping',
      description: 'Tall, narrow street canyons block prevailing natural wind vectors, preventing heat dissipation and ventilation.',
      icon: Building,
      stat: '50% wind reduction',
    },
    {
      title: 'Anthropogenic Waste Heat',
      description: 'Air conditioners running continuously exhaust intense thermal heat directly into street corridors, exacerbating the outdoor temperature.',
      icon: Flame,
      stat: '+3°F street exhaust',
    },
  ];

  return (
    <Card className="bg-gradient-to-br from-white to-[#F8EDE6] border-brand-border shadow-card">
      <CardHeader className="pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Understanding the Urban Heat Island (UHI) Effect</CardTitle>
            <p className="text-xs text-ink-secondary">Why urban districts heat up significantly faster than surrounding rural environments</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {drivers.map((driver, idx) => {
            const Icon = driver.icon;
            return (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-brand-border space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-brand-surface text-brand flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-brand/10 text-brand-dark">
                    {driver.stat}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-ink-primary">{driver.title}</h4>
                <p className="text-xs text-ink-secondary leading-relaxed">{driver.description}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
