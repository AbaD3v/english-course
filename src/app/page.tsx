import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Trophy } from "lucide-react";

const features = [
  {
    title: "Structured roadmap",
    description: "Курсы собраны по уровням и разделены на небольшие уроки с фокусом на практике.",
    icon: Sparkles,
  },
  {
    title: "Progress tracking",
    description: "Сохраняй прогресс, возвращайся к незавершённым темам и контролируй темп обучения.",
    icon: ShieldCheck,
  },
  {
    title: "Certificate-ready",
    description: "Завершай курс, проходи тесты и получай подтверждение результата.",
    icon: Trophy,
  },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="noise relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] px-6 py-12 shadow-[0_30px_80px_rgba(0,0,0,0.5)] sm:px-10">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.24em] text-white/70">
            English learning platform
          </p>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-6xl">
            Учите английский в интерфейсе уровня современных SaaS-продуктов
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/65 sm:text-lg">
            Минималистичный дизайн в стиле Vercel: чистая структура, быстрый доступ к курсам,
            фокус на контенте и предсказуемый UX на каждом шаге.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 rounded-xl border border-white/80 bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Начать обучение
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/10"
            >
              Открыть поиск
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
            >
              <div className="mb-4 inline-flex rounded-lg border border-white/20 bg-white/10 p-2">
                <Icon className="h-4 w-4 text-white/90" />
              </div>
              <h2 className="text-lg font-medium text-white">{item.title}</h2>
              <p className="mt-2 text-sm text-white/60">{item.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
