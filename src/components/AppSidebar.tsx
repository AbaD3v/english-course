// app/components/AppSidebar.tsx
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { cn } from "@/components/ui/cn";
import { Badge } from "@/components/ui/Badge";
import { Search, BookOpen, ChevronRight } from "lucide-react";

type Course = { id: string; title: string; slug: string; level: string | null };
type Lesson = {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  tags: string[] | null;
};

type ModuleGroup = { title: string; lessons: Lesson[] };

export async function AppSidebar({
  activeCourseSlug,
  pathname,
}: {
  activeCourseSlug?: string | null;
  pathname?: string;
}) {
  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: coursesRaw } = await supabase
    .from("courses")
    .select("id,title,slug,level")
    .eq("published", true)
    .order("title", { ascending: true });

  const courses = (coursesRaw ?? []) as Course[];
  const activeCourse = courses.find((c) => c.slug === activeCourseSlug) ?? null;

  let lessons: Lesson[] = [];
  if (activeCourse) {
    const { data: lessonsRaw } = await supabase
      .from("lessons")
      .select("id,title,slug,order_index,tags")
      .eq("course_id", activeCourse.id)
      .order("order_index", { ascending: true });

    lessons = (lessonsRaw ?? []) as Lesson[];
  }

  const modules = groupLessonsIntoModules(lessons);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-[288px] hidden lg:block",
        "border-r border-zinc-100 dark:border-zinc-800",
        "bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white",
        "shadow-sm"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Top */}
        <div className="px-4 py-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight">
                EnglishCourse
              </div>
              <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                Learn • Practice • Quiz
              </div>
            </div>

            <Badge className="rounded-full text-xs font-normal bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
              {user ? "signed" : "guest"}
            </Badge>
          </div>

          <button
            className={cn(
              "mt-4 w-full rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 px-3 py-2",
              "text-left text-sm text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition",
              "flex items-center gap-2"
            )}
          >
            <Search className="h-4 w-4 text-zinc-400" />
            Search…
            <span className="ml-auto text-xs text-zinc-400">Ctrl K</span>
          </button>
        </div>

        {/* Scroll */}
        <div className="flex-1 overflow-auto px-3 pb-4 pt-4">
          {/* Courses */}
          <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400">
            COURSES
          </div>

          <div className="space-y-1">
            {courses.map((c) => {
              const active = c.slug === activeCourseSlug;
              return (
                <Link
                  key={c.id}
                  href={`/courses/${c.slug}`}
                  className={cn(
                    "group flex items-center justify-between gap-2 rounded-xl px-3 py-2",
                    "text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition",
                    active && "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-medium"
                  )}
                >
                  <div className="min-w-0">
                    <div className="truncate">{c.title}</div>
                    {c.level ? (
                      <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
                        {c.level}
                      </div>
                    ) : null}
                  </div>

                  <BookOpen
                    className={cn("h-4 w-4 text-zinc-400", active && "text-zinc-950 dark:text-white")}
                  />
                </Link>
              );
            })}
          </div>

          {/* Outline */}
          <div className="mt-5">
            <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-zinc-500 dark:text-zinc-400">
              OUTLINE
            </div>

            {!activeCourse ? (
              <div className="px-3 text-xs text-zinc-500 dark:text-zinc-400">
                Выбери курс — появится список уроков.
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((m) => (
                  <div key={m.title}>
                    <div className="flex items-center justify-between px-2">
                      <div className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                        {m.title}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {m.lessons.length}
                      </div>
                    </div>

                    <div className="mt-2 space-y-1">
                      {m.lessons.map((l) => {
                        const isActiveLesson =
                          !!pathname &&
                          pathname.startsWith(
                            `/lessons/${activeCourse.slug}/${l.slug}`
                          );

                        return (
                          <Link
                            key={l.id}
                            href={`/lessons/${activeCourse.slug}/${l.slug}`}
                            className={cn(
                              "group flex items-center gap-2 rounded-xl px-3 py-2",
                              "text-sm transition",
                              isActiveLesson
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-medium"
                                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            )}
                          >
                            <span className="w-7 shrink-0 text-xs text-zinc-400">
                              {l.order_index}.
                            </span>
                            <span className="truncate">{l.title}</span>

                            <ChevronRight
                              className={cn(
                                "ml-auto h-4 w-4 text-zinc-400 opacity-0 transition",
                                "group-hover:opacity-100",
                                isActiveLesson && "opacity-100 text-zinc-950 dark:text-white"
                              )}
                            />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-100 dark:border-zinc-800 px-4 py-3 text-xs text-zinc-500 dark:text-zinc-400">
          Tip: Ctrl/⌘ + K to search
        </div>
      </div>
    </aside>
  );
}

function groupLessonsIntoModules(lessons: Lesson[]): ModuleGroup[] {
  const hasTags = lessons.some((l) => Array.isArray(l.tags) && l.tags.length > 0);

  if (hasTags) {
    const map = new Map<string, Lesson[]>();
    for (const l of lessons) {
      const key = (l.tags?.[0] ?? "General").trim() || "General";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    }
    return Array.from(map.entries()).map(([title, ls]) => ({ title, lessons: ls }));
  }

  const chunkSize = 5;
  const result: ModuleGroup[] = [];
  for (let i = 0; i < lessons.length; i += chunkSize) {
    result.push({
      title: `Module ${Math.floor(i / chunkSize) + 1}`,
      lessons: lessons.slice(i, i + chunkSize),
    });
  }
  return result;
}