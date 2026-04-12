// src/components/admin/KpiCard.tsx
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: string; positive: boolean };
  icon?: LucideIcon;
  accent?: "emerald" | "sky" | "amber" | "violet" | "rose";
}

const accentMap = {
  emerald: "text-emerald-400 bg-emerald-400/10 ring-emerald-400/20",
  sky:     "text-sky-400 bg-sky-400/10 ring-sky-400/20",
  amber:   "text-amber-400 bg-amber-400/10 ring-amber-400/20",
  violet:  "text-violet-400 bg-violet-400/10 ring-violet-400/20",
  rose:    "text-rose-400 bg-rose-400/10 ring-rose-400/20",
};

export function KpiCard({ label, value, hint, delta, icon: Icon, accent = "sky" }: KpiCardProps) {
  return (
    <div className={cn(
      "relative flex flex-col gap-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 overflow-hidden",
      "transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-800/80"
    )}>
      {/* Subtle glow in corner */}
      <div className={cn(
        "pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl opacity-20",
        accent === "emerald" && "bg-emerald-400",
        accent === "sky" && "bg-sky-400",
        accent === "amber" && "bg-amber-400",
        accent === "violet" && "bg-violet-400",
        accent === "rose" && "bg-rose-400",
      )} />

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">{label}</p>
        {Icon && (
          <span className={cn("flex items-center justify-center rounded-lg p-1.5 ring-1", accentMap[accent])}>
            <Icon className="size-3.5" />
          </span>
        )}
      </div>

      <p className="text-3xl font-bold tracking-tight text-zinc-50 leading-none">{value}</p>

      <div className="flex items-center gap-2">
        {delta && (
          <span className={cn(
            "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
            delta.positive
              ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20"
              : "bg-rose-500/10 text-rose-400 ring-rose-500/20"
          )}>
            {delta.positive ? "↑" : "↓"} {delta.value}
          </span>
        )}
        {hint && <p className="text-xs text-zinc-600">{hint}</p>}
      </div>
    </div>
  );
}
