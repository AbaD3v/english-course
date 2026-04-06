// src/app/api/admin/lessons/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { course_id, title, slug, description, order_index, content } = body;

  if (!course_id || !title || !slug) {
    return NextResponse.json({ error: "course_id, title and slug are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("lessons")
    .insert({ course_id, title, slug, description, order_index, content })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, id: data.id });
}