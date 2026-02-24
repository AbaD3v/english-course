"use client";

import { useState } from "react";

export function ProgressActions({
  lessonId,
  initialStatus,
}: {
  lessonId: string;
  initialStatus: "not_started" | "in_progress" | "done";
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  async function setProgress(next: typeof status) {
    setLoading(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lesson_id: lessonId, status: next }),
    });
    setLoading(false);

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      alert(j.error ?? "Ошибка");
      return;
    }
    setStatus(next);
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {status !== "done" ? (
        <button
          onClick={() => setProgress("done")}
          disabled={loading}
          className="rounded-xl bg-black text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Сохраняю..." : "Отметить пройдено"}
        </button>
      ) : (
        <button
          onClick={() => setProgress("in_progress")}
          disabled={loading}
          className="rounded-xl border px-4 py-2 font-medium hover:bg-muted disabled:opacity-50"
        >
          {loading ? "..." : "Снять отметку"}
        </button>
      )}

      <span className="text-sm text-muted-foreground">
        Статус:{" "}
        <span className="font-medium">
          {status === "done"
            ? "Done ✅"
            : status === "in_progress"
            ? "In progress 🟡"
            : "Not started ⚪"}
        </span>
      </span>
    </div>
  );
}