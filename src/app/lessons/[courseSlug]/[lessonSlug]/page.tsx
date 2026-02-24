import { notFound } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import LessonShell from "./LessonShell";

type LessonNavItem = {
  id: string;
  title: string;
  slug: string;
  order_index: number;
  tags: string[] | null;
};

type ProgressRow = {
  lesson_id: string;
  status: string;
  score: number | null;
};

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;

  const supabase = await createSupabaseServer();

  // user (уроки можно смотреть без логина, прогресс — только для залогиненных)
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  // course
  const { data: course } = await supabase
    .from("courses")
    .select("id,slug,title")
    .eq("slug", courseSlug)
    .single();

  if (!course) return notFound();

  // nav lessons (для левого меню)
  const { data: navLessonsRaw } = await supabase
    .from("lessons")
    .select("id,title,slug,order_index,tags")
    .eq("course_id", course.id)
    .order("order_index", { ascending: true });

  const navLessons = (navLessonsRaw ?? []) as LessonNavItem[];

  // lesson
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", course.id)
    .eq("slug", lessonSlug)
    .single();

  if (!lesson) return notFound();

  // progress map для меню (status + score)
  const progressByLessonId: Record<string, { status: string; score: number | null }> =
    {};

  if (user && navLessons.length) {
    const { data: progressRaw } = await supabase
      .from("lesson_progress")
      .select("lesson_id,status,score")
      .eq("user_id", user.id)
      .in("lesson_id", navLessons.map((l) => l.id));

    const progress = (progressRaw ?? []) as ProgressRow[];

    for (const p of progress) {
      progressByLessonId[p.lesson_id] = {
        status: p.status,
        score: typeof p.score === "number" ? p.score : null,
      };
    }
  }

  const blocks = (lesson.content as any)?.blocks ?? [];

  return (
    <LessonShell
      userSignedIn={!!user}
      course={{ id: course.id, slug: course.slug, title: course.title }}
      lesson={{
        id: lesson.id,
        slug: lesson.slug,
        title: lesson.title,
        order_index: lesson.order_index,
      }}
      navLessons={navLessons}
      progressByLessonId={progressByLessonId}
      blocks={blocks}
    />
  );
}