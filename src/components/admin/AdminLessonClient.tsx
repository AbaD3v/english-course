"use client";

import { useEffect, useState } from "react";
import { DateRange } from "@/components/admin/DateRange";
import { KpiCard } from "@/components/admin/KpiCard";
import { ScoreBucketsChart } from "@/components/admin/Charts";
import { ReportsTable } from "@/components/admin/ReportsTable";
import type { LessonResponse } from "@/lib/admin/reports";

export function AdminLessonClient({ id, initialFrom, initialTo }: { id: string; initialFrom: string; initialTo: string }) {
  const [range, setRange] = useState({ from: initialFrom, to: initialTo });
  const [data, setData] = useState<LessonResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/reports/lesson/${id}?from=${range.from}&to=${range.to}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((json: LessonResponse) => setData(json))
      .catch(() => undefined);

    return () => controller.abort();
  }, [range, id]);

  return (
    <div className="space-y-6">
      <DateRange from={range.from} to={range.to} onChange={setRange} />
      <a
        className="inline-flex rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
        href={`/api/admin/reports/export.csv?scope=lesson&slugOrId=${id}&from=${range.from}&to=${range.to}`}
      >
        Export CSV
      </a>
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Attempted" value={String(data?.metrics.attempted ?? 0)} />
        <KpiCard label="Completed" value={String(data?.metrics.completed ?? 0)} />
        <KpiCard label="Pass rate" value={`${(data?.metrics.pass_rate ?? 0).toFixed(2)}%`} />
        <KpiCard label="Average score" value={(data?.metrics.avg_score ?? 0).toFixed(2)} />
      </div>
      <ScoreBucketsChart data={data?.score_buckets ?? []} />
      <ReportsTable
        rows={(data?.top_users ?? []).map((user) => ({
          id: user.user_id,
          title: user.name ?? user.user_id,
          avg_score: user.score,
        }))}
      />
    </div>
  );
}
