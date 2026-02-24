import * as React from "react";
import { cn } from "@/components/ui/cn";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: Props) {
  const v =
    variant === "primary"
      ? "bg-black text-white hover:opacity-90 shadow-[0_14px_30px_rgba(0,0,0,0.18)]"
      : variant === "secondary"
      ? "bg-white/70 text-black border-black/10 hover:bg-white/90 shadow-[0_12px_26px_rgba(0,0,0,0.08)] backdrop-blur"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700 shadow-[0_14px_30px_rgba(220,38,38,0.25)]"
      : "bg-transparent text-black hover:bg-black/5 border-transparent";

  const s =
    size === "sm"
      ? "px-3 py-2 text-sm rounded-xl"
      : size === "lg"
      ? "px-5 py-3 text-base rounded-2xl"
      : "px-4 py-2 text-sm rounded-xl";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        variant !== "ghost" && "border",
        v,
        s,
        className
      )}
      {...props}
    />
  );
}