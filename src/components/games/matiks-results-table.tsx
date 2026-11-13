'use client';

import { cn } from '@/lib/utils';
import type { MatiksResult } from '@/types';
import { Brain, Trophy, Medal, Award } from 'lucide-react';

interface MatiksResultsTableProps {
  results: MatiksResult[];
  isLoading?: boolean;
}

const positionColors: Record<number, string> = {
  1: 'text-[#fbbf24]',
  2: 'text-[#94a3b8]',
  3: 'text-[#cd7c32]',
};

const resultBadgeStyles: Record<string, string> = {
  correct: 'bg-green-500/15 text-green-400',
  incorrect: 'bg-red-500/15 text-red-400',
  partial: 'bg-amber-500/15 text-amber-400',
};

function PositionIcon({ position }: { position: number }) {
  if (position === 1) return <Trophy className="h-4 w-4 text-[#fbbf24]" />;
  if (position === 2) return <Medal className="h-4 w-4 text-[#94a3b8]" />;
  if (position === 3) return <Award className="h-4 w-4 text-[#cd7c32]" />;
  return <span className="text-sm text-muted-foreground">{position}</span>;
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/50">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 w-20 animate-pulse rounded bg-muted" />
        </td>
      ))}
    </tr>
  );
}

export function MatiksResultsTable({ results, isLoading }: MatiksResultsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-[#111113] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Player</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Round</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Score</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Result</th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">Position</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-[#111113] p-8 text-center">
        <Brain className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground text-sm">No MATIKS results available yet.</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Scores are calculated by the backend based on event configuration.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-[#111113] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Player</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Round</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Score</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Result</th>
              <th className="px-4 py-3 text-center font-medium text-muted-foreground">Position</th>
            </tr>
          </thead>
          <tbody>
            {results.map((entry, index) => {
              const posColor = positionColors[entry.position];

              return (
                <tr
                  key={`${entry.player_name}-${entry.round}-${index}`}
                  className={cn(
                    'border-b border-border/50 transition-colors hover:bg-muted/20',
                    entry.position <= 3 && 'bg-muted/10'
                  )}
                >
                  <td className={cn('px-4 py-3 font-medium', posColor || 'text-foreground')}>
                    {entry.player_name}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    Round {entry.round}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-purple-400">
                    {entry.score}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                        (entry.result && resultBadgeStyles[entry.result]) || 'bg-muted text-muted-foreground'
                      )}
                    >
                      {entry.result}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <PositionIcon position={entry.position} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
