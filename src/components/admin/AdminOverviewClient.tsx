// src/components/admin/AdminOverviewClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { DateRange } from "@/components/admin/DateRange";
import { KpiCard } from "@/components/admin/KpiCard";
import { ActivityChart } from "@/components/admin/Charts";
import { ReportsTable } from "@/components/admin/ReportsTable";
import {
  Users, CheckCircle2, Target, TrendingUp,
  Download, RefreshCw, ChevronRight, BookOpen,
} from "lucide-react";
import type { OverviewResponse } from "@/lib/admin/reports";

interface Props {
  initialFrom: string;
  initialTo: string;
  // Список курсов передаём с сервера чтобы показать карточки курсов
  courses: Array<{ id: string; slug: string; title: string; level: string | null }>;
}

export function AdminOverviewClient({ initialFrom, initialTo, courses }: Props) {
  const [range, setRange] = useState({ from: initialFrom, to: initialTo });
  const [data, setData] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch(`/api/admin/reports/overview?from=${range.from}&to=${range.to}`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((json: OverviewResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => controller.abort();
  }, [range]);

  const rows = useMemo(
    () =>
      (data?.top_lessons ?? []).map((lesson) => ({
        id: lesson.lesson_id,
        title: lesson.title,
        completed: lesson.completed_count,
        avg_score: lesson.avg_score,
        href: `/admin/reports/lessons/${lesson.lesson_id}`,
      })),
    [data]
  );

  const kpis = [
    { label: "Пользователей",  value: String(data?.total_attempted_users ?? 0), icon: Users,         accent: "sky"    as const, hint: "прошли хотя бы 1 урок" },
    { label: "Завершений",     value: String(data?.total_completed ?? 0),        icon: CheckCircle2,  accent: "emerald"as const, hint: "уроков завершено"       },
    { label: "Pass rate",      value: `${(data?.pass_rate ?? 0).toFixed(1)}%`,   icon: Target,        accent: "amber"  as const, hint: "score ≥ 70%"            },
    { label: "Avg score",      value: `${(data?.avg_score ?? 0).toFixed(1)}%`,   icon: TrendingUp,    accent: "violet" as const, hint: "средний балл"           },
  ];

  return (
    <div className="space-y-10">

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateRange from={range.from} to={range.to} onChange={setRange} />
        <div className="flex items-center gap-2">
          {loading && (
            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
              <RefreshCw className="size-3 animate-spin" /> Загрузка...
            </span>
          )}
          <a
            href={`/api/admin/reports/export.csv?scope=overview&from=${range.from}&to=${range.to}`}
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100 transition-all"
          >
            <Download className="size-3.5" /> Экспорт CSV
          </a>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard
            key={kpi.label}
            label={kpi.label}
            value={loading ? "—" : kpi.value}
            icon={kpi.icon}
            accent={kpi.accent}
            hint={kpi.hint}
          />
        ))}
      </div>

      {/* Activity Chart */}
      <ActivityChart data={data?.activity_by_day ?? []} />

      {/* Course cards */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Курсы</h3>
          <p className="text-xs text-zinc-600 mt-0.5">нажми на курс чтобы посмотреть детальную статистику</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/admin/reports/courses/${course.slug}`}
              className="group flex items-center justify-between gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3.5 hover:border-zinc-700 hover:bg-zinc-800/80 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex items-center justify-center rounded-lg bg-zinc-800 group-hover:bg-zinc-700 p-2 transition-colors shrink-0">
                  <BookOpen className="size-4 text-amber-400" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                    {course.title}
                  </div>
                  {course.level && (
                    <div className="text-xs text-zinc-600">{course.level}</div>
                  )}
                </div>
              </div>
              <ChevronRight className="size-4 text-zinc-600 group-hover:text-zinc-400 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {/* Top lessons table */}
      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-200">Топ уроков</h3>
          <p className="text-xs text-zinc-600 mt-0.5">по количеству завершений за период</p>
        </div>
        <ReportsTable rows={rows} />
      </div>
    </div>
  );
}
