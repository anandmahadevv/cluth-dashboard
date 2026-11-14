'use client';

import Link from 'next/link';
import { Flame, Crosshair, Trophy, Brain, ArrowRight, Target, Gamepad2 } from 'lucide-react';
import type { GameConfig } from '@/types';
import { cn } from '@/lib/utils';

interface GameCardProps {
  game: GameConfig;
  matchCount: number;
  status: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Flame,
  Crosshair,
  Trophy,
  Brain,
  Target,
  Gamepad2,
  FREE_FIRE: Flame,
  BGMI: Crosshair,
  VALORANT: Target,
  EFOOTBALL: Gamepad2,
  MATIKS: Brain,
};

export function GameCard({ game, matchCount, status }: GameCardProps) {
  const Icon =
    (game.icon ? iconMap[game.icon] : null) ||
    iconMap[game.id] ||
    Trophy;

  return (
    <Link href={`/games/${game.slug}`} className="group block">
      <div
        className={cn(
          'relative rounded-xl border border-border bg-card p-6 transition-all duration-300',
          'hover:scale-[1.03] hover:shadow-xl hover:border-opacity-60'
        )}
        style={
          {
            '--game-color': game.color,
          } as React.CSSProperties
        }
      >
        {/* Top accent bar */}
        <div
          className="absolute top-0 left-4 right-4 h-[2px] rounded-b-full opacity-60 group-hover:opacity-100 transition-opacity"
          style={{ backgroundColor: game.color }}
        />

        {/* Hover glow */}
        <div
          className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at top, ${game.color}10 0%, transparent 60%)`,
          }}
        />

        <div className="relative z-10">
          {/* Icon */}
          <div
            className="inline-flex items-center justify-center h-12 w-12 rounded-xl mb-4 transition-transform group-hover:scale-110"
            style={{
              backgroundColor: `${game.color}15`,
              color: game.color,
            }}
          >
            <Icon className="h-6 w-6" />
          </div>

          {/* Name */}
          <h3 className="text-lg font-bold text-foreground mb-2">{game.name}</h3>

          {/* Status badge */}
          <span
            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mb-3"
            style={{
              backgroundColor: `${game.color}15`,
              color: game.color,
            }}
          >
            {status}
          </span>

          {/* Match count */}
          <p className="text-sm text-muted-foreground mb-4">
            {matchCount} approved {matchCount === 1 ? 'match' : 'matches'}
          </p>

          {/* Link */}
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            View Results
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
