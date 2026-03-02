"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, HelpCircle } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

export function ExerciseMCQ({
  question,
  options,
  answerIndex,
  onResult,
}: {
  question: string;
  options: string[];
  answerIndex: number;
  onResult?: (correct: boolean) => void;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [shake, setShake] = useState(false);

  const correct = useMemo(() => {
    if (selected === null) return false;
    return selected === answerIndex;
  }, [selected, answerIndex]);

  const letters = ["A", "B", "C", "D", "E", "F"];

  function onCheck() {
    if (selected === null || checked) return;
    setChecked(true);
    onResult?.(correct);

    if (!correct) {
      setShake(true);
      setTimeout(() => setShake(false), 420);
    }
  }

  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.42 }}
    >
      <Card className="noise overflow-hidden rounded-2xl border border-app bg-card p-0 backdrop-blur-sm">
        <div className="p-5">
          {/* Top line */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="muted">Exercise</Badge>
              <Badge variant="muted" className="flex items-center gap-1">
                <HelpCircle className="h-3.5 w-3.5" />
                MCQ
              </Badge>
            </div>

            {checked ? (
              correct ? (
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Correct
                </Badge>
              ) : (
                <Badge className="flex items-center gap-1 border-red-500/40 bg-red-500/10 text-red-300">
                  <XCircle className="h-3.5 w-3.5" />
                  Wrong
                </Badge>
              )
            ) : (
              <Badge variant="muted">
                {selected === null ? "Pick one" : "Ready to check"}
              </Badge>
            )}
          </div>

          {/* Question */}
          <div className="mt-3 text-lg font-semibold tracking-tight text-primary">
            {question}
          </div>

          {/* Options */}
          <div className="mt-4 grid gap-2">
            {options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = checked && idx === answerIndex;
              const isWrongSelected = checked && isSelected && idx !== answerIndex;

              const base =
                "group w-full text-left rounded-2xl border border-app bg-soft px-4 py-3 transition-colors duration-200";

              const hover = !checked ? "hover:bg-[rgba(255,255,255,0.04)] active:bg-[rgba(255,255,255,0.08)]" : "";
              const ring = isSelected && !checked ? "ring-2 ring-white/20" : "";
              const correctStyle = isCorrect ? "border-emerald-500/50 bg-emerald-500/10" : "";
              const wrongStyle = isWrongSelected ? "border-red-500/50 bg-red-500/10" : "";
              const disabled = checked ? "cursor-default" : "cursor-pointer";

              return (
                <motion.button
                  key={idx}
                  type="button"
                  onClick={() => !checked && setSelected(idx)}
                  whileTap={!checked ? { scale: 0.99 } : undefined}
                  className={cn(base, hover, ring, correctStyle, wrongStyle, disabled)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                        isCorrect
                          ? "border-emerald-200 bg-emerald-100 text-emerald-700"
                          : isWrongSelected
                          ? "border-red-200 bg-red-100 text-red-700"
                          : "border-app bg-soft text-secondary"
                      )}
                    >
                      {letters[idx] ?? idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="text-base font-medium text-primary">
                        {opt}
                      </div>

                      {/* subtle hint line */}
                      {!checked && isSelected ? (
                        <div className="mt-1 text-sm text-secondary">
                          Нажми “Проверить”, чтобы зафиксировать ответ.
                        </div>
                      ) : null}

                      {checked && isCorrect ? (
                        <div className="mt-1 text-xs text-emerald-700/80">
                          Верный вариант.
                        </div>
                      ) : null}

                      {checked && isWrongSelected ? (
                        <div className="mt-1 text-xs text-red-700/80">
                          Неверно — правильный подсвечен зелёным.
                        </div>
                      ) : null}
                    </div>

                    {/* Right icon */}
                    <div className="ml-auto mt-0.5">
                      {checked && isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                      ) : checked && isWrongSelected ? (
                        <XCircle className="h-4 w-4 text-red-700" />
                      ) : (
                        <span className="inline-block h-4 w-4 rounded-full border border-app bg-soft opacity-0 transition group-hover:opacity-100" />
                      )}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              onClick={onCheck}
              disabled={selected === null || checked}
              className="gap-2"
            >
              {checked ? (
                correct ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Готово
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4" />
                    Проверено
                  </>
                )
              ) : (
                <>
                  Проверить
                  <span className="text-white/70">↵</span>
                </>
              )}
            </Button>

            <div className="text-xs text-secondary">
              {checked ? (
                correct ? (
                  <span className="font-medium text-emerald-700">
                    Правильно ✅
                  </span>
                ) : (
                  <span className="font-medium text-red-700">
                    Неправильно ❌
                  </span>
                )
              ) : selected === null ? (
                "Выбери вариант"
              ) : (
                "Можно проверять"
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}