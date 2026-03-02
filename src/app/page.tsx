import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  ChartColumnBig,
  CircleCheckBig,
  Rocket,
  Sparkles,
} from "lucide-react";

const features = [
  {
    title: "Пошаговая программа",
    description: "Сильная структура: от базовых тем до уверенного разговорного уровня без хаоса.",
    icon: BookOpenCheck,
  },
  {
    title: "Измеримый прогресс",
    description: "Точно видно, что уже пройдено, где есть пробелы и что изучать дальше.",
    icon: ChartColumnBig,
  },
  {
    title: "Результат в портфолио",
    description: "По завершению курса — тестирование и сертификат, который можно показать работодателю.",
    icon: CircleCheckBig,
  },
];

const metrics = [
  { label: "Курсы", value: "10+" },
  { label: "Практики", value: "120+" },
  { label: "Формат", value: "Self-paced" },
];

export default function Home() {
  return (
    <div className="space-y-10">
      <section className="noise relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#121524] to-[#090b12] px-6 py-12 shadow-[0_30px_90px_rgba(0,0,0,0.55)] sm:px-10 lg:px-14">
        <div className="absolute -right-14 -top-16 h-56 w-56 rounded-full bg-[#7da2ff]/25 blur-3xl" />

        <div className="relative grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#8bacff]/35 bg-[#8bacff]/12 px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#c9d8ff]">
              <Sparkles className="h-3.5 w-3.5" />
              Vercel-inspired learning experience
            </p>

            <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Учите английский в современном интерфейсе, где всё читаемо и логично
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/72 sm:text-lg">
              Мы улучшили визуальную и UX-структуру: аккуратная типографика, понятная навигация,
              ясные акценты и фокус на учебном прогрессе.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl border border-[#96b2ff] bg-[#dce7ff] px-5 py-2.5 text-sm font-semibold text-[#0b1020] transition hover:bg-[#cfdfff]"
              >
                <Rocket className="h-4 w-4" />
                Начать обучение
              </Link>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/8 px-5 py-2.5 text-sm font-medium text-white/85 transition hover:bg-white/14"
              >
                Открыть поиск
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/60">Почему интерфейс стал лучше</p>
            <div className="mt-4 space-y-3">
              {metrics.map((m) => (
                <div key={m.label} className="flex items-end justify-between border-b border-white/10 pb-2 last:border-b-0">
                  <span className="text-sm text-white/60">{m.label}</span>
                  <span className="text-2xl font-semibold tracking-tight text-white">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:border-[#8bacff]/30 hover:bg-white/[0.06]"
            >
              <div className="mb-4 inline-flex rounded-lg border border-[#8bacff]/30 bg-[#8bacff]/12 p-2">
                <Icon className="h-4 w-4 text-[#d2deff]" />
              </div>
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/62">{item.description}</p>
            </article>
          );
        })}
      </section>
    </div>
  );
}
