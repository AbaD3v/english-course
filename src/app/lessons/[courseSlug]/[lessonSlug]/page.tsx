// src/app/lessons/[courseSlug]/[lessonSlug]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { createSupabaseServer } from "@/lib/supabase/server";
import LessonShell from "./LessonShell";

type LessonNavItem = {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  tags: string[] | null;
};

// Более строгие типы прогресса
type LessonStatus = "not_started" | "in_progress" | "done";

type ProgressData = {
  status: LessonStatus;
  score: number | null;
};

type ProgressRow = {
  lesson_id: string;
  status: string;
  score: number | null;
};

// Динамический metadata для SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
  const { lessonSlug } = await params;
  return {
    title: `Урок: ${lessonSlug.replace(/-/g, ' ')} | EnglishCourse`,
  };
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;
  const supabase = await createSupabaseServer();

  // 1. Получаем пользователя
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // 2. Получаем курс
  const { data: course } = await supabase
    .from("courses")
    .select("id,slug,title")
    .eq("slug", courseSlug)
    .single();

  if (!course) return notFound();

  // 3. Получаем навигацию по урокам (для левого меню)
  const { data: navLessonsRaw } = await supabase
    .from("lessons")
    .select("id,title,slug,order_index,tags")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  const navLessons = (navLessonsRaw ?? []) as LessonNavItem[];

  // 4. Получаем данные текущего урока
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .eq("slug", lessonSlug)
    .single();

  if (!lesson) return notFound();

  // 5. Получаем прогресс пользователя для этого курса
  const progressByLessonId: Record<string, ProgressData> = {};

  if (user && navLessons.length) {
    const { data: progressRaw } = await supabase
      .from("lesson_progress")
      .select("lesson_id,status,score")
      .eq("user_id", user.id)
      .in("lesson_id", navLessons.map((l) => l.id));

    const progress = (progressRaw ?? []) as ProgressRow[];

    for (const p of progress) {
      progressByLessonId[p.lesson_id] = {
        status: p.status as LessonStatus,
        score: typeof p.score === "number" ? p.score : null,
      };
    }
  }

  // 6. Подготавливаем контент блока
  const content = lesson.content as any;
  const blocks = content?.blocks ?? [];

  return (
    <LessonShell
      userSignedIn={!!user}
      course={{ id: course.id, slug: course.slug, title: course.title }}
      lesson={{
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        order_index: lesson.order_index,
        description: lesson.description,
      }}
      navLessons={navLessons}
      progressByLessonId={progressByLessonId}
      blocks={blocks}
    />
  );
}