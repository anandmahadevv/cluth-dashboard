'use client';

import Link from 'next/link';
import { Calendar, MapPin, Zap } from 'lucide-react';
import { TOURNAMENT } from '@/lib/constants';
import type { TournamentStatus } from '@/types';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  status: TournamentStatus;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  upcoming: {
    label: '🔥 Upcoming',
    className: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  },
  live: {
    label: '🔴 LIVE NOW',
    className: 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse',
  },
  completed: {
    label: '✅ Completed',
    className: 'bg-green-500/20 text-green-400 border-green-500/40',
  },
};

export function HeroSection({ status }: HeroSectionProps) {
  const normalizedKey = (status || 'upcoming').toLowerCase();
  const statusInfo = statusConfig[normalizedKey] || statusConfig.upcoming;

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[#09090b]" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20"
        style={{
          background:
            'radial-gradient(circle, rgba(124, 58, 237, 0.4) 0%, rgba(59, 130, 246, 0.15) 40%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full opacity-10 animate-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(124, 58, 237, 0.6) 0%, transparent 60%)',
        }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-10 animate-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(59, 130, 246, 0.5) 0%, transparent 60%)',
          animationDelay: '1s',
        }}
      />
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(124, 58, 237, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(124, 58, 237, 0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
        {/* Status badge */}
        <div className="mb-8 inline-flex">
          <span
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium',
              statusInfo.className
            )}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-7xl sm:text-8xl lg:text-9xl font-black tracking-tighter mb-4">
          <span className="bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#3b82f6] bg-clip-text text-transparent">
            {TOURNAMENT.name}
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl sm:text-2xl lg:text-3xl text-muted-foreground font-medium mb-3">
          {TOURNAMENT.fullName} — {TOURNAMENT.edition}
        </p>

        {/* Venue & Date */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-muted-foreground mb-10">
          <span className="inline-flex items-center gap-2 text-sm sm:text-base">
            <MapPin className="h-4 w-4 text-primary" />
            {TOURNAMENT.venue}
          </span>
          <span className="hidden sm:inline text-border">|</span>
          <span className="inline-flex items-center gap-2 text-sm sm:text-base">
            <Calendar className="h-4 w-4 text-primary" />
            {TOURNAMENT.dateDisplay}
          </span>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/leaderboards"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:scale-105"
          >
            <Zap className="h-4 w-4" />
            View Live Results
          </Link>
          <Link
            href="#games"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-8 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:border-primary/50 hover:scale-105"
          >
            Explore Games
          </Link>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#09090b] to-transparent" />
    </section>
  );
}
