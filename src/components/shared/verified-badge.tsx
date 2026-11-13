import { CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface VerifiedBadgeProps {
  label?: string;
  className?: string;
  size?: "sm" | "md";
}

export function VerifiedBadge({ label = "Super Admin Approved", className, size = "sm" }: VerifiedBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium tracking-wide uppercase rounded-full border border-emerald-500/30 bg-emerald-950/40 text-emerald-400 shadow-sm",
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
        className
      )}
      title="Verified and authenticated by Super Admin approval"
    >
      <ShieldCheck className={size === "sm" ? "w-3 h-3 text-emerald-400" : "w-3.5 h-3.5 text-emerald-400"} />
      <span>{label}</span>
    </span>
  );
}
