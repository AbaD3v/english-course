import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

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
    <main className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Поиск по урокам</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ищи по названиям, словам и тексту уроков.
        </p>
      </div>

      {/* форма поиска (обычная GET) */}
      <form className="grid gap-3 md:grid-cols-[1fr_220px_140px]">
        <input
          name="q"
          defaultValue={q}
          placeholder="Например: greetings, present simple, hello..."
          className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
        />

        <select
          name="course"
          defaultValue={course ?? ""}
          className="w-full rounded-xl border px-4 py-3 bg-white outline-none"
        >
          <option value="">Все курсы</option>
          {(courses ?? []).map((c) => (
            <option key={c.id} value={c.slug}>
              {c.title}
            </option>
          ))}
        </select>

        <button className="rounded-xl bg-black text-white px-4 py-3 font-medium hover:opacity-90 transition">
          Найти
        </button>
      </form>

      {/* результаты */}
      {query.length === 0 ? (
        <div className="rounded-2xl border p-5 text-sm text-muted-foreground">
          Введи запрос (минимум 2 символа).
        </div>
      ) : query.length < 2 ? (
        <div className="rounded-2xl border p-5 text-sm text-muted-foreground">
          Слишком коротко — введи минимум 2 символа.
        </div>
      ) : results.length === 0 ? (
        <div className="rounded-2xl border p-5 text-sm text-muted-foreground">
          Ничего не найдено по запросу: <span className="font-medium">{query}</span>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">
            Найдено: <span className="font-medium">{results.length}</span>
          </div>

          {results.map((l) => {
            const courseSlug = courseSlugById.get(l.course_id) ?? "";
            return (
              <Link
                key={l.id}
                href={`/lessons/${courseSlug}/${l.slug}`}
                className="block rounded-xl border p-4 hover:bg-muted transition"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium">
                    {l.order_index}. {l.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {courseSlug}
                  </div>
                </div>

                {Array.isArray(l.tags) && l.tags.length ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {l.tags.slice(0, 6).map((t: string) => (
                      <span
                        key={t}
                        className="text-xs rounded-full border px-2 py-1 bg-white/60"
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
      )}
    </main>
  );
}