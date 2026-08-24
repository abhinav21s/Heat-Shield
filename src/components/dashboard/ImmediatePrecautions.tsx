'use client';

import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Copy, Check, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { RiskLevel } from '@/lib/types';
import { getRiskBadgeClasses } from '@/lib/utils';

interface ImmediatePrecautionsProps {
  precautions: string[];
  riskLevel: RiskLevel;
}

export function ImmediatePrecautions({ precautions, riskLevel }: ImmediatePrecautionsProps) {
  const [copied, setCopied] = useState(false);
  const badgeStyles = getRiskBadgeClasses(riskLevel);

  const handleCopy = () => {
    const text = `HeatShield Precautions (${riskLevel.toUpperCase()} RISK):\n` + precautions.map(p => `• ${p}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-brand/40 bg-gradient-to-b from-[#F8EDE6] to-white/90 shadow-card">
      <CardHeader className="pb-3 border-b border-brand-border/60 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: badgeStyles.hex }}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Immediate Heat Precautions</CardTitle>
            <p className="text-xs text-ink-secondary">Actionable safety rules for your immediate surroundings</p>
          </div>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-surface border border-brand-border hover:bg-white text-ink-secondary hover:text-ink-primary text-xs font-semibold transition-all shadow-sm"
          title="Copy precautions checklist"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-emerald-700">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Share</span>
            </>
          )}
        </button>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {precautions.map((precaution, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-white border border-brand-border/80 flex items-start gap-3 hover:border-brand/40 transition-all shadow-sm"
            >
              <div className="mt-0.5 w-5 h-5 rounded-full bg-brand/10 text-brand flex items-center justify-center flex-shrink-0 font-black text-[11px]">
                {idx + 1}
              </div>
              <p className="text-xs sm:text-sm font-medium text-ink-primary leading-relaxed">
                {precaution}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[#E07A5F]/10 border border-brand/20 flex items-center gap-2.5 text-xs text-ink-secondary">
          <Info className="w-4 h-4 text-brand flex-shrink-0" />
          <span>
            Hydration rate needs increase by <strong>30%</strong> under direct sunlight and high wind exposure.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
