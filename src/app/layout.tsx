import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/AppSidebar";
import { headers } from "next/headers";
import { AppFooter } from "@/components/layout/AppFooter";
import { PageTransition } from "@/components/layout/PageTransition";

const appFont = localFont({
  src: [
    { path: "../assets/fonts/NotoSans-Regular.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/NotoSans-Bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-app",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://english-course.example.com"),
  title: {
    default: "EnglishCourse — Learn English with modern lessons",
    template: "%s | EnglishCourse",
  },
  description:
    "Learn English with structured courses, interactive lessons, and progress tracking in a production-grade learning platform.",
  keywords: ["English learning", "online courses", "grammar", "vocabulary", "speaking"],
  openGraph: {
    title: "EnglishCourse",
    description: "Interactive English learning platform with course progress and quizzes.",
    type: "website",
  },
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();

  const h = await headers();
  const pathname = h.get("x-pathname") ?? "";
  const activeCourseSlug = getActiveCourseSlugFromPath(pathname);

  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${appFont.variable} min-h-screen bg-app text-app antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(() => {
              try {
                const t = localStorage.getItem('ec-theme');
                if (t === 'light') document.documentElement.classList.remove('dark');
                else document.documentElement.classList.add('dark');
              } catch {}
            })();`,
          }}
        />
        <AppSidebar activeCourseSlug={activeCourseSlug} pathname={pathname} />

        <div className="lg:pl-[288px] min-h-screen flex flex-col">
          <SiteHeader userEmail={data.user?.email ?? null} />

          <main className="min-h-[calc(100vh-64px)] flex-1">
            <div className="px-4 sm:px-6 lg:px-10">
              <div className="mx-auto max-w-6xl py-10">
                <PageTransition>{children}</PageTransition>
              </div>
            </div>
          </main>

          <AppFooter />
        </div>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
