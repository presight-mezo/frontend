'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { motion, HTMLMotionProps } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-blue disabled:pointer-events-none disabled:opacity-50 active:scale-95 select-none',
  {
    variants: {
      variant: {
        primary: 'bg-foreground text-background hover:bg-foreground/90 shadow-sm',
        secondary: 'bg-foreground/5 text-foreground hover:bg-foreground/10',
        accent: 'bg-accent-blue text-white hover:bg-accent-blue/90 shadow-md shadow-accent-blue/20',
        outline: 'border border-foreground/10 bg-transparent text-foreground hover:bg-foreground/5',
        ghost: 'bg-transparent text-foreground hover:bg-foreground/5',
        glass: 'glass-card border-white/90 bg-white/65 text-foreground hover:bg-white/80 shadow-lg shadow-black/5',
      },
      size: {
        sm: 'h-9 px-4 text-xs min-h-[44px]', // Min touch target compliance
        md: 'h-11 px-6 text-sm min-h-[44px]',
        lg: 'h-14 px-8 text-base min-h-[52px]',
        icon: 'h-11 w-11 min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends Omit<HTMLMotionProps<'button'>, 'children'>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, leftIcon, rightIcon, children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin text-current" />}
        {!isLoading && leftIcon && <span className="mr-2 inline-flex">{leftIcon}</span>}
        <span className="relative z-10">{children}</span>
        {!isLoading && rightIcon && <span className="ml-2 inline-flex">{rightIcon}</span>}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
