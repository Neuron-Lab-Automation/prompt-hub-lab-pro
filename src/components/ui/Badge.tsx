import React from 'react';
import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20',
        secondary: 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20',
        destructive: 'bg-red-500/10 text-red-400 hover:bg-red-500/20',
        success: 'bg-green-500/10 text-green-400 hover:bg-green-500/20',
        warning: 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20',
        outline: 'bg-gray-600/10 text-gray-400 hover:bg-gray-600/20',
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

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };