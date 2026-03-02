"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

import { LessonQuiz } from "./LessonQuiz";
import { ExerciseMCQ } from "@/components/exercises/ExerciseMCQ";
import { ExerciseInput } from "@/components/exercises/ExerciseInput";
import { LessonVideo } from "@/components/lesson/LessonVideo";

import {
  BookOpen,
  ListChecks,
  Trophy,
  ChevronRight,
  Search,
  Lock,
  CheckCircle2,
  BookMarked,
  CircleCheckBig,
  Zap,
} from "lucide-react";

type LessonNavItem = {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  tags: string[] | null;
};

type Block = { type: string; [key: string]: any };
type ModuleGroup = { title: string; lessons: LessonNavItem[] };

interface LessonShellProps {
  userSignedIn: boolean;
  course: { id: string; slug: string; title: string };
  lesson: {
    id: string;
    slug: string;
    title: string;
    order_index: number;
    description?: string | null;
  };
  navLessons: LessonNavItem[];
  progressByLessonId: Record<string, { status: string; score: number | null }>;
  blocks: Block[];
}

function useResizableSidebar(key = "ec_sidebar_w") {
  const [width, setWidth] = useState<number>(320);

  useEffect(() => {
    const saved = Number(localStorage.getItem(key));
    if (!Number.isNaN(saved) && saved >= 240 && saved <= 520) setWidth(saved);
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, String(width));
  }, [key, width]);

  function startDrag() {
    const onMove = (e: MouseEvent) => {
      const next = Math.min(520, Math.max(260, e.clientX - 24));
      setWidth(next);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return { width, startDrag };
}

export default function LessonShell({
  userSignedIn,
  course,
  lesson,
  navLessons,
  progressByLessonId,
  blocks,
}: LessonShellProps) {
  const router = useRouter();
  const { width, startDrag } = useResizableSidebar();

  type Step = "theory" | "practice" | "quiz";
  const [step, setStep] = useState<Step>("theory");
  const [theoryDone, setTheoryDone] = useState(false);
  const [practiceDone, setPracticeDone] = useState(false);
  const canOpenQuiz = theoryDone && practiceDone;

  const [cmdOpen, setCmdOpen] = useState(false);
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") setCmdOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const theoryBlocks = useMemo(
    () =>
      blocks.filter((b) =>
        ["heading", "paragraph", "vocab", "video"].includes(b.type)
      ),
    [blocks]
  );

  const practiceBlocks = useMemo(
    () =>
      blocks.filter(
        (b) => b.type === "exercise_mcq" || b.type === "exercise_input"
      ),
    [blocks]
  );

  const currentIndex = navLessons.findIndex((l) => l.slug === lesson.slug);
  const prevLesson = currentIndex > 0 ? navLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < navLessons.length - 1
      ? navLessons[currentIndex + 1]
      : null;

  const modules: ModuleGroup[] = useMemo(
    () => groupLessonsIntoModules(navLessons),
    [navLessons]
  );

  const sidebar = (
    <Card className="h-full border border-zinc-200/70 bg-white/90 p-3 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:ring-zinc-800/60">
      <div className="flex items-start justify-between gap-2 p-2">
        <div className="min-w-0">
          <div className="text-xs font-medium uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
            Course
          </div>
          <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {course.title}
          </div>
        </div>

        <Link href={`/courses/${course.slug}`} aria-label="Back to course">
          <Button variant="ghost" size="sm" className="px-2">
            <BookMarked className="size-4" />
          </Button>
        </Link>
      </div>

      <div className="mt-4 flex grow flex-col gap-4 overflow-y-auto pr-1">
        {modules.map((m) => (
          <div key={m.title}>
            <div className="mb-2 flex items-center justify-between px-2">
              <div className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">
                {m.title}
              </div>
            </div>

            <div className="space-y-1">
              {m.lessons.map((l) => {
                const p = progressByLessonId[l.id];
                const active = l.slug === lesson.slug;
                const status = p?.status ?? "not_started";

                return (
                  <Link
                    key={l.id}
                    href={`/lessons/${course.slug}/${l.slug}`}
                    className="block"
                  >
                    <div
                      className={cn(
                        "group flex items-center gap-3 rounded-xl px-3 py-2 transition-all",
                        "hover:bg-zinc-100 dark:hover:bg-zinc-800/80",
                        active && "bg-zinc-100 shadow-inner dark:bg-zinc-800"
                      )}
                    >
                      {status === "done" ? (
                        <CircleCheckBig className="size-4 text-emerald-500" />
                      ) : (
                        <div className="size-4 rounded-full border-2 border-zinc-300 group-hover:border-zinc-400 dark:border-zinc-600 dark:group-hover:border-zinc-500" />
                      )}

                      <div className="min-w-0 flex-1">
                        <div
                          className={cn(
                            "truncate text-sm font-medium",
                            active ? "text-zinc-950 dark:text-white" : "text-zinc-700 dark:text-zinc-300"
                          )}
                        >
                          {l.order_index}. {l.title}
                        </div>
                      </div>

                      <ChevronRight className="size-4 text-zinc-400 dark:text-zinc-500" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <>
      {cmdOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 backdrop-blur-sm p-4"
          onMouseDown={() => setCmdOpen(false)}
        >
          <div
            className="w-full max-w-xl"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Card className="overflow-hidden bg-white/95 p-0 shadow-2xl ring-1 ring-zinc-200/60 backdrop-blur-xl dark:bg-zinc-950/95 dark:ring-zinc-800/70">
              <Command className="w-full">
                <div className="flex items-center gap-2 border-b border-zinc-200/70 px-4 py-3 dark:border-zinc-800/80">
                  <Search className="size-5 text-zinc-400 dark:text-zinc-500" />
                  <Command.Input
                    autoFocus
                    placeholder="Поиск по урокам..."
                    className="w-full bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  />
                  <Badge variant="muted">ESC</Badge>
                </div>

                <Command.List className="max-h-[420px] overflow-auto p-2">
                  <Command.Empty className="p-4 text-sm text-zinc-500 dark:text-zinc-400">
                    Ничего не найдено.
                  </Command.Empty>

                  {modules.map((m) => (
                    <Command.Group
                      key={m.title}
                      heading={m.title}
                      className="px-2 py-2"
                    >
                      {m.lessons.map((l) => (
                        <Command.Item
                          key={l.id}
                          value={`${l.order_index} ${l.title}`}
                          onSelect={() => {
                            setCmdOpen(false);
                            router.push(`/lessons/${course.slug}/${l.slug}`);
                          }}
                          className={cn(
                            "flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm",
                            "aria-selected:bg-zinc-100 dark:aria-selected:bg-zinc-800"
                          )}
                        >
                          <span className="truncate">
                            {l.order_index}. {l.title}
                          </span>
                          {l.slug === lesson.slug ? (
                            <Badge variant="muted">текущий</Badge>
                          ) : null}
                        </Command.Item>
                      ))}
                    </Command.Group>
                  ))}
                </Command.List>
              </Command>
            </Card>
          </div>
        </div>
      ) : null}

      <div className="grid h-[calc(100vh-64px)] gap-4 lg:grid-cols-[auto_12px_1fr] overflow-hidden">
        <aside className="hidden h-full lg:block p-4 pr-0" style={{ width }}>
          {sidebar}
        </aside>

        <div
          className="relative hidden lg:block cursor-col-resize group"
          onMouseDown={startDrag}
          aria-hidden
        >
          <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 transition-colors group-hover:bg-zinc-300" />
        </div>

        <main className="h-full overflow-y-auto p-4 md:p-6 space-y-6">
          <div className="lg:hidden">{sidebar}</div>

          <Card className="rounded-3xl border border-zinc-200/70 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:ring-zinc-800/60">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm text-zinc-500 dark:text-zinc-400">
                  Lesson {lesson.order_index}/{navLessons.length}
                </div>
                <h1 className="truncate text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                  {lesson.title}
                </h1>
                {lesson.description ? (
                  <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-300">
                    {lesson.description}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StepChip
                  active={step === "theory"}
                  title="Теория"
                  icon={<BookOpen className="size-4" />}
                  done={theoryDone}
                  onClick={() => setStep("theory")}
                />
                <StepChip
                  active={step === "practice"}
                  title="Практика"
                  icon={<ListChecks className="size-4" />}
                  done={practiceDone}
                  onClick={() => setStep("practice")}
                />
                <StepChip
                  active={step === "quiz"}
                  title="Quiz"
                  icon={<Trophy className="size-4" />}
                  locked={!canOpenQuiz}
                  onClick={() => canOpenQuiz && setStep("quiz")}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                {step === "theory" &&
                  "Прочитай материал (и посмотри видео, если есть). Потом отметь шаг выполненным."}
                {step === "practice" &&
                  "Сделай упражнения. Потом откроется Quiz."}
                {step === "quiz" && "Закрой квиз и сохрани score."}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {step === "theory" ? (
                  <Button
                    onClick={() => {
                      setTheoryDone(true);
                      setStep("practice");
                    }}
                    className="gap-2 rounded-xl"
                  >
                    <CheckCircle2 className="size-4" />
                    Теория пройдена
                  </Button>
                ) : step === "practice" ? (
                  <Button
                    onClick={() => {
                      setPracticeDone(true);
                      setStep("quiz");
                    }}
                    disabled={!theoryDone}
                    className="gap-2 rounded-xl"
                  >
                    <CheckCircle2 className="size-4" />
                    Практика пройдена
                  </Button>
                ) : null}

                {prevLesson ? (
                  <Link href={`/lessons/${course.slug}/${prevLesson.slug}`}>
                    <Button variant="secondary" className="rounded-xl">
                      ← Назад
                    </Button>
                  </Link>
                ) : null}

                {nextLesson ? (
                  <Link href={`/lessons/${course.slug}/${nextLesson.slug}`}>
                    <Button variant="secondary" className="rounded-xl">
                      Вперед →
                    </Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </Card>

          {/* THEORY */}
          {step === "theory" ? (
            <Card className="rounded-3xl border border-zinc-200/70 bg-white/90 p-8 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:ring-zinc-800/60">
              <div className="space-y-8">
                {theoryBlocks.map((b, i) => (
                  <BlockRenderer key={i} block={b} />
                ))}
              </div>
            </Card>
          ) : null}

          {/* PRACTICE */}
          {step === "practice" ? (
            <Card className="rounded-3xl border border-zinc-200/70 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:ring-zinc-800/60">
              <div className="space-y-4">
                {practiceBlocks.length ? (
                  <>
                    <div className="text-sm text-zinc-700">
                      Сделай упражнения и нажми <b>Практика пройдена</b>, чтобы
                      открыть Quiz.
                    </div>

                    <div className="space-y-4">
                      {practiceBlocks.map((b, idx) => {
                        if (b.type === "exercise_mcq") {
                          return (
                            <ExerciseMCQ
                              key={idx}
                              question={b.question}
                              options={b.options}
                              answerIndex={b.answerIndex}
                            />
                          );
                        }

                        if (b.type === "exercise_input") {
                          return (
                            <ExerciseInput
                              key={idx}
                              prompt={b.prompt}
                              answer={b.answer}
                              accept={b.accept}
                            />
                          );
                        }

                        return null;
                      })}
                    </div>
                  </>
                ) : (
                  <div className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-300">
                    В этом уроке нет практики.
                  </div>
                )}
              </div>
            </Card>
          ) : null}

          {/* QUIZ */}
          {step === "quiz" ? (
            <>
              {!canOpenQuiz ? (
                <Card className="rounded-3xl border border-zinc-200/70 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:ring-zinc-800/60">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-5 w-5 text-zinc-500 dark:text-zinc-400" />
                    <div>
                      <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                        Quiz закрыт
                      </div>
                      <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                        Сначала отметь Theory и Practice как выполненные.
                      </div>
                    </div>
                  </div>
                </Card>
              ) : (
                <LessonQuiz
                  lessonId={lesson.id}
                  blocks={blocks}
                  signedIn={userSignedIn}
                  courseSlug={course.slug}
                  nextHref={
                    nextLesson
                      ? `/lessons/${course.slug}/${nextLesson.slug}`
                      : null
                  }
                />
              )}
            </>
          ) : null}
        </main>
      </div>
    </>
  );
}

function StepChip({
  active,
  title,
  icon,
  done,
  locked,
  onClick,
}: {
  active: boolean;
  title: string;
  icon: React.ReactNode;
  done?: boolean;
  locked?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={locked}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all",
        "bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
        active && "bg-zinc-900 text-white shadow-md dark:bg-white dark:text-zinc-900",
        locked && "cursor-not-allowed opacity-50 hover:bg-zinc-100 dark:hover:bg-zinc-800"
      )}
    >
      {icon}
      {title}
      {done ? <CircleCheckBig className="size-4 text-emerald-500" /> : null}
      {locked ? <Lock className="size-4 text-zinc-400 dark:text-zinc-500" /> : null}
    </button>
  );
}

function BlockRenderer({ block }: { block: any }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-900 first:mt-0 dark:text-zinc-100">
          {block.text}
        </h2>
      );
    case "paragraph":
      return (
        <p className="whitespace-pre-line text-base leading-7 text-zinc-700 dark:text-zinc-300">
          {block.text}
        </p>
      );
    case "video":
      return <LessonVideo url={block.url} title={block.title} />;
    case "vocab":
      return (
        <div className="rounded-3xl border border-zinc-200/70 bg-white/90 p-6 shadow-sm ring-1 ring-zinc-200/50 backdrop-blur-xl dark:border-zinc-800/80 dark:bg-zinc-950/70 dark:ring-zinc-800/60">
          <div className="flex items-center gap-3 text-zinc-900 dark:text-zinc-100">
            <Zap className="size-5 text-amber-500" />
            <h3 className="text-lg font-semibold">Словарик</h3>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {block.items?.map((it: any, i: number) => (
              <div
                key={i}
                className="rounded-2xl border border-zinc-200/70 bg-white/95 p-5 shadow-sm dark:border-zinc-800/70 dark:bg-zinc-900/90"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">{it.word}</span>
                  <Badge variant="muted">{it.translation}</Badge>
                </div>
                {it.example ? (
                  <p className="mt-3 text-sm italic text-zinc-600 dark:text-zinc-300">
                    “{it.example}”
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return null;
  }
}

function groupLessonsIntoModules(lessons: LessonNavItem[]): ModuleGroup[] {
  const chunkSize = 5;
  const result: ModuleGroup[] = [];
  for (let i = 0; i < lessons.length; i += chunkSize) {
    result.push({
      title: `Модуль ${Math.floor(i / chunkSize) + 1}`,
      lessons: lessons.slice(i, i + chunkSize),
    });
  }
  return result;
}
