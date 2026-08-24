'use client';

import React, { useState } from 'react';
import { ShieldCheck, HardHat, UserCheck, Dog, CheckCircle2, Circle, AlertCircle, Droplet, Sun, Wind, Home } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { RiskLevel } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface ActionChecklistProps {
  riskLevel: RiskLevel;
}

export function ActionChecklist({ riskLevel }: ActionChecklistProps) {
  const [activeCategory, setActiveCategory] = useState('general');
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = [
    { id: 'general', label: 'General Public', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'workers', label: 'Outdoor Laborers', icon: <HardHat className="w-4 h-4" /> },
    { id: 'vulnerable', label: 'Seniors & Children', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'pets', label: 'Pets & Animals', icon: <Dog className="w-4 h-4" /> },
  ];

  const guidanceData: Record<string, { categoryTitle: string; subtitle: string; items: { id: string; title: string; desc: string; icon: any; urgency: 'high' | 'medium' | 'critical' }[] }> = {
    general: {
      categoryTitle: 'Daily Life & Commuting Heat Shield Guidance',
      subtitle: 'Proven personal protocols to prevent rapid core dehydration and thermal strain',
      items: [
        {
          id: 'g-1',
          title: 'Strategic Hydration Rhythm',
          desc: 'Drink 8–10 oz of cool water every 20 minutes of sun exposure. Avoid energy drinks and alcohol as they accelerate fluid loss.',
          icon: Droplet,
          urgency: 'critical',
        },
        {
          id: 'g-2',
          title: 'Indoor Climate Shielding',
          desc: 'Close blinds and reflective shades on south- and west-facing windows by 10 AM. Use ceiling fans in counter-clockwise rotation.',
          icon: Home,
          urgency: 'medium',
        },
        {
          id: 'g-3',
          title: 'Clothing & UV Barrier',
          desc: 'Wear lightweight, loose-fitting linen or moisture-wicking fabrics with UPF 50+ rating and wide-brimmed hats.',
          icon: Sun,
          urgency: 'high',
        },
        {
          id: 'g-4',
          title: 'Transit Safety Protocols',
          desc: 'Pre-cool vehicles prior to boarding. Carry an insulated water bottle and never leave dependents or pets in parked vehicles.',
          icon: Wind,
          urgency: 'critical',
        },
      ],
    },
    workers: {
      categoryTitle: 'OSHA & NIOSH Occupational Heat Safety Protocol',
      subtitle: 'Mandatory work-rest cycles and physiological monitoring for industrial crews',
      items: [
        {
          id: 'w-1',
          title: 'Work-to-Rest Rotation Schedule',
          desc: 'When WBGT exceeds 88°F, enforce mandatory 15-minute rest breaks in shaded/AC trailers for every 45 minutes of physical labor.',
          icon: HardHat,
          urgency: 'critical',
        },
        {
          id: 'w-2',
          title: 'Electrolyte Replacement Protocol',
          desc: 'Provide cold electrolyte drinks (sodium/potassium enriched) alongside potable water. Maintain 1:1 electrolyte-to-water ratio.',
          icon: Droplet,
          urgency: 'high',
        },
        {
          id: 'w-3',
          title: 'Active Buddy Monitoring',
          desc: 'Pair workers in two-person teams to continuously watch for subtle signs of heat confusion, slurred speech, or lack of sweating.',
          icon: UserCheck,
          urgency: 'critical',
        },
        {
          id: 'w-4',
          title: 'Acclimatization Ramp-Up',
          desc: 'New or returning workers should have workloads limited to 50% on day 1, increasing 10% daily over a 7-day period.',
          icon: Sun,
          urgency: 'medium',
        },
      ],
    },
    vulnerable: {
      categoryTitle: 'High-Risk Group Protection (Seniors & Infants)',
      subtitle: 'Targeted interventions for populations with fragile thermoregulation',
      items: [
        {
          id: 'v-1',
          title: 'Twice-Daily Senior Welfare Checks',
          desc: 'Ensure elderly family members or neighbors have active air conditioning set below 78°F. Fans alone are dangerous above 95°F ambient.',
          icon: UserCheck,
          urgency: 'critical',
        },
        {
          id: 'v-2',
          title: 'Infant Thermal Shielding',
          desc: 'Infant car seats heat up rapidly. Never drape heavy blankets over strollers as this creates a greenhouse oven effect.',
          icon: AlertCircle,
          urgency: 'critical',
        },
        {
          id: 'v-3',
          title: 'Medication Sensitivity Review',
          desc: 'Diuretics, beta-blockers, and antihistamines impair internal temperature regulation. Consult pharmacists regarding heat precautions.',
          icon: ShieldCheck,
          urgency: 'high',
        },
      ],
    },
    pets: {
      categoryTitle: 'Companion Animal & Pet Safety Directives',
      subtitle: 'Preventing severe thermal shock and asphalt pad burns',
      items: [
        {
          id: 'p-1',
          title: 'The 7-Second Asphalt Palm Test',
          desc: 'Place the back of your bare hand on the pavement for 7 seconds. If it is too hot for your hand, it will blister your dog’s paws in seconds.',
          icon: Dog,
          urgency: 'critical',
        },
        {
          id: 'p-2',
          title: 'Dawn / Dusk Walking Only',
          desc: 'Restrict dog walks to early morning before sunrise or late evening after ground surface heat has dissipated.',
          icon: Sun,
          urgency: 'high',
        },
        {
          id: 'p-3',
          title: 'Continuous Fresh Shaded Water',
          desc: 'Provide multiple bowls of fresh ice-chilled water in shaded areas. Do not leave outdoor pets without deep tree canopy or indoor AC.',
          icon: Droplet,
          urgency: 'critical',
        },
      ],
    },
  };

  const currentCategory = guidanceData[activeCategory];

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <Tabs
        tabs={categories}
        activeTab={activeCategory}
        onChange={setActiveCategory}
        className="w-full justify-start"
      />

      {/* Main Checklist Card */}
      <Card className="bg-gradient-to-b from-[#F8EDE6] to-white/95 shadow-card">
        <CardHeader className="pb-4 border-b border-brand-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-lg sm:text-xl font-black">{currentCategory.categoryTitle}</CardTitle>
              <p className="text-xs sm:text-sm text-ink-secondary mt-0.5">{currentCategory.subtitle}</p>
            </div>
            <Badge variant="risk-high" size="sm">
              Current Condition: {riskLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-5">
          <div className="space-y-3.5">
            {currentCategory.items.map((item) => {
              const isChecked = !!checkedItems[item.id];
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                    isChecked
                      ? 'bg-emerald-50/60 border-emerald-300 text-ink-secondary opacity-80'
                      : 'bg-white border-brand-border/90 hover:border-brand/40 shadow-sm'
                  }`}
                >
                  <button
                    className="mt-0.5 text-brand transition-colors focus:outline-none flex-shrink-0"
                    aria-label={isChecked ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-6 h-6 text-brand-border hover:text-brand" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${isChecked ? 'line-through text-ink-secondary' : 'text-ink-primary'}`}>
                        {item.title}
                      </h4>
                      {item.urgency === 'critical' && !isChecked && (
                        <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-red-100 text-red-700">
                          Critical
                        </span>
                      )}
                    </div>
                    <p className={`text-xs leading-relaxed ${isChecked ? 'text-ink-secondary/70' : 'text-ink-secondary'}`}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
