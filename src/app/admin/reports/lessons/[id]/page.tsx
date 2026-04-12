// src/app/admin/reports/lessons/[id]/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { AdminLessonClient } from "@/components/admin/AdminLessonClient";
import { ArrowLeft, BarChart3 } from "lucide-react";

function defaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

export default async function AdminLessonReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/auth");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();
  if (profile?.role !== "admin") redirect("/");

  // Get lesson + course info for breadcrumb
  const { data: lesson } = await supabase
    .from("lessons")
    .select("title, courses(slug, title)")
    .eq("id", id)
    .single();

  const rawCourses = lesson?.courses;
  const courseData: { slug: string; title: string } | null = Array.isArray(rawCourses)
    ? ((rawCourses as { slug: string; title: string }[])[0] ?? null)
    : ((rawCourses as unknown) as { slug: string; title: string } | null) ?? null;
  const { from, to } = defaultRange();

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-zinc-500 flex-wrap">
          <Link
            href="/admin/reports"
            className="inline-flex items-center gap-1.5 hover:text-zinc-300 transition-colors"
          >
            <ArrowLeft className="size-3.5" />
            Отчёты
          </Link>
          {courseData && (
            <>
              <span>/</span>
              <Link
                href={`/admin/reports/courses/${courseData.slug}`}
                className="hover:text-zinc-300 transition-colors"
              >
                {courseData.title}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-300">{lesson?.title ?? id}</span>
        </div>

        {/* Header */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-zinc-600">
            <BarChart3 className="size-3.5" />
            Admin · Analytics · Lesson
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            {lesson?.title ?? id}
          </h1>
          {courseData && (
            <p className="text-sm text-zinc-500">
              Курс:{" "}
              <Link
                href={`/admin/reports/courses/${courseData.slug}`}
                className="text-zinc-400 hover:text-zinc-200 transition-colors underline underline-offset-4"
              >
                {courseData.title}
              </Link>
            </p>
          )}
        </div>

        <div className="h-px bg-zinc-800" />

        <AdminLessonClient id={id} initialFrom={from} initialTo={to} />
      </div>
    </main>
  );
}
