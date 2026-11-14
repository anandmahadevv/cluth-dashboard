'use client';

import { GAMES } from '@/lib/constants';
import type { GameConfig } from '@/types';
import { GameCard } from './game-card';

interface FeaturedGamesProps {
  matchCounts: Record<string, number>;
  isLoading?: boolean;
}

export function FeaturedGames({ matchCounts, isLoading = false }: FeaturedGamesProps) {
  const games = Object.values(GAMES) as GameConfig[];

  return (
    <section id="games" className="py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Featured Games
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Compete across five thrilling titles in the ultimate esports showdown.
          </p>
        </div>

        {/* Games grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-card p-6 animate-pulse"
              >
                <div className="h-12 w-12 rounded-xl bg-muted mb-4" />
                <div className="h-5 w-24 rounded bg-muted mb-2" />
                <div className="h-4 w-16 rounded bg-muted mb-3" />
                <div className="h-4 w-32 rounded bg-muted mb-4" />
                <div className="h-4 w-28 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                matchCount={matchCounts[game.id] ?? 0}
                status="Upcoming"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
