import React from 'react';
import { cn } from '../../lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-slate-800/60 border border-slate-700/20', className)}
      {...props}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-3">
      <Skeleton className="w-full h-44 rounded-xl" />
      <div className="flex justify-between items-center">
        <Skeleton className="w-16 h-5 rounded-full" />
        <Skeleton className="w-12 h-4 rounded-full" />
      </div>
      <Skeleton className="w-3/4 h-5 rounded-md" />
      <Skeleton className="w-full h-4 rounded-md" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="w-20 h-6 rounded-lg" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
    </div>
  );
}
