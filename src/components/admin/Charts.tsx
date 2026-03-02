"use client";

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
  const max = Math.max(...data.flatMap((point) => [point.users, point.completed]), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-200">Activity by day</h3>
      <div className="space-y-2">
        {data.map((point) => (
          <div key={point.day} className="space-y-1">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{point.day}</span>
              <span>
                users {point.users} / completed {point.completed}
              </span>
            </div>
            <div className="h-2 w-full rounded bg-zinc-800">
              <div className="h-2 rounded bg-sky-500" style={{ width: `${(point.users / max) * 100}%` }} />
            </div>
            <div className="h-2 w-full rounded bg-zinc-800">
              <div className="h-2 rounded bg-emerald-500" style={{ width: `${(point.completed / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ScoreBucketsChart({ data }: { data: BucketPoint[] }) {
  const max = Math.max(...data.map((point) => point.count), 1);

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-200">Score distribution</h3>
      <div className="space-y-2">
        {data.map((point) => (
          <div key={point.bucket} className="grid grid-cols-[70px_1fr_40px] items-center gap-2 text-sm">
            <span className="text-zinc-400">{point.bucket}</span>
            <div className="h-2 rounded bg-zinc-800">
              <div className="h-2 rounded bg-violet-500" style={{ width: `${(point.count / max) * 100}%` }} />
            </div>
            <span className="text-zinc-300">{point.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
