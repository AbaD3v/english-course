import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { getCourseReport, parseDateRange } from "@/lib/admin/reports";

interface Params {
  params: Promise<{ slug: string }>;
}

export async function GET(request: NextRequest, { params }: Params) {
  const { errorResponse, supabase } = await requireAdminApi();
  if (errorResponse || !supabase) return errorResponse;

  try {
    const { slug } = await params;
    const dateRange = parseDateRange(request.nextUrl.searchParams);
    const report = await getCourseReport(supabase, dateRange, slug);

    if (!report) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
