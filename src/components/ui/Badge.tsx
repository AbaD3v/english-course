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
      ? "border-white/15 bg-white/5 text-white/60"
      : variant === "success"
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
      : "border-white/20 bg-white/10 text-white/80";

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
