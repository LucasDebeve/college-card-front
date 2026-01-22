import React from 'react';
import { cn } from '@/lib/utils';

interface CounterBadgeProps {
  current: number;
  total?: number;
  size?: 'sm' | 'md';
  showDots?: boolean;
}

const colors = {
  0: 'text-green-600',
  1: 'text-green-600',
  2: 'text-orange-500',
  3: 'text-red-500',
};

export function CounterBadge({ 
  current, 
  total = 3, 
  size = 'md',
  showDots = true 
}: CounterBadgeProps) {
  const color = colors[current as keyof typeof colors] || colors[3];
  
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={cn('flex items-center gap-2', textSize, color)}>
      {showDots && (
        <div className="flex gap-1">
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              className={cn(
                dotSize,
                'rounded-full border-2',
                i < current 
                  ? `bg-current border-current` 
                  : 'bg-transparent border-gray-300'
              )}
            />
          ))}
        </div>
      )}
      <span className="font-mono font-semibold">
        [{current}/{total}]
      </span>
    </div>
  );
}