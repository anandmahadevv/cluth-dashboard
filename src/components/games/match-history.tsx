'use client';

import { cn } from '@/lib/utils';
import type { MatchResult, GameId } from '@/types';
import { GAMES } from '@/lib/constants';
import { Swords, Clock } from 'lucide-react';

interface MatchHistoryProps {
  matches: MatchResult[];
  gameId: GameId;
  isLoading?: boolean;
}

function MatchSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-[#111113] p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-16 rounded bg-muted" />
      </div>
      <div className="h-4 w-40 rounded bg-muted mb-2" />
      <div className="h-3 w-32 rounded bg-muted" />
    </div>
  );
}

function MatchCard({ match, gameId }: { match: MatchResult; gameId: GameId }) {
  const game = GAMES[gameId];
  const scoreEntries = Object.entries(match.score_data);

  return (
    <div className="relative rounded-lg border border-border bg-[#111113] p-4 transition-colors hover:border-border/80 hover:bg-muted/10">
      {/* Timeline dot */}
      <div
        className="absolute -left-[7px] top-5 h-3 w-3 rounded-full border-2 border-background"
        style={{ backgroundColor: game.color }}
      />

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Match {match.match_id}
          </span>
        </div>
        <span
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            match.status === 'approved'
              ? 'bg-green-500/15 text-green-400'
              : 'bg-blue-500/15 text-blue-400'
          )}
        >
          {match.status}
        </span>
      </div>

      <p className="text-sm font-medium text-foreground mb-1">
        {match.team_name || match.player_name}
      </p>

      {scoreEntries.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {scoreEntries.map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center gap-1 rounded bg-muted/50 px-2 py-0.5 text-xs text-muted-foreground"
            >
              <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
              <span className="font-medium text-foreground">{value}</span>
            </span>
          ))}
        </div>
      )}

      {match.approved_at && (
        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground/60">
          <Clock className="h-3 w-3" />
          {new Date(match.approved_at).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export function MatchHistory({ matches, gameId, isLoading }: MatchHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <MatchSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-[#111113] p-8 text-center">
        <Swords className="mx-auto h-10 w-10 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground text-sm">No match history available.</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Match results will appear here once games are played.
        </p>
      </div>
    );
  }

  return (
    <div className="relative pl-4 border-l border-border/50 space-y-4">
      {matches.map((match) => (
        <MatchCard key={match.result_id} match={match} gameId={gameId} />
      ))}
    </div>
  );
}
