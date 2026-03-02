"use client";

import { useEffect, useState } from "react";
import { DateRange } from "@/components/admin/DateRange";
import { KpiCard } from "@/components/admin/KpiCard";
import { ActivityChart } from "@/components/admin/Charts";
import { ReportsTable } from "@/components/admin/ReportsTable";
import type { CourseResponse } from "@/lib/admin/reports";

export function AdminCourseClient({ slug, initialFrom, initialTo }: { slug: string; initialFrom: string; initialTo: string }) {
  const [range, setRange] = useState({ from: initialFrom, to: initialTo });
  const [data, setData] = useState<CourseResponse | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/admin/reports/course/${slug}?from=${range.from}&to=${range.to}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((json: CourseResponse) => setData(json))
      .catch(() => undefined);

    return () => controller.abort();
  }, [range, slug]);

  const attempted = data?.lessons.reduce((acc, lesson) => acc + lesson.attempted, 0) ?? 0;
  const completed = data?.lessons.reduce((acc, lesson) => acc + lesson.completed, 0) ?? 0;

  return (
    <div className="space-y-6">
      <DateRange from={range.from} to={range.to} onChange={setRange} />
      <a
        className="inline-flex rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
        href={`/api/admin/reports/export.csv?scope=course&slugOrId=${slug}&from=${range.from}&to=${range.to}`}
      >
        Export CSV
      </a>
      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Course" value={data?.course.title ?? slug} />
        <KpiCard label="Lessons" value={String(data?.lessons.length ?? 0)} />
        <KpiCard label="Attempted" value={String(attempted)} />
        <KpiCard label="Completed" value={String(completed)} />
      </div>
      <ActivityChart data={data?.activity_by_day ?? []} />
      <ReportsTable
        rows={(data?.lessons ?? []).map((lesson) => ({
          id: lesson.lesson_id,
          title: lesson.title,
          attempted: lesson.attempted,
          completed: lesson.completed,
          avg_score: lesson.avg_score,
          pass_rate: lesson.pass_rate,
          href: `/admin/lessons/${lesson.lesson_id}`,
        }))}
      />
    </div>
  );
}
