import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function requireAdminApi() {
  const supabase = await createSupabaseServer();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    return { errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), supabase: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    return { errorResponse: NextResponse.json({ error: "Forbidden" }, { status: 403 }), supabase: null };
  }

  return { errorResponse: null, supabase };
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return false;

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle();
  return profile?.role === "admin";
}
