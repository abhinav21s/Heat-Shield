import React from 'react';
import Link from 'next/link';
import { Shield, ExternalLink, Heart, AlertTriangle } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-16 bg-[#F8EDE6] border-t border-brand-border py-12 text-ink-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand text-white flex items-center justify-center shadow-soft">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-lg font-black tracking-tight text-ink-primary">HeatShield</span>
            </div>
            <p className="text-xs text-ink-secondary leading-relaxed max-w-md">
              Real-time urban heat protection app powered by hyperlocal thermal models and FortyGuard data structures.
              Designed to make urban heat risk immediately visible, understandable, and actionable for citizens and emergency teams.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-dark pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Continuous Hyperlocal Heat Engine Active</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink-secondary mb-3">Quick Navigation</h4>
            <ul className="space-y-2 text-xs font-medium text-ink-secondary">
              <li>
                <Link href="/" className="hover:text-brand transition-colors">
                  Personal Risk Dashboard
                </Link>
              </li>
              <li>
                <Link href="/map" className="hover:text-brand transition-colors">
                  Interactive Urban Heat Map
                </Link>
              </li>
              <li>
                <Link href="/recommendations" className="hover:text-brand transition-colors">
                  Actionable Heat Precautions
                </Link>
              </li>
              <li>
                <Link href="/intelligence" className="hover:text-brand transition-colors">
                  Microclimate & Heat Islands
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency Heat Alert Notice */}
          <div className="bg-[#E07A5F]/10 border border-brand/30 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#A8452D]">
              <AlertTriangle className="w-4 h-4 text-brand" />
              <span>Medical Emergency Notice</span>
            </div>
            <p className="text-[11px] text-ink-secondary leading-relaxed">
              If someone collapses, experiences confusion, rapid pulse, or loses consciousness, move them to shade immediately and call <strong>911</strong>. Heat stroke is a medical emergency.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-brand-border flex flex-col sm:flex-row items-center justify-between text-xs text-ink-secondary gap-3">
          <p>© {new Date().getFullYear()} HeatShield. Built for urban climate resilience and heat protection.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-brand fill-brand" /> for resilient cities
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
