import React from 'react';
import { cn } from '../../lib/utils';
import { TransactionType, ProductCondition } from '@campusmart/shared-types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'glass';
  transactionType?: TransactionType;
  condition?: ProductCondition;
  size?: 'sm' | 'md';
}

export function Badge({
  className,
  variant = 'default',
  transactionType,
  condition,
  size = 'md',
  children,
  ...props
}: BadgeProps) {

  let style = 'bg-slate-800 text-slate-300 border-slate-700';
  let label = children;

  if (transactionType) {
    switch (transactionType) {
      case 'BUY':
        style = 'bg-emerald-950/80 text-emerald-300 border-emerald-800/50';
        label = label || 'BUY';
        break;
      case 'SELL':
        style = 'bg-indigo-950/80 text-indigo-300 border-indigo-800/50';
        label = label || 'SELL';
        break;
      case 'RENT':
        style = 'bg-purple-950/80 text-purple-300 border-purple-800/50';
        label = label || 'RENT';
        break;
      case 'BORROW':
        style = 'bg-sky-950/80 text-sky-300 border-sky-800/50';
        label = label || 'BORROW';
        break;
      case 'EXCHANGE':
        style = 'bg-amber-950/80 text-amber-300 border-amber-800/50';
        label = label || 'EXCHANGE';
        break;
      case 'DONATE':
        style = 'bg-rose-950/80 text-rose-300 border-rose-800/50';
        label = label || 'FREE / DONATE';
        break;
    }
  } else if (condition) {
    switch (condition) {
      case 'NEW':
        style = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40';
        label = label || 'Brand New';
        break;
      case 'LIKE_NEW':
        style = 'bg-blue-950/60 text-blue-400 border-blue-800/40';
        label = label || 'Like New';
        break;
      case 'GOOD':
        style = 'bg-slate-800/80 text-slate-300 border-slate-700';
        label = label || 'Good Condition';
        break;
      default:
        style = 'bg-amber-950/50 text-amber-300 border-amber-800/40';
        label = label || condition;
        break;
    }
  } else {
    switch (variant) {
      case 'primary':
        style = 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30';
        break;
      case 'success':
        style = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
        break;
      case 'warning':
        style = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        break;
      case 'danger':
        style = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
        break;
      case 'info':
        style = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
        break;
      case 'glass':
        style = 'glass-panel text-slate-200 border-white/10';
        break;
    }
  }

  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-full border tracking-wide uppercase',
        sizeStyle,
        style,
        className
      )}
      {...props}
    >
      {label}
    </span>
  );
}
