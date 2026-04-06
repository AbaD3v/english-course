// src/app/admin/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import { PlusCircle, BookOpen, ChevronRight, Pencil, GraduationCap } from "lucide-react";


type CourseRow = { id: string; slug: string; title: string; level: string | null };
type LessonRow = { id: string; title: string; slug: string; order_index: number; course_id: string };

export default async function AdminPage() {
  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/auth");

  const { data: courses } = await supabase
    .from("courses")
    .select("id,slug,title,level")
    .order("created_at", { ascending: false });

  const typedCourses = (courses ?? []) as CourseRow[];

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id,title,slug,order_index,course_id")
    .order("order_index", { ascending: true });

  const typedLessons = (lessons ?? []) as LessonRow[];

  const lessonsByCourse: Record<string, LessonRow[]> = {};
  for (const l of typedLessons) {
    if (!lessonsByCourse[l.course_id]) lessonsByCourse[l.course_id] = [];
    lessonsByCourse[l.course_id].push(l);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-10 space-y-10">

        <div className="flex items-center justify-between gap-4">
  <div>
    <div className="flex items-center gap-3 mb-1">
      <GraduationCap className="w-6 h-6 text-amber-400" />
      <span className="text-xs font-mono uppercase tracking-widest text-zinc-500">
        Admin Panel
      </span>
    </div>
    <h1 className="text-3xl font-bold tracking-tight">
      Редактор курсов
    </h1>
  </div>

  {/* 👉 ОБЁРТКА ДЛЯ КНОПОК */}
  <div className="flex items-center gap-2">
    <Link
      href="/admin/lessons/new"
      className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300 transition-colors"
    >
      <PlusCircle className="w-4 h-4" />
      Новый урок
    </Link>

    <Link
      href="/admin/courses/new"
      className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300 transition-colors"
    >
      <PlusCircle className="w-4 h-4" />
      Новый курс
    </Link>
  </div>
</div>

        {/* Courses */}
        {typedCourses.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center text-zinc-500">
            Нет курсов. Создай курс через Supabase, потом добавляй уроки здесь.
          </div>
        ) : (
          <div className="space-y-6">
            {typedCourses.map((course) => {
              const cls = lessonsByCourse[course.id] ?? [];
              return (
                <div key={course.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden">
                  {/* Course header */}
                  <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-zinc-800">
                    <div className="flex items-center gap-3 min-w-0">
                      <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{course.title}</div>
                        <div className="text-xs text-zinc-500 font-mono">{course.slug} {course.level ? `· ${course.level}` : ""}</div>
                      </div>
                    </div>
                    <Link
                      href={`/admin/lessons/new?courseId=${course.id}`}
                      className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Добавить урок
                    </Link>
                  </div>

                  {/* Lessons */}
                  {cls.length === 0 ? (
                    <div className="px-5 py-6 text-sm text-zinc-600 text-center">
                      Уроков пока нет
                    </div>
                  ) : (
                    <ul className="divide-y divide-zinc-800/60">
                      {cls.map((lesson) => (
                        <li key={lesson.id}>
                          <Link
                            href={`/admin/lessons/${lesson.id}`}
                            className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-800/50 transition-colors group"
                          >
                            <span className="w-7 text-center text-xs font-mono text-zinc-600 shrink-0">
                              {lesson.order_index}
                            </span>
                            <span className="flex-1 text-sm font-medium text-zinc-200 group-hover:text-white transition-colors truncate">
                              {lesson.title}
                            </span>
                            <span className="text-xs font-mono text-zinc-600 shrink-0 hidden sm:block">
                              {lesson.slug}
                            </span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="inline-flex items-center gap-1 text-xs text-zinc-500 group-hover:text-amber-400 transition-colors">
                                <Pencil className="w-3.5 h-3.5" />
                                Редактировать
                              </span>
                              <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-400 transition-colors" />
                            </div>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
