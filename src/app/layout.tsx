import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/AppSidebar";
import { headers } from "next/headers";

const appFont = localFont({
  src: [
    { path: "../assets/fonts/NotoSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/NotoSans-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-app",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EnglishCourse",
  description: "Learn English with lessons, practice, and progress tracking.",
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

  return (
    <html lang="ru">
      <body className="min-h-screen bg-[#030303] text-white">
        <AppSidebar activeCourseSlug={activeCourseSlug} pathname={pathname} />

        <div className="lg:pl-[288px] min-h-screen">
          <SiteHeader userEmail={data.user?.email ?? null} />

          <main className="min-h-[calc(100vh-64px)]">
            <div className="px-4 sm:px-6 lg:px-10">
              <div className="mx-auto max-w-6xl py-10">{children}</div>
            </div>
          </main>

          <footer className="border-t border-white/10 bg-black/50 backdrop-blur">
            <div className="px-4 sm:px-6 lg:px-10">
              <div className="mx-auto max-w-6xl py-8 text-sm text-white/55 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                <span>© {new Date().getFullYear()} EnglishCourse</span>
                <span className="text-white/35">Built with Next.js + Supabase</span>
              </div>
            </div>
          </footer>
        </div>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
