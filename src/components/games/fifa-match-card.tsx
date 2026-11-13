'use client';

import { cn } from '@/lib/utils';
import type { FifaMatch } from '@/types';
import { Trophy, Minus } from 'lucide-react';

interface FifaMatchCardProps {
  match: FifaMatch;
}

export function FifaMatchCard({ match }: FifaMatchCardProps) {
  const isDraw = match.goals1 === match.goals2 && match.status === 'completed';
  const player1Won = match.winner === match.player1;
  const player2Won = match.winner === match.player2;

  return (
    <div className="rounded-lg border border-border bg-[#111113] p-4 transition-colors hover:bg-muted/10">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-muted-foreground">
          Match #{match.match_number}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
            match.status === 'completed' && 'bg-blue-500/15 text-blue-400',
            match.status === 'live' && 'bg-green-500/15 text-green-400',
            match.status === 'scheduled' && 'bg-amber-500/15 text-amber-400'
          )}
        >
          {match.status === 'live' && (
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
          )}
          {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
        </span>
      </div>

      {/* Versus layout */}
      <div className="flex items-center gap-3">
        {/* Player 1 */}
        <div className={cn('flex-1 text-right', player1Won && 'relative')}>
          <p
            className={cn(
              'text-sm font-medium truncate',
              player1Won ? 'text-green-400' : 'text-foreground'
            )}
          >
            {match.player1}
          </p>
          {player1Won && (
            <div className="flex items-center justify-end gap-1 mt-0.5">
              <Trophy className="h-3 w-3 text-green-400" />
              <span className="text-[10px] font-medium text-green-400/80">Winner</span>
            </div>
          )}
        </div>

        {/* Score */}
        <div className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50">
          <span
            className={cn(
              'text-lg font-bold tabular-nums',
              player1Won ? 'text-green-400' : 'text-foreground'
            )}
          >
            {match.status === 'scheduled' ? '-' : match.goals1}
          </span>
          <Minus className="h-3 w-3 text-muted-foreground" />
          <span
            className={cn(
              'text-lg font-bold tabular-nums',
              player2Won ? 'text-green-400' : 'text-foreground'
            )}
          >
            {match.status === 'scheduled' ? '-' : match.goals2}
          </span>
        </div>

        {/* Player 2 */}
        <div className={cn('flex-1', player2Won && 'relative')}>
          <p
            className={cn(
              'text-sm font-medium truncate',
              player2Won ? 'text-green-400' : 'text-foreground'
            )}
          >
            {match.player2}
          </p>
          {player2Won && (
            <div className="flex items-center gap-1 mt-0.5">
              <Trophy className="h-3 w-3 text-green-400" />
              <span className="text-[10px] font-medium text-green-400/80">Winner</span>
            </div>
          )}
        </div>
      </div>

      {/* Draw indicator */}
      {isDraw && (
        <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-amber-400">
          <span className="h-px w-6 bg-amber-400/30" />
          <span className="font-medium">Draw</span>
          <span className="h-px w-6 bg-amber-400/30" />
        </div>
      )}
    </div>
  );
}
