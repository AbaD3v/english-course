// courses/page.tsx
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

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
    <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Курсы</h1>
        <p className="text-base text-zinc-600 dark:text-zinc-400 mt-2">
          Выбери курс и продолжай обучение.
        </p>
      </div>

      {!user && (
        <div className="rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-sm flex items-center justify-between gap-4">
          <div className="text-zinc-600 dark:text-zinc-400">
            Войди, чтобы сохранять прогресс и отслеживать достижения.
          </div>
          <Link href="/auth">
            <Badge variant="muted" className="hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer text-xs rounded-full px-4 py-1.5">
              Войти
            </Badge>
          </Link>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => {
          const progress = courseProgress[course.id];

          return (
            <Link
              key={course.id}
              href={`/courses/${course.slug}`}
              className="group"
            >
              <Card className="h-full rounded-3xl border border-zinc-100 dark:border-zinc-800 transition-all duration-300 hover:shadow-lg hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 flex flex-col overflow-hidden p-6">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h2 className="text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                    {course.title}
                  </h2>
                  {course.level && (
                    <Badge variant="muted" className="text-xs rounded-full px-3 py-1 text-zinc-700 dark:text-zinc-300 font-normal shrink-0">
                      {course.level}
                    </Badge>
                  )}
                </div>
                
                <div className="flex-grow flex flex-col justify-between gap-6">
                  {course.description && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                      {course.description}
                    </p>
                  )}
                  
                  {user && progress && (
                    <div className="space-y-3 mt-auto">
                      <div className="flex justify-between items-center text-xs font-medium">
                        <span className="text-zinc-600 dark:text-zinc-400">
                          {progress.done} / {progress.total} уроков
                        </span>
                        <span className="text-zinc-950 dark:text-zinc-50">{progress.percent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 dark:bg-zinc-50 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}