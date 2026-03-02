import * as React from "react";
import { cn } from "@/components/ui/cn";

type BadgeVariant = "default" | "muted" | "success";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const styles =
    variant === "muted"
      ? cn(
          "border-black/10 bg-black/5 text-black/70",
          "dark:border-white/10 dark:bg-white/10 dark:text-white/80"
        )
      : variant === "success"
      ? cn(
          "border-emerald-600/20 bg-emerald-500/10 text-emerald-700",
          "dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200"
        )
      : cn(
          "border-black/10 bg-black/5 text-black/80",
          "dark:border-white/10 dark:bg-white/10 dark:text-white/90"
        );

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur",
        styles,
        className
      )}
      {...props}
    />
  );
}