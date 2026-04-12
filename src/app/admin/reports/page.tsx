// src/app/admin/reports/page.tsx
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AdminOverviewClient } from "@/components/admin/AdminOverviewClient";
import { BarChart3 } from "lucide-react";

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export default async function AdminReportsPage() {
  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  const { data: courses } = await supabase
    .from("courses")
    .select("id,slug,title,level")
    .order("created_at", { ascending: false });

  const { from, to } = defaultRange();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            <BarChart3 className="size-3.5" />
            Admin · Analytics
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">Отчёты</h1>
          <p className="text-sm text-zinc-500 max-w-lg">
            Статистика активности студентов, прогресса по урокам и результатов квизов.
          </p>
        </div>

        <div className="h-px bg-zinc-800" />

        <AdminOverviewClient
          initialFrom={from}
          initialTo={to}
          courses={(courses ?? []) as Array<{ id: string; slug: string; title: string; level: string | null }>}
        />
      </div>
    </main>
  );
}
