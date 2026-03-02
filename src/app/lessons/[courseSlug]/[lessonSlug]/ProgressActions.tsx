"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, CircleDashed, PlayCircle } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Status = "not_started" | "in_progress" | "done";

const COMPLETED_KEY = "ec-completed-lessons";

function readCompletedLessons(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

function updateCompletedLessons(lessonId: string, done: boolean) {
  const current = new Set(readCompletedLessons());
  if (done) current.add(lessonId);
  else current.delete(lessonId);
  localStorage.setItem(COMPLETED_KEY, JSON.stringify(Array.from(current)));
}

export function ProgressActions({
  lessonId,
  initialStatus,
}: {
  lessonId: string;
  initialStatus: Status;
}) {
  const [status, setStatus] = useState<Status>(initialStatus);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "done") updateCompletedLessons(lessonId, true);
  }, [lessonId, status]);

  async function setProgress(next: Status) {
    if (loading) return;
    
    setLoading(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lessonId, status: next }),
    });
    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      toast.error(j.error ?? "Ошибка при обновлении прогресса");
      return;
    }
    
    setStatus(next);
    updateCompletedLessons(lessonId, next === "done");
    if (next === "done") {
        toast.success("Урок отмечен как пройденный!");
    } else {
        toast.info("Статус обновлен");
    }
  }

  const statusConfig = {
    not_started: { text: "Не начат", icon: CircleDashed, color: "text-zinc-500" },
    in_progress: { text: "В процессе", icon: PlayCircle, color: "text-amber-600" },
    done: { text: "Пройден", icon: CheckCircle2, color: "text-emerald-600" },
  };

  const CurrentStatusIcon = statusConfig[status].icon;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
      <div className="flex items-center gap-3 flex-grow">
        <div className={cn("flex items-center gap-2 text-sm font-semibold rounded-full px-3 py-1.5", statusConfig[status].color, "bg-zinc-100 dark:bg-zinc-800")}>
            <CurrentStatusIcon className="size-4" />
            {statusConfig[status].text}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {status !== "done" ? (
          <button
            onClick={() => setProgress("done")}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-950 px-4 py-2.5 text-sm font-semibold hover:bg-zinc-800 dark:hover:bg-white active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            {loading ? "Сохраняем..." : "Отметить пройденным"}
          </button>
        ) : (
          <button
            onClick={() => setProgress("in_progress")}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 active:scale-[0.97] transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Снять отметку"}
          </button>
        )}
      </div>

      {/* Анимация при переходе в done */}
      <AnimatePresence>
        {status === "done" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-3 -right-3"
          >
            {/* Можно добавить конфетти или иконку кубка здесь */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}