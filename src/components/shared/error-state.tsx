import { AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  showCachedWarning?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = "Something went wrong while loading data.",
  showCachedWarning = false,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 rounded-xl border border-destructive/20 bg-destructive/5 p-8 text-center",
        className
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-6 w-6 text-destructive" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">
          Failed to load
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </div>

      {showCachedWarning && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-500">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          <span>Data may be outdated — showing cached version</span>
        </div>
      )}

      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-1">
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
