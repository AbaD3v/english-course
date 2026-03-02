"use client";

import Link from "next/link";
import { Search } from "lucide-react";
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
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#a8c0ff]/80" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск уроков и тем..."
          className="w-full rounded-xl border border-white/15 bg-white/[0.06] py-2 pl-9 pr-12 text-sm text-white placeholder:text-white/45 outline-none transition focus:border-[#a8c0ff]/70 focus:bg-white/[0.1]"
          onFocus={() => {
            if (results.length) setOpen(true);
          }}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/45">
          {loading ? "..." : "⌘K"}
        </div>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/15 bg-[#0c0f18] shadow-2xl">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-white/60">Ничего не найдено</div>
          ) : (
            results.map((r) => (
              <Link
                key={r.id}
                href={`/courses/${r.course_slug}#lesson-${r.slug}`}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 transition hover:bg-[#8bacff]/12"
              >
                <div className="text-sm font-medium text-white">
                  {r.order_index}. {r.title}
                </div>
                <div className="text-xs text-white/50">{r.course_slug}</div>
              </Link>
            ))
          )}

          <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-xs text-white/50">
            <span>Enter — открыть страницу поиска</span>
            <Link
              href={`/search?q=${encodeURIComponent(query.trim())}`}
              className="text-white/85 underline underline-offset-2"
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
