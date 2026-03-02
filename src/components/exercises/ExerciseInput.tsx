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
      <Badge className="flex items-center gap-1 border-red-500/40 bg-red-500/10 text-red-300">
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
      <Card className="noise overflow-hidden rounded-2xl border border-app bg-card p-0 backdrop-blur-sm">
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
          <div className="mt-3 text-lg font-semibold tracking-tight text-primary">
            {prompt}
          </div>

          {/* Input */}
          <div className="mt-4">
            <div
              className={cn(
                "rounded-2xl border border-app bg-soft backdrop-blur",
                checked && correct && "border-emerald-500/50 bg-emerald-500/10",
                checked && !correct && "border-red-500/50 bg-red-500/10"
              )}
            >
              <div className="flex items-center gap-2 px-4 py-3">
                <Sparkles className="h-4 w-4 text-secondary" />
                <input
                  value={value}
                  onChange={(e) => !checked && setValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onCheck();
                  }}
                  disabled={checked}
                  className={cn(
                    "w-full bg-transparent text-base text-primary outline-none placeholder:text-secondary",
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
              <div className="mt-2 text-sm text-secondary">
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

            <div className="text-sm text-secondary">
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
              className="mt-4 rounded-2xl border border-app bg-soft p-4 backdrop-blur"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-primary">
                    Правильный ответ
                  </div>

                  {reveal ? (
                    <>
                      <div className="mt-1 text-sm text-secondary">
                        <span className="font-semibold text-primary">{answer}</span>
                      </div>

                      {Array.isArray(accept) && accept.length ? (
                        <div className="mt-2 text-sm text-secondary">
                          Также принимается:{" "}
                          <span className="text-secondary">
                            {accept.join(", ")}
                          </span>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="mt-1 text-sm text-secondary">
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