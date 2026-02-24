import { cn } from "@/components/ui/cn";

export function Section({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-black">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-black/60">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}