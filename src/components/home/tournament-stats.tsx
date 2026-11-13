'use client';

import { Gamepad2, Trophy, CheckCircle, Activity } from 'lucide-react';
import type { TournamentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface TournamentStatsProps {
  gamesCount: number;
  matchesCompleted: number;
  approvedResults: number;
  status: TournamentStatus;
  isLoading?: boolean;
}

const statusLabel: Record<string, string> = {
  upcoming: 'Upcoming',
  live: 'Live',
  completed: 'Completed',
};

const statusColor: Record<string, string> = {
  upcoming: 'text-amber-500',
  live: 'text-red-500',
  completed: 'text-emerald-500',
};

export function TournamentStats({
  gamesCount,
  matchesCompleted,
  approvedResults,
  status,
  isLoading = false,
}: TournamentStatsProps) {
  const normalizedKey = (status || 'upcoming').toLowerCase();
  const currentStatusLabel = statusLabel[normalizedKey] || statusLabel.upcoming;
  const currentStatusColor = statusColor[normalizedKey] || statusColor.upcoming;

  const stats = [
    {
      label: 'Games',
      value: gamesCount,
      icon: Gamepad2,
      color: 'text-purple-400',
      borderColor: 'border-purple-500/20',
      glowColor: 'shadow-purple-500/5',
    },
    {
      label: 'Matches Completed',
      value: matchesCompleted,
      icon: Trophy,
      color: 'text-blue-400',
      borderColor: 'border-blue-500/20',
      glowColor: 'shadow-blue-500/5',
    },
    {
      label: 'Approved Results',
      value: approvedResults,
      icon: CheckCircle,
      color: 'text-green-400',
      borderColor: 'border-green-500/20',
      glowColor: 'shadow-green-500/5',
    },
    {
      label: 'Tournament Status',
      value: currentStatusLabel,
      icon: Activity,
      color: currentStatusColor,
      borderColor: 'border-amber-500/20',
      glowColor: 'shadow-amber-500/5',
      isStatus: true,
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={cn(
                  'relative rounded-xl border bg-card p-6 transition-all hover:scale-[1.02]',
                  stat.borderColor,
                  stat.glowColor,
                  'shadow-lg'
                )}
              >
                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-10 w-10 rounded-lg bg-muted" />
                    <div className="h-4 w-20 rounded bg-muted" />
                    <div className="h-8 w-16 rounded bg-muted" />
                  </div>
                ) : (
                  <>
                    <div
                      className={cn(
                        'inline-flex items-center justify-center h-10 w-10 rounded-lg bg-muted mb-3',
                        stat.color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.label}
                    </p>
                    <p
                      className={cn(
                        'text-3xl font-bold',
                        stat.isStatus ? stat.color : 'text-foreground'
                      )}
                    >
                      {stat.value}
                    </p>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
