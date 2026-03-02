import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

type RequireAdminResult =
  | { errorResponse: NextResponse; supabase: null }
  | { errorResponse: null; supabase: Awaited<ReturnType<typeof createSupabaseServer>> };

export async function requireAdminApi(): Promise<RequireAdminResult> {
  const supabase = await createSupabaseServer();

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return {
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      supabase: null,
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError) {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden", reason: "profileError", details: profileError },
        { status: 403 }
      ),
      supabase: null,
    };
  }

  if (!profile) {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden", reason: "profileMissing", userId: userData.user.id },
        { status: 403 }
      ),
      supabase: null,
    };
  }

  const role = String(profile.role ?? "").toLowerCase();
  if (role !== "admin") {
    return {
      errorResponse: NextResponse.json(
        { error: "Forbidden", reason: "notAdmin", role: profile.role },
        { status: 403 }
      ),
      supabase: null,
    };
  }

  return { errorResponse: null, supabase };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  return String(profile?.role ?? "").toLowerCase() === "admin";
}