'use client';

import React from 'react';
import { MapPin, Phone, Clock, ShieldCheck, CheckCircle2, Navigation } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { CoolingCenter } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface CoolingCentersListProps {
  coolingCenters: CoolingCenter[];
}

export function CoolingCentersList({ coolingCenters }: CoolingCentersListProps) {
  return (
    <Card className="bg-gradient-to-b from-[#F8EDE6] to-white/95 shadow-card">
      <CardHeader className="pb-3 border-b border-brand-border/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#81B29A]/20 text-[#2C5242] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base sm:text-lg">Designated Municipal Cooling Shelters</CardTitle>
              <p className="text-xs text-ink-secondary">Public air-conditioned respite locations with hydration and first aid</p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#2C5242] px-2.5 py-1 rounded-full bg-[#81B29A]/15 border border-[#81B29A]/30">
            {coolingCenters.length} Active Centers
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {coolingCenters.map((center) => (
            <div
              key={center.id}
              className="p-4 rounded-2xl bg-white border border-brand-border hover:border-brand/40 transition-all space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#81B29A] tracking-wider block">
                    {center.type}
                  </span>
                  <h4 className="text-sm font-bold text-ink-primary mt-0.5">{center.name}</h4>
                  <p className="text-xs text-ink-secondary flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-brand" /> {center.address}
                  </p>
                </div>
                <Badge variant="risk-low" size="sm">
                  {center.distanceMiles} mi
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-brand-border/60">
                <div className="flex items-center gap-1.5 text-ink-secondary">
                  <Clock className="w-3.5 h-3.5 text-brand" />
                  <span className="truncate">{center.hours}</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-secondary">
                  <Phone className="w-3.5 h-3.5 text-brand" />
                  <span>{center.phone}</span>
                </div>
              </div>

              {/* Amenities tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {center.amenities.map((amenity, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-brand-surface text-ink-secondary border border-brand-border/60"
                  >
                    ✓ {amenity}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
