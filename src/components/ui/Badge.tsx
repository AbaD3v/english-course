// components/ui/Badge.tsx
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
      ? "border-black/10 bg-white/50 text-black/60"
      : variant === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-black/10 bg-white/70 text-black/80";

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