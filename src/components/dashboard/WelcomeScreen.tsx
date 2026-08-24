'use client';

import React, { useState } from 'react';
import { Shield, Navigation, MapPin, Flame, Thermometer, ShieldAlert, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLocation } from '@/context/LocationContext';
import { HOT_US_CITIES } from '@/lib/mockHeatData';

export function WelcomeScreen() {
  const { requestGeolocation, openLocationModal, startApp, setLocationByCity } = useLocation();
  const [isLocating, setIsLocating] = useState(false);

  const handleCheckRisk = async () => {
    setIsLocating(true);
    try {
      const success = await requestGeolocation();
      if (!success) {
        // If denied, fallback to opening location modal
        openLocationModal();
      }
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 py-12">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-72 h-72 bg-[#F2CC8F]/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-3xl mx-auto space-y-8">
        {/* Brand Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand/10 border border-brand/20 shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
          <Shield className="w-4 h-4 text-brand" />
          <span className="text-xs font-black uppercase tracking-wider text-brand-dark">
            Real-Time Urban Heat Protection
          </span>
        </div>

        {/* Hero Title */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-ink-primary tracking-tight leading-[1.08]">
            Understand Your <span className="text-brand">Heat Risk</span> in Seconds.
          </h1>
          <p className="text-base sm:text-xl text-ink-secondary font-medium max-w-2xl mx-auto leading-relaxed">
            Extreme urban heat is dangerous. HeatShield turns hyperlocal temperature and microclimate data into clear, life-saving personal guidance.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <Button
            size="lg"
            variant="primary"
            onClick={handleCheckRisk}
            isLoading={isLocating}
            className="w-full sm:w-auto text-base px-8 py-4 shadow-glow"
          >
            <Navigation className="w-5 h-5" />
            <span>Check My Heat Risk</span>
          </Button>

          <Button
            size="lg"
            variant="secondary"
            onClick={openLocationModal}
            className="w-full sm:w-auto text-base px-6 py-4"
          >
            <MapPin className="w-5 h-5 text-brand" />
            <span>Choose Location on Map</span>
          </Button>

          <Button
            size="lg"
            variant="ghost"
            onClick={startApp}
            className="w-full sm:w-auto text-base px-5 py-4 text-brand-dark font-bold hover:bg-brand/10 border border-brand/20"
          >
            <span>Explore Dashboard</span>
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>

        {/* Privacy badge */}
        <p className="text-xs text-ink-secondary/80 flex items-center justify-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-brand" />
          <span>We use your location only to calculate local heat risk. No tracking.</span>
        </p>

        {/* Quick select hotspot cities */}
        <div className="pt-8 border-t border-brand-border/60">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-secondary block mb-3">
            Or explore current extreme heat hotspots:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {HOT_US_CITIES.slice(0, 5).map((city) => (
              <button
                key={city.id}
                onClick={() => setLocationByCity(city.id)}
                className="px-3.5 py-1.5 rounded-xl bg-white border border-brand-border hover:border-brand hover:bg-brand/5 text-xs font-bold text-ink-primary shadow-soft transition-all"
              >
                🔥 {city.name}, {city.state} ({city.baseTempF}°F)
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
