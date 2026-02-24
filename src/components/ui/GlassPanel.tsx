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
        "rounded-3xl border border-black/10 bg-white/70 shadow-[0_10px_30px_rgba(0,0,0,0.06)] backdrop-blur",
        className
      )}
    >
      {children}
    </div>
  );
}