import { NextRequest, NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin/auth";
import { getCourseReport, getLessonReport, getOverviewReport, parseDateRange, toCsv } from "@/lib/admin/reports";

export async function GET(request: NextRequest) {
  const { errorResponse, supabase } = await requireAdminApi();
  if (errorResponse || !supabase) return errorResponse;

  const scope = request.nextUrl.searchParams.get("scope");
  const slugOrId = request.nextUrl.searchParams.get("slugOrId");
  const dateRange = parseDateRange(request.nextUrl.searchParams);

  try {
    let csv = "";

    if (scope === "overview") {
      const report = await getOverviewReport(supabase, dateRange);
      csv = toCsv(
        report.top_lessons.map((item) => ({
          type: "top_lesson",
          lesson_id: item.lesson_id,
          title: item.title,
          completed_count: item.completed_count,
          avg_score: item.avg_score,
        }))
      );
    } else if (scope === "course" && slugOrId) {
      const report = await getCourseReport(supabase, dateRange, slugOrId);
      if (!report) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 });
      }
      csv = toCsv(
        report.lessons.map((lesson) => ({
          lesson_id: lesson.lesson_id,
          title: lesson.title,
          attempted: lesson.attempted,
          completed: lesson.completed,
          avg_score: lesson.avg_score,
          pass_rate: lesson.pass_rate,
        }))
      );
    } else if (scope === "lesson" && slugOrId) {
      const report = await getLessonReport(supabase, dateRange, slugOrId);
      if (!report) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
      }
      csv = toCsv(
        report.top_users.map((user) => ({
          user_id: user.user_id,
          name: user.name ?? "",
          score: user.score,
        }))
      );
    } else {
      return NextResponse.json({ error: "Invalid scope" }, { status: 400 });
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="report-${scope}-${dateRange.from}-${dateRange.to}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unexpected error" }, { status: 500 });
  }
}
