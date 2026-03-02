import Link from "next/link";
import { cn } from "@/components/ui/cn";
import { Badge } from "@/components/ui/Badge";
import { ChevronRight } from "lucide-react";

type LessonStatus = "not_started" | "in_progress" | "done";

export function LessonCard({
  href,
  order,
  title,
  tags,
  status,
  score,
  className,
}: {
  href: string;
  order: number;
  title: string;
  tags?: string[];
  status?: LessonStatus;
  score?: number | null;
  className?: string;
}) {
  const statusDot =
    status === "done"
      ? "bg-emerald-400"
      : status === "in_progress"
      ? "bg-amber-400"
      : "bg-zinc-300";

  const statusText =
    status === "done" ? "Done" : status === "in_progress" ? "In progress" : "Not started";

  return (
    <Link
      href={href}
      className={cn(
        "group block rounded-3xl border border-black/10 bg-white dark:bg-black backdrop-blur",
        "shadow-[0_18px_50px_rgba(0,0,0,0.06)]",
        "transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(0,0,0,0.10)] hover:bg-white dark:hover:bg-zinc-850/95",
        "focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/15",
        className
      )}
    >
      <div className="p-5 md:p-6">
        {/* top row */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="text-xs text-black/50">Lesson {order}</div>
            <div className="mt-1 truncate text-base font-semibold text-black">
              {title}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 rounded-full", statusDot)} />
            <span className="text-xs text-black/55">{statusText}</span>
          </div>
        </div>

        {/* tags */}
        {tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.slice(0, 4).map((t) => (
              <Badge
                key={t}
                className="border-black/10 bg-black/5 text-black/70"
              >
                {t}
              </Badge>
            ))}
            {tags.length > 4 ? (
              <Badge className="border-black/10 bg-black/5 text-black/60">
                +{tags.length - 4}
              </Badge>
            ) : null}
          </div>
        ) : null}

        {/* bottom row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-black/60">
            Open <span className="text-black/50">→</span>
          </div>

          <div className="flex items-center gap-2">
            {typeof score === "number" ? (
              <Badge className="border-black/10 bg-white/70 text-black/70">
                Score: {score}%
              </Badge>
            ) : null}

            <ChevronRight className="h-5 w-5 text-black/30 transition group-hover:text-black/55" />
          </div>
        </div>
      </div>
    </Link>
  );
}