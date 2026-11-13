'use client';

import { Clock, Flame, Crosshair, Trophy, Brain, Inbox } from 'lucide-react';
import { GAMES } from '@/lib/constants';
import type { MatchResult, GameConfig } from '@/types';
import { cn } from '@/lib/utils';

interface RecentUpdatesProps {
  results: MatchResult[];
  isLoading?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Crosshair,
  Trophy,
  Brain,
};

function getRelativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  if (diffMinutes > 0) return `${diffMinutes}m ago`;
  return 'just now';
}

export function RecentUpdates({ results, isLoading = false }: RecentUpdatesProps) {
  const recentResults = results.slice(0, 8);

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Recent Updates
          </h2>
          <p className="text-muted-foreground text-lg">
            Latest approved results from the tournament.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-4 animate-pulse"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-muted" />
                    <div className="h-3 w-32 rounded bg-muted" />
                  </div>
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : recentResults.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
              <Inbox className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No results published yet
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Check back during the tournament! Results will appear here as games
              are played and approved.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentResults.map((result) => {
              const gameConfig = GAMES[result.game_id as keyof typeof GAMES] as
                | GameConfig
                | undefined;
              const Icon = (gameConfig?.icon ? iconMap[gameConfig.icon] : null) || Trophy;
              const gameColor = gameConfig?.color || '#7c3aed';
              const gameName = gameConfig?.name || result.game_id;

              return (
                <div
                  key={result.result_id}
                  className={cn(
                    'flex items-center gap-4 rounded-xl border border-border bg-card p-4',
                    'transition-all hover:border-border/80 hover:bg-card/80'
                  )}
                >
                  {/* Game icon */}
                  <div
                    className="flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: `${gameColor}15`,
                      color: gameColor,
                    }}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{
                          backgroundColor: `${gameColor}15`,
                          color: gameColor,
                        }}
                      >
                        {gameName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Match #{result.match_id}
                      </span>
                    </div>
                    <p className="text-sm text-foreground truncate">
                      {result.team_name || result.player_name || 'Unknown'} —{' '}
                      {Object.entries(result.score_data || {})
                        .map(([key, val]) => `${key}: ${val}`)
                        .join(', ') || 'Result approved'}
                    </p>
                  </div>

                  {/* Time */}
                  <div className="flex-shrink-0 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {result.approved_at
                      ? getRelativeTime(result.approved_at)
                      : 'recently'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
