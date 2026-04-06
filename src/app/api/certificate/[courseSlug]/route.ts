export const runtime = "nodejs";

import { createSupabaseServer } from "@/lib/supabase/server";
import { PDFDocument, rgb, degrees } from "pdf-lib";
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

function safeText(v: unknown, fallback = "—") {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function fitFontSize(
  text: string,
  font: any,
  maxWidth: number,
  startSize: number,
  minSize: number
) {
  let size = startSize;
  while (font.widthOfTextAtSize(text, size) > maxWidth && size > minSize) {
    size -= 1;
  }
  return size;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ courseSlug: string }> }
) {
  const { courseSlug } = await params;
  const supabase = await createSupabaseServer();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { data: course } = await supabase
    .from("courses")
    .select("id, slug, title, level")
    .eq("slug", courseSlug)
    .single();

  if (!course) {
    return new Response("Course not found", { status: 404 });
  }

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .eq("course_id", course.id);

  const lessonIds = (lessons ?? []).map((x) => x.id);

  if (!lessonIds.length) {
    return new Response("Empty course", { status: 400 });
  }

  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id,status,score")
    .eq("user_id", user.id)
    .in("lesson_id", lessonIds);

  const progressMap = new Map((progress ?? []).map((p) => [p.lesson_id, p]));

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

  const displayName = safeText(
    user.user_metadata?.full_name || user.email,
    "Student"
  );

  const issued = formatDate(new Date());
  const serial = `EC-${course.slug.toUpperCase()}-${user.id.slice(0, 4)}-${Date.now()
    .toString()
    .slice(-4)}`;

  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const page = pdf.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();
  const centerX = width / 2;

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

  const C = {
    bg: rgb(0.055, 0.06, 0.09),
    bg2: rgb(0.09, 0.1, 0.145),
    panel: rgb(0.1, 0.11, 0.16),
    gold: rgb(0.93, 0.76, 0.28),
    goldSoft: rgb(0.8, 0.66, 0.28),
    white: rgb(0.965, 0.97, 0.985),
    text: rgb(0.82, 0.84, 0.9),
    muted: rgb(0.58, 0.61, 0.7),
    line: rgb(0.22, 0.24, 0.32),
    stamp: rgb(0.95, 0.78, 0.35),
  };

  function drawCenteredText(
    text: string,
    y: number,
    size: number,
    font: typeof fontBody,
    color = C.white
  ) {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: centerX - textWidth / 2,
      y,
      size,
      font,
      color,
    });
  }

  function drawStatBox(opts: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    value: string;
  }) {
    page.drawRectangle({
      x: opts.x,
      y: opts.y,
      width: opts.w,
      height: opts.h,
      color: C.panel,
      borderColor: C.line,
      borderWidth: 1,
      opacity: 0.95,
    });

    page.drawText(opts.label, {
      x: opts.x + 14,
      y: opts.y + opts.h - 18,
      size: 8,
      font: fontBody,
      color: C.muted,
    });

    const valueSize = fitFontSize(opts.value, fontTitle, opts.w - 28, 18, 10);
    page.drawText(opts.value, {
      x: opts.x + 14,
      y: opts.y + 14,
      size: valueSize,
      font: fontTitle,
      color: C.white,
    });
  }

  // Background
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: C.bg,
  });

  page.drawRectangle({
    x: 0,
    y: height - 120,
    width,
    height: 120,
    color: C.bg2,
    opacity: 0.9,
  });

  // Borders
  page.drawRectangle({
    x: 22,
    y: 22,
    width: width - 44,
    height: height - 44,
    borderColor: C.gold,
    borderWidth: 2.5,
  });

  page.drawRectangle({
    x: 34,
    y: 34,
    width: width - 68,
    height: height - 68,
    borderColor: C.line,
    borderWidth: 1,
  });

  // Decorative corners
  const accentLen = 42;
  const accentOffset = 34;
  const corners = [
    { x: accentOffset, y: height - accentOffset },
    { x: width - accentOffset, y: height - accentOffset },
    { x: accentOffset, y: accentOffset },
    { x: width - accentOffset, y: accentOffset },
  ];

  for (const c of corners) {
    const dirX = c.x < width / 2 ? 1 : -1;
    const dirY = c.y < height / 2 ? 1 : -1;

    page.drawLine({
      start: { x: c.x, y: c.y },
      end: { x: c.x + accentLen * dirX, y: c.y },
      thickness: 2,
      color: C.gold,
    });

    page.drawLine({
      start: { x: c.x, y: c.y },
      end: { x: c.x, y: c.y + accentLen * dirY },
      thickness: 2,
      color: C.gold,
    });
  }

  // Top badge
  page.drawRectangle({
    x: centerX - 78,
    y: height - 68,
    width: 156,
    height: 24,
    color: C.gold,
    borderColor: C.goldSoft,
    borderWidth: 1,
  });

  drawCenteredText(
    "ENGLISH COURSE",
    height - 61,
    10,
    fontTitle,
    rgb(0.08, 0.08, 0.1)
  );

  // Verified stamp
  page.drawCircle({
    x: width - 118,
    y: height - 64,
    size: 24,
    borderColor: C.stamp,
    borderWidth: 1.8,
    opacity: 0.9,
  });

  page.drawCircle({
    x: width - 118,
    y: height - 64,
    size: 18,
    borderColor: C.stamp,
    borderWidth: 0.8,
    opacity: 0.7,
  });

  page.drawText("VERIFIED", {
    x: width - 157,
    y: height - 85,
    size: 16,
    font: fontTitle,
    color: C.stamp,
    rotate: degrees(24),
  });

  // --------- Dynamic vertical layout ----------
  let cursorY = height - 110;

  // Title
  drawCenteredText("Certificate of Completion", cursorY, 28, fontTitle, C.white);
  cursorY -= 24;

  drawCenteredText("СЕРТИФИКАТ О ПРОХОЖДЕНИИ", cursorY, 11, fontBody, C.muted);
  cursorY -= 18;

  page.drawRectangle({
    x: centerX - 85,
    y: cursorY,
    width: 170,
    height: 2.5,
    color: C.gold,
  });
  cursorY -= 28;

  // Intro
  drawCenteredText("This certifies that", cursorY, 15, fontBody, C.text);
  cursorY -= 18;

  drawCenteredText("настоящим подтверждается, что", cursorY, 9, fontBody, C.muted);
  cursorY -= 36;

  // Name
  const maxNameWidth = width - 140;
  const nameSize = fitFontSize(displayName, fontTitle, maxNameWidth, 34, 18);
  drawCenteredText(displayName, cursorY, nameSize, fontTitle, C.white);
  cursorY -= nameSize + 14;

  // Underline
  const underlineHalfWidth = Math.min(
    Math.max(fontTitle.widthOfTextAtSize(displayName, nameSize) / 2 + 20, 120),
    250
  );

  page.drawLine({
    start: { x: centerX - underlineHalfWidth, y: cursorY },
    end: { x: centerX + underlineHalfWidth, y: cursorY },
    thickness: 1,
    color: C.line,
  });
  cursorY -= 28;

  // Completion text
  drawCenteredText(
    "has successfully completed the course",
    cursorY,
    14,
    fontBody,
    C.text
  );
  cursorY -= 17;

  drawCenteredText("успешно завершил(а) курс", cursorY, 9, fontBody, C.muted);
  cursorY -= 30;

  // Course title
  const courseTitle = safeText(course.title, "Untitled Course");
  const courseSize = fitFontSize(courseTitle, fontTitle, width - 180, 22, 13);
  drawCenteredText(courseTitle, cursorY, courseSize, fontTitle, C.gold);
  cursorY -= courseSize + 20;

  // Level badge
  const levelText = `Level / Уровень: ${safeText(course.level, "—")}`;
  const levelTextWidth = fontTitle.widthOfTextAtSize(levelText, 10);
  const levelBoxWidth = levelTextWidth + 26;
  const levelBoxHeight = 22;

  page.drawRectangle({
    x: centerX - levelBoxWidth / 2,
    y: cursorY - 2,
    width: levelBoxWidth,
    height: levelBoxHeight,
    color: C.panel,
    borderColor: C.goldSoft,
    borderWidth: 1,
  });

  drawCenteredText(levelText, cursorY + 5, 10, fontTitle, C.white);

  // Bottom stats area
  const statW = 168;
  const statH = 52;
  const gap = 16;
  const totalW = statW * 3 + gap * 2;
  const startX = centerX - totalW / 2;
  const statY = 98;

  drawStatBox({
    x: startX,
    y: statY,
    w: statW,
    h: statH,
    label: "Lessons / Уроков",
    value: String(lessonIds.length),
  });

  drawStatBox({
    x: startX + statW + gap,
    y: statY,
    w: statW,
    h: statH,
    label: "Average / Средний балл",
    value: avgScore !== null ? `${avgScore}%` : "—",
  });

  drawStatBox({
    x: startX + (statW + gap) * 2,
    y: statY,
    w: statW,
    h: statH,
    label: "Issued / Выдан",
    value: issued,
  });

  // Footer left
  page.drawText(`Certificate ID: ${serial}`, {
    x: 52,
    y: 52,
    size: 8,
    font: fontBody,
    color: C.muted,
  });

  page.drawText(`Student ID: ${user.id.slice(0, 8).toUpperCase()}`, {
    x: 52,
    y: 40,
    size: 8,
    font: fontBody,
    color: C.muted,
  });

  // Signature right
  page.drawLine({
    start: { x: width - 250, y: 62 },
    end: { x: width - 92, y: 62 },
    thickness: 1,
    color: C.muted,
  });

  page.drawText("EnglishCourse", {
    x: width - 205,
    y: 76,
    size: 15,
    font: fontTitle,
    color: C.white,
  });

  page.drawText("Authorized Signature", {
    x: width - 186,
    y: 46,
    size: 8,
    font: fontBody,
    color: C.muted,
  });

  const bytes = await pdf.save();
  const arrayBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;

  const url = new URL(req.url);
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