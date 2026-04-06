// src/middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  // Обновляем сессию Supabase при каждом запросе
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Сначала обновляем cookies в запросе
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          // Пересоздаём response с обновлёнными cookies
          res = NextResponse.next({ request: req });
          // Затем ставим cookies в response
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // ВАЖНО: getUser() обновляет сессию и токены автоматически
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Защищённые маршруты — редирект на /auth если не залогинен
  const protectedRoutes = ["/profile", "/lessons", "/courses", "/admin"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtected && !user) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = "/auth";
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Если уже залогинен и пытается попасть на /auth — редирект на /profile
  if (pathname === "/auth" && user) {
    return NextResponse.redirect(new URL("/profile", req.url));
  }

  // Сохраняем pathname в заголовке (для layout'ов)
  res.headers.set("x-pathname", pathname);

  return res;
}

export const config = {
  matcher: [
    /*
     * Исключаем статику и внутренние маршруты Next.js
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};