// src/app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/profile";

  // Санитизация next — разрешаем только относительные пути
  const safePath = next.startsWith("/") ? next : "/profile";

  if (!code) {
    return NextResponse.redirect(
      new URL("/auth?error=no_code", url.origin)
    );
  }

  const supabase = await createSupabaseServer();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error.message)}`, url.origin)
    );
  }

  return NextResponse.redirect(new URL(safePath, url.origin));
}