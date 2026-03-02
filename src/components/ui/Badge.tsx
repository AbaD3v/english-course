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
      ? "border-black/15 bg-black/5 text-black/65"
      : variant === "success"
      ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
      : "border-black/15 bg-white/75 text-black/75";

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
