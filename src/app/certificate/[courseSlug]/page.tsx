import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase/server";

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
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/courses/${courseSlug}`}
          className="rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm font-medium hover:bg-white/80 transition"
        >
          ← Назад к курсу
        </Link>

        {!user ? (
          <Link href="/auth" className="underline text-sm text-black/60">
            Войти
          </Link>
        ) : null}
      </div>

      <div className="rounded-[28px] border border-black/10 bg-white/80 backdrop-blur shadow-[0_18px_50px_rgba(0,0,0,0.06)] p-6 md:p-8 noise">
        <h1 className="text-3xl font-semibold tracking-tight text-black">
          Certificate
        </h1>
        <p className="mt-2 text-sm text-black/60">
          Если курс завершён на 100%, сертификат будет доступен для скачивания.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
         <a
  href={`/api/certificate/${courseSlug}?download=1`}
  className="rounded-2xl bg-black text-white px-5 py-3 font-medium hover:opacity-90 transition"
>
  Скачать PDF
</a>

          <a
            href={`/api/certificate/${courseSlug}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-2xl border border-black/10 bg-white/70 px-5 py-3 font-medium hover:bg-white/90 transition"
          >
            Открыть в новой вкладке
          </a>
        </div>

        <div className="mt-6 rounded-3xl border border-black/10 bg-[#f7f7f8] p-3">
          <iframe
  className="h-[520px] w-full rounded-2xl bg-white"
  src={`/api/certificate/${courseSlug}`}
  title="certificate"
/>
        </div>
      </div>
    </main>
  );
}