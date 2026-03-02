import { SupabaseClient } from "@supabase/supabase-js";

type ProgressStatus = "completed" | "in_progress" | "not_started" | string;

interface CourseRow {
  id: string;
  title: string;
  slug: string;
  published: boolean;
}

interface LessonRow {
  id: string;
  title: string;
  slug: string;
  course_id: string;
  published: boolean;
  courses: CourseRow | null;
}

interface ProgressRow {
  user_id: string;
  lesson_id: string;
  status: ProgressStatus;
  score: number | null;
  last_seen_at: string;
  lessons: LessonRow;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface OverviewResponse {
  total_attempted_users: number;
  total_completed: number;
  avg_score: number;
  min_score: number;
  max_score: number;
  pass_rate: number;
  activity_by_day: Array<{ day: string; users: number; completed: number; avg_score: number }>;
  top_lessons: Array<{ lesson_id: string; title: string; completed_count: number; avg_score: number }>;
}

export interface CourseResponse {
  course: { id: string; title: string; slug: string };
  lessons: Array<{
    lesson_id: string;
    title: string;
    slug: string;
    attempted: number;
    completed: number;
    avg_score: number;
    pass_rate: number;
  }>;
  activity_by_day: Array<{ day: string; users: number; completed: number; avg_score: number }>;
}

export interface LessonResponse {
  lesson: { id: string; title: string; slug: string; course_slug: string };
  metrics: {
    attempted: number;
    completed: number;
    avg_score: number;
    pass_rate: number;
    min_score: number;
    max_score: number;
  };
  score_buckets: Array<{ bucket: string; count: number }>;
  top_users: Array<{ user_id: string; name: string | null; score: number }>;
}

function toIsoBoundary(from: string, to: string): { fromIso: string; toIso: string } {
  return { fromIso: `${from}T00:00:00.000Z`, toIso: `${to}T23:59:59.999Z` };
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return round(values.reduce((acc, current) => acc + current, 0) / values.length);
}

function safeScores(rows: ProgressRow[]): number[] {
  return rows.map((row) => row.score).filter((score): score is number => typeof score === "number");
}

function buildActivityByDay(rows: ProgressRow[]): Array<{ day: string; users: number; completed: number; avg_score: number }> {
  const map = new Map<string, { users: Set<string>; completed: number; scores: number[] }>();

  for (const row of rows) {
    const day = row.last_seen_at.slice(0, 10);
    const entry = map.get(day) ?? { users: new Set<string>(), completed: 0, scores: [] };
    entry.users.add(row.user_id);

    if (row.status === "completed") {
      entry.completed += 1;
      if (typeof row.score === "number") {
        entry.scores.push(row.score);
      }
    }

    map.set(day, entry);
  }

  return Array.from(map.entries())
    .sort(([dayA], [dayB]) => (dayA > dayB ? 1 : -1))
    .map(([day, entry]) => ({
      day,
      users: entry.users.size,
      completed: entry.completed,
      avg_score: avg(entry.scores),
    }));
}

export function parseDateRange(searchParams: URLSearchParams): DateRange {
  const now = new Date();
  const defaultTo = now.toISOString().slice(0, 10);
  const fromDate = new Date(now);
  fromDate.setDate(now.getDate() - 29);
  const defaultFrom = fromDate.toISOString().slice(0, 10);

  const from = searchParams.get("from") ?? defaultFrom;
  const to = searchParams.get("to") ?? defaultTo;

  return { from, to };
}

async function fetchProgressRows(
  supabase: SupabaseClient,
  dateRange: DateRange,
  options?: { courseSlug?: string; lessonId?: string }
): Promise<ProgressRow[]> {
  const { fromIso, toIso } = toIsoBoundary(dateRange.from, dateRange.to);

  let query = supabase
    .from("lesson_progress")
    .select(
      "user_id, lesson_id, status, score, last_seen_at, lessons!inner(id,title,slug,course_id,published,courses!inner(id,title,slug,published))"
    )
    .gte("last_seen_at", fromIso)
    .lte("last_seen_at", toIso)
    .eq("lessons.published", true)
    .eq("lessons.courses.published", true);

  if (options?.courseSlug) {
    query = query.eq("lessons.courses.slug", options.courseSlug);
  }

  if (options?.lessonId) {
    query = query.eq("lesson_id", options.lessonId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as unknown as ProgressRow[];
}

export async function getOverviewReport(supabase: SupabaseClient, dateRange: DateRange): Promise<OverviewResponse> {
  const rows = await fetchProgressRows(supabase, dateRange);
  const completedRows = rows.filter((row) => row.status === "completed");
  const completedScores = safeScores(completedRows);
  const attemptedUsers = new Set(rows.map((row) => row.user_id)).size;
  const passed = completedRows.filter((row) => (row.score ?? 0) >= 70).length;

  const lessonMap = new Map<string, { title: string; completed: number; scores: number[] }>();
  for (const row of completedRows) {
    const current = lessonMap.get(row.lesson_id) ?? { title: row.lessons.title, completed: 0, scores: [] };
    current.completed += 1;
    if (typeof row.score === "number") {
      current.scores.push(row.score);
    }
    lessonMap.set(row.lesson_id, current);
  }

  const topLessons = Array.from(lessonMap.entries())
    .map(([lessonId, value]) => ({
      lesson_id: lessonId,
      title: value.title,
      completed_count: value.completed,
      avg_score: avg(value.scores),
    }))
    .sort((a, b) => b.completed_count - a.completed_count)
    .slice(0, 10);

  return {
    total_attempted_users: attemptedUsers,
    total_completed: completedRows.length,
    avg_score: avg(completedScores),
    min_score: completedScores.length ? Math.min(...completedScores) : 0,
    max_score: completedScores.length ? Math.max(...completedScores) : 0,
    pass_rate: completedRows.length ? round((passed / completedRows.length) * 100) : 0,
    activity_by_day: buildActivityByDay(rows),
    top_lessons: topLessons,
  };
}

export async function getCourseReport(
  supabase: SupabaseClient,
  dateRange: DateRange,
  slug: string
): Promise<CourseResponse | null> {
  const rows = await fetchProgressRows(supabase, dateRange, { courseSlug: slug });
  if (rows.length === 0) {
    const { data: courseData, error: courseError } = await supabase
      .from("courses")
      .select("id,title,slug,published")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();

    if (courseError) throw new Error(courseError.message);
    if (!courseData) return null;

    return {
      course: { id: courseData.id, title: courseData.title, slug: courseData.slug },
      lessons: [],
      activity_by_day: [],
    };
  }

  const course = rows[0].lessons.courses;
  if (!course) return null;

  const lessonMap = new Map<
    string,
    { title: string; slug: string; users: Set<string>; completed: number; completedScores: number[]; passed: number }
  >();

  for (const row of rows) {
    const entry =
      lessonMap.get(row.lesson_id) ??
      { title: row.lessons.title, slug: row.lessons.slug, users: new Set<string>(), completed: 0, completedScores: [], passed: 0 };
    entry.users.add(row.user_id);

    if (row.status === "completed") {
      entry.completed += 1;
      if (typeof row.score === "number") {
        entry.completedScores.push(row.score);
        if (row.score >= 70) {
          entry.passed += 1;
        }
      }
    }

    lessonMap.set(row.lesson_id, entry);
  }

  const lessons = Array.from(lessonMap.entries()).map(([lessonId, value]) => ({
    lesson_id: lessonId,
    title: value.title,
    slug: value.slug,
    attempted: value.users.size,
    completed: value.completed,
    avg_score: avg(value.completedScores),
    pass_rate: value.completed ? round((value.passed / value.completed) * 100) : 0,
  }));

  return {
    course: { id: course.id, title: course.title, slug: course.slug },
    lessons: lessons.sort((a, b) => b.completed - a.completed),
    activity_by_day: buildActivityByDay(rows),
  };
}

export async function getLessonReport(
  supabase: SupabaseClient,
  dateRange: DateRange,
  id: string
): Promise<LessonResponse | null> {
  const rows = await fetchProgressRows(supabase, dateRange, { lessonId: id });
  const { data: lessonData, error: lessonError } = await supabase
    .from("lessons")
    .select("id,title,slug,published,courses!inner(slug,published)")
    .eq("id", id)
    .eq("published", true)
    .eq("courses.published", true)
    .maybeSingle();

  if (lessonError) {
    throw new Error(lessonError.message);
  }

  if (!lessonData) return null;

  const completedRows = rows.filter((row) => row.status === "completed");
  const completedScores = safeScores(completedRows);
  const attempted = new Set(rows.map((row) => row.user_id)).size;
  const passed = completedRows.filter((row) => (row.score ?? 0) >= 70).length;

  const buckets: Array<{ bucket: string; min: number; max: number }> = [
    { bucket: "0-19", min: 0, max: 19 },
    { bucket: "20-39", min: 20, max: 39 },
    { bucket: "40-59", min: 40, max: 59 },
    { bucket: "60-69", min: 60, max: 69 },
    { bucket: "70-84", min: 70, max: 84 },
    { bucket: "85-100", min: 85, max: 100 },
  ];

  const scoreBuckets = buckets.map((bucket) => ({
    bucket: bucket.bucket,
    count: completedScores.filter((score) => score >= bucket.min && score <= bucket.max).length,
  }));

  const topBase = completedRows
    .filter((row): row is ProgressRow & { score: number } => typeof row.score === "number")
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((row) => ({ user_id: row.user_id, score: row.score }));

  const profileIds = topBase.map((item) => item.user_id);
  let profilesMap = new Map<string, string | null>();

  if (profileIds.length > 0) {
    const { data: profilesData } = await supabase.from("profiles").select("id,name").in("id", profileIds);
    profilesMap = new Map((profilesData ?? []).map((profile) => [profile.id as string, (profile.name as string | null) ?? null]));
  }

  const topUsers = topBase.map((item) => ({
    user_id: item.user_id,
    name: profilesMap.get(item.user_id) ?? null,
    score: item.score,
  }));

  const courseData = Array.isArray(lessonData.courses) ? lessonData.courses[0] : lessonData.courses;
  const courseSlug = (courseData as { slug?: string } | null)?.slug ?? "";

  return {
    lesson: { id: lessonData.id, title: lessonData.title, slug: lessonData.slug, course_slug: courseSlug },
    metrics: {
      attempted,
      completed: completedRows.length,
      avg_score: avg(completedScores),
      pass_rate: completedRows.length ? round((passed / completedRows.length) * 100) : 0,
      min_score: completedScores.length ? Math.min(...completedScores) : 0,
      max_score: completedScores.length ? Math.max(...completedScores) : 0,
    },
    score_buckets: scoreBuckets,
    top_users: topUsers,
  };
}

export function toCsv(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const headerLine = headers.join(",");
  const bodyLines = rows.map((row) =>
    headers
      .map((header) => {
        const value = String(row[header] ?? "");
        if (value.includes(",") || value.includes("\n") || value.includes('"')) {
          return `"${value.replaceAll('"', '""')}"`;
        }
        return value;
      })
      .join(",")
  );

  return [headerLine, ...bodyLines].join("\n");
}
