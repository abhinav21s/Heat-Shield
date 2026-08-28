'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1.5 bg-brand-surface rounded-2xl border border-brand-border overflow-x-auto scrollbar-none', className)}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap',
              isActive
                ? 'bg-brand text-white shadow-card'
                : 'text-ink-secondary hover:text-ink-primary hover:bg-brand-border/30'
            )}
          >
            {tab.icon && <span className="w-4 h-4 flex items-center justify-center">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  'px-1.5 py-0.5 text-xs rounded-full font-bold',
                  isActive ? 'bg-white/20 text-white' : 'bg-brand-border text-ink-secondary'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
