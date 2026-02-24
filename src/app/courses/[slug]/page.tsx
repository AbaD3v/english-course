import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";

type LessonRow = {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  tags: string[] | null;
};

function statusMeta(status: string) {
  if (status === "done")
    return { label: "Done", dot: "bg-emerald-400", text: "text-emerald-700" };
  if (status === "in_progress")
    return { label: "In progress", dot: "bg-amber-400", text: "text-amber-700" };
  return { label: "Not started", dot: "bg-zinc-300", text: "text-zinc-500" };
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!course) return notFound();

  const { data: lessonsRaw } = await supabase
    .from("lessons")
    .select("id,title,slug,order_index,tags")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  const lessons = (lessonsRaw ?? []) as LessonRow[];
  const lessonIds = lessons.map((l) => l.id);

  const progressMap = new Map<
    string,
    { status: string; last_seen_at?: string | null; score?: number | null }
  >();

  if (user && lessonIds.length) {
    const { data: progress } = await supabase
      .from("lesson_progress")
      .select("lesson_id,status,last_seen_at,score")
      .eq("user_id", user.id)
      .in("lesson_id", lessonIds);

    (progress ?? []).forEach((p) =>
      progressMap.set(p.lesson_id, {
        status: p.status,
        last_seen_at: p.last_seen_at,
        score: p.score,
      })
    );
  }

  const total = lessons.length;
  const doneCount = lessons.filter((l) => progressMap.get(l.id)?.status === "done")
    .length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  // avg score
  const avgScore = (() => {
    if (!user) return null;
    const scores = lessons
      .map((l) => progressMap.get(l.id)?.score)
      .filter((x): x is number => typeof x === "number");
    if (!scores.length) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  })();

  // Continue
  let continueHref: string | null = null;
  let continueText: string | null = null;

  if (lessons.length) {
    const ranked = lessons
      .map((l) => ({
        l,
        last: progressMap.get(l.id)?.last_seen_at ?? null,
      }))
      .filter((x) => x.last !== null)
      .sort((a, b) => String(b.last).localeCompare(String(a.last)));

    if (ranked.length) {
      const l = ranked[0].l;
      continueHref = `/lessons/${course.slug}/${l.slug}`;
      continueText = `${l.order_index}. ${l.title}`;
    } else {
      const firstNotDone =
        lessons.find((l) => progressMap.get(l.id)?.status !== "done") ?? lessons[0];
      continueHref = `/lessons/${course.slug}/${firstNotDone.slug}`;
      continueText = `${firstNotDone.order_index}. ${firstNotDone.title}`;
    }
  }

  // Modules (MVP)
  const modules = [
    { title: "Module 1 · Start speaking", range: [1, 3] as const },
    { title: "Module 2 · Everyday English", range: [4, 7] as const },
    { title: "Module 3 · Past & Review", range: [8, 10] as const },
  ];

  function inRange(n: number, r: readonly [number, number]) {
    return n >= r[0] && n <= r[1];
  }

  return (
    <main className="space-y-8">
      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/courses"
          className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-medium hover:bg-white/80 transition"
        >
          ← Все курсы
        </Link>

        <div className="text-sm text-black/60">
          {user ? (
            <span className="font-medium text-black/80">Signed in</span>
          ) : (
            <span>
              <Link href="/auth" className="underline">
                Войти
              </Link>{" "}
              чтобы сохранять прогресс
            </span>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="rounded-[28px] border border-black/10 bg-white/70 backdrop-blur shadow-[0_18px_50px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {course.level ? (
                  <span className="text-xs rounded-full border border-black/10 px-2.5 py-1 bg-white/70 text-black/70">
                    {course.level}
                  </span>
                ) : null}

                <span className="text-xs rounded-full border border-black/10 px-2.5 py-1 bg-white/70 text-black/70">
                  {total} lessons
                </span>
                <span className="text-xs rounded-full border border-black/10 px-2.5 py-1 bg-white/70 text-black/70">
                  {doneCount} done
                </span>
              </div>

              <div>
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-black">
                  {course.title}
                </h1>

                {course.description ? (
                  <p className="mt-2 text-sm md:text-base text-black/60 max-w-2xl">
                    {course.description}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {continueHref ? (
                  <Link
                    href={continueHref}
                    className="rounded-2xl bg-black text-white px-5 py-3 font-medium hover:opacity-90 transition shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
                  >
                    Продолжить
                  </Link>
                ) : null}
                <Link
  href={`/certificate/${course.slug}`}
  className="rounded-2xl border border-black/10 bg-white/70 px-5 py-3 font-medium hover:bg-white/90 transition"
>
  Сертификат
</Link>

                {continueText ? (
                  <span className="text-sm text-black/60">
                    Следующий:{" "}
                    <span className="font-medium text-black/80">
                      {continueText}
                    </span>
                  </span>
                ) : null}
              </div>
            </div>

            {/* Progress widget */}
            <div className="w-full md:w-[360px] rounded-2xl border border-black/10 bg-white/60 p-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-black/60">Прогресс</span>
                <span className="font-medium text-black/80">
                  {doneCount}/{total} • {percent}%
                </span>
              </div>

              <div className="mt-3 h-2 w-full rounded-full bg-black/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-black/70"
                  style={{ width: `${percent}%` }}
                />
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-2xl border border-black/10 bg-white/70 p-3">
                  <div className="text-xs text-black/50">Lessons</div>
                  <div className="mt-1 font-semibold text-black">{total}</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white/70 p-3">
                  <div className="text-xs text-black/50">Done</div>
                  <div className="mt-1 font-semibold text-black">{doneCount}</div>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white/70 p-3">
                  <div className="text-xs text-black/50">Score</div>
                  <div className="mt-1 font-semibold text-black">
                    {avgScore !== null ? `${avgScore}%` : "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* subtle gradient strip */}
        <div className="h-10 bg-gradient-to-r from-black/5 via-black/0 to-black/5" />
      </section>

      {/* Lessons header */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-black">Lessons</h2>
            <p className="text-sm text-black/60">
              Выбирай уроки по порядку или переходи к нужному через поиск.
            </p>
          </div>

          <Link
            href="/search"
            className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-medium hover:bg-white/80 transition"
          >
            Поиск →
          </Link>
        </div>

        {/* Modules */}
        <div className="space-y-10">
          {modules.map((m) => {
            const moduleLessons = lessons.filter((l) => inRange(l.order_index, m.range));
            if (!moduleLessons.length) return null;

            const moduleDone = moduleLessons.filter(
              (l) => progressMap.get(l.id)?.status === "done"
            ).length;

            const modulePercent = moduleLessons.length
              ? Math.round((moduleDone / moduleLessons.length) * 100)
              : 0;

            return (
              <div key={m.title} className="space-y-4">
                {/* Module header */}
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold text-black">{m.title}</div>
                    <div className="mt-1 text-xs text-black/50">
                      {moduleDone}/{moduleLessons.length} • {modulePercent}%
                    </div>
                  </div>

                  <div className="h-1.5 w-28 rounded-full bg-black/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-black/60"
                      style={{ width: `${modulePercent}%` }}
                    />
                  </div>
                </div>

                {/* Lesson cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {moduleLessons.map((lesson) => {
                    const p = progressMap.get(lesson.id);
                    const status = p?.status ?? "not_started";
                    const score = typeof p?.score === "number" ? p.score : null;
                    const meta = statusMeta(status);

                    return (
                      <Link
                        id={`lesson-${lesson.slug}`}
                        key={lesson.id}
                        href={`/lessons/${course.slug}/${lesson.slug}`}
                        className={[
                          "group block rounded-3xl border border-black/10 bg-white/80 backdrop-blur",
                          "shadow-[0_18px_50px_rgba(0,0,0,0.06)]",
                          "transition-all duration-200",
                          "hover:-translate-y-0.5 hover:bg-white/90 hover:shadow-[0_26px_70px_rgba(0,0,0,0.10)]",
                          "scroll-mt-24 target:ring-2 target:ring-black/15",
                        ].join(" ")}
                      >
                        <div className="p-5 md:p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="text-xs text-black/50">
                                Lesson {lesson.order_index}
                              </div>
                              <div className="mt-1 truncate text-base font-semibold text-black">
                                {lesson.title}
                              </div>
                            </div>

                            <div className="text-right">
                              <div className="inline-flex items-center gap-2 text-xs">
                                <span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} />
                                <span className={`font-medium ${meta.text}`}>
                                  {meta.label}
                                </span>
                              </div>

                              {score !== null ? (
                                <div className="mt-1 text-xs text-black/50">
                                  Score: <span className="font-medium text-black/70">{score}%</span>
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {lesson.tags?.length ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {lesson.tags.slice(0, 5).map((t) => (
                                <span
                                  key={t}
                                  className="text-xs rounded-full border border-black/10 px-2.5 py-1 bg-black/5 text-black/70"
                                >
                                  {t}
                                </span>
                              ))}
                              {lesson.tags.length > 5 ? (
                                <span className="text-xs rounded-full border border-black/10 px-2.5 py-1 bg-black/5 text-black/60">
                                  +{lesson.tags.length - 5}
                                </span>
                              ) : null}
                            </div>
                          ) : null}

                          <div className="mt-4 flex items-center justify-between">
                            <div className="text-sm text-black/60 group-hover:text-black/75 transition">
                              Open →
                            </div>
                            <div className="text-sm text-black/30 group-hover:text-black/55 transition">
                              →
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}