"use client";

// app/components/AppSidebar.tsx
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  BookOpen, ChevronRight, Search, GraduationCap,
  CircleCheckBig, Circle, Layers, LogIn,
} from "lucide-react";

type Course = { id: string; title: string; slug: string; level: string | null };
type Lesson = { id: string; title: string; slug: string; order_index: number; tags: string[] | null };
type ProgressMap = Record<string, "done" | "in_progress" | "not_started">;
type ModuleGroup = { title: string; lessons: Lesson[] };

function groupLessons(lessons: Lesson[]): ModuleGroup[] {
  const hasTags = lessons.some((l) => Array.isArray(l.tags) && l.tags.length > 0);

  if (hasTags) {
    const map = new Map<string, Lesson[]>();
    for (const l of lessons) {
      const key = l.tags?.[0]?.trim() || "General";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(l);
    }
    return Array.from(map.entries()).map(([title, ls]) => ({ title, lessons: ls }));
  }

  const result: ModuleGroup[] = [];
  for (let i = 0; i < lessons.length; i += 5) {
    result.push({ title: `Модуль ${Math.floor(i / 5) + 1}`, lessons: lessons.slice(i, i + 5) });
  }
  return result;
}

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createSupabaseBrowser();

  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourseSlug, setActiveCourseSlug] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Detect active course from URL
  useEffect(() => {
    const match = pathname.match(/\/(?:courses|lessons)\/([^/]+)/);
    if (match) setActiveCourseSlug(match[1]);
  }, [pathname]);

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  // Load courses
  useEffect(() => {
    supabase
      .from("courses")
      .select("id,title,slug,level")
      .order("title", { ascending: true })
      .then(({ data }) => setCourses((data ?? []) as Course[]));
  }, []);

  // Load lessons + progress when active course changes
  useEffect(() => {
    if (!activeCourseSlug) { setLessons([]); return; }

    const course = courses.find((c) => c.slug === activeCourseSlug);
    if (!course) return;

    setLoadingLessons(true);

    supabase
      .from("lessons")
      .select("id,title,slug,order_index,tags")
      .eq("course_id", course.id)
      .order("order_index", { ascending: true })
      .then(async ({ data: lessonsData }) => {
        const ls = (lessonsData ?? []) as Lesson[];
        setLessons(ls);

        // Load progress if signed in
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user && ls.length) {
          const { data: prog } = await supabase
            .from("lesson_progress")
            .select("lesson_id,status")
            .eq("user_id", userData.user.id)
            .in("lesson_id", ls.map((l) => l.id));

          const map: ProgressMap = {};
          for (const p of prog ?? []) {
            map[p.lesson_id] = p.status as ProgressMap[string];
          }
          setProgress(map);
        }

        setLoadingLessons(false);
      });
  }, [activeCourseSlug, courses]);

  // Cmd+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const modules = groupLessons(lessons);
  const activeCourse = courses.find((c) => c.slug === activeCourseSlug) ?? null;

  const doneCount = lessons.filter((l) => progress[l.id] === "done").length;
  const pct = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;

  // Filtered lessons for search
  const searchResults = search.trim()
    ? lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-[272px] hidden lg:flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">

      {/* ── Top brand ── */}
      <div className="px-4 pt-5 pb-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-xl bg-zinc-900 dark:bg-zinc-100 size-8 shrink-0">
              <GraduationCap className="size-4 text-white dark:text-zinc-900" />
            </div>
            <div>
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-none">
                EnglishCourse
              </div>
              <div className="text-[11px] text-zinc-500 mt-0.5">Learn • Practice • Quiz</div>
            </div>
          </div>

          {user ? (
            <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-500 ring-1 ring-emerald-500/20">
              signed
            </span>
          ) : (
            <Link href="/auth" className="inline-flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-700 px-2 py-0.5 text-[10px] font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <LogIn className="size-2.5" /> войти
            </Link>
          )}
        </div>

        {/* Search button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="w-full flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
        >
          <Search className="size-3.5 shrink-0" />
          <span className="flex-1 text-left text-[13px]">Search…</span>
          <kbd className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded-md font-mono">⌘K</kbd>
        </button>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">

        {/* Courses section */}
        <div>
          <div className="flex items-center gap-1.5 px-2 pb-2">
            <Layers className="size-3 text-zinc-400" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">
              Courses
            </span>
          </div>

          <div className="space-y-0.5">
            {courses.map((c) => {
              const active = c.slug === activeCourseSlug;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    setActiveCourseSlug(c.slug);
                    router.push(`/courses/${c.slug}`);
                  }}
                  className={cn(
                    "w-full group flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-all duration-150",
                    active
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm"
                      : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-zinc-100"
                  )}
                >
                  <div className="min-w-0 flex items-center gap-2.5">
                    <BookOpen className={cn("size-3.5 shrink-0 transition-colors", active ? "text-white dark:text-zinc-900" : "text-zinc-400")} />
                    <div className="min-w-0">
                      <div className="truncate text-[13px] font-medium leading-snug">{c.title}</div>
                      {c.level && (
                        <div className={cn("text-[11px] mt-0.5 leading-none", active ? "text-white/60 dark:text-zinc-900/60" : "text-zinc-400")}>
                          {c.level}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={cn("size-3.5 shrink-0 transition-all", active ? "text-white/70 dark:text-zinc-900/70 rotate-90" : "text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500")} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Outline section */}
        {activeCourse && (
          <div>
            <div className="flex items-center justify-between px-2 pb-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-400">Outline</span>
              </div>
              {lessons.length > 0 && (
                <span className="text-[10px] text-zinc-500 font-medium">{doneCount}/{lessons.length} · {pct}%</span>
              )}
            </div>

            {/* Progress bar */}
            {lessons.length > 0 && (
              <div className="mx-2 mb-3 h-1 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-zinc-900 dark:bg-zinc-100 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}

            {loadingLessons ? (
              <div className="space-y-1.5 px-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {modules.map((m) => (
                  <div key={m.title}>
                    <div className="flex items-center justify-between px-2 mb-1.5">
                      <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">{m.title}</span>
                      <span className="text-[10px] text-zinc-400">{m.lessons.filter(l => progress[l.id] === "done").length}/{m.lessons.length}</span>
                    </div>

                    <div className="space-y-0.5">
                      {m.lessons.map((l) => {
                        const isActive = pathname.includes(`/lessons/${activeCourse.slug}/${l.slug}`);
                        const status = progress[l.id] ?? "not_started";

                        return (
                          <Link
                            key={l.id}
                            href={`/lessons/${activeCourse.slug}/${l.slug}`}
                            className={cn(
                              "group flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] transition-all duration-150",
                              isActive
                                ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium"
                                : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 hover:text-zinc-900 dark:hover:text-zinc-100"
                            )}
                          >
                            {status === "done" ? (
                              <CircleCheckBig className="size-3.5 shrink-0 text-emerald-500" />
                            ) : (
                              <Circle className={cn("size-3.5 shrink-0 transition-colors", isActive ? "text-zinc-400" : "text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-400")} />
                            )}
                            <span className="truncate flex-1">{l.order_index}. {l.title}</span>
                            <ChevronRight className="size-3 shrink-0 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!activeCourse && (
          <div className="px-3 py-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center">
            <BookOpen className="size-5 text-zinc-300 dark:text-zinc-700 mx-auto mb-1.5" />
            <p className="text-[12px] text-zinc-500">Выбери курс чтобы увидеть уроки</p>
          </div>
        )}
      </div>

      {/* ── Bottom tip ── */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 px-4 py-3">
        <p className="text-[11px] text-zinc-400">Tip: Ctrl/⌘ + K to search</p>
      </div>

      {/* ── Search overlay ── */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/40 backdrop-blur-sm"
          onClick={() => { setSearchOpen(false); setSearch(""); }}
        >
          <div
            className="w-full max-w-md mx-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-100 dark:border-zinc-800">
              <Search className="size-4 text-zinc-400 shrink-0" />
              <input
                autoFocus
                className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 outline-none placeholder:text-zinc-400"
                placeholder="Поиск по урокам..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <kbd className="text-[10px] text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">ESC</kbd>
            </div>

            <div className="max-h-72 overflow-y-auto p-2">
              {search.trim() === "" ? (
                <p className="py-6 text-center text-sm text-zinc-400">Введи название урока...</p>
              ) : searchResults.length === 0 ? (
                <p className="py-6 text-center text-sm text-zinc-400">Ничего не найдено</p>
              ) : (
                searchResults.map((l) => (
                  <Link
                    key={l.id}
                    href={`/lessons/${activeCourseSlug}/${l.slug}`}
                    onClick={() => { setSearchOpen(false); setSearch(""); }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <BookOpen className="size-3.5 text-zinc-400 shrink-0" />
                    <span>{l.order_index}. {l.title}</span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
