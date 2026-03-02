// certificate/[courseSlug]/page.tsx
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";

export default async function CertificatePage({
  params,
}: {
  params: Promise<{ courseSlug: string }>;
}) {
  const { courseSlug } = await params;
  const supabase = await createSupabaseServer();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  return (
    <main className="max-w-6xl mx-auto p-6 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" className="rounded-xl">
          <Link href={`/courses/${courseSlug}`} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Назад к курсу
          </Link>
        </Button>

        {!user && (
          <Button variant="ghost" size="sm" className="rounded-xl">
            <Link href="/auth">Войти</Link>
          </Button>
        )}
      </div>

      <Card className="rounded-[32px] border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 md:p-8 shadow-sm">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
          Certificate
        </h1>
        <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400">
          Если курс завершён на 100%, сертификат будет доступен для скачивания.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" className="rounded-2xl">
            <a href={`/api/certificate/${courseSlug}?download=1`} className="flex items-center gap-2">
              <Download className="h-4 w-4" /> Скачать PDF
            </a>
          </Button>

          {/* Заменен outline на ghost */}
          <Button variant="ghost" size="lg" className="rounded-2xl">
            <a href={`/api/certificate/${courseSlug}`} target="_blank" rel="noreferrer" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" /> Открыть в новой вкладке
            </a>
          </Button>
        </div>

        <div className="mt-8 rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-3">
          <iframe
            className="h-[520px] w-full rounded-2xl bg-white"
            src={`/api/certificate/${courseSlug}`}
            title="certificate"
          />
        </div>
      </Card>
    </main>
  );
}