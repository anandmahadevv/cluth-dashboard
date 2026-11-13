import { Skeleton } from "@/components/ui/skeleton";

export function GameCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
        <Skeleton className="h-16 rounded-lg" />
      </div>
      <Skeleton className="h-9 w-full rounded-md" />
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="p-4 border-b border-border">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MatchResultSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-8 w-12 rounded-md" />
        <div className="flex-1 space-y-2 text-right">
          <Skeleton className="h-5 w-28 ml-auto" />
          <Skeleton className="h-3 w-16 ml-auto" />
        </div>
      </div>
    </div>
  );
}

export function StatsCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}
