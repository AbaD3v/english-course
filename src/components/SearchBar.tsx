"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Result = {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  course_slug: string;
};

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    const t = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults((json.results ?? []) as Result[]);
      setLoading(false);
      setOpen(true);
    }, 250);

    return () => clearTimeout(t);
  }, [query]);

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="relative">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск уроков… (hello, greetings, present)"
          className="w-full rounded-xl border px-4 py-2 pr-10 outline-none focus:ring-2 focus:ring-black/10"
          onFocus={() => {
            if (results.length) setOpen(true);
          }}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {loading ? "…" : "⌘K"}
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-xl border bg-white shadow-lg overflow-hidden">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground">
              Ничего не найдено
            </div>
          ) : (
            results.map((r) => (
              <Link
  key={r.id}
  href={`/courses/${r.course_slug}#lesson-${r.slug}`}
  onClick={() => setOpen(false)}
  className="block px-4 py-3 hover:bg-muted transition"
>
  <div className="text-sm font-medium">
    {r.order_index}. {r.title}
  </div>
  <div className="text-xs text-muted-foreground">{r.course_slug}</div>
</Link>
            ))
          )}

          <div className="border-t px-4 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>Enter — полная страница</span>
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              className="underline"
              onClick={() => setOpen(false)}
            >
              Открыть →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}