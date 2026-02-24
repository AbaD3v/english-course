export const runtime = "nodejs";

import { createSupabaseServer } from "@/lib/supabase/server";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "node:fs";
import path from "node:path";

function formatDate(d = new Date()) {
  return d.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  const { courseSlug } = await params;
  const supabase = await createSupabaseServer();

  // USER
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user)
    return new Response("Unauthorized", { status: 401 });

  // COURSE
  const { data: course } = await supabase
    .from("courses")
    .select("id,slug,title,level")
    .eq("slug", courseSlug)
    .single();

  if (!course)
    return new Response("Course not found", { status: 404 });

  // LESSONS
  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", course.id);

  const lessonIds = (lessons ?? []).map((x) => x.id);
  if (!lessonIds.length)
    return new Response("Empty course", { status: 400 });

  // PROGRESS
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id,status,score")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);

  const progressMap = new Map(
    (progress ?? []).map((p) => [p.lesson_id, p])
  );

  const doneCount = lessonIds.filter(
    (id) => progressMap.get(id)?.status === "done"
  ).length;

  if (doneCount !== lessonIds.length) {
    return new Response("Course not completed", { status: 403 });
  }

  const scores = lessonIds
    .map((id) => progressMap.get(id)?.score)
    .filter((x): x is number => typeof x === "number");

  const avgScore = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : null;

  const displayName =
    user.user_metadata?.full_name || user.email || "Student";

  // ---------------- PDF ----------------

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const page = pdf.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();

  // Load Cyrillic fonts
  const regularPath = path.join(
    process.cwd(),
    "src/assets/fonts/NotoSans-Regular.ttf"
  );
  const boldPath = path.join(
    process.cwd(),
    "src/assets/fonts/NotoSans-Bold.ttf"
  );

  const regularBytes = fs.readFileSync(regularPath);
  const boldBytes = fs.readFileSync(boldPath);

  const fontBody = await pdf.embedFont(regularBytes);
  const fontTitle = await pdf.embedFont(boldBytes);

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(0.968, 0.969, 0.973),
  });

  // Card
  page.drawRectangle({
    x: 30,
    y: 30,
    width: width - 60,
    height: height - 60,
    borderColor: rgb(0.1, 0.1, 0.12),
    borderWidth: 2,
    color: rgb(1, 1, 1),
    opacity: 0.92,
  });

  // Title EN
  page.drawText("Certificate of Completion", {
    x: 80,
    y: height - 140,
    size: 34,
    font: fontTitle,
    color: rgb(0.08, 0.08, 0.10),
  });

  // Title RU
  page.drawText("Сертификат о прохождении", {
    x: 80,
    y: height - 175,
    size: 18,
    font: fontBody,
    color: rgb(0.35, 0.35, 0.40),
  });

  // Name
  page.drawText(displayName, {
    x: 80,
    y: height - 240,
    size: 28,
    font: fontTitle,
    color: rgb(0.08, 0.08, 0.10),
  });

  // Body EN
  page.drawText(
    "has successfully completed the English course:",
    {
      x: 80,
      y: height - 285,
      size: 16,
      font: fontBody,
      color: rgb(0.3, 0.3, 0.35),
    }
  );

  // Body RU
  page.drawText(
    "успешно завершил(а) курс английского языка:",
    {
      x: 80,
      y: height - 310,
      size: 14,
      font: fontBody,
      color: rgb(0.4, 0.4, 0.45),
    }
  );

  // Course title
  page.drawText(course.title, {
    x: 80,
    y: height - 350,
    size: 22,
    font: fontTitle,
    color: rgb(0.08, 0.08, 0.10),
  });

  const issued = formatDate(new Date());
  const serial = `${course.slug}-${user.id.slice(0, 6)}-${Date.now()
    .toString()
    .slice(-5)}`;

  const infoY = 140;

  page.drawText(`Level / Уровень: ${course.level ?? "—"}`, {
    x: 80,
    y: infoY,
    size: 14,
    font: fontBody,
    color: rgb(0.25, 0.25, 0.30),
  });

  page.drawText(`Lessons / Уроков: ${lessonIds.length}`, {
    x: 80,
    y: infoY - 20,
    size: 14,
    font: fontBody,
    color: rgb(0.25, 0.25, 0.30),
  });

  page.drawText(
    `Average score / Средний результат: ${
      avgScore !== null ? avgScore + "%" : "—"
    }`,
    {
      x: 80,
      y: infoY - 40,
      size: 14,
      font: fontBody,
      color: rgb(0.25, 0.25, 0.30),
    }
  );

  page.drawText(`Issued / Дата выдачи: ${issued}`, {
    x: 80,
    y: 95,
    size: 12,
    font: fontBody,
    color: rgb(0.35, 0.35, 0.40),
  });

  page.drawText(`Certificate ID: ${serial}`, {
    x: 80,
    y: 75,
    size: 12,
    font: fontBody,
    color: rgb(0.35, 0.35, 0.40),
  });

  // Signature line
  page.drawLine({
    start: { x: width - 310, y: 110 },
    end: { x: width - 80, y: 110 },
    thickness: 1,
    color: rgb(0.75, 0.75, 0.78),
  });

  page.drawText("EnglishCourse", {
    x: width - 260,
    y: 90,
    size: 14,
    font: fontTitle,
    color: rgb(0.25, 0.25, 0.30),
  });

  const bytes = await pdf.save();

  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

const url = new URL(_req.url);
const download = url.searchParams.get("download");

const disposition =
  download === "1"
    ? `attachment; filename="EnglishCourse-${course.slug}-certificate.pdf"`
    : "inline";

return new Response(arrayBuffer, {
  headers: {
    "Content-Type": "application/pdf",
    "Content-Disposition": disposition,
    "Cache-Control": "no-store",
  },
});
}