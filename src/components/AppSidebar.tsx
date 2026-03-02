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
        "border-r border-white/10",
        "bg-gradient-to-b from-[#0f0f12] via-[#111114] to-[#0c0c0f] text-white",
        "shadow-[inset_-1px_0_0_rgba(255,255,255,0.04)]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Top */}
        <div className="px-4 py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-semibold tracking-tight">
                EnglishCourse
              </div>
              <div className="mt-1 text-sm text-white/55">
                Learn • Practice • Quiz
              </div>
            </div>

            <Badge className="border-white/10 bg-white/5 text-white/70">
              {user ? "signed" : "guest"}
            </Badge>
          </div>

          <button
            className={cn(
              "mt-4 w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2",
              "text-left text-sm text-white/70 hover:bg-white/10 transition",
              "flex items-center gap-2"
            )}
          >
            <Search className="h-4 w-4 text-white/60" />
            Search…
            <span className="ml-auto text-xs text-white/40">Ctrl K</span>
          </button>
        </div>

        {/* Scroll */}
        <div className="flex-1 overflow-auto px-3 pb-4">
          {/* Courses */}
          <div className="px-2 pb-2 text-xs font-semibold tracking-wider text-white/45">
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
                    "text-sm text-white/80 hover:bg-white/10 transition",
                    active && "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
                  )}
                >
                  <div className="min-w-0">
                    <div className="truncate">{c.title}</div>
                    {c.level ? (
                      <div className="mt-0.5 text-sm text-white/55">
                        {c.level}
                      </div>
                    ) : null}
                  </div>

                  <BookOpen
                    className={cn("h-4 w-4 text-white/35", active && "text-white/70")}
                  />
                </Link>
              );
            })}
          </div>

          {/* Outline */}
          <div className="mt-5">
            <div className="px-2 pb-2 text-xs font-semibold tracking-wider text-white/45">
              OUTLINE
            </div>

            {!activeCourse ? (
              <div className="px-3 text-sm text-white/55">
                Выбери курс — появится список уроков.
              </div>
            ) : (
              <div className="space-y-4">
                {modules.map((m) => (
                  <div key={m.title}>
                    <div className="flex items-center justify-between px-2">
                      <div className="text-sm font-semibold text-white/70">
                        {m.title}
                      </div>
                      <div className="text-xs text-white/35">
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
                                ? "bg-white/14 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
                                : "text-white/70 hover:bg-white/10"
                            )}
                          >
                            <span className="w-8 shrink-0 text-sm text-white/45">
                              {l.order_index}.
                            </span>
                            <span className="truncate">{l.title}</span>

                            <ChevronRight
                              className={cn(
                                "ml-auto h-4 w-4 text-white/25 opacity-0 transition",
                                "group-hover:opacity-100",
                                isActiveLesson && "opacity-100 text-white/35"
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

        <div className="border-t border-white/10 px-4 py-3 text-sm text-white/55">
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