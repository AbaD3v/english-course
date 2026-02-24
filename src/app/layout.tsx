import type { Metadata } from "next";
import "./globals.css";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/AppSidebar";
import { headers } from "next/headers";

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
      <body className="min-h-screen bg-[#f7f7f8]">
        <AppSidebar activeCourseSlug={activeCourseSlug} pathname={pathname} />

        {/* Right side */}
        <div className="lg:pl-[288px] min-h-screen">
          <SiteHeader userEmail={data.user?.email ?? null} />

          <main className="min-h-[calc(100vh-64px)]">
            {/* app padding like ChatGPT */}
            <div className="px-4 sm:px-6 lg:px-10">
              <div className="mx-auto max-w-6xl py-8">{children}</div>
            </div>
          </main>

          <footer className="mt-10 border-t border-black/10 bg-white/40 backdrop-blur">
            <div className="px-4 sm:px-6 lg:px-10">
              <div className="mx-auto max-w-6xl py-10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-sm font-semibold text-black">
                      © {new Date().getFullYear()} EnglishCourse
                    </div>
                    <div className="mt-1 text-xs text-black/50">
                      Next.js + Supabase + Tailwind
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}