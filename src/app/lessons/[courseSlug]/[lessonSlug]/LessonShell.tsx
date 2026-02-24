"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";

import { cn } from "@/components/ui/cn";
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
}: {
  userSignedIn: boolean;
  course: { id: string; slug: string; title: string };
  lesson: { id: string; slug: string; title: string; order_index: number };
  navLessons: LessonNavItem[];
  progressByLessonId: Record<string, { status: string; score: number | null }>;
  blocks: Block[];
}) {
  const router = useRouter();
  const { width, startDrag } = useResizableSidebar();

  // --- Stepper ---
  type Step = "theory" | "practice" | "quiz";
  const [step, setStep] = useState<Step>("theory");
  const [theoryDone, setTheoryDone] = useState(false);
  const [practiceDone, setPracticeDone] = useState(false);
  const canOpenQuiz = theoryDone && practiceDone;

  // --- CmdK ---
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

  // --- Blocks split ---
  const theoryBlocks = useMemo(
    () => blocks.filter((b) => ["heading", "paragraph", "vocab", "video"].includes(b.type)),
    [blocks]
  );

  const practiceBlocks = useMemo(
    () => blocks.filter((b) => b.type === "exercise_mcq" || b.type === "exercise_input"),
    [blocks]
  );

  // --- prev/next ---
  const currentIndex = navLessons.findIndex((l) => l.slug === lesson.slug);
  const prevLesson = currentIndex > 0 ? navLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < navLessons.length - 1
      ? navLessons[currentIndex + 1]
      : null;

  // --- Modules grouping ---
  const modules: ModuleGroup[] = useMemo(
    () => groupLessonsIntoModules(navLessons),
    [navLessons]
  );

  const sidebar = (
    <Card className="p-4 noise">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs text-black/50">Course</div>
          <div className="truncate text-sm font-semibold text-black">
            {course.title}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="muted">Ctrl/⌘ K</Badge>
            <Badge variant="muted">Outline</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <Link href={`/courses/${course.slug}`}>
            <Button variant="secondary" size="sm">
              К курсу
            </Button>
          </Link>
          <Button variant="secondary" size="sm" onClick={() => setCmdOpen(true)}>
            Поиск
          </Button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {modules.map((m) => (
          <div key={m.title}>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-xs font-semibold text-black/70">{m.title}</div>
              <Badge variant="muted">{m.lessons.length}</Badge>
            </div>

            <div className="space-y-2">
              {m.lessons.map((l) => {
                const p = progressByLessonId[l.id];
                const active = l.slug === lesson.slug;
                const status = p?.status ?? "not_started";
                const score = p?.score ?? null;

                return (
                  <Link
                    key={l.id}
                    href={`/lessons/${course.slug}/${l.slug}`}
                    className="block"
                  >
                    <div
                      className={cn(
                        "rounded-2xl border border-black/10 bg-white/60 px-3 py-2 backdrop-blur transition",
                        "hover:bg-white/85",
                        active &&
                          "bg-white border-black/20 shadow-[0_12px_26px_rgba(0,0,0,0.08)]"
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-black">
                            {l.order_index}. {l.title}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <Badge variant="muted">{status}</Badge>
                            {score !== null ? (
                              <Badge variant="muted">{score}%</Badge>
                            ) : null}
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 text-black/30",
                            active && "text-black/60"
                          )}
                        />
                      </div>
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
      {/* CMDK */}
      {cmdOpen ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4"
          onMouseDown={() => setCmdOpen(false)}
        >
          <div className="w-full max-w-xl" onMouseDown={(e) => e.stopPropagation()}>
            <Card className="p-0 overflow-hidden">
              <Command className="w-full">
                <div className="flex items-center gap-2 border-b border-black/10 bg-white/70 px-4 py-3">
                  <Search className="h-4 w-4 text-black/50" />
                  <Command.Input
                    autoFocus
                    placeholder="Поиск уроков… (Ctrl/⌘ K)"
                    className="w-full bg-transparent text-sm outline-none placeholder:text-black/40"
                  />
                  <Badge variant="muted">ESC</Badge>
                </div>

                <Command.List className="max-h-[420px] overflow-auto p-2">
                  <Command.Empty className="p-4 text-sm text-black/50">
                    Ничего не найдено.
                  </Command.Empty>

                  {modules.map((m) => (
                    <Command.Group key={m.title} heading={m.title} className="px-2 py-2">
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
                            "aria-selected:bg-black/5"
                          )}
                        >
                          <span className="truncate">
                            {l.order_index}. {l.title}
                          </span>
                          {l.slug === lesson.slug ? (
                            <Badge variant="muted">current</Badge>
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

      {/* LAYOUT */}
      <div className="grid gap-4 lg:grid-cols-[auto_12px_1fr]">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:sticky lg:top-6 h-fit" style={{ width }}>
          {sidebar}
        </aside>

        {/* Resize handle (desktop) */}
        <div className="relative hidden lg:block">
          <div
            onMouseDown={startDrag}
            className="absolute inset-0 cursor-col-resize"
            title="Drag to resize"
          />
          <div className="absolute left-1/2 top-6 h-[calc(100%-24px)] w-1 -translate-x-1/2 rounded-full bg-black/5 hover:bg-black/10" />
        </div>

        {/* Main */}
        <main className="space-y-4">
          {/* Mobile sidebar (top) */}
          <div className="lg:hidden">{sidebar}</div>

          {/* Header + stepper */}
          <Card className="p-4 noise">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs text-black/50">
                  Lesson {lesson.order_index}/{navLessons.length}
                </div>
                <div className="truncate text-lg font-semibold text-black">
                  {lesson.title}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StepChip
                  active={step === "theory"}
                  title="Theory"
                  icon={<BookOpen className="h-4 w-4" />}
                  done={theoryDone}
                  onClick={() => setStep("theory")}
                />
                <StepChip
                  active={step === "practice"}
                  title="Practice"
                  icon={<ListChecks className="h-4 w-4" />}
                  done={practiceDone}
                  onClick={() => setStep("practice")}
                />
                <StepChip
                  active={step === "quiz"}
                  title="Quiz"
                  icon={<Trophy className="h-4 w-4" />}
                  locked={!canOpenQuiz}
                  onClick={() => canOpenQuiz && setStep("quiz")}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm text-black/60">
                {step === "theory" && "Прочитай материал (и посмотри видео, если есть). Потом отметь шаг выполненным."}
                {step === "practice" && "Сделай упражнения. Потом откроется Quiz."}
                {step === "quiz" && "Закрой квиз и сохрани score."}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {step === "theory" ? (
                  <Button
                    onClick={() => {
                      setTheoryDone(true);
                      setStep("practice");
                    }}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Theory done
                  </Button>
                ) : step === "practice" ? (
                  <Button
                    onClick={() => {
                      setPracticeDone(true);
                      setStep("quiz");
                    }}
                    disabled={!theoryDone}
                    className="gap-2"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Practice done
                  </Button>
                ) : null}

                {prevLesson ? (
                  <Link href={`/lessons/${course.slug}/${prevLesson.slug}`}>
                    <Button variant="secondary">← Prev</Button>
                  </Link>
                ) : null}

                {nextLesson ? (
                  <Link href={`/lessons/${course.slug}/${nextLesson.slug}`}>
                    <Button variant="secondary">Next →</Button>
                  </Link>
                ) : null}
              </div>
            </div>
          </Card>

          {/* THEORY */}
          {step === "theory" ? (
            <Card className="p-6 noise">
              <div className="space-y-5">
                {theoryBlocks.map((b, i) => (
                  <BlockRenderer key={i} block={b} />
                ))}
              </div>
            </Card>
          ) : null}

          {/* PRACTICE */}
          {step === "practice" ? (
            <Card className="p-6 noise">
              <div className="space-y-4">
                {practiceBlocks.length ? (
                  <>
                    <div className="text-sm text-black/70">
                      Сделай упражнения и нажми <b>Practice done</b>, чтобы открыть Quiz.
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
                  <div className="text-sm text-black/60">В этом уроке нет практики.</div>
                )}
              </div>
            </Card>
          ) : null}

          {/* QUIZ */}
          {step === "quiz" ? (
            <>
              {!canOpenQuiz ? (
                <Card className="p-6 noise">
                  <div className="flex items-start gap-3">
                    <Lock className="mt-0.5 h-5 w-5 text-black/60" />
                    <div>
                      <div className="text-sm font-semibold text-black">Quiz закрыт</div>
                      <div className="mt-1 text-sm text-black/60">
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
                  nextHref={nextLesson ? `/lessons/${course.slug}/${nextLesson.slug}` : null}
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
        "inline-flex items-center gap-2 rounded-2xl border px-3 py-2 text-sm font-medium transition",
        "bg-white/70 backdrop-blur border-black/10 hover:bg-white/90",
        active && "border-black/20 shadow-[0_12px_26px_rgba(0,0,0,0.08)]",
        locked && "opacity-50 cursor-not-allowed hover:bg-white/70"
      )}
    >
      {icon}
      {title}
      {done ? <span className="ml-1 text-xs text-emerald-700">✓</span> : null}
      {locked ? <span className="ml-1 text-xs text-black/50">🔒</span> : null}
    </button>
  );
}

function BlockRenderer({ block }: { block: any }) {
  switch (block.type) {
    case "heading":
      return (
        <h2 className="text-xl font-semibold tracking-tight text-black">
          {block.text}
        </h2>
      );

    case "paragraph":
      return (
        <p className="text-sm leading-7 text-black/70 whitespace-pre-line">
          {block.text}
        </p>
      );

    case "video":
      return (
        <LessonVideo url={block.url} title={block.title} />
      );

    case "vocab":
      return (
        <div className="rounded-3xl border border-black/10 bg-white/60 p-5 backdrop-blur">
          <div className="text-sm font-semibold text-black">Vocabulary</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {block.items?.map((it: any, i: number) => (
              <div
                key={i}
                className="rounded-2xl border border-black/10 bg-white/70 p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="font-medium text-black">{it.word}</div>
                  <Badge variant="muted">{it.translation}</Badge>
                </div>
                {it.example ? (
                  <div className="mt-2 text-xs text-black/60">“{it.example}”</div>
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
  const hasTags = lessons.some((l) => Array.isArray(l.tags) && l.tags.length > 0);
  if (hasTags) {
    const map = new Map<string, LessonNavItem[]>();
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