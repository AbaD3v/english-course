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
      ? "bg-white text-black border-white/80 hover:bg-white/90 shadow-[0_10px_30px_rgba(255,255,255,0.2)]"
      : variant === "secondary"
      ? "bg-white/10 text-white border-white/20 hover:bg-white/15"
      : variant === "danger"
      ? "bg-red-600 text-white border-red-500 hover:bg-red-500"
      : "bg-transparent text-white/80 border-transparent hover:bg-white/10 hover:text-white";

  const s =
    size === "sm"
      ? "px-3 py-2 text-sm rounded-lg"
      : size === "lg"
      ? "px-5 py-3 text-base rounded-xl"
      : "px-4 py-2 text-sm rounded-lg";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:outline-none",
        variant !== "ghost" && "border",
        v,
        s,
        className
      )}
      {...props}
    />
  );
}
