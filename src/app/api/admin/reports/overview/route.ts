import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { getOverviewReport, parseDateRange } from "@/lib/admin/reports";

export async function GET(request: NextRequest) {
  const { errorResponse, supabase } = await requireAdminApi();
  if (errorResponse || !supabase) return errorResponse;

  try {
    const dateRange = parseDateRange(request.nextUrl.searchParams);
    const report = await getOverviewReport(supabase, dateRange);
    return NextResponse.json(report);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
