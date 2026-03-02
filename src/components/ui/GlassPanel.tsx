import { cn } from "@/components/ui/cn";

export function GlassPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-black/10 bg-white/70 backdrop-blur",
        "shadow-[0_10px_30px_rgba(0,0,0,0.10)]",
        "dark:border-white/10 dark:bg-[#0B0B0F]/70",
        "dark:shadow-[0_18px_50px_rgba(0,0,0,0.45)]",
        className
      )}
    >
      {children}
    </div>
  );
}