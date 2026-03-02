import type { Metadata } from "next";
import "./globals.css";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/AppSidebar";
import { headers } from "next/headers";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "EnglishCourse — Платформа для изучения английского",
  description: "Интерактивные уроки, практика и отслеживание прогресса.",
};

function getActiveCourseSlugFromPath(path: string) {
  const m1 = path.match(/^\/courses\/([^\/?#]+)/);
  if (m1) return m1[1];

  const m2 = path.match(/^\/lessons\/([^\/?#]+)\//);
  if (m2) return m2[1];

  return null;
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();

  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const activeCourseSlug = getActiveCourseSlugFromPath(pathname);

  // Скрываем сайдбар и хедер на страницах авторизации для фокуса
  const isAuthPage =
    pathname === "/auth" ||
    pathname === "/login" ||
    pathname.startsWith("/auth/");

  return (
    <html lang="ru" className="antialiased">
      <body className="min-h-screen bg-[#FBFBFC] text-zinc-900 selection:bg-zinc-900/10 selection:text-zinc-900">
        {/* Background (Vercel-like) */}
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 -z-10"
        >
          <div className="absolute inset-0 bg-[#FBFBFC]" />
          <div className="absolute -top-24 left-1/2 h-[380px] w-[760px] -translate-x-1/2 rounded-full bg-gradient-to-b from-zinc-900/[0.06] to-transparent blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(24,24,27,0.06)_1px,transparent_0)] [background-size:24px_24px] opacity-[0.28]" />
        </div>

        {!isAuthPage && (
          <AppSidebar activeCourseSlug={activeCourseSlug} pathname={pathname} />
        )}

        <div
          className={cn(
            "min-h-screen transition-[padding] duration-300",
            !isAuthPage && "lg:pl-[280px]"
          )}
        >
          {!isAuthPage && <SiteHeader userEmail={data.user?.email ?? null} />}

          <main className="relative">
            <div className="px-4 sm:px-6 lg:px-10">
              <div className="mx-auto max-w-7xl py-6 sm:py-10">
                <div className={cn(!isAuthPage && "relative")}>
                  {!isAuthPage && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -inset-2 -z-10 rounded-2xl bg-white/55 shadow-[0_1px_0_rgba(0,0,0,0.05)] ring-1 ring-zinc-200/60 backdrop-blur-xl"
                    />
                  )}

                  <div className={cn(!isAuthPage && "p-4 sm:p-6 lg:p-8")}>
                    {children}
                  </div>
                </div>
              </div>
            </div>
          </main>

          {!isAuthPage && (
            <footer className="mt-auto border-t border-zinc-200/60 bg-white/40 backdrop-blur-xl">
              <div className="px-4 sm:px-6 lg:px-10">
                <div className="mx-auto max-w-7xl py-10 sm:py-12">
                  <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="space-y-1 text-center sm:text-left">
                      <p className="text-sm font-medium text-zinc-900">
                        © {new Date().getFullYear()} EnglishCourse
                      </p>
                      <p className="text-xs text-zinc-500">
                        Платформа построена на Stack: Next.js + Supabase
                      </p>
                    </div>

                    <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-zinc-500">
                      <a
                        href="#"
                        className="rounded-md px-1 py-0.5 transition-colors hover:text-zinc-900"
                      >
                        Помощь
                      </a>
                      <a
                        href="#"
                        className="rounded-md px-1 py-0.5 transition-colors hover:text-zinc-900"
                      >
                        Конфиденциальность
                      </a>
                      <a
                        href="#"
                        className="rounded-md px-1 py-0.5 transition-colors hover:text-zinc-900"
                      >
                        Условия
                      </a>
                    </nav>
                  </div>
                </div>
              </div>
            </footer>
          )}
        </div>

        <Toaster
          richColors
          position="top-right"
          toastOptions={{
            className:
              "border border-zinc-200/70 bg-white/90 text-zinc-900 shadow-lg backdrop-blur-xl rounded-xl",
          }}
        />
      </body>
    </html>
  );
}