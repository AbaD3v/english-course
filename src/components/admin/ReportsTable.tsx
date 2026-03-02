"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

interface RowData {
  id: string;
  title: string;
  attempted?: number;
  completed?: number;
  avg_score?: number;
  pass_rate?: number;
  href?: string;
}

export function ReportsTable({ rows }: { rows: RowData[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => rows.filter((row) => row.title.toLowerCase().includes(query.toLowerCase())).sort((a, b) => (b.completed ?? 0) - (a.completed ?? 0)),
    [rows, query]
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
      <input
        className="mb-3 w-full rounded-lg border border-white/10 bg-zinc-800 px-3 py-2 text-sm text-zinc-100"
        placeholder="Search..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-zinc-400">
            <tr>
              <th className="p-2">Title</th>
              <th className="p-2">Attempted</th>
              <th className="p-2">Completed</th>
              <th className="p-2">Avg score</th>
              <th className="p-2">Pass rate</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row.id} className="border-t border-white/10 text-zinc-200">
                <td className="p-2">
                  {row.href ? (
                    <Link href={row.href} className="text-sky-400 hover:text-sky-300">
                      {row.title}
                    </Link>
                  ) : (
                    row.title
                  )}
                </td>
                <td className="p-2">{row.attempted ?? 0}</td>
                <td className="p-2">{row.completed ?? 0}</td>
                <td className="p-2">{row.avg_score?.toFixed(2) ?? "0.00"}</td>
                <td className="p-2">{row.pass_rate?.toFixed(2) ?? "0.00"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
