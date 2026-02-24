import { cn } from "./cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-border bg-card px-4 py-2 outline-none",
        "focus:ring-2 focus:ring-black/10",
        className
      )}
      {...props}
    />
  );
}