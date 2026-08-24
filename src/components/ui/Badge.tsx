import React from 'react';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/lib/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'risk-low' | 'risk-moderate' | 'risk-high' | 'risk-extreme' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
}

export function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-bold',
  };

  const variantClasses = {
    default: 'bg-brand/15 text-brand-dark border border-brand/30',
    outline: 'border border-brand-border text-ink-primary bg-white/40',
    'risk-low': 'bg-[#81B29A]/20 text-[#2C5242] border border-[#81B29A]/50',
    'risk-moderate': 'bg-[#F2CC8F]/30 text-[#8C6014] border border-[#F2CC8F]/70',
    'risk-high': 'bg-[#E07A5F]/20 text-[#A8452D] border border-[#E07A5F]/60',
    'risk-extreme': 'bg-[#D62828]/20 text-[#9E1414] border border-[#D62828]/60 animate-pulse-slow',
    neutral: 'bg-[#EADFD8]/60 text-ink-secondary border border-[#EADFD8]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full tracking-wide transition-colors',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function RiskBadge({ level, size = 'md', className }: { level: RiskLevel; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const labels: Record<RiskLevel, string> = {
    low: 'Low Risk',
    moderate: 'Moderate Risk',
    high: 'High Hazard',
    extreme: 'Extreme Danger',
  };

  const variant = `risk-${level}` as const;

  return (
    <Badge variant={variant} size={size} className={cn('uppercase tracking-wider shadow-sm', className)}>
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-80" />
      {labels[level]}
    </Badge>
  );
}
