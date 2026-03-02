// lessons/[courseSlug]/[lessonSlug]/LessonQuiz.tsx
"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { ExerciseMCQ } from "@/components/exercises/ExerciseMCQ";
import { ExerciseInput } from "@/components/exercises/ExerciseInput";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

import {
  CheckCircle2,
  Sparkles,
  Lock,
  ArrowRight,
  Loader2,
  Trophy,
} from "lucide-react";

type MCQBlock = {
  type: "exercise_mcq";
  question: string;
  options: string[];
  answerIndex: number;
};

type InputBlock = {
  type: "exercise_input";
  prompt: string;
  answer: string;
  accept?: string[];
};

type Block = MCQBlock | InputBlock | { type: string; [key: string]: any };

export function LessonQuiz({
  lessonId,
  blocks,
  signedIn,
  courseSlug,
  nextHref,
}: {
  lessonId: string;
  blocks: Block[];
  signedIn: boolean;
  /** optional: чтобы после submit уйти на курс */
  courseSlug?: string;
  /** optional: автопереход на следующий урок */
  nextHref?: string | null;
}) {
  const router = useRouter();

  const exerciseBlocks = useMemo(
    () =>
      blocks.filter(
        (b) => typeof b?.type === "string" && b.type.startsWith("exercise_")
      ),
    [blocks]
  );

  const total = exerciseBlocks.length;

  const [results, setResults] = useState<Record<number, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedScore, setSubmittedScore] = useState<number | null>(null);

  const correctCount = Object.values(results).filter(Boolean).length;
  const checkedCount = Object.keys(results).length;
  const allChecked = total > 0 && checkedCount === total;

  const score = total ? Math.round((correctCount / total) * 100) : 0;
  const progressPct = total ? Math.round((checkedCount / total) * 100) : 0;

  const setResult = useCallback((idx: number, ok: boolean) => {
    setResults((r) => ({ ...r, [idx]: ok }));
  }, []);

  const canSubmit = signedIn && allChecked && !submitting;

  async function submit() {
    if (!signedIn) {
      toast.error("Нужно войти, чтобы сохранить прогресс.", {
        icon: <Lock className="h-4 w-4" />,
      });
      return;
    }
    if (!allChecked) {
      toast.message("Проверь все упражнения перед завершением.", {
        icon: <Sparkles className="h-4 w-4" />,
      });
      return;
    }

    setSubmitting(true);

    const t = toast.loading("Сохраняю результат…");

    try {
      const res = await fetch("/api/lesson-submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lesson_id: lessonId, score }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.dismiss(t);
        toast.error(j.error ?? "Ошибка сохранения");
        setSubmitting(false);
        return;
      }

      setSubmittedScore(score);

      toast.dismiss(t);
      toast.success(`Готово! Score: ${score}%`, {
        icon: <Trophy className="h-4 w-4" />,
      });

      // confetti 🎉
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }

      // UX: автопереход (если передали nextHref)
      // иначе просто refresh чтобы подтянуть done banner и score
      setTimeout(() => {
        if (nextHref) {
          router.push(nextHref);
          router.refresh();
        } else if (courseSlug) {
          router.push(`/courses/${courseSlug}`);
          router.refresh();
        } else {
          router.refresh();
        }
      }, 650);
    } catch (e) {
      toast.dismiss(t);
      toast.error("Сеть/сервер недоступен. Попробуй ещё раз.");
      setSubmitting(false);
    }
  }

  if (total === 0) return null;

  return (
    <section className="space-y-4">
      {/* Header */}
      <Card className="noise overflow-hidden rounded-2xl border border-app bg-card p-0 shadow-sm backdrop-blur-sm">
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="muted" className="rounded-full px-3 py-1 text-xs">Lesson quiz</Badge>
                <Badge variant="muted" className="rounded-full px-3 py-1 text-xs">
                  {checkedCount}/{total} checked
                </Badge>
                <Badge variant={allChecked ? "success" : "muted"} className="rounded-full px-3 py-1 text-xs">
                  Correct: {correctCount}/{total}
                </Badge>
                {submittedScore !== null ? (
                  <Badge variant="success" className="rounded-full px-3 py-1 text-xs">Saved: {submittedScore}%</Badge>
                ) : (
                  <Badge variant="muted" className="rounded-full px-3 py-1 text-xs">Score: {score}%</Badge>
                )}
              </div>

              <p className="mt-3 text-sm text-secondary">
                Отмечай ответы — прогресс появится сразу. Когда все проверены,
                можно завершать урок.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={submit}
                disabled={!canSubmit}
                className="gap-2 rounded-xl"
                title={!signedIn ? "Войди, чтобы сохранить результат" : ""}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Сохраняю…
                  </>
                ) : (
                  <>
                    Завершить урок
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-6">
            <div className="h-2 w-full overflow-hidden rounded-full bg-soft">
              <motion.div
                className="h-full rounded-full bg-[rgba(255,255,255,0.14)]"
                initial={{ width: 0 }}
                animate={{ width: `${progressPct}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 18 }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-secondary">
              <span>Progress</span>
              <span className="font-medium text-primary">{progressPct}%</span>
            </div>
          </div>

          {/* Hints */}
          <AnimatePresence>
            {!signedIn ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-5 rounded-2xl border border-app bg-soft p-4 backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <Lock className="mt-0.5 h-4 w-4 text-secondary" />
                  <div>
                    <div className="text-sm font-semibold text-primary">
                      Гость-режим
                    </div>
                    <div className="mt-1 text-xs text-secondary">
                      Войди, чтобы сохранять score и отмечать урок как Done.
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : !allChecked ? (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-5 rounded-2xl border border-app bg-soft p-4 backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 text-amber-500" />
                  <div>
                    <div className="text-sm font-semibold text-black dark:text-white">
                      Проверь все упражнения
                    </div>
                    <div className="mt-1 text-xs text-secondary">
                      Сейчас проверено {checkedCount} из {total}. Когда будет{" "}
                      {total}/{total} — кнопка станет активной.
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 6 }}
                className="mt-5 rounded-2xl border border-app bg-soft p-4 backdrop-blur"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <div>
                    <div className="text-sm font-semibold text-primary">
                      Всё готово
                    </div>
                    <div className="mt-1 text-xs text-secondary">
                      Нажми “Завершить урок”, чтобы сохранить результат и получить
                      Done.
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Exercises */}
      <div className="space-y-4">
        {exerciseBlocks.map((b, idx) => {
          if (b.type === "exercise_mcq") {
            const ex = b as MCQBlock;
            return (
              <motion.div
                key={`mcq-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.25) }}
              >
                <ExerciseMCQ
                  question={ex.question}
                  options={ex.options}
                  answerIndex={ex.answerIndex}
                  onResult={(ok: boolean) => setResult(idx, ok)}
                />
              </motion.div>
            );
          }

          if (b.type === "exercise_input") {
            const ex = b as InputBlock;
            return (
              <motion.div
                key={`input-${idx}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.25) }}
              >
                <ExerciseInput
                  prompt={ex.prompt}
                  answer={ex.answer}
                  accept={ex.accept}
                  onResult={(ok: boolean) => setResult(idx, ok)}
                />
              </motion.div>
            );
          }

          return null;
        })}
      </div>

      {/* Sticky action bar on mobile */}
      <div className="pointer-events-none sticky bottom-4 z-20">
        <div className="pointer-events-auto mx-auto max-w-3xl">
          <div
            className={cn(
              "noise flex items-center justify-between gap-3 rounded-2xl border border-app bg-card p-3 shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur-lg",
              "md:hidden"
            )}
          >
            <div className="min-w-0 pl-1">
              <div className="text-xs text-secondary">Score</div>
              <div className="text-sm font-semibold text-primary">
                {correctCount}/{total} • {score}%
              </div>
            </div>

            <Button
              type="button"
              onClick={submit}
              disabled={!canSubmit}
              className="shrink-0 gap-2 rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  …
                </>
              ) : (
                <>
                  Done
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}