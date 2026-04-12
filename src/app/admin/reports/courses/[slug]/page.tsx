// src/app/admin/reports/courses/[slug]/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AdminCourseClient } from "@/components/admin/AdminCourseClient";
import { ArrowLeft, BarChart3 } from "lucide-react";

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export default async function AdminCourseReportPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  // Get course title for breadcrumb
  const { data: course } = await supabase
    .from("courses")
    .select("title")
    .eq("slug", slug)
    .single();

  const { from, to } = defaultRange();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Отчёты
          </Link>
          <span>/</span>
          <span className="text-zinc-300">{course?.title ?? slug}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            <BarChart3 className="size-3.5" />
            Admin · Analytics · Course
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {course?.title ?? slug}
          </h1>
          <p className="text-sm text-zinc-500">
            Детальная статистика по урокам курса
          </p>
        </div>

        <div className="h-px bg-zinc-800" />

        <AdminCourseClient slug={slug} initialFrom={from} initialTo={to} />
      </div>
    </main>
  );
}
