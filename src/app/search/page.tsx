import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Search, BookOpen, FileText, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; course?: string }>;
}) {
  const { q = "", course } = await searchParams;
  const supabase = await createSupabaseServer();

  const query = q.trim();

  // Курсы — чтобы показать фильтр
  const { data: courses } = await supabase
    .from("courses")
    .select("id,title,slug")
    .order("created_at", { ascending: false });

  let results: any[] = [];

  if (query.length >= 2) {
    // получим course_id если есть фильтр
    let courseId: string | null = null;

    if (course) {
      const { data: c } = await supabase
        .from("courses")
        .select("id")
        .eq("slug", course)
        .maybeSingle();

      courseId = c?.id ?? null;
    }

    let req = supabase
      .from("lessons")
      .select("id,title,slug,order_index,course_id,tags")
      .textSearch("search_tsv", query, {
        type: "websearch",
        config: "english",
      })
      .order("order_index", { ascending: true })
      .limit(30);

    if (courseId) req = req.eq("course_id", courseId);

    const { data } = await req;
    results = data ?? [];
  }

  // мапа course_id -> slug для ссылок
  const courseSlugById = new Map<string, string>();
  (courses ?? []).forEach((c) => courseSlugById.set(c.id, c.slug));

  return (
    <main className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Поиск по урокам
        </h1>
        <p className="text-zinc-500 mt-2 max-w-xl">
          Ищите по названиям, словам и тексту уроков. Используйте фильтр, чтобы сузить результаты.
        </p>
      </div>

      {/* Modern Search Form */}
      <form className="grid gap-3 sm:grid-cols-[1fr,auto] md:grid-cols-[1fr,200px,auto] bg-white dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <input
            name="q"
            defaultValue={q}
            placeholder="Что ищем? Например: Present Simple..."
            className="w-full rounded-xl pl-11 pr-4 py-3 text-sm outline-none bg-transparent focus:ring-0"
          />
        </div>

        <div className="relative group">
          <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
          <select
            name="course"
            defaultValue={course ?? ""}
            className="w-full rounded-xl pl-11 pr-4 py-3 text-sm bg-transparent outline-none appearance-none cursor-pointer text-zinc-700 dark:text-zinc-300"
          >
            <option value="">Все курсы</option>
            {(courses ?? []).map((c) => (
              <option key={c.id} value={c.slug}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <button className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 px-5 py-3 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.97] transition-all shadow-sm">
          <Search className="size-4" />
          Найти
        </button>
      </form>

      {/* Results Section */}
      {query.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 p-16 bg-white dark:bg-zinc-900">
          <LayoutGrid className="size-10 text-zinc-400 mb-4" />
          <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">Начните поиск</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">Введите запрос (минимум 2 символа), чтобы найти нужные материалы.</p>
        </div>
      ) : query.length < 2 ? (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-white dark:bg-zinc-900 text-sm text-zinc-500">
          Слишком короткий запрос — введите минимум 2 символа.
        </div>
      ) : results.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center rounded-2xl border border-zinc-200 dark:border-zinc-800 p-16 bg-white dark:bg-zinc-900">
          <Search className="size-10 text-zinc-400 mb-4" />
          <h3 className="font-semibold text-zinc-950 dark:text-zinc-50">Ничего не найдено</h3>
          <p className="text-sm text-zinc-500 mt-1 max-w-sm">По запросу <span className="font-mono text-zinc-700">"{query}"</span> ничего не найдено. Попробуйте изменить запрос.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-zinc-500 font-medium">
            Найдено уроков: <span className="font-semibold text-zinc-950 dark:text-zinc-50">{results.length}</span>
          </div>

          <div className="space-y-3">
            {results.map((l) => {
              const courseSlug = courseSlugById.get(l.course_id) ?? "";
              return (
                <Link
                  key={l.id}
                  href={`/lessons/${courseSlug}/${l.slug}`}
                  className="block rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all hover:shadow-sm active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        <FileText className="size-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                          <span className="text-zinc-400 font-mono text-sm">{l.order_index}.</span>
                          {l.title}
                        </div>
                        <div className="text-xs text-zinc-500 mt-0.5 font-medium uppercase tracking-wider">
                          {courseSlug.replace(/-/g, ' ')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {Array.isArray(l.tags) && l.tags.length ? (
                    <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                      {l.tags.slice(0, 6).map((t: string) => (
                        <span
                          key={t}
                          className="text-xs rounded-full border border-zinc-200 dark:border-zinc-700 px-3 py-1 bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </main>
  );
}