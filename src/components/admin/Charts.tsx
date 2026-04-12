// src/components/admin/Charts.tsx
"use client";

import { cn } from "@/lib/utils";

interface ActivityPoint {
  day: string;
  users: number;
  completed: number;
}

interface BucketPoint {
  bucket: string;
  count: number;
}

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 h-48">
        <p className="text-sm text-zinc-600">Нет данных за выбранный период</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.flatMap((d) => [d.users, d.completed]), 1);

  // Show last 14 points max to keep it readable
  const visible = data.slice(-14);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-zinc-200">Активность по дням</h3>
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400" />
            Пользователи
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
            Завершили
          </span>
        </div>
      </div>

      {/* Bar chart */}
      <div className="flex items-end gap-1.5 h-40">
        {visible.map((point) => (
          <div key={point.day} className="group flex-1 flex flex-col items-center gap-1 h-full justify-end">
            <div className="w-full flex flex-col items-center gap-0.5 justify-end h-full relative">
              {/* Users bar */}
              <div
                className="w-full rounded-t-sm bg-sky-400/80 group-hover:bg-sky-400 transition-all duration-200 min-h-[2px]"
                style={{ height: `${(point.users / maxVal) * 100}%` }}
                title={`Users: ${point.users}`}
              />
              {/* Tooltip on hover */}
              <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-10">
                <div className="rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-xs text-zinc-200 whitespace-nowrap shadow-xl">
                  <div className="text-zinc-400 mb-1">{point.day}</div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-sky-400 inline-block" />
                    {point.users} users
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                    {point.completed} done
                  </div>
                </div>
                <div className="h-1.5 w-px bg-zinc-700" />
              </div>
            </div>
            {/* Completed dot indicator */}
            {point.completed > 0 && (
              <div
                className="w-1 rounded-full bg-emerald-400 transition-all duration-200 min-h-[2px]"
                style={{ height: `${(point.completed / maxVal) * 60}%` }}
              />
            )}
          </div>
        ))}
      </div>

      {/* X axis labels — show first, middle, last */}
      <div className="flex justify-between text-[10px] text-zinc-600 px-0.5">
        <span>{visible[0]?.day}</span>
        <span>{visible[Math.floor(visible.length / 2)]?.day}</span>
        <span>{visible[visible.length - 1]?.day}</span>
      </div>
    </div>
  );
}

export function ScoreBucketsChart({ data }: { data: BucketPoint[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);

  const colors = [
    "bg-rose-400",
    "bg-orange-400",
    "bg-amber-400",
    "bg-lime-400",
    "bg-emerald-400",
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 space-y-5">
      <h3 className="text-sm font-semibold text-zinc-200">Распределение баллов</h3>

      <div className="space-y-3">
        {data.map((point, i) => (
          <div key={point.bucket} className="grid grid-cols-[64px_1fr_36px] items-center gap-3">
            <span className="text-xs text-zinc-500 font-mono">{point.bucket}</span>
            <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-500", colors[i % colors.length])}
                style={{ width: `${(point.count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-zinc-400 text-right">{point.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
