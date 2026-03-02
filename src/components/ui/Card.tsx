import { cn } from "./cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-black/10 bg-white/80 backdrop-blur",
        "shadow-[0_18px_50px_rgba(0,0,0,0.08)]",
        "dark:border-white/10 dark:bg-[#0B0B0F]/80",
        "dark:shadow-[0_18px_50px_rgba(0,0,0,0.40)]",
        className
      )}
      {...props}
    />
  );
}

export function CardInner({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 md:p-8", className)} {...props} />;
}