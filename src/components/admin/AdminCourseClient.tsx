"use client";

import { useEffect, useState } from "react";
import { DateRange } from "@/components/admin/DateRange";
import { KpiCard } from "@/components/admin/KpiCard";
import { ActivityChart } from "@/components/admin/Charts";
import { ReportsTable } from "@/components/admin/ReportsTable";
import type { CourseResponse } from "@/lib/admin/reports";

type Range = { from: string; to: string };

export function AdminCourseClient({
  slug,
  initialFrom,
  initialTo,
}: {
  slug: string;
  initialFrom: string;
  initialTo: string;
}) {
  const [range, setRange] = useState<Range>({ from: initialFrom, to: initialTo });
  const [data, setData] = useState<CourseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(`/api/admin/reports/course/${slug}?from=${range.from}&to=${range.to}`, {
      signal: controller.signal,
    })
      .then(async (res) => {
        const json = await res.json().catch(() => null);

        if (!res.ok) {
          const msg =
            (json && typeof json === "object" && "error" in json && typeof (json as any).error === "string"
              ? (json as any).error
              : `Request failed (${res.status})`);
          throw new Error(msg);
        }

        setData(json as CourseResponse);
      })
      .catch((e: unknown) => {
        // ignore aborts
        if (e instanceof DOMException && e.name === "AbortError") return;

        setData(null);
        setError(e instanceof Error ? e.message : "Failed to load report");
      })
      .finally(() => {
        setLoading(false);
      });

    return () => controller.abort();
  }, [range, slug]);

  const lessons = data?.lessons ?? [];
  const attempted = lessons.reduce((acc, lesson) => acc + (lesson.attempted ?? 0), 0);
  const completed = lessons.reduce((acc, lesson) => acc + (lesson.completed ?? 0), 0);

  const courseTitle = data?.course?.title ?? slug;

  return (
    <div className="space-y-6">
      <DateRange from={range.from} to={range.to} onChange={setRange} />

      <a
        className="inline-flex rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
        href={`/api/admin/reports/export.csv?scope=course&slugOrId=${slug}&from=${range.from}&to=${range.to}`}
      >
        Export CSV
      </a>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <KpiCard label="Course" value={courseTitle} />
        <KpiCard label="Lessons" value={String(lessons.length)} />
        <KpiCard label="Attempted" value={String(attempted)} />
        <KpiCard label="Completed" value={String(completed)} />
      </div>

      {loading ? (
        <div className="text-sm text-white/60">Loading…</div>
      ) : (
        <>
          <ActivityChart data={data?.activity_by_day ?? []} />
          <ReportsTable
            rows={lessons.map((lesson) => ({
              id: lesson.lesson_id,
              title: lesson.title,
              attempted: lesson.attempted,
              completed: lesson.completed,
              avg_score: lesson.avg_score,
              pass_rate: lesson.pass_rate,
              href: `/admin/lessons/${lesson.lesson_id}`,
            }))}
          />
        </>
      )}
    </div>
  );
}