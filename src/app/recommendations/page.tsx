'use client';

import React from 'react';
import { useLocation } from '@/context/LocationContext';
import { ActionChecklist } from '@/components/recommendations/ActionChecklist';
import { HydrationCalculator } from '@/components/recommendations/HydrationCalculator';
import { HeatIllnessGuide } from '@/components/recommendations/HeatIllnessGuide';
import { BookOpen, ShieldCheck } from 'lucide-react';

export default function RecommendationsPage() {
  const { report } = useLocation();
  const riskLevel = report?.analysis.riskLevel || 'high';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-brand/10 text-brand">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="text-xs font-black uppercase tracking-wider text-brand-dark">
            Action Guidance & Protocols
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-ink-primary tracking-tight mt-1">
          Comprehensive Heat Protection Playbook
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">
          Practical precautions, hydration calculations, and medical first-aid protocols tailored to current heat severity.
        </p>
      </div>

      {/* 1. Categorized Action Checklist */}
      <section>
        <ActionChecklist riskLevel={riskLevel} />
      </section>

      {/* 2. Interactive Hydration & Electrolyte Calculator */}
      <section>
        <HydrationCalculator />
      </section>

      {/* 3. Heat Illness Medical Triage Guide */}
      <section>
        <HeatIllnessGuide />
      </section>
    </div>
  );
}
