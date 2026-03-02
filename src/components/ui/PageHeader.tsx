import { ReactNode } from "react";
import { cn } from "@/components/ui/cn";

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  right,
  className,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        {eyebrow ? (
          <div
            className={cn(
              "mb-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium backdrop-blur",
              "border-black/10 bg-white/60 text-black/70",
              "dark:border-white/10 dark:bg-white/10 dark:text-white/80"
            )}
          >
            {eyebrow}
          </div>
        ) : null}

        <h1 className="text-balance text-3xl font-semibold tracking-tight text-black dark:text-white md:text-4xl">
          {title}
        </h1>

        {subtitle ? (
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-6 text-black/60 dark:text-white/60 md:text-base">
            {subtitle}
          </p>
        ) : null}
      </div>

      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}