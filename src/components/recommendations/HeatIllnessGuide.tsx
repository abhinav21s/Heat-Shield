'use client';

import React from 'react';
import { AlertOctagon, HeartCrack, Flame, PhoneCall, HelpCircle, ShieldAlert } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

export function HeatIllnessGuide() {
  return (
    <Card className="border-[#D62828]/40 bg-gradient-to-b from-[#F8EDE6] to-white/95 shadow-card">
      <CardHeader className="pb-3 border-b border-brand-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#D62828]/15 text-[#D62828] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Heat Illness Triage & Emergency Action</CardTitle>
              <p className="text-xs text-ink-secondary">Distinguish between Heat Exhaustion and life-threatening Heat Stroke</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-black text-[#D62828] px-3 py-1 rounded-full bg-[#D62828]/10 border border-[#D62828]/30">
            <PhoneCall className="w-3.5 h-3.5" /> Emergency: 911
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Heat Exhaustion Column */}
          <div className="p-5 rounded-2xl bg-white border border-[#F2CC8F] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#F2CC8F]/30 text-[#8C6014]">
                HEAT EXHAUSTION (Urgent)
              </span>
              <span className="text-xs font-bold text-ink-secondary">Core Temp &lt; 103°F</span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2">Key Symptoms</h4>
              <ul className="space-y-1.5 text-xs text-ink-primary font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2CC8F]" /> Heavy, profuse sweating
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2CC8F]" /> Paleness, cold or clammy skin
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2CC8F]" /> Fast, weak pulse & dizziness
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2CC8F]" /> Nausea, vomiting, or muscle cramps
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-brand-border space-y-1">
              <h4 className="text-xs font-bold text-brand-dark">Immediate First Aid:</h4>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Move to an air-conditioned room. Loosen clothing. Apply cool, wet towels to neck and armpits. Sip cool water. If vomiting continues past 15 mins, call 911.
              </p>
            </div>
          </div>

          {/* Heat Stroke Column (Critical) */}
          <div className="p-5 rounded-2xl bg-[#D62828]/5 border-2 border-[#D62828]/40 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-[#D62828] text-white animate-pulse">
                HEAT STROKE (MEDICAL EMERGENCY)
              </span>
              <span className="text-xs font-bold text-[#D62828]">Core Temp &gt; 104°F</span>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-2">Danger Symptoms</h4>
              <ul className="space-y-1.5 text-xs text-ink-primary font-bold">
                <li className="flex items-center gap-2 text-[#D62828]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D62828]" /> High body temp (104°F+)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D62828]" /> Hot, red, dry skin (or heavy sweat from exertion)
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D62828]" /> Confusion, slurred speech, delirium
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D62828]" /> Loss of consciousness or seizures
                </li>
              </ul>
            </div>

            <div className="pt-3 border-t border-[#D62828]/30 space-y-1">
              <h4 className="text-xs font-black text-[#D62828]">Emergency Action (Life-Threatening):</h4>
              <p className="text-xs text-ink-secondary leading-relaxed font-semibold">
                <strong>CALL 911 IMMEDIATELY.</strong> Move victim to shade. Immerse in cold water bath or apply ice packs to groin, armpits, and neck. <strong>DO NOT give fluids to drink</strong> if confused or unconscious.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
