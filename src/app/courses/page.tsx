// src/app/courses/page.tsx
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { BookOpen, ArrowRight, Layers } from "lucide-react";

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string | null;
  created_at?: string | null;
};

type CourseProgress = { total: number; done: number; percent: number };

const levelColor: Record<string, string> = {
  A1: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  "A1-A2": "bg-sky-500/10 text-sky-400 ring-sky-500/20",
  A2: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
  B1: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  B2: "bg-orange-500/10 text-orange-400 ring-orange-500/20",
};

function LevelBadge({ level }: { level: string }) {
  const cls = levelColor[level] ?? "bg-zinc-500/10 text-zinc-400 ring-zinc-500/20";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset", cls)}>
      {level}
    </span>
  );
}

export default async function CoursesPage() {
  const supabase = await createSupabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  const typedCourses = (courses ?? []) as CourseRow[];
  const courseProgress: Record<string, CourseProgress> = {};

  if (user && typedCourses.length) {
    for (const course of typedCourses) {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id")
        .eq("course_id", course.id);

      const lessonIds = lessons?.map((l) => l.id) ?? [];
      let done = 0;

      if (lessonIds.length) {
        const { data: progress } = await supabase
          .from("lesson_progress")
          .select("lesson_id,status")
          .eq("user_id", user.id)
          .in("lesson_id", lessonIds);

        done = progress?.filter((p) => p.status === "done").length ?? 0;
      }

      const total = lessonIds.length;
      courseProgress[course.id] = {
        total,
        done,
        percent: total ? Math.round((done / total) * 100) : 0,
      };
    }
  }

  const totalDone = Object.values(courseProgress).reduce((s, p) => s + p.done, 0);
  const totalLessons = Object.values(courseProgress).reduce((s, p) => s + p.total, 0);

  return (
    <main className="min-h-screen px-6 py-10 md:px-10 md:py-14 max-w-6xl mx-auto space-y-10">

      {/* ── Header ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-medium tracking-widest text-zinc-500 uppercase">
            <Layers className="size-3.5" />
            Library
          </div>
          <h1 className="text-[2.25rem] font-bold tracking-[-0.03em] text-zinc-900 dark:text-zinc-50 leading-none">
            Курсы
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
            Двигайся последовательно: теория → практика → квиз.
          </p>
        </div>

        {/* Stats pill — only for signed-in users */}
        {user && totalLessons > 0 && (
          <div className="flex items-center gap-px rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm shrink-0 self-start md:self-auto">
            {[
              { label: "Курсов", value: typedCourses.length },
              { label: "Уроков", value: totalLessons },
              { label: "Пройдено", value: totalDone },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center px-5 py-3 gap-0.5 border-r border-zinc-200 dark:border-zinc-800 last:border-r-0">
                <span className="text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-none">{s.value}</span>
                <span className="text-[11px] text-zinc-500">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Guest banner ── */}
      {!user && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50 px-5 py-4">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Войдите, чтобы сохранять прогресс
          </p>
          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 dark:bg-white px-3.5 py-2 text-xs font-semibold text-white dark:text-zinc-900 hover:opacity-90 transition-opacity"
          >
            Войти <ArrowRight className="size-3" />
          </Link>
        </div>
      )}

      {/* ── Empty state ── */}
      {typedCourses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 py-20 text-center">
          <BookOpen className="mx-auto size-8 text-zinc-400 mb-3" />
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Курсов пока нет</p>
          <p className="mt-1 text-sm text-zinc-500">Они появятся, когда администратор их добавит</p>
        </div>
      )}

      {/* ── Course grid ── */}
      {typedCourses.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {typedCourses.map((course, i) => {
            const progress = user ? courseProgress[course.id] : undefined;
            const pct = progress?.percent ?? 0;
            const isStarted = (progress?.done ?? 0) > 0;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className={cn(
                  "group relative flex flex-col rounded-2xl border bg-white dark:bg-zinc-900",
                  "border-zinc-200 dark:border-zinc-800",
                  "hover:border-zinc-300 dark:hover:border-zinc-700",
                  "shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)]",
                  "transition-all duration-200 overflow-hidden",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/30 dark:focus-visible:ring-zinc-50/30"
                )}
              >
                {/* Subtle top accent line based on progress */}
                <div
                  className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 transition-all duration-500 rounded-t-2xl"
                  style={{ width: `${pct}%` }}
                />

                <div className="flex flex-col flex-1 p-5 gap-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 space-y-1.5">
                      <h2 className="text-[15px] font-semibold text-zinc-900 dark:text-zinc-50 leading-snug group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors line-clamp-2">
                        {course.title}
                      </h2>
                      {course.description ? (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      ) : null}
                    </div>
                    {course.level && <LevelBadge level={course.level} />}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Footer */}
                  {progress ? (
                    <div className="space-y-2.5 pt-1">
                      {/* Progress bar */}
                      <div className="h-1 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {progress.done} / {progress.total} уроков
                        </span>
                        <span className={cn(
                          "text-xs font-semibold",
                          pct === 100 ? "text-emerald-500" : "text-zinc-900 dark:text-zinc-100"
                        )}>
                          {pct === 100 ? "✓ Завершён" : isStarted ? `${pct}%` : "Начать →"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs text-zinc-400">
                        {/* lesson count unknown for guests */}
                        Открыть курс
                      </span>
                      <ArrowRight className="size-3.5 text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-200 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
