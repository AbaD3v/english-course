"use client";

import { useEffect, useMemo, useState } from "react";
import { DateRange } from "@/components/admin/DateRange";
import { KpiCard } from "@/components/admin/KpiCard";
import { ActivityChart } from "@/components/admin/Charts";
import { ReportsTable } from "@/components/admin/ReportsTable";
import type { OverviewResponse } from "@/lib/admin/reports";

interface Props {
  initialFrom: string;
  initialTo: string;
}

export function AdminOverviewClient({ initialFrom, initialTo }: Props) {
  const [range, setRange] = useState({ from: initialFrom, to: initialTo });
  const [data, setData] = useState<OverviewResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/reports/overview?from=${range.from}&to=${range.to}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((json: OverviewResponse) => setData(json))
      .catch(() => undefined);

    return () => controller.abort();
  }, [range]);

  const rows = useMemo(
    () =>
      (data?.top_lessons ?? []).map((lesson) => ({
        id: lesson.lesson_id,
        title: lesson.title,
        completed: lesson.completed_count,
        avg_score: lesson.avg_score,
        href: `/admin/lessons/${lesson.lesson_id}`,
      })),
    [data]
  );

  return (
    <div className="space-y-6">
      <DateRange from={range.from} to={range.to} onChange={setRange} />
      <a
        className="inline-flex rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
        href={`/api/admin/reports/export.csv?scope=overview&from=${range.from}&to=${range.to}`}
      >
        Export CSV
      </a>
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Attempted users" value={String(data?.total_attempted_users ?? 0)} />
        <KpiCard label="Completed" value={String(data?.total_completed ?? 0)} />
        <KpiCard label="Pass rate" value={`${(data?.pass_rate ?? 0).toFixed(2)}%`} />
        <KpiCard label="Average score" value={(data?.avg_score ?? 0).toFixed(2)} />
      </div>
      <ActivityChart data={data?.activity_by_day ?? []} />
      <ReportsTable rows={rows} />
    </div>
  );
}
