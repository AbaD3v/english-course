// src/app/api/admin/courses/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const body = await req.json();

    const payload = {
  title: String(body.title ?? "").trim(),
  slug: String(body.slug ?? "").trim(),
  description: body.description ? String(body.description).trim() : null,
  level: body.level ?? "A1",
  cover_url: body.cover_url ?? null,
  published: Boolean(body.published ?? false),
};

    if (!payload.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    if (!payload.slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const { data, error } = await supabase
  .from("courses")
  .insert(payload)
  .select()
  .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}