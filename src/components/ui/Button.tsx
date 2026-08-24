import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, children, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-xs font-medium rounded-lg gap-1.5',
      md: 'px-4 py-2.5 text-sm font-semibold rounded-xl gap-2',
      lg: 'px-6 py-3.5 text-base font-bold rounded-2xl gap-2.5 shadow-md',
      icon: 'p-2 rounded-xl',
    };

    const variantClasses = {
      primary: 'bg-brand hover:bg-brand-dark text-white shadow-card hover:shadow-glow transition-all active:scale-[0.98]',
      secondary: 'bg-brand-surface hover:bg-[#F2E1D8] text-ink-primary border border-brand-border active:scale-[0.98]',
      outline: 'border-2 border-brand text-brand hover:bg-brand/10 active:scale-[0.98]',
      ghost: 'text-ink-secondary hover:text-ink-primary hover:bg-brand-border/40',
      danger: 'bg-risk-extreme hover:bg-[#B21E1E] text-white shadow-dangerGlow active:scale-[0.98]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
