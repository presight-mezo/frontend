'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Shield, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-accent-blue focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-foreground text-background',
        secondary: 'border-transparent bg-foreground/5 text-foreground',
        outline: 'text-foreground border-foreground/10',
        destructive: 'border-transparent bg-red-500 text-white',
      },
      mode: {
        'zero-risk': 'border-transparent bg-mezo-teal/10 text-mezo-teal',
        'full-stake': 'border-transparent bg-btc-orange/10 text-btc-orange',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, mode, children, ...props }: BadgeProps) {
  const isZeroRisk = mode === 'zero-risk';
  const isFullStake = mode === 'full-stake';

  return (
    <div className={cn(badgeVariants({ variant, mode, className }))} {...props}>
      {isZeroRisk && <Shield className="mr-1 h-3 w-3" />}
      {isFullStake && <Flame className="mr-1 h-3 w-3" />}
      <span className="uppercase tracking-wider">
        {isZeroRisk ? 'Zero Risk' : isFullStake ? 'Full Stake' : children}
      </span>
    </div>
  );
}

export { Badge, badgeVariants };
