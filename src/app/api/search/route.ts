import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createSupabaseServer();

  const { data, error } = await supabase
    .from("lessons")
    .select("id,title,slug,order_index,courses!inner(slug)")
    .textSearch("search_tsv", q, {
      type: "websearch",
      config: "english",
    })
    .limit(8);

  if (error) {
    return NextResponse.json({ results: [], error: error.message }, { status: 200 });
  }

  const results =
    (data ?? []).map((r: any) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      order_index: r.order_index,
      course_slug: r.courses?.slug,
    })) ?? [];

  return NextResponse.json({ results });
}