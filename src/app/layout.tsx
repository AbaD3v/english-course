// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { createSupabaseServer } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/SiteHeader";
import { Toaster } from "sonner";
import { AppSidebar } from "@/components/AppSidebar";
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

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createSupabaseServer();
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

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

        {/* Сайдбар теперь клиентский — пропсы не нужны */}
        <AppSidebar />

        <div className="lg:pl-[272px] min-h-screen flex flex-col">
          <SiteHeader
            userEmail={user?.email ?? null}
            isAdmin={isAdmin}
          />

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
