// src/app/courses/page.tsx
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

type CourseRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  level: string | null;
  created_at?: string | null;
};

type CourseProgress = { total: number; done: number; percent: number };

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
      const percent = total ? Math.round((done / total) * 100) : 0;
      courseProgress[course.id] = { total, done, percent };
    }
  }

  const hasCourses = typedCourses.length > 0;

  return (
    <main className="space-y-8">
      <header className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
          Library
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Курсы
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Выбери курс и двигайся последовательно: урок → практика → прогресс.
        </p>
      </header>

      {!user && (
        <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-4 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-700">
              Войди, чтобы сохранять прогресс.
            </p>
            <Link
              href="/auth"
              className="inline-flex h-9 items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-zinc-50 active:translate-y-0"
            >
              Войти
            </Link>
          </div>
        </div>
      )}

      {!hasCourses ? (
        <div className="rounded-2xl border border-zinc-200/70 bg-white/70 p-10 text-center shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl">
          <p className="text-sm font-medium text-zinc-900">Пока нет курсов</p>
          <p className="mt-1 text-sm text-zinc-600">
            Когда админ добавит курсы, они появятся здесь.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {typedCourses.map((course) => {
            const progress = user ? courseProgress[course.id] : undefined;

            return (
              <Link
                key={course.id}
                href={`/courses/${course.slug}`}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-zinc-200/70 bg-white/70 p-5 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl",
                  "transition will-change-transform hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-md",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20"
                )}
              >
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                >
                  <div className="absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-gradient-to-b from-zinc-900/[0.06] to-transparent blur-2xl" />
                </div>

                <div className="relative flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-zinc-900">
                      {course.title}
                    </h2>
                    {course.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                        {course.description}
                      </p>
                    ) : (
                      <p className="mt-1 text-sm text-zinc-500">
                        Без описания
                      </p>
                    )}
                  </div>

                  {course.level ? (
                    <span className="shrink-0 rounded-full border border-zinc-200 bg-white/80 px-2 py-1 text-xs font-medium text-zinc-700 shadow-sm">
                      {course.level}
                    </span>
                  ) : null}
                </div>

                {user && progress ? (
                  <div className="relative mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-medium text-zinc-600">
                      <span>
                        {progress.done} / {progress.total} уроков
                      </span>
                      <span className="text-zinc-900">{progress.percent}%</span>
                    </div>

                    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-zinc-900 transition-[width] duration-500 ease-out"
                        style={{ width: `${progress.percent}%` }}
                      />
                    </div>

                    <div className="pt-1 text-xs text-zinc-500">
                      Нажми, чтобы продолжить обучение
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-5 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">
                      Открой курс, чтобы посмотреть уроки
                    </span>
                    <span className="text-xs font-medium text-zinc-900/70 transition group-hover:text-zinc-900">
                      Открыть →
                    </span>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}