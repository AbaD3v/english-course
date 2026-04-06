// src/app/admin/lessons/[id]/page.tsx
import { notFound, redirect } from "next/navigation";
import { createSupabaseServer } from "@/lib/supabase/server";
import LessonEditor from "./LessonEditor";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ courseId?: string }>;
};

export default async function LessonEditorPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { courseId: queryCourseId } = await searchParams;

  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/auth");

  const { data: courses } = await supabase
    .from("courses")
    .select("id,title")
    .order("created_at", { ascending: false });

  const typedCourses = (courses ?? []) as { id: string; title: string }[];

  // New lesson
  if (id === "new") {
    return (
      <LessonEditor
        initialMeta={{
          id: null,
          courseId: queryCourseId ?? typedCourses[0]?.id ?? "",
          title: "",
          slug: "",
          description: "",
          orderIndex: 1,
        }}
        initialBlocks={[]}
        courses={typedCourses}
      />
    );
  }

  // Edit existing
  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (!lesson) return notFound();

  const content = (lesson.content as any) ?? {};
  const blocks = content.blocks ?? [];

  return (
    <LessonEditor
      initialMeta={{
        id: lesson.id,
        courseId: lesson.course_id,
        title: lesson.title,
        slug: lesson.slug,
        description: lesson.description ?? "",
        orderIndex: lesson.order_index ?? 1,
      }}
      initialBlocks={blocks}
      courses={typedCourses}
    />
  );
}
