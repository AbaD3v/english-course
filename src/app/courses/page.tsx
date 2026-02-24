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

  let courseProgress: Record<
    string,
    { total: number; done: number; percent: number }
  > = {};

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

        done =
          progress?.filter((p) => p.status === "done").length ?? 0;
      }

      const total = lessonIds.length;
      const percent = total ? Math.round((done / total) * 100) : 0;

      courseProgress[course.id] = { total, done, percent };
    }
  }

  return (
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Курсы</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Выбери курс и продолжай обучение.
        </p>
      </div>

      {!user && (
        <div className="rounded-2xl border p-4 text-sm text-muted-foreground">
          Войди, чтобы сохранять прогресс.{" "}
          <Link href="/auth" className="underline">
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
              className="rounded-2xl border p-5 hover:shadow-sm transition bg-white/60"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-lg">
                  {course.title}
                </h2>

                {course.level && (
                  <span className="text-xs rounded-full border px-2 py-1">
                    {course.level}
                  </span>
                )}
              </div>

              {course.description && (
                <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                  {course.description}
                </p>
              )}

              {user && progress && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>
                      {progress.done}/{progress.total}
                    </span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-black"
                      style={{ width: `${progress.percent}%` }}
                    />
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