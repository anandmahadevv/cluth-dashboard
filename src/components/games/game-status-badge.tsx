'use client';

import { cn } from '@/lib/utils';

type GameStatus = 'upcoming' | 'live' | 'completed';

interface GameStatusBadgeProps {
  status: GameStatus;
  className?: string;
}

const statusConfig: Record<GameStatus, { label: string; className: string }> = {
  upcoming: {
    label: 'Upcoming',
    className: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  live: {
    label: 'Live',
    className: 'bg-green-500/15 text-green-400 border-green-500/30',
  },
  completed: {
    label: 'Completed',
    className: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  },
};

export function GameStatusBadge({ status, className }: GameStatusBadgeProps) {
  const normalized = (status || 'upcoming').toLowerCase() as GameStatus;
  const config = statusConfig[normalized] || statusConfig.upcoming;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.className,
        className
      )}
    >
      {status === 'live' && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
        </span>
      )}
      {config.label}
    </span>
  );
}
