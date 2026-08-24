'use client';

import React from 'react';
import { Users, HardHat, Baby, Dog, HeartPulse, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { VulnerableGroupRisk } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface WhoIsAtRiskCardProps {
  groups: VulnerableGroupRisk[];
}

export function WhoIsAtRiskCard({ groups }: WhoIsAtRiskCardProps) {
  const getIcon = (id: string) => {
    switch (id) {
      case 'seniors':
        return Users;
      case 'workers':
        return HardHat;
      case 'children':
        return Baby;
      case 'pets':
        return Dog;
      default:
        return HeartPulse;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="risk-extreme">Critical Vulnerability</Badge>;
      case 'high':
        return <Badge variant="risk-high">High Vulnerability</Badge>;
      case 'moderate':
        return <Badge variant="risk-moderate">Moderate</Badge>;
      default:
        return <Badge variant="risk-low">Standard</Badge>;
    }
  };

  return (
    <Card className="bg-gradient-to-b from-[#F8EDE6] to-white/95 shadow-card">
      <CardHeader className="pb-3 border-b border-brand-border/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <CardTitle className="text-base sm:text-lg">Who is Most at Risk Nearby</CardTitle>
            <p className="text-xs text-ink-secondary">Vulnerability assessment by demographic & activity profile</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {groups.map((item) => {
            const Icon = getIcon(item.id);
            return (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-white border border-brand-border/80 flex flex-col justify-between space-y-3 hover:border-brand/40 transition-all shadow-sm"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-brand-surface text-brand flex items-center justify-center">
                      <Icon className="w-4 h-4" />
                    </div>
                    {getSeverityBadge(item.riskSeverity)}
                  </div>
                  <h4 className="text-sm font-bold text-ink-primary">{item.group}</h4>
                  <p className="text-xs text-ink-secondary leading-relaxed">
                    {item.impactSummary}
                  </p>
                </div>

                <div className="pt-2 border-t border-brand-border/60">
                  <span className="text-[10px] uppercase font-bold text-ink-secondary block">Action Rule</span>
                  <p className="text-[11px] font-semibold text-brand-dark mt-0.5 leading-snug">
                    {item.recommendedAction}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
