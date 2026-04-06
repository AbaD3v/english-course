// src/app/courses/[slug]/page.tsx
// ИЗМЕНЕНИЕ: модули теперь динамические (по 5 уроков), не захардкожены

import Link from "next/link";
import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, BookOpen, CheckCircle2, Lock, Trophy } from "lucide-react";

type LessonRow = {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  tags: string[] | null;
};

function statusMeta(status: string) {
  if (status === "done")
    return { label: "Done", dot: "bg-emerald-500" };
  if (status === "in_progress")
    return { label: "In progress", dot: "bg-amber-500" };
  return { label: "Not started", dot: "bg-zinc-300" };
}

// Динамическая группировка уроков по N штук в модуль
function groupIntoModules(lessons: LessonRow[], size = 5) {
  return Array.from({ length: Math.ceil(lessons.length / size) }, (_, i) => ({
    title: `Модуль ${i + 1}`,
    lessons: lessons.slice(i * size, (i + 1) * size),
  }));
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
  const doneCount = lessons.filter((l) => progressMap.get(l.id)?.status === "done").length;
  const percent = total ? Math.round((doneCount / total) * 100) : 0;

  const avgScore = (() => {
    if (!user) return null;
    const scores = lessons
      .map((l) => progressMap.get(l.id)?.score)
      .filter((x): x is number => typeof x === "number");
    if (!scores.length) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  })();

  let continueHref: string | null = null;
  let continueText: string | null = null;

  if (lessons.length) {
    const ranked = lessons
      .map((l) => ({ l, last: progressMap.get(l.id)?.last_seen_at ?? null }))
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

  // Динамические модули — по 5 уроков
  const modules = groupIntoModules(lessons, 5);

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-8">
      {/* Top row */}
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="rounded-xl gap-2">
          <Link href="/courses" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Все курсы
          </Link>
        </Button>
        <div className="text-sm text-zinc-500">
          {user ? (
            <span className="font-medium text-zinc-950 dark:text-zinc-50">Привет!</span>
          ) : (
            <span className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              <Link href="/auth" className="underline">Войти</Link>
              {" "}чтобы сохранять прогресс
            </span>
          )}
        </div>
      </div>

      {/* Hero */}
      <section className="rounded-[32px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {course.level && (
                <Badge className="rounded-full text-xs bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                  {course.level}
                </Badge>
              )}
              <Badge className="rounded-full text-xs gap-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <BookOpen className="h-3 w-3" /> {total} lessons
              </Badge>
              <Badge className="rounded-full text-xs gap-1 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                <CheckCircle2 className="h-3 w-3" /> {doneCount} done
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
                  {course.description}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {continueHref && (
                <Button size="lg" variant="secondary" className="rounded-2xl">
                  <Link href={continueHref} className="flex items-center gap-2">
                    Продолжить <span className="font-normal opacity-80">{continueText}</span>
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="lg" className="rounded-2xl">
                <Link href={`/certificate/${course.slug}`} className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" /> Сертификат
                </Link>
              </Button>
            </div>
          </div>

          {/* Progress widget */}
          <Card className="w-full md:w-[320px] rounded-3xl border border-zinc-100 dark:border-zinc-800 shrink-0 p-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-600 dark:text-zinc-400">Прогресс</span>
              <span className="font-semibold text-zinc-950 dark:text-zinc-50">{percent}%</span>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Lessons", value: total },
                { label: "Done", value: doneCount },
                { label: "Score", value: avgScore !== null ? `${avgScore}%` : "—" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3">
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">{item.label}</div>
                  <div className="mt-1 font-semibold text-zinc-950 dark:text-zinc-50">{item.value}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>

      {/* Lessons */}
      <section className="space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">Lessons</h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Выбирай уроки по порядку или используй поиск.
            </p>
          </div>
          <Button variant="ghost" size="sm" className="rounded-xl">
            <Link href="/search">Поиск →</Link>
          </Button>
        </div>

        <div className="space-y-10">
          {modules.map((m) => {
            if (!m.lessons.length) return null;
            const moduleDone = m.lessons.filter(
              (l) => progressMap.get(l.id)?.status === "done"
            ).length;
            const modulePercent = Math.round((moduleDone / m.lessons.length) * 100);

            return (
              <div key={m.title} className="space-y-4">
                {/* Module header */}
                <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                  <div>
                    <h3 className="text-sm font-semibold text-zinc-950 dark:text-zinc-50">{m.title}</h3>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {moduleDone} / {m.lessons.length} lessons • {modulePercent}%
                    </div>
                  </div>
                  <div className="h-1.5 w-28 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-zinc-900 dark:bg-zinc-50 transition-all duration-500"
                      style={{ width: `${modulePercent}%` }}
                    />
                  </div>
                </div>

                {/* Lesson cards */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {m.lessons.map((lesson) => {
                    const p = progressMap.get(lesson.id);
                    const status = p?.status ?? "not_started";
                    const score = typeof p?.score === "number" ? p.score : null;
                    const meta = statusMeta(status);

                    return (
                      <Link
                        id={`lesson-${lesson.slug}`}
                        key={lesson.id}
                        href={`/lessons/${course.slug}/${lesson.slug}`}
                        className="group"
                      >
                        <Card className="h-full rounded-3xl border border-zinc-100 dark:border-zinc-800 transition-all duration-200 hover:shadow-lg hover:border-zinc-200 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 p-5">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div className="text-base font-semibold text-zinc-950 dark:text-zinc-50 group-hover:text-zinc-800 dark:group-hover:text-zinc-200">
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 block font-normal">
                                Lesson {lesson.order_index}
                              </span>
                              {lesson.title}
                            </div>
                            <Badge className="rounded-full text-xs gap-1.5 shrink-0 bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                              {meta.label}
                            </Badge>
                          </div>

                          {score !== null && (
                            <div className="text-xs text-zinc-600 dark:text-zinc-400 mb-3">
                              Score: <span className="font-semibold text-zinc-950 dark:text-zinc-50">{score}%</span>
                            </div>
                          )}

                          {lesson.tags?.length ? (
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {lesson.tags.slice(0, 4).map((t) => (
                                <span key={t} className="text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2.5 py-1">
                                  {t}
                                </span>
                              ))}
                              {lesson.tags.length > 4 && (
                                <span className="text-xs rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2.5 py-1">
                                  +{lesson.tags.length - 4}
                                </span>
                              )}
                            </div>
                          ) : null}

                          <div className="text-sm text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-zinc-50 transition">
                            Open →
                          </div>
                        </Card>
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
