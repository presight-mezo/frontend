'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | boolean;
  suffix?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, suffix, ...props }, ref) => {
    const hasError = !!error;

    return (
      <div className="relative w-full">
        <input
          type={type}
          className={cn(
            'flex h-11 w-full rounded-xl border border-foreground/10 bg-white px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all',
            hasError && 'border-red-500 focus-visible:ring-red-500',
            suffix && 'pr-16', // Add space for suffix
            className
          )}
          ref={ref}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
            <span className="text-sm font-bold text-foreground/40">{suffix}</span>
          </div>
        )}
        {typeof error === 'string' && (
          <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
