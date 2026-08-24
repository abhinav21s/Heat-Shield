'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, MapPin, RefreshCw, Thermometer, Flame, Compass, BookOpen, BarChart3, ChevronDown } from 'lucide-react';
import { useLocation } from '@/context/LocationContext';
import { Button } from '@/components/ui/Button';
import { formatTemp } from '@/lib/utils';
import { RiskBadge } from '@/components/ui/Badge';

export function Navbar() {
  const pathname = usePathname();
  const { report, isLoading, tempUnit, toggleTempUnit, openLocationModal, refreshData } = useLocation();

  const navLinks = [
    { href: '/', label: 'Risk Dashboard', icon: Flame },
    { href: '/map', label: 'Heat Map', icon: Compass },
    { href: '/recommendations', label: 'Precautions', icon: BookOpen },
    { href: '/intelligence', label: 'Area Intelligence', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FDF6F0]/90 backdrop-blur-md border-b border-brand-border transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#E07A5F] to-[#C26A52] flex items-center justify-center text-white shadow-soft group-hover:scale-105 transition-transform">
                <Shield className="w-6 h-6 fill-white/20 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-ink-primary">HeatShield</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-brand/15 text-brand-dark border border-brand/20">
                    Live
                  </span>
                </div>
                <p className="text-[11px] text-ink-secondary font-medium hidden sm:block">Urban Heat Intelligence & Protection</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-brand-surface/70 p-1.5 rounded-2xl border border-brand-border">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
                      isActive
                        ? 'bg-brand text-white shadow-card'
                        : 'text-ink-secondary hover:text-ink-primary hover:bg-white/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Location Selector Button */}
            <button
              onClick={openLocationModal}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-brand-surface border border-brand-border text-ink-primary hover:border-brand/40 hover:bg-[#F2E1D8] transition-all text-xs font-semibold shadow-soft"
              title="Change your active location or drop a pin"
            >
              <MapPin className="w-4 h-4 text-brand flex-shrink-0" />
              <span className="truncate max-w-[110px] sm:max-w-[180px]">
                {report ? report.location.name : 'Select City'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-ink-secondary" />
            </button>

            {/* Live Temp Badge & Unit Toggle */}
            {report && (
              <div className="flex items-center bg-white/70 border border-brand-border rounded-xl p-1 shadow-soft">
                <span className="px-2 text-xs font-black text-ink-primary">
                  {formatTemp(report.metrics.temperatureF, tempUnit)}
                </span>
                <button
                  onClick={toggleTempUnit}
                  className="px-2 py-1 text-[11px] font-bold rounded-lg bg-brand/10 hover:bg-brand/20 text-brand-dark transition-colors"
                  title="Switch between Fahrenheit and Celsius"
                >
                  °{tempUnit}
                </button>
              </div>
            )}

            {/* Refresh live sync */}
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-brand-surface border border-brand-border hover:bg-white text-ink-secondary hover:text-ink-primary transition-all disabled:opacity-50"
              title="Refresh FortyGuard live heat analysis"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center justify-between gap-1 py-2 border-t border-brand-border/60 overflow-x-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand text-white shadow-sm'
                    : 'text-ink-secondary hover:text-ink-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
