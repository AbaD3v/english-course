import { cn } from "./cn";

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: Props) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border px-4 py-2 outline-none transition",
        "border-black/10 bg-white/70 text-black placeholder:text-black/40",
        "focus:ring-2 focus:ring-black/15 focus:border-black/20",
        "dark:border-white/10 dark:bg-white/10 dark:text-white dark:placeholder:text-white/40",
        "dark:focus:ring-white/15 dark:focus:border-white/20",
        className
      )}
      {...props}
    />
  );
}