"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Result = {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  course_slug: string;
};

export function CommandSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isK = e.key.toLowerCase() === "k";
      const isCmdK = (e.metaKey || e.ctrlKey) && isK;

      if (isCmdK) {
        e.preventDefault();
        setOpen(true);
        return;
      }

      if (!open) return;

      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((v) => Math.min(v + 1, Math.max(results.length - 1, 0)));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((v) => Math.max(v - 1, 0));
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, results.length]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery("");
      setResults([]);
      setActive(0);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    const q = query.trim();
    const t = setTimeout(async () => {
      if (!open) return;
      if (q.length < 2) {
        setResults([]);
        setActive(0);
        return;
      }

      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      const arr = (json.results ?? []) as Result[];
      setResults(arr);
      setActive(0);
      setLoading(false);
    }, 200);

    return () => clearTimeout(t);
  }, [query, open]);

  const hint = useMemo(() => {
    const isMac = typeof navigator !== "undefined" && /Mac/.test(navigator.platform);
    return isMac ? "⌘K" : "Ctrl K";
  }, []);

  if (!open) {
    // маленькая кнопка-хинт (можешь убрать, если не нужно)
    return (
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 rounded-xl border px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition"
        title="Search"
      >
        <span>Поиск…</span>
        <span className="ml-2 text-xs rounded-md border px-2 py-0.5 bg-white/60">
          {hint}
        </span>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
      onMouseDown={() => setOpen(false)}
    >
      <div
        className="mx-auto mt-24 w-[min(720px,92vw)] rounded-2xl border bg-white shadow-xl overflow-hidden"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b">
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ищи уроки… (greetings, present simple, hello)"
            className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />
          <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>↑↓ выбрать • Enter открыть • Esc закрыть</span>
            <span>{loading ? "Ищем…" : query.trim().length < 2 ? "мин. 2 символа" : ""}</span>
          </div>
        </div>

        <div className="max-h-[420px] overflow-auto">
          {results.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              {query.trim().length < 2 ? "Начни вводить запрос…" : "Ничего не найдено"}
            </div>
          ) : (
            results.map((r, idx) => {
              const href = `/courses/${r.course_slug}#lesson-${r.slug}`;
              const isActive = idx === active;

              return (
                <Link
                  key={r.id}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`block px-4 py-3 border-b last:border-b-0 transition ${
                    isActive ? "bg-muted" : "hover:bg-muted"
                  }`}
                >
                  <div className="text-sm font-medium">
                    {r.order_index}. {r.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    /courses/{r.course_slug} → lesson-{r.slug}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="p-3 border-t text-xs text-muted-foreground">
          Подсказка: нажми <span className="font-medium">{hint}</span> в любом месте сайта.
        </div>
      </div>
    </div>
  );
}