// src/components/admin/ReportsTable.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, ArrowUpDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface RowData {
  id: string;
  title: string;
  attempted?: number;
  completed?: number;
  avg_score?: number;
  pass_rate?: number;
  href?: string;
}

type SortKey = "title" | "attempted" | "completed" | "avg_score" | "pass_rate";

export function ReportsTable({ rows }: { rows: RowData[] }) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("completed");
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows
      .filter((r) => r.title.toLowerCase().includes(q))
      .sort((a, b) => {
        let av: string | number = a[sortKey] ?? 0;
        let bv: string | number = b[sortKey] ?? 0;
        if (sortKey === "title") {
          av = String(av).toLowerCase();
          bv = String(bv).toLowerCase();
          return sortAsc ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
        }
        return sortAsc ? (Number(av) - Number(bv)) : (Number(bv) - Number(av));
      });
  }, [rows, query, sortKey, sortAsc]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  const cols: { key: SortKey; label: string; align?: "right" }[] = [
    { key: "title", label: "Урок" },
    { key: "attempted", label: "Попыток", align: "right" },
    { key: "completed", label: "Завершили", align: "right" },
    { key: "avg_score", label: "Avg score", align: "right" },
    { key: "pass_rate", label: "Pass rate", align: "right" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Search */}
      <div className="px-5 py-4 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-zinc-600" />
          <input
            className="w-full rounded-xl border border-zinc-800 bg-zinc-950/60 pl-9 pr-4 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-zinc-600 focus:ring-2 focus:ring-zinc-700/40 transition-all"
            placeholder="Поиск по урокам..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              {cols.map((col) => (
                <th
                  key={col.key}
                  onClick={() => toggleSort(col.key)}
                  className={cn(
                    "px-5 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500 cursor-pointer select-none",
                    "hover:text-zinc-300 transition-colors",
                    col.align === "right" ? "text-right" : "text-left"
                  )}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    <ArrowUpDown className={cn(
                      "size-3 transition-opacity",
                      sortKey === col.key ? "opacity-100 text-zinc-300" : "opacity-30"
                    )} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-sm text-zinc-600">
                  Ничего не найдено
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const score = row.avg_score ?? 0;
                const scoreColor =
                  score >= 80 ? "text-emerald-400" :
                  score >= 60 ? "text-amber-400" : "text-rose-400";

                return (
                  <tr key={row.id} className="group hover:bg-zinc-800/40 transition-colors">
                    <td className="px-5 py-3.5">
                      {row.href ? (
                        <Link
                          href={row.href}
                          className="inline-flex items-center gap-1.5 text-zinc-200 hover:text-white transition-colors group/link"
                        >
                          {row.title}
                          <ExternalLink className="size-3 opacity-0 group-hover/link:opacity-100 text-zinc-500 transition-opacity" />
                        </Link>
                      ) : (
                        <span className="text-zinc-200">{row.title}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right text-zinc-400 tabular-nums">
                      {row.attempted ?? 0}
                    </td>
                    <td className="px-5 py-3.5 text-right text-zinc-400 tabular-nums">
                      {row.completed ?? 0}
                    </td>
                    <td className={cn("px-5 py-3.5 text-right font-semibold tabular-nums", scoreColor)}>
                      {score.toFixed(1)}%
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="w-16 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-sky-400 transition-all"
                            style={{ width: `${Math.min(row.pass_rate ?? 0, 100)}%` }}
                          />
                        </div>
                        <span className="text-zinc-400 w-10 text-right">
                          {(row.pass_rate ?? 0).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filtered.length > 0 && (
        <div className="px-5 py-3 border-t border-zinc-800 text-xs text-zinc-600">
          {filtered.length} {filtered.length === 1 ? "урок" : "уроков"}
        </div>
      )}
    </div>
  );
}
