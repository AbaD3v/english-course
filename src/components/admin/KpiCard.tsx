interface KpiCardProps {
  label: string;
  value: string;
  hint?: string;
}

export function KpiCard({ label, value, hint }: KpiCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 shadow-lg shadow-black/20">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-zinc-100">{value}</p>
      {hint ? <p className="mt-1 text-xs text-zinc-500">{hint}</p> : null}
    </div>
  );
}
