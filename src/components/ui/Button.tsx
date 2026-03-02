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
      ? "border-[#96b2ff] bg-[#dce7ff] text-[#0b1020] hover:bg-[#cfdfff] shadow-[0_12px_30px_rgba(120,154,255,0.35)]"
      : variant === "secondary"
      ? "border-white/20 bg-white/10 text-white hover:bg-white/15"
      : variant === "danger"
      ? "border-red-500 bg-red-600 text-white hover:bg-red-500"
      : "border-transparent bg-transparent text-white/80 hover:bg-white/10 hover:text-white";

  const s =
    size === "sm"
      ? "rounded-lg px-3 py-2 text-sm"
      : size === "lg"
      ? "rounded-xl px-5 py-3 text-base"
      : "rounded-lg px-4 py-2 text-sm";

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
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
