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
      ? cn(
          "bg-white text-black border-black/20 hover:bg-black/90",
          "shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
          "dark:bg-dark dark:text-white dark:border-white/20 dark:hover:bg-white/90",
          "dark:shadow-[0_10px_30px_rgba(255,255,255,0.08)]"
        )
      : variant === "secondary"
      ? cn(
          "bg-white text-black border-black/10 hover:bg-black/10",
          "dark:bg-black/10 dark:text-white dark:border-white/15 dark:hover:bg-white/15"
        )
      : variant === "danger"
      ? "bg-red-600 text-white dark:bg-red-500 dark:text-dark border-red-500 hover:bg-red-500"
      : cn(
          "bg-transparent text-black/80 border-transparent hover:bg-black/5 hover:text-black",
          "dark:text-white/80 dark:hover:bg-white/10 dark:hover:text-white"
        );

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
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        "dark:focus-visible:ring-white/20 dark:focus-visible:ring-offset-black",
        variant !== "ghost" && "border",
        v,
        s,
        className
      )}
      {...props}
    />
  );
}