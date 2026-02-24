import { cn } from "./cn";

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-black/10 bg-white/80 backdrop-blur",
        "shadow-[0_18px_50px_rgba(0,0,0,0.06)]",
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