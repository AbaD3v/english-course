"use client";

import { useMemo } from "react";

interface DateRangeProps {
  from: string;
  to: string;
  onChange: (next: { from: string; to: string }) => void;
}

export function DateRange({ from, to, onChange }: DateRangeProps) {
  const presets = useMemo(() => {
    const today = new Date();
    const format = (date: Date) => date.toISOString().slice(0, 10);
    const make = (days: number) => {
      const start = new Date(today);
      start.setDate(today.getDate() - (days - 1));
      return { from: format(start), to: format(today) };
    };

    return {
      week: make(7),
      month: make(30),
    };
  }, []);

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-zinc-900/60 p-4">
      <button
        className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
        onClick={() => onChange(presets.week)}
        type="button"
      >
        Last 7 days
      </button>
      <button
        className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
        onClick={() => onChange(presets.month)}
        type="button"
      >
        Last 30 days
      </button>
      <label className="text-xs text-zinc-400">
        From
        <input
          className="ml-2 rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
          type="date"
          value={from}
          onChange={(event) => onChange({ from: event.target.value, to })}
        />
      </label>
      <label className="text-xs text-zinc-400">
        To
        <input
          className="ml-2 rounded bg-zinc-800 px-2 py-1 text-sm text-zinc-100"
          type="date"
          value={to}
          onChange={(event) => onChange({ from, to: event.target.value })}
        />
      </label>
    </div>
  );
}
