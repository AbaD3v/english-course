import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

export default async function CoursesPage() {
  const supabase = await createSupabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: courses } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  const courseProgress: Record<string, { total: number; done: number; percent: number }> = {};

  if (user && courses?.length) {
    for (const course of courses) {
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

  return (
    <main className="space-y-8">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.24em] text-white/45">Library</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Курсы</h1>
        <p className="mt-2 text-sm text-white/60">Выбери курс и двигайся последовательно: урок → практика → прогресс.</p>
      </div>

      {!user && (
        <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-4 text-sm text-white/65">
          Войди, чтобы сохранять прогресс.
          <Link href="/auth" className="ml-2 underline underline-offset-4 text-white">
            Войти
          </Link>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => {
          const progress = courseProgress[course.id];

          return (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.06]"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-medium text-lg text-white">{course.title}</h2>

                {course.level && (
                  <span className="text-xs rounded-full border border-white/20 bg-white/10 px-2 py-1 text-white/80">
                    {course.level}
                  </span>
                )}
              </div>

              {course.description && (
                <p className="text-sm text-white/60 mt-2 line-clamp-3">{course.description}</p>
              )}

              {user && progress && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs text-white/55">
                    <span>
                      {progress.done}/{progress.total}
                    </span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-white" style={{ width: `${progress.percent}%` }} />
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
