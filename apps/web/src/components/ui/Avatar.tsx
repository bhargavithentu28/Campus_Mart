import React from 'react';
import { cn } from '../../lib/utils';
import { CheckCircle } from 'lucide-react';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isVerified?: boolean;
}

export function Avatar({
  src,
  name = 'Student',
  size = 'md',
  isVerified = false,
  className,
  ...props
}: AvatarProps) {
  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  const badgeSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-4 h-4',
    xl: 'w-5 h-5'
  };

  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={cn('relative inline-flex flex-shrink-0', className)} {...props}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn('rounded-full object-cover border border-white/10 shadow-sm', sizeStyles[size])}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white font-bold flex items-center justify-center border border-white/10 shadow-sm',
            sizeStyles[size]
          )}
        >
          {initials}
        </div>
      )}

      {isVerified && (
        <CheckCircle
          className={cn(
            'absolute -bottom-0.5 -right-0.5 text-indigo-400 bg-slate-950 rounded-full fill-indigo-600/30',
            badgeSizes[size]
          )}
        />
      )}
    </div>
  );
}
