"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Keyboard,
  Sparkles,
  Copy,
  Eye,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/components/ui/cn";

function normalize(s: string) {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

export function ExerciseInput({
  prompt,
  answer,
  accept,
  onResult,
}: {
  prompt: string;
  answer: string;
  accept?: string[]; // альтернативные ответы
  onResult?: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [shake, setShake] = useState(false);
  const [reveal, setReveal] = useState(false);

  const correct = useMemo(() => {
    const v = normalize(value);
    const main = normalize(answer);
    const alternatives = (accept ?? []).map(normalize);
    return v === main || alternatives.includes(v);
  }, [value, answer, accept]);

  function onCheck() {
    if (checked) return;
    if (!value.trim()) return;

    setChecked(true);
    onResult?.(correct);

    if (!correct) {
      setShake(true);
      setTimeout(() => setShake(false), 420);
      setReveal(true);
    }
  }

  async function copyAnswer() {
    try {
      await navigator.clipboard.writeText(answer);
    } catch {
      // ignore
    }
  }

  const statusBadge = checked ? (
    correct ? (
      <Badge variant="success" className="flex items-center gap-1">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Correct
      </Badge>
    ) : (
      <Badge className="border-red-200 bg-red-50 text-red-700 flex items-center gap-1">
        <XCircle className="h-3.5 w-3.5" />
        Wrong
      </Badge>
    )
  ) : (
    <Badge variant="muted">Type & check</Badge>
  );

  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
      transition={{ duration: 0.42 }}
    >
      <Card className="noise overflow-hidden p-0 border-black/15 bg-white/90">
        <div className="p-5">
          {/* Top line */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="muted">Exercise</Badge>
              <Badge variant="muted" className="flex items-center gap-1">
                <Keyboard className="h-3.5 w-3.5" />
                Input
              </Badge>
            </div>
            {statusBadge}
          </div>

          {/* Prompt */}
          <div className="mt-3 text-lg font-semibold tracking-tight text-black">
            {prompt}
          </div>

          {/* Input */}
          <div className="mt-4">
            <div
              className={cn(
                "rounded-2xl border bg-white/70 backdrop-blur",
                "shadow-[0_12px_26px_rgba(0,0,0,0.06)]",
                checked && correct && "border-emerald-200 bg-emerald-50",
                checked && !correct && "border-red-200 bg-red-50",
                !checked && "border-black/10"
              )}
            >
              <div className="flex items-center gap-2 px-4 py-3">
                <Sparkles className="h-4 w-4 text-black/50" />
                <input
                  value={value}
                  onChange={(e) => !checked && setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onCheck();
                  }}
                  disabled={checked}
                  className={cn(
                    "w-full bg-transparent text-base outline-none placeholder:text-black/45",
                    "disabled:cursor-not-allowed"
                  )}
                  placeholder="Type your answer…"
                  aria-label="Answer input"
                />

                <Badge variant="muted" className="hidden sm:inline-flex">
                  Enter
                </Badge>
              </div>
            </div>

            {!checked ? (
              <div className="mt-2 text-sm text-black/60">
                Подсказка: без лишних пробелов — мы нормализуем ввод.
              </div>
            ) : null}
          </div>

          {/* Actions + Result */}
          <div className="mt-4 flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={onCheck}
                disabled={!value.trim() || checked}
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

              {checked && !correct ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setReveal((r) => !r)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  {reveal ? "Скрыть" : "Показать"}
                </Button>
              ) : null}
            </div>

            <div className="text-sm text-black/60">
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
              ) : value.trim() ? (
                "Можно проверять"
              ) : (
                "Введи ответ"
              )}
            </div>
          </div>

          {/* Reveal correct answer */}
          {checked && !correct ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl border border-black/10 bg-white/60 p-4 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-black">
                    Правильный ответ
                  </div>

                  {reveal ? (
                    <>
                      <div className="mt-1 text-sm text-black/70">
                        <span className="font-semibold text-black">{answer}</span>
                      </div>

                      {Array.isArray(accept) && accept.length ? (
                        <div className="mt-2 text-sm text-black/60">
                          Также принимается:{" "}
                          <span className="text-black/70">
                            {accept.join(", ")}
                          </span>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="mt-1 text-sm text-black/60">
                      Нажми “Показать”, чтобы увидеть ответ.
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={copyAnswer}
                  className="gap-2 shrink-0"
                  title="Скопировать"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </motion.div>
          ) : null}
        </div>
      </Card>
    </motion.div>
  );
}